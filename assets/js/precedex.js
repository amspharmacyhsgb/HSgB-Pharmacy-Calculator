// Precedex (Dexmedetomidine) Supply Calculator

// Debounce timer for scroll
let precedexScrollTimer = null;

function calculatePrecedex() {
    const rate = getNumericValue('precedex-rate');
    const mcg = getNumericValue('precedex-mcg');
    const ml = getNumericValue('precedex-ml');
    const duration = getNumericValue('precedex-duration');
    
    const concentrationDisplay = document.getElementById('precedex-concentration-display');
    const concentrationValue = document.getElementById('precedex-concentration-value');
    const durationWarning = document.getElementById('precedex-duration-warning');
    
    // Clear existing timer
    if (precedexScrollTimer) {
        clearTimeout(precedexScrollTimer);
    }
    
    // Show/hide duration warning
    if (!isNaN(duration) && duration > 24) {
        durationWarning.style.display = 'block';
    } else {
        durationWarning.style.display = 'none';
    }
    
    // Show concentration if mcg and ml are entered
    if (!isNaN(mcg) && !isNaN(ml) && mcg > 0 && ml > 0) {
        const concentration = mcg / ml;
        concentrationValue.textContent = `${concentration.toFixed(2)} mcg/mL`;
        concentrationDisplay.style.display = 'block';
    } else {
        concentrationDisplay.style.display = 'none';
    }
    
    // Validate inputs for calculation
    if (isNaN(rate) || isNaN(mcg) || isNaN(ml) || isNaN(duration) || 
        rate <= 0 || mcg <= 0 || ml <= 0 || duration <= 0) {
        hideElement('precedex-outputs');
        return;
    }
    
    // Show outputs
    showElement('precedex-outputs');
    
    // Step 1: Total mL required = rate (mL/hr) × duration (hours)
    const totalML = rate * duration;
    
    // Step 2: Number of preparations = total mL / mL per preparation
    const preparations = Math.ceil(totalML / ml);
    
    // Step 3: Ampoules per preparation = mcg in prep / 200 mcg per vial
    const ampoulesPerPrep = mcg / 200;
    
    // Total ampoules = preparations × ampoules per preparation
    const quantity = Math.ceil(preparations * ampoulesPerPrep);
    
    // Calculate concentration
    const concentration = mcg / ml;
    
    // Display outputs
    const summaryHTML = `
        <div style="line-height: 1.4;">
            <strong>Infusion Rate:</strong> ${rate} mL/hr | <strong>Duration:</strong> ${duration} hours | <strong>Strength:</strong> ${mcg} mcg in ${ml} mL
        </div>
    `;
    
    const preparationHTML = `${mcg} mcg in ${ml} mL diluent (= ${concentration.toFixed(2)} mcg/mL)`;
    
    setHTMLContent('precedex-summary', summaryHTML);
    setHTMLContent('precedex-preparation', preparationHTML);
    setTextContent('precedex-quantity', `${quantity} ampoule(s) per day`);
    
    // Scroll to results after a short delay (800ms)
    precedexScrollTimer = setTimeout(() => {
        scrollToResults('precedex-results-heading');
    }, 800);
}

function clearForm() {
    // Clear all inputs
    document.getElementById('precedex-rate').value = '';
    document.getElementById('precedex-mcg').value = '200';
    document.getElementById('precedex-ml').value = '50';
    document.getElementById('precedex-duration').value = '24';
    
    // Hide outputs and warnings
    hideElement('precedex-outputs');
    document.getElementById('precedex-concentration-display').style.display = 'none';
    document.getElementById('precedex-duration-warning').style.display = 'none';
}
