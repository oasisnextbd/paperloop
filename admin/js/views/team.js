/* Team (owner): who works in the admin and what each may do, and a log of every change.
   Live: each person signs in with the Google email added here; removing them locks them out at once. */
import { esc, ago, initials, ICON, toast, openDrawer } from '../ui.js';
import { store, ROLES } from '../store.js';

const WHAT = { owner: 'Everything, including the team and the simulator', ops: 'Institutions, enquiries, usage, landing pages, standard & topics, support', sales: 'Enquiries, institutions and landing pages' };
export default {
  id: 'team', label: 'Team', icon: 'team', perm: 'all',
  render(main) {
    const staff = store.all('staff'), log = store.all('activity').slice(0, 60);
    main.innerHTML = `
      <div class="head"><div><h1>Team</h1><p class="sub">Paperloop staff in the admin</p></div><button class="btn" type="button" data-new>${ICON('plus')}Add person</button></div>
      <div class="grid two">
        <div class="card"><h2>People</h2><ul class="list">${staff.map((s) => `<li><span style="display:flex;gap:10px;align-items:center"><span class="avatar">${esc(initials(s.name))}</span><span><b>${esc(s.name)}</b><br><span class="muted small">${store.mode === 'live' ? `${esc(s.email || s.id)} · ` : ''}${esc(WHAT[s.role])}</span></span></span>
          <span style="display:flex;gap:6px;align-items:center"><select data-role="${s.id}" ${s.id === store.me.id ? 'disabled' : ''} aria-label="Role">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}"${k === s.role ? ' selected' : ''}>${r.label}</option>`).join('')}</select>
          ${s.id === store.me.id ? '' : `<button class="btn ghost small" type="button" data-del="${s.id}">Remove</button>`}</span></li>`).join('')}</ul>
          <p class="sub small">${store.mode === 'demo' ? 'Demo data: a sample team.' : 'People sign in with Google, using the email added here.'}</p></div>
        <div class="card"><h2>Activity</h2>${log.length ? `<ul class="list">${log.map((a) => `<li><span>${esc(a.text)}<br><span class="muted small">${esc(a.by)}</span></span><span class="muted small">${ago(a.at)}</span></li>`).join('')}</ul>` : '<p class="empty">No changes yet.</p>'}</div>
      </div>`;
    main.querySelector('[data-new]').addEventListener('click', () => openDrawer('Add person', '', `
      <form class="form" data-f><label>Name<input name="name" required maxlength="60"></label>
        ${store.mode === 'live' ? '<label>Google email<input name="email" type="email" required maxlength="120" autocomplete="off"><span class="hint">The Google account they will sign in with</span></label>' : ''}
        <p class="err" data-err hidden></p>
        <label>Role<select name="role">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}">${r.label}: ${WHAT[k]}</option>`).join('')}</select></label>
        <button class="btn" type="submit">Add</button></form>`, (el) => el.querySelector('[data-f]').addEventListener('submit', (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      if (d.email !== undefined) {
        d.email = d.email.trim().toLowerCase(); d.active = true;
        if (store.get('staff', d.email)) { const err = e.target.querySelector('[data-err]'); err.textContent = 'This email is already on the team.'; err.hidden = false; return; }
      }
      store.add('staff', d, `Added ${d.name} (${ROLES[d.role].label})`); toast('Added');
      import('../ui.js').then(({ closeDrawer }) => closeDrawer());
    })));
    main.querySelectorAll('[data-role]').forEach((s) => s.addEventListener('change', () => { const p = store.get('staff', s.dataset.role); store.update('staff', p.id, { role: s.value }, `${p.name}: role → ${ROLES[s.value].label}`); toast('Saved'); }));
    main.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { const p = store.get('staff', b.dataset.del); if (confirm(`Remove ${p.name}?`)) store.remove('staff', p.id, `Removed ${p.name}`); }));
  }
};
