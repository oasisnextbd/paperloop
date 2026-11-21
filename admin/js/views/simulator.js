/* Simulator (owner): made-up data for presentations, kept apart from the real records.
   The real admin and the real diary show only real data; demo data never reaches schools. */
import { esc, toast } from '../ui.js';
import { store } from '../store.js';
import { switchMode } from '../app.js';

const DIARY = [
  ['principal', 'Principal', 'প্রিন্সিপাল / অ্যাডমিন: সব কার্ড, ফলাফল প্রকাশ, স্কুলের ডিজাইন'],
  ['classteacher', 'Class teacher', 'রাশেদা বেগম, ৩য় শ্রেণি: হাজিরা, মেসেজ, রিপোর্ট'],
  ['subjectteacher', 'Subject teacher', 'কামরুল হাসান, গণিত: নম্বর ও মাসিক যাচাই'],
  ['parent', 'Parent', 'তাসনিম জারিন, ৩য় শ্রেণি, রোল ০৭']
];
export default {
  id: 'simulator', label: 'Simulator', icon: 'sim', perm: 'all',
  render(main) {
    const demo = store.mode === 'demo';
    main.innerHTML = `
      <div class="head"><div><h1>Simulator</h1><p class="sub">Made-up data for showing Paperloop to schools. The real admin and the real diary stay clean.</p></div></div>
      <div class="grid two">
        <div class="card"><h2>The diary with demo data</h2><p class="sub" style="margin-bottom:12px">Opens the smart diary filled with a sample school (KSB): students, marks, notices, messages. Nothing there reaches a real school.</p>
          <div class="who">${DIARY.map(([k, l, d]) => `<a class="btn ghost" style="justify-content:flex-start;text-align:left" href="../diary/?demo=${k}" target="_blank" rel="noopener"><span><b>${l}</b><br><span class="muted small" style="font-weight:400">${esc(d)}</span></span></a>`).join('')}</div></div>
        <div class="card"><h2>Admin demo data</h2><p class="sub">Sample institutions, enquiries, usage and landing pages for a pitch. While it is on, everything you see and change here is demo data.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn" type="button" data-mode>${demo ? 'Turn demo data off' : 'Turn demo data on'}</button>
            <button class="btn ghost" type="button" data-reset>Start the demo data again</button></div>
          <p class="sub small" style="margin-top:12px">Now showing: <b>${demo ? 'demo data' : 'live records'}</b>.</p></div>
      </div>`;
    main.querySelector('[data-mode]').addEventListener('click', () => {
      // keep the founder signed in on the other side (demo has its own sample team)
      const meName = store.me.name, to = demo ? 'live' : 'demo';
      if (to === 'demo') sessionStorage.setItem('pl_admin_me_demo', 's1');
      switchMode(to);
      if (to === 'live' && !store.me) toast(`Sign in as ${meName}`);
    });
    main.querySelector('[data-reset]').addEventListener('click', () => { if (confirm('Start the demo data again? Changes made in demo data are lost.')) { store.resetDemo(); toast('Demo data restarted'); } });
  }
};
