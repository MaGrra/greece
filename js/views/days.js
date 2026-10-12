import { CONFIG } from '../../data/config.js';
import { PLANS } from '../../data/plans.js';
import { PLACES } from '../../data/places.js';
import { TRIP, HEADSUP, TODO } from '../../data/info.js';
import { EPISODES } from '../../data/stories.js';
import { DUR } from '../../data/durations.js';
import { sync } from '../sync.js';
import { dayForecast, seaState } from '../weather.js';
import { esc, ICON, EXT, store, todayISO, parseISO, longDate, shortDate, dow, dayNum, mapsRoute, noteHtml } from '../util.js';
import { L, F, lang, setLang } from '../i18n.js';
import { TRIP_DATES, planFor, modeFor, visibleStops, stopHtml, linkRow, factsBlock, playAllBtn, dayAudio, nextStop, assignPlan, MOVABLE_PLANS, header } from '../ui.js';

/* ---------- shared bits ---------- */

export function checklistHtml() {
  return `<ul class="checklist">${TODO.map(t => `<li><label><input type="checkbox" id="todo-${t.id}" data-todo="${t.id}"${sync.setting('todo:' + t.id, false) ? ' checked' : ''}><span>${t.html}${t.tag ? `<span class="tag">${t.tag}</span>` : ''}</span></label></li>`).join('')}</ul>`;
}
export function bindChecklist(root) {
  root.querySelectorAll('[data-todo]').forEach(c => c.addEventListener('change', () => sync.set('todo:' + c.dataset.todo, c.checked)));
}

const routeFor = (plan, mode) => plan.route ? (Array.isArray(plan.route) ? plan.route : plan.route[mode]) : null;

function actionRow(date, plan, mode) {
  const route = routeFor(plan, mode);
  return `<div class="row">
    ${route ? `<a class="btn primary" href="${mapsRoute(route)}" ${EXT}>${ICON.route}${plan.routeLabel || L('Whole day in Google Maps')}</a>` : ''}
    ${playAllBtn('day:' + date, dayAudio(date), L('Latvian stories'))}
  </div>`;
}

async function fillWeather(el, plan, date, mode) {
  if (!el || !plan.wx) return;
  const f = await dayForecast(plan.wx, date);
  if (!f || !el.isConnected) return;
  const bits = [`<span><b>${L(f.text)}</b> ${f.tmax}° / ${f.tmin}°</span>`, `<span>${F('Rain {n}%', { n: f.rain ?? '–' })}</span>`, `<span>${F('Wind {n} km/h', { n: f.wind })}</span>`, f.sunset ? `<span>${F('Sunset {t}', { t: f.sunset })}</span>` : ''];
  let hint = '';
  if (plan.modes && plan.modes.options.some(o => o[0] === 'rain') && f.rain >= 50 && mode !== 'rain') hint = `<p class="note rain small">${F('Rain is likely ({n}%). The rain plan might be the better choice.', { n: f.rain })}</p>`;
  if (plan.sea) {
    const s = await seaState(plan.sea, date);
    if (s && el.isConnected) {
      bits.push(`<span>${F('Sea: waves up to {h} m, {label}', { h: `<b>${s.h}</b>`, label: L(s.label) })}</span>`);
      if (s.rough && mode === 'calm') hint = `<p class="note rain small">${L('Rough sea forecast. Consider the castles plan.')}</p>`;
    }
  }
  el.innerHTML = bits.join('');
  if (hint) el.insertAdjacentHTML('afterend', hint);
}

/* ---------- Language switch (top of Today) ---------- */

function langSwitch() {
  return `<div class="seg lang" role="radiogroup" aria-label="Language">${[['en', 'English'], ['lv', 'Latviešu']].map(([k, l]) => `<button type="button" role="radio" data-lang="${k}" aria-checked="${k === lang}">${l}</button>`).join('')}</div>`;
}
function bindLang(root) {
  root.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }));
}

/* ---------- Today ---------- */

export function today() {
  const t = todayISO();
  if (t < CONFIG.tripStart) return preTrip(t);
  if (t > CONFIG.tripEnd) return postTrip();
  return dashboard(t);
}

function preTrip(t) {
  const n = Math.round((parseISO(CONFIG.tripStart) - parseISO(t)) / 864e5);
  const first = planFor(CONFIG.tripStart);
  const me = store.get('me', '');
  return {
    title: L('Today'),
    html: `<header class="page-head">
      ${langSwitch()}
      <p class="eyebrow">${TRIP.dates}</p>
      <h1>${TRIP.title}</h1>
      <p class="muted">${TRIP.sub}</p>
    </header>
    <section class="section">
      <div class="card">
        <p class="eyebrow">${L('The trip starts')}</p>
        <p class="count">${n === 1 ? L('Tomorrow') : F('In {n} days', { n })}</p>
        <p class="small muted">${L('Day one')}: ${shortDate(CONFIG.tripStart)} · ${first.title}</p>
        <div class="row"><button class="btn primary" data-go="day/${CONFIG.tripStart}">${L('See day one')}</button><button class="btn" data-go="days">${L('All days')}</button></div>
      </div>
    </section>
    ${me ? '' : `<section class="section"><p class="note">${L('Add your name in <a href="#settings">Settings</a> so notes and expenses show who added them.')}</p></section>`}
    <section class="section"><h2>${L('Before you go')}</h2><p class="small muted">${L('Ticks show on everyone’s phone.')}</p>${checklistHtml()}</section>
    <section class="section"><h2>${L('Heads-up')}</h2><div class="stack">${HEADSUP.map(h => `<p class="note${h.warn ? ' warn' : ''}">${h.html}</p>`).join('')}</div></section>
    <section class="section"><h2>${L('For the car')}</h2><p class="small muted">${F('Nine short stories about Greece in Latvian, about {n} minutes in total.', { n: Math.round(EPISODES.reduce((a, e) => a + (DUR['stories/' + e.id] || 0), 0) / 60) })}</p><div class="row">${playAllBtn('episodes', EPISODES.map(e => ({ key: 'stories/' + e.id })), L('Play all, in Latvian'))}<button class="btn" data-go="stories">${L('Open the stories')}</button></div></section>`,
    after: root => { bindLang(root); bindChecklist(root); },
  };
}

function postTrip() {
  return {
    title: L('Today'),
    html: `${langSwitch()}${header(L('Welcome home'), { eyebrow: TRIP.dates, sub: L('The trip is over. Everything stays here: days, notes and the expense split.') })}
    <section class="section"><div class="row"><button class="btn primary" data-go="expenses">${L('Settle the expenses')}</button><button class="btn" data-go="days">${L('Look back at the days')}</button></div></section>`,
    after: bindLang,
  };
}

function dashboard(date) {
  const plan = planFor(date);
  const mode = modeFor(date, plan);
  const idx = TRIP_DATES.indexOf(date) + 1;
  const nxt = nextStop(plan, mode);
  const tomorrow = TRIP_DATES[idx];
  const tPlan = tomorrow && planFor(tomorrow);
  const note = sync.state.notes['day:' + date];
  const stops = visibleStops(plan, mode).filter(s => s.kind !== 'drive');
  return {
    title: L('Today'),
    html: `<header class="page-head">
      ${langSwitch()}
      <p class="eyebrow">${F('Day {n} of {total}', { n: idx, total: TRIP_DATES.length })} · ${longDate(date)}</p>
      <h1>${plan.title}</h1>
      <div class="day-meta"><span>${L('Leave')} <b>${plan.leave}</b></span><span>${L('Back')} <b>${plan.back}</b></span><span class="pill ${plan.pace}">${plan.paceLabel}</span></div>
      <div class="wx" id="wx"></div>
      ${plan.modes ? `<p class="small muted">${L('Plan')}: <b>${plan.modes.options.find(o => o[0] === mode)[1]}</b>. ${L('Change it on the day page.')}</p>` : ''}
    </header>
    ${nxt ? `<section class="section"><p class="eyebrow">${L('Up next')}</p><ol class="route next-only">${stopHtml(nxt, date)}</ol></section>` : ''}
    <section class="section">${actionRow(date, plan, mode)}<div class="row"><button class="btn" data-go="expenses">${ICON.plus}${L('Add an expense')}</button></div></section>
    <section class="section">
      <h2>${L('Today’s plan')}</h2>
      <ol class="mini">${stops.map(s => `<li><span class="mt">${s.t1 || ''}</span><span>${s.title || (s.place && PLACES[s.place].name) || ''}</span></li>`).join('')}</ol>
      <div class="row"><button class="btn" data-go="day/${date}">${L('Open the full day')}</button></div>
    </section>
    ${note && note.text ? `<section class="section"><h2>${L('Notes')}</h2><p class="note">${noteHtml(note.text)}</p></section>` : ''}
    ${tPlan ? `<section class="section"><p class="eyebrow">${L('Tomorrow')} · ${shortDate(tomorrow)}</p><button class="card" style="text-align:left;cursor:pointer" data-go="day/${tomorrow}"><h3>${tPlan.title}</h3><span class="small muted">${L('Leave')} ${tPlan.leave} · ${L('back')} ${tPlan.back}</span></button></section>` : ''}`,
    after: root => { bindLang(root); fillWeather(root.querySelector('#wx'), plan, date, mode); },
  };
}

/* ---------- Days list ---------- */

export function days() {
  const t = todayISO();
  return {
    title: L('Days'),
    html: `${header(L('Your days'), { eyebrow: TRIP.dates, sub: L('Tap a day for the full plan. To swap days, use Settings → Day order.') })}
    <section class="section"><ul class="list">${TRIP_DATES.map(d => {
      const p = planFor(d);
      return `<li class="${d === t ? 'is-today' : ''}"><button data-go="day/${d}"><span class="dnum">${dayNum(d)}<small>${dow(d)}</small></span><span><span class="ltitle">${p.title}</span><br><span class="lsub">${d === t ? L('Today') + ' · ' : ''}${p.leave} → ${p.back}</span></span><span class="pill ${p.pace}">${p.paceLabel}</span></button></li>`;
    }).join('')}</ul>
    <div class="row"><button class="btn" data-go="settings">${L('Change the day order')}</button><button class="btn" data-go="info">${L('Tickets and trip info')}</button></div></section>`,
  };
}

/* ---------- One day ---------- */

export function day(date) {
  const plan = planFor(date);
  if (!plan) return { html: header(L('Day not found'), { back: 'days' }) };
  const mode = modeFor(date, plan);
  const idx = TRIP_DATES.indexOf(date);
  const prev = TRIP_DATES[idx - 1], next = TRIP_DATES[idx + 1];
  const notes = (plan.notes || []).filter(n => !n.mode || n.mode === mode);
  const cost = plan.cost ? (Array.isArray(plan.cost) ? plan.cost : plan.cost[mode]) : null;
  const note = sync.state.notes['day:' + date];
  const movable = CONFIG.movable.includes(date);
  const sched = Object.fromEntries(CONFIG.movable.map(d => [d, planFor(d).id]));
  return {
    title: shortDate(date),
    html: `<header class="page-head">
      <button type="button" class="back" data-go="days">${ICON.back}<span>${L('Days')}</span></button>
      <p class="eyebrow">${longDate(date)} · ${F('Day {n}', { n: idx + 1 })}</p>
      <h1>${plan.title}</h1>
      <div class="day-meta"><span>${L('Leave')} <b>${plan.leave}</b></span><span>${L('Back')} <b>${plan.back}</b></span><span class="pill ${plan.pace}">${plan.paceLabel}</span></div>
      <div class="wx" id="wx"></div>
      ${plan.tip ? `<p class="small muted">${plan.tip}</p>` : ''}
      ${plan.modes ? `<div class="row"><div class="seg" role="radiogroup" aria-label="${plan.modes.label}">${plan.modes.options.map(([k, l]) => `<button type="button" role="radio" data-mode="${k}" aria-checked="${k === mode}">${l}</button>`).join('')}</div></div>` : ''}
      ${notes.map(n => `<p class="note${n.warn ? ' warn' : ''}">${n.html}</p>`).join('')}
      ${actionRow(date, plan, mode)}
    </header>
    <ol class="route">${visibleStops(plan, mode).map(s => stopHtml(s, date)).join('')}</ol>
    ${cost ? `<section class="section"><h2>${L('Cost')}</h2><div class="tbl-wrap"><table><tbody>${cost.map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join('')}</tbody></table></div><p class="small muted">${L('The baby is free everywhere.')}</p></section>` : ''}
    ${plan.swaps ? `<section class="section"><h2>${L('Swaps and options')}</h2><div class="stack">${plan.swaps.map(s => {
      const p = s.place && PLACES[s.place];
      return `<div class="card"><h3>${s.title}${p && p.el ? `<span class="el" lang="el">${p.el}</span>` : ''}</h3><p class="small">${s.html}</p>
        ${linkRow({ maps: s.maps || (p ? { lat: p.lat, lng: p.lng } : null), link: s.link || (p && p.link), audio: p && p.lv ? 'places/' + s.place : null, title: p ? p.name : '' })}
        ${p ? factsBlock(s.place) : ''}</div>`;
    }).join('')}</div></section>` : ''}
    <section class="section"><h2>${L('Notes')}</h2>
      <p class="small muted">${L('Shared with everyone.')} ${note && note.by ? F('Last edited by {name}.', { name: esc(note.by) }) : ''}</p>
      <textarea id="day-note" placeholder="${L('Tickets bought, where we parked, places we liked…')}">${esc(note ? note.text : '')}</textarea>
      <div class="row"><button type="button" class="btn primary" id="save-note">${L('Save note')}</button></div>
    </section>
    ${movable ? `<section class="section"><h2>${L('Change this day')}</h2>
      <div class="field"><label for="plan-select">${F('Plan for {d}', { d: shortDate(date) })}</label>
      <select id="plan-select">${MOVABLE_PLANS.map(id => {
        const on = Object.keys(sched).find(d => sched[d] === id);
        return `<option value="${id}"${id === plan.id ? ' selected' : ''}>${PLANS[id].short}${on && on !== date ? ` (${F('now {d}', { d: shortDate(on) })})` : ''}</option>`;
      }).join('')}</select></div>
      <p class="small muted">${L('Picking a plan that’s on another day swaps the two days. Everyone’s phone updates.')}</p></section>` : ''}
    <nav class="section row" style="justify-content:space-between" aria-label="${L('Other days')}">
      ${prev ? `<button class="btn" data-go="day/${prev}">← ${shortDate(prev)}</button>` : '<span></span>'}
      ${next ? `<button class="btn" data-go="day/${next}">${shortDate(next)} →</button>` : '<span></span>'}
    </nav>`,
    after(root) {
      root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => sync.set('mode:' + date, b.dataset.mode)));
      const ta = root.querySelector('#day-note'), btn = root.querySelector('#save-note');
      btn.addEventListener('click', () => { sync.note('day:' + date, ta.value.trim()); btn.textContent = L('Saved'); });
      ta.addEventListener('input', () => { btn.textContent = L('Save note'); });
      root.querySelector('#plan-select')?.addEventListener('change', e => assignPlan(date, e.target.value));
      if (date === todayISO()) {
        const n = nextStop(plan, mode);
        if (n) root.querySelector(`.route .stop[data-t="${n.t1}"]`)?.classList.add('is-next');
      }
      fillWeather(root.querySelector('#wx'), plan, date, mode);
    },
  };
}
