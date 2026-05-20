// NAC Dose Calculator

// Debounce timer for scroll
let nacScrollTimer = null;

// Returns a display string for the infusion rate of a single bag
function getBagRate(bag) {
    const r1 = n => Math.round(n * 10) / 10;
    const nacVol = r1(bag.doseCalc / 200);
    const isUndiluted = bag.diluent === 'No diluent needed (UNDILUTED)';

    if (isUndiluted) {
        const m = bag.duration.match(/(\d+(?:\.\d+)?)\s*hour/);
        const hrs = m ? parseFloat(m[1]) : 1;
        return `${r1(nacVol / hrs)} mL/hr`;
    }

    const dm = bag.diluent.match(/^(\d+(?:\.\d+)?)\s*mL/);
    const dilML = dm ? parseFloat(dm[1]) : 0;

    if (dilML === 1000) return '62.5 mL/hr';

    if (bag.duration.includes('15 minutes or 1 hour')) {
        return `${r1(dilML / 0.25)} mL/hr (15 min) or ${r1(dilML / 1)} mL/hr (1 hr)`;
    }

    const hm = bag.duration.match(/(\d+(?:\.\d+)?)\s*hour/);
    const hrs = hm ? parseFloat(hm[1]) : 1;
    return `${r1(dilML / hrs)} mL/hr`;
}

// Returns ordinal string: 1 → "1st", 4 → "4th", etc.
function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateNACUI() {
    const indication = getSelectValue('nac-indication');
    const ageGroup = getSelectValue('nac-age-group');
    const regimenGroup = document.getElementById('nac-regimen-group');
    const regimenSelect = document.getElementById('nac-regimen');
    const paedsWarning = document.getElementById('nac-paeds-warning');
    
    // Hide outputs
    hideElement('nac-outputs');
    paedsWarning.style.display = 'none';
    
    // Clear regimen options
    regimenSelect.innerHTML = '<option value="">Select Regimen</option>';
    
    if (!indication || !ageGroup) {
        hideElement('nac-regimen-group');
        return;
    }
    
    // Show warning for Non-Paracetamol + Paeds
    if (indication === 'liver-failure' && ageGroup === 'paeds') {
        paedsWarning.style.display = 'block';
        hideElement('nac-regimen-group');
        return;
    }
    
    // Show regimen dropdown
    showElement('nac-regimen-group');
    
    // Populate regimen options based on indication and age
    if (indication === 'paracetamol') {
        regimenSelect.innerHTML += '<option value="2-bags" style="color: #2E7D32; font-weight: 600;">2 bags infusion (preferred)</option>';
        regimenSelect.innerHTML += '<option value="3-bags">3 bags infusion</option>';
    } else if (indication === 'liver-failure' && ageGroup === 'adult') {
        regimenSelect.innerHTML += '<option value="icu">ICU / Fluid Restricted Patient</option>';
        regimenSelect.innerHTML += '<option value="non-icu">Non-ICU / No Fluid Restriction</option>';
    }
    
    calculateNAC();
}

function calculateNAC() {
    const indication = getSelectValue('nac-indication');
    const ageGroup = getSelectValue('nac-age-group');
    const weight = getNumericValue('nac-weight');
    const regimen = getSelectValue('nac-regimen');
    const weightWarning = document.getElementById('nac-weight-warning');
    
    // Clear existing timer
    if (nacScrollTimer) {
        clearTimeout(nacScrollTimer);
    }
    
    // Check weight warning
    if (!isNaN(weight) && weight > 110) {
        weightWarning.style.display = 'block';
        hideElement('nac-outputs');
        hideElement('nac-separator');
        return;
    } else {
        weightWarning.style.display = 'none';
    }
    
    // Validate inputs
    if (!indication || !ageGroup || isNaN(weight) || weight <= 0 || !regimen) {
        hideElement('nac-outputs');
        hideElement('nac-separator');
        return;
    }
    
    // Show visual separator
    showElement('nac-separator');
    
    // Cap weight at 110 kg
    const calcWeight = Math.min(weight, 110);
    
    let bags = [];
    let regimenText = '';
    let reminderText = '';
    
    // Calculate based on indication, age group, and regimen
    if (indication === 'paracetamol') {
        reminderText = '<strong>Reminder:</strong> Repeat TDM/LFT after finishing the final bag infusion.';
        
        if (ageGroup === 'adult') {
            if (regimen === '2-bags') {
                regimenText = '2 bags infusion (preferred)';
                bags = [
                    {
                        label: 'Bag 1',
                        dose: `200 mg/kg`,
                        doseCalc: Math.round(200 * calcWeight),
                        diluent: '500 mL',
                        duration: '4 hours'
                    },
                    {
                        label: 'Bag 2',
                        dose: `100 mg/kg`,
                        doseCalc: Math.round(100 * calcWeight),
                        diluent: '1000 mL',
                        duration: '16 hours'
                    }
                ];
            } else if (regimen === '3-bags') {
                regimenText = '3 bags infusion';
                bags = [
                    {
                        label: 'Bag 1',
                        dose: `150 mg/kg`,
                        doseCalc: Math.round(150 * calcWeight),
                        diluent: '200 mL',
                        duration: '1 hour'
                    },
                    {
                        label: 'Bag 2',
                        dose: `50 mg/kg`,
                        doseCalc: Math.round(50 * calcWeight),
                        diluent: '500 mL',
                        duration: '4 hours'
                    },
                    {
                        label: 'Bag 3',
                        dose: `100 mg/kg`,
                        doseCalc: Math.round(100 * calcWeight),
                        diluent: '1000 mL',
                        duration: '16 hours'
                    }
                ];
            }
        } else if (ageGroup === 'paeds') {
            if (regimen === '2-bags') {
                regimenText = '2 bags infusion (preferred)';
                bags = [
                    {
                        label: 'Bag 1',
                        dose: `200 mg/kg`,
                        doseCalc: Math.round(200 * calcWeight),
                        diluent: `${Math.round(3 * calcWeight)} mL (3 mL/kg)`,
                        duration: '4 hours'
                    },
                    {
                        label: 'Bag 2',
                        dose: `100 mg/kg`,
                        doseCalc: Math.round(100 * calcWeight),
                        diluent: `${Math.round(7 * calcWeight)} mL (7 mL/kg)`,
                        duration: '16 hours'
                    }
                ];
            } else if (regimen === '3-bags') {
                regimenText = '3 bags infusion';
                if (calcWeight < 20) {
                    bags = [
                        {
                            label: 'Bag 1',
                            dose: `150 mg/kg`,
                            doseCalc: Math.round(150 * calcWeight),
                            diluent: `${Math.round(3 * calcWeight)} mL (3 mL/kg)`,
                            duration: '1 hour'
                        },
                        {
                            label: 'Bag 2',
                            dose: `50 mg/kg`,
                            doseCalc: Math.round(50 * calcWeight),
                            diluent: `${Math.round(7 * calcWeight)} mL (7 mL/kg)`,
                            duration: '4 hours'
                        },
                        {
                            label: 'Bag 3',
                            dose: `100 mg/kg`,
                            doseCalc: Math.round(100 * calcWeight),
                            diluent: `${Math.round(14 * calcWeight)} mL (14 mL/kg)`,
                            duration: '16 hours'
                        }
                    ];
                } else if (calcWeight >= 20 && calcWeight <= 40) {
                    bags = [
                        {
                            label: 'Bag 1',
                            dose: `150 mg/kg`,
                            doseCalc: Math.round(150 * calcWeight),
                            diluent: '100 mL',
                            duration: '1 hour'
                        },
                        {
                            label: 'Bag 2',
                            dose: `50 mg/kg`,
                            doseCalc: Math.round(50 * calcWeight),
                            diluent: '250 mL',
                            duration: '4 hours'
                        },
                        {
                            label: 'Bag 3',
                            dose: `100 mg/kg`,
                            doseCalc: Math.round(100 * calcWeight),
                            diluent: '500 mL',
                            duration: '16 hours'
                        }
                    ];
                } else { // > 40 kg - follow adult
                    bags = [
                        {
                            label: 'Bag 1',
                            dose: `150 mg/kg`,
                            doseCalc: Math.round(150 * calcWeight),
                            diluent: '200 mL',
                            duration: '1 hour'
                        },
                        {
                            label: 'Bag 2',
                            dose: `50 mg/kg`,
                            doseCalc: Math.round(50 * calcWeight),
                            diluent: '500 mL',
                            duration: '4 hours'
                        },
                        {
                            label: 'Bag 3',
                            dose: `100 mg/kg`,
                            doseCalc: Math.round(100 * calcWeight),
                            diluent: '1000 mL',
                            duration: '16 hours'
                        }
                    ];
                }
            }
        }
    } else if (indication === 'liver-failure' && ageGroup === 'adult') {
        if (regimen === 'icu') {
            regimenText = 'ICU / Fluid Restricted Patient';
            bags = [
                {
                    label: 'Bag 1',
                    dose: `150 mg/kg`,
                    doseCalc: Math.round(150 * calcWeight),
                    diluent: 'No diluent needed (UNDILUTED)',
                    duration: '1 hour'
                },
                {
                    label: 'Bag 2',
                    dose: `50 mg/kg`,
                    doseCalc: Math.round(50 * calcWeight),
                    diluent: 'No diluent needed (UNDILUTED)',
                    duration: '4 hours'
                },
                {
                    label: 'Bag 3',
                    dose: `100 mg/kg`,
                    doseCalc: Math.round(100 * calcWeight),
                    diluent: 'No diluent needed (UNDILUTED)',
                    duration: '16 hours'
                }
            ];
        } else if (regimen === 'non-icu') {
            regimenText = 'Non-ICU / No Fluid Restriction';
            bags = [
                {
                    label: 'Bag 1',
                    dose: `150 mg/kg`,
                    doseCalc: Math.round(150 * calcWeight),
                    diluent: '200 mL',
                    duration: '15 minutes or 1 hour'
                },
                {
                    label: 'Bag 2',
                    dose: `50 mg/kg`,
                    doseCalc: Math.round(50 * calcWeight),
                    diluent: '500 mL',
                    duration: '4 hours'
                },
                {
                    label: 'Bag 3',
                    dose: `100 mg/kg`,
                    doseCalc: Math.round(100 * calcWeight),
                    diluent: '1000 mL',
                    duration: '16 hours'
                }
            ];
        }
    }
    
    // Display outputs
    showElement('nac-outputs');
    
    // Summary - more compact
    const indicationText = indication === 'paracetamol' ? 'Paracetamol Poisoning' : 'Non-Paracetamol Acute Liver Failure';
    const ageText = ageGroup === 'adult' ? 'Adults' : 'Paeds';
    const summaryHTML = `
        <div style="line-height: 1.4;">
            <strong>Indication:</strong> ${indicationText} | <strong>Age:</strong> ${ageText} | <strong>Weight:</strong> ${calcWeight} kg | <strong>Regimen:</strong> ${regimenText}
        </div>
    `;
    setHTMLContent('nac-summary', summaryHTML);
    
    // Regimen display (without weight calculations) - more compact
    let regimenDisplayHTML = '<div style="line-height: 1.5;">';
    bags.forEach((bag, index) => {
        // For paeds, show simplified diluent without calculated volume
        let diluentDisplay = bag.diluent;
        if (ageGroup === 'paeds' && regimen === '2-bags') {
            diluentDisplay = bag.label === 'Bag 1' ? '3 mL/kg diluent' : '7 mL/kg diluent';
        } else if (ageGroup === 'paeds' && regimen === '3-bags' && calcWeight < 20) {
            if (bag.label === 'Bag 1') diluentDisplay = '3 mL/kg diluent';
            else if (bag.label === 'Bag 2') diluentDisplay = '7 mL/kg diluent';
            else diluentDisplay = '14 mL/kg diluent';
        }
        
        // Fix sentence structure for UNDILUTED
        if (bag.diluent === 'No diluent needed (UNDILUTED)') {
            regimenDisplayHTML += `<strong>${bag.label}:</strong> ${bag.dose} over ${bag.duration}, ${bag.diluent}`;
        } else {
            // Add "diluent" word after mL for adult doses
            let displayText = diluentDisplay;
            if (ageGroup === 'adult' && !displayText.includes('diluent')) {
                displayText = displayText + ' diluent';
            }
            regimenDisplayHTML += `<strong>${bag.label}:</strong> ${bag.dose} in ${displayText} over ${bag.duration}`;
        }
        
        if (index < bags.length - 1) regimenDisplayHTML += ' | ';
    });
    regimenDisplayHTML += '</div>';
    setHTMLContent('nac-regimen-display', regimenDisplayHTML);
    
    // Store bags data globally for copy function
    window.currentBags = bags;
    
    // Bags container (with calculated doses) - dark blue with white text
    let bagsHTML = '';
    
    bags.forEach((bag, index) => {
        bagsHTML += `
            <div style="background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%); border: 2px solid #0D47A1; border-radius: 10px; padding: 15px; margin: 10px 0; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">
                <div style="font-weight: 700; color: white; font-size: 1.05em; margin-bottom: 8px;">
                    ${bag.label}
                </div>
                <div style="color: white; font-size: 0.95em; line-height: 1.5;">
                    <strong>Dose:</strong> ${bag.doseCalc} mg (${bag.dose})<br>
                    <strong>Diluent:</strong> ${bag.diluent}<br>
                    <strong>Duration:</strong> ${bag.duration}<br>
                    <strong>Rate:</strong> ${getBagRate(bag)}
                </div>
            </div>
        `;
        
        // Add "followed by" separator between bags
        if (index < bags.length - 1) {
            bagsHTML += `
                <div style="text-align: center; margin: 10px 0; font-style: italic; color: #666; font-size: 0.9em;">
                    ↓ followed by ↓
                </div>
            `;
        }
    });
    document.getElementById('nac-bags-container').innerHTML = bagsHTML;
    
    // Calculate total dose and vials needed
    const totalDose = bags.reduce((sum, bag) => sum + bag.doseCalc, 0);
    const vialsNeeded = Math.ceil(totalDose / 5000); // Each vial is 5g = 5000mg
    
    setTextContent('nac-total-dose', `${totalDose} mg`);
    setTextContent('nac-vials-needed', `${vialsNeeded} vials`);
    
    // Clinical notes - reorganized format with bold title
    let clinicalNotes = `**IV NAC Infusion**\n\n`;
    clinicalNotes += `Indication: ${indicationText}\n`;
    clinicalNotes += `Age Category: ${ageText}\n`;
    clinicalNotes += `Weight: ${calcWeight} kg\n`;
    clinicalNotes += `Regimen: ${regimenText}\n\n`;
    clinicalNotes += `**Calculated NAC Dose based on Weight:**\n`;
    
    let hasUndiluted = false;
    let hasDiluted = false;
    
    bags.forEach(bag => {
        // Format diluent for paeds
        let diluentText = bag.diluent;
        
        if (bag.diluent === 'No diluent needed (UNDILUTED)') {
            hasUndiluted = true;
            // Fixed sentence structure for UNDILUTED
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) over ${bag.duration}, ${bag.diluent} | Rate: ${getBagRate(bag)}\n`;
        } else {
            hasDiluted = true;
            if (ageGroup === 'paeds' && bag.diluent.includes('mL/kg')) {
                const match = bag.diluent.match(/(\d+) mL \((\d+) mL\/kg\)/);
                if (match) {
                    diluentText = `${match[1]} mL diluent (${match[2]} mL/kg)`;
                }
            } else if (ageGroup === 'paeds') {
                // For fixed volumes in paeds (20-40kg, >40kg)
                diluentText = `${bag.diluent} diluent`;
            } else if (ageGroup === 'adult') {
                // Add "diluent" word for adult doses
                diluentText = `${bag.diluent} diluent`;
            }
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) in ${diluentText} over ${bag.duration} | Rate: ${getBagRate(bag)}\n`;
        }
    });
    
    // Add Remarks section only if dilution is required
    if (hasDiluted) {
        clinicalNotes += `\n**Remarks:**\n`;
        clinicalNotes += `Diluents: D5 (more preferred) or NS\n`;
        clinicalNotes += `Stability: 24 hrs after dilution (<30°C)\n`;
    }

    // Show/hide diluent & stability lines in Important Information section
    const infoDialuents = document.getElementById('nac-info-diluents');
    const infoStability = document.getElementById('nac-info-stability');
    const infoContainer = document.getElementById('nac-info-container');
    if (infoDialuents) infoDialuents.style.display = hasDiluted ? '' : 'none';
    if (infoStability) infoStability.style.display = hasDiluted ? '' : 'none';
    if (infoContainer) infoContainer.style.display = hasDiluted ? '' : 'none';
    
    // Render with bold formatting
    const formattedNotes = clinicalNotes.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    document.getElementById('nac-clinical-notes').innerHTML = formattedNotes.replace(/\n/g, '<br>');
    
    // Reminder
    setHTMLContent('nac-reminder', reminderText);
    
    // Generate nurse preparation guide
    generateAndRenderNurseGuide(bags, calcWeight, ageGroup, indication);

    // Scroll to results after a short delay (800ms)
    nacScrollTimer = setTimeout(() => {
        scrollToResults('nac-results-heading');
    }, 800);
}

function copyNotes() {
    // Get the plain text version with actual formatting that pastes as bold
    const indication = getSelectValue('nac-indication');
    const ageGroup = getSelectValue('nac-age-group');
    const weight = Math.min(getNumericValue('nac-weight'), 110);
    const regimen = getSelectValue('nac-regimen');
    
    const indicationText = indication === 'paracetamol' ? 'Paracetamol Poisoning' : 'Non-Paracetamol Acute Liver Failure';
    const ageText = ageGroup === 'adult' ? 'Adults' : 'Paeds';
    
    let regimenText = '';
    if (indication === 'paracetamol') {
        regimenText = regimen === '2-bags' ? '2 bags infusion (preferred)' : '3 bags infusion';
    } else if (indication === 'liver-failure') {
        regimenText = regimen === 'icu' ? 'ICU / Fluid Restricted Patient' : 'Non-ICU / No Fluid Restriction';
    }
    
    // Reconstruct bags data for copy
    const bags = window.currentBags || [];
    
    // Use uppercase and underscores for emphasis since bold doesn't paste well
    let clinicalNotes = `IV NAC INFUSION\n\n`;
    clinicalNotes += `Indication: ${indicationText}\n`;
    clinicalNotes += `Age Category: ${ageText}\n`;
    clinicalNotes += `Weight: ${weight} kg\n`;
    clinicalNotes += `Regimen: ${regimenText}\n\n`;
    clinicalNotes += `CALCULATED NAC DOSE BASED ON WEIGHT:\n`;
    
    let hasUndiluted = false;
    let hasDiluted = false;
    
    bags.forEach(bag => {
        let diluentText = bag.diluent;
        
        if (bag.diluent === 'No diluent needed (UNDILUTED)') {
            hasUndiluted = true;
            // Fixed sentence structure for UNDILUTED
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) over ${bag.duration}, ${bag.diluent}\n`;
        } else {
            hasDiluted = true;
            if (ageGroup === 'paeds' && bag.diluent.includes('mL/kg')) {
                const match = bag.diluent.match(/(\d+) mL \((\d+) mL\/kg\)/);
                if (match) {
                    diluentText = `${match[1]} mL diluent (${match[2]} mL/kg)`;
                }
            } else if (ageGroup === 'paeds') {
                diluentText = `${bag.diluent} diluent`;
            } else if (ageGroup === 'adult') {
                // Add "diluent" word for adult doses
                diluentText = `${bag.diluent} diluent`;
            }
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) in ${diluentText} over ${bag.duration}\n`;
        }
    });
    
    // Add Remarks section only if dilution is required
    if (hasDiluted) {
        clinicalNotes += `\nREMARKS:\n`;
        clinicalNotes += `Diluents: D5 (more preferred) or NS\n`;
        clinicalNotes += `Stability: 24 hrs after dilution (<30°C)\n`;
    }
    
    navigator.clipboard.writeText(clinicalNotes).then(() => {
        const btn = document.getElementById('nac-copy-btn');
        const originalText = btn.innerHTML;
        
        // Change button text
        btn.innerHTML = '✓ Copied!';
        btn.style.background = 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)';
        
        // Reset after 2 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        const btn = document.getElementById('nac-copy-btn');
        const originalText = btn.innerHTML;
        
        // Show error in button
        btn.innerHTML = '✗ Failed';
        btn.style.background = 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)';
        
        // Reset after 2 seconds
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        }, 2000);
    });
}

// ─────────────────────────────────────────────
// Nurse Preparation & Administration Guide
// ─────────────────────────────────────────────

// Helper: build one numbered step row
function buildStep(num, icon, title, content) {
    return `
        <div class="nac-step">
            <span class="nac-step-num">${num}</span>
            <span class="nac-step-icon">${icon}</span>
            <div class="nac-step-content">
                <div class="nac-step-title">${title}</div>
                <div>${content}</div>
            </div>
        </div>`;
}

function generateAndRenderNurseGuide(bags, calcWeight, ageGroup, indication) {
    const guideContainer = document.getElementById('nac-nurse-guide');
    if (!guideContainer) return;

    // ── Helpers ──────────────────────────────────────────────────

    const r1 = n => Math.round(n * 10) / 10;
    const r2 = n => Math.round(n * 100) / 100;
    const mgToG = mg => r2(mg / 1000);

    function parseDiluentML(dilStr) {
        if (!dilStr || dilStr.includes('UNDILUTED')) return 0;
        const m = dilStr.match(/^(\d+(?:\.\d+)?)\s*mL/);
        return m ? parseFloat(m[1]) : 0;
    }

    function parseDuration(durStr) {
        if (durStr.includes('15 minutes or 1 hour')) return { special: true };
        const m = durStr.match(/(\d+(?:\.\d+)?)\s*hour/);
        return { special: false, hours: m ? parseFloat(m[1]) : 1 };
    }

    // Describes how many vials are needed and what to draw from each
    function vialDesc(nacVol) {
        const vol       = r1(nacVol);
        const fullVials = Math.floor(vol / 25);
        const remainder = r1(vol - fullVials * 25);
        if (fullVials === 0) {
            return {
                html:  `<strong>1 vial</strong> — draw out <strong>${vol} mL</strong> from it`,
                plain: `1 vial — draw out ${vol} mL from it`
            };
        } else if (remainder === 0) {
            const s = fullVials > 1 ? 's' : '';
            return {
                html:  `<strong>${fullVials} full vial${s}</strong> — use the entire contents (${fullVials} × 25 mL = <strong>${fullVials * 25} mL</strong> total)`,
                plain: `${fullVials} full vial${s} — use entire contents (${fullVials} × 25 mL = ${fullVials * 25} mL total)`
            };
        } else {
            const s = fullVials > 1 ? 's' : '';
            return {
                html:  `<strong>${fullVials + 1} vials</strong> — use all <strong>${fullVials * 25} mL</strong> from the first ${fullVials > 1 ? fullVials + ' vials' : 'vial'}, then draw <strong>${remainder} mL</strong> from the ${ordinal(fullVials + 1)} vial`,
                plain: `${fullVials + 1} vials — use all ${fullVials * 25} mL from the first ${fullVials > 1 ? fullVials + ' vials' : 'vial'}, then draw ${remainder} mL from the ${ordinal(fullVials + 1)} vial`
            };
        }
    }

    const NAC_CONC   = 200; // mg/mL — 5 g per 25 mL vial
    const isUndiluted = bags.every(b => b.diluent === 'No diluent needed (UNDILUTED)');

    // ── Paediatric: referral note only ────────────────────────────
    if (ageGroup === 'paeds') {
        guideContainer.innerHTML = `
            <div style="background:white; border-radius:8px; padding:12px; font-size:0.9em; color:#555; line-height:1.6; border-left:4px solid #E65100;">
                ℹ️ For paediatric patients, dilution volumes are weight-based and may require small-volume preparation techniques.
                Please refer to the <strong>Paediatric Pharmacy / Nursing Protocol</strong> for step-by-step preparation instructions.
            </div>`;
        return;
    }

    // ── Build instructions for each bag ──────────────────────────
    let guideHTML  = '';
    let plainLines = [];

    plainLines.push('NURSE PREPARATION & ADMINISTRATION NOTE');
    plainLines.push('NAC (N-Acetylcysteine) — 200 mg/mL  |  5 g per 25 mL vial');
    plainLines.push('Diluent: D5W (preferred) or Normal Saline (NS)');

    bags.forEach((bag) => {
        const nacVol     = r1(bag.doseCalc / NAC_CONC);
        const nacG       = mgToG(bag.doseCalc);
        const diluentML  = parseDiluentML(bag.diluent);
        const dur        = parseDuration(bag.duration);
        const isSplitBag = diluentML === 1000;
        const vd         = isUndiluted ? null : vialDesc(nacVol);

        // ── Infusion rate ──
        // Rate is based on the FINAL stated bag volume (nurse removes nacVol from
        // the bag first, then adds NAC back, so the total volume stays as stated)
        let rateHTML  = '';
        let ratePlain = '';

        if (isUndiluted) {
            const rate = r1(nacVol / dur.hours);
            rateHTML  = `Set rate to <strong>${rate} mL/hr</strong> over ${bag.duration}`;
            ratePlain = `Set rate to ${rate} mL/hr over ${bag.duration}`;
        } else if (isSplitBag) {
            const rate = r1(500 / 8);   // each pint = 500 mL over 8 hours
            rateHTML  = `Infuse <strong>Pint 1</strong> first. Once finished, connect and infuse <strong>Pint 2</strong> at the same rate. Set rate to <strong>${rate} mL/hr</strong> for each pint (8 hours per pint — 16 hours total)`;
            ratePlain = `Infuse Pint 1 first, then Pint 2, at ${rate} mL/hr each (8 hours per pint, 16 hours total)`;
        } else if (dur.special) {
            const rate15  = r1(diluentML / 0.25);
            const rate1hr = r1(diluentML / 1);
            rateHTML  = `Set rate to <strong>${rate15} mL/hr</strong> if infusing over 15 minutes, <em>or</em> <strong>${rate1hr} mL/hr</strong> if infusing over 1 hour — follow the doctor's instruction`;
            ratePlain = `Set rate to ${rate15} mL/hr (15-min option) or ${rate1hr} mL/hr (1-hour option) — follow doctor's instruction`;
        } else {
            const rate = r1(diluentML / dur.hours);
            rateHTML  = `Set rate to <strong>${rate} mL/hr</strong> over ${bag.duration}`;
            ratePlain = `Set rate to ${rate} mL/hr over ${bag.duration}`;
        }

        plainLines.push('');
        plainLines.push('─'.repeat(50));
        plainLines.push(`${bag.label.toUpperCase()} — ${bag.doseCalc.toLocaleString()} mg  (${nacG} g)  of NAC`);

        // ── What you need block ──
        let needsHTML  = '';
        let needsPlain = '';
        if (!isUndiluted && vd) {
            const bagDesc = isSplitBag
                ? '2 × 500 mL bags of D5W or NS'
                : `1 × ${diluentML} mL bag of D5W or NS`;
            needsHTML = `
                <div style="background:#E3F2FD; border-radius:6px; padding:9px 12px; margin-bottom:12px; font-size:0.88em; color:#0D47A1; border-left:3px solid #1565C0; line-height:1.6;">
                    <strong>📦 What you need for this bag:</strong><br>
                    • NAC vials: ${vd.html}<br>
                    • Diluent: ${bagDesc}
                </div>`;
            needsPlain = `What you need: NAC — ${vd.plain} | Diluent — ${bagDesc}`;
            plainLines.push(needsPlain);
        }

        // ── Steps ──
        let stepsHTML = '';

        if (isUndiluted) {
            // ── Undiluted (ICU) ──────────────────────────────
            stepsHTML =
                buildStep(1, '💉', 'Draw out the NAC dose',
                    `Using a syringe, draw out <strong>${nacVol} mL (${nacG} g)</strong> of NAC from the vial(s).<br>
                    <span style="color:#888;font-size:0.85em;">(How we get this: ${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL)</span>`) +
                buildStep(2, 'ℹ️', 'No dilution needed for this regimen',
                    `This bag is given <strong>undiluted</strong> — straight from the vial. Load the drawn-up syringe into a <strong>syringe pump</strong>.`) +
                buildStep(3, '⏱️', 'Start the infusion',
                    rateHTML);

            plainLines.push(`Step 1: Using a syringe, draw out ${nacVol} mL (${nacG} g) of NAC`);
            plainLines.push(`        [${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL]`);
            plainLines.push(`Step 2: No dilution needed — load syringe directly into a syringe pump`);
            plainLines.push(`Step 3: ${ratePlain}`);

        } else if (isSplitBag) {
            // ── Split into 2 × 500 mL pints ─────────────────
            const nacPerPint  = r1(nacVol / 2);
            const nacGPerPint = r2(nacG / 2);

            stepsHTML = `
                <div style="font-size:0.88em; font-weight:700; color:#B71C1C; background:#FFEBEE; border-radius:6px; padding:9px 12px; margin-bottom:10px; border-left:4px solid #B71C1C;">
                    ⚠️ This bag uses <u>1,000 mL total diluent</u> — you must prepare <u>2 separate 500 mL bags</u> (called Pint 1 and Pint 2). They are infused one after the other, not at the same time.
                </div>` +
                buildStep(1, '💉', `Draw out the full NAC dose for this bag`,
                    `Using a syringe, draw out <strong>${nacVol} mL (${nacG} g)</strong> of NAC in total from the vial(s).<br>
                    <span style="color:#888;font-size:0.85em;">(How we get this: ${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL total)</span>`) +
                buildStep(2, '⚖️', `Divide the NAC equally between 2 pints`,
                    `You will add <strong>${nacPerPint} mL (${nacGPerPint} g)</strong> to each pint — half the total dose in each bag.`) +
                buildStep(3, '🗑️', `Remove ${nacPerPint} mL from Pint 1 first`,
                    `Using a separate empty syringe, draw out and discard <strong>${nacPerPint} mL</strong> from the first 500 mL D5W/NS bag.<br>
                    <span style="color:#888;font-size:0.85em;">(Reason: removing this amount makes room, so the final volume in Pint 1 remains exactly 500 mL after you add the NAC)</span>`) +
                buildStep(4, '💊', `Add NAC into Pint 1`,
                    `Inject <strong>${nacPerPint} mL (${nacGPerPint} g)</strong> of NAC into Pint 1 through the injection port.`) +
                buildStep(5, '🫗', `Mix Pint 1`,
                    `Hold the bag and <strong>shake vigorously</strong> for at least 15–30 seconds until the solution looks clear and uniform throughout.<br>
                    <span style="color:#D84315;font-size:0.85em;font-weight:600;">⚠️ Shaking is essential — poor mixing can cause adverse reactions in the patient.</span>`) +
                buildStep(6, '🗑️', `Repeat for Pint 2 — remove ${nacPerPint} mL first`,
                    `Using a separate empty syringe, draw out and discard <strong>${nacPerPint} mL</strong> from the second 500 mL D5W/NS bag.<br>
                    <span style="color:#888;font-size:0.85em;">(Same reason: keeps the final volume in Pint 2 at exactly 500 mL)</span>`) +
                buildStep(7, '💊', `Add NAC into Pint 2`,
                    `Inject the remaining <strong>${nacPerPint} mL (${nacGPerPint} g)</strong> of NAC into Pint 2 through the injection port.`) +
                buildStep(8, '🫗', `Mix Pint 2`,
                    `Shake <strong>Pint 2 vigorously</strong> for at least 15–30 seconds until uniform.<br>
                    <span style="color:#D84315;font-size:0.85em;font-weight:600;">⚠️ Do not skip — shake every bag before infusing.</span>`) +
                buildStep(9, '🏷️', `Label both bags`,
                    `On <strong>Pint 1</strong>, write: patient name | NAC ${nacGPerPint} g | D5W or NS | Pint 1 of 2 | date &amp; time prepared.<br>
                    On <strong>Pint 2</strong>, write the same but label it <strong>Pint 2 of 2</strong>.`) +
                buildStep(10, '⏱️', `Start the infusion`,
                    rateHTML);

            plainLines.push(`⚠ SPLIT BAG: Prepare as 2 x 500 mL pints. Infuse one after the other.`);
            plainLines.push(`Step 1:  Draw out ${nacVol} mL (${nacG} g) of NAC from vial(s)`);
            plainLines.push(`         [${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL total]`);
            plainLines.push(`Step 2:  Each pint will receive ${nacPerPint} mL (${nacGPerPint} g) of NAC`);
            plainLines.push(`Step 3:  From Pint 1 — remove and discard ${nacPerPint} mL first`);
            plainLines.push(`         (keeps final volume at 500 mL after adding NAC)`);
            plainLines.push(`Step 4:  Add ${nacPerPint} mL (${nacGPerPint} g) of NAC into Pint 1`);
            plainLines.push(`Step 5:  Shake Pint 1 vigorously for 15-30 seconds until uniform`);
            plainLines.push(`         ⚠ Poor mixing can cause adverse reactions`);
            plainLines.push(`Step 6:  From Pint 2 — remove and discard ${nacPerPint} mL first`);
            plainLines.push(`Step 7:  Add ${nacPerPint} mL (${nacGPerPint} g) of NAC into Pint 2`);
            plainLines.push(`Step 8:  Shake Pint 2 vigorously for 15-30 seconds until uniform`);
            plainLines.push(`Step 9:  Label Pint 1: patient name, NAC ${nacGPerPint} g, diluent, Pint 1 of 2, date/time`);
            plainLines.push(`         Label Pint 2: same but Pint 2 of 2`);
            plainLines.push(`Step 10: ${ratePlain}`);

        } else {
            // ── Standard single diluted bag ──────────────────
            stepsHTML =
                buildStep(1, '💉', `Draw out the NAC dose`,
                    `Using a syringe, draw out <strong>${nacVol} mL (${nacG} g)</strong> of NAC from the vial(s).<br>
                    <span style="color:#888;font-size:0.85em;">(How we get this: ${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL)</span>`) +
                buildStep(2, '🗑️', `Remove the same volume from the diluent bag first`,
                    `Using a separate empty syringe, draw out and discard <strong>${nacVol} mL</strong> from the <strong>${diluentML} mL D5W/NS bag</strong>.<br>
                    <span style="color:#888;font-size:0.85em;">(Reason: removing this amount makes room, so the final volume stays exactly at ${diluentML} mL after you add the NAC)</span>`) +
                buildStep(3, '💊', `Add the NAC into the bag`,
                    `Inject <strong>${nacVol} mL (${nacG} g)</strong> of NAC into the diluent bag through the injection port.`) +
                buildStep(4, '🫗', `Mix the bag`,
                    `Hold the bag and <strong>shake vigorously</strong> for at least 15–30 seconds until the solution looks clear and uniform throughout.<br>
                    <span style="color:#D84315;font-size:0.85em;font-weight:600;">⚠️ Shaking is essential — poor mixing can cause adverse reactions in the patient.</span>`) +
                buildStep(5, '🏷️', `Label the bag`,
                    `Write on the label: patient name | NAC ${nacG} g | ${diluentML} mL D5W or NS | date &amp; time prepared.`) +
                buildStep(6, '⏱️', `Start the infusion`,
                    rateHTML);

            plainLines.push(`Step 1: Draw out ${nacVol} mL (${nacG} g) of NAC from vial(s)`);
            plainLines.push(`        [${bag.doseCalc.toLocaleString()} mg ÷ 200 mg/mL = ${nacVol} mL]`);
            plainLines.push(`Step 2: From the ${diluentML} mL D5W/NS bag, remove and discard ${nacVol} mL`);
            plainLines.push(`        (keeps the final volume at ${diluentML} mL after adding NAC)`);
            plainLines.push(`Step 3: Inject ${nacVol} mL (${nacG} g) of NAC into the diluent bag`);
            plainLines.push(`Step 4: Shake the bag vigorously for 15-30 seconds until uniform`);
            plainLines.push(`        ⚠ Poor mixing can cause adverse reactions`);
            plainLines.push(`Step 5: Label: patient name, NAC ${nacG} g, ${diluentML} mL D5W or NS, date/time prepared`);
            plainLines.push(`Step 6: ${ratePlain}`);
        }

        guideHTML += `
            <div style="background:white; border-radius:10px; padding:14px 16px; margin-bottom:14px; border-left:4px solid #E65100; box-shadow:0 2px 6px rgba(0,0,0,0.07);">
                <div style="font-weight:700; color:#BF360C; font-size:0.95em; margin-bottom:10px;">
                    ${bag.label} — ${bag.doseCalc.toLocaleString()} mg &nbsp;(<strong>${nacG} g</strong>)&nbsp; of NAC
                </div>
                ${needsHTML}
                ${stepsHTML}
            </div>`;
    });

    // ── Safety reminders ──────────────────────────────────────────
    const remindersHTML = `
        <div style="background:#FBE9E7; border-radius:8px; padding:12px 14px; margin-top:4px; border-left:4px solid #BF360C;">
            <div style="font-weight:700; color:#BF360C; font-size:0.88em; margin-bottom:8px;">🔔 General Safety Reminders</div>
            <ul style="margin:0; padding-left:18px; font-size:0.88em; color:#4E342E; line-height:1.85;">
                <li>Always verify: correct patient, correct drug, correct dose, correct route, correct time</li>
                ${!isUndiluted ? `<li>Preferred diluent is <strong>D5W (Dextrose 5%)</strong> — use NS only if D5W is unavailable</li>
                <li>Once prepared, bags are stable for <strong>24 hours</strong> at room temperature (below 30°C)</li>` : ''}
                <li>If the patient develops a rash, flushing or difficulty breathing during the infusion — <strong>slow down or stop the infusion and call the doctor immediately</strong></li>
            </ul>
        </div>`;

    plainLines.push('');
    plainLines.push('─'.repeat(50));
    plainLines.push('GENERAL SAFETY REMINDERS:');
    plainLines.push('- Always verify: correct patient, drug, dose, route, time');
    plainLines.push('- Preferred diluent: D5W (use NS only if D5W unavailable)');
    plainLines.push('- Stable for 24 hours at room temperature (below 30 degrees C)');
    plainLines.push('- If patient develops rash/flushing/difficulty breathing — slow/stop infusion and call doctor');

    // ── Render ────────────────────────────────────────────────────
    guideContainer.innerHTML = `
        <style>
            .nac-step {
                display: flex; align-items: flex-start; gap: 10px;
                font-size: 0.9em; color: #333; padding: 7px 0;
                border-bottom: 1px solid #F5E6D3; line-height: 1.55;
            }
            .nac-step:last-child { border-bottom: none; }
            .nac-step-num {
                min-width: 26px; height: 26px; border-radius: 50%;
                background: #E65100; color: white;
                font-weight: 700; font-size: 0.78em;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; margin-top: 2px;
            }
            .nac-step-icon { font-size: 1.1em; flex-shrink: 0; margin-top: 2px; }
            .nac-step-content { flex: 1; }
            .nac-step-title { font-weight: 600; color: #5D2000; margin-bottom: 3px; font-size: 0.92em; }
        </style>
        ${guideHTML}
        ${remindersHTML}`;
}
