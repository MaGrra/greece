import { $, $$, ICON } from './util.js';
import { L, lang, localize } from './i18n.js';
import { PLANS } from '../data/plans.js';
import { PLACES } from '../data/places.js';
import * as INFO from '../data/info.js';
import * as FOOD from '../data/food.js';
import { RESTAURANTS, AREAS } from '../data/restaurants.js';
import * as CHEATS from '../data/cheats.js';
import { QUIZ } from '../data/quiz.js';
import { sync, startSync } from './sync.js';
import { player, render as renderPlayer } from './player.js';
import { dayAudio } from './ui.js';
import { EPISODES } from '../data/stories.js';
import { today, days, day } from './views/days.js';
import { food, dish } from './views/food.js';
import { more, stories, quiz, cheats, info, credits } from './views/more.js';
import { expenses } from './views/expenses.js';
import { settings } from './views/settings.js';
import { mapView } from './views/map.js';

// Swap in the chosen language before anything renders.
localize(PLANS); localize(PLACES); localize(INFO.TRIP); localize(INFO.HEADSUP); localize(INFO.TODO); localize(INFO.TICKETS);
localize(INFO.WEATHER_TIPS); localize(INFO.ADDR); localize(FOOD.DISHES); localize(FOOD.FOOD_CATS); localize(FOOD.FLAGS);
localize(RESTAURANTS, ['name']); localize(AREAS); localize(CHEATS.ALPHABET); localize(CHEATS.SIGNS);
localize(EPISODES); localize(QUIZ);
document.documentElement.lang = lang;

const TABS = [
  ['today', L('Today'), ICON.sun],
  ['days', L('Days'), ICON.cal],
  ['map', L('Map'), ICON.map],
  ['food', L('Food'), ICON.food],
  ['more', L('More'), ICON.more],
];
const TAB_OF = { today: 'today', days: 'days', day: 'days', map: 'map', food: 'food', dish: 'food' };

const ROUTES = { today, days, day, map: mapView, food, dish, more, stories, quiz, cheats, info, credits, expenses, settings };

let current = null;   // { name, arg }
let cleanup = null;

function parse() {
  const [name, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'today', arg: rest.join('/') };
}

export function go(path) {
  if (location.hash.slice(1) === path) render(true);
  else location.hash = path;
}

function render(scrollTop) {
  const r = parse();
  const sameView = current && current.name === r.name && current.arg === r.arg;
  if (cleanup) { cleanup(); cleanup = null; }
  current = r;
  $$('#tabbar a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === (TAB_OF[r.name] || 'more') ? 'page' : 'false'));
  const main = $('#main');
  const y = window.scrollY;
  const open = sameView ? $$('details', main).map(d => d.open) : [];
  const out = ROUTES[r.name](r.arg);
  main.innerHTML = out.html;
  const det = $$('details', main);
  if (open.length === det.length) det.forEach((d, i) => { d.open = open[i]; });
  document.title = (out.title ? out.title + ' · ' : '') + 'Greece 2026';
  if (out.after) cleanup = out.after(main) || null;
  renderPlayer();
  window.scrollTo(0, sameView && !scrollTop ? y : 0);
}

/** Re-render the current view in place (after shared data changes). */
export function refresh() {
  const active = document.activeElement;
  if (active && /INPUT|TEXTAREA|SELECT/.test(active.tagName) && $('#main').contains(active)) return; // don't wipe what someone is typing
  if (current && current.name === 'map') return; // the map updates itself
  render(false);
}

// One listener for the things that appear everywhere.
document.addEventListener('click', e => {
  const goEl = e.target.closest('[data-go]');
  if (goEl) { e.preventDefault(); go(goEl.dataset.go); return; }
  const one = e.target.closest('[data-play]');
  if (one) { player.one(one.dataset.play, one.dataset.title || ''); return; }
  const all = e.target.closest('[data-playall]');
  if (all) {
    const id = all.dataset.playall;
    let items = [];
    if (id.startsWith('day:')) items = dayAudio(id.slice(4));
    else if (id === 'episodes') items = EPISODES.map(x => ({ key: 'stories/' + x.id, title: x.title }));
    player.all(id, items);
    return;
  }
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    const done = () => { copy.textContent = L('Copied'); setTimeout(() => { copy.textContent = L('Copy'); }, 1500); };
    navigator.clipboard?.writeText(copy.dataset.copy).then(done, () => {});
  }
});

function boot() {
  $('#tabbar').innerHTML = `<div class="tabbar-inner">${TABS.map(([id, label, icon]) => `<a href="#${id}" data-tab="${id}">${icon}<span>${label}</span></a>`).join('')}</div>`;
  window.addEventListener('hashchange', () => render(true));
  sync.on(() => refresh());
  render(true);
  startSync();
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
