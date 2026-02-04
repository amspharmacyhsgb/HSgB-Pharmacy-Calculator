// NAC Dose Calculator

// Debounce timer for scroll
let nacScrollTimer = null;

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
                    <strong>Duration:</strong> ${bag.duration}
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
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) over ${bag.duration}, ${bag.diluent}\n`;
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
            clinicalNotes += `${bag.label}: NAC ${bag.doseCalc} mg (${bag.dose}) in ${diluentText} over ${bag.duration}\n`;
        }
    });
    
    // Add Remarks section only if dilution is required
    if (hasDiluted) {
        clinicalNotes += `\n**Remarks:**\n`;
        clinicalNotes += `Diluents: D5 (more preferred) or NS\n`;
        clinicalNotes += `Stability: 24 hrs after dilution (<30°C)\n`;
    }
    
    // Render with bold formatting
    const formattedNotes = clinicalNotes.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    document.getElementById('nac-clinical-notes').innerHTML = formattedNotes.replace(/\n/g, '<br>');
    
    // Reminder
    setHTMLContent('nac-reminder', reminderText);
    
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
