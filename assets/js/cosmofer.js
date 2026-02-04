// Iron Dextran (Cosmofer) Dose Calculator

// Debounce timer for scroll
let cosmoferScrollTimer = null;

function calculateCosmofer() {
    const indication = getSelectValue('cosmofer-indication');
    const bw = getNumericValue('cosmofer-bw');
    const targetHb = getNumericValue('cosmofer-target-hb');
    const currentHb = getNumericValue('cosmofer-current-hb');

    // Clear existing timer
    if (cosmoferScrollTimer) {
        clearTimeout(cosmoferScrollTimer);
    }

    // Show/hide IDA footnote
    const idaFootnote = document.getElementById('cosmofer-ida-footnote');
    if (idaFootnote) {
        idaFootnote.style.display = indication === 'ida' ? 'block' : 'none';
    }

    // Validate inputs
    if (!indication || isNaN(bw) || isNaN(targetHb) || isNaN(currentHb)) {
        hideElement('cosmofer-outputs');
        return;
    }

    // Validation checks
    if (bw <= 0 || targetHb <= 0 || currentHb < 0) {
        hideElement('cosmofer-outputs');
        return;
    }

    if (targetHb <= currentHb) {
        alert('Target Hb should be greater than Current Hb');
        hideElement('cosmofer-outputs');
        return;
    }

    // Show outputs
    showElement('cosmofer-outputs');
    
    // Summary of Input
    const indicationText = indication === 'blood-loss' ? 'Blood loss (e.g., During labour)' : 'Iron Deficiency Anaemia (IDA)';
    const summaryHTML = `
        <div style="line-height: 1.4;">
            <strong>Indication:</strong> ${indicationText} | <strong>Body Weight:</strong> ${bw} kg | <strong>Target Hb:</strong> ${targetHb} g/dL | <strong>Current Hb:</strong> ${currentHb} g/dL
        </div>
    `;
    setHTMLContent('cosmofer-summary', summaryHTML);

    // Calculate dose
    let calculatedDose = bw * (targetHb - currentHb) * 2.4;
    let finalDose = calculatedDose;
    
    let calculatedFootnote = '';
    if (indication === 'ida') {
        finalDose += 500;
        calculatedFootnote = 'Additional dose 500 mg will be added for IDA';
    }
    
    // Display calculated dose
    setTextContent('cosmofer-calculated-dose', `${formatNumber(calculatedDose, 2)} mg`);
    setTextContent('cosmofer-calculated-footnote', calculatedFootnote);

    // Round to nearest 100 mg
    const roundedDose = Math.ceil(finalDose / 100) * 100;
    setTextContent('cosmofer-final-dose', `${roundedDose} mg`);

    // Calculate dose per body weight
    const dosePerBw = roundedDose / bw;
    setTextContent('cosmofer-dose-per-bw', `${formatNumber(dosePerBw, 2)} mg/kg`);

    // Determine remarks with detailed dosing split
    let remarks = '';
    if (dosePerBw <= 20) {
        remarks = 'Dose is ≤ 20 mg/kg - may be administered as a single dose';
    } else {
        // Round first dose (20 mg/kg) down to nearest 100 mg
        const firstDoseRaw = bw * 20;
        const firstDose = Math.floor(firstDoseRaw / 100) * 100;
        const remainder = roundedDose - firstDose;
        remarks = `Dose is > 20 mg/kg, suggest to administer ${firstDose} mg (20 mg/kg) in the 1st infusion, then the remainder (${remainder} mg) in the 2nd infusion.<br><br>`;
        remarks += '<div onclick="scrollToGapRule()" style="background: #FFF9E6; border: 2px solid #FFB74D; border-radius: 8px; padding: 10px; margin-top: 8px; color: #E65100; font-weight: 600; cursor: pointer; transition: background 0.3s;" onmouseover="this.style.background=\'#FFF3D6\'" onmouseout="this.style.background=\'#FFF9E6\'">📌 Refer to Gap Rule for Multiple CosmoFer® (IV Iron Dextran) Infusions (Click to view)</div>';
    }
    setHTMLContent('cosmofer-remarks', remarks);
    
    // Scroll to results after a short delay (800ms)
    cosmoferScrollTimer = setTimeout(() => {
        scrollToResults('cosmofer-results-heading');
    }, 800);
}

// Function to scroll to and expand Gap Rule section
function scrollToGapRule() {
    const gapRuleContent = document.getElementById('gap-rule');
    const gapRuleIcon = document.getElementById('gap-rule-icon');
    
    // Expand the section
    if (gapRuleContent && gapRuleIcon) {
        gapRuleContent.style.display = 'block';
        gapRuleIcon.textContent = '▼';
    }
    
    // Scroll to the section
    const gapRuleHeader = document.querySelector('[onclick="toggleSection(\'gap-rule\')"]');
    if (gapRuleHeader) {
        gapRuleHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
