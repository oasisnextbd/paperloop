/* Shows a landing page made in Paperloop Admin and takes enquiries into Enquiries & orders.
   ?page=<address>; ?demo=1 uses the admin's demo data; ?preview=1 shows a draft and counts no visit.
   Until the Paperloop database is connected the pages and enquiries are kept in this browser. */
const qs = new URLSearchParams(location.search);
const KEY = qs.has('demo') ? 'pl_admin_demo_v1' : 'pl_admin_live_v1';
const preview = qs.has('preview'), slug = (qs.get('page') || '').toLowerCase();
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const write = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } };
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const data = read();
const page = data && (data.pages || []).find((p) => p.slug === slug && (p.status === 'live' || preview));
const main = document.getElementById('page');
if (!page) {
  main.innerHTML = '<h1>এই পেজটি এখন নেই</h1><p class="muted">ঠিকানাটি আবার দেখুন, অথবা <a href="../">Paperloop-এর ওয়েবসাইটে</a> যান।</p>';
} else {
  const en = page.lang === 'en', t = (bn, e) => (en ? e : bn);
  document.documentElement.lang = page.lang;
  document.title = page.title || 'Paperloop';
  if (!preview) { page.views = (page.views || 0) + 1; write(data); }
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
  document.getElementById('ask').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const d = read() || { leads: [] };
    (d.leads = d.leads || []).push({ id: 'w' + Date.now().toString(36), created: Date.now(), kind: page.kind || 'diary', status: 'new', source: 'Landing page', page: page.slug,
      summary: page.title, name: f.name.trim(), phone: f.phone.trim(), org: f.org.trim(), upazila: f.upazila.trim(), message: f.message.trim(), owner: '', notes: [] });
    const ok = write(d);
    e.target.outerHTML = ok ? `<p class="done">${t('ধন্যবাদ! আমরা শিগগিরই আপনার সাথে যোগাযোগ করব।', 'Thank you! We will contact you soon.')}</p>`
      : `<p class="done">${t('পাঠানো গেল না। আবার চেষ্টা করুন।', 'Could not send. Please try again.')}</p>`;
  });
}
