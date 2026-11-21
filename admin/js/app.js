/* Start-up, sign-in, the menu and re-drawing. Each section is a module in js/views/ exporting
   { id, label, icon, perm, badge?, render(main) }; add one to VIEWS to add a section. */
import { $, esc, ICON, initials, closeDrawer, toast } from './ui.js';
import { store, ROLES, can } from './store.js';
import overview from './views/overview.js';
import leads from './views/leads.js';
import institutions from './views/institutions.js';
import usage from './views/usage.js';
import pages from './views/pages.js';
import standards from './views/standards.js';
import support from './views/support.js';
import website from './views/website.js';
import simulator from './views/simulator.js';
import team from './views/team.js';

const VIEWS = [overview, leads, institutions, usage, pages, standards, support, website, simulator, team];
const ME_KEY = () => `pl_admin_me_${store.mode}`;
let current = 'overview';

const allowed = (v) => !v.perm || can(v.perm);
function pick() {
  const want = decodeURIComponent(location.hash.slice(1)) || 'overview';
  const v = VIEWS.find((x) => x.id === want && allowed(x)) || VIEWS.find(allowed);
  current = v.id;
  return v;
}

function renderNav() {
  $('#nav').innerHTML = VIEWS.filter(allowed).map((v) => {
    const b = v.badge ? v.badge() : 0;
    return `<button type="button" data-view="${v.id}" ${v.id === current ? 'aria-current="page"' : ''}>${ICON(v.icon)}<span>${esc(v.label)}</span>${b ? `<span class="count">${b}</span>` : ''}</button>`;
  }).join('');
  const me = store.me;
  $('#me').hidden = false;
  $('#me').innerHTML = `<span class="avatar">${esc(initials(me.name))}</span><span class="who-t" style="min-width:0"><b>${esc(me.name)}</b><span class="pill">${esc(ROLES[me.role].label)}</span></span>`;
  // Which records are showing, and where they are kept until the Paperloop database is connected
  $('#demoChip').hidden = false;
  $('#demoChip').textContent = store.mode === 'demo' ? 'Demo data (Simulator)' : 'Live records · kept in this browser until the database is connected';
}

function draw() {
  if (!store.me) return signIn();
  $('#app').classList.remove('signed-out');
  const v = pick();
  renderNav();
  v.render($('#main'));
}

// Until Google sign-in for the Paperloop team is connected, a person picks their name in this browser
function signIn() {
  $('#app').classList.add('signed-out');
  const staff = store.all('staff');
  const mark = '<svg class="mark" viewBox="-51.3 -35.4 132.4 70.7" aria-hidden="true"><path class="a" d="M0 0L-14.14 -14.14A20.00 20.00 0 1 0 -14.14 14.14Z"/><path class="b" d="M0 0L22.88 -22.88A32.36 32.36 0 1 1 22.88 22.88Z"/></svg>';
  if (!staff.length) {
    $('#main').innerHTML = `<div class="signin card">${mark}<h1 style="margin-top:10px">Set up Paperloop Admin</h1>
      <p class="sub">First time here: add the owner. The owner adds the rest of the team later.</p>
      <form class="form" id="setup" style="margin-top:16px"><label>Owner's name<input name="name" required maxlength="60" autocomplete="name"></label>
      <button class="btn" type="submit">Create and sign in</button></form>
      <p class="sub small" style="margin-top:14px">Records are kept in this browser until the Paperloop database is connected.</p></div>`;
    $('#setup').addEventListener('submit', (e) => {
      e.preventDefault();
      const s = store.add('staff', { name: e.target.elements.name.value.trim(), role: 'owner' });
      store.setMe(s); store.log('Set up the admin'); sessionStorage.setItem(ME_KEY(), s.id); draw();
    });
    return;
  }
  $('#main').innerHTML = `<div class="signin card">${mark}<h1 style="margin-top:10px">Paperloop Admin</h1>
    <p class="sub">${store.mode === 'demo' ? 'Demo data is on. Choose who to sign in as.' : 'Choose your name to sign in.'}</p>
    <div class="who">${staff.map((s) => `<button type="button" data-who="${s.id}"><span class="avatar">${esc(initials(s.name))}</span><span><b>${esc(s.name)}</b><br><span class="muted small">${esc(ROLES[s.role].label)}</span></span></button>`).join('')}</div>
    ${store.mode === 'demo' ? '<button class="btn ghost small" type="button" id="leaveDemo" style="margin-top:14px">Turn demo data off</button>' : ''}</div>`;
  $('#main').querySelectorAll('[data-who]').forEach((b) => b.addEventListener('click', () => {
    store.setMe(store.get('staff', b.dataset.who)); sessionStorage.setItem(ME_KEY(), b.dataset.who); draw();
  }));
  const leave = $('#leaveDemo');
  if (leave) leave.addEventListener('click', () => { store.setMode('live'); draw(); });
}

export function signOut() { sessionStorage.removeItem(ME_KEY()); store.setMe(null); closeDrawer(); location.hash = ''; draw(); }
export function switchMode(m) { store.setMode(m); closeDrawer(); const id = sessionStorage.getItem(ME_KEY()); if (id && store.get('staff', id)) store.setMe(store.get('staff', id)); location.hash = ''; draw(); toast(m === 'demo' ? 'Demo data on' : 'Demo data off: live records'); }

document.addEventListener('click', (e) => {
  const nav = e.target.closest('#nav [data-view]');
  if (nav) { location.hash = nav.dataset.view; return; }
  if (e.target.closest('#me')) {
    const me = store.me;
    import('./ui.js').then(({ openDrawer }) => openDrawer(me.name, ROLES[me.role].label,
      `<p>${store.mode === 'demo' ? 'You are looking at <b>demo data</b>.' : 'You are looking at the live records.'}</p><button class="btn ghost" type="button" data-out>Sign out</button>`,
      (el) => el.querySelector('[data-out]').addEventListener('click', signOut)));
  }
});
window.addEventListener('hashchange', () => { closeDrawer(); draw(); });
document.addEventListener('drawerclosed', () => { if (store.me) draw(); });
store.subscribe(() => { if (store.me && !document.querySelector('.drawer')) draw(); else if (store.me) renderNav(); });

// start
const saved = sessionStorage.getItem(ME_KEY());
if (saved && store.get('staff', saved)) store.setMe(store.get('staff', saved));
draw();
