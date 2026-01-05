// Location: frontend_tailwind/js/script.js

// --- CONFIGURATION ---
<<<<<<< HEAD
// [PENTING] Pastikan IP ini sesuai dengan yang muncul di terminal Flask kamu
// Cek lagi ipconfig jika pindah WiFi
const BASE_URL = 'http://192.168.130.200:5000'; 

const UI_TEST_MODE = false; 
=======
const UI_TEST_MODE = false; // Set FALSE agar konek ke Python
const API_BASE_URL = "http://127.0.0.1:5000"; // Alamat Backend Flask kamu
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4

let currentPumpStatus = "OFF"; 

<<<<<<< HEAD
// 1. Navigation Logic
function showPage(pageId, linkRef) {
    // Sembunyikan semua section
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('block', 'fade-in');
=======
// =========================================
// 1. NAVIGATION & TIME LOGIC
// =========================================
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-green-600', 'text-white');
        link.classList.add('text-gray-300');
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
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
<<<<<<< HEAD
        // Format: 05/01/2026 17:00
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        el.innerText = `${dateStr} ${timeStr}`;
=======
        el.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
    }
}
setInterval(updateTime, 1000);
updateTime();


<<<<<<< HEAD
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout

        const response = await fetch(`${BASE_URL}/api/sensors`, {
            signal: controller.signal,
            mode: 'cors'
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

=======
// =========================================
// 2. DATA FETCHING (Koneksi ke Flask)
// =========================================
async function fetchSensorData() {
    if (UI_TEST_MODE) {
        updateUI({
            suhu: (25 + Math.random()).toFixed(1),
            kelembapan_udara: 60,
            kelembapan_tanah: 70,
            cahaya: 500,
            status_pompa: "OFF"
        });
        return;
    }

    try {
        // [UPDATE] Menggunakan Full URL karena Frontend & Backend beda port
        const response = await fetch(`${API_BASE_URL}/api/sensors`);
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
        const result = await response.json();

        if (result.status === "success") {
            updateUI(result.data);
<<<<<<< HEAD
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
=======
        }
    } catch (error) {
        console.error("Gagal connect ke backend:", error);
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
    }
}

function updateUI(data) {
<<<<<<< HEAD
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
=======
    // Mapping data dari Python JSON ke HTML ID
    
    // 1. Suhu
    document.getElementById('val-suhu').innerText = data.suhu || "--";
    
    // 2. Kelembapan Udara
    document.getElementById('val-hum').innerText = data.kelembapan_udara || "--";
    
    // 3. Kelembapan Tanah
    document.getElementById('val-soil').innerText = data.kelembapan_tanah || "--";
    
    // 4. Cahaya (SUDAH REAL-TIME DARI DB/MQTT)
    document.getElementById('val-light').innerText = data.cahaya || "0"; 

    // 5. PH (Masih Dummy karena belum ada di hardware)
    document.getElementById('val-ph').innerText = "7.0";    
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4

    // 6. Update Status Pompa
    updatePumpUI(data.status_pompa);
}

// Update UI Pompa (Visualisasi 2 Tombol & Ikon)
function updatePumpUI(status) {
<<<<<<< HEAD
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
=======
    currentPumpStatus = status; 

    const statusText = document.getElementById('pump-status-text');
    const iconContainer = document.getElementById('pump-icon-container');
    const btnOn = document.getElementById('btn-pump-on');
    const btnOff = document.getElementById('btn-pump-off');
    const statusLabelDashboard = document.getElementById('watering-status'); 

    if (status === "ON") {
        // --- KONDISI MENYALA ---
        if(iconContainer) iconContainer.className = "w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] animate-pulse";
        
        if(statusText) {
            statusText.innerText = "MENYIRAM (ON)";
            statusText.className = "px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide transition-all";
        }

        if(btnOn) {
            btnOn.className = "flex-1 md:flex-none min-w-[120px] py-4 rounded-xl font-bold text-white bg-green-500 shadow-md transform scale-105 border border-green-600 cursor-default";
            btnOn.disabled = true; 
        }
        if(btnOff) {
            btnOff.className = "flex-1 md:flex-none min-w-[120px] py-4 rounded-xl font-bold text-gray-500 bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-gray-200 transition-all cursor-pointer";
            btnOff.disabled = false;
        }

        if(statusLabelDashboard) {
            statusLabelDashboard.innerText = "AKTIF";
            statusLabelDashboard.className = "bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse";
        }

    } else {
        // --- KONDISI MATI (OFF) ---
        if(iconContainer) iconContainer.className = "w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl transition-all duration-300 shadow-inner";

        if(statusText) {
            statusText.innerText = "STANDBY (OFF)";
            statusText.className = "px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-500 uppercase tracking-wide transition-all";
        }

        if(btnOff) {
            btnOff.className = "flex-1 md:flex-none min-w-[120px] py-4 rounded-xl font-bold text-white bg-gray-600 shadow-md border border-gray-700 cursor-default";
            btnOff.disabled = true; 
        }
        if(btnOn) {
            btnOn.className = "flex-1 md:flex-none min-w-[120px] py-4 rounded-xl font-bold text-gray-500 bg-white hover:bg-green-50 hover:text-green-500 hover:border-green-200 border border-gray-200 transition-all cursor-pointer";
            btnOn.disabled = false;
        }

        if(statusLabelDashboard) {
            statusLabelDashboard.innerText = "Standby";
            statusLabelDashboard.className = "bg-white px-4 py-1 rounded-full text-green-600 text-sm font-semibold shadow-sm border border-green-200";
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
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

<<<<<<< HEAD
async function toggleWatering() {
    const actionToSend = (currentPumpStatus === "ON") ? "OFF" : "ON";
    const buttons = document.querySelectorAll('.btn-pompa');

    try {
        // Efek loading pada tombol
        buttons.forEach(btn => btn.classList.add('opacity-50', 'cursor-not-allowed'));
        
        // Kirim request ke Backend Flask
        // Backend akan meneruskan ke MQTT topic 'greenhouse/control/pump'
        const response = await fetch(`${BASE_URL}/api/control`, {
=======
// Polling Data (Setiap 2 detik)
setInterval(fetchSensorData, 2000);
fetchSensorData(); 


// =========================================
// 3. CONTROLLING (Kirim Perintah ke Flask)
// =========================================
async function sendPumpCommand(action) {
    const btnClicked = action === 'ON' ? document.getElementById('btn-pump-on') : document.getElementById('btn-pump-off');
    const originalText = btnClicked.innerHTML;
    
    // Visual Feedback Loading
    btnClicked.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        // [UPDATE] Menggunakan Full URL ke Backend
        const response = await fetch(`${API_BASE_URL}/api/control`, {
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                component: 'pompa',
                action: action
            })
        });

        const result = await response.json();
        
        if(result.status === "success") {
<<<<<<< HEAD
            // Update UI langsung biar responsif
            updatePumpUI(actionToSend);
=======
            console.log("Sukses:", result.message);
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
        } else {
            alert("Gagal: " + result.message);
        }

    } catch (error) {
<<<<<<< HEAD
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
=======
        console.error("Error:", error);
        alert("Gagal terhubung ke server. Pastikan app.py berjalan.");
    } finally {
        setTimeout(() => {
             btnClicked.innerHTML = originalText;
        }, 500);
    }
}


// =========================================
// 4. FEATURE: REAL-TIME CALENDAR
// =========================================
function renderCalendar() {
    const monthYearEl = document.getElementById('cal-month-year');
    const daysEl = document.getElementById('cal-days');
    
    if (!monthYearEl || !daysEl) return;

    const date = new Date();
    const currYear = date.getFullYear();
    const currMonth = date.getMonth(); 
    
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    monthYearEl.innerText = `${months[currMonth]} ${currYear}`;
    
    const firstDay = new Date(currYear, currMonth, 1).getDay(); 
    const lastDate = new Date(currYear, currMonth + 1, 0).getDate();
    const lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    
    let liTag = "";

    for (let i = firstDay; i > 0; i--) {
        liTag += `<div class="py-2 text-gray-300 bg-gray-50 rounded-lg cursor-default">${lastDateofLastMonth - i + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
        let isToday = i === date.getDate() ? "bg-green-500 text-white shadow-md transform scale-105 font-bold" : "hover:bg-green-50 text-gray-700 cursor-pointer transition";
        liTag += `<div class="py-2 rounded-lg ${isToday}">${i}</div>`;
    }

    daysEl.innerHTML = liTag;
}


// =========================================
// 5. FEATURE: ANALYTICS DATE FILTER
// =========================================
function filterAnalytics() {
    const dateInput = document.getElementById('analytics-date').value;
    if(!dateInput) return;

    // Simulasi ganti data (Acak)
    updateChartWithRandomData('chart-cahaya');
    updateChartWithRandomData('chart-kelembapan');
    updateChartWithRandomData('chart-suhu');
    updateChartWithRandomData('chart-ph');
}

function updateChartWithRandomData(chartId) {
    const chartInstance = Chart.getChart(chartId);
    if (chartInstance) {
        const newData = Array.from({length: 6}, () => Math.floor(Math.random() * 50) + 20);
        chartInstance.data.datasets[0].data = newData;
        chartInstance.update();
    }
}


// =========================================
// 6. INITIALIZATION (On Load)
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // A. Init Calendar
    renderCalendar();

    // B. Init Charts
    const commonOptions = { 
        responsive: true, maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: true } }
    };

    // Chart Initialization
    const ctxCahaya = document.getElementById('chart-cahaya');
    if(ctxCahaya) new Chart(ctxCahaya, { type: 'line', data: { labels: [1,2,3,4,5,6], datasets: [{ data: [300, 450, 600, 800, 500, 400], borderColor: '#fbbf24', fill: true, backgroundColor: 'rgba(251, 191, 36, 0.1)' }] }, options: commonOptions });

    const ctxHum = document.getElementById('chart-kelembapan');
    if(ctxHum) new Chart(ctxHum, { type: 'line', data: { labels: [1,2,3,4,5,6], datasets: [{ data: [60, 58, 55, 50, 52, 55], borderColor: '#2dd4bf', fill: true, backgroundColor: 'rgba(45, 212, 191, 0.1)' }] }, options: commonOptions });

    const ctxSuhu = document.getElementById('chart-suhu');
    if(ctxSuhu) new Chart(ctxSuhu, { type: 'line', data: { labels: [1,2,3,4,5,6], datasets: [{ data: [24, 25, 27, 29, 28, 26], borderColor: '#ef4444', fill: true, backgroundColor: 'rgba(239, 68, 68, 0.1)' }] }, options: commonOptions });

    const ctxPh = document.getElementById('chart-ph');
    if(ctxPh) new Chart(ctxPh, { type: 'line', data: { labels: [1,2,3,4,5,6], datasets: [{ data: [6.8, 6.7, 6.8, 6.9, 6.7, 6.8], borderColor: '#a855f7', fill: true, backgroundColor: 'rgba(168, 85, 247, 0.1)' }] }, options: commonOptions });

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
>>>>>>> f7cbe055cb972a69fa36e81c6eca659581c9a6d4
});