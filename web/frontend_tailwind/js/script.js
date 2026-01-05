// Location: frontend_tailwind/js/script.js

// --- CONFIGURATION ---
// [PENTING] Pastikan IP ini sesuai dengan yang muncul di terminal Flask kamu
// Cek lagi ipconfig jika pindah WiFi
const BASE_URL = 'http://192.168.130.200:5000'; 

const UI_TEST_MODE = false; 

let currentPumpStatus = "OFF"; 
let failureCount = 0; 

// 1. Navigation Logic
function showPage(pageId, linkRef) {
    // Sembunyikan semua section
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('block', 'fade-in');
    });
    
    // Reset style semua link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-green-600', 'text-white', 'active');
        link.classList.add('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
    });

    // Tampilkan section yang dipilih
    const activeSection = document.getElementById(pageId);
    if(activeSection) {
        activeSection.classList.remove('hidden');
        activeSection.classList.add('block', 'fade-in');
    }

    // Highlight menu yang aktif
    if(linkRef) {
        linkRef.classList.remove('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
        linkRef.classList.add('bg-green-600', 'text-white', 'active');
    }
}

function updateTime() {
    const now = new Date();
    const el = document.getElementById('current-datetime');
    if(el) {
        // Format: 05/01/2026 17:00
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        el.innerText = `${dateStr} ${timeStr}`;
    }
}
setInterval(updateTime, 1000);
updateTime();

// 2. DATA FETCHING
async function fetchSensorData() {
    if (UI_TEST_MODE) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

        const response = await fetch(`${BASE_URL}/api/sensors`, {
            signal: controller.signal,
            mode: 'cors'
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const result = await response.json();

        if (result.status === "success") {
            failureCount = 0; 
            updateUI(result.data);
            setSystemStatus(true);
        }
    } catch (error) {
        console.warn("Fetch Error:", error);
        failureCount++;
        // Ubah status jadi merah hanya jika gagal 3x berturut-turut (biar gak kedip)
        if (failureCount >= 3) setSystemStatus(false);
    }
}

function setSystemStatus(isOnline) {
    const statusBadge = document.getElementById('server-status');
    if (!statusBadge) return;

    if (isOnline) {
        statusBadge.innerHTML = '<span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> ONLINE';
        statusBadge.className = "text-xs text-center text-green-400 font-bold bg-gray-800 py-2 rounded-lg border border-green-900";
    } else {
        statusBadge.innerHTML = '<span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span> OFFLINE';
        statusBadge.className = "text-xs text-center text-red-500 font-bold bg-gray-800 py-2 rounded-lg border border-red-900";
    }
}

function updateUI(data) {
    const setText = (id, val) => {
        const el = document.getElementById(id);
        // Tampilkan "--" jika data null atau undefined
        if(el) el.innerText = (val !== null && val !== undefined) ? val : "--";
    };

    setText('val-suhu', data.suhu);
    setText('val-hum', data.kelembapan_udara);
    setText('val-soil', data.kelembapan_tanah);
    setText('val-light', data.cahaya);
    
    // [BERSIH] Bagian PH sudah dihapus karena tidak ada di HTML

    updatePumpUI(data.status_pompa);
}

function updatePumpUI(status) {
    const safeStatus = (status || "OFF").toUpperCase();
    currentPumpStatus = safeStatus; 
    
    const statusEl = document.getElementById('watering-status');
    const buttons = document.querySelectorAll('.btn-pompa'); // Mengambil semua tombol pompa (sidebar & dashboard)

    // Update Label Status Teks
    if(statusEl) {
        if(safeStatus === "ON") {
            statusEl.innerText = "MENYIRAM (ON)";
            statusEl.className = "font-bold text-green-600 animate-pulse";
        } else {
            statusEl.innerText = "MATI (OFF)";
            statusEl.className = "font-bold text-gray-400";
        }
    }

    // Update Tampilan Tombol
    buttons.forEach(btn => {
        const textSpan = btn.querySelector('.btn-text');
        const icon = btn.querySelector('i');

        // Reset class dasar
        btn.className = "btn-pompa w-full py-4 rounded-xl font-bold shadow-lg transition active:scale-95 flex items-center justify-center gap-2 text-white";

        if (safeStatus === "ON") {
            // Mode ON -> Tombol jadi Merah (Matikan)
            btn.classList.add("bg-red-500", "hover:bg-red-600");
            if(textSpan) textSpan.innerText = "MATIKAN POMPA";
            if(icon) icon.className = "fas fa-stop-circle";
        } else {
            // Mode OFF -> Tombol jadi Biru (Nyalakan)
            btn.classList.add("bg-blue-500", "hover:bg-blue-600");
            if(textSpan) textSpan.innerText = "NYALAKAN POMPA";
            if(icon) icon.className = "fas fa-power-off";
        }
    });
}

async function toggleWatering() {
    const actionToSend = (currentPumpStatus === "ON") ? "OFF" : "ON";
    const buttons = document.querySelectorAll('.btn-pompa');

    try {
        // Efek loading pada tombol
        buttons.forEach(btn => btn.classList.add('opacity-50', 'cursor-not-allowed'));
        
        // Kirim request ke Backend Flask
        // Backend akan meneruskan ke MQTT topic 'greenhouse/control/pump'
        const response = await fetch(`${BASE_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ component: 'pompa', action: actionToSend })
        });

        const result = await response.json();
        
        if(result.status === "success") {
            // Update UI langsung biar responsif
            updatePumpUI(actionToSend);
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        console.error("Control Error:", error);
        alert("Gagal menghubungi server. Cek koneksi Flask.");
    } finally {
        // Hapus efek loading
        buttons.forEach(btn => btn.classList.remove('opacity-50', 'cursor-not-allowed'));
    }
}

// Fungsi tambahan untuk Kamera (Refresh / Fullscreen)
function refreshCamera() {
    const img = document.getElementById('cctv-feed');
    if(img) {
        const src = img.src;
        img.src = '';
        setTimeout(() => img.src = src, 100); // Reload image source
        
        // Sembunyikan error message jika ada
        const errorDiv = document.getElementById('cctv-error');
        if(errorDiv) errorDiv.classList.add('hidden');
    }
}

function handleCameraError() {
    const img = document.getElementById('cctv-feed');
    const errorDiv = document.getElementById('cctv-error');
    if(img) img.style.display = 'none';
    if(errorDiv) errorDiv.classList.remove('hidden');
    if(errorDiv) errorDiv.classList.add('flex');
}

// Update data tiap 3 detik
setInterval(fetchSensorData, 3000);
fetchSensorData(); 

// Chart Initialization
document.addEventListener('DOMContentLoaded', function() { 
    const commonOptions = { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } }, 
        scales: { x: { display: false }, y: { display: true } } 
    };
    
    const ctxSuhu = document.getElementById('chart-suhu');
    if(ctxSuhu) new Chart(ctxSuhu, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [0,0,0,0,0], borderColor: '#3b82f6', tension: 0.4 }] }, options: commonOptions });
    
    const ctxHum = document.getElementById('chart-kelembapan');
    if(ctxHum) new Chart(ctxHum, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [0,0,0,0,0], borderColor: '#14b8a6', tension: 0.4 }] }, options: commonOptions });
    
    const ctxCahaya = document.getElementById('chart-cahaya');
    if(ctxCahaya) new Chart(ctxCahaya, { type: 'line', data: { labels: [1,2,3,4,5], datasets: [{ data: [0,0,0,0,0], borderColor: '#eab308', tension: 0.4 }] }, options: commonOptions });
});