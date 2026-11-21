/* Small helpers shared by every section: escaping, dates, icons, the drawer and the toast. */
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const DAY = 86400000;
export const fmtDate = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtShort = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export function ago(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} days ago` : fmtDate(t);
}
export const num = (n) => Number(n || 0).toLocaleString('en-IN');
export const initials = (name) => String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// Monochrome line icons (Lucide shapes)
const P = {
  overview: '<path d="M3 3v18h18"/><path d="M7 16v-4"/><path d="M12 16V8"/><path d="M17 16v-7"/>',
  leads: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  inst: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h1"/><path d="M14 9h1"/><path d="M9 13h1"/><path d="M14 13h1"/><path d="M10 21v-4h4v4"/>',
  usage: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  pages: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  standard: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  support: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  sim: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
};
export const ICON = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

let toastTimer;
export function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}

// A panel on the right for details and forms; bind(el) wires its buttons
export function openDrawer(title, sub, html, bind) {
  const root = $('#drawerRoot');
  root.innerHTML = `<div class="drawer-back" data-close></div>
    <section class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header><div><h2>${esc(title)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>
        <button class="btn ghost small" type="button" data-close aria-label="Close">${ICON('x')}</button></header>
      <div class="body">${html}</div></section>`;
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', escClose);
  if (bind) bind(root.querySelector('.body'));
  const first = root.querySelector('.body input, .body select, .body textarea');
  if (first) first.focus();
}
function escClose(e) { if (e.key === 'Escape') closeDrawer(); }
export function closeDrawer() {
  const was = !!$('#drawerRoot').firstChild;
  $('#drawerRoot').innerHTML = ''; document.removeEventListener('keydown', escClose);
  if (was) document.dispatchEvent(new Event('drawerclosed')); // the section re-draws with any changes
}

// A bar chart of counts per day (inline SVG)
export function dayChart(days, values) {
  const w = 760, h = 240, l = 34, b = 26, max = Math.max(4, ...values), step = Math.ceil(max / 4);
  const top = step * 4, bw = (w - l - 10) / days.length;
  const y = (v) => h - b - (v / top) * (h - b - 12);
  const grid = [0, 1, 2, 3, 4].map((i) => `<line class="gl" x1="${l}" x2="${w}" y1="${y(i * step)}" y2="${y(i * step)}"/><text x="${l - 8}" y="${y(i * step) + 4}" text-anchor="end">${i * step}</text>`).join('');
  const every = Math.ceil(days.length / 6);
  const bars = values.map((v, i) => `<rect class="bar" x="${l + i * bw + bw * 0.18}" y="${y(v)}" width="${bw * 0.64}" height="${h - b - y(v)}" rx="2"><title>${fmtShort(days[i])}: ${v}</title></rect>`).join('');
  const labels = days.map((d, i) => (i % every ? '' : `<text x="${l + i * bw + bw / 2}" y="${h - 6}" text-anchor="middle">${fmtShort(d)}</text>`)).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Per day">${grid}${bars}${labels}</svg>`;
}
