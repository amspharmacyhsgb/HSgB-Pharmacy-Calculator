// Vasopressor & Inotrope Supply Calculator

// Debounce timer for scroll
let vasoScrollTimer = null;

// Track Vasopressin rate type (default: units/min)
let vasopressinRateType = 'units';

const vasoData = {
    'noradrenaline': { strength: 4, ml: 4, label: 'Noradrenaline (NA)' },
    'dopamine': { strength: 200, ml: 5, label: 'Dopamine' },
    'dobutamine': { strength: 250, ml: 20, label: 'Dobutamine' },
    'adrenaline': { strength: 1, ml: 1, label: 'Adrenaline (Epinephrine)' },
    'vasopressin': { strength: 20, ml: 1, label: 'Vasopressin', units: 'units' }
};

function selectRateType(type) {
    vasopressinRateType = type;
    const unitsBtn = document.getElementById('rate-type-units');
    const mlBtn = document.getElementById('rate-type-ml');
    const rateInput = document.getElementById('vaso-rate-vasopressin');
    const rateLabel = document.getElementById('vaso-rate-label');
    
    if (type === 'units') {
        // Style units button as active
        unitsBtn.style.background = '#1565C0';
        unitsBtn.style.color = 'white';
        unitsBtn.style.borderColor = '#1565C0';
        
        // Style mL button as inactive
        mlBtn.style.background = 'white';
        mlBtn.style.color = '#666';
        mlBtn.style.borderColor = '#ccc';
        
        // Update label and default value
        rateLabel.textContent = 'Infusion Rate (units/min)';
        rateInput.value = '0.03';
    } else {
        // Style mL button as active
        mlBtn.style.background = '#1565C0';
        mlBtn.style.color = 'white';
        mlBtn.style.borderColor = '#1565C0';
        
        // Style units button as inactive
        unitsBtn.style.background = 'white';
        unitsBtn.style.color = '#666';
        unitsBtn.style.borderColor = '#ccc';
        
        // Update label and default value
        rateLabel.textContent = 'Infusion Rate (mL/hr)';
        rateInput.value = '1.8';
    }
    
    calculateVasoSupply();
}

function updateVasoUI() {
    const drug = getSelectValue('vaso-drug');
    const footnote = document.getElementById('vaso-strength-footnote');

    if (!drug) {
        if (footnote) footnote.innerText = '';
        hideElement('vaso-outputs');
        // Show standard inputs
        showElement('vaso-rate-group');
        showElement('vaso-strength-prep-group');
        showElement('vaso-diluent-group');
        hideElement('vaso-rate-vasopressin-group');
        hideElement('vaso-vasopressin-strength-group');
        return;
    }

    const data = vasoData[drug];
    
    // Handle Vasopressin differently
    if (drug === 'vasopressin') {
        if (footnote) {
            footnote.innerText = '20 units in 1 mL ampoule';
        }
        // Hide standard inputs
        hideElement('vaso-rate-group');
        hideElement('vaso-strength-prep-group');
        hideElement('vaso-diluent-group');
        // Show Vasopressin-specific inputs
        showElement('vaso-rate-vasopressin-group');
        showElement('vaso-vasopressin-strength-group');
    } else {
        if (footnote) {
            footnote.innerText = `Drug strength per ampoule/vial: ${data.strength} mg per ${data.ml} mL ampoule/vial`;
        }
        // Show standard inputs
        showElement('vaso-rate-group');
        showElement('vaso-strength-prep-group');
        showElement('vaso-diluent-group');
        // Hide Vasopressin-specific inputs
        hideElement('vaso-rate-vasopressin-group');
        hideElement('vaso-vasopressin-strength-group');
    }
    
    calculateVasoSupply();
}

function calculateVasoSupply() {
    const drug = getSelectValue('vaso-drug');
    const duration = getNumericValue('vaso-duration');
    
    // Clear existing timer
    if (vasoScrollTimer) {
        clearTimeout(vasoScrollTimer);
    }
    
    // Validate drug and duration
    if (!drug || isNaN(duration) || duration <= 0) {
        hideElement('vaso-outputs');
        return;
    }

    const drugData = vasoData[drug];
    
    // Handle Vasopressin separately
    if (drug === 'vasopressin') {
        const rate = getNumericValue('vaso-rate-vasopressin');
        const units = getNumericValue('vaso-vasopressin-units');
        const ml = getNumericValue('vaso-vasopressin-ml');
        
        // Validate Vasopressin inputs
        if (isNaN(rate) || isNaN(units) || isNaN(ml) || rate <= 0 || units <= 0 || ml <= 0) {
            hideElement('vaso-outputs');
            return;
        }
        
        let quantity;
        let rateDisplay;
        
        if (vasopressinRateType === 'units') {
            // Calculate for units/min
            // Total units needed = rate (units/min) × duration (hours) × 60 min/hr
            const totalUnitsNeeded = rate * duration * 60;
            const unitsPerVial = 20; // Each vial is always 20 units
            quantity = Math.ceil(totalUnitsNeeded / unitsPerVial);
            rateDisplay = `${rate} units/min`;
        } else {
            // Calculate for mL/hr
            // Step 1: Total mL required = rate (mL/hr) × duration (hours)
            const totalML = rate * duration;
            
            // Step 2: Number of preparations = total mL / mL per preparation
            const preparations = Math.ceil(totalML / ml);
            
            // Step 3: Ampoules per preparation = units in prep / 20 units per vial
            const ampoulesPerPrep = units / 20;
            
            // Total ampoules = preparations × ampoules per preparation
            quantity = Math.ceil(preparations * ampoulesPerPrep);
            rateDisplay = `${rate} mL/hr`;
        }
        
        // Preparation output
        const prepOutput = `${units} U in ${ml} mL diluents`;
        
        // Summary output
        const summaryHTML = `
            <div style="line-height: 1.4;">
                <strong>Drug:</strong> ${drugData.label} | <strong>Infusion Rate:</strong> ${rateDisplay} | <strong>Duration:</strong> ${duration} hours | <strong>Strength:</strong> ${units} U in ${ml} mL
            </div>
        `;
        
        showElement('vaso-outputs');
        setHTMLContent('vaso-summary', summaryHTML);
        setTextContent('vaso-preparation', prepOutput);
        setTextContent('vaso-quantity', `${quantity} ampoule(s) per day`);
        
        // Scroll to results after a short delay (800ms)
        vasoScrollTimer = setTimeout(() => {
            scrollToResults('vaso-results-heading');
        }, 800);
        return;
    }
    
    // Standard drugs (non-Vasopressin)
    const rate = getNumericValue('vaso-rate');
    const strengthPrep = getSelectValue('vaso-strength-prep');
    const diluent = getNumericValue('vaso-diluent');
    
    // Validate inputs
    if (isNaN(rate) || !strengthPrep || isNaN(diluent) || rate <= 0 || diluent <= 0) {
        hideElement('vaso-outputs');
        return;
    }

    // Show outputs
    showElement('vaso-outputs');
    
    const strengthMultiplier = strengthPrep === 'single' ? 1 : 2;

    // Calculate preparation details
    const prepStrengthMg = drugData.strength * strengthMultiplier;
    const prepOutput = `${drugData.label} ${prepStrengthMg} mg in ${diluent} mL per preparation`;

    // Calculate quantity needed
    const quantity = Math.ceil((rate * duration * strengthMultiplier) / diluent);

    // Display outputs in compact single-line format like NAC
    const summaryHTML = `
        <div style="line-height: 1.4;">
            <strong>Drug:</strong> ${drugData.label} | <strong>Infusion Rate:</strong> ${rate} mL/hr | <strong>Duration:</strong> ${duration} hours | <strong>Strength:</strong> ${strengthPrep === 'single' ? 'Single Strength (SS)' : 'Double Strength (DS)'} | <strong>Diluent Volume:</strong> ${diluent} mL
        </div>
    `;
    setHTMLContent('vaso-summary', summaryHTML);
    setTextContent('vaso-preparation', prepOutput);
    setTextContent('vaso-quantity', `${quantity} ampoule(s) or vial(s)`);
    
    // Scroll to results after a short delay (800ms)
    vasoScrollTimer = setTimeout(() => {
        scrollToResults('vaso-results-heading');
    }, 800);
}
