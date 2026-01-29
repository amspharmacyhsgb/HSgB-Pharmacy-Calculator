// Enoxaparin (Clexane) Dose Calculator

const enoxDoseData = {
    'pregnant-prophylaxis': {
        'footnote': '',
        'weightRanges': [
            { range: '<50', min: 0, max: 49.9, normal: 'S/C Enoxaparin (Clexane) 20 mg OD', renal: 'Consider 50% of the standard dose' },
            { range: '50–90', min: 50, max: 90, normal: 'S/C Enoxaparin (Clexane) 40 mg OD', renal: 'S/C Enoxaparin (Clexane) 20 mg OD' },
            { range: '91–130', min: 91, max: 130, normal: 'S/C Enoxaparin (Clexane) 60 mg OD', renal: 'S/C Enoxaparin (Clexane) 30 mg OD' },
            { range: '131–170', min: 131, max: 170, normal: 'S/C Enoxaparin (Clexane) 80 mg OD', renal: 'S/C Enoxaparin (Clexane) 40 mg OD' },
            { range: '>170', min: 170.1, max: 9999, normal: 'S/C Enoxaparin (Clexane) 0.6 mg/kg/day', renal: 'Consider 50% of the standard dose' }
        ]
    },
    'vte-prophylaxis': {
        'footnote': '',
        'weightRanges': [
            { range: '<40', min: 0, max: 39.9, normal: 'No recommendation', renal: 'No recommendation' },
            { range: '≥40', min: 40, max: 9999, normal: 'S/C Enoxaparin (Clexane) 40 mg OD', renal: 'S/C Enoxaparin (Clexane) 20 mg OD' }
        ]
    },
    'major-ortho-prophylaxis': {
        'footnote': '',
        'weightRanges': [
            { range: '<40', min: 0, max: 39.9, normal: 'No recommendation', renal: 'No recommendation' },
            { range: '≥40', min: 40, max: 9999, normal: 'S/C Enoxaparin (Clexane) 40–60 mg OD', renal: 'S/C Enoxaparin (Clexane) 20–30 mg OD' }
        ]
    },
    'dvt-pe-treatment': {
        'footnote': 'S/C Clexane Dose: 1 mg/kg BD',
        'weightRanges': [
            { range: '<40', min: 0, max: 39.9, normal: 'S/C Enoxaparin (Clexane) 20–40 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 5 mg OD', renal: 'Consider 50% of the standard dose' },
            { range: '40–49', min: 40, max: 49, normal: 'S/C Enoxaparin (Clexane) 40 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 5 mg OD', renal: 'S/C Enoxaparin (Clexane) 40 mg OD' },
            { range: '50–69', min: 50, max: 69, normal: 'S/C Enoxaparin (Clexane) 60 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 7.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 60 mg OD' },
            { range: '70–99', min: 70, max: 99, normal: 'S/C Enoxaparin (Clexane) 80 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 7.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 80 mg OD' },
            { range: '100–120', min: 100, max: 120, normal: 'S/C Enoxaparin (Clexane) 100–120 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 10 mg OD', renal: 'S/C Enoxaparin (Clexane) 80–120 mg OD' },
            { range: '>120', min: 120.1, max: 9999, normal: 'S/C Enoxaparin (Clexane) 0.75 mg/kg BD (up to 160 mg BD)', normalAlt: 'S/C Fondaparinux (Arixtra) 10 mg OD', renal: 'S/C Enoxaparin (Clexane) 0.75 mg/kg OD (up to 160 mg OD)', note: 'For patients with BMI ≥40 kg/m²' }
        ]
    },
    'acs-treatment': {
        'footnote': 'S/C Clexane Dose: 1 mg/kg BD',
        'weightRanges': [
            { range: '<40', min: 0, max: 39.9, normal: 'S/C Enoxaparin (Clexane) 20–40 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'Consider 50% of the standard dose' },
            { range: '40–49', min: 40, max: 49, normal: 'S/C Enoxaparin (Clexane) 40 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 40 mg OD' },
            { range: '50–69', min: 50, max: 69, normal: 'S/C Enoxaparin (Clexane) 60 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 60 mg OD' },
            { range: '70–99', min: 70, max: 99, normal: 'S/C Enoxaparin (Clexane) 80 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 80 mg OD' },
            { range: '100–120', min: 100, max: 120, normal: 'S/C Enoxaparin (Clexane) 100–120 mg BD', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 80–120 mg OD' },
            { range: '>120', min: 120.1, max: 9999, normal: 'S/C Enoxaparin (Clexane) 0.75 mg/kg BD (up to 160 mg BD)', normalAlt: 'S/C Fondaparinux (Arixtra) 2.5 mg OD', renal: 'S/C Enoxaparin (Clexane) 0.75 mg/kg OD (up to 160 mg OD)', note: 'For patients with BMI ≥40 kg/m²' }
        ]
    }
};

// Debounce timer for scroll
let enoxScrollTimer = null;

function updateEnoxaparinUI() {
    const indication = getSelectValue('enox-indication');
    const bw = getNumericValue('enox-bw');
    
    // Clear existing timer
    if (enoxScrollTimer) {
        clearTimeout(enoxScrollTimer);
    }
    
    const weightRangeFootnote = document.getElementById('enox-weight-range-footnote');
    const treatmentFootnote = document.getElementById('enox-treatment-footnote');
    const outputDiv = document.getElementById('enoxaparin-output');

    // Reset footnotes and output
    if (treatmentFootnote) treatmentFootnote.style.display = 'none';
    if (weightRangeFootnote) weightRangeFootnote.innerHTML = '';
    hideElement('enoxaparin-output');

    if (!indication) {
        return;
    }

    const data = enoxDoseData[indication];

    // Update treatment footnote if applicable
    if (data.footnote && treatmentFootnote) {
        treatmentFootnote.innerText = data.footnote;
        treatmentFootnote.style.display = 'block';
    }

    // Update weight range footnote
    if (weightRangeFootnote) {
        if (indication === 'pregnant-prophylaxis') {
            weightRangeFootnote.innerText = 'Weight range: <50 kg, 50-90 kg, 91-130 kg, 131-170 kg, >170 kg';
        } else {
            weightRangeFootnote.innerHTML = `Weight range: &lt;40 kg, 50-69 kg, 70-99 kg, 100-120 kg, &gt;120 kg or <a href="body-weight.html">BMI &ge; 40 kg/m²</a>`;
        }
    }
    
    // Show output if BW is entered
    if (isNaN(bw) || bw <= 0) {
        return;
    }

    showElement('enoxaparin-output');
    setTextContent('enox-bw-display', bw);

    // Find matching weight range
    let matchedRange = null;
    for (let rangeData of data.weightRanges) {
        if (bw >= rangeData.min && bw <= rangeData.max) {
            matchedRange = rangeData;
            break;
        }
    }

    // Display modern card-style output
    const outputContainer = document.getElementById('enoxaparin-result-card');
    if (matchedRange && outputContainer) {
        // Helper function to bold doses and frequencies
        function boldDoseAndFrequency(text) {
            // Bold numbers (including decimals) followed by mg (doses)
            text = text.replace(/(\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?)\s*(mg)/gi, '<strong>$1 $2</strong>');
            // Bold frequencies (OD, BD)
            text = text.replace(/\b(OD|BD)\b/gi, '<strong>$1</strong>');
            return text;
        }
        
        let cardHTML = '';
        
        // For pregnant prophylaxis - Clexane only
        if (indication === 'pregnant-prophylaxis') {
            cardHTML = `
                <div style="margin-top: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 10px; border-left: 5px solid var(--primary-blue);">
                        <span style="font-size: 2em; margin-right: 15px;">💉</span>
                        <div>
                            <div style="font-size: 0.85em; color: #555; font-weight: 500;">Weight Range</div>
                            <div style="font-size: 1.5em; font-weight: 700; color: var(--primary-blue);">${matchedRange.range} kg</div>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px;">
                            Option 1: Enoxaparin (Clexane)
                        </div>
                        
                        <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.95em;">
                                ✓ Normal Renal Function
                            </div>
                            <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                ${boldDoseAndFrequency(matchedRange.normal)}
                            </div>
                        </div>
                        
                        <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                            <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.95em;">
                                ⚠️ Renal Adjusted (CrCl 15–30 ml/min)
                            </div>
                            <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                ${boldDoseAndFrequency(matchedRange.renal)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        // For VTE prophylaxis (medical/non-major ortho)
        else if (indication === 'vte-prophylaxis') {
            const showArixtra = bw >= 50;
            const showBWWarning = bw < 50;
            cardHTML = `
                <div style="margin-top: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 10px; border-left: 5px solid var(--primary-blue);">
                        <span style="font-size: 2em; margin-right: 15px;">💉</span>
                        <div>
                            <div style="font-size: 0.85em; color: #555; font-weight: 500;">Weight Range</div>
                            <div style="font-size: 1.5em; font-weight: 700; color: var(--primary-blue);">${matchedRange.range} kg</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: ${showArixtra ? '1fr 1fr' : '1fr'}; gap: 12px;">
                        <div style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px;">
                                Option 1: Enoxaparin (Clexane)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.normal)}
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.renal)}
                                </div>
                            </div>
                        </div>
                        
                        ${showArixtra ? `
                        <div style="background: linear-gradient(135deg, #00897B 0%, #00695C 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px; line-height: 1.3;">
                                Option 2: Fondaparinux (Arixtra)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    S/C Fondaparinux (Arixtra) <strong>2.5 mg OD</strong>
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="background: #FFEBEE; border-radius: 6px; padding: 10px; font-size: 0.9em; color: #C62828; font-weight: 600; border-left: 4px solid #D32F2F;">
                                    ⚠️ Not recommended in CrCl < 30 ml/min
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ${showBWWarning && !showArixtra ? `
                    <div style="background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 0.9em; color: #E65100; font-weight: 600; border-left: 5px solid #FF9800; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        ⚠️ Fondaparinux (Arixtra) not shown: Not recommended in BW < 50 kg
                    </div>
                    ` : ''}
                </div>
            `;
        }
        // For major ortho prophylaxis
        else if (indication === 'major-ortho-prophylaxis') {
            const showArixtra = bw >= 50;
            const showBWWarning = bw < 50;
            cardHTML = `
                <div style="margin-top: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 10px; border-left: 5px solid var(--primary-blue);">
                        <span style="font-size: 2em; margin-right: 15px;">💉</span>
                        <div>
                            <div style="font-size: 0.85em; color: #555; font-weight: 500;">Weight Range</div>
                            <div style="font-size: 1.5em; font-weight: 700; color: var(--primary-blue);">${matchedRange.range} kg</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: ${showArixtra ? '1fr 1fr' : '1fr'}; gap: 12px;">
                        <div style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px;">
                                Option 1: Enoxaparin (Clexane)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.normal)}
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.renal)}
                                </div>
                            </div>
                        </div>
                        
                        ${showArixtra ? `
                        <div style="background: linear-gradient(135deg, #00897B 0%, #00695C 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px; line-height: 1.3;">
                                Option 2: Fondaparinux (Arixtra)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    S/C Fondaparinux (Arixtra) <strong>2.5 mg OD</strong>
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="background: #FFEBEE; border-radius: 6px; padding: 10px; font-size: 0.9em; color: #C62828; font-weight: 600; border-left: 4px solid #D32F2F;">
                                    ⚠️ Not recommended in CrCl < 30 ml/min
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ${showBWWarning && !showArixtra ? `
                    <div style="background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 0.9em; color: #E65100; font-weight: 600; border-left: 5px solid #FF9800; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        ⚠️ Fondaparinux (Arixtra) not shown: Not recommended in BW < 50 kg
                    </div>
                    ` : ''}
                </div>
            `;
        }
        // For DVT/PE and ACS treatment - side by side layout with renal warnings for both
        else if (indication === 'dvt-pe-treatment' || indication === 'acs-treatment') {
            cardHTML = `
                <div style="margin-top: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 10px; border-left: 5px solid var(--primary-blue);">
                        <span style="font-size: 2em; margin-right: 15px;">💉</span>
                        <div>
                            <div style="font-size: 0.85em; color: #555; font-weight: 500;">Weight Range</div>
                            <div style="font-size: 1.5em; font-weight: 700; color: var(--primary-blue);">${matchedRange.range} kg</div>
                            ${matchedRange.note ? `<div style="font-size: 0.8em; color: #666; font-style: italic; margin-top: 4px;">📌 ${matchedRange.note}</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px;">
                                Option 1: Enoxaparin (Clexane)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.normal)}
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.renal)}
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #00897B 0%, #00695C 100%); border-radius: 12px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                            <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 12px; line-height: 1.3;">
                                Option 2: Fondaparinux (Arixtra)
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ✓ Normal Renal Function
                                </div>
                                <div style="color: #333; font-size: 0.95em; padding: 3px 8px;">
                                    ${boldDoseAndFrequency(matchedRange.normalAlt)}
                                </div>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(135deg, #F57C00 0%, #E65100 100%); color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-weight: 700; font-size: 0.9em;">
                                    ⚠️ Renal Adjusted (CrCl 15–30)
                                </div>
                                <div style="background: #FFEBEE; border-radius: 6px; padding: 10px; font-size: 0.9em; color: #C62828; font-weight: 600; border-left: 4px solid #D32F2F;">
                                    ⚠️ Not recommended in CrCl < 30 ml/min
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        outputContainer.innerHTML = cardHTML;
    }
    
    // Scroll to results after a short delay (800ms)
    enoxScrollTimer = setTimeout(() => {
        scrollToResults('enox-results-heading');
    }, 800);
}
