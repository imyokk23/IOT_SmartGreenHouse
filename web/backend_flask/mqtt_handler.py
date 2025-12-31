import paho.mqtt.client as mqtt
import json
import uuid
import time
import sys

# --- KONFIGURASI BROKER ---
BROKER = 'broker.emqx.io'
PORT = 1883

# Topik
TOPIC_SENSOR = 'greenhouse/data'
TOPIC_CONTROL = 'greenhouse/control/pump'

# Generate Client ID Unik
CLIENT_ID = f"Flask_{uuid.uuid4()}"

# Inisialisasi Client
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)

# Variabel Global untuk Callback
callback_to_app = None 

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"\n✅ [MQTT] TERHUBUNG! Broker: {BROKER}")
        print(f"   [MQTT] Subscribe ke: {TOPIC_SENSOR}")
        client.subscribe(TOPIC_SENSOR)
    else:
        print(f"\n❌ [MQTT] GAGAL CONNECT. Kode: {reason_code}")

def on_disconnect(client, userdata, disconnect_flags, reason_code, properties):
    print(f"\n⚠️ [MQTT] TERPUTUS! Kode: {reason_code}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode('utf-8')
        # Print data mentah dari MQTT
        print(f"📩 [MQTT RAW] {payload}")
        
        data = json.loads(payload)
        
        # DEBUG: Cek status callback
        global callback_to_app
        if callback_to_app:
            # Panggil fungsi di app.py
            print("   [MQTT] Mengirim data ke app.py...")
            callback_to_app(data)
        else:
            print("❌ [MQTT ERROR] Callback ke app.py BELUM TERHUBUNG (None)!")
            
    except Exception as e:
        print(f"   [MQTT ERROR] {e}")

def start_mqtt(on_message_callback):
    global callback_to_app
    # Simpan fungsi dari app.py ke variabel global
    callback_to_app = on_message_callback 
    
    print(f"   [MQTT] Callback app.py berhasil didaftarkan: {on_message_callback}")
    
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    
    try:
        # Validasi
        if not BROKER or BROKER == "...":
            raise ValueError("Nama Broker MQTT belum diisi dengan benar!")

        print(f"\n⏳ [MQTT] Menghubungkan ke {BROKER} (Port {PORT})...")
        client.connect(BROKER, PORT, 60)
        client.loop_start()
    except Exception as e:
        print(f"❌ [MQTT FATAL] Gagal start: {e}")

def publish_control(component, action):
    try:
        payload = action
        client.publish(TOPIC_CONTROL, payload)
        print(f"📤 [MQTT KELUAR] {TOPIC_CONTROL} -> {payload}")
    except Exception as e:
        print(f"❌ [MQTT ERROR] Gagal publish: {e}")