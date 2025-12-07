/* ============================================================
   SHIFT TRACKER 3.0 - FULL ENGINE
   Auto-Month Filtering + History + CSV Export
============================================================ */

/* STORAGE */
let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
let activeShift = JSON.parse(localStorage.getItem("activeShift")) || null;

/* Save Functions */
function saveShifts() {
    localStorage.setItem("shifts", JSON.stringify(shifts));
}

function saveActiveShift() {
    if (activeShift) localStorage.setItem("activeShift", JSON.stringify(activeShift));
    else localStorage.removeItem("activeShift");
}

/* ============================================================
   UTILITIES
============================================================ */

function getMonthId(date) {
    return date.toISOString().slice(0, 7); // "2025-12"
}

function formatMonthLabel(id) {
    const [y, m] = id.split("-");
    const date = new Date(y, m - 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getLast6Months() {
    const months = [...new Set(shifts.map(s => s.month))];
    return months.sort().reverse().slice(0, 6);
}

/* ============================================================
   CLOCK IN
============================================================ */

document.getElementById("clockInBtn").onclick = () => {
    if (activeShift) return alert("Already clocked in.");

    const now = new Date();
    if (!confirm(`Clock in at ${now.toLocaleTimeString()}?`)) return;

    activeShift = {
        start: now.toISOString()
    };

    saveActiveShift();
    updateUI();
};

/* ============================================================
   CLOCK OUT
============================================================ */

document.getElementById("clockOutBtn").onclick = handleClockOut;
document.getElementById("bannerClockOutBtn").onclick = handleClockOut;

function handleClockOut() {
    if (!activeShift) return alert("Not clocked in.");

    const now = new Date();
    if (!confirm(`Clock out at ${now.toLocaleTimeString()}?`)) return;

    const start = new Date(activeShift.start);
    const durationMin = Math.floor((now - start) / 60000);
    const breakMin = durationMin >= 480 ? 30 : 0;
    const netMinutes = durationMin - breakMin;
    const hours = netMinutes / 60;

    const wage = getWage();
    const month = getMonthId(start);

    shifts.push({
        date: start.toISOString(),
        start: start.toISOString(),
        end: now.toISOString(),
        break: breakMin,
        hours,
        holiday: false,
        gross: hours * wage,
        month
    });

    saveShifts();
    activeShift = null;
    saveActiveShift();

    renderShifts();
    updateUI();
}

/* ============================================================
   RENDER SHIFTS (HOME TAB)
============================================================ */

function renderShifts() {
    const list = document.getElementById("shiftList");
    list.innerHTML = "";

    shifts.forEach((s, i) => {
        const start = new Date(s.start).toLocaleTimeString();
        const end = new Date(s.end).toLocaleTimeString();
        const date = new Date(s.start).toLocaleDateString();

        list.innerHTML += `
            <div class="shift-item">
                <strong>${date}</strong>
                <span>${start} → ${end}</span>
                <span>Break: ${s.break} min</span>
                <span>Hours: ${s.hours.toFixed(2)}</span>
                <span>Gross: €${s.gross.toFixed(2)}</span>

                <div class="shift-buttons">
                    <button class="edit-btn" onclick="openEditShift(${i})">Edit</button>
                    <button class="delete-btn" onclick="deleteShift(${i})">Delete</button>
                </div>
            </div>
        `;
    });
}

/* ============================================================
   DELETE SHIFT
============================================================ */

function deleteShift(i) {
    if (!confirm("Delete this shift?")) return;
    shifts.splice(i, 1);
    saveShifts();
    renderShifts();
}

/* ============================================================
   EDIT SHIFT MODAL
============================================================ */

let editIndex = null;

function openEditShift(i) {
    editIndex = i;
    const s = shifts[i];

    document.getElementById("editStart").value = s.start.slice(0, 16);
    document.getElementById("editEnd").value = s.end.slice(0, 16);
    document.getElementById("editBreak").value = s.break;
    document.getElementById("editHoliday").checked = s.holiday;

    document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("editModal").classList.add("hidden");
}

/* SAVE SHIFT AFTER EDITING */
function saveShiftEdit() {
    const s = shifts[editIndex];

    const newStart = new Date(document.getElementById("editStart").value);
    const newEnd = new Date(document.getElementById("editEnd").value);
    const newBreak = Number(document.getElementById("editBreak").value);
    const newHoliday = document.getElementById("editHoliday").checked;

    const durationMin = Math.floor((newEnd - newStart) / 60000);
    const netMinutes = durationMin - newBreak;
    const netHours = netMinutes / 60;

    const wage = getWage();
    const month = getMonthId(newStart);

    s.start = newStart.toISOString();
    s.end = newEnd.toISOString();
    s.break = newBreak;
    s.hours = netHours;
    s.holiday = newHoliday;
    s.gross = netHours * wage * (newHoliday ? 2 : 1);
    s.month = month;

    saveShifts();
    closeEditModal();
    renderShifts();
}

/* ============================================================
   HISTORY / SUMMARY SECTION
============================================================ */

/* Current Month Summary */
function computeCurrentMonth() {
    const now = new Date();
    const monthId = getMonthId(now);

    document.getElementById("currentSummaryMonth").textContent =
        formatMonthLabel(monthId);

    const filtered = shifts.filter(s => s.month === monthId);

    const hours = filtered.reduce((a, b) => a + b.hours, 0);
    const gross = filtered.reduce((a, b) => a + b.gross, 0);

    document.getElementById("summaryHours").textContent =
        `Total Hours: ${hours.toFixed(2)}`;

    document.getElementById("summaryShifts").textContent =
        `Total Shifts: ${filtered.length}`;

    document.getElementById("summaryGross").textContent =
        `Gross Pay: €${gross.toFixed(2)}`;

    computePayroll(gross);
}

/* Load Dropdown for Past Months */
function loadMonthDropdown() {
    const dropdown = document.getElementById("monthSelector");
    dropdown.innerHTML = `<option value="">Select a month</option>`;

    const months = getLast6Months();

    months.forEach(m => {
        dropdown.innerHTML += `<option value="${m}">${formatMonthLabel(m)}</option>`;
    });
}

/* Past Month Summary */
document.getElementById("monthSelector").onchange = function () {
    const month = this.value;
    if (!month) {
        document.getElementById("pastSummarySection").classList.add("hidden");
        return;
    }
    computePastMonth(month);
};

function computePastMonth(month) {
    const filtered = shifts.filter(s => s.month === month);

    const hours = filtered.reduce((a, b) => a + b.hours, 0);
    const gross = filtered.reduce((a, b) => a + b.gross, 0);

    document.getElementById("pastSummaryTitle").textContent =
        `PAST SUMMARY – ${formatMonthLabel(month)}`;

    document.getElementById("pastHours").textContent =
        `Total Hours: ${hours.toFixed(2)}`;

    document.getElementById("pastShifts").textContent =
        `Total Shifts: ${filtered.length}`;

    document.getElementById("pastGross").textContent =
        `Gross Pay: €${gross.toFixed(2)}`;

    const S = getPayrollSettings();
    const lohn = gross * (S.lohnP / 100);
    const rv = gross * (S.rvP / 100);
    const a = gross * (S.extraAP / 100);
    const b = gross * (S.extraB / 100);

    document.getElementById("pastDeductionLohn").textContent =
        `Lohnsteuer: €${lohn.toFixed(2)}`;
    document.getElementById("pastDeductionRV").textContent =
        `Pension (RV): €${rv.toFixed(2)}`;
    document.getElementById("pastDeductionA").textContent =
        `Extra A: €${a.toFixed(2)}`;
    document.getElementById("pastDeductionB").textContent =
        `Extra B: €${b.toFixed(2)}`;

    document.getElementById("pastNet").textContent =
        `Net Pay: €${(gross - lohn - rv - a - b).toFixed(2)}`;

    document.getElementById("pastSummarySection").classList.remove("hidden");

    document.getElementById("exportCSVBtn").onclick = () =>
        exportCSV(month);
}

/* ============================================================
   CSV EXPORT
============================================================ */

function exportCSV(month) {
    const filtered = shifts.filter(s => s.month === month);

    let csv = "Date,Start,End,Break,Hours,Holiday,Gross\n";

    filtered.forEach(s => {
        csv += `${new Date(s.date).toLocaleDateString()},${new Date(s.start).toLocaleTimeString()},${new Date(s.end).toLocaleTimeString()},${s.break},${s.hours.toFixed(2)},${s.holiday},${s.gross.toFixed(2)}\n`;
    });

    csv += "\nTOTALS\n";

    const hours = filtered.reduce((a, b) => a + b.hours, 0);
    const gross = filtered.reduce((a, b) => a + b.gross, 0);

    const S = getPayrollSettings();
    const lohn = gross * (S.lohnP / 100);
    const rv = gross * (S.rvP / 100);
    const a = gross * (S.extraAP / 100);
    const b = gross * (S.extraB / 100);

    csv += `Total Hours:,${hours.toFixed(2)}\n`;
    csv += `Total Gross:,€${gross.toFixed(2)}\n`;
    csv += `Lohnsteuer:,€${lohn.toFixed(2)}\n`;
    csv += `Pension RV:,€${rv.toFixed(2)}\n`;
    csv += `Extra A:,€${a.toFixed(2)}\n`;
    csv += `Extra B:,€${b.toFixed(2)}\n`;
    csv += `Net Pay:,€${(gross - lohn - rv - a - b).toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const aElem = document.createElement("a");
    aElem.href = url;
    aElem.download = `shift_report_${month}.csv`;
    aElem.click();
}

/* ============================================================
   NAVIGATION (FIXED)
============================================================ */

function openTab(tab) {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("summaryTab").classList.add("hidden");
    document.getElementById("settingsTab").classList.add("hidden");

    const btns = document.querySelectorAll(".nav-btn");
    btns.forEach(b => b.classList.remove("active"));

    if (tab === "home") {
        document.getElementById("app").classList.remove("hidden");
        btns[0].classList.add("active");
    }

    if (tab === "summary") {
        document.getElementById("summaryTab").classList.remove("hidden");
        btns[1].classList.add("active");

        computeCurrentMonth();
        loadMonthDropdown();
    }

    if (tab === "settings") {
        document.getElementById("settingsTab").classList.remove("hidden");
        btns[2].classList.add("active");

        loadSettings();
    }
}

/* ============================================================
   ACTIVE SHIFT UI
============================================================ */

function updateUI() {
    const banner = document.getElementById("activeShiftBanner");
    const btn = document.getElementById("clockInBtn");

    if (activeShift) {
        banner.classList.remove("hidden");
        btn.disabled = true;
    } else {
        banner.classList.add("hidden");
        btn.disabled = false;
    }
}

/* ============================================================
   INITIAL LOAD
============================================================ */

renderShifts();
updateUI();
