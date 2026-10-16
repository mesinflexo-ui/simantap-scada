// LOGIN AUTHENTICATION
function handleLogin(event) {
    event.preventDefault();
    const role = document.getElementById('auth-role').value;
    const password = document.getElementById('auth-key').value;

    if (password === "12345") {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('app-wrapper').classList.remove('hidden');
        document.getElementById('user-role-display').innerText = `ROLE: ${role}`;
        
        fetchLiveSpreadsheetData();
        updateMonitoringCategory();
        updateMachineCategory();
    } else {
        alert("Invalid Password! Please enter 12345");
    }
}

function handleLogout() {
    document.getElementById('app-wrapper').classList.add('hidden');
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('auth-key').value = '';
}

// TAB NAVIGATION SWITCHING
function switchTab(tabId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => link.classList.remove('active'));

    document.getElementById(`page-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// OVERVIEW SLIDER LOGIC
let currentSlideIndex = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.overview-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (index >= slides.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active-slide'));
    dots.forEach(dot => dot.classList.remove('active-dot'));

    slides[currentSlideIndex].classList.add('active-slide');
    dots[currentSlideIndex].classList.add('active-dot');
}

function moveSlide(step) {
    currentSlideIndex += step;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
}

setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % 6;
    showSlide(currentSlideIndex);
}, 6000);

// UPDATE MONITORING SYSTEM CATEGORY
async function updateMonitoringCategory() {
    const selectedCategory = document.getElementById('monitoring-category-select').value;
    document.getElementById('selected-monitoring-title').innerText = selectedCategory;

    const tbody = document.getElementById('monitoring-table-body');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; font-weight:bold; color:#d32f2f;">Mengambil data real-time dari Spreadsheet tab ' + selectedCategory + '...</td></tr>';

    try {
        const monitoringUrl = "https://script.google.com/macros/s/AKfycbxf2XDdAnq6oO9vKH7cZ5MyGHwfxDuETvGAqfAIQjJMXd2DoCIm1pLtdG1Gz9r6rBY7/exec";
        const response = await fetch(`${monitoringUrl}?sheet=${encodeURIComponent(selectedCategory)}`);
        const result = await response.json();

        tbody.innerHTML = '';

        if (result.status === "success" && result.items && result.items.length > 0) {
            result.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${item.nama_general}</strong></td>
                    <td>${item.nama_sistem}</td>
                    <td>${item.keterangan || '-'}</td>
                    <td><code style="color:#d32f2f; font-weight:bold;">${item.kode_barang}</code></td>
                    <td>${item.min_ohs}</td>
                    <td><span style="color:#d32f2f; font-weight:bold;">${item.jumlah_ohs}</span></td>
                    <td><strong style="color:#2e7d32; font-size:15px;">${item.stock_gd}</strong></td>
                    <td>${item.stock_min_gd}</td>
                    <td><strong>${item.satuan}</strong></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data pada tab ${selectedCategory} di Google Spreadsheet.</td></tr>`;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data monitoring:", error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal terhubung ke server cloud.</td></tr>`;
    }
}

// UPDATE MACHINE CARD CATEGORY
async function updateMachineCategory() {
    const selectedMachine = document.getElementById('machine-category-select').value;
    document.getElementById('selected-machine-title').innerText = selectedMachine;

    const tbody = document.getElementById('machine-card-table-body');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; font-weight:bold; color:#d32f2f;">Mengambil data real-time Kartu Mesin ' + selectedMachine + '...</td></tr>';

    try {
        const machineCardUrl = "https://script.google.com/macros/s/AKfycbyJ_bHl9RO4HCLLAqBz49tZayF6Oy-XutvtpaO6dEmlRw3o9TRk5unCwDJ7X4DPw97_Ag/exec";
        const response = await fetch(`${machineCardUrl}?sheet=${encodeURIComponent(selectedMachine)}`);
        const result = await response.json();

        tbody.innerHTML = '';

        if (result.status === "success" && result.items && result.items.length > 0) {
            result.items.forEach(rec => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><code>${rec.tanggal}</code></td>
                    <td><strong>${rec.nama_sistem}</strong></td>
                    <td><strong style="color:#00c853; font-size:15px;">${rec.jumlah}</strong></td>
                    <td><code style="color:#d32f2f;">${rec.kode_barang}</code></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data pada mesin ${selectedMachine} di Google Spreadsheet.</td></tr>`;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data kartu mesin:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal terhubung ke server cloud.</td></tr>`;
    }
}

// MENDAPATKAN WAKTU WIB (JAKARTA) REALTIME
function getWIBTimestamp() {
    const now = new Date();
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(now) + ' WIB';
}

// FETCH LIVE DATA REPAIR & MAINTENANCE DARI SPREADSHEET CLOUD
async function fetchLiveSpreadsheetData() {
    const activeTbody = document.getElementById('active-work-tbody');
    const finishedTbody = document.getElementById('finished-work-tbody');
    
    activeTbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; font-weight:bold; color:#d32f2f;">Mengambil data real-time Laporan Perbaikan...</td></tr>';
    finishedTbody.innerHTML = '';

    try {
        const repairReportUrl = "https://script.google.com/macros/s/AKfycby10PWNTtVPTYduw9MLp98yPNHeu7jXAaeZLWGA6t3XnOWxK6zPjAYsvxvl01VawRsAvg/exec";
        const response = await fetch(repairReportUrl);
        const result = await response.json();

        activeTbody.innerHTML = '';
        finishedTbody.innerHTML = '';

        const savedFinished = JSON.parse(localStorage.getItem('finished_tickets') || '[]');
        
        // Render Riwayat Selesai
        savedFinished.forEach(item => {
            const fRow = document.createElement('tr');
            fRow.innerHTML = `
                <td><code>${item.tanggalPerbaikan}</code></td>
                <td>${item.plant}</td>
                <td><strong>${item.machineId}</strong></td>
                <td><span style="color:#d32f2f; font-weight:bold;">${item.kerusakan}</span></td>
                <td><code style="color:#d32f2f;">${item.kode_barang}</code></td>
                <td><span style="color:#00c853; font-weight:bold;">${item.statusText}</span></td>
                <td><strong>${item.wibTime}</strong></td>
            `;
            finishedTbody.appendChild(fRow);
        });

        if (result.status === "success" && result.items && result.items.length > 0) {
            result.items.forEach((ticket) => {
                if (savedFinished.some(f => f.id === ticket.id)) return;

                const savedState = JSON.parse(localStorage.getItem(`state_${ticket.id}`) || '{}');
                const doneChecked = savedState.done ? 'checked' : '';
                const pendingChecked = savedState.pending ? 'checked' : '';
                const holdChecked = savedState.hold ? 'checked' : '';
                const lastUpdateText = savedState.lastUpdate || 'Belum Disimpan';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><code>${ticket.tanggal_perbaikan}</code></td>
                    <td>${ticket.plant}</td>
                    <td><strong>${ticket.machine_id}</strong></td>
                    <td><span style="color:#d32f2f; font-weight:bold;">${ticket.kerusakan}</span></td>
                    <td><code style="color:#d32f2f;">${ticket.kode_barang}</code></td>
                    <td>
                        <div style="font-size: 11px; font-weight: bold; color: #d32f2f; margin-bottom: 4px;">PILIHAN PROGRESS:</div>
                        <div class="custom-checklist-group">
                            <label class="chk-label"><input type="checkbox" class="green-chk" id="chk-done-${ticket.id}" ${doneChecked}> DONE</label>
                            <label class="chk-label"><input type="checkbox" class="green-chk" id="chk-pending-${ticket.id}" ${pendingChecked}> PENDING</label>
                            <label class="chk-label"><input type="checkbox" class="green-chk" id="chk-hold-${ticket.id}" ${holdChecked}> ON HOLD</label>
                        </div>
                    </td>
                    <td><span id="last-update-${ticket.id}" style="font-size:12px; color:#555;">${lastUpdateText}</span></td>
                    <td>
                        <div style="display: flex; gap: 5px; flex-direction: column; align-items: center;">
                            <button class="btn-temp" onclick="saveTemporary('${ticket.id}', '${ticket.machine_id}')"><i class="fa fa-save"></i> Save Temporary</button>
                            <button class="btn-perm" onclick="savePermanent('${ticket.id}', '${ticket.timestamp}', '${ticket.tanggal_perbaikan}', '${ticket.plant}', '${ticket.machine_id}', '${encodeURIComponent(ticket.kerusakan)}', '${encodeURIComponent(ticket.kode_barang)}')"><i class="fa fa-check-circle"></i> Save Permanent</button>
                        </div>
                    </td>
                `;
                activeTbody.appendChild(row);
            });
        } else {
            activeTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data laporan perbaikan di Google Spreadsheet.</td></tr>`;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data laporan:", error);
        activeTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal terhubung ke server cloud.</td></tr>`;
    }
}

// SAVE TEMPORARY
function saveTemporary(ticketId, machineId) {
    const wibTime = getWIBTimestamp();
    const isDone = document.getElementById(`chk-done-${ticketId}`).checked;
    const isPending = document.getElementById(`chk-pending-${ticketId}`).checked;
    const isHold = document.getElementById(`chk-hold-${ticketId}`).checked;

    const stateData = {
        done: isDone,
        pending: isPending,
        hold: isHold,
        lastUpdate: wibTime
    };

    localStorage.setItem(`state_${ticketId}`, JSON.stringify(stateData));
    document.getElementById(`last-update-${ticketId}`).innerText = wibTime;
    
    alert(`[SAVE TEMPORARY] Draft dan status checklist Mesin ${machineId} berhasil disimpan sementara pada ${wibTime}.`);
}

// SAVE PERMANENT
function savePermanent(ticketId, timestamp, tanggalPerbaikan, plant, machineId, encodedKerusakan, encodedKodeBarang) {
    const wibTime = getWIBTimestamp();
    const kerusakan = decodeURIComponent(encodedKerusakan);
    const kode_barang = decodeURIComponent(encodedKodeBarang);

    const isDone = document.getElementById(`chk-done-${ticketId}`).checked;
    const isPending = document.getElementById(`chk-pending-${ticketId}`).checked;
    const isHold = document.getElementById(`chk-hold-${ticketId}`).checked;

    let statusText = "COMPLETED";
    if(isPending) statusText = "PENDING";
    if(isHold) statusText = "ON HOLD";

    const finishedItem = {
        id: ticketId,
        timestamp,
        tanggalPerbaikan,
        plant,
        machineId,
        kerusakan,
        kode_barang,
        statusText,
        wibTime
    };

    const savedFinished = JSON.parse(localStorage.getItem('finished_tickets') || '[]');
    savedFinished.push(finishedItem);
    localStorage.setItem('finished_tickets', JSON.stringify(savedFinished));

    localStorage.removeItem(`state_${ticketId}`);
    fetchLiveSpreadsheetData();

    alert(`[SAVE PERMANENT] Laporan perbaikan Mesin ${machineId} berhasil disimpan permanen pada ${wibTime} dan dipindahkan ke Riwayat Selesai!`);
}

// INITIAL LOAD
document.addEventListener('DOMContentLoaded', () => {
    updateMonitoringCategory();
    updateMachineCategory();
    fetchLiveSpreadsheetData();
});