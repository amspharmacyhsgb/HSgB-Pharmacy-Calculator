// Iron Dextran (Cosmofer) Dose Calculator

// Debounce timer for scroll
let cosmoferScrollTimer = null;

function updateCosmoferRadioStyle() {
    const selected = document.querySelector('input[name="cosmofer-indication"]:checked')?.value;
    ['blood-loss', 'ida'].forEach(val => {
        const label = document.getElementById(`cosmofer-radio-label-${val}`);
        if (label) {
            if (selected === val) {
                label.style.borderColor = '#003d82';
                label.style.background = '#e8f0fe';
            } else {
                label.style.borderColor = '#e0e0e0';
                label.style.background = '#f8f9fb';
            }
        }
    });
}

function calculateCosmofer() {
    const indicationInput = document.querySelector('input[name="cosmofer-indication"]:checked');
    const indication = indicationInput ? indicationInput.value : '';
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
    const roundedDose = Math.round(finalDose / 100) * 100;
    setTextContent('cosmofer-final-dose', `${roundedDose} mg`);

    // Calculate dose per body weight
    const dosePerBw = roundedDose / bw;
    setTextContent('cosmofer-dose-per-bw', `${formatNumber(dosePerBw, 2)} mg/kg`);

    const splitAlert = document.getElementById('cosmofer-split-alert');
    const remarksCard = document.getElementById('cosmofer-remarks-card');

    if (dosePerBw <= 20) {
        // Hide alert card, show normal remarks
        if (splitAlert) splitAlert.style.display = 'none';
        if (remarksCard) remarksCard.style.display = 'block';
        setHTMLContent('cosmofer-remarks', 'Dose is ≤ 20 mg/kg — may be administered as a single dose');
    } else {
        // Round first dose (20 mg/kg) down to nearest 100 mg
        const firstDoseRaw = bw * 20;
        const firstDose = Math.floor(firstDoseRaw / 100) * 100;
        const remainder = roundedDose - firstDose;
        const rawDays = (firstDose / 100) * 1.16;
        const lowerDays = Math.round(rawDays);
        const upperDays = Math.ceil(lowerDays / 7) * 7;
        const gapLabel = lowerDays === upperDays
            ? `~${lowerDays} days`
            : `~${lowerDays}–${upperDays} days`;

        // Hide remarks, show alert card
        if (remarksCard) remarksCard.style.display = 'none';
        if (splitAlert) {
            splitAlert.style.display = 'block';
            splitAlert.innerHTML = `
                <div style="background: linear-gradient(135deg, #fff3e0, #fff8e1); border: 2px solid #f57c00; border-left: 5px solid #e65100; border-radius: 10px; padding: 14px;">
                    <div style="font-size:0.85em; font-weight:700; color:#bf360c; margin-bottom:12px;">
                        ⚠️ Dose exceeds 20 mg/kg — must be split across two separate infusions
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                        <div style="background:white; border-radius:8px; padding:10px 12px; border:1px solid #ffcc80; text-align:center;">
                            <div style="font-size:0.65em; font-weight:700; text-transform:uppercase; color:#888; margin-bottom:3px;">1st Infusion</div>
                            <div style="font-size:1.1em; font-weight:700; color:#bf360c;">${firstDose} mg</div>
                            <div style="font-size:0.68em; color:#777; margin-top:2px;">Administer today</div>
                        </div>
                        <div style="background:white; border-radius:8px; padding:10px 12px; border:1px solid #ffcc80; text-align:center;">
                            <div style="font-size:0.65em; font-weight:700; text-transform:uppercase; color:#888; margin-bottom:3px;">2nd Infusion</div>
                            <div style="font-size:1.1em; font-weight:700; color:#bf360c;">${remainder} mg</div>
                            <div style="font-size:0.68em; color:#777; margin-top:2px;">After waiting period</div>
                        </div>
                    </div>
                    <div style="background:#e65100; color:white; border-radius:6px; padding:8px 12px; font-size:0.78em; font-weight:600; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
                        ⏱ <span style="opacity:0.85; font-weight:400;">Wait before 2nd infusion:</span>&nbsp;${gapLabel} after 1st dose
                    </div>
                    <div onclick="scrollToIntervalGuide()" style="background:white; border:1px solid #e0e0e0; border-radius:8px; padding:8px 12px; font-size:0.75em; color:#555; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <span style="color:#003d82; font-size:0.85em;">▶</span>
                        📌 Interval Between Infusions — view reference guide
                    </div>
                </div>
            `;
        }
    }
    
    // Scroll to results after a short delay (800ms)
    cosmoferScrollTimer = setTimeout(() => {
        scrollToResults('cosmofer-results-heading');
    }, 800);
}

// Function to scroll to and expand interval guide section
function scrollToIntervalGuide() {
    const gapRuleContent = document.getElementById('gap-rule');
    const gapRuleIcon = document.getElementById('gap-rule-icon');
    
    if (gapRuleContent && gapRuleIcon) {
        gapRuleContent.style.display = 'block';
        gapRuleIcon.textContent = '▼';
    }
    
    const gapRuleHeader = document.querySelector('[onclick="toggleSection(\'gap-rule\')"]');
    if (gapRuleHeader) {
        gapRuleHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Keep old name as alias for any residual references
function scrollToGapRule() { scrollToIntervalGuide(); }

