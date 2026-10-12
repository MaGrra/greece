// English / Latvian. The language is chosen per phone; switching reloads the app.
// Data files stay in their source language. At start-up, localize() swaps every
// string that has a translation in data/i18n-lv.js (English → Latvian) or
// data/i18n-en.js (Latvian → English, for the quiz and story titles).
import { TO_LV } from '../data/i18n-lv.js';
import { TO_EN } from '../data/i18n-en.js';

const KEY = 'gr26:lang';
export const lang = (() => { try { return JSON.parse(localStorage.getItem(KEY)) === 'lv' ? 'lv' : 'en'; } catch (e) { return 'en'; } })();

export function setLang(l) {
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) { /* storage blocked */ }
  location.reload();
}

const DICT = lang === 'lv' ? TO_LV : TO_EN;

/** Translate one string (falls back to the original). */
export const L = s => (s && DICT[s]) || s;

/** Translate a template, then fill {placeholders}: F('In {n} days', { n: 3 }). */
export const F = (s, vars) => L(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

// Keys whose values are ids, coordinates, Greek text or the Latvian narration: never translated.
export const SKIP = new Set(['id', 'place', 'kind', 'maps', 'find', 'link', 'el', 'tr', 'lat', 'lng', 'mapsQuery', 'phone', 'area',
  't1', 't2', 'mode', 'def', 'eat', 'route', 'onlyDow', 'wx', 'sea', 'pace', 'lv', 'plans', 'flags', 'cat', 'rating', 'price', 'website', 'aka', 'check', 'author', 'license', 'source']);

/** Translate every string inside `data` in place. `extraSkip` adds keys to leave alone (e.g. restaurant names). */
export function localize(data, extraSkip = []) {
  const skip = new Set([...SKIP, ...extraSkip]);
  const walk = (v, key) => {
    if (typeof v === 'string') return skip.has(key) ? v : L(v);
    if (Array.isArray(v)) {
      // [id, label] pairs (plan modes, food categories): keep the id, translate the label.
      if (v.length === 2 && typeof v[0] === 'string' && /^[a-z0-9_-]+$/.test(v[0]) && typeof v[1] === 'string') { v[1] = walk(v[1], key); return v; }
      for (let i = 0; i < v.length; i++) v[i] = walk(v[i], key);
      return v;
    }
    if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = walk(v[k], k); return v; }
    return v;
  };
  return walk(data, '');
}

export const DOW = lang === 'lv' ? ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DOW_LONG = lang === 'lv'
  ? ['Svētdiena', 'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena', 'Sestdiena']
  : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = lang === 'lv'
  ? ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris']
  : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtLongDate = (dowIdx, day, month) => lang === 'lv' ? `${DOW_LONG[dowIdx]}, ${day}. ${MONTHS[month]}` : `${DOW_LONG[dowIdx]}, ${MONTHS[month]} ${day}`;
