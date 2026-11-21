/* Landing pages: the team makes a page for a campaign, an upazila or a product without a developer.
   A live page opens at paperloop/p/?page=<address>; its form saves an enquiry straight into
   Enquiries & orders, marked with the page. */
import { esc, num, fmtDate, ICON, toast, openDrawer, closeDrawer } from '../ui.js';
import { store, canDelete } from '../store.js';
import { KINDS } from './leads.js';

export const TEMPLATES = {
  diary: { label: 'Smart diary for schools', kind: 'diary', title: 'স্কুলের জন্য স্মার্ট ডায়েরি', headline: 'খাতা আর ডায়েরি, এক জায়গায়',
    sub: 'হাজিরা, বাড়ির কাজ, ফলাফল ও মাসিক অগ্রগতি: অভিভাবক ফোনেই দেখেন।',
    points: ['স্কুল কোড, শ্রেণি আর রোল দিয়ে অভিভাবকের লগইন', 'প্রতিটি বিষয়ে ন্যূনতম মান: প্রথম হওয়া নয়, শেখা', 'স্কুলের নিজের লোগো ও রঙে সব প্রিন্ট'], cta: 'ডেমো দেখতে চাই' },
  khata: { label: 'School khata', kind: 'khata', title: 'স্কুলের নিজস্ব খাতা', headline: 'স্কুলের নাম ও লোগোসহ খাতা',
    sub: 'প্লে থেকে পঞ্চম শ্রেণি: দাগ, বক্স ও ৪-দাগ খাতা।', points: ['স্কুলের নিজের মলাট', 'শ্রেণি অনুযায়ী দাগ', 'খাতার পেছনে স্কুল কোড'], cta: 'দাম জানতে চাই' },
  paper: { label: 'A4 paper for offices', kind: 'a4', title: 'অফিসের A4 কাগজ', headline: 'সময়মতো A4 কাগজ', sub: '৭০, ৭৫ ও ৮০ GSM রিম।', points: ['নিয়মিত সরবরাহ', 'রিম ও কার্টন'], cta: 'অর্ডার দিতে চাই' },
  blank: { label: 'Blank page', kind: 'diary', title: '', headline: '', sub: '', points: [], cta: 'যোগাযোগ করতে চাই' }
};
const pageUrl = (slug) => new URL(`../p/?page=${encodeURIComponent(slug)}${store.mode === 'demo' ? '&demo=1' : ''}`, location.href).href;

export default {
  id: 'pages', label: 'Landing pages', icon: 'pages', perm: 'pages',
  render(main) {
    const pages = store.all('pages').sort((a, b) => (b.updated || b.created) - (a.updated || a.created));
    const leads = store.all('leads');
    main.innerHTML = `
      <div class="head"><div><h1>Landing pages</h1><p class="sub">Pages for a campaign, an upazila or a product. Their form fills Enquiries & orders.</p></div>
        <button class="btn" type="button" data-new>${ICON('plus')}New landing page</button></div>
      <div class="card">${pages.length ? `<div class="tbl-wrap"><table><thead><tr><th>Page</th><th>Address</th><th>Status</th><th>Visits</th><th>Enquiries</th><th>Changed</th><th></th></tr></thead><tbody>
        ${pages.map((p) => `<tr class="row" data-open="${p.id}"><td><b>${esc(p.title || '(no title)')}</b><br><span class="muted small">${esc((KINDS.find((k) => k[0] === p.kind) || ['', ''])[1])}</span></td>
          <td class="small">p/?page=${esc(p.slug)}</td><td><span class="st ${p.status === 'live' ? 'ink' : 'line'}">${p.status === 'live' ? 'Live' : 'Draft'}</span></td>
          <td>${num(p.views)}</td><td>${num(leads.filter((l) => l.page === p.slug).length)}</td><td class="small">${fmtDate(p.updated || p.created)}</td>
          <td>${canDelete() ? `<button class="btn ghost small" type="button" data-del="${p.id}">Delete</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="empty">No landing pages yet. Start one from a template.</p>'}</div>`;
    main.querySelector('[data-new]').addEventListener('click', newPage);
    main.querySelectorAll('[data-open]').forEach((r) => r.addEventListener('click', (e) => { if (!e.target.closest('[data-del]')) editPage(r.dataset.open); }));
    main.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => deletePage(b.dataset.del)));
  }
};

function deletePage(id) {
  const p = store.get('pages', id); if (!p) return;
  if (!confirm(`Delete the landing page "${p.title || p.slug}"? Its link stops working. Enquiries it brought stay.`)) return;
  store.remove('pages', p.id, `Deleted landing page ${p.title || p.slug}`); closeDrawer(); toast('Landing page deleted');
}

function newPage() {
  openDrawer('New landing page', 'Start from a template; every word can be changed', `
    <div class="who">${Object.entries(TEMPLATES).map(([k, t]) => `<button type="button" data-t="${k}"><span class="avatar">${ICON('pages')}</span><span><b>${t.label}</b><br><span class="muted small">${esc(t.headline || 'Write everything yourself')}</span></span></button>`).join('')}</div>`, (el) => {
    el.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
      const t = TEMPLATES[b.dataset.t];
      // Nothing is saved until Save or Publish
      editPage(null, { slug: 'page-' + Math.random().toString(36).slice(2, 6), title: t.title, lang: 'bn', kind: t.kind, headline: t.headline, sub: t.sub, points: t.points.slice(), cta: t.cta, status: 'draft', views: 0 });
    }));
  });
}

function editPage(id, fresh = null) {
  const p = id ? store.get('pages', id) : fresh; if (!p) return;
  const isNew = !id;
  openDrawer(isNew ? 'New landing page' : (p.title || 'Landing page'), isNew ? 'Not saved yet' : p.status === 'live' ? 'Live' : 'Draft', `
    <form class="form" data-f>
      <label>Page title<input name="title" maxlength="80" required value="${esc(p.title)}"><span class="hint">Shown in the browser tab and when the link is shared</span></label>
      <div class="row2"><label>Address<input name="slug" required pattern="[a-z0-9\\-]{3,40}" maxlength="40" value="${esc(p.slug)}"><span class="hint">a–z, 0–9 and -, e.g. kasba-schools</span></label>
        <label>Language<select name="lang"><option value="bn"${p.lang === 'bn' ? ' selected' : ''}>বাংলা</option><option value="en"${p.lang === 'en' ? ' selected' : ''}>English</option></select></label></div>
      <label>Headline<input name="headline" maxlength="80" required value="${esc(p.headline)}"></label>
      <label>Sub-headline<textarea name="sub" maxlength="200">${esc(p.sub)}</textarea></label>
      <label>Points (one per line)<textarea name="points" maxlength="600">${esc((p.points || []).join('\n'))}</textarea></label>
      <div class="row2"><label>Button text<input name="cta" maxlength="40" required value="${esc(p.cta)}"></label>
        <label>Enquiries go in as<select name="kind">${KINDS.map(([k, l]) => `<option value="${k}"${k === p.kind ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <p class="err" data-err hidden></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" type="submit">Save</button>
        <button class="btn ghost" type="button" data-live>${p.status === 'live' ? 'Take offline' : 'Publish'}</button>
        ${p.status === 'live' ? `<a class="btn ghost" href="${esc(pageUrl(p.slug))}" target="_blank" rel="noopener">${ICON('ext')}Open</a><button class="btn ghost" type="button" data-copy>Copy link</button>` : ''}
        ${!isNew && canDelete() ? '<button class="btn ghost" type="button" data-del>Delete</button>' : ''}
      </div>
    </form>
    ${isNew ? '<p class="sub small">Save it to see the preview.</p>' : `<div><h3 style="font-size:17px;margin-bottom:8px">Preview</h3><div class="preview"><iframe title="Preview" src="${esc(pageUrl(p.slug) + '&preview=1')}"></iframe></div></div>`}`, (el) => {
    const f = el.querySelector('[data-f]'), err = el.querySelector('[data-err]');
    const read = () => { const d = Object.fromEntries(new FormData(f)); return { ...d, slug: d.slug.trim().toLowerCase(), points: d.points.split('\n').map((s) => s.trim()).filter(Boolean) }; };
    const valid = (d) => {
      if (store.all('pages').some((x) => x.slug === d.slug && x.id !== p.id)) { err.textContent = 'Another page already uses this address.'; err.hidden = false; return false; }
      return true;
    };
    // A new page is created on its first Save or Publish
    const save = (patch, logText) => (isNew ? store.add('pages', { ...p, ...patch }, logText).id : (store.update('pages', p.id, patch, logText), p.id));
    f.addEventListener('submit', (e) => { e.preventDefault(); const d = read(); if (!valid(d)) return; const id2 = save(d, `Landing page saved: ${d.title}`); toast('Saved'); editPage(id2); });
    el.querySelector('[data-live]').addEventListener('click', () => {
      if (!f.reportValidity()) return; const d = read(); if (!valid(d)) return;
      const live = p.status !== 'live';
      const id2 = save({ ...d, status: live ? 'live' : 'draft' }, `${d.title}: ${live ? 'published' : 'taken offline'}`);
      toast(live ? 'Published' : 'Taken offline'); editPage(id2);
    });
    const cp = el.querySelector('[data-copy]'); if (cp) cp.addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText(pageUrl(p.slug)); toast('Link copied'); });
    const del = el.querySelector('[data-del]'); if (del) del.addEventListener('click', () => deletePage(p.id));
  });
}
