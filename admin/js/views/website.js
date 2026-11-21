/* Website: the state of the public Paperloop website, read from its real settings (site.json), and its pages. */
import { esc, num } from '../ui.js';
import { store } from '../store.js';

let cfg = null, failed = false;
export default {
  id: 'website', label: 'Website', icon: 'website', perm: 'website',
  render(main) {
    if (!cfg && !failed) fetch('../site.json', { cache: 'no-store' }).then((r) => r.json()).then((j) => { cfg = j; this.render(main); }).catch(() => { failed = true; this.render(main); });
    const c = cfg || {}, contact = c.contact || {};
    const contacts = [['WhatsApp', contact.whatsapp_number], ['Phone', contact.phone_display], ['Email', contact.email], ['Facebook', contact.facebook_url]];
    const live = store.all('pages').filter((p) => p.status === 'live');
    const yes = (v) => (v ? '<span class="st ink">Yes</span>' : '<span class="st gold">No</span>');
    main.innerHTML = `
      <div class="head"><div><h1>Website</h1><p class="sub">The public Paperloop website, from its settings file (site.json)</p></div><a class="btn ghost" href="../" target="_blank" rel="noopener">Open the website</a></div>
      ${!cfg ? `<div class="card"><p class="empty">${failed ? 'The settings file could not be read.' : 'Reading the settings…'}</p></div>` : `
      <div class="grid three" style="margin-bottom:18px">
        <div class="card"><h2>Launch</h2><ul class="list"><li><span>Launched (search engines may list it)</span>${yes(c.launched)}</li><li><span>Prices shown</span>${yes(c.show_prices)}</li><li><span>Address</span><span class="small">${esc(c.base_url)}</span></li></ul></div>
        <div class="card"><h2>Contacts on the site</h2><ul class="list">${contacts.map(([k, v]) => `<li><span>${k}</span>${v ? `<span class="small">${esc(v)}</span>` : '<span class="st gold">Not set</span>'}</li>`).join('')}</ul>
          <p class="sub small">Empty contacts are not shown. The order memo can then only be copied.</p></div>
        <div class="card"><h2>Pages</h2><ul class="list">
          <li><a href="../" target="_blank" rel="noopener">Home (বাংলা)</a><span class="st ink">Live</span></li><li><a href="../en/" target="_blank" rel="noopener">Home (English)</a><span class="st ink">Live</span></li>
          <li><a href="../diary/" target="_blank" rel="noopener">Smart diary</a><span class="st ink">Live</span></li><li><span>Landing pages</span><b>${num(live.length)} live</b></li></ul></div>
      </div>
      <div class="card"><h2>Visitors</h2><p class="sub">Visitor numbers need a visitor counter on the website. Landing pages count their own visits (see Landing pages); the website's order calculators build a message the customer sends, so those orders arrive by phone or WhatsApp and are added under Enquiries & orders.</p></div>`}`;
  }
};
