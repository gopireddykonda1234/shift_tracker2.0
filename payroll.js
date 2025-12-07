/* ============================================================
   PAYROLL ENGINE – SHIFT TRACKER 2.0
   All deductions are PERCENTAGE-BASED (your decision)
   This file calculates MONTHLY NET PAY only.
============================================================ */

/* Read percentage values from settings.js */
function getPayrollSettings() {
    return {
        wage: getWage(),
        lohnP: getLohnPercent(),
        rvP: getRVPercent(),
        extraAP: getExtraAPercent(),
        extraBP: getExtraBPercent()
    };
}

/* ============================================================
   MAIN FUNCTION: CALCULATE MONTHLY NET PAY
============================================================ */
function computePayroll(gross) {
    const S = getPayrollSettings();

    // Convert percentages to decimal
    const lohn = gross * (S.lohnP / 100);
    const rv = gross * (S.rvP / 100);
    const extraA = gross * (S.extraAP / 100);
    const extraB = gross * (S.extraBP / 100);

    const totalDeductions = lohn + rv + extraA + extraB;
    const net = gross - totalDeductions;

    // Update Summary UI
    document.getElementById("summaryDeductionLohn").textContent =
        `Lohnsteuer: €${lohn.toFixed(2)}`;

    document.getElementById("summaryDeductionRV").textContent =
        `Pension (RV): €${rv.toFixed(2)}`;

    document.getElementById("summaryDeductionA").textContent =
        `Extra A: €${extraA.toFixed(2)}`;

    document.getElementById("summaryDeductionB").textContent =
        `Extra B: €${extraB.toFixed(2)}`;

    document.getElementById("summaryNet").textContent =
        `Net: €${net.toFixed(2)}`;
}

/* ============================================================
   EXPORT (if needed in other modules)
============================================================ */
window.computePayroll = computePayroll;
