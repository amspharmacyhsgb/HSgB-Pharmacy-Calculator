// Body Weight (BW) Calculator

function calculateBodyWeight() {
    const actualWeight = getNumericValue('bw-actual-weight');
    const height = getNumericValue('bw-height');
    const gender = getSelectValue('bw-gender');

    // Validate basic inputs
    if (isNaN(actualWeight) || isNaN(height)) {
        hideElement('bw-outputs');
        return;
    }

    if (actualWeight <= 0 || height <= 0) {
        hideElement('bw-outputs');
        return;
    }

    // Show outputs
    showElement('bw-outputs');
    
    // Calculate BMI
    const heightM = height / 100;
    const bmi = actualWeight / (heightM * heightM);
    setTextContent('bw-bmi', `${formatNumber(bmi, 2)} kg/m²`);

    // Calculate BSA (DuBois formula)
    const bsa = Math.sqrt((height * actualWeight) / 3600);
    setTextContent('bw-bsa', `${formatNumber(bsa, 2)} m²`);
    
    // Calculate IBW and AdjBW (requires gender)
    let ibw = 'Not applicable';
    let adjbw = 'Not applicable';
    
    if (gender === 'male') {
        ibw = 50 + 0.9 * (height - 152);
    } else if (gender === 'female') {
        ibw = 45.5 + 0.9 * (height - 152);
    }

    if (typeof ibw === 'number') {
        // Ensure IBW is not negative
        if (ibw < 0) {
            ibw = 'Not applicable (height too low)';
        } else {
            setTextContent('bw-ibw', `${formatNumber(ibw, 2)} kg`);
            
            // Calculate Adjusted Body Weight if actual > IBW
            if (actualWeight > ibw) {
                adjbw = ibw + 0.4 * (actualWeight - ibw);
                setTextContent('bw-adjbw', `${formatNumber(adjbw, 2)} kg`);
            } else {
                setTextContent('bw-adjbw', 'Not applicable (Actual ≤ IBW)');
            }
        }
    } else {
        setTextContent('bw-ibw', 'Select gender to calculate');
        setTextContent('bw-adjbw', 'Select gender to calculate');
    }
    
    // Only scroll to results if gender is selected (user has completed all inputs)
    if (gender) {
        scrollToResults('bw-results-heading');
    }
}
