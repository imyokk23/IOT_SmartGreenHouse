// Location: frontend_tailwind/js/script.js

// --- CONFIGURATION ---
// [PENTING] Cek ipconfig lagi! Jangan sampai salah satu angka pun.
const BASE_URL = 'http://192.168.98.200:5000'; 

const UI_TEST_MODE = false; 

let currentPumpStatus = "OFF"; 
let failureCount = 0; 

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
    const el = document.getElementById('current-datetime');
    if(el) el.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// 2. DATA FETCHING
async function fetchSensorData() {
    if (UI_TEST_MODE) return;

    const targetUrl = `${BASE_URL}/api/sensors`;

    try {
        // Timeout diperpanjang jadi 15 detik untuk diagnosa
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // console.log(`[DEBUG] Mencoba connect ke: ${targetUrl}`); // Uncomment kalau mau liat spam log

        const response = await fetch(targetUrl, {
            signal: controller.signal,
            mode: 'cors',
            method: 'GET'
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === "success") {
            failureCount = 0; 
            updateUI(result.data);
            setSystemStatus(true, "System Connected");
        } else {
            console.warn("Format data salah:", result);
        }

    } catch (error) {
        failureCount++;
        let errorMsg = "Disconnected";

        if (error.name === 'AbortError') {
            console.error(`[TIMEOUT] Gagal menghubungi ${targetUrl} dalam 15 detik.`);
            errorMsg = "Koneksi Timeout (Cek Firewall/IP)";
        } else if (error.message.includes("Failed to fetch")) {
            console.error(`[NETWORK ERROR] Gagal menghubungi ${targetUrl}. Server mati atau IP salah.`);
            errorMsg = "Server Tidak Ditemukan";
        } else {
            console.error("[ERROR LAIN]", error);
        }

        if (failureCount >= 3) {
            setSystemStatus(false, errorMsg);
        }
    }
}

// Fungsi Status Visual
function setSystemStatus(isOnline, message) {
    const statusBadge = document.getElementById('server-status');
    // Fallback cari elemen badge manual jika ID tidak ketemu
    const backupBadge = document.querySelector('.text-green-600.bg-green-100') || document.querySelector('.text-red-600.bg-red-100');
    
    const target = statusBadge || backupBadge;

    if (!target) return;

    if (isOnline) {
        target.innerText = `● ${message}`;
        target.className = "text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full animate-pulse shadow-sm font-bold";
    } else {
        target.innerText = `● ${message}`;
        target.className = "text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse shadow-sm font-bold";
    }
}

function updateUI(data) {
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerText = (val !== null && val !== undefined) ? val : "--";
    };

    setText('val-suhu', data.suhu);
    setText('val-hum', data.kelembapan_udara);
    setText('val-soil', data.kelembapan_tanah);
    setText('val-light', data.cahaya);
    setText('val-ph', "7.0");

    updatePumpUI(data.status_pompa);
}

function updatePumpUI(status) {
    const statusEl = document.getElementById('watering-status');
    const btn = document.getElementById('btn-manual-water');
    if (!statusEl || !btn) return;

    currentPumpStatus = status; 
    const btnText = btn.querySelector('span');

    if(status === "ON") {
        statusEl.innerText = "SEDANG MENYIRAM...";
        statusEl.className = "bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-md";
        if(btnText) btnText.innerText = "MATIKAN PENYIRAMAN (STOP)";
        btn.className = "w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-6 rounded-xl shadow-lg transition transform active:scale-95";
    } else {
        statusEl.innerText = "Standby";
        statusEl.className = "bg-white px-4 py-1 rounded-full text-green-600 text-sm font-semibold shadow-sm border border-green-200";
        if(btnText) btnText.innerText = "MULAI PENYIRAMAN MANUAL";
        btn.className = "w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-6 rounded-xl shadow-lg transition transform active:scale-95";
    }
}

async function toggleWatering() {
    const btn = document.getElementById('btn-manual-water');
    const actionToSend = (currentPumpStatus === "ON") ? "OFF" : "ON";

    try {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        const response = await fetch(`${BASE_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ component: 'pompa', action: actionToSend })
        });
        const result = await response.json();
        if(result.status === "success") {
            updatePumpUI(actionToSend);
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Gagal menghubungi server: " + error.message);
    } finally {
        setTimeout(() => btn.classList.remove('opacity-50', 'cursor-not-allowed'), 500);
    }
}

setInterval(fetchSensorData, 3000);
fetchSensorData(); 

document.addEventListener('DOMContentLoaded', function() { 
    // Chart initialization
    const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: true } } };
    const ctxSuhu = document.getElementById('chart-suhu');
    if(ctxSuhu) new Chart(ctxSuhu, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [24, 25, 27, 29, 28], borderColor: '#ef4444', fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)' }] }, options: commonOptions });
    // ... sisa chart biarkan saja ...
});