import { DOW, fmtLongDate } from './i18n.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const store = {
  get(k, d) { try { const v = localStorage.getItem('gr26:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('gr26:' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
};

export const pad = n => String(n).padStart(2, '0');
export const isoDate = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const todayISO = () => isoDate(new Date());
export const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return isoDate(d); };
export const dateRange = (a, b) => { const out = []; for (let s = a; s <= b; s = addDays(s, 1)) out.push(s); return out; };

export const dow = s => DOW[parseISO(s).getDay()];
export const dayNum = s => parseISO(s).getDate();
export const longDate = s => { const d = parseISO(s); return fmtLongDate(d.getDay(), d.getDate(), d.getMonth()); };
export const shortDate = s => `${DOW[parseISO(s).getDay()]} ${parseISO(s).getDate()}`;
export const minutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fmtDur = sec => Math.floor(sec / 60) + ':' + pad(Math.round(sec % 60));
export const euro = n => '€' + (Math.round(n * 100) / 100).toLocaleString('en', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

const enc = encodeURIComponent;
const q = p => typeof p === 'object' && p ? `${p.lat},${p.lng}` : p;
// Directions open in the app chosen in Settings (per phone). Multi-stop routes always use Google Maps.
export const navApp = () => store.get('nav', 'google');
export const mapsDir = p => navApp() === 'waze'
  ? (typeof p === 'object' && p ? `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes` : 'https://waze.com/ul?navigate=yes&q=' + enc(p))
  : 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + enc(q(p));
export const mapsSearch = s => 'https://www.google.com/maps/search/?api=1&query=' + enc(s);
export const mapsRoute = list => 'https://www.google.com/maps/dir/' + list.map(p => enc(q(p))).join('/');
export const EXT = 'target="_blank" rel="noopener"';

const svg = (p, fill) => `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const ICON = {
  nav: svg('<path d="M3 11l18-8-8 18-2-8-8-2z"/>'),
  book: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M6 19h13"/>'),
  route: svg('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/>'),
  play: svg('<path d="M7 4.5v15l12-7.5z"/>', true),
  pause: svg('<path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/>', true),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  chevron: svg('<path d="M9 5l7 7-7 7"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  speaker: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
  locate: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  // tab bar
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  map: svg('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>'),
  food: svg('<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M7 7h4M17 3c-1.7 1.5-2.5 3.5-2.5 6.5V13H17v8"/>'),
  more: svg('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', true),
};

/** Linkify plain text from user notes safely. */
export const noteHtml = s => esc(String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/\n/g, '<br>');

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
