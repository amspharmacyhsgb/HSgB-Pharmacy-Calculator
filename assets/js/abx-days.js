// HSgB ROCK — Days of Antibiotic Therapy
// abx-days.js

let selectedUnit = 'days';

// ─────────────────────────────────────────────────────
// Mode switcher
// ─────────────────────────────────────────────────────
function switchMode(mode) {
    ['opt1', 'opt2'].forEach(m => {
        document.getElementById('panel-' + m).classList.toggle('active', m === mode);
        document.getElementById('tab-'   + m).classList.toggle('active', m === mode);
    });
    hideElement('opt1-output');  hideElement('opt2-output');
    hideElement('opt1-error');   hideElement('opt2-error');
}

// ─────────────────────────────────────────────────────
// Date field helpers
//
// Convention:
//   baseId          e.g. 'opt1-start'
//   baseId-text     visible text input  (DD/MM/YYYY)
//   baseId-hidden   invisible native date input (YYYY-MM-DD)
// ─────────────────────────────────────────────────────

/** Open the native date picker via .showPicker() or .click() fallback */
function openPicker(hiddenId) {
    const el = document.getElementById(hiddenId);
    if (!el) return;
    try { el.showPicker(); } catch(e) { el.click(); }
}

/** Called when the native picker value changes → sync to text field */
function onPickerChanged(baseId, calcFn) {
    const hidden = document.getElementById(baseId + '-hidden');
    const text   = document.getElementById(baseId + '-text');
    if (!hidden || !text) return;
    if (hidden.value) {
        text.value = ymdToDmy(hidden.value);
        text.classList.remove('invalid');
    }
    triggerCalc(calcFn);
}

/** Called on every keystroke in the text input */
function onDateTyped(baseId, calcFn) {
    const text = document.getElementById(baseId + '-text');
    if (!text) return;

    // ── Cursor-safe auto-slash insertion ──────────────────
    // 1. Count how many digits sit BEFORE the current cursor.
    const cursorPos          = text.selectionStart;
    const digitsBeforeCursor = text.value.slice(0, cursorPos).replace(/[^\d]/g, '').length;

    // 2. Rebuild formatted string from digits only.
    const digits = text.value.replace(/[^\d]/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4);

    text.value = formatted;

    // 3. Restore cursor: advance until digitsBeforeCursor digits have passed.
    let digitCount = 0, newCursor = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
        if (digitCount === digitsBeforeCursor) { newCursor = i; break; }
        if (formatted[i] !== '/') digitCount++;
    }
    text.setSelectionRange(newCursor, newCursor);
    // ─────────────────────────────────────────────────────

    text.classList.remove('invalid');

    if (formatted.length === 10) {
        const ymd = dmyToYmd(formatted);
        if (ymd) {
            document.getElementById(baseId + '-hidden').value = ymd;
            triggerCalc(calcFn);
        } else {
            text.classList.add('invalid');
        }
    } else {
        document.getElementById(baseId + '-hidden').value = '';
    }
}

/** On blur: validate and reformat, or mark invalid */
function onDateBlur(baseId) {
    const text = document.getElementById(baseId + '-text');
    if (!text || !text.value) return;
    const ymd = dmyToYmd(text.value);
    if (!ymd) {
        text.classList.add('invalid');
    } else {
        text.classList.remove('invalid');
        // Reformat to ensure leading zeros
        text.value = ymdToDmy(ymd);
    }
}

/** Set today's date into the field */
function setToday(baseId, calcFn) {
    const today = toLocalDateString(new Date());
    document.getElementById(baseId + '-hidden').value = today;
    document.getElementById(baseId + '-text').value   = ymdToDmy(today);
    document.getElementById(baseId + '-text').classList.remove('invalid');
    triggerCalc(calcFn);
}

/** Get the underlying YYYY-MM-DD value for a base field */
function getDateValue(baseId) {
    const hidden = document.getElementById(baseId + '-hidden');
    return hidden ? hidden.value : '';
}

// ─────────────────────────────────────────────────────
// Date format converters
// ─────────────────────────────────────────────────────

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' */
function ymdToDmy(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
}

/** 'DD/MM/YYYY' → 'YYYY-MM-DD', returns null if invalid */
function dmyToYmd(dmy) {
    const parts = dmy.split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || y < 1900 || y > 2100) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;
    // Validate with Date
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

/** Returns YYYY-MM-DD in LOCAL time */
function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD as a LOCAL midnight date */
function parseLocalDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** '11 March 2026 (Wednesday)' */
function formatDateLong(date) {
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} (${days[date.getDay()]})`;
}

// Debounce timer for Option 2 autoscroll (only when user is typing duration)
let opt2ScrollTimer = null;

/** Dispatch to the right calc function by name */
function triggerCalc(calcFn) {
    if (calcFn === 'calculateDayOf')   calculateDayOf();
    if (calcFn === 'calculateEndDate') calculateEndDate(false); // immediate scroll from picker/Today
}

// ─────────────────────────────────────────────────────
// Option 1: What day of therapy is this?
// ─────────────────────────────────────────────────────
function calculateDayOf() {
    const startVal = getDateValue('opt1-start');
    const checkVal = getDateValue('opt1-check');

    hideElement('opt1-output');
    hideElement('opt1-error');

    if (!startVal || !checkVal) return;

    const startDate = parseLocalDate(startVal);
    const checkDate = parseLocalDate(checkVal);

    if (checkDate < startDate) {
        document.getElementById('opt1-error-msg').textContent =
            'The date to check cannot be earlier than the initiation date.';
        showElement('opt1-error');
        return;
    }

    const diffDays  = Math.round((checkDate - startDate) / 86400000);
    const dayNumber = diffDays + 1;   // Day 1 = initiation date

    document.getElementById('opt1-day-text').textContent    = `Day ${dayNumber} of Antibiotic Therapy`;
    document.getElementById('opt1-disp-start').textContent  = formatDateLong(startDate);
    document.getElementById('opt1-disp-check').textContent  = formatDateLong(checkDate);

    showElement('opt1-output');
    scrollToResults('opt1-output');
}

// ─────────────────────────────────────────────────────
// Option 2: When does therapy end?
// ─────────────────────────────────────────────────────
function setUnit(unit) {
    selectedUnit = unit;
    ['days','weeks','months'].forEach(u =>
        document.getElementById('unit-' + u).classList.toggle('active', u === unit)
    );
    calculateEndDate(false); // unit button = immediate scroll
}

// calculateEndDate(delayScroll)
//   delayScroll = true  → debounce the scroll 700ms (when user is typing duration)
//   delayScroll = false → scroll immediately (Today button, picker, unit toggle)
function calculateEndDate(delayScroll = true) {
    const startVal    = getDateValue('opt2-start');
    const durationVal = document.getElementById('opt2-duration').value;

    hideElement('opt2-output');
    hideElement('opt2-error');
    clearTimeout(opt2ScrollTimer);

    if (!startVal || !durationVal || Number(durationVal) < 1) return;

    const startDate = parseLocalDate(startVal);
    const duration  = parseInt(durationVal, 10);
    if (isNaN(duration) || duration < 1) return;

    let endDate, totalDays, durationLabel;

    if (selectedUnit === 'days') {
        totalDays     = duration;
        durationLabel = `${duration} day${duration !== 1 ? 's' : ''}`;
        endDate       = new Date(startDate.getTime() + (totalDays - 1) * 86400000);

    } else if (selectedUnit === 'weeks') {
        totalDays     = duration * 7;
        durationLabel = `${duration} week${duration !== 1 ? 's' : ''} (${totalDays} days)`;
        endDate       = new Date(startDate.getTime() + (totalDays - 1) * 86400000);

    } else {
        // Months: same calendar day n months later, minus 1 day
        const rawEnd  = new Date(startDate.getFullYear(), startDate.getMonth() + duration, startDate.getDate());
        endDate       = new Date(rawEnd.getTime() - 86400000);
        totalDays     = Math.round((endDate - startDate) / 86400000) + 1;
        durationLabel = `${duration} month${duration !== 1 ? 's' : ''} (${totalDays} days)`;
    }

    document.getElementById('opt2-end-text').textContent      = `Ends: ${formatDateLong(endDate)}`;
    document.getElementById('opt2-disp-start').textContent    = formatDateLong(startDate);
    document.getElementById('opt2-disp-duration').textContent = durationLabel;
    document.getElementById('opt2-disp-day').textContent      = `Day ${totalDays} of Antibiotic Therapy`;

    showElement('opt2-output');

    // Scroll: debounced when user is typing, immediate otherwise
    if (delayScroll) {
        opt2ScrollTimer = setTimeout(() => scrollToResults('opt2-output'), 700);
    } else {
        scrollToResults('opt2-output');
    }
}

// ─────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────
function clearAbxForm() {
    ['opt1-start', 'opt1-check', 'opt2-start'].forEach(baseId => {
        const text   = document.getElementById(baseId + '-text');
        const hidden = document.getElementById(baseId + '-hidden');
        if (text)   { text.value = ''; text.classList.remove('invalid'); }
        if (hidden) hidden.value = '';
    });
    const dur = document.getElementById('opt2-duration');
    if (dur) dur.value = '';

    setUnit('days');

    hideElement('opt1-output'); hideElement('opt2-output');
    hideElement('opt1-error');  hideElement('opt2-error');
}
