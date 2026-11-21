/* Shows a landing page made in Paperloop Admin and takes enquiries into Enquiries & orders.
   ?page=<address> reads a published page from the Paperloop database; ?preview=1 shows a draft to a signed-in
   team member (the admin's preview) and counts no visit; ?demo=1 uses the admin's demo data in this browser. */
import { firebase } from '../assets/js/firebase.js';

const qs = new URLSearchParams(location.search);
const demo = qs.has('demo'), preview = qs.has('preview'), slug = (qs.get('page') || '').toLowerCase();
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const main = document.getElementById('page');
const missing = () => { main.innerHTML = '<h1>এই পেজটি এখন নেই</h1><p class="muted">ঠিকানাটি আবার দেখুন, অথবা <a href="../">Paperloop-এর ওয়েবসাইটে</a> যান।</p>'; };

// Demo data: the admin's demo set in this browser
const DEMO_KEY = 'pl_admin_demo_v1';
const readDemo = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { return null; } };
const demoSource = {
  async find() { const d = readDemo(); return (d && (d.pages || []).find((p) => p.slug === slug && (p.status === 'live' || preview))) || null; },
  async visit() { const d = readDemo(); const p = d && d.pages.find((x) => x.slug === slug); if (p) { p.views = (p.views || 0) + 1; localStorage.setItem(DEMO_KEY, JSON.stringify(d)); } },
  async send(lead) { const d = readDemo() || {}; (d.leads = d.leads || []).push({ id: 'w' + Date.now().toString(36), ...lead }); localStorage.setItem(DEMO_KEY, JSON.stringify(d)); }
};

// Live: the Paperloop database. Anyone may read a published page, add one visit and send an enquiry;
// nothing else (see firestore.rules).
const liveSource = {
  async find() {
    const { F, db, auth, U } = await firebase({ auth: preview });
    if (preview && auth) await new Promise((r) => { const stop = U.onAuthStateChanged(auth, () => { stop(); r(); }); });
    const where = [F.where('slug', '==', slug)];
    if (!preview) where.push(F.where('status', '==', 'live'));
    const snap = await F.getDocs(F.query(F.collection(db, 'pages'), ...where, F.limit(1)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },
  async visit(page) { const { F, db } = await firebase(); await F.updateDoc(F.doc(db, 'pages', page.id), { views: F.increment(1) }); },
  async send(lead) { const { F, db } = await firebase(); await F.addDoc(F.collection(db, 'leads'), lead); }
};
const source = demo ? demoSource : liveSource;

let page = null;
try { page = slug ? await source.find() : null; } catch (e) { page = null; }
if (!page) missing();
else {
  const en = page.lang === 'en', t = (bn, e) => (en ? e : bn);
  document.documentElement.lang = page.lang;
  document.title = page.title || 'Paperloop';
  if (!preview) source.visit(page).catch(() => {});
  main.innerHTML = `
    <section class="hero"><h1>${esc(page.headline)}</h1>${page.sub ? `<p>${esc(page.sub)}</p>` : ''}<a class="cta" href="#ask">${esc(page.cta)}</a></section>
    ${(page.points || []).length ? `<ul class="points">${page.points.map((p) => `<li>${check}<span>${esc(p)}</span></li>`).join('')}</ul>` : ''}
    <form class="form" id="ask">
      <h2>${esc(page.cta)}</h2>
      <div class="row"><label>${t('আপনার নাম', 'Your name')}<input name="name" required maxlength="60" autocomplete="name"></label>
        <label>${t('মোবাইল নম্বর', 'Mobile number')}<input name="phone" required inputmode="tel" maxlength="20" autocomplete="tel" pattern="[0-9+ ০-৯\\-]{8,20}"></label></div>
      <div class="row"><label>${t('প্রতিষ্ঠানের নাম', 'Institution')}<input name="org" maxlength="80" autocomplete="organization"></label>
        <label>${t('উপজেলা', 'Upazila')}<input name="upazila" maxlength="40"></label></div>
      <label>${t('কিছু জানাতে চাইলে', 'Anything else')}<textarea name="message" rows="3" maxlength="400"></textarea></label>
      <button class="cta" type="submit">${t('পাঠান', 'Send')}</button>
      <p class="note">${t('আপনার নাম ও নম্বর শুধু Paperloop আপনার সাথে যোগাযোগের জন্য ব্যবহার করবে।', 'Paperloop uses your name and number only to contact you.')}</p>
    </form>`;
  document.getElementById('ask').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target, btn = form.querySelector('button[type=submit]');
    const f = Object.fromEntries(new FormData(form));
    const lead = { created: Date.now(), kind: page.kind || 'diary', status: 'new', source: 'Landing page', page: page.slug,
      summary: String(page.title || '').slice(0, 120), name: f.name.trim(), phone: f.phone.trim(), org: f.org.trim(), upazila: f.upazila.trim(), message: f.message.trim(), owner: '', notes: [] };
    btn.disabled = true;
    try {
      await source.send(lead);
      form.outerHTML = `<p class="done">${t('ধন্যবাদ! আমরা শিগগিরই আপনার সাথে যোগাযোগ করব।', 'Thank you! We will contact you soon.')}</p>`;
    } catch (err) {
      btn.disabled = false;
      let note = form.querySelector('.send-err');
      if (!note) { note = document.createElement('p'); note.className = 'note send-err'; form.appendChild(note); }
      note.textContent = t('পাঠানো গেল না। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।', 'Could not send. Check the internet connection and try again.');
    }
  });
}
