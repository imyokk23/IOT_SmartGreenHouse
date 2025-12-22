// Location: frontend_tailwind/js/script.js

// --- CONFIGURATION ---
// Set ke FALSE agar mengambil data dari Flask/MQTT
const UI_TEST_MODE = false; 

let currentPumpStatus = "OFF"; 

// 1. Navigation Logic
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-green-600', 'text-white');
        link.classList.add('text-gray-300');
    });
    const activeSection = document.getElementById(pageId);
    if(activeSection) activeSection.classList.remove('hidden');
}

function updateTime() {
    const now = new Date();
    document.getElementById('current-datetime').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// 2. DATA FETCHING (Koneksi ke Flask)
async function fetchSensorData() {
    if (UI_TEST_MODE) {
        // Mock data jika Backend mati
        updateUI({
            suhu: (25 + Math.random()).toFixed(1),
            kelembapan_udara: 60,
            kelembapan_tanah: 70,
            status_pompa: "OFF"
        });
        return;
    }

    try {
        // Request ke app.py @app.route('/api/sensors')
        const response = await fetch('/api/sensors');
        const result = await response.json();

        if (result.status === "success") {
            updateUI(result.data);
        }
    } catch (error) {
        console.error("Gagal connect ke backend:", error);
    }
}

function updateUI(data) {
    // Mapping data dari Python JSON ke HTML ID
    
    // Suhu
    document.getElementById('val-suhu').innerText = data.suhu || "--";
    
    // Kelembapan Udara
    document.getElementById('val-hum').innerText = data.kelembapan_udara || "--";
    
    // Kelembapan Tanah (Moisture)
    document.getElementById('val-soil').innerText = data.kelembapan_tanah || "--";
    
    // *Catatan: Data Cahaya & PH belum ada di Python, kita set default/dummy
    document.getElementById('val-light').innerText = "450"; // Dummy
    document.getElementById('val-ph').innerText = "7.0";    // Dummy

    // Update Status Pompa
    updatePumpUI(data.status_pompa);
}

function updatePumpUI(status) {
    currentPumpStatus = status; // Simpan status global
    
    const statusEl = document.getElementById('watering-status');
    const btn = document.getElementById('btn-manual-water');
    const btnText = btn.querySelector('span');

    if(status === "ON") {
        // Tampilan saat ON
        statusEl.innerText = "SEDANG MENYIRAM...";
        statusEl.className = "bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-md";
        
        btnText.innerText = "MATIKAN PENYIRAMAN (STOP)";
        btn.classList.remove('from-cyan-400', 'to-blue-500');
        btn.classList.add('from-red-400', 'to-red-600');
    } else {
        // Tampilan saat OFF / Standby
        statusEl.innerText = "Standby";
        statusEl.className = "bg-white px-4 py-1 rounded-full text-green-600 text-sm font-semibold shadow-sm border border-green-200";

        btnText.innerText = "MULAI PENYIRAMAN MANUAL";
        btn.classList.remove('from-red-400', 'to-red-600');
        btn.classList.add('from-cyan-400', 'to-blue-500');
    }
}

// Update data tiap 2 detik
setInterval(fetchSensorData, 2000);
fetchSensorData(); 


// 3. CONTROLLING (Kirim Perintah ke Flask)
async function toggleWatering() {
    const btn = document.getElementById('btn-manual-water');
    
    // Logic Toggle: Jika sekarang ON -> kirim OFF, sebaliknya.
    const actionToSend = (currentPumpStatus === "ON") ? "OFF" : "ON";

    try {
        btn.classList.add('opacity-50', 'cursor-not-allowed'); // Efek loading

        // Request POST ke app.py @app.route('/api/control')
        const response = await fetch('/api/control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                component: 'pompa',
                action: actionToSend
            })
        });

        const result = await response.json();
        
        if(result.status === "success") {
            console.log("Perintah berhasil:", result.message);
            // UI akan update otomatis saat fetchSensorData() berjalan berikutnya
        } else {
            alert("Gagal: " + result.message);
        }

    } catch (error) {
        console.error("Error sending control:", error);
        alert("Gagal menghubungi server.");
    } finally {
        setTimeout(() => {
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }, 500);
    }
}

// 4. CHART INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    const commonOptions = { 
        responsive: true, maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: true } }
    };

    // Chart Dummy (Visualisasi)
    // 1. Cahaya
    const ctxCahaya = document.getElementById('chart-cahaya');
    if(ctxCahaya) new Chart(ctxCahaya, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [300, 450, 600, 800, 500], borderColor: '#fbbf24', fill: true, backgroundColor: 'rgba(251, 191, 36, 0.1)' }] }, options: commonOptions });

    // 2. Kelembapan
    const ctxHum = document.getElementById('chart-kelembapan');
    if(ctxHum) new Chart(ctxHum, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [60, 58, 55, 50, 52], borderColor: '#2dd4bf', fill: true, backgroundColor: 'rgba(45, 212, 191, 0.1)' }] }, options: commonOptions });

    // 3. Suhu
    const ctxSuhu = document.getElementById('chart-suhu');
    if(ctxSuhu) new Chart(ctxSuhu, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [24, 25, 27, 29, 28], borderColor: '#ef4444', fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)' }] }, options: commonOptions });

    // 4. PH
    const ctxPh = document.getElementById('chart-ph');
    if(ctxPh) new Chart(ctxPh, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [6.8, 6.7, 6.8, 6.9, 6.7], borderColor: '#a855f7', fill: true, backgroundColor: 'rgba(168, 85, 247, 0.1)' }] }, options: commonOptions });

    // 5. Productivity (Harvest)
    const ctxProd = document.getElementById('chart-productivity');
    if(ctxProd) {
        new Chart(ctxProd, {
            type: 'bar',
            data: {
                labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
                datasets: [{ label: 'Total Panen (Kg)', data: [120, 150, 180, 128], backgroundColor: ['rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.5)', '#10b981'], borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});