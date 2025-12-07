/* ============================================================
   PAYROLL ENGINE – SHIFT TRACKER 3.0
   Handles deduction calculations + summary UI updates.
============================================================ */

/* 
   computePayroll(gross)
   - Calculates all deductions based on saved percentages
   - Updates summary UI for CURRENT MONTH
*/
function computePayroll(gross) {
    const S = getPayrollSettings();

    const lohn = gross * (S.lohnP / 100);
    const rv = gross * (S.rvP / 100);
    const a = gross * (S.extraAP / 100);
    const b = gross * (S.extraBP / 100);

    const net = gross - lohn - rv - a - b;

    /* Update UI (Current Month Summary) */
    document.getElementById("summaryDeductionLohn").textContent =
        `Lohnsteuer: €${lohn.toFixed(2)}`;

    document.getElementById("summaryDeductionRV").textContent =
        `Pension (RV): €${rv.toFixed(2)}`;

    document.getElementById("summaryDeductionA").textContent =
        `Extra A: €${a.toFixed(2)}`;

    document.getElementById("summaryDeductionB").textContent =
        `Extra B: €${b.toFixed(2)}`;

    document.getElementById("summaryNet").textContent =
        `Net Pay: €${net.toFixed(2)}`;

    return {
        lohn,
        rv,
        a,
        b,
        net
    };
}

/* ============================================================
   Export globally so app.js can use it
============================================================ */
window.computePayroll = computePayroll;
