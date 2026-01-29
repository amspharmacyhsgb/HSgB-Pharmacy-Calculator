// Renal Function (CrCl) Calculator - Cockcroft-Gault

// Debounce timer for scroll
let crclScrollTimer = null;

function calculateCrCl() {
    const age = getNumericValue('crcl-age');
    const bw = getNumericValue('crcl-bw');
    const gender = getSelectValue('crcl-gender');
    const scr = getNumericValue('crcl-scr');

    // Clear existing timer
    if (crclScrollTimer) {
        clearTimeout(crclScrollTimer);
    }

    // Validate inputs
    if (isNaN(age) || isNaN(bw) || isNaN(scr) || !gender) {
        hideElement('crcl-outputs');
        return;
    }

    if (age <= 0 || bw <= 0 || scr <= 0) {
        hideElement('crcl-outputs');
        return;
    }

    if (age > 120) {
        alert('Please check age value');
        hideElement('crcl-outputs');
        return;
    }

    // Show outputs
    showElement('crcl-outputs');

    // Determine F factor based on gender
    let F = 1.23; // Male
    if (gender === 'female') {
        F = 1.04;
    }
    
    // Calculate CrCl using Cockcroft-Gault equation
    const crcl = ((140 - age) * bw * F) / scr;
    
    setTextContent('crcl-result', `${formatNumber(crcl, 2)} ml/min`);
    
    // Scroll to results after a short delay (800ms)
    crclScrollTimer = setTimeout(() => {
        scrollToResults('crcl-results-heading');
    }, 800);
}
