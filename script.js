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
        initCalendarModule();
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
    
    links.forEach(link => {
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(tabId)) {
            link.classList.add('active');
        }
    });

    if(tabId === 'calendar') {
        renderFullCalendar();
    }
    if(tabId === 'overview') {
        renderMiniCalendars();
    }
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


// --- MODUL MAINTENANCE CALENDAR DENGAN 2 SLOT VERTICAL PER TANGGAL & SIKLUS OTOMATIS ---
let currentCalDate = new Date();

const baseOctoberSchedule2026 = {
    1: ["TCY", "AFG1"],
    2: ["JHF1", "SN3"],
    3: ["JIAYI", "TOKAI 1"],
    5: ["SNS", "XNT"],
    6: ["6PA", "SI4"],
    7: ["GN2", "JHF2"],
    8: ["AF2", "SN4"],
    9: ["GN1", ""],
    10: ["JIAYI", "TOKAI 2"],
    13: ["H21", ""],
    14: ["BHS", ""],
    15: ["AFG1", ""],
    17: ["JIAYI", "TOKAI 3"],
    19: ["H20", "XNT"],
    20: ["6PA", "SI4"],
    21: ["GN2", ""],
    22: ["TCY", ""],
    23: ["JHF1", ""],
    24: ["JIAYI", "TOKAI 1"],
    26: ["SNS", "GN1"],
    27: ["AF2", ""],
    28: ["JHF2", ""],
    29: ["SN4", ""],
    31: ["JIAYI", "TOKAI 2"]
};

// Definisi Anchor dan Interval Siklus per Mesin (dalam hari)
const machineAnchors = {
    'TCY': { anchor: new Date(2026, 9, 1), intervalDays: 21 },
    'AFG1': { anchor: new Date(2026, 9, 1), intervalDays: 14 },
    'JHF1': { anchor: new Date(2026, 9, 2), intervalDays: 21 },
    'SN3': { anchor: new Date(2026, 9, 2), intervalDays: 21 },
    'JIAYI': { anchor: new Date(2026, 9, 3), intervalDays: 7 },
    'TOKAI 1': { anchor: new Date(2026, 9, 3), intervalDays: 21 },
    'SNS': { anchor: new Date(2026, 9, 5), intervalDays: 21 },
    'XNT': { anchor: new Date(2026, 9, 5), intervalDays: 14 },
    '6PA': { anchor: new Date(2026, 9, 6), intervalDays: 14 },
    'SI4': { anchor: new Date(2026, 9, 6), intervalDays: 14 },
    'GN2': { anchor: new Date(2026, 9, 7), intervalDays: 14 },
    'JHF2': { anchor: new Date(2026, 9, 7), intervalDays: 21 },
    'AF2': { anchor: new Date(2026, 9, 8), intervalDays: 21 },
    'SN4': { anchor: new Date(2026, 9, 8), intervalDays: 21 },
    'GN1': { anchor: new Date(2026, 9, 9), intervalDays: 14 },
    'TOKAI 2': { anchor: new Date(2026, 9, 10), intervalDays: 21 },
    'H21': { anchor: new Date(2026, 9, 13), intervalDays: 28 },
    'BHS': { anchor: new Date(2026, 9, 14), intervalDays: 28 },
    'TOKAI 3': { anchor: new Date(2026, 9, 17), intervalDays: 28 },
    'H20': { anchor: new Date(2026, 9, 19), intervalDays: 28 }
};

function getAutoMaintenanceForDate(year, month, day) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay(); // 0 = Minggu
    
    if (dayOfWeek === 0) return ["", ""]; // Hari Minggu kosong

    if (year === 2026 && month === 9) {
        if (baseOctoberSchedule2026[day]) {
            let slots = [...baseOctoberSchedule2026[day]];
            while(slots.length < 2) slots.push("");
            return slots;
        }
        return ["", ""];
    }

    let matchedMachines = [];
    for (const [machine, config] of Object.entries(machineAnchors)) {
        const diffTime = d - config.anchor;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays % config.intervalDays === 0) {
            matchedMachines.push(machine);
        }
    }

    let slots = ["", ""];
    if (matchedMachines.length > 0) slots[0] = matchedMachines[0];
    if (matchedMachines.length > 1) slots[1] = matchedMachines[1];

    return slots;
}

// Fungsi edit slot per tanggal (tanpa menggeser tanggal lain)
function editSlot(dateStr, slotIndex) {
    let [y, m, d] = dateStr.split('-').map(Number);
    let cellDate = new Date(y, m - 1, d);
    let today = new Date();
    today.setHours(0,0,0,0);

    if (cellDate < today) {
        alert("Tanggal yang sudah lewat terkunci dan tidak dapat diubah!");
        return;
    }

    let customSchedules = JSON.parse(localStorage.getItem('smb_maintenance_schedule') || '{}');
    let currentMachines = customSchedules[dateStr] ? [...customSchedules[dateStr]] : [...getAutoMaintenanceForDate(y, m - 1, d)];
    while(currentMachines.length < 2) currentMachines.push("");

    let currentVal = currentMachines[slotIndex] || "";
    let newVal = prompt(`Edit/Ganti mesin untuk tanggal ${dateStr} (Slot ${slotIndex + 1}):`, currentVal);
    if(newVal === null) return;

    currentMachines[slotIndex] = newVal.trim().toUpperCase();
    customSchedules[dateStr] = currentMachines;
    localStorage.setItem('smb_maintenance_schedule', JSON.stringify(customSchedules));

    renderFullCalendar();
    renderMiniCalendars();
    alert(`Jadwal tanggal ${dateStr} (Slot ${slotIndex + 1}) berhasil diperbarui tanpa mengubah tanggal lainnya!`);
}

function initCalendarModule() {
    renderFullCalendar();
    loadCalendarNotes();
    renderMiniCalendars();
}

function changeMonth(step) {
    currentCalDate.setMonth(currentCalDate.getMonth() + step);
    renderFullCalendar();
    renderMiniCalendars();
}

function renderFullCalendar() {
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('cal-main-month-year').innerText = `${monthNames[month]} ${year}`;

    const effDate = new Date();
    effDate.setFullYear(effDate.getFullYear() + 1);
    document.getElementById('cal-effective-date').innerText = `Effective date : ${String(effDate.getDate()).padStart(2,'0')}-${String(effDate.getMonth()+1).padStart(2,'0')}-${effDate.getFullYear()}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const tbody = document.getElementById('calendar-main-tbody');
    tbody.innerHTML = '';

    let dateCount = 1;
    let nextMonthDateCount = 1;
    let rowHtml = '';

    const customSchedules = JSON.parse(localStorage.getItem('smb_maintenance_schedule') || '{}');
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 6; i++) {
        rowHtml += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDayIndex) {
                let prevDay = prevTotalDays - (firstDayIndex - j - 1);
                rowHtml += `<td class="cal-cell other-month"><div class="cal-date-num">${prevDay}</div></td>`;
            } else if (dateCount > totalDays) {
                rowHtml += `<td class="cal-cell other-month"><div class="cal-date-num">${nextMonthDateCount}</div></td>`;
                nextMonthDateCount++;
            } else {
                let currDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
                let cellDate = new Date(year, month, dateCount);
                
                let machines = customSchedules[currDateStr];
                if (!machines) {
                    machines = getAutoMaintenanceForDate(year, month, dateCount);
                }
                while(machines.length < 2) machines.push("");

                let isPast = cellDate < today;
                let slot1Html = machines[0] ? `<div class="machine-slot" ${isPast ? '' : `onclick="editSlot('${currDateStr}', 0)"`} title="Klik untuk edit">${machines[0]}</div>` : `<div class="machine-slot empty-slot" ${isPast ? '' : `onclick="editSlot('${currDateStr}', 0)"`}>-</div>`;
                let slot2Html = machines[1] ? `<div class="machine-slot" ${isPast ? '' : `onclick="editSlot('${currDateStr}', 1)"`} title="Klik untuk edit">${machines[1]}</div>` : `<div class="machine-slot empty-slot" ${isPast ? '' : `onclick="editSlot('${currDateStr}', 1)"`}>-</div>`;

                let isSundayClass = (j === 0) ? 'sunday-cell' : '';

                rowHtml += `
                    <td class="cal-cell ${isSundayClass}" data-date="${currDateStr}">
                        <div class="cal-cell-header">
                            <span class="cal-date-num">${dateCount}</span>
                        </div>
                        <div class="cal-slots-container">
                            ${slot1Html}
                            ${slot2Html}
                        </div>
                    </td>
                `;
                dateCount++;
            }
        }
        rowHtml += '</tr>';
        if (dateCount > totalDays && i >= 3) break;
    }
    tbody.innerHTML = rowHtml;
}

function saveCalendarNotes() {
    const notesText = document.getElementById('cal-notes-textarea').value;
    const wibTime = getWIBTimestamp();
    
    localStorage.setItem('smb_calendar_notes', notesText);
    localStorage.setItem('smb_calendar_notes_time', wibTime);
    
    document.getElementById('cal-last-update').innerText = `Last Update: ${wibTime}`;
}

function loadCalendarNotes() {
    const savedNotes = localStorage.getItem('smb_calendar_notes');
    const savedTime = localStorage.getItem('smb_calendar_notes_time');
    
    if(savedNotes) {
        document.getElementById('cal-notes-textarea').value = savedNotes;
    } else {
        document.getElementById('cal-notes-textarea').value = "- JIAYI SETIAP SABTU CLEANING\n- JADWAL SEWAKTU-WAKTU BISA BERUBAH";
    }

    if(savedTime) {
        document.getElementById('cal-last-update').innerText = `Last Update: ${savedTime}`;
    }
}

function renderMiniCalendars() {
    const prevDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1);
    const nextDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1);

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    document.getElementById('lbl-prev-month').innerText = `${monthNames[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
    document.getElementById('lbl-next-month').innerText = `${monthNames[nextDate.getMonth()]} ${nextDate.getFullYear()}`;

    document.getElementById('mini-prev-grid').innerHTML = generateMiniGrid(prevDate.getFullYear(), prevDate.getMonth());
    document.getElementById('mini-next-grid').innerHTML = generateMiniGrid(nextDate.getFullYear(), nextDate.getMonth());
    
    const overviewWidget = document.getElementById('overview-mini-calendar');
    if(overviewWidget) {
        const currYear = currentCalDate.getFullYear();
        const currMonth = currentCalDate.getMonth();
        overviewWidget.innerHTML = generateMiniGridLarge(currYear, currMonth);
    }
}

function generateMiniGrid(year, month) {
    let html = '<div class="mini-days-header"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div><div class="mini-days-body">';
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    let dayCount = 1;
    for (let i = 0; i < 35; i++) {
        if (i < firstDay) {
            let d = prevTotalDays - (firstDay - i - 1);
            html += `<span class="muted">${d}</span>`;
        } else if (dayCount <= totalDays) {
            html += `<span>${dayCount}</span>`;
            dayCount++;
        } else {
            html += `<span class="muted"></span>`;
        }
    }
    html += '</div>';
    return html;
}

function generateMiniGridLarge(year, month) {
    const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    let tableHtml = `
        <div style="font-weight: 900; font-size: 16px; color: #d32f2f; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <i class="fa fa-calendar-alt"></i> ${monthNamesFull[month].toUpperCase()} ${year} Maintenance Schedule
        </div>
        <div class="table-responsive">
            <table class="glass-table calendar-main-table">
                <thead>
                    <tr>
                        <th>Sunday</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let dateCount = 1;
    let nextMonthDateCount = 1;
    const customSchedules = JSON.parse(localStorage.getItem('smb_maintenance_schedule') || '{}');

    for (let i = 0; i < 6; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDayIndex) {
                let prevDay = prevTotalDays - (firstDayIndex - j - 1);
                tableHtml += `<td class="cal-cell other-month"><div class="cal-date-num">${prevDay}</div></td>`;
            } else if (dateCount > totalDays) {
                tableHtml += `<td class="cal-cell other-month"><div class="cal-date-num">${nextMonthDateCount}</div></td>`;
                nextMonthDateCount++;
            } else {
                let currDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
                let machines = customSchedules[currDateStr];
                if (!machines) {
                    machines = getAutoMaintenanceForDate(year, month, dateCount);
                }
                while(machines.length < 2) machines.push("");

                let slot1Html = machines[0] ? `<div class="machine-slot" style="cursor: default;" title="${machines[0]}">${machines[0]}</div>` : `<div class="machine-slot empty-slot" style="cursor: default;">-</div>`;
                let slot2Html = machines[1] ? `<div class="machine-slot" style="cursor: default;" title="${machines[1]}">${machines[1]}</div>` : `<div class="machine-slot empty-slot" style="cursor: default;">-</div>`;

                let isSundayClass = (j === 0) ? 'sunday-cell' : '';

                tableHtml += `
                    <td class="cal-cell ${isSundayClass}" data-date="${currDateStr}">
                        <div class="cal-cell-header">
                            <span class="cal-date-num">${dateCount}</span>
                        </div>
                        <div class="cal-slots-container">
                            ${slot1Html}
                            ${slot2Html}
                        </div>
                    </td>
                `;
                dateCount++;
            }
        }
        tableHtml += '</tr>';
        if (dateCount > totalDays && i >= 3) break;
    }
    tableHtml += '</tbody></table></div>';
    return tableHtml;
}

function downloadCalendarPDF() {
    window.print();
}

// INITIAL LOAD
document.addEventListener('DOMContentLoaded', () => {
    updateMonitoringCategory();
    updateMachineCategory();
    fetchLiveSpreadsheetData();
    initCalendarModule();
});