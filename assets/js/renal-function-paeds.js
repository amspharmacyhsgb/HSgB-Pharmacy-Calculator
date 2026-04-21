// Renal Function (Paeds) Calculator - Schwartz/Brion eGFR

let paedsEGFRScrollTimer = null;

function calculatePaedsEGFR() {
    const gestational = getSelectValue('paeds-gestational');
    const height = getNumericValue('paeds-height');
    const scr = getNumericValue('paeds-scr');

    if (paedsEGFRScrollTimer) {
        clearTimeout(paedsEGFRScrollTimer);
    }

    // Validate inputs
    if (!gestational || isNaN(height) || isNaN(scr)) {
        hideElement('paeds-egfr-outputs');
        return;
    }

    if (height <= 0 || scr <= 0) {
        hideElement('paeds-egfr-outputs');
        return;
    }

    // Determine k constant
    const k = gestational === 'preterm' ? 29.2 : 39.8;

    // Calculate eGFR
    const egfr = (k * height) / scr;

    // Show result
    showElement('paeds-egfr-outputs');
    setTextContent('paeds-egfr-result', `${formatNumber(egfr, 2)} mL/min/1.73m²`);

    // Scroll to results
    paedsEGFRScrollTimer = setTimeout(() => {
        scrollToResults('paeds-egfr-results-heading');
    }, 800);
}
