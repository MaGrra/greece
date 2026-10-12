import { CONFIG } from '../../data/config.js';
import { PLANS } from '../../data/plans.js';
import { DISHES } from '../../data/food.js';
import { DUR } from '../../data/durations.js';
import { sync, backendUrl } from '../sync.js';
import { esc, store, shortDate, navApp } from '../util.js';
import { header, planFor, assignPlan, MOVABLE_PLANS } from '../ui.js';
import { people } from './expenses.js';
import { L, F, lang, setLang } from '../i18n.js';

const ago = t => { if (!t) return L('never'); const m = Math.round((Date.now() - t) / 60000); return m < 1 ? L('just now') : m < 60 ? F('{n} min ago', { n: m }) : F('{n} h ago', { n: Math.round(m / 60) }); };

export function settings() {
  const st = sync.status();
  const ppl = people();
  return {
    title: L('Settings'),
    html: `${header(L('Settings'), { back: 'more' })}
    <section class="section"><h2>${L('Language')}</h2>
      <div class="seg" role="radiogroup" aria-label="${L('Language')}">${[['en', 'English'], ['lv', 'Latviešu']].map(([k, l]) => `<button type="button" role="radio" data-lang="${k}" aria-checked="${k === lang}">${l}</button>`).join('')}</div>
      <p class="small muted">${L('Only changes this phone.')}</p>
    </section>

    <section class="section"><h2>${L('Directions')}</h2>
      <div class="seg" role="radiogroup" aria-label="${L('Directions open in')}">${[['google', 'Google Maps'], ['waze', 'Waze']].map(([k, l]) => `<button type="button" role="radio" data-nav="${k}" aria-checked="${k === navApp()}">${l}</button>`).join('')}</div>
      <p class="small muted">${L('Directions buttons open this app. Whole-day routes always open in Google Maps, because Waze can’t plan several stops. Only changes this phone.')}</p>
    </section>

    <section class="section"><h2>${L('You')}</h2>
      <div class="field"><label for="me">${L('Your name, shown on notes and expenses')}</label>
      <div class="row" style="flex-wrap:nowrap"><input type="text" id="me" value="${esc(store.get('me', ''))}" placeholder="${L('Name')}"><button type="button" class="btn" id="me-save">${L('Save')}</button></div></div>
    </section>

    <section class="section"><h2>${L('Day order')}</h2>
      <p class="small muted">${L('Swap the Kalamata days around weather and energy. Picking a plan that’s on another day swaps the two. Everyone’s phone updates.')}</p>
      ${CONFIG.movable.map(d => `<div class="field"><label for="ord-${d}">${shortDate(d)}</label><select id="ord-${d}" data-date="${d}">${MOVABLE_PLANS.map(id => `<option value="${id}"${planFor(d).id === id ? ' selected' : ''}>${PLANS[id].short}</option>`).join('')}</select></div>`).join('')}
      <div class="row"><button type="button" class="btn" id="ord-reset">${L('Back to the original order')}</button></div>
    </section>

    <section class="section"><h2>${L('People for expenses')}</h2>
      <p class="small muted">${L('People or families who split costs. Shared with everyone.')}</p>
      <div class="chips" style="flex-wrap:wrap">${ppl.map(p => `<button type="button" class="chip" data-rm="${esc(p)}" aria-label="${F('Remove {name}', { name: esc(p) })}">${esc(p)} ×</button>`).join('') || `<span class="small muted">${L('Nobody yet.')}</span>`}</div>
      <div class="row" style="flex-wrap:nowrap"><input type="text" id="p-new" placeholder="${L('Add a name')}"><button type="button" class="btn" id="p-add">${L('Add')}</button></div>
    </section>

    <section class="section"><h2>${L('Sharing')}</h2>
      <p class="note">${st.url ? `${F('Connected to the Google Sheet. Last synced {when}.', { when: ago(st.lastSync) })}${st.pending ? ' ' + F('{n} changes waiting to upload.', { n: st.pending }) : ''}${st.lastError ? `<br><span style="color:var(--warn)">${L('Last error')}: ${esc(st.lastError)}</span>` : ''}` : L('Not connected yet. Changes stay on this phone until the backend URL is set.')}</p>
      <div class="row"><button type="button" class="btn" id="sync-now">${L('Sync now')}</button></div>
      <details class="facts"><summary>${L('Backend address')}</summary><div class="inner">
        <p class="small muted">${L('The Apps Script web app URL (ends in /exec). Normally set in the app itself; this overrides it on this phone only.')}</p>
        <input type="url" id="be-url" value="${esc(store.get('backendUrl', ''))}" placeholder="${esc(CONFIG.backendUrl || 'https://script.google.com/macros/s/…/exec')}">
        <div class="row"><button type="button" class="btn" id="be-save">${L('Save address')}</button></div>
      </div></details>
    </section>

    <section class="section"><h2>${L('Offline')}</h2>
      <p class="small muted">${L('Saves all audio and photos on this phone (about 15 MB) so stories and the food guide work without signal. Do it once on Wi-Fi. The map still needs signal.')}</p>
      <div class="row"><button type="button" class="btn primary" id="offline">${L('Save for offline')}</button><span class="small muted" id="offline-st"></span></div>
    </section>`,
    after(root) {
      const $ = s => root.querySelector(s);
      $('#me-save').addEventListener('click', () => { store.set('me', $('#me').value.trim()); $('#me-save').textContent = L('Saved'); });
      root.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => {
        store.set('nav', b.dataset.nav);
        root.querySelectorAll('[data-nav]').forEach(x => x.setAttribute('aria-checked', x === b));
      }));
      root.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }));
      root.querySelectorAll('[data-date]').forEach(s => s.addEventListener('change', () => assignPlan(s.dataset.date, s.value)));
      $('#ord-reset').addEventListener('click', () => sync.set('schedule', {}));
      root.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => sync.set('people', ppl.filter(p => p !== b.dataset.rm))));
      const addP = () => { const n = $('#p-new').value.trim(); if (n && !ppl.includes(n)) { $('#p-new').blur(); sync.set('people', [...ppl, n]); } };
      $('#p-add').addEventListener('click', addP);
      $('#p-new').addEventListener('keydown', e => { if (e.key === 'Enter') addP(); });
      $('#sync-now').addEventListener('click', async () => {
        const b = $('#sync-now'); b.textContent = L('Syncing…');
        await sync.pull();
        const s = sync.status();
        if (b.isConnected) b.textContent = !s.url ? L('No backend set') : s.lastError ? L('Couldn’t sync') : L('Synced');
      });
      $('#be-save').addEventListener('click', () => { store.set('backendUrl', $('#be-url').value.trim()); $('#be-save').textContent = L('Saved'); sync.pull(); });
      $('#offline').addEventListener('click', () => saveOffline($('#offline-st'), $('#offline')));
    },
  };
}

async function saveOffline(status, btn) {
  if (!('caches' in window)) { status.textContent = L('This browser can’t save files offline.'); return; }
  btn.disabled = true;
  const urls = [...Object.keys(DUR).map(k => `audio/${k}.mp3`), ...DISHES.map(d => `img/food/${d.id}.webp`), 'img/food/credits.json'];
  const cache = await caches.open('media-v1');
  let done = 0, failed = 0;
  for (const u of urls) {
    try {
      if (!(await cache.match(u))) { const r = await fetch(u); if (r.ok) await cache.put(u, r); else failed++; }
    } catch (e) { failed++; }
    done++;
    status.textContent = F('Saving {n} of {total}…', { n: done, total: urls.length });
  }
  status.textContent = failed ? F('Saved, {n} files missing.', { n: failed }) : L('All saved on this phone.');
  btn.disabled = false;
}
