/* The admin's data. Two separate sets:
   live  the real records (institutions, enquiries, landing pages…) in the Paperloop database (Firestore),
         read and written by the team after Google sign-in; empty until the team adds them
   demo  made-up records for presentations, switched on by the founders in Simulator; kept only in this browser
   The views read and write through `store` the same way for both; live changes reach every team member at once. */
import { sampleData } from './sample.js';
import { firebase } from '../../assets/js/firebase.js';

const DEMO_KEY = 'pl_admin_demo_v1';
const MODE_KEY = 'pl_admin_mode';
export const COMMON_TOPICS = {
  'বাংলা': ['যুক্তবর্ণ', 'বানান', 'জোরে পড়া', 'হাতের লেখা'],
  'ইংরেজি': ['Word meaning', '৪-দাগে হাতের লেখা', 'বাক্য গঠন', 'Reading'],
  'গণিত': ['নামতা', 'যোগ-বিয়োগ', 'গুণ-ভাগ', 'ভগ্নাংশ'],
  'বিজ্ঞান': ['চিত্র আঁকা ও চিহ্নিত করা', 'সংজ্ঞা ও ধারণা', 'পর্যবেক্ষণ ও প্রশ্ন'],
  'বাংলাদেশ ও বিশ্বপরিচয়': ['মানচিত্র ও দিক', 'দেশ ও সমাজ', 'সময় ও ঘটনা'],
  'ধর্ম শিক্ষা': ['পাঠ মুখে বলা', 'অর্থ ও শিক্ষা', 'লিখিত উত্তর']
};
const DEFAULT_SETTINGS = { minPct: 60, topics: COMMON_TOPICS };
const empty = () => ({ staff: [], leads: [], institutions: [], pages: [], tickets: [], activity: [], settings: { ...DEFAULT_SETTINGS } });
// Database collection of each kind of record (the team is kept under each person's Google email)
const COL = { staff: 'team', leads: 'leads', institutions: 'institutions', pages: 'pages', tickets: 'tickets', activity: 'activity' };

const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

let mode = read(MODE_KEY) === 'demo' ? 'demo' : 'live';
let data = mode === 'demo' ? loadDemo() : empty();
const subs = new Set();
const notify = () => subs.forEach((f) => f());
let me = null;
let onFail = () => {};

function loadDemo() {
  const saved = read(DEMO_KEY);
  if (saved && saved.staff) return { ...empty(), ...saved };
  return { ...empty(), ...sampleData() };
}
let n = 0;
const newId = () => Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 5);

// ---------- live: the Paperloop database ----------
let fb = null, listening = [];
const strip = ({ id, ...rest }) => rest;
function send(promise) { promise.catch((e) => onFail(e)); }
function liveWrite(op, col, id, value) {
  if (!fb) return;
  const { F, db } = fb, ref = F.doc(db, COL[col], id);
  if (op === 'set') send(F.setDoc(ref, value));
  else if (op === 'update') send(F.updateDoc(ref, value));
  else send(F.deleteDoc(ref));
}
function stopLive() { listening.forEach((f) => f()); listening = []; }
// Start reading every collection; resolves once each has arrived the first time
async function startLive() {
  stopLive();
  fb = await firebase({ auth: true, cache: true });
  const { F, db } = fb;
  const firsts = [];
  const watch = (q, apply) => firsts.push(new Promise((resolve) => {
    listening.push(F.onSnapshot(q, (snap) => { apply(snap); resolve(); notify(); }, (e) => { onFail(e); resolve(); }));
  }));
  for (const [col, name] of Object.entries(COL)) {
    const q = col === 'activity' ? F.query(F.collection(db, name), F.orderBy('at', 'desc'), F.limit(300)) : F.collection(db, name);
    watch(q, (snap) => { if (mode === 'live') data[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() })); });
  }
  watch(F.doc(db, 'settings', 'main'), (snap) => { if (mode === 'live') data.settings = { ...DEFAULT_SETTINGS, ...(snap.exists() ? snap.data() : {}) }; });
  await Promise.all(firsts);
}

function save() { if (mode === 'demo') write(DEMO_KEY, data); notify(); }

export const store = {
  get mode() { return mode; },
  get me() { return me; },
  setMe(s) { me = s; },
  // What to do when the database refuses or fails a change (the views show it as a message)
  onFail(f) { onFail = f; },
  startLive, stopLive,
  setMode(m) {
    mode = m; write(MODE_KEY, m); me = null;
    if (m === 'demo') { stopLive(); data = loadDemo(); } else data = empty();
    notify();
  },
  resetDemo() { const d = { ...empty(), ...sampleData() }; write(DEMO_KEY, d); if (mode === 'demo') { data = d; notify(); } },
  all: (col) => (data[col] || []).slice(),
  get: (col, id) => (data[col] || []).find((x) => x.id === id) || null,
  add(col, obj, logText) {
    // A team member's record is kept under their Google email
    const id = mode === 'live' && col === 'staff' ? String(obj.email || '').trim().toLowerCase()
      : mode === 'live' && fb ? fb.F.doc(fb.F.collection(fb.db, COL[col])).id : newId();
    const rec = { id, created: Date.now(), ...obj };
    (data[col] = data[col] || []).push(rec);
    if (mode === 'live') liveWrite('set', col, id, strip(rec));
    if (logText) this.log(logText);
    save(); return rec;
  },
  update(col, id, patch, logText) {
    const rec = this.get(col, id); if (!rec) return null;
    const change = { ...patch, updated: Date.now() };
    Object.assign(rec, change);
    if (mode === 'live') liveWrite('update', col, id, change);
    if (logText) this.log(logText);
    save(); return rec;
  },
  remove(col, id, logText) {
    data[col] = (data[col] || []).filter((x) => x.id !== id);
    if (mode === 'live') liveWrite('delete', col, id);
    if (logText) this.log(logText);
    save();
  },
  settings: () => data.settings,
  saveSettings(patch, logText) {
    data.settings = { ...data.settings, ...patch };
    if (mode === 'live' && fb) send(fb.F.setDoc(fb.F.doc(fb.db, 'settings', 'main'), patch, { merge: true }));
    if (logText) this.log(logText);
    save();
  },
  log(text) {
    const rec = { id: mode === 'live' && fb ? fb.F.doc(fb.F.collection(fb.db, 'activity')).id : newId(), at: Date.now(), by: me ? me.name : '—', byId: me ? me.id : '', text };
    (data.activity = data.activity || []).unshift(rec); data.activity = data.activity.slice(0, 300);
    if (mode === 'live') liveWrite('set', 'activity', rec.id, strip(rec));
  },
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); },

  // ---------- The smart diary's side of an institution (live only) ----------
  // schools/{CODE} lets the school use the diary (active while on a demo, pilot or in use); members/{email}
  // lets its principal sign in with Google. A school's diary data stays under its code even if it is deleted
  // here, so a code is never given to another school.
  linkSchool(inst, oldEmail = '') {
    if (mode !== 'live' || !fb) return;
    const { F, db } = fb, email = String(inst.principalEmail || '').trim().toLowerCase();
    send(F.setDoc(F.doc(db, 'schools', inst.code), { name: inst.name, principal: email, active: ['demo', 'pilot', 'live'].includes(inst.stage), deleted: false, updated: Date.now() }, { merge: true }));
    if (oldEmail && oldEmail !== email) send(F.deleteDoc(F.doc(db, 'members', oldEmail)));
    if (email) send(F.setDoc(F.doc(db, 'members', email), { code: inst.code, role: 'principal', name: inst.contactName || '' }));
  },
  unlinkSchool(inst) {
    if (mode !== 'live' || !fb) return;
    const { F, db } = fb;
    send(F.setDoc(F.doc(db, 'schools', inst.code), { active: false, deleted: true, principal: '', updated: Date.now() }, { merge: true }));
    if (inst.principalEmail) send(F.deleteDoc(F.doc(db, 'members', inst.principalEmail)));
  },
  // Has a school ever used this code (also one deleted from the admin)?
  async codeTaken(code) {
    if (mode !== 'live' || !fb) return false;
    try { return (await fb.F.getDoc(fb.F.doc(fb.db, 'schools', code))).exists(); } catch (e) { return false; }
  }
};

// Roles: what each part of the team may do
export const ROLES = {
  owner: { label: 'Owner', can: ['all'] },
  ops: { label: 'Operations', can: ['leads', 'institutions', 'usage', 'pages', 'standards', 'support', 'website'] },
  sales: { label: 'Sales', can: ['leads', 'institutions', 'pages', 'website'] }
};
// Deleting records: the owner and operations
export const canDelete = () => !!me && ['owner', 'ops'].includes(me.role);
export const can = (what) => !!me && (ROLES[me.role].can.includes('all') || ROLES[me.role].can.includes(what));

// Another tab changed the demo data
window.addEventListener('storage', (e) => { if (mode === 'demo' && e.key === DEMO_KEY) { data = loadDemo(); notify(); } });
