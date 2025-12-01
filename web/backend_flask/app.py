from flask import Flask, jsonify, request
from flask_cors import CORS
from mqtt_handler import start_mqtt, latest_sensor_data, publish_control

app = Flask(__name__)
CORS(app)   # Akses API web dan mobile

@app.route('/')
def home():
    return jsonify({
        "status": "Server Flask Aktif",
        "tim": "Kelompok C2 - IoT Smart Home"
    })

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
    
    # host
    app.run(debug=True, host='0.0.0.0', port=5000)