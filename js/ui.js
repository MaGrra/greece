// Shared building blocks used by several views.
import { CONFIG } from '../data/config.js';
import { PLANS, DEFAULT_SCHEDULE, MOVABLE_PLANS } from '../data/plans.js';
import { PLACES } from '../data/places.js';
import { DUR } from '../data/durations.js';
import { RESTAURANTS, AREAS } from '../data/restaurants.js';
import { sync } from './sync.js';
import { esc, ICON, EXT, mapsDir, mapsSearch, fmtDur, dateRange, parseISO, minutes } from './util.js';
import { L, F, lang } from './i18n.js';

export const TRIP_DATES = dateRange(CONFIG.tripStart, CONFIG.tripEnd);

export function schedule() {
  return { ...DEFAULT_SCHEDULE, ...(sync.setting('schedule', {}) || {}) };
}
export const planFor = date => PLANS[schedule()[date]] ? { id: schedule()[date], ...PLANS[schedule()[date]] } : null;

/** Put `planId` on `date`; the plan that was there moves to wherever `planId` used to be. */
export function assignPlan(date, planId) {
  const s = schedule();
  const prev = s[date];
  const from = CONFIG.movable.find(d => s[d] === planId);
  s[date] = planId;
  if (from && from !== date) s[from] = prev;
  const out = {};
  CONFIG.movable.forEach(d => { out[d] = s[d]; });
  sync.set('schedule', out);
}
export { MOVABLE_PLANS };

export const modeFor = (date, plan) => plan.modes ? sync.setting('mode:' + date, plan.modes.def) : null;
export const visibleStops = (plan, mode) => plan.stops.filter(s => !s.mode || s.mode === mode);

const KIND = { site: L('Sight'), beach: L('Beach'), boat: L('Boat trip'), food: L('Food'), town: L('Village walk'), drive: L('Drive'), logistics: L('Logistics'), market: L('Market'), museum: L('Museum') };

export function audioBtn(key, title, label = L('In Latvian')) {
  if (!DUR[key]) return '';
  return `<button type="button" class="btn lv" data-play="${key}" data-title="${esc(title)}" aria-pressed="false"><span class="ic">${ICON.play}</span>${label} <span class="dur">${fmtDur(DUR[key])}</span></button>`;
}
export function sayBtn(key, title) {
  if (!DUR[key]) return '';
  return `<button type="button" class="say" data-play="${key}" data-title="${esc(title)}" aria-label="${L('Hear it in Greek')}" aria-pressed="false"><span class="ic">${ICON.play}</span></button>`;
}
export function playAllBtn(groupId, items, label) {
  if (!items.length) return '';
  const sec = items.reduce((a, i) => a + (DUR[i.key] || 0), 0);
  return `<button type="button" class="btn lv" data-playall="${groupId}" aria-pressed="false"><span class="ic">${ICON.play}</span>${label} <span class="dur">${Math.max(1, Math.round(sec / 60))} ${L('min')}</span></button>`;
}

export function linkRow({ maps, link, ticket, find, audio, title }) {
  const parts = [
    ticket ? `<span class="sign">${ticket}</span>` : '',
    maps ? `<a class="btn" href="${mapsDir(maps)}" ${EXT}>${ICON.nav}${L('Directions')}</a>` : '',
    find ? `<a class="btn" href="${mapsSearch(find)}" ${EXT}>${ICON.nav}${L('Find on map')}</a>` : '',
    link ? `<a class="btn" href="${link}" ${EXT}>${ICON.book}${L('Read more')}</a>` : '',
    audio ? audioBtn(audio, title) : '',
  ].join('');
  return parts ? `<div class="row">${parts}</div>` : '';
}

const placeMaps = p => p.maps || (p.lat ? { lat: p.lat, lng: p.lng } : null);

export function factsBlock(id) {
  const p = PLACES[id];
  if (!p || !(p.facts && p.facts.length)) return '';
  return `<details class="facts"><summary>${L('Stories and fun facts')}</summary><div class="inner">
    ${p.blurb ? `<p>${p.blurb}</p>` : ''}
    <ul>${p.facts.map(f => `<li>${f}</li>`).join('')}</ul>
    ${p.lv && lang === 'en' ? `<div class="lvbox" lang="lv"><p class="eyebrow">Teksts latviski</p><p>${esc(p.lv)}</p></div>` : ''}
  </div></details>`;
}

export function eatBlock(area) {
  const list = RESTAURANTS.filter(r => r.area === area);
  if (!list.length) return '';
  return `<details class="eat"><summary>${F('{n} places to eat nearby', { n: list.length })}</summary><div class="inner">${list.map(restaurantCard).join('')}</div></details>`;
}

export function restaurantCard(r) {
  const flag = r.check ? `<span class="pill warn">${L('Check it’s open')}</span>` : '';
  return `<article class="rest">
    <div class="rest-head"><h4>${esc(r.name)}</h4><span class="muted small">${esc(r.price || '')}</span></div>
    <p class="small">${esc(r.why || '')}</p>
    <p class="small muted">${[r.rating, r.view ? F('View: {v}', { v: r.view }) : '', r.baby ? F('Baby: {v}', { v: r.baby }) : ''].filter(Boolean).map(esc).join(' · ')}</p>
    <div class="row">${flag}<a class="btn" href="${r.lat ? mapsDir({ lat: r.lat, lng: r.lng }) : mapsSearch(r.mapsQuery || r.name)}" ${EXT}>${ICON.nav}${L('Directions')}</a><a class="btn" href="${mapsSearch(r.mapsQuery || r.name)}" ${EXT}>${L('Reviews')}</a>${r.phone ? `<span class="small muted sel">${esc(r.phone)}</span>` : ''}</div>
  </article>`;
}

export function stopHtml(s, date) {
  const p = s.place ? PLACES[s.place] : null;
  const title = s.title || (p && p.name) || '';
  const el = s.el || (p && p.el);
  const isDrive = s.kind === 'drive';
  const warn = s.onlyDow && date && !s.onlyDow.includes(parseISO(date).getDay()) ? `<p class="note warn small"><strong>${L('Not on this weekday.')}</strong> ${s.dowWarn}</p>` : '';
  const audio = s.place && DUR['places/' + s.place] ? 'places/' + s.place : null;
  return `<li class="stop k-${s.kind}${isDrive ? ' drive' : ''}" data-t="${s.t1 || ''}">
    <div class="time">${s.t1 || ''}${s.t2 ? `<span>${s.t2}</span>` : ''}</div>
    <div class="body">
      ${isDrive ? '' : `<p class="kind">${s.label || KIND[s.kind] || ''}</p>`}
      <h3>${title}${el ? `<span class="el" lang="el">${el}</span>` : ''}</h3>
      ${warn}
      ${s.text ? `<p>${s.text}</p>` : ''}
      ${s.tips ? `<ul class="tips">${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      ${isDrive ? '' : linkRow({ maps: s.maps || (p && placeMaps(p)), link: p && p.link, ticket: s.ticket, find: s.find, audio, title })}
      ${s.place ? factsBlock(s.place) : ''}
      ${s.eat ? eatBlock(s.eat) : ''}
    </div></li>`;
}

/** Narrated place stories for a date, in route order. */
export function dayAudio(date) {
  const plan = planFor(date);
  if (!plan) return [];
  const seen = new Set();
  return visibleStops(plan, modeFor(date, plan))
    .filter(s => s.place && DUR['places/' + s.place] && !seen.has(s.place) && seen.add(s.place))
    .map(s => ({ key: 'places/' + s.place, title: PLACES[s.place].name }));
}

/** The stop happening now or next, by clock time. */
export function nextStop(plan, mode) {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const stops = visibleStops(plan, mode).filter(s => s.t1 && /^\d/.test(s.t1));
  return stops.find(s => minutes(s.t2 && /^\d/.test(s.t2) ? s.t2 : s.t1) >= m) || null;
}

export function areaLabel(area) { return AREAS[area] || area; }

export function header(title, { back, eyebrow, sub } = {}) {
  return `<header class="page-head">
    ${back ? `<button type="button" class="back" data-go="${back}">${ICON.back}<span>${L('Back')}</span></button>` : ''}
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h1>${title}</h1>
    ${sub ? `<p class="muted">${sub}</p>` : ''}
  </header>`;
}
