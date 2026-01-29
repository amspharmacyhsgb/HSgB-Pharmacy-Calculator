// Anti-TB Dose Calculator

// Debounce timer for scroll
let tbScrollTimer = null;

// FDC dosing tables
const fdcDosing = {
    'akurit4': [
        { min: 30, max: 37, dose: '2 tablets daily', range: '30–37' },
        { min: 38, max: 54, dose: '3 tablets daily', range: '38–54' },
        { min: 55, max: 70, dose: '4 tablets daily', range: '55–70' },
        { min: 71, max: 9999, dose: '5 tablets daily', range: '>70' }
    ],
    'akurit2': [
        { min: 30, max: 37, dose: '2 tablets daily', range: '30–37' },
        { min: 38, max: 54, dose: '3 tablets daily', range: '38–54' },
        { min: 55, max: 70, dose: '4 tablets daily', range: '55–70' },
        { min: 71, max: 9999, dose: '5 tablets daily', range: '>70' }
    ]
};

// Rounding functions
function roundToNearest(value, nearest) {
    return Math.round(value / nearest) * nearest;
}

function roundUpToNearest(value, nearest) {
    return Math.ceil(value / nearest) * nearest;
}

// Calculate individual drug doses
function calculateDrugDose(bw, baseRatio, roundingValue, maxDose, roundUp = false) {
    let calculated = bw * baseRatio;
    let rounded;
    
    if (roundUp) {
        rounded = roundUpToNearest(calculated, roundingValue);
    } else {
        rounded = roundToNearest(calculated, roundingValue);
    }
    
    // Cap at max dose
    let warning = '';
    if (rounded > maxDose) {
        warning = '⚠️ Dose capped at maximum';
        rounded = maxDose;
    }
    
    // Calculate actual dose per kg
    let actualDosePerKg = rounded / bw;
    
    return {
        calculated: calculated,
        recommended: rounded,
        actualPerKg: actualDosePerKg,
        warning: warning
    };
}

// Get FDC dose for weight
function getFDCDose(bw, fdcType) {
    const table = fdcDosing[fdcType];
    for (let row of table) {
        if (bw >= row.min && bw <= row.max) {
            return row;
        }
    }
    return null;
}

// Drug color themes
const drugColors = {
    'akurit4': { bg: '#E8EAF6', border: '#3F51B5', text: '#1A237E' }, // Indigo
    'akurit2': { bg: '#F3E5F5', border: '#9C27B0', text: '#4A148C' }, // Purple
    'inh': { bg: '#E0F2F1', border: '#009688', text: '#004D40' },     // Teal
    'rif': { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },     // Orange
    'emb': { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20' },     // Green
    'pza': { bg: '#FCE4EC', border: '#E91E63', text: '#880E4F' }      // Pink
};

// Generate drug card HTML with new design
function generateDrugCard(drugName, shortName, bw, doseResult, doseRange, maxDose, showPyridoxine = false, colorKey = 'inh', isRenalAdjusted = false) {
    const colors = drugColors[colorKey];
    
    const frequencyNote = isRenalAdjusted ? 
        '<div class="warning-box" style="margin-top: 8px;">⚠️ Renal Adjustment: Give Every Other Day (EOD) or 3 times per week instead of daily</div>' : '';
    
    return `
        <div class="drug-card" style="border-left-color: ${colors.border}; background: ${colors.bg};">
            <div class="drug-name" style="color: ${colors.text};">${drugName} (${shortName})</div>
            
            <div class="dose-display" style="background: linear-gradient(135deg, ${colors.border} 0%, ${colors.text} 100%);">
                <div class="dose-label">Recommended Dose</div>
                <div class="dose-value">${doseResult.recommended} mg ${isRenalAdjusted ? 'EOD or 3x/week' : 'daily'}</div>
            </div>
            
            ${doseResult.warning ? `<div class="warning-box">${doseResult.warning}</div>` : ''}
            ${showPyridoxine ? `<div class="warning-box">⚠️ Give together with Tab. Pyridoxine 20 mg OD to prevent Peripheral Neuropathy</div>` : ''}
            ${frequencyNote}
            
            <div class="drug-footnotes">
                <ul>
                    <li><strong>Equivalent mg/kg:</strong> ${doseResult.actualPerKg.toFixed(2)} mg/kg (for ${bw} kg)</li>
                    <li><strong>Target dose:</strong> ${doseRange.base} mg/kg (range: ${doseRange.min}–${doseRange.max} mg/kg)</li>
                    <li><strong>Maximum dose:</strong> ${maxDose} mg/day</li>
                </ul>
            </div>
        </div>
    `;
}

// Generate FDC card HTML with color coding (compact version)
function generateFDCCard(fdcName, composition, fdcDose, showPyridoxine = false, colorKey = 'akurit4') {
    const colors = drugColors[colorKey];
    
    return `
        <div style="background: ${colors.bg}; border-radius: 10px; padding: 15px; margin-top: 10px; border-left: 5px solid ${colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 1.5em; margin-right: 10px;">💊</span>
                <div>
                    <div style="font-size: 1.05em; font-weight: 700; color: ${colors.text};">${fdcName}</div>
                    <div style="font-size: 0.78em; color: #555; margin-top: 3px;">${composition}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                <div style="font-weight: 600; color: ${colors.text}; margin-bottom: 6px; font-size: 0.9em;">
                    For body weight: <strong>${fdcDose.range} kg</strong>
                </div>
                <div style="color: ${colors.text}; font-size: 1.15em; font-weight: 700;">
                    ${fdcDose.dose}
                </div>
            </div>
            ${showPyridoxine ? `<div class="warning-box" style="margin-top: 10px;">⚠️ Give together with Tab. Pyridoxine 20 mg OD to prevent Peripheral Neuropathy</div>` : ''}
        </div>
    `;
}

// Generate toggle section HTML
function generateToggleSection(id, title, content) {
    return `
        <div class="toggle-section">
            <button class="toggle-button" onclick="toggleSection('${id}')">
                <span>${title}</span>
                <span class="toggle-arrow" id="${id}-arrow">▼</span>
            </button>
            <div class="toggle-content" id="${id}-content">
                ${content}
            </div>
        </div>
    `;
}

// Toggle section visibility
function toggleSection(id) {
    const content = document.getElementById(`${id}-content`);
    const arrow = document.getElementById(`${id}-arrow`);
    const button = document.querySelector(`button[onclick="toggleSection('${id}')"]`);
    
    const isActive = content.classList.contains('active');
    
    // Close all sections
    document.querySelectorAll('.toggle-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.toggle-arrow').forEach(el => el.classList.remove('rotated'));
    document.querySelectorAll('.toggle-button').forEach(el => el.classList.remove('active'));
    
    // Open clicked section if it wasn't active
    if (!isActive) {
        content.classList.add('active');
        arrow.classList.add('rotated');
        button.classList.add('active');
    }
}

function calculateAntiTB() {
    const bw = getNumericValue('tb-bw');
    const indication = getSelectValue('tb-indication');
    const renalFunction = getSelectValue('tb-renal');
    
    // Clear existing timer
    if (tbScrollTimer) {
        clearTimeout(tbScrollTimer);
    }
    
    // Check if all required inputs are filled
    if (!indication || !renalFunction || isNaN(bw) || bw <= 0) {
        hideElement('tb-outputs');
        return;
    }
    
    // Show outputs
    showElement('tb-outputs');
    
    const isRenalImpaired = (renalFunction === 'impaired');
    let resultsHTML = '';
    
    // TB TREATMENT
    if (indication === 'tb-treatment') {
        // Calculate all doses
        const inh = calculateDrugDose(bw, 5, 50, 300);
        const rif = calculateDrugDose(bw, 10, 150, 600);
        const emb = calculateDrugDose(bw, 15, 200, 1600, true);
        const pza = calculateDrugDose(bw, 25, 250, 2000);
        
        // Get FDC doses
        const fdc4 = getFDCDose(bw, 'akurit4');
        const fdc2 = getFDCDose(bw, 'akurit2');
        
        if (isRenalImpaired) {
            // RENAL IMPAIRED - Akurit-4 contraindicated, Akurit-2 OK, loose pills with EMB/PZA adjustments
            
            // FDC Section - Only Akurit-2 (Maintenance), Akurit-4 contraindicated
            const fdcHTML = '<div class="fdc-grid">' +
                '<div>' +
                '<div class="warning-box">⚠️ Akurit-4 is NOT recommended in renal impairment (CrCl < 30 ml/min) due to Ethambutol and Pyrazinamide content. Use loose pills for Intensive Phase.</div>' +
                '</div>' +
                '<div>' +
                (fdc2 ? generateFDCCard(
                    'Akurit-2 (Maintenance Phase)',
                    'Each tablet contains: Rifampicin 150mg, Isoniazid 75mg',
                    fdc2,
                    true,
                    'akurit2'
                ) + '<div style="margin-top: 10px; font-size: 0.9em; color: #2E7D32; font-weight: 500;">✓ Safe in renal impairment - contains only INH and RIF</div>' : '<div class="warning-box">Body weight below 30 kg - FDC not recommended.</div>') +
                '</div>' +
                '</div>';
            
            // Loose Pills Section
            const loosePillsHTML = '<div class="warning-box" style="margin-bottom: 12px;">For Intensive Phase (HREZ), use loose pills with dosing adjustments below:</div>' +
                '<div class="drugs-grid">' +
                generateDrugCard('Isoniazid', 'INH/H', bw, inh, {base: 5, min: 4, max: 6}, 300, true, 'inh', false) +
                generateDrugCard('Rifampicin', 'RIF/R', bw, rif, {base: 10, min: 8, max: 12}, 600, false, 'rif', false) +
                generateDrugCard('Ethambutol', 'EMB/E', bw, emb, {base: 15, min: 15, max: 20}, 1600, false, 'emb', true) +
                generateDrugCard('Pyrazinamide', 'PZA/Z', bw, pza, {base: 25, min: 20, max: 30}, 2000, false, 'pza', true) +
                '</div>';
            
            const durationHTML = `
                <div class="duration-box">
                    <div class="duration-label">Treatment Duration</div>
                    <div class="duration-value">
                        <strong>Intensive Phase:</strong> 2 months (loose pills)<br>
                        <strong>Maintenance Phase:</strong> 4–10 months (Akurit-2 or loose pills)
                    </div>
                    <div style="font-size: 0.85em; margin-top: 8px; opacity: 0.9;">
                        *Depending on indication/response
                    </div>
                </div>
            `;
            
            resultsHTML = 
                generateToggleSection('fdc-tb-renal', '💊 Fixed Dose Combination (FDC)', fdcHTML) +
                generateToggleSection('loose-tb-renal', '💊 Loose Pills (Alternative)', loosePillsHTML) +
                durationHTML;
            
        } else {
            // NORMAL RENAL FUNCTION
            const fdcHTML = '<div class="fdc-grid">' +
                '<div>' +
                (fdc4 ? generateFDCCard(
                    'Akurit-4 (Intensive Phase)',
                    'Each tablet contains: Rifampicin 150mg, Isoniazid 75mg, Ethambutol 275mg, Pyrazinamide 400mg',
                    fdc4,
                    true,
                    'akurit4'
                ) : '<div class="warning-box">Body weight below 30 kg - FDC not recommended.</div>') +
                '</div>' +
                '<div>' +
                (fdc2 ? generateFDCCard(
                    'Akurit-2 (Maintenance Phase)',
                    'Each tablet contains: Rifampicin 150mg, Isoniazid 75mg',
                    fdc2,
                    true,
                    'akurit2'
                ) : '<div class="warning-box">Body weight below 30 kg - FDC not recommended.</div>') +
                '</div>' +
                '</div>';
            
            const loosePillsHTML = '<div class="drugs-grid">' +
                generateDrugCard('Isoniazid', 'INH/H', bw, inh, {base: 5, min: 4, max: 6}, 300, true, 'inh', false) +
                generateDrugCard('Rifampicin', 'RIF/R', bw, rif, {base: 10, min: 8, max: 12}, 600, false, 'rif', false) +
                generateDrugCard('Ethambutol', 'EMB/E', bw, emb, {base: 15, min: 15, max: 20}, 1600, false, 'emb', false) +
                generateDrugCard('Pyrazinamide', 'PZA/Z', bw, pza, {base: 25, min: 20, max: 30}, 2000, false, 'pza', false) +
                '</div>';
            
            const durationHTML = `
                <div class="duration-box">
                    <div class="duration-label">Treatment Duration</div>
                    <div class="duration-value">
                        <strong>Intensive Phase:</strong> 2 months<br>
                        <strong>Maintenance Phase:</strong> 4–10 months
                    </div>
                    <div style="font-size: 0.85em; margin-top: 8px; opacity: 0.9;">
                        *Depending on indication/response
                    </div>
                </div>
            `;
            
            resultsHTML = 
                generateToggleSection('fdc-tb', '💊 Fixed Dose Combination (FDC) - Preferred', fdcHTML) +
                generateToggleSection('loose-tb', '💊 Loose Pills (Alternative)', loosePillsHTML) +
                durationHTML;
        }
    }
    
    // LTBI TREATMENT (renal function doesn't change recommendations)
    else if (indication === 'ltbi-treatment') {
        const inh = calculateDrugDose(bw, 5, 50, 300);
        const rif = calculateDrugDose(bw, 10, 150, 600);
        
        const fdc2 = getFDCDose(bw, 'akurit2');
        
        // 6-Month IPT Regimen - Only Isoniazid
        const ipt6HTML = 
            generateDrugCard('Isoniazid', 'INH/H', bw, inh, {base: 5, min: 4, max: 6}, 300, true, 'inh', false) +
            '<div class="regimen-duration">Duration: 6 months</div>';
        
        // 3-Month INH + RIF Regimen
        const inhRif3HTML = `
            <div class="option-label">Option 1: Fixed Dose Combination (Preferred)</div>
            ${fdc2 ? generateFDCCard(
                'Akurit-2',
                'Each tablet contains: Rifampicin 150mg, Isoniazid 75mg',
                fdc2,
                true,
                'akurit2'
            ) : '<div class="warning-box">Body weight below 30 kg - use loose pills.</div>'}
            
            <div class="option-label">Option 2: Loose Pills</div>
            <div class="drugs-grid">
                ${generateDrugCard('Isoniazid', 'INH/H', bw, inh, {base: 5, min: 4, max: 6}, 300, true, 'inh', false)}
                ${generateDrugCard('Rifampicin', 'RIF/R', bw, rif, {base: 10, min: 8, max: 12}, 600, false, 'rif', false)}
            </div>
            
            <div class="regimen-duration">Duration: 3 months</div>
        `;
        
        resultsHTML = 
            generateToggleSection('ipt-6m', '📅 6 months of daily Isoniazid (IPT) Regimen', ipt6HTML) +
            generateToggleSection('inh-rif-3m', '📅 3 months of daily Isoniazid & Rifampicin Regimen', inhRif3HTML);
    }
    
    // Display results
    document.getElementById('tb-results-content').innerHTML = resultsHTML;
    
    // Scroll to results immediately
    scrollToResults('tb-results-heading');
}
