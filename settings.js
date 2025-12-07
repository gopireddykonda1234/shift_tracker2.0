/* ============================================================
   SETTINGS MODULE – SHIFT TRACKER 3.0
   Stores and retrieves payroll settings from localStorage.
============================================================ */

/* Default settings if user has not saved anything yet */
const defaultSettings = {
    wage: 15,
    lohnPercent: 0,
    rvPercent: 0,
    extraAPercent: 0,
    extraBPercent: 0
};

/* Load settings object */
function loadSettingsFromStorage() {
    return JSON.parse(localStorage.getItem("payrollSettings")) || defaultSettings;
}

/* Save settings object */
function saveSettingsToStorage(settings) {
    localStorage.setItem("payrollSettings", JSON.stringify(settings));
}

/* ============================================================
   LOAD SETTINGS INTO UI
============================================================ */
function loadSettings() {
    const S = loadSettingsFromStorage();

    document.getElementById("wageInput").value = S.wage;
    document.getElementById("lohnPercentInput").value = S.lohnPercent;
    document.getElementById("rvPercentInput").value = S.rvPercent;
    document.getElementById("extraAPercentInput").value = S.extraAPercent;
    document.getElementById("extraBPercentInput").value = S.extraBPercent;
}

/* ============================================================
   SAVE SETTINGS FROM UI
============================================================ */
function saveSettings() {
    const newSettings = {
        wage: Number(document.getElementById("wageInput").value),
        lohnPercent: Number(document.getElementById("lohnPercentInput").value),
        rvPercent: Number(document.getElementById("rvPercentInput").value),
        extraAPercent: Number(document.getElementById("extraAPercentInput").value),
        extraBPercent: Number(document.getElementById("extraBPercentInput").value)
    };

    saveSettingsToStorage(newSettings);

    alert("Settings saved!");
}

/* ============================================================
   GETTERS USED BY OTHER FILES (payroll.js, app.js)
============================================================ */
function getWage() {
    return loadSettingsFromStorage().wage;
}

function getLohnPercent() {
    return loadSettingsFromStorage().lohnPercent;
}

function getRVPercent() {
    return loadSettingsFromStorage().rvPercent;
}

function getExtraAPercent() {
    return loadSettingsFromStorage().extraAPercent;
}

function getExtraBPercent() {
    return loadSettingsFromStorage().extraBPercent;
}

function getPayrollSettings() {
    const S = loadSettingsFromStorage();
    return {
        lohnP: S.lohnPercent,
        rvP: S.rvPercent,
        extraAP: S.extraAPercent,
        extraBP: S.extraBPercent
    };
}

/* ============================================================
   EXPORT FUNCTIONS FOR GLOBAL USAGE
============================================================ */

window.getWage = getWage;
window.getLohnPercent = getLohnPercent;
window.getRVPercent = getRVPercent;
window.getExtraAPercent = getExtraAPercent;
window.getExtraBPercent = getExtraBPercent;
window.getPayrollSettings = getPayrollSettings;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;

