/* App usage: is each institution on the app actually using it? Attendance days, results, monthly checks,
   parents active, last activity. Filled by the diary once it is connected to the Paperloop database. */
import { esc, num, ago } from '../ui.js';
import { store } from '../store.js';
import { health, showInstitution } from './institutions.js';

export default {
  id: 'usage', label: 'App usage', icon: 'usage', perm: 'usage',
  render(main) {
    const rows = store.all('institutions').filter((i) => ['live', 'pilot'].includes(i.stage))
      .map((i) => ({ i, h: health(i) })).sort((a, b) => ({ low: 0, none: 1, ok: 2 }[a.h.level] - { low: 0, none: 1, ok: 2 }[b.h.level]));
    const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
    main.innerHTML = `
      <div class="head"><div><h1>App usage</h1><p class="sub">Institutions on a pilot or using the app, the ones needing attention first</p></div></div>
      <div class="card">${rows.length ? `<div class="tbl-wrap"><table><thead><tr><th>Institution</th><th>Attendance days</th><th>Results published</th><th>Monthly checks</th><th>Parents active</th><th>Last active</th><th></th></tr></thead><tbody>
        ${rows.map(({ i, h }) => { const u = i.usage; return `<tr class="row" data-open="${i.id}"><td><b>${esc(i.name)}</b><br><span class="muted small">${esc(i.code)} · ${num(i.students)} students</span></td>
          <td>${u ? `${u.attendanceDays} / ${u.schoolDays}` : '—'}</td><td>${u ? num(u.resultsPublished) : '—'}</td><td>${u ? u.checksDone + '%' : '—'}</td>
          <td>${u ? `${pct(u.parentsActive, u.parentsTotal)} <span class="muted small">(${num(u.parentsActive)})</span>` : '—'}</td><td class="small">${u && u.lastActive ? ago(u.lastActive) : '—'}</td>
          <td>${h.level === 'ok' ? '<span class="st">Well</span>' : `<span class="st gold" title="${esc(h.why)}">${h.level === 'none' ? 'Not yet' : 'Needs attention'}</span>`}</td></tr>`; }).join('')}
        </tbody></table></div>
        <p class="sub small" style="margin-top:12px">These numbers come from each school's diary once it runs on the Paperloop database.</p>`
      : '<p class="empty">No institution is on a pilot or using the app yet.</p>'}</div>`;
    main.querySelectorAll('[data-open]').forEach((r) => r.addEventListener('click', () => showInstitution(r.dataset.open)));
  }
};
