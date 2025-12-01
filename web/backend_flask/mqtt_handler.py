import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Variabel Global untuk menyimpan data sensor terakhir (In-Memory)
# Nanti bisa diganti simpan ke Database jika perlu history panjang
latest_sensor_data = {
    "suhu": 0,
    "kelembapan_udara": 0,
    "kelembapan_tanah": 0,
    "status_pompa": "OFF"
}

# Konfigurasi MQTT
BROKER = os.getenv('MQTT_BROKER', 'broker.hivemq.com')
PORT = int(os.getenv('MQTT_PORT', 1883))
TOPIC_SENSOR = os.getenv('MQTT_TOPIC_SENSOR', 'project_c2/greenhouse/data')
TOPIC_CONTROL = os.getenv('MQTT_TOPIC_CONTROL', 'project_c2/greenhouse/control')

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    """Callback ketika berhasil connect ke Broker"""
    if rc == 0:
        print(f"[MQTT] Terhubung ke Broker {BROKER}!")
        # Subscribe ke topik sensor
        client.subscribe(TOPIC_SENSOR)
        print(f"[MQTT] Subscribe ke topik: {TOPIC_SENSOR}")
    else:
        print(f"[MQTT] Gagal connect. Kode: {rc}")

def on_message(client, userdata, msg):
    """Callback ketika ada pesan masuk dari ESP32"""
    global latest_sensor_data
    try:
        # Decode pesan dari bytes ke string, lalu ke JSON
        payload = msg.payload.decode('utf-8')
        print(f"[MQTT] Pesan Masuk: {payload}")
        
        # Asumsi data dari ESP32 formatnya JSON: {"suhu": 25, "kelembapan": 60 ...}
        data = json.loads(payload)
        
        # Update data global
        latest_sensor_data.update(data)
        
        # OPSI TAMBAHAN: Simpan ke file JSON logs (Sesuai folder kamu)
        save_to_log(latest_sensor_data)
        
    except json.JSONDecodeError:
        print("[MQTT] Error: Format data bukan JSON valid")
    except Exception as e:
        print(f"[MQTT] Error processing message: {e}")

def save_to_log(data):
    """Simpan log data ke file json local (opsional)"""
    log_path = os.path.join(os.path.dirname(__file__), 'data_output', 'json_logs', 'sensor_log.json')
    try:
        # Pastikan folder ada
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Gagal simpan log: {e}")

def start_mqtt():
    """Fungsi untuk menjalankan MQTT di background"""
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_start() # Jalan di background thread
    except Exception as e:
        print(f"[MQTT] Koneksi Gagal: {e}")

def publish_control(component, action):
    """Fungsi untuk mengirim perintah ke ESP32"""
    # Payload misal: {"target": "pompa", "action": "ON"}
    payload = json.dumps({"target": component, "action": action})
    client.publish(TOPIC_CONTROL, payload)
    print(f"[MQTT] Publish Control: {payload} ke {TOPIC_CONTROL}")