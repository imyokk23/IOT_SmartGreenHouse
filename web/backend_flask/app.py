import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from mqtt_handler import start_mqtt, latest_sensor_data, publish_control

# --- KONFIGURASI PATH FOLDER FRONTEND ---
# Karena folder frontend ada di luar folder backend, kita harus set path absolut
base_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(base_dir, '../frontend_tailwind') # Sesuaikan nama folder
static_dir = os.path.join(base_dir, '../frontend_tailwind')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
CORS(app)   # Akses API web dan mobile

# --- ROUTE HALAMAN WEB ---
@app.route('/')
def home():
    # Ini akan mencari index.html di folder ../frontend_web
    return render_template('index.html')

# --- API ENDPOINTS ---

# GET: Ambil data sensor terbaru
@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    return jsonify({
        "status": "success",
        "data": latest_sensor_data
    })

# POST: Kirim perintah kontrol ke MQTT
@app.route('/api/control', methods=['POST'])
def control_device():
    try:
        req = request.get_json()
        component = req.get('component')
        action = req.get('action')
        
        if not component or not action:
            return jsonify({"status": "error", "message": "Data tidak lengkap"}), 400
        
        publish_control(component, action)
        return jsonify({
            "status": "success",
            "message": f"Perintah {action} dikirim ke {component}"
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("Menyalakan MQTT Service...")
    start_mqtt()
    
    # host='0.0.0.0' agar bisa diakses dari HP/Laptop lain di jaringan yang sama
    app.run(debug=True, host='0.0.0.0', port=5000)