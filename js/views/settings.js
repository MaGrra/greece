import { CONFIG } from '../../data/config.js';
import { PLANS } from '../../data/plans.js';
import { DISHES } from '../../data/food.js';
import { DUR } from '../../data/durations.js';
import { sync, backendUrl } from '../sync.js';
import { esc, store, shortDate } from '../util.js';
import { header, planFor, assignPlan, MOVABLE_PLANS } from '../ui.js';
import { people } from './expenses.js';

const ago = t => { if (!t) return 'never'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`; };

export function settings() {
  const st = sync.status();
  const ppl = people();
  return {
    title: 'Settings',
    html: `${header('Settings', { back: 'more' })}
    <section class="section"><h2>You</h2>
      <div class="field"><label for="me">Your name, shown on notes and expenses</label>
      <div class="row" style="flex-wrap:nowrap"><input type="text" id="me" value="${esc(store.get('me', ''))}" placeholder="Name"><button type="button" class="btn" id="me-save">Save</button></div></div>
    </section>

    <section class="section"><h2>Day order</h2>
      <p class="small muted">Swap the Kalamata days around weather and energy. Picking a plan that’s on another day swaps the two. Everyone’s phone updates.</p>
      ${CONFIG.movable.map(d => `<div class="field"><label for="ord-${d}">${shortDate(d)}</label><select id="ord-${d}" data-date="${d}">${MOVABLE_PLANS.map(id => `<option value="${id}"${planFor(d).id === id ? ' selected' : ''}>${PLANS[id].short}</option>`).join('')}</select></div>`).join('')}
      <div class="row"><button type="button" class="btn" id="ord-reset">Back to the original order</button></div>
    </section>

    <section class="section"><h2>People for expenses</h2>
      <p class="small muted">People or families who split costs. Shared with everyone.</p>
      <div class="chips" style="flex-wrap:wrap">${ppl.map(p => `<button type="button" class="chip" data-rm="${esc(p)}" aria-label="Remove ${esc(p)}">${esc(p)} ×</button>`).join('') || '<span class="small muted">Nobody yet.</span>'}</div>
      <div class="row" style="flex-wrap:nowrap"><input type="text" id="p-new" placeholder="Add a name"><button type="button" class="btn" id="p-add">Add</button></div>
    </section>

    <section class="section"><h2>Sharing</h2>
      <p class="note">${st.url ? `Connected to the Google Sheet. Last synced ${ago(st.lastSync)}.${st.pending ? ` ${st.pending} change${st.pending > 1 ? 's' : ''} waiting to upload.` : ''}${st.lastError ? `<br><span style="color:var(--warn)">Last error: ${esc(st.lastError)}</span>` : ''}` : 'Not connected yet. Changes stay on this phone until the backend URL is set.'}</p>
      <div class="row"><button type="button" class="btn" id="sync-now">Sync now</button></div>
      <details class="facts"><summary>Backend address</summary><div class="inner">
        <p class="small muted">The Apps Script web app URL (ends in /exec). Normally set in the app itself; this overrides it on this phone only.</p>
        <input type="url" id="be-url" value="${esc(store.get('backendUrl', ''))}" placeholder="${esc(CONFIG.backendUrl || 'https://script.google.com/macros/s/…/exec')}">
        <div class="row"><button type="button" class="btn" id="be-save">Save address</button></div>
      </div></details>
    </section>

    <section class="section"><h2>Offline</h2>
      <p class="small muted">Saves all audio and photos on this phone (about 15 MB) so stories and the food guide work without signal. Do it once on Wi-Fi. The map still needs signal.</p>
      <div class="row"><button type="button" class="btn primary" id="offline">Save for offline</button><span class="small muted" id="offline-st"></span></div>
    </section>`,
    after(root) {
      const $ = s => root.querySelector(s);
      $('#me-save').addEventListener('click', () => { store.set('me', $('#me').value.trim()); $('#me-save').textContent = 'Saved'; });
      root.querySelectorAll('[data-date]').forEach(s => s.addEventListener('change', () => assignPlan(s.dataset.date, s.value)));
      $('#ord-reset').addEventListener('click', () => sync.set('schedule', {}));
      root.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => sync.set('people', ppl.filter(p => p !== b.dataset.rm))));
      const addP = () => { const n = $('#p-new').value.trim(); if (n && !ppl.includes(n)) { $('#p-new').blur(); sync.set('people', [...ppl, n]); } };
      $('#p-add').addEventListener('click', addP);
      $('#p-new').addEventListener('keydown', e => { if (e.key === 'Enter') addP(); });
      $('#sync-now').addEventListener('click', async () => {
        const b = $('#sync-now'); b.textContent = 'Syncing…';
        await sync.pull();
        const s = sync.status();
        if (b.isConnected) b.textContent = !s.url ? 'No backend set' : s.lastError ? 'Couldn’t sync' : 'Synced';
      });
      $('#be-save').addEventListener('click', () => { store.set('backendUrl', $('#be-url').value.trim()); $('#be-save').textContent = 'Saved'; sync.pull(); });
      $('#offline').addEventListener('click', () => saveOffline($('#offline-st'), $('#offline')));
    },
  };
}

async function saveOffline(status, btn) {
  if (!('caches' in window)) { status.textContent = 'This browser can’t save files offline.'; return; }
  btn.disabled = true;
  const urls = [...Object.keys(DUR).map(k => `audio/${k}.mp3`), ...DISHES.map(d => `img/food/${d.id}.webp`), 'img/food/credits.json'];
  const cache = await caches.open('media-v1');
  let done = 0, failed = 0;
  for (const u of urls) {
    try {
      if (!(await cache.match(u))) { const r = await fetch(u); if (r.ok) await cache.put(u, r); else failed++; }
    } catch (e) { failed++; }
    done++;
    status.textContent = `Saving ${done} of ${urls.length}…`;
  }
  status.textContent = failed ? `Saved, ${failed} files missing.` : 'All saved on this phone.';
  btn.disabled = false;
}
