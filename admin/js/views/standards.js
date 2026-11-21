/* The common minimum standard and topic list. Every partner school uses the same ones; the schools agree on
   them together and Paperloop moderates, so only the Paperloop team changes them here. */
import { esc, toast } from '../ui.js';
import { store, can } from '../store.js';

export default {
  id: 'standards', label: 'Standard & topics', icon: 'standard', perm: 'standards',
  render(main) {
    const s = store.settings(), edit = can('standards');
    main.innerHTML = `
      <div class="head"><div><h1>Standard & topics</h1><p class="sub">The same for every partner school. Parents see each subject against the minimum; teachers check these topics every month.</p></div></div>
      <form class="grid" data-f style="gap:18px">
        <div class="card form"><h2>Minimum standard</h2>
          <label>Minimum for every subject (%)<input name="minPct" type="number" min="30" max="90" step="5" value="${esc(s.minPct)}" ${edit ? '' : 'disabled'} style="max-width:140px"></label>
          <p class="sub small">Decided with the partner schools. A change reaches every school's diary.</p></div>
        <div class="card form"><h2>Topics per subject</h2><p class="sub small" style="margin-top:-6px">One topic per line. Teachers can add their own for a month on top of these.</p>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
            ${Object.entries(s.topics).map(([subj, list]) => `<label>${esc(subj)}<textarea name="t:${esc(subj)}" rows="5" ${edit ? '' : 'disabled'}>${esc(list.join('\n'))}</textarea></label>`).join('')}</div></div>
        ${edit ? '<div><button class="btn" type="submit">Save for every school</button></div>' : ''}
      </form>`;
    const f = main.querySelector('[data-f]');
    if (edit) f.addEventListener('submit', (e) => {
      e.preventDefault();
      const topics = {};
      Object.keys(s.topics).forEach((subj) => { topics[subj] = f.elements['t:' + subj].value.split('\n').map((x) => x.trim()).filter(Boolean); });
      store.saveSettings({ minPct: +f.elements.minPct.value, topics }, `Standard and topics changed (minimum ${f.elements.minPct.value}%)`);
      toast('Saved for every school');
    });
  }
};
