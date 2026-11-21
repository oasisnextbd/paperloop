/* Overview: how Paperloop is doing in the chosen period. */
import { esc, num, ago, DAY, dayChart } from '../ui.js';
import { store } from '../store.js';
import { STAGES, health } from './institutions.js';

let period = 30;
const PERIODS = [[7, '7 days'], [30, '30 days'], [90, '90 days'], [0, 'All time']];

export default {
  id: 'overview', label: 'Overview', icon: 'overview',
  render(main) {
    const now = Date.now(), from = period ? now - period * DAY : 0;
    const leads = store.all('leads'), inst = store.all('institutions'), tickets = store.all('tickets');
    const inPeriod = leads.filter((l) => l.created >= from);
    const live = inst.filter((i) => i.stage === 'live'), pilot = inst.filter((i) => i.stage === 'pilot'), demo = inst.filter((i) => i.stage === 'demo');
    const using = [...live, ...pilot];
    const students = using.reduce((a, i) => a + (+i.students || 0), 0);
    const pTotal = using.reduce((a, i) => a + ((i.usage && i.usage.parentsTotal) || 0), 0), pAct = using.reduce((a, i) => a + ((i.usage && i.usage.parentsActive) || 0), 0);
    const open = tickets.filter((t) => t.status !== 'done');
    const kindCount = (k) => inPeriod.filter((l) => l.kind === k).length;

    // Per-day enquiries (the last 90 days for "All time")
    const span = period || 90, start = new Date(now - (span - 1) * DAY); start.setHours(0, 0, 0, 0);
    const days = Array.from({ length: span }, (_, i) => start.getTime() + i * DAY);
    const perDay = days.map((d) => leads.filter((l) => l.created >= d && l.created < d + DAY).length);

    // From enquiry to a school using the app (diary enquiries)
    const diary = inPeriod.filter((l) => l.kind === 'diary');
    const reached = { contacted: ['contacted', 'demo', 'won'], demo: ['demo', 'won'], won: ['won'] };
    const steps = [['Enquiry', diary.length], ['Reached by the team', diary.filter((l) => reached.contacted.includes(l.status)).length],
      ['Demo shown', diary.filter((l) => reached.demo.includes(l.status)).length], ['Became a customer', diary.filter((l) => l.status === 'won').length]];
    const maxStep = Math.max(1, steps[0][1]);
    const countBy = (arr, key) => Object.entries(arr.reduce((m, x) => { const k = x[key] || '—'; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
    const needCall = leads.filter((l) => l.status === 'new' && now - l.created > DAY).sort((a, b) => a.created - b.created);
    const attention = using.filter((i) => health(i).level !== 'ok');

    main.innerHTML = `
      <div class="head"><div><h1>Overview</h1><p class="sub">${num(inPeriod.length)} enquiries and orders, ${period ? `last ${period} days` : 'all time'}</p></div>
        <div class="seg">${PERIODS.map(([d, l]) => `<button type="button" data-period="${d}" aria-pressed="${d === period}">${l}</button>`).join('')}</div></div>
      <div class="grid kpis">
        <div class="card kpi dark"><div class="k">Institutions using the app</div><div class="v">${num(live.length)}</div><div class="d">+ ${num(pilot.length)} on pilot</div></div>
        <div class="card kpi"><div class="k">Students</div><div class="v">${num(students)}</div><div class="d">in live and pilot institutions</div></div>
        <div class="card kpi"><div class="k">Parents active</div><div class="v">${pTotal ? Math.round((pAct / pTotal) * 100) + '%' : '—'}</div><div class="d">${num(pAct)} of ${num(pTotal)} this month</div></div>
        <div class="card kpi"><div class="k">Enquiries & orders</div><div class="v">${num(inPeriod.length)}</div><div class="d">${num(kindCount('diary'))} diary · ${num(inPeriod.length - kindCount('diary'))} khata & paper</div></div>
        <div class="card kpi"><div class="k">Demos & pilots</div><div class="v">${num(demo.length + pilot.length)}</div><div class="d">${num(demo.length)} demo · ${num(pilot.length)} pilot</div></div>
        <div class="card kpi"><div class="k">Open support</div><div class="v">${num(open.length)}</div><div class="d">${num(open.filter((t) => t.status === 'open').length)} waiting for us</div></div>
      </div>
      <div class="grid two">
        <div class="card chart"><h2>New enquiries and orders per day</h2>${dayChart(days, perDay)}</div>
        <div class="card funnel"><h2>From enquiry to customer</h2>${steps.map(([l, v]) => `<div class="row"><div class="lbl"><span>${l}</span><b>${num(v)}</b></div><div class="track"><i style="width:${(v / maxStep) * 100}%"></i></div></div>`).join('')}
          <p class="sub small">Smart diary enquiries in this period.</p></div>
      </div>
      <div class="grid three" style="margin-bottom:18px">
        <div class="card"><h2>Where they came from</h2>${list(countBy(inPeriod, 'source'))}</div>
        <div class="card"><h2>Upazilas</h2>${list(countBy(inPeriod, 'upazila'))}</div>
        <div class="card"><h2>Needs a call</h2>${needCall.length ? `<ul class="list">${needCall.slice(0, 6).map((l) => `<li><span><b>${esc(l.org || l.name)}</b><br><span class="muted small">${esc(l.summary)}</span></span><span class="muted small">${ago(l.created)}</span></li>`).join('')}</ul><a href="#leads" class="small">All enquiries →</a>` : '<p class="empty">Everyone older than a day has been contacted.</p>'}</div>
      </div>
      <div class="grid three">
        <div class="card"><h2>Institutions by stage</h2>${list(STAGES.map(([k, l]) => [l, inst.filter((i) => i.stage === k).length]))}</div>
        <div class="card" style="grid-column: span 2"><h2>Needs attention</h2>${attention.length ? `<ul class="list">${attention.map((i) => `<li><span><b>${esc(i.name)}</b> <span class="muted small">(${esc(i.code)})</span><br><span class="muted small">${esc(health(i).why)}</span></span><a class="small" href="#usage">Usage →</a></li>`).join('')}</ul>` : '<p class="empty">Every institution on the app is using it well.</p>'}</div>
      </div>`;
    main.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { period = +b.dataset.period; this.render(main); }));
  }
};
function list(rows) {
  return rows.length && rows.some((r) => r[1]) ? `<ul class="list">${rows.map(([k, v]) => `<li><span>${esc(k)}</span><b>${num(v)}</b></li>`).join('')}</ul>` : '<p class="empty">Nothing yet in this period.</p>';
}
