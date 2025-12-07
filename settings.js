/* ============================================================
   SETTINGS MODULE – SHIFT TRACKER 2.0
   Stores and retrieves payroll settings from localStorage.
============================================================ */

/* Default settings if nothing is saved */
const defaultSettings = {
    wage: 15,
    lohnPercent: 0,
    rvPercent: 9.3,
    extraAPercent: 0,
    extraBPercent: 0
};

/* Load settings (returns object) */
function loadSettingsFromStorage() {
    return JSON.parse(localStorage.getItem("payrollSettings")) || defaultSettings;
}

/* Save settings */
function saveSettingsToStorage(settings) {
    localStorage.setItem("payrollSettings", JSON.stringify(settings));
}

/* ============================================================
   UI: LOAD SETTINGS INTO INPUT FIELDS
============================================================ */
function loadSettings() {
    const S = loadSettingsFromStorage();

    document.getElementById("wageInput").value = S.wage;
    document.getElementById("lohnPercentInput").value = S.lohnPercent;
    document.getElementById("rvPercentInput").value = S.rvPercent;
    document.getElementById("extraAPercentInput").value = S.extraAPercent;
    document.getElementById("extraBPercentInput").value = S.extraBPercent;

    document.getElementById("app").classList.add("hidden");
    document.getElementById("settingsTab").classList.remove("hidden");
}

/* ============================================================
   SAVE BUTTON (From Settings Page)
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

    alert("Settings Saved!");
    openTab("home");
}

/* ============================================================
   GETTER FUNCTIONS (Used by payroll.js & app.js)
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

/* ============================================================
   EXPORT GLOBAL FUNCTIONS
============================================================ */
window.getWage = getWage;
window.getLohnPercent = getLohnPercent;
window.getRVPercent = getRVPercent;
window.getExtraAPercent = getExtraAPercent;
window.getExtraBPercent = getExtraBPercent;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
