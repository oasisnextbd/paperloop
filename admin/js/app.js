/* Start-up, sign-in, the menu and re-drawing. Each section is a module in js/views/ exporting
   { id, label, icon, perm, badge?, render(main) }; add one to VIEWS to add a section. */
import { $, esc, ICON, initials, closeDrawer, toast } from './ui.js';
import { store, ROLES, can } from './store.js';
import { firebase, currentUser } from '../../assets/js/firebase.js';
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
const DEMO_ME = 'pl_admin_me_demo';
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
  // Demo data is on: say so, with the way back to the live records
  $('#demoChip').hidden = store.mode !== 'demo';
  $('#demoChip').innerHTML = store.mode === 'demo'
    ? 'Demo data is on <button class="btn small" type="button" data-demo-off style="margin-top:6px;width:100%">Turn demo data off</button>' : '';
}

function draw() {
  if (!store.me) return store.mode === 'demo' ? demoSignIn() : liveSignIn();
  $('#app').classList.remove('signed-out');
  const v = pick();
  renderNav();
  v.render($('#main'));
}

const MARK = '<svg class="mark" viewBox="-51.3 -35.4 132.4 70.7" aria-hidden="true"><path class="a" d="M0 0L-14.14 -14.14A20.00 20.00 0 1 0 -14.14 14.14Z"/><path class="b" d="M0 0L22.88 -22.88A32.36 32.36 0 1 1 22.88 22.88Z"/></svg>';
const card = (body) => { $('#app').classList.add('signed-out'); $('#main').innerHTML = `<div class="signin card">${MARK}${body}</div>`; };

// Live records: the Paperloop team signs in with Google. A person is let in only when the owner has added
// their Google email to the team (the database itself refuses everyone else; see firestore.rules).
let signingIn = false;
async function liveSignIn() {
  if (signingIn) return;
  signingIn = true;
  card('<h1 style="margin-top:10px">Paperloop Admin</h1><p class="sub">Connecting…</p>');
  try {
    const user = await currentUser();
    if (!user) { signingIn = false; return googleButton(); }
    const email = String(user.email || '').toLowerCase();
    const { F, db } = await firebase({ auth: true, cache: true });
    let person = null;
    try { const snap = await F.getDoc(F.doc(db, 'team', email)); if (snap.exists() && snap.data().active !== false && ROLES[snap.data().role]) person = snap.data(); } catch (e) { person = null; }
    if (!person) { signingIn = false; return notOnTeam(email); }
    store.setMe({ ...person, id: email, email });
    await store.startLive();
    signingIn = false;
    if (store.mode === 'live' && store.me) draw();
  } catch (e) {
    signingIn = false;
    card(`<h1 style="margin-top:10px">Paperloop Admin</h1><p class="sub">The Paperloop database could not be reached. Check the internet connection and try again.</p>
      <button class="btn" type="button" id="retry" style="margin-top:14px">Try again</button>`);
    $('#retry').addEventListener('click', draw);
  }
}
function googleButton(note = '') {
  card(`<h1 style="margin-top:10px">Paperloop Admin</h1><p class="sub">For the Paperloop team. Sign in with the Google account the owner added to the team.</p>
    <button class="btn" type="button" id="google" style="margin-top:16px">Sign in with Google</button>
    <p class="err" id="signErr" ${note ? '' : 'hidden'}>${esc(note)}</p>`);
  $('#google').addEventListener('click', async () => {
    const { auth, U } = await firebase({ auth: true, cache: true });
    try { await U.signInWithPopup(auth, new U.GoogleAuthProvider()); draw(); }
    catch (e) {
      if (e && ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e.code)) return;
      const err = $('#signErr'); err.hidden = false;
      err.textContent = e && e.code === 'auth/popup-blocked' ? 'The browser blocked the sign-in window. Allow pop-ups for this site and try again.'
        : e && e.code === 'auth/unauthorized-domain' ? 'This web address is not allowed to sign in yet (Firebase → Authentication → Settings → Authorized domains).'
        : 'Sign-in did not work. Try again.';
    }
  });
}
function notOnTeam(email) {
  card(`<h1 style="margin-top:10px">Not on the team</h1><p class="sub"><b>${esc(email)}</b> is not on the Paperloop team. Ask the owner to add this email under Team, or sign in with another Google account.</p>
    <button class="btn" type="button" id="other" style="margin-top:16px">Use another account</button>`);
  $('#other').addEventListener('click', () => signOut());
}

// Demo data: a sample team; choose who to sign in as
function demoSignIn() {
  const staff = store.all('staff');
  card(`<h1 style="margin-top:10px">Paperloop Admin</h1><p class="sub">Demo data is on. Choose who to sign in as.</p>
    <div class="who">${staff.map((s) => `<button type="button" data-who="${s.id}"><span class="avatar">${esc(initials(s.name))}</span><span><b>${esc(s.name)}</b><br><span class="muted small">${esc(ROLES[s.role].label)}</span></span></button>`).join('')}</div>
    <button class="btn ghost small" type="button" id="leaveDemo" style="margin-top:14px">Turn demo data off</button>`);
  $('#main').querySelectorAll('[data-who]').forEach((b) => b.addEventListener('click', () => {
    store.setMe(store.get('staff', b.dataset.who)); sessionStorage.setItem(DEMO_ME, b.dataset.who); draw();
  }));
  $('#leaveDemo').addEventListener('click', () => switchMode('live'));
}

export async function signOut() {
  closeDrawer(); location.hash = '';
  if (store.mode === 'demo') { sessionStorage.removeItem(DEMO_ME); store.setMe(null); return draw(); }
  store.setMode('live');
  const { auth, U } = await firebase({ auth: true, cache: true });
  await U.signOut(auth);
  draw();
}
export function switchMode(m) {
  store.setMode(m); closeDrawer();
  const id = sessionStorage.getItem(DEMO_ME);
  if (m === 'demo' && id && store.get('staff', id)) store.setMe(store.get('staff', id));
  location.hash = ''; draw(); toast(m === 'demo' ? 'Demo data on' : 'Demo data off: live records');
}
// The database refused or could not take a change
store.onFail((e) => toast(e && e.code === 'permission-denied' ? 'Not saved: your role cannot change this.' : 'Not saved: check the internet connection.'));

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-demo-off]')) { switchMode('live'); return; }
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
const saved = sessionStorage.getItem(DEMO_ME);
if (store.mode === 'demo' && saved && store.get('staff', saved)) store.setMe(store.get('staff', saved));
draw();
