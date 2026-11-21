/* Support: problems and requests from institutions, each with an owner and a history. */
import { esc, num, ago, ICON, toast, openDrawer } from '../ui.js';
import { store } from '../store.js';

const KIND = [['problem', 'Problem'], ['request', 'Request'], ['training', 'Training'], ['question', 'Question']];
const STATUS = [['open', 'Open'], ['waiting', 'Waiting for the school'], ['done', 'Done']];
const label = (arr, k) => (arr.find((x) => x[0] === k) || [k, k])[1];
const instName = (id) => { const i = store.get('institutions', id); return i ? i.name : '—'; };

let show = 'open';
export default {
  id: 'support', label: 'Support', icon: 'support', perm: 'support',
  badge: () => store.all('tickets').filter((t) => t.status === 'open').length,
  render(main) {
    const all = store.all('tickets').sort((a, b) => b.created - a.created);
    const rows = all.filter((t) => (show === 'open' ? t.status !== 'done' : true));
    main.innerHTML = `
      <div class="head"><div><h1>Support</h1><p class="sub">${num(all.filter((t) => t.status !== 'done').length)} not done yet</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><div class="seg"><button type="button" data-show="open" aria-pressed="${show === 'open'}">Not done</button><button type="button" data-show="all" aria-pressed="${show === 'all'}">All</button></div>
        <button class="btn" type="button" data-new>${ICON('plus')}New</button></div></div>
      <div class="card">${rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>When</th><th>Institution</th><th>What</th><th>Kind</th><th>Status</th><th>With</th></tr></thead><tbody>
        ${rows.map((t) => `<tr class="row" data-open="${t.id}"><td class="small">${ago(t.created)}</td><td><b>${esc(instName(t.inst))}</b></td><td>${esc(t.subject)}</td><td>${label(KIND, t.kind)}</td>
          <td><span class="st ${t.status === 'open' ? 'gold' : t.status === 'done' ? 'line' : ''}">${label(STATUS, t.status)}</span></td><td class="small">${esc((store.get('staff', t.owner) || { name: '—' }).name)}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="empty">Nothing waiting.</p>'}</div>`;
    main.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => { show = b.dataset.show; this.render(main); }));
    main.querySelector('[data-new]').addEventListener('click', newTicket);
    main.querySelectorAll('[data-open]').forEach((r) => r.addEventListener('click', () => showTicket(r.dataset.open)));
  }
};

function newTicket() {
  const inst = store.all('institutions'), staff = store.all('staff');
  openDrawer('New support item', '', inst.length ? `
    <form class="form" data-f><label>Institution<select name="inst">${inst.map((i) => `<option value="${i.id}">${esc(i.name)} (${esc(i.code)})</option>`).join('')}</select></label>
      <label>What<input name="subject" required maxlength="120"></label>
      <div class="row2"><label>Kind<select name="kind">${KIND.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
        <label>With<select name="owner">${staff.map((s) => `<option value="${s.id}"${s.id === store.me.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div>
      <button class="btn" type="submit">Add</button></form>` : '<p class="empty">Add the institution first.</p>', (el) => {
    const f = el.querySelector('[data-f]'); if (!f) return;
    f.addEventListener('submit', (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); const t = store.add('tickets', { ...d, status: 'open', notes: [] }, `Support: ${d.subject}`); toast('Added'); showTicket(t.id); });
  });
}
function showTicket(id) {
  const t = store.get('tickets', id); if (!t) return;
  openDrawer(t.subject, instName(t.inst), `
    <div class="form"><label>Status<select data-status>${STATUS.map(([k, l]) => `<option value="${k}"${k === t.status ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div>${(t.notes || []).map((n) => `<div class="note" style="margin-bottom:8px">${esc(n.text)}<small>${esc(n.by)} · ${ago(n.at)}</small></div>`).join('') || '<p class="muted small">No notes yet.</p>'}
      <form class="form" data-note style="margin-top:8px"><textarea name="text" required maxlength="500" placeholder="What was done or said"></textarea><button class="btn small" type="submit">Add note</button></form></div>`, (el) => {
    el.querySelector('[data-status]').addEventListener('change', (e) => { store.update('tickets', t.id, { status: e.target.value }, `Support "${t.subject}": ${label(STATUS, e.target.value)}`); toast('Saved'); });
    el.querySelector('[data-note]').addEventListener('submit', (e) => { e.preventDefault(); store.update('tickets', t.id, { notes: [...(t.notes || []), { at: Date.now(), by: store.me.name, text: e.target.elements.text.value.trim() }] }, `Support "${t.subject}": note`); showTicket(t.id); });
  });
}
