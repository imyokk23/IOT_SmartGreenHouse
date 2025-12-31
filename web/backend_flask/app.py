from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import pymysql

# --- SETUP SERVER ---
app = Flask(__name__)

# [PERBAIKAN] Buka Akses CORS Seluas-luasnya (Allow All)
# Ini mencegah error "Access-Control-Allow-Origin" di browser
CORS(app, resources={r"/*": {"origins": "*"}})

# --- SETUP DATABASE (MySQL) ---
user = 'root'
password = ''
host = 'localhost'
db_name = 'db_smarthome_ff' 

# Gunakan pymysql sebagai driver
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODEL DATABASE ---
class SensorLog(db.Model):
    __tablename__ = 'sensor_logs'
    id = db.Column(db.Integer, primary_key=True)
    suhu = db.Column(db.Float)
    kelembapan_udara = db.Column(db.Float)
    kelembapan_tanah = db.Column(db.Float)
    cahaya = db.Column(db.Float)
    status_pompa = db.Column(db.String(10))
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "suhu": self.suhu,
            "kelembapan_udara": self.kelembapan_udara,
            "kelembapan_tanah": self.kelembapan_tanah,
            "cahaya": self.cahaya,
            "status_pompa": self.status_pompa,
            "waktu": self.timestamp.strftime("%d %b %H:%M") 
        }

# Buat tabel otomatis saat server nyala
with app.app_context():
    try:
        db.create_all()
        print("✅ [DB] Tabel Database Siap!")
    except Exception as e:
        print(f"❌ [DB ERROR] Gagal buat tabel: {e}")
        print("   -> Pastikan Database 'db_smarthome' sudah dibuat di phpMyAdmin!")

# --- IMPORT MQTT ---
from mqtt_handler import start_mqtt, publish_control

# --- VARIABEL MEMORI (REALTIME) ---
latest_data = {
    "suhu": 0, "kelembapan_udara": 0, "kelembapan_tanah": 0, "cahaya": 0, "status_pompa": "OFF"
}

# --- ENDPOINTS ---
@app.route('/')
def home():
    return jsonify({"message": "Server Ready", "tim": "C2"})

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    return jsonify({"status": "success", "data": latest_data})

@app.route('/api/control', methods=['POST'])
def control_device():
    try:
        data = request.json
        component = data.get('component')
        action = data.get('action')
        
        if component and action:
            publish_control(component, action)
            if component == 'pompa': latest_data["status_pompa"] = action
            return jsonify({"status": "success", "message": f"{component} {action}"})
        return jsonify({"status": "error", "message": "Invalid data"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- CALLBACK MQTT ---
def update_sensor_data(data_baru):
    global latest_data
    print(f"[DATA MASUK DARI ESP] {data_baru}")
    
    # 1. Update RAM (Agar Web langsung berubah)
    if 'temperature' in data_baru: latest_data['suhu'] = data_baru['temperature']
    if 'humidity' in data_baru: latest_data['kelembapan_udara'] = data_baru['humidity']
    if 'soil' in data_baru: latest_data['kelembapan_tanah'] = data_baru['soil']
    if 'lux' in data_baru: latest_data['cahaya'] = data_baru['lux']
    if 'pump' in data_baru: latest_data['status_pompa'] = data_baru['pump']

    # 2. Simpan ke Database
    try:
        with app.app_context():
            log = SensorLog(
                suhu=float(latest_data.get('suhu', 0)),
                kelembapan_udara=float(latest_data.get('kelembapan_udara', 0)),
                kelembapan_tanah=float(latest_data.get('kelembapan_tanah', 0)),
                cahaya=float(latest_data.get('cahaya', 0)),
                status_pompa=str(latest_data.get('status_pompa', 'OFF'))
            )
            db.session.add(log)
            db.session.commit()
    except Exception as e:
        # Kita print error tapi JANGAN bikin program crash
        print(f"[DB ERROR] Gagal simpan: {e}")

# --- MAIN ---
if __name__ == '__main__':
    start_mqtt(on_message_callback=update_sensor_data)
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)