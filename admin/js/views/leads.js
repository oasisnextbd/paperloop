/* Enquiries & orders: schools asking for the smart diary, and khata, A4 and ring-binder orders. They come from
   the website, landing pages, calls, field visits and referrals. */
import { esc, num, ago, fmtDate, ICON, toast, openDrawer } from '../ui.js';
import { store, can, canDelete } from '../store.js';
import { editInstitution } from './institutions.js';

export const KINDS = [['diary', 'Smart diary'], ['khata', 'School khata'], ['a4', 'A4 paper'], ['ring', 'Ring binder']];
export const LEAD_STATUS = [['new', 'New'], ['contacted', 'Contacted'], ['demo', 'Demo shown'], ['won', 'Customer'], ['lost', 'Not now']];
export const SOURCES = ['Website', 'Landing page', 'Field visit', 'Phone call', 'Referral', 'Facebook', 'Fair or event'];
const kindLabel = (k) => (KINDS.find((x) => x[0] === k) || [k, k])[1];
const statusLabel = (k) => (LEAD_STATUS.find((x) => x[0] === k) || [k, k])[1];
const stCls = (k) => ({ new: 'gold', won: 'ink', lost: 'line' }[k] || '');
const staffName = (id) => { const s = store.get('staff', id); return s ? s.name : 'Nobody yet'; };

let q = '', statusF = '', kindF = '';
export default {
  id: 'leads', label: 'Enquiries & orders', icon: 'leads', perm: 'leads',
  badge: () => store.all('leads').filter((l) => l.status === 'new').length,
  render(main) {
    const all = store.all('leads').sort((a, b) => b.created - a.created);
    const rows = all.filter((l) => (!statusF || l.status === statusF) && (!kindF || l.kind === kindF) && (!q || `${l.name} ${l.org} ${l.upazila} ${l.summary} ${l.phone || ''}`.toLowerCase().includes(q.toLowerCase())));
    main.innerHTML = `
      <div class="head"><div><h1>Enquiries & orders</h1><p class="sub">${num(all.filter((l) => l.status === 'new').length)} new · ${num(all.length)} in all</p></div>
        <button class="btn" type="button" data-new>${ICON('plus')}Add enquiry</button></div>
      <div class="card">
        <div class="toolbar"><input type="search" placeholder="Search name, institution, upazila, phone" value="${esc(q)}" data-q aria-label="Search">
          <select data-status aria-label="Status"><option value="">All statuses</option>${LEAD_STATUS.map(([k, l]) => `<option value="${k}"${k === statusF ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <select data-kind aria-label="Kind"><option value="">Everything</option>${KINDS.map(([k, l]) => `<option value="${k}"${k === kindF ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        ${rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Upazila</th><th>From</th><th>Status</th><th>With</th></tr></thead><tbody>
          ${rows.map((l) => `<tr class="row" data-open="${l.id}"><td class="small">${ago(l.created)}</td><td><b>${esc(l.org || l.name)}</b><br><span class="muted small">${esc(l.org ? l.name : '')}</span></td>
            <td><span class="st">${kindLabel(l.kind)}</span><br><span class="small">${esc(l.summary)}</span></td><td>${esc(l.upazila)}</td><td class="small">${esc(l.source)}${l.page ? `<br><span class="muted">${esc(l.page)}</span>` : ''}</td>
            <td><span class="st ${stCls(l.status)}">${statusLabel(l.status)}</span></td><td class="small">${esc(staffName(l.owner))}</td></tr>`).join('')}
          </tbody></table></div>` : `<p class="empty">${all.length ? 'Nothing matches.' : 'No enquiries yet. They arrive from the landing pages, or add one from a call or visit.'}</p>`}
      </div>`;
    const re = () => this.render(main);
    main.querySelector('[data-q]').addEventListener('input', (e) => { q = e.target.value; re(); const s = main.querySelector('[data-q]'); s.focus(); s.setSelectionRange(q.length, q.length); });
    main.querySelector('[data-status]').addEventListener('change', (e) => { statusF = e.target.value; re(); });
    main.querySelector('[data-kind]').addEventListener('change', (e) => { kindF = e.target.value; re(); });
    main.querySelector('[data-new]').addEventListener('click', () => addLead());
    main.querySelectorAll('[data-open]').forEach((r) => r.addEventListener('click', () => showLead(r.dataset.open)));
  }
};

function showLead(id) {
  const l = store.get('leads', id); if (!l) return;
  const staff = store.all('staff');
  openDrawer(l.org || l.name, `${kindLabel(l.kind)} · ${fmtDate(l.created)}`, `
    <dl class="kv"><dt>Name</dt><dd>${esc(l.name || '—')}</dd><dt>Institution / shop</dt><dd>${esc(l.org || '—')}</dd>
      <dt>Phone</dt><dd>${l.phone ? `<a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : '—'}</dd><dt>Upazila</dt><dd>${esc(l.upazila || '—')}</dd>
      <dt>Wants</dt><dd>${esc(l.summary || '—')}</dd>${l.message ? `<dt>Message</dt><dd>${esc(l.message)}</dd>` : ''}<dt>From</dt><dd>${esc(l.source)}${l.page ? ` (${esc(l.page)})` : ''}</dd></dl>
    <div class="form"><div class="row2">
      <label>Status<select data-status>${LEAD_STATUS.map(([k, v]) => `<option value="${k}"${k === l.status ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
      <label>With<select data-owner><option value="">Nobody yet</option>${staff.map((s) => `<option value="${s.id}"${s.id === l.owner ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div></div>
    <div><h3 style="font-size:17px;margin-bottom:8px">Notes</h3>${(l.notes || []).map((n) => `<div class="note" style="margin-bottom:8px">${esc(n.text)}<small>${esc(n.by)} · ${ago(n.at)}</small></div>`).join('') || '<p class="muted small">No notes yet.</p>'}
      <form class="form" data-note style="margin-top:8px"><textarea name="text" placeholder="What was said, what comes next" maxlength="500" required></textarea><button class="btn small" type="submit">Add note</button></form></div>
    ${l.kind === 'diary' && !l.inst && can('institutions') ? '<button class="btn" type="button" data-inst>Add as an institution</button>' : ''}
    ${l.inst ? '<p class="note">Already an institution.</p>' : ''}
    ${canDelete() ? '<button class="btn ghost" type="button" data-del>Delete this enquiry</button>' : ''}`, (el) => {
    const del = el.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => { if (confirm('Delete this enquiry? It cannot be brought back.')) { store.remove('leads', l.id, `Deleted enquiry: ${l.org || l.name}`); import('../ui.js').then(({ closeDrawer }) => closeDrawer()); toast('Enquiry deleted'); } });
    el.querySelector('[data-status]').addEventListener('change', (e) => { store.update('leads', l.id, { status: e.target.value }, `${l.org || l.name}: ${statusLabel(e.target.value)}`); toast('Status changed'); });
    el.querySelector('[data-owner]').addEventListener('change', (e) => { store.update('leads', l.id, { owner: e.target.value }, `${l.org || l.name}: given to ${staffName(e.target.value)}`); toast('Saved'); });
    el.querySelector('[data-note]').addEventListener('submit', (e) => {
      e.preventDefault();
      store.update('leads', l.id, { notes: [...(l.notes || []), { at: Date.now(), by: store.me.name, text: e.target.elements.text.value.trim() }], status: l.status === 'new' ? 'contacted' : l.status }, `${l.org || l.name}: note added`);
      showLead(l.id);
    });
    const ins = el.querySelector('[data-inst]'); if (ins) ins.addEventListener('click', () => editInstitution(null, l));
  });
}

function addLead() {
  openDrawer('Add enquiry', 'From a call, a visit, a fair or a referral', `
    <form class="form" data-f>
      <div class="row2"><label>Name<input name="name" required maxlength="60"></label><label>Phone<input name="phone" inputmode="tel" maxlength="20"></label></div>
      <div class="row2"><label>Institution or shop<input name="org" maxlength="80"></label><label>Upazila<input name="upazila" maxlength="40"></label></div>
      <div class="row2"><label>Wants<select name="kind">${KINDS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
        <label>From<select name="source">${SOURCES.map((s) => `<option>${s}</option>`).join('')}</select></label></div>
      <label>Details<input name="summary" maxlength="120" placeholder="e.g. 500 khata, 60 pages; or 200 students"></label>
      <button class="btn" type="submit">Add</button></form>`, (el) => {
    el.querySelector('[data-f]').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      const rec = store.add('leads', { ...f, status: 'new', owner: store.me.id, notes: [] }, `New enquiry: ${f.org || f.name}`);
      toast('Enquiry added'); showLead(rec.id);
    });
  });
}
