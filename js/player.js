// One audio element for the whole app, a queue for "play all", and a small bar above the tab bar.
import { $, $$, ICON, esc, fmtDur } from './util.js';

const au = new Audio();
au.preload = 'none';
let queue = [];
let cur = null;      // { key, title }
let group = null;    // id of the "play all" group being played

const src = key => `audio/${key}.mp3`;

function load(item) {
  cur = item;
  au.src = src(item.key);
  au.play().catch(() => {});
  if ('mediaSession' in navigator) {
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: item.title, artist: 'Greece 2026' }); } catch (e) { /* unsupported */ }
  }
  render();
}

export const player = {
  /** Play one clip, or pause/resume it if it's already loaded. */
  one(key, title) {
    if (cur && cur.key === key) return toggle();
    group = null; queue = [];
    load({ key, title });
  },
  /** Play a list in order, or pause/resume if this list is already playing. */
  all(groupId, items) {
    if (!items.length) return;
    if (group === groupId && cur) return toggle();
    group = groupId; queue = items.slice(1);
    load(items[0]);
  },
  stop() { au.pause(); au.removeAttribute('src'); cur = null; group = null; queue = []; render(); },
};

function toggle() { au.paused ? au.play().catch(() => {}) : au.pause(); }

au.addEventListener('ended', () => { if (queue.length) load(queue.shift()); else player.stop(); });
au.addEventListener('play', render);
au.addEventListener('pause', render);
au.addEventListener('timeupdate', () => {
  const bar = $('#player .prog i');
  if (bar && au.duration) bar.style.width = (au.currentTime / au.duration * 100) + '%';
  const t = $('#player .t');
  if (t && au.duration) t.textContent = fmtDur(au.currentTime) + ' / ' + fmtDur(au.duration);
});

export function render() {
  const on = !!cur && !au.paused;
  $$('[data-play]').forEach(b => {
    const x = on && cur.key === b.dataset.play;
    b.setAttribute('aria-pressed', x);
    const ic = b.querySelector('.ic'); if (ic) ic.innerHTML = x ? ICON.pause : ICON.play;
  });
  $$('[data-playall]').forEach(b => {
    const x = on && group === b.dataset.playall;
    b.setAttribute('aria-pressed', x);
    const ic = b.querySelector('.ic'); if (ic) ic.innerHTML = x ? ICON.pause : ICON.play;
  });
  const el = $('#player');
  if (!el) return;
  el.hidden = !cur;
  document.body.classList.toggle('has-player', !!cur);
  if (!cur) return;
  el.innerHTML = `
    <button type="button" class="pbtn" data-ptoggle aria-label="${on ? 'Pause' : 'Play'}">${on ? ICON.pause : ICON.play}</button>
    <div class="pmeta"><b>${esc(cur.title)}</b><span class="t">${queue.length ? `${queue.length} more after this` : ''}</span><span class="prog"><i></i></span></div>
    <button type="button" class="pbtn ghost" data-pstop aria-label="Stop">${ICON.close}</button>`;
  el.querySelector('[data-ptoggle]').onclick = toggle;
  el.querySelector('[data-pstop]').onclick = player.stop;
}
