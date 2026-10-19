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

    const thead = document.getElementById('monitoring-table-head');
    const tbody = document.getElementById('monitoring-table-body');
    
    // Kategori khusus 10 kolom
    const specialCategories = ["H20", "H21", "GPA+GPS", "GN2", "JHF & SNS"];
    const isSpecial = specialCategories.includes(selectedCategory);

    if (isSpecial) {
        thead.innerHTML = `
            <tr>
                <th>Nama General</th>
                <th>Nama Sistem Gudang</th>
                <th>Keterangan</th>
                <th>Kode Barang</th>
                <th>Terpasang</th>
                <th>Minimum Stock</th>
                <th>Maximum Stock</th>
                <th>Jumlah OHS</th>
                <th>Stock GD Teknik</th>
                <th>SATUAN</th>
            </tr>
        `;
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; font-weight:bold; color:#d32f2f;">Mengambil data real-time dari Spreadsheet tab ' + selectedCategory + '...</td></tr>';
    } else {
        thead.innerHTML = `
            <tr>
                <th>Nama General</th>
                <th>Nama Sistem Gudang</th>
                <th>Keterangan</th>
                <th>Kode Barang</th>
                <th>Jumlah Min. Stock OHS/Terpasang</th>
                <th>Jumlah OHS</th>
                <th>Stock GD Teknik</th>
                <th>Stock Min. GD Teknik</th>
                <th>SATUAN</th>
            </tr>
        `;
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; font-weight:bold; color:#d32f2f;">Mengambil data real-time dari Spreadsheet tab ' + selectedCategory + '...</td></tr>';
    }

    try {
        const monitoringUrl = "https://script.google.com/macros/s/AKfycbwhoATgClaRw5b2jLzqFi3kH6MXH5f7qT-7CcPNxQGkbEp53ly9cI1nopMlImk1OOGILw/exec";
        const response = await fetch(`${monitoringUrl}?sheet=${encodeURIComponent(selectedCategory)}`);
        const result = await response.json();

        tbody.innerHTML = '';

        if (result.status === "success" && result.items && result.items.length > 0) {
            result.items.forEach(item => {
                const row = document.createElement('tr');
                if (item.is_special) {
                    row.innerHTML = `
                        <td><strong>${item.nama_general}</strong></td>
                        <td>${item.nama_sistem}</td>
                        <td>${item.keterangan || '-'}</td>
                        <td><code style="color:#d32f2f; font-weight:bold;">${item.kode_barang}</code></td>
                        <td>${item.terpasang}</td>
                        <td>${item.min_stock}</td>
                        <td>${item.max_stock}</td>
                        <td><span style="color:#d32f2f; font-weight:bold;">${item.jumlah_ohs}</span></td>
                        <td><strong style="color:#2e7d32; font-size:15px;">${item.stock_gd}</strong></td>
                        <td><strong>${item.satuan}</strong></td>
                    `;
                } else {
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
                }
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="${isSpecial ? 10 : 9}" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data pada tab ${selectedCategory} di Google Spreadsheet.</td></tr>`;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data monitoring:", error);
        tbody.innerHTML = `<tr><td colspan="${isSpecial ? 10 : 9}" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal terhubung ke server cloud.</td></tr>`;
    }
}

// UPDATE MACHINE CARD CATEGORY (DINAMIS UNTUK 3 TIPE SPREADSHEET)
async function updateMachineCategory() {
    const selectedMachine = document.getElementById('machine-category-select').value;
    document.getElementById('selected-machine-title').innerText = selectedMachine;

    const container = document.getElementById('machine-card-container');
    container.innerHTML = '<div style="text-align:center; padding:30px; font-weight:bold; color:#d32f2f;">Mengambil data real-time Kartu Mesin ' + selectedMachine + '...</div>';

    try {
        const machineCardUrl = "https://script.google.com/macros/s/AKfycbwNfb0Ayq2B7tg1DQelymg5bRbBob1vLRiwNyBKPQEd83gt0Z-fjJFe5X_M-BDCqmFs/exec";
        const response = await fetch(`${machineCardUrl}?sheet=${encodeURIComponent(selectedMachine)}`);
        const result = await response.json();

        container.innerHTML = '';

        if (result.status === "success") {
            // 1. TIPE DOUBLE TABLE (6PA+6PS / JHF & SNS)
            if (result.type === "double_table") {
                const gridDiv = document.createElement('div');
                gridDiv.style.display = 'grid';
                gridDiv.style.gridTemplateColumns = '1fr 1fr';
                gridDiv.style.gap = '20px';

                // Helper fungsi pembuat HTML tabel
                const makeTableHtml = (title, items) => {
                    let rowsHtml = '';
                    if (items && items.length > 0) {
                        items.forEach(rec => {
                            rowsHtml += `
                                <tr>
                                    <td><code>${rec.tanggal}</code></td>
                                    <td><strong>${rec.nama_sistem}</strong></td>
                                    <td><strong style="color:#00c853; font-size:15px;">${rec.jumlah}</strong></td>
                                    <td><code style="color:#d32f2f;">${rec.kode_barang}</code></td>
                                </tr>
                            `;
                        });
                    } else {
                        rowsHtml = `<tr><td colspan="4" style="text-align:center; color:#d32f2f; font-weight:bold; padding:15px;">Tidak ada data.</td></tr>`;
                    }

                    return `
                        <div>
                            <div style="background: linear-gradient(135deg, #fbc02d, #f57f17); color: #000; text-align: center; font-weight: 900; padding: 10px; font-size: 16px; border-radius: 8px 8px 0 0; letter-spacing: 1px;">
                                ${title}
                            </div>
                            <div class="table-responsive">
                                <table class="glass-table stretch-table" style="border-radius: 0 0 12px 12px;">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Nama Sistem Gudang</th>
                                            <th>Jumlah</th>
                                            <th>Kode Barang</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rowsHtml}</tbody>
                                </table>
                            </div>
                        </div>
                    `;
                };

                gridDiv.innerHTML = makeTableHtml(result.title_left, result.table_left) + makeTableHtml(result.title_right, result.table_right);
                container.appendChild(gridDiv);

            // 2. TIPE LAIN-LAIN (5 Kolom: Tanggal, Keperluan, Nama Sistem Gudang, Kode Barang, Jumlah)
            } else if (result.type === "lain_lain") {
                let rowsHtml = '';
                if (result.items && result.items.length > 0) {
                    result.items.forEach(rec => {
                        rowsHtml += `
                            <tr>
                                <td><code>${rec.tanggal}</code></td>
                                <td><strong style="color:#00838f;">${rec.keperluan}</strong></td>
                                <td><strong>${rec.nama_sistem}</strong></td>
                                <td><code style="color:#d32f2f; font-weight:bold;">${rec.kode_barang}</code></td>
                                <td><strong style="color:#00c853; font-size:15px;">${rec.jumlah}</strong></td>
                            </tr>
                        `;
                    });
                } else {
                    rowsHtml = `<tr><td colspan="5" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data pada ${selectedMachine}.</td></tr>`;
                }

                container.innerHTML = `
                    <div class="table-responsive">
                        <table class="glass-table stretch-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Keperluan</th>
                                    <th>Nama Sistem Gudang</th>
                                    <th>Kode Barang</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                `;

            // 3. TIPE STANDAR (4 Kolom)
            } else {
                let rowsHtml = '';
                if (result.items && result.items.length > 0) {
                    result.items.forEach(rec => {
                        rowsHtml += `
                            <tr>
                                <td><code>${rec.tanggal}</code></td>
                                <td><strong>${rec.nama_sistem}</strong></td>
                                <td><strong style="color:#00c853; font-size:15px;">${rec.jumlah}</strong></td>
                                <td><code style="color:#d32f2f; font-weight:bold;">${rec.kode_barang}</code></td>
                            </tr>
                        `;
                    });
                } else {
                    rowsHtml = `<tr><td colspan="4" style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Tidak ada data pada mesin ${selectedMachine}.</td></tr>`;
                }

                container.innerHTML = `
                    <div class="table-responsive">
                        <table class="glass-table stretch-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Nama Sistem Gudang</th>
                                    <th>Jumlah</th>
                                    <th>Kode Barang</th>
                                </tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                `;
            }
        } else {
            container.innerHTML = `<div style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal memproses data dari server cloud.</div>`;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data kartu mesin:", error);
        container.innerHTML = `<div style="text-align:center; color:#d32f2f; font-weight:bold; padding:20px;">Gagal terhubung ke server cloud.</div>`;
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
        const repairReportUrl = "https://script.google.com/macros/s/AKfycbz88E1PXQQc0m7MkYjCmRwciJ-42aUAW8JrkoJ7d0pmTgSKn1h_6Wy7Yi503zXWdVqdyA/exec";
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