import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Variabel Global untuk menyimpan data sensor terakhir (In-Memory)
latest_sensor_data = {
    "suhu": 0,
    "kelembapan_udara": 0,
    "kelembapan_tanah": 0,
    "status_pompa": "OFF"
}

# Konfigurasi MQTT (Default values jika .env kosong)
BROKER = os.getenv('MQTT_BROKER', 'broker.hivemq.com')
PORT = int(os.getenv('MQTT_PORT', 1883))
TOPIC_SENSOR = os.getenv('MQTT_TOPIC_SENSOR', 'project_c2/greenhouse/data')
TOPIC_CONTROL = os.getenv('MQTT_TOPIC_CONTROL', 'project_c2/greenhouse/control')

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    """Callback ketika berhasil connect ke Broker"""
    if rc == 0:
        print(f"[MQTT] Terhubung ke Broker {BROKER}!")
        client.subscribe(TOPIC_SENSOR)
        print(f"[MQTT] Subscribe ke topik: {TOPIC_SENSOR}")
    else:
        print(f"[MQTT] Gagal connect. Kode: {rc}")

def on_message(client, userdata, msg):
    """Callback ketika ada pesan masuk dari ESP32"""
    global latest_sensor_data
    try:
        payload = msg.payload.decode('utf-8')
        # print(f"[MQTT] Pesan Masuk: {payload}")
        
        data = json.loads(payload)
        
        # Update data global
        latest_sensor_data.update(data)
        
    except json.JSONDecodeError:
        print("[MQTT] Error: Format data bukan JSON valid")
    except Exception as e:
        print(f"[MQTT] Error processing message: {e}")

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
    # Format JSON: {"target": "pompa", "action": "ON"}
    payload = json.dumps({"target": component, "action": action})
    client.publish(TOPIC_CONTROL, payload)
    print(f"[MQTT] Publish Control: {payload} ke {TOPIC_CONTROL}")