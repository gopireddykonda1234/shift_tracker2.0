/* ================================
   GLOBAL VARIABLES & STORAGE
================================ */

let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
let activeShift = JSON.parse(localStorage.getItem("activeShift")) || null;
let editIndex = null;

/* Save Shifts */
function saveShifts() {
    localStorage.setItem("shifts", JSON.stringify(shifts));
}

/* Save Active Shift */
function saveActiveShift() {
    if (activeShift) {
        localStorage.setItem("activeShift", JSON.stringify(activeShift));
    } else {
        localStorage.removeItem("activeShift");
    }
}

/* ================================
   CLOCK IN
================================ */
document.getElementById("clockInBtn").onclick = () => {
    if (activeShift) {
        alert("You already clocked in. You must clock out first.");
        return;
    }

    const now = new Date();
    const confirmIn = confirm(`Clock in at ${now.toLocaleTimeString()}?`);
    if (!confirmIn) return;

    activeShift = {
        start: now.toISOString(),
        isActive: true
    };

    saveActiveShift();
    updateStatus("Clocked In");
    updateUI();
};

/* ================================
   CLOCK OUT
================================ */
document.getElementById("clockOutBtn").onclick = handleClockOut;
document.getElementById("bannerClockOutBtn").onclick = handleClockOut;

function handleClockOut() {
    if (!activeShift) {
        alert("You have not clocked in yet.");
        return;
    }

    const now = new Date();
    const confirmOut = confirm(`Clock out at ${now.toLocaleTimeString()}?`);
    if (!confirmOut) return;

    const start = new Date(activeShift.start);
    const durationMin = Math.floor((now - start) / 60000);

    // Hybrid break rule
    let breakMin = durationMin >= 480 ? 30 : 0;

    const netMinutes = durationMin - breakMin;
    const netHours = netMinutes / 60;

    // Load wage from settings.js
    const wage = getWage();

    shifts.push({
        date: start.toLocaleDateString(),
        start: start.toISOString(),
        end: now.toISOString(),
        break: breakMin,
        hours: netHours,
        holiday: false,
        gross: netHours * wage
    });

    saveShifts();

    activeShift = null;
    saveActiveShift();

    updateStatus("Shift Saved");
    renderShifts();
    updateUI();
}

/* ================================
   HOLIDAY MARKING (Double Pay)
================================ */
document.getElementById("holidayBtn").onclick = () => {
    if (shifts.length === 0) {
        alert("No shift to mark as holiday.");
        return;
    }

    const lastShift = shifts[shifts.length - 1];
    lastShift.holiday = !lastShift.holiday;

    const wage = getWage();
    lastShift.gross = lastShift.hours * wage * (lastShift.holiday ? 2 : 1);

    saveShifts();
    renderShifts();
};

/* ================================
   RENDER SHIFTS
================================ */
function renderShifts() {
    const container = document.getElementById("shiftList");
    container.innerHTML = "";

    shifts.forEach((s, index) => {
        const start = new Date(s.start).toLocaleTimeString();
        const end = new Date(s.end).toLocaleTimeString();

        container.innerHTML += `
            <div class="shift-item">
                <strong>${s.date}</strong>
                <span>${start} → ${end}</span>
                <span>Break: ${s.break} min</span>
                <span>Hours: ${s.hours.toFixed(2)}</span>
                <span>Gross: €${s.gross.toFixed(2)}</span>
                <span>Holiday: ${s.holiday ? "Yes" : "No"}</span>

                <div class="shift-buttons">
                    <button class="edit-btn" onclick="openEditShift(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteShift(${index})">Delete</button>
                </div>
            </div>
        `;
    });
}

/* ================================
   DELETE SHIFT
================================ */
function deleteShift(index) {
    if (!confirm("Delete this shift?")) return;
    shifts.splice(index, 1);
    saveShifts();
    renderShifts();
}

/* ================================
   EDIT SHIFT (Slide-Up Modal)
================================ */
function openEditShift(index) {
    editIndex = index;
    const s = shifts[index];

    document.getElementById("editStart").value = s.start.slice(0, 16);
    document.getElementById("editEnd").value = s.end.slice(0, 16);
    document.getElementById("editBreak").value = s.break;
    document.getElementById("editHoliday").checked = s.holiday;

    document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("editModal").classList.add("hidden");
}

/* SAVE EDITED SHIFT */
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
    const gross = netHours * wage * (newHoliday ? 2 : 1);

    s.start = newStart.toISOString();
    s.end = newEnd.toISOString();
    s.break = newBreak;
    s.hours = netHours;
    s.gross = gross;
    s.holiday = newHoliday;

    saveShifts();
    closeEditModal();
    renderShifts();
}

/* ================================
   PAGE NAVIGATION
================================ */
function openTab(tab) {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("summaryTab").classList.add("hidden");
    document.getElementById("settingsTab").classList.add("hidden");

    if (tab === "home") document.getElementById("app").classList.remove("hidden");
    if (tab === "summary") computeSummary();
    if (tab === "settings") loadSettings();
}

/* ================================
   STATUS TEXT
================================ */
function updateStatus(msg) {
    document.getElementById("status").textContent = msg;
}

/* ================================
   UPDATE UI FOR ACTIVE SHIFT
================================ */
function updateUI() {
    const banner = document.getElementById("activeShiftBanner");
    const clockInBtn = document.getElementById("clockInBtn");

    if (activeShift) {
        banner.classList.remove("hidden");
        document.getElementById("activeShiftText").textContent =
            "Shift Running: " + formatDuration(activeShift.start);

        clockInBtn.disabled = true;
        clockInBtn.style.opacity = 0.4;
    } else {
        banner.classList.add("hidden");
        clockInBtn.disabled = false;
        clockInBtn.style.opacity = 1;
    }
}

/* ================================
   FORMAT ACTIVE SHIFT DURATION
================================ */
function formatDuration(startISO) {
    const start = new Date(startISO);
    const now = new Date();
    const min = Math.floor((now - start) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
}

/* ================================
   SUMMARY TAB (Monthly Net Pay)
================================ */
function computeSummary() {
    openTab("summary");

    let totalHours = 0,
        totalGross = 0;

    shifts.forEach(s => {
        totalHours += s.hours;
        totalGross += s.gross;
    });

    document.getElementById("summaryHours").textContent =
        `Total Hours: ${totalHours.toFixed(2)}`;
    document.getElementById("summaryGross").textContent =
        `Gross Pay: €${totalGross.toFixed(2)}`;

    computePayroll(totalGross); // from payroll.js
}

/* ================================
   INITIAL LOAD
================================ */
renderShifts();
updateUI();
