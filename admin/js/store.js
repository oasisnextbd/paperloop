/* The admin's data. Two separate sets:
   live  the real records (institutions, enquiries, landing pages…), empty until the team adds them
   demo  made-up records for presentations, switched on by the founders in Simulator
   Until the Paperloop database is connected both are kept in this browser (localStorage); the public landing
   page (../p/) reads published pages and saves enquiries into the same live set. */
import { sampleData } from './sample.js';

const KEYS = { live: 'pl_admin_live_v1', demo: 'pl_admin_demo_v1' };
const MODE_KEY = 'pl_admin_mode';
export const COMMON_TOPICS = {
  'বাংলা': ['যুক্তবর্ণ', 'বানান', 'জোরে পড়া', 'হাতের লেখা'],
  'ইংরেজি': ['Word meaning', '৪-দাগে হাতের লেখা', 'বাক্য গঠন', 'Reading'],
  'গণিত': ['নামতা', 'যোগ-বিয়োগ', 'গুণ-ভাগ', 'ভগ্নাংশ'],
  'বিজ্ঞান': ['চিত্র আঁকা ও চিহ্নিত করা', 'সংজ্ঞা ও ধারণা', 'পর্যবেক্ষণ ও প্রশ্ন'],
  'বাংলাদেশ ও বিশ্বপরিচয়': ['মানচিত্র ও দিক', 'দেশ ও সমাজ', 'সময় ও ঘটনা'],
  'ধর্ম শিক্ষা': ['পাঠ মুখে বলা', 'অর্থ ও শিক্ষা', 'লিখিত উত্তর']
};
const empty = () => ({ staff: [], leads: [], institutions: [], pages: [], tickets: [], activity: [], settings: { minPct: 60, topics: COMMON_TOPICS } });

const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

let mode = read(MODE_KEY) === 'demo' ? 'demo' : 'live';
let data = load(mode);
const subs = new Set();
let me = null;

function load(m) {
  const saved = read(KEYS[m]);
  if (saved && saved.staff) return { ...empty(), ...saved };
  return m === 'demo' ? { ...empty(), ...sampleData() } : empty();
}
function save() { write(KEYS[mode], data); subs.forEach((f) => f()); }
let n = 0;
const newId = () => Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 5);

export const store = {
  get mode() { return mode; },
  get me() { return me; },
  setMe(s) { me = s; },
  setMode(m) { mode = m; write(MODE_KEY, m); data = load(m); me = null; subs.forEach((f) => f()); },
  resetDemo() { data = { ...empty(), ...sampleData() }; if (mode === 'demo') save(); else write(KEYS.demo, data); },
  all: (col) => (data[col] || []).slice(),
  get: (col, id) => (data[col] || []).find((x) => x.id === id) || null,
  add(col, obj, logText) {
    const rec = { id: newId(), created: Date.now(), ...obj };
    (data[col] = data[col] || []).push(rec);
    if (logText) this.log(logText);
    save(); return rec;
  },
  update(col, id, patch, logText) {
    const rec = this.get(col, id); if (!rec) return null;
    Object.assign(rec, patch, { updated: Date.now() });
    if (logText) this.log(logText);
    save(); return rec;
  },
  remove(col, id, logText) { data[col] = (data[col] || []).filter((x) => x.id !== id); if (logText) this.log(logText); save(); },
  settings: () => data.settings,
  saveSettings(patch, logText) { data.settings = { ...data.settings, ...patch }; if (logText) this.log(logText); save(); },
  log(text) { (data.activity = data.activity || []).unshift({ id: newId(), at: Date.now(), by: me ? me.name : '—', text }); data.activity = data.activity.slice(0, 300); },
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); }
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

// Another tab (e.g. a landing page saving an enquiry) changed the data
window.addEventListener('storage', (e) => { if (e.key === KEYS[mode]) { data = load(mode); subs.forEach((f) => f()); } });
