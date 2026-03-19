/* ═══════════════════════════════════════════════
   PharmaTrace HSgB — Main JavaScript
   MTAC RVD, Hospital Sungai Buloh
═══════════════════════════════════════════════ */

/* ══════════════════════════════════
   SHARED UTILITIES
══════════════════════════════════ */
function toInputDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(str) {
    if (!str) return '—';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
}
function setToday(id) {
    document.getElementById(id).value = toInputDate(new Date());
}

/* ══════════════════════════════════
   TAB SWITCHING
══════════════════════════════════ */
function switchTab(tab) {
    document.getElementById('tab-mpr').classList.toggle('active', tab === 'mpr');
    document.getElementById('tab-pf').classList.toggle('active',  tab === 'pf');
    document.getElementById('btn-mpr').className = 'tab-btn' + (tab === 'mpr' ? ' active-mpr' : '');
    document.getElementById('btn-pf').className  = 'tab-btn' + (tab === 'pf'  ? ' active-pf'  : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   MPRx — OBSERVATION MODE
══════════════════════════════════ */
let mObsMode = 'end';
let mRowCount = 0;

function mSwitchObs(mode) {
    mObsMode = mode;
    ['end', 'fixed'].forEach(m => {
        document.getElementById(`m-tab-${m}`).classList.toggle('active', mode === m);
        document.getElementById(`m-panel-${m}`).classList.toggle('visible', mode === m);
    });
}

/* ══════════════════════════════════
   MPRx — DISPENSING ROWS
══════════════════════════════════ */
function mAddRow() {
    mRowCount++;
    const n  = mRowCount;
    const tr = document.createElement('tr');
    tr.id    = `m-row-${n}`;
    tr.innerHTML = `
        <td><span class="row-num">${n}</span></td>
        <td><input type="number" min="1" placeholder="e.g. 30" id="m-days-${n}"></td>
        <td><input type="date" id="m-date-${n}"></td>
        <td><button class="remove-btn" onclick="mRemoveRow(${n})" title="Remove">✕</button></td>`;
    document.getElementById('m-rows').appendChild(tr);
    mRenumber();
}

function mRemoveRow(id) {
    if (document.querySelectorAll('#m-rows tr').length <= 1) return;
    document.getElementById(`m-row-${id}`)?.remove();
    mRenumber();
}

function mRenumber() {
    document.querySelectorAll('#m-rows tr').forEach((tr, i) => {
        const b = tr.querySelector('.row-num');
        if (b) b.textContent = i + 1;
    });
}

/* ══════════════════════════════════
   MPRx — VALIDATION HELPERS
══════════════════════════════════ */
function mErr(msg) {
    const b = document.getElementById('m-error');
    b.textContent = '⚠ ' + msg;
    b.style.display = 'block';
    b.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function mClearErr() {
    const b = document.getElementById('m-error');
    b.style.display = 'none';
    b.textContent   = '';
}

/* ══════════════════════════════════
   MPRx — CALCULATE
══════════════════════════════════ */
function mCalculate() {
    mClearErr();
    document.getElementById('m-results').style.display = 'none';
    document.getElementById('m-note').style.display    = 'none';

    // 1. Start date
    const startVal = document.getElementById('m-start').value;
    if (!startVal) { mErr('Please enter a Start Date.'); return; }
    const startDate = new Date(startVal + 'T00:00:00');

    // 2. Observation period
    let obsDays;
    if (mObsMode === 'end') {
        const endVal = document.getElementById('m-end').value;
        if (!endVal) { mErr('Please enter an End Date.'); return; }
        const endDate = new Date(endVal + 'T00:00:00');
        if (endDate <= startDate) { mErr('End Date must be after Start Date.'); return; }
        obsDays = Math.round((endDate - startDate) / 86400000);
    } else {
        const fd = parseInt(document.getElementById('m-fixed-days').value);
        if (!fd || fd < 1) { mErr('Please enter a valid duration in days.'); return; }
        obsDays = fd;
    }

    // 3. Dispensing rows
    let totalSupplied = 0;
    const entries = [];
    for (const tr of document.querySelectorAll('#m-rows tr')) {
        const dv = tr.querySelector('input[type="number"]')?.value.trim();
        const dt = tr.querySelector('input[type="date"]')?.value || '';
        if (!dv || dv === '0') continue;
        const d = parseInt(dv);
        if (isNaN(d) || d < 1) { mErr("One or more days' supply values are invalid."); return; }
        totalSupplied += d;
        entries.push({ days: d, date: dt });
    }
    if (entries.length === 0) { mErr("Please enter at least one dispensing record with a valid Days' Supply."); return; }

    // 4. Calculate
    const mpr = (totalSupplied / obsDays) * 100;
    const gap = Math.max(0, obsDays - totalSupplied);

    // 5. WHO adherence classification
    let bText, bClass;
    if      (mpr >= 90) { bText = '✔ Optimal Adherence (≥ 90%)'; bClass = 'optimal'; }
    else if (mpr >= 80) { bText = '⚠ Fair Adherence (80–89%)';   bClass = 'fair'; }
    else                { bText = '✕ Poor Adherence (< 80%)';     bClass = 'poor'; }

    // 6. Render results
    document.getElementById('m-mpr-val').innerHTML   = mpr.toFixed(1) + '<span>%</span>';
    document.getElementById('m-mpr-bar').style.width = Math.min(mpr, 100).toFixed(1) + '%';
    const badge = document.getElementById('m-mpr-badge');
    badge.textContent = bText;
    badge.className   = 'mpr-badge ' + bClass;
    document.getElementById('m-obs').textContent      = obsDays;
    document.getElementById('m-supplied').textContent = totalSupplied;
    document.getElementById('m-gap').textContent      = gap;
    // Amber highlight on gap box only when there are actual gap days
    const gapBox = document.querySelector('#m-results .gap-box');
    if (gapBox) gapBox.classList.toggle('has-gap', gap > 0);

    // 7. Dispensing summary table
    const sb = document.getElementById('m-summ-body');
    sb.innerHTML = '';
    document.getElementById('m-summ-wrap').style.display = 'block';
    entries.forEach((e, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${i+1}</strong></td>
            <td>${e.date ? formatDate(e.date) : '<span style="color:#bbb">Not recorded</span>'}</td>
            <td><strong>${e.days}</strong> days</td>`;
        sb.appendChild(tr);
    });
    const tot = document.createElement('tr');
    tot.innerHTML = `<td colspan="2" style="font-weight:700;color:#1B5E20;padding-top:10px;">Total Days Supplied</td>
        <td style="font-weight:700;color:#1B5E20;padding-top:10px;">${totalSupplied} days</td>`;
    sb.appendChild(tot);

    // 8. Show results, then build + show note (note must be visible before auto-sizing textarea)
    document.getElementById('m-results').style.display = 'block';
    document.getElementById('m-note').style.display = 'block';
    mBuildNote(startVal, obsDays, totalSupplied, gap, mpr, bText, entries);
    // Single smooth scroll accounting for sticky header + tab bar (~130px)
    const el = document.getElementById('m-results');
    const top = el.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({ top, behavior: 'smooth' });
}

/* ══════════════════════════════════
   MPRx — CLINICAL NOTE
══════════════════════════════════ */
function mBuildNote(startVal, obsDays, supplied, gap, mpr, bText, entries) {
    const today    = formatDate(toInputDate(new Date()));
    const startFmt = formatDate(startVal);
    const period   = mObsMode === 'end'
        ? `${startFmt} to ${formatDate(document.getElementById('m-end').value)} (${obsDays} days)`
        : `${startFmt} + ${obsDays} days (fixed duration)`;

    let dispLines = '';
    entries.forEach((e, i) => {
        dispLines += `    ${i+1}. ${e.date ? formatDate(e.date) : 'Date not recorded'} — ${e.days} days' supply\n`;
    });

    // Clean adherence text — just the descriptive label, no duplication
    const adherence = mpr >= 90 ? 'Optimal Adherence (≥ 90%)'
                    : mpr >= 80 ? 'Fair Adherence (80–89%)'
                    :             'Poor Adherence (< 80%)';

    const note =
`MEDICATION POSSESSION RATIO (MPR) CALCULATION
Generated by MPRx — MTAC RVD, HSgB | Date: ${today}
──────────────────────────────────────────────────────

OBSERVATION PERIOD
  ${period}

──────────────────────────────────────────────────────

DISPENSING RECORDS
${dispLines}
──────────────────────────────────────────────────────

CALCULATION
  Total Days' Supply Dispensed  :  ${supplied} days
  Total Observation Period      :  ${obsDays} days
  Gap Days (without medication) :  ${gap} days

  MPR = ${supplied} ÷ ${obsDays} × 100 = ${mpr.toFixed(1)}%

──────────────────────────────────────────────────────

ADHERENCE CLASSIFICATION
  ${adherence}`;

    const ta = document.getElementById('m-note-ta');
    ta.value = note;
    // Auto-size after browser has rendered the visible element
    requestAnimationFrame(() => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
    });
}

function mCopyNote() {
    const ta  = document.getElementById('m-note-ta');
    const btn = document.getElementById('m-copy-btn');
    ta.select();
    ta.setSelectionRange(0, 99999);
    try { navigator.clipboard.writeText(ta.value).catch(() => document.execCommand('copy')); }
    catch(e) { document.execCommand('copy'); }
    btn.textContent = '✔ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1H11.5A1.5 1.5 0 0113 2.5V8.5A1.5 1.5 0 0111.5 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Copy to Clipboard`;
        btn.classList.remove('copied');
    }, 2500);
}

/* ══════════════════════════════════
   MPRx — RESET
══════════════════════════════════ */
function mReset() {
    document.getElementById('m-start').value     = '';
    document.getElementById('m-end').value       = '';
    document.getElementById('m-fixed-days').value = '';
    document.getElementById('m-rows').innerHTML  = '';
    mRowCount = 0;
    mAddRow(); mAddRow(); mAddRow();
    mSwitchObs('end');
    mClearErr();
    document.getElementById('m-results').style.display = 'none';
    document.getElementById('m-note').style.display    = 'none';
    const ta = document.getElementById('m-note-ta');
    ta.value = '';
    ta.style.height = 'auto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   PickupFlag — STATUS LOGIC
══════════════════════════════════ */
let pfRowCount = 0;

function pfGetStatus(pickupStr, supply) {
    if (!pickupStr || !supply || supply < 1) return null;
    const pickup   = new Date(pickupStr + 'T00:00:00');
    const expected = new Date(pickup.getTime() + supply * 86400000);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const rem = Math.round((expected - today) / 86400000); // positive = days remaining, negative = overdue

    if (rem > 7) {
        return { cls: 'early',   label: '~Early',             detail: `${rem} days remaining`,                                                  expected };
    } else if (rem >= 0) {
        return { cls: 'ontime',  label: '✔ On time',          detail: rem === 0 ? 'Due today' : `${rem} day${rem === 1 ? '' : 's'} remaining`,  expected };
    } else if (rem >= -6) {
        const over = Math.abs(rem);
        return { cls: 'overdue', label: '⚠ Overdue', detail: `${over} day${over === 1 ? '' : 's'} overdue`,                           expected };
    } else {
        const over = Math.abs(rem);
        return { cls: 'late',    label: '🚩 Late Pickup',             detail: `${over} days overdue`,                                                   expected };
    }
}

/* ══════════════════════════════════
   PickupFlag — ROWS
══════════════════════════════════ */
function pfAddRow() {
    pfRowCount++;
    const id = pfRowCount;
    const tr = document.createElement('tr');
    tr.id = `pf-row-${id}`;
    tr.innerHTML = `
        <td><span class="row-num">${id}</span></td>
        <td><input type="text"   placeholder="Name or MRN…" id="pf-name-${id}"></td>
        <td><input type="date"   id="pf-pickup-${id}" oninput="pfUpdate(${id})"></td>
        <td><input type="number" id="pf-supply-${id}" min="1" placeholder="e.g. 30" oninput="pfUpdate(${id})"></td>
        <td class="calc-cell" id="pf-exp-${id}">—</td>
        <td id="pf-status-${id}">—</td>
        <td><button class="remove-btn" onclick="pfRemoveRow(${id})" title="Remove">✕</button></td>`;
    document.getElementById('pf-rows').appendChild(tr);
    pfRenumber();
}

function pfRemoveRow(id) {
    if (document.querySelectorAll('#pf-rows tr').length <= 1) return;
    document.getElementById(`pf-row-${id}`)?.remove();
    pfRenumber();
    pfUpdateSummary();
}

function pfRenumber() {
    document.querySelectorAll('#pf-rows tr').forEach((tr, i) => {
        const b = tr.querySelector('.row-num');
        if (b) b.textContent = i + 1;
    });
}

/* ══════════════════════════════════
   PickupFlag — LIVE UPDATE
══════════════════════════════════ */
function pfUpdate(id) {
    const pickup     = document.getElementById(`pf-pickup-${id}`)?.value;
    const supply     = parseInt(document.getElementById(`pf-supply-${id}`)?.value);
    const expCell    = document.getElementById(`pf-exp-${id}`);
    const statusCell = document.getElementById(`pf-status-${id}`);

    if (!pickup || !supply || supply < 1) {
        if (expCell)    expCell.textContent = '—';
        if (statusCell) statusCell.innerHTML = '—';
        pfUpdateSummary();
        return;
    }
    const st = pfGetStatus(pickup, supply);
    if (st && expCell)    expCell.textContent = formatDate(toInputDate(st.expected));
    if (st && statusCell) statusCell.innerHTML = `<span class="status-badge badge-${st.cls}">${st.label}<span class="badge-sub">${st.detail}</span></span>`;
    pfUpdateSummary();
}

function pfUpdateSummary() {
    const counts = { early: 0, ontime: 0, overdue: 0, late: 0 };
    let hasAny = false;
    document.querySelectorAll('#pf-rows tr').forEach(tr => {
        const id     = tr.id.replace('pf-row-', '');
        const pickup = document.getElementById(`pf-pickup-${id}`)?.value;
        const supply = parseInt(document.getElementById(`pf-supply-${id}`)?.value);
        if (!pickup || !supply || supply < 1) return;
        const st = pfGetStatus(pickup, supply);
        if (st) { counts[st.cls]++; hasAny = true; }
    });
    const el = document.getElementById('pf-stats');
    el.style.display = hasAny ? 'flex' : 'none';
    document.getElementById('ps-late').textContent    = `🚩 Late Pickup: ${counts.late}`;
    document.getElementById('ps-overdue').textContent = `⚠ Overdue: ${counts.overdue}`;
    document.getElementById('ps-ontime').textContent  = `✔ On time: ${counts.ontime}`;
    document.getElementById('ps-early').textContent   = `~Early: ${counts.early}`;
}

/* ══════════════════════════════════
   PickupFlag — WORD EXPORT
══════════════════════════════════ */
async function pfCopyWord() {
    const today = formatDate(toInputDate(new Date()));
    const sBg = {
        early:   { bg: '#DBEAFE', color: '#1E3A5F' },
        ontime:  { bg: '#D1FAE5', color: '#064E3B' },
        overdue: { bg: '#FEF3C7', color: '#78350F' },
        late:    { bg: '#FEE2E2', color: '#7F1D1D' }
    };

    let bodyRows = '';
    document.querySelectorAll('#pf-rows tr').forEach((tr, idx) => {
        const id     = tr.id.replace('pf-row-', '');
        const name   = document.getElementById(`pf-name-${id}`)?.value.trim() || '—';
        const pickup = document.getElementById(`pf-pickup-${id}`)?.value || '';
        const supply = parseInt(document.getElementById(`pf-supply-${id}`)?.value);
        const rowBg  = idx % 2 === 0 ? '#FFFFFF' : '#F9F9F9';

        if (!pickup || !supply || supply < 1) {
            bodyRows += `<tr style="background:${rowBg};">
                <td style="border:1px solid #ccc;padding:6pt 8pt;text-align:center;">${idx+1}</td>
                <td style="border:1px solid #ccc;padding:6pt 8pt;">${name}</td>
                <td style="border:1px solid #ccc;padding:6pt 8pt;color:#aaa;">—</td>
                <td style="border:1px solid #ccc;padding:6pt 8pt;color:#aaa;">—</td>
                <td style="border:1px solid #ccc;padding:6pt 8pt;color:#aaa;">—</td>
                <td style="border:1px solid #ccc;padding:6pt 8pt;color:#aaa;">—</td></tr>`;
            return;
        }
        const st  = pfGetStatus(pickup, supply);
        const exp = st ? formatDate(toInputDate(st.expected)) : '—';
        const sc  = st ? sBg[st.cls] : { bg: '#fff', color: '#333' };
        const lbl = st ? st.label : '—';
        const det = st ? st.detail : '';

        bodyRows += `<tr style="background:${rowBg};">
            <td style="border:1px solid #ccc;padding:6pt 8pt;text-align:center;">${idx+1}</td>
            <td style="border:1px solid #ccc;padding:6pt 8pt;">${name}</td>
            <td style="border:1px solid #ccc;padding:6pt 8pt;">${formatDate(pickup)}</td>
            <td style="border:1px solid #ccc;padding:6pt 8pt;text-align:center;">${supply} days</td>
            <td style="border:1px solid #ccc;padding:6pt 8pt;">${exp}</td>
            <td style="border:1px solid #ccc;padding:6pt 8pt;background:${sc.bg};color:${sc.color};font-weight:bold;">${lbl}<br><span style="font-weight:normal;font-size:9pt;">${det}</span></td></tr>`;
    });

    const html = `<html><body>
<p style="font-family:Calibri,sans-serif;font-size:10pt;color:#333;margin-bottom:4pt;"><strong>PharmaTrace HSgB — PickupFlag Report</strong></p>
<p style="font-family:Calibri,sans-serif;font-size:9pt;color:#666;margin-bottom:8pt;">MTAC RVD, Hospital Sungai Buloh &nbsp;|&nbsp; Generated: ${today}</p>
<table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;width:100%;">
<thead>
<tr style="background:#004D40;">
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:center;width:28pt;">#</th>
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:left;">Patient / MRN</th>
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:left;">Last Pickup Date</th>
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:left;">Days' Supply</th>
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:left;">Expected Return</th>
  <th style="border:1px solid #004D40;padding:7pt 8pt;color:#fff;text-align:left;">Status</th>
</tr>
</thead>
<tbody>${bodyRows}</tbody>
</table>
<p style="font-family:Calibri,sans-serif;font-size:8pt;color:#aaa;margin-top:6pt;">Generated by PharmaTrace HSgB — PickupFlag | MTAC RVD, HSgB</p>
</body></html>`;

    const btn = document.getElementById('pf-word-btn');
    try {
        await navigator.clipboard.write([
            new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
        ]);
        btn.textContent = '✔ Copied! Now paste into Word';
        btn.style.background = 'linear-gradient(135deg,#2E7D32 0%,#43A047 100%)';
        setTimeout(() => {
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1H11.5A1.5 1.5 0 0113 2.5V8.5A1.5 1.5 0 0111.5 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Copy as Word Table`;
            btn.style.background = '';
        }, 3000);
    } catch(e) {
        btn.textContent = '⚠ Copy failed — try Chrome or Edge';
        setTimeout(() => {
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1H11.5A1.5 1.5 0 0113 2.5V8.5A1.5 1.5 0 0111.5 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Copy as Word Table`;
        }, 3000);
    }
}

/* ══════════════════════════════════
   PickupFlag — RESET
══════════════════════════════════ */
function pfReset() {
    document.getElementById('pf-rows').innerHTML = '';
    pfRowCount = 0;
    pfAddRow(); pfAddRow(); pfAddRow();
    document.getElementById('pf-stats').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════
   INITIALISE
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    mAddRow(); mAddRow(); mAddRow();
    pfAddRow(); pfAddRow(); pfAddRow();
});
