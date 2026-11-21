/* Institutions: every school, kindergarten, madrasa, college or coaching centre, from first enquiry to using
   the app. Adding one gives it the 3-letter code printed on its khata back covers; its principal signs in to the
   diary with the Google email given here (from the stage Demo shown on). */
import { $, esc, num, fmtDate, ago, DAY, ICON, toast, openDrawer, closeDrawer } from '../ui.js';
import { store, can, canDelete } from '../store.js';

export const STAGES = [['lead', 'Enquiry'], ['demo', 'Demo shown'], ['pilot', 'Pilot'], ['live', 'Using the app'], ['paused', 'Paused']];
export const TYPES = [['kindergarten', 'Kindergarten'], ['school', 'School'], ['madrasa', 'Madrasa'], ['college', 'College'], ['coaching', 'Coaching centre']];
const CLASSES = {
  kindergarten: ['Play', 'KG', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি'],
  school: ['Play', 'KG', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'],
  madrasa: ['নূরানী', 'ইবতেদায়ি ১ম', 'ইবতেদায়ি ২য়', 'ইবতেদায়ি ৩য়', 'ইবতেদায়ি ৪র্থ', 'ইবতেদায়ি ৫ম', 'দাখিল'],
  college: ['একাদশ', 'দ্বাদশ'],
  coaching: ['প্রাথমিক', 'মাধ্যমিক', 'উচ্চ মাধ্যমিক']
};
const stageLabel = (k) => (STAGES.find((s) => s[0] === k) || [k, k])[1];
const typeLabel = (k) => (TYPES.find((s) => s[0] === k) || [k, k])[1];
const stageCls = (k) => ({ live: 'ink', pilot: 'gold', demo: 'gold', paused: 'line' }[k] || '');

// Is the institution using the app well? (live and pilot ones)
export function health(i) {
  const u = i.usage;
  if (!u) return { level: 'none', why: 'No use of the app recorded yet' };
  const why = [];
  if (u.schoolDays && u.attendanceDays / u.schoolDays < 0.6) why.push(`attendance taken on ${u.attendanceDays} of ${u.schoolDays} school days`);
  if (u.lastActive && Date.now() - u.lastActive > 3 * DAY) why.push(`last active ${ago(u.lastActive)}`);
  if (u.parentsTotal && u.parentsActive / u.parentsTotal < 0.4) why.push(`only ${Math.round((u.parentsActive / u.parentsTotal) * 100)}% of parents active`);
  return why.length ? { level: 'low', why: why.join('; ').replace(/^./, (c) => c.toUpperCase()) } : { level: 'ok', why: 'Using it well' };
}

function suggestCode(name) {
  const used = new Set(store.all('institutions').map((i) => i.code));
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  for (let k = 0; k < 500; k++) { const c = Array.from({ length: 3 }, () => L[Math.floor(Math.random() * L.length)]).join(''); if (!used.has(c)) return c; }
  return '';
}

let q = '', stageF = '', typeF = '';
export default {
  id: 'institutions', label: 'Institutions', icon: 'inst', perm: 'institutions',
  render(main) {
    const all = store.all('institutions').sort((a, b) => (b.updated || b.created) - (a.updated || a.created));
    const rows = all.filter((i) => (!stageF || i.stage === stageF) && (!typeF || i.type === typeF) && (!q || `${i.name} ${i.code} ${i.upazila} ${i.eiin}`.toLowerCase().includes(q.toLowerCase())));
    main.innerHTML = `
      <div class="head"><div><h1>Institutions</h1><p class="sub">${num(all.length)} in all · ${num(all.filter((i) => i.stage === 'live').length)} using the app</p></div>
        <button class="btn" type="button" data-new>${ICON('plus')}Add institution</button></div>
      <div class="card">
        <div class="toolbar"><input type="search" placeholder="Search name, code, upazila or EIIN" value="${esc(q)}" data-q aria-label="Search">
          <select data-stage aria-label="Stage"><option value="">All stages</option>${STAGES.map(([k, l]) => `<option value="${k}"${k === stageF ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <select data-type aria-label="Type"><option value="">All types</option>${TYPES.map(([k, l]) => `<option value="${k}"${k === typeF ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        ${rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>Institution</th><th>Code</th><th>Type</th><th>Upazila</th><th>Students</th><th>Stage</th><th>Using the app</th></tr></thead><tbody>
          ${rows.map((i) => { const h = ['live', 'pilot'].includes(i.stage) ? health(i) : null; return `<tr class="row" data-open="${i.id}"><td><b>${esc(i.name)}</b></td><td><b>${esc(i.code)}</b></td><td>${typeLabel(i.type)}</td><td>${esc(i.upazila)}</td><td>${num(i.students)}</td>
            <td><span class="st ${stageCls(i.stage)}">${stageLabel(i.stage)}</span></td><td class="small">${h ? (h.level === 'ok' ? 'Well' : `<span class="st gold">${h.level === 'none' ? 'Not yet' : 'Needs attention'}</span>`) : '—'}</td></tr>`; }).join('')}
          </tbody></table></div>` : `<p class="empty">${all.length ? 'Nothing matches.' : 'No institutions yet. Add the first one when a school says yes, or turn an enquiry into one.'}</p>`}
      </div>`;
    const re = () => this.render(main);
    main.querySelector('[data-q]').addEventListener('input', (e) => { q = e.target.value; re(); main.querySelector('[data-q]').focus(); main.querySelector('[data-q]').setSelectionRange(q.length, q.length); });
    main.querySelector('[data-stage]').addEventListener('change', (e) => { stageF = e.target.value; re(); });
    main.querySelector('[data-type]').addEventListener('change', (e) => { typeF = e.target.value; re(); });
    main.querySelector('[data-new]').addEventListener('click', () => editInstitution());
    main.querySelectorAll('[data-open]').forEach((r) => r.addEventListener('click', () => showInstitution(r.dataset.open)));
  }
};

export function showInstitution(id) {
  const i = store.get('institutions', id); if (!i) return;
  const h = ['live', 'pilot'].includes(i.stage) ? health(i) : null, u = i.usage;
  const tickets = store.all('tickets').filter((t) => t.inst === i.id);
  openDrawer(i.name, `${typeLabel(i.type)} · code ${i.code}`, `
    <dl class="kv"><dt>Stage</dt><dd><span class="st ${stageCls(i.stage)}">${stageLabel(i.stage)}</span></dd>
      <dt>School code</dt><dd>${esc(i.code)} <span class="muted small">(on khata back covers; parents log in with it)</span></dd>
      <dt>EIIN</dt><dd>${esc(i.eiin || '—')}</dd><dt>Location</dt><dd>${esc([i.upazila, i.district].filter(Boolean).join(', ') || '—')}</dd>
      <dt>Contact</dt><dd>${esc(i.contactName || '—')}${i.contactPhone ? ` · ${esc(i.contactPhone)}` : ''}</dd>
      <dt>Diary sign-in</dt><dd>${i.principalEmail ? `${esc(i.principalEmail)} <span class="muted small">(principal, with Google${['demo', 'pilot', 'live'].includes(i.stage) ? '' : '; opens from the stage Demo shown'})</span>` : '<span class="muted">No principal email yet</span>'}</dd>
      <dt>Students</dt><dd>${num(i.students)}</dd><dt>Classes</dt><dd>${esc((i.classes || []).join(', ') || '—')}</dd>
      <dt>Plan</dt><dd>${esc(i.plan || 'Not set')}</dd><dt>Added</dt><dd>${fmtDate(i.created)}</dd>${i.started ? `<dt>Started using</dt><dd>${fmtDate(i.started)}</dd>` : ''}</dl>
    ${h ? `<div class="${h.level === 'ok' ? 'note' : 'callout'}"><b>Using the app:</b> ${esc(h.why)}${u ? `<br><span class="small">Attendance ${u.attendanceDays}/${u.schoolDays} school days · results published ${u.resultsPublished} · monthly checks ${u.checksDone}% · parents active ${num(u.parentsActive)}/${num(u.parentsTotal)}</span>` : ''}</div>` : ''}
    ${can('institutions') ? `<div class="form"><label>Move to stage<select data-stage>${STAGES.map(([k, l]) => `<option value="${k}"${k === i.stage ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>` : ''}
    <div><h3 style="font-size:17px;margin-bottom:8px">Notes</h3>${(i.notes || []).map((n) => `<div class="note" style="margin-bottom:8px">${esc(n.text)}<small>${esc(n.by)} · ${ago(n.at)}</small></div>`).join('') || '<p class="muted small">No notes yet.</p>'}
      <form class="form" data-note style="margin-top:8px"><textarea name="text" placeholder="Visit, call or training notes" maxlength="500" required></textarea><button class="btn small" type="submit">Add note</button></form></div>
    ${tickets.length ? `<div><h3 style="font-size:17px;margin-bottom:8px">Support</h3><ul class="list">${tickets.map((t) => `<li><span>${esc(t.subject)}</span><span class="st">${esc(t.status)}</span></li>`).join('')}</ul></div>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap">${can('institutions') ? '<button class="btn ghost" type="button" data-edit>Edit details</button>' : ''}
      ${canDelete() ? '<button class="btn ghost" type="button" data-del>Delete</button>' : ''}</div>`,
  (el) => {
    const del = el.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => {
      if (!confirm(`Delete ${i.name} (${i.code})? Its notes go too and its principal can no longer sign in to the diary. The school's diary data is kept and the code is not given to another school. Use "Paused" instead if it may come back.`)) return;
      store.unlinkSchool(i);
      store.all('tickets').filter((t) => t.inst === i.id).forEach((t) => store.remove('tickets', t.id));
      store.remove('institutions', i.id, `Deleted institution ${i.name} (${i.code})`); closeDrawer(); toast('Institution deleted');
    });
    const st = el.querySelector('[data-stage]');
    if (st) st.addEventListener('change', () => {
      const patch = { stage: st.value }; if (['pilot', 'live'].includes(st.value) && !i.started) patch.started = Date.now();
      store.update('institutions', i.id, patch, `${i.name}: stage → ${stageLabel(st.value)}`); store.linkSchool({ ...i, ...patch }); toast('Stage changed'); showInstitution(i.id);
    });
    el.querySelector('[data-note]').addEventListener('submit', (e) => {
      e.preventDefault();
      store.update('institutions', i.id, { notes: [...(i.notes || []), { at: Date.now(), by: store.me.name, text: e.target.elements.text.value.trim() }] }, `${i.name}: note added`);
      showInstitution(i.id);
    });
    const ed = el.querySelector('[data-edit]'); if (ed) ed.addEventListener('click', () => editInstitution(i));
  });
}

// Add or edit; `from` pre-fills a new one from an enquiry
export function editInstitution(i = null, from = null) {
  const v = i || { name: from ? from.org : '', type: 'kindergarten', code: suggestCode(), eiin: '', upazila: from ? from.upazila : '', district: '', contactName: from ? from.name : '', contactPhone: from ? from.phone || '' : '', students: '', classes: CLASSES.kindergarten, stage: from ? 'lead' : 'lead', plan: '' };
  const classBoxes = (type, chosen) => (CLASSES[type] || []).map((c) => `<label style="display:inline-flex;align-items:center;gap:6px;font-weight:500;margin:0 12px 6px 0"><input type="checkbox" name="classes" value="${esc(c)}" ${chosen.includes(c) ? 'checked' : ''} style="width:auto">${esc(c)}</label>`).join('');
  openDrawer(i ? 'Edit institution' : 'Add institution', i ? i.name : 'A school, kindergarten, madrasa, college or coaching centre', `
    <form class="form" data-f>
      <label>Name<input name="name" required maxlength="80" value="${esc(v.name)}"></label>
      <div class="row2"><label>Type<select name="type">${TYPES.map(([k, l]) => `<option value="${k}"${k === v.type ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>School code<input name="code" required pattern="[A-Za-z]{3}" maxlength="3" value="${esc(v.code)}" ${i ? 'readonly' : ''} style="text-transform:uppercase"><span class="hint">${i ? 'Printed on khata covers; it does not change.' : '3 letters, printed on khata back covers. Suggested; you can change it.'}</span></label></div>
      <div class="row2"><label>EIIN<input name="eiin" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" value="${esc(v.eiin)}"><span class="hint">If it has one</span></label>
        <label>Students<input name="students" type="number" min="0" max="20000" value="${esc(v.students)}"></label></div>
      <div class="row2"><label>Upazila<input name="upazila" maxlength="40" value="${esc(v.upazila)}"></label><label>District<input name="district" maxlength="40" value="${esc(v.district)}"></label></div>
      <div class="row2"><label>Contact person<input name="contactName" maxlength="60" value="${esc(v.contactName)}"></label><label>Contact phone<input name="contactPhone" inputmode="tel" maxlength="20" value="${esc(v.contactPhone || '')}"></label></div>
      <label>Principal's Google email<input name="principalEmail" type="email" maxlength="120" autocomplete="off" value="${esc(v.principalEmail || '')}"><span class="hint">The principal signs in to the smart diary with this Google account, then adds the teachers</span></label>
      <label>Classes on Paperloop<div data-classes>${classBoxes(v.type, v.classes || [])}</div></label>
      <div class="row2"><label>Stage<select name="stage">${STAGES.map(([k, l]) => `<option value="${k}"${k === v.stage ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Plan<input name="plan" maxlength="40" value="${esc(v.plan)}" placeholder="e.g. Pilot"><span class="hint">Name only; amounts once the plans are decided</span></label></div>
      <p class="err" data-err hidden></p>
      <button class="btn" type="submit">${i ? 'Save' : 'Add institution'}</button>
    </form>`, (el) => {
    const f = el.querySelector('[data-f]');
    f.elements.type.addEventListener('change', () => { el.querySelector('[data-classes]').innerHTML = classBoxes(f.elements.type.value, CLASSES[f.elements.type.value] || []); });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(f), code = String(fd.get('code')).toUpperCase(), err = el.querySelector('[data-err]');
      if (!i && (store.all('institutions').some((x) => x.code === code) || await store.codeTaken(code))) { err.textContent = `Code ${code} is already used. Choose another.`; err.hidden = false; return; }
      const principalEmail = String(fd.get('principalEmail') || '').trim().toLowerCase();
      if (principalEmail && store.all('institutions').some((x) => x.principalEmail === principalEmail && (!i || x.id !== i.id))) { err.textContent = 'This email is already the principal of another institution.'; err.hidden = false; return; }
      const rec = { name: fd.get('name').trim(), type: fd.get('type'), eiin: fd.get('eiin').trim(), students: +fd.get('students') || 0, upazila: fd.get('upazila').trim(), district: fd.get('district').trim(),
        contactName: fd.get('contactName').trim(), contactPhone: fd.get('contactPhone').trim(), principalEmail, classes: fd.getAll('classes'), stage: fd.get('stage'), plan: fd.get('plan').trim() };
      if (['pilot', 'live'].includes(rec.stage) && !(i && i.started)) rec.started = Date.now();
      if (i) { const old = i.principalEmail || ''; store.update('institutions', i.id, rec, `${rec.name}: details changed`); store.linkSchool({ ...i, ...rec }, old); toast('Saved'); showInstitution(i.id); return; }
      const made = store.add('institutions', { ...rec, code, notes: [], usage: null }, `Added ${rec.name} (${code})`);
      store.linkSchool(made);
      if (from) store.update('leads', from.id, { status: 'won', inst: made.id }, `${from.org || from.name}: became an institution`);
      openDrawer('Institution added', made.name, `
        <div class="callout"><b>Smart diary</b><br>${made.principalEmail ? `The principal signs in with Google as <b>${esc(made.principalEmail)}</b>${['demo', 'pilot', 'live'].includes(made.stage) ? '' : ' once the stage is Demo shown, Pilot or Using the app'}, then adds the teachers' Gmail.` : 'Add the principal\'s Google email (Edit details) to let them sign in to the diary.'}</div>
        <p class="small muted">School code <b>${esc(code)}</b> goes on this school's khata back covers; parents log in with it, their class, roll and PIN.</p>
        <button class="btn" type="button" data-done>Done</button>`, (d) => d.querySelector('[data-done]').addEventListener('click', closeDrawer));
    });
  });
}
