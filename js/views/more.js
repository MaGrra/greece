import { EPISODES } from '../../data/stories.js';
import { QUIZ } from '../../data/quiz.js';
import { ALPHABET, COMBOS, SIGNS, DESTINATIONS, PHRASES } from '../../data/cheats.js';
import { HEADSUP, TICKETS, WEATHER_TIPS, ADDR } from '../../data/info.js';
import { PLANS } from '../../data/plans.js';
import { DUR } from '../../data/durations.js';
import { esc, ICON, EXT, mapsDir, fmtDur, shortDate } from '../util.js';
import { header, audioBtn, sayBtn, playAllBtn, TRIP_DATES, planFor, dayAudio } from '../ui.js';
import { checklistHtml, bindChecklist } from './days.js';
import { L, F, lang } from '../i18n.js';

const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const MORE = [
  ['stories', L('Stories in Latvian'), L('Nine short episodes about Greece for the car'), svg('<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>')],
  ['quiz', L('Car quiz'), L('Questions from the stories and places'), svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>')],
  ['expenses', L('Expenses'), L('Who paid what, and who owes whom'), svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>')],
  ['cheats', L('Greek cheat sheet'), L('Phrases with audio, road signs, the alphabet'), svg('<path d="M4 6h10M4 12h16M4 18h7"/>')],
  ['info', L('Trip info'), L('Heads-up, tickets, addresses, checklist'), svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>')],
  ['settings', L('Settings'), L('Your name, language, day order, sharing, offline'), svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>')],
];

export function more() {
  return {
    title: L('More'),
    html: `${header(L('More'))}
    <section class="section"><ul class="list">${MORE.map(([id, t, s, ic]) => `<li><a class="item" href="#${id}"><span class="licon">${ic}</span><span><span class="ltitle">${t}</span><br><span class="lsub">${s}</span></span>${ICON.chevron.replace('<svg', '<svg class="chev"')}</a></li>`).join('')}</ul></section>
    <p class="small muted section"><a href="#credits">${L('Photo and data credits')}</a></p>`,
  };
}

/* ---------- Stories ---------- */

export function stories() {
  const total = EPISODES.reduce((a, e) => a + (DUR['stories/' + e.id] || 0), 0);
  return {
    title: L('Stories'),
    html: `${header(lang === 'lv' ? 'Stāsti latviski' : 'Stories in Latvian', { back: 'more', sub: F('Nine short episodes about Greece, about {n} minutes in total. Good for the car.', { n: Math.round(total / 60) }) })}
    <section class="section"><div class="row">${playAllBtn('episodes', EPISODES.map(e => ({ key: 'stories/' + e.id })), L('Play all, in Latvian'))}</div>
    <div class="stack">${EPISODES.map(e => `<article class="card">
      <h3>${esc(e.title)}</h3>
      <p class="small muted">${esc(e.en)}${e.plans ? ` ${L('Good for')}: ${e.plans.map(p => PLANS[p].short).join(', ')}.` : ''}</p>
      <div class="row">${audioBtn('stories/' + e.id, e.title, L('Listen'))}</div>
      <details class="facts"><summary>${L('Latvian text')}</summary><div class="inner" lang="lv"><p>${esc(e.lv)}</p></div></details>
    </article>`).join('')}</div></section>
    <section class="section"><h2>${L('Place stories by day')}</h2><p class="small muted">${L('The short Latvian stories for each stop of the day, in route order.')}</p>
    <div class="stack">${TRIP_DATES.map(d => { const items = dayAudio(d); return items.length ? `<div class="row" style="justify-content:space-between"><span><b>${shortDate(d)}</b> · ${planFor(d).short}</span>${playAllBtn('day:' + d, items, L('Play'))}</div>` : ''; }).join('')}</div></section>`,
  };
}

/* ---------- Quiz (Latvian) ---------- */

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let round = null;
function newRound() {
  round = { qs: shuffle(QUIZ).slice(0, 10).map(q => ({ ...q, opts: shuffle(q.a.map((t, i) => ({ t, ok: i === 0 }))) })), i: 0, score: 0, picked: null };
}

function quizBody() {
  if (round.i >= round.qs.length) {
    const s = round.score, n = round.qs.length;
    const msg = L(s >= 9 ? 'Excellent! You’re real Greece experts.' : s >= 6 ? 'Very good!' : s >= 3 ? 'Not bad. Listen to another story!' : 'Better luck next time!');
    return `<div class="card" style="text-align:center"><p class="eyebrow">${L('Score')}</p><p class="count">${s} / ${n}</p><p>${msg}</p><div class="row" style="justify-content:center"><button type="button" class="btn primary big" id="q-again">${L('Play again')}</button></div></div>`;
  }
  const q = round.qs[round.i];
  const done = round.picked != null;
  return `<p class="eyebrow qnum">${F('Question {n} of {total}', { n: round.i + 1, total: round.qs.length })} · ${F('Points: {n}', { n: round.score })}</p>
    <h2 style="font-size:1.45rem">${esc(q.q)}</h2>
    <div class="quiz-opts">${q.opts.map((o, i) => `<button type="button" data-opt="${i}" ${done ? 'disabled' : ''} class="${done && o.ok ? 'right' : ''}${done && round.picked === i && !o.ok ? 'wrong' : ''}">${esc(o.t)}</button>`).join('')}</div>
    ${done ? `<p class="note"><strong>${q.opts[round.picked].ok ? L('Correct!') : L('Not quite.')}</strong> ${esc(q.x)}</p><div class="row"><button type="button" class="btn primary big" id="q-next">${round.i + 1 < round.qs.length ? L('Next') : L('Score')}</button></div>` : ''}`;
}

export function quiz() {
  if (!round) newRound();
  return {
    title: L('Quiz'),
    html: `${header(L('Car quiz'), { back: 'more', sub: L('Ten questions about Greece. One person reads them out, the others guess.') })}
    <section class="section" id="quiz">${quizBody()}</section>`,
    after(root) {
      const box = root.querySelector('#quiz');
      box.addEventListener('click', e => {
        const opt = e.target.closest('[data-opt]');
        if (opt && round.picked == null) {
          round.picked = Number(opt.dataset.opt);
          if (round.qs[round.i].opts[round.picked].ok) round.score++;
        } else if (e.target.closest('#q-next')) { round.i++; round.picked = null; }
        else if (e.target.closest('#q-again')) newRound();
        else return;
        box.innerHTML = quizBody();
      });
    },
  };
}

/* ---------- Cheat sheet ---------- */

export function cheats() {
  return {
    title: L('Greek'),
    html: `${header(L('Greek cheat sheet'), { back: 'more', sub: L('Tap the play button to hear it said.') })}
    <section class="section"><h2>${L('Phrases')}</h2><div>${PHRASES.map(p => `<div class="phrase">${sayBtn('el/' + p.id, p.el)}<div><div class="g" lang="el">${esc(p.el)}</div>${lang === 'lv' ? `<div class="small"><b>${esc(p.tr)}</b> · ${esc(p.lv)}</div>` : `<div class="small"><b>${esc(p.tr)}</b> · ${esc(p.en)}</div><div class="small muted" lang="lv">${esc(p.lv)}</div>`}</div></div>`).join('')}</div></section>
    <section class="section"><h2>${L('Signs')}</h2><p class="small muted">${L('Petrol stations: <b>ΑΜΟΛΥΒΔΗ</b> is unleaded, <b>ΠΕΤΡΕΛΑΙΟ</b> is diesel. Check which one the rental car takes.')}</p>
      <ul class="words">${SIGNS.map(([g, t, e]) => `<li><span><span class="g" lang="el">${g}</span><br><span class="t">${t}</span></span><span>${e}</span></li>`).join('')}</ul>
      <p class="small muted">${L('Your destinations on road signs:')}</p><p class="g" lang="el" style="font-family:var(--display);font-size:1.15rem;line-height:1.6">${DESTINATIONS}</p>
    </section>
    <section class="section"><h2>${L('Alphabet')}</h2><div class="alpha">${ALPHABET.map(([g, s]) => `<div><b lang="el">${g}</b><span>${s}</span></div>`).join('')}</div>
      <p class="small muted">${L('Letter pairs')}</p><div class="alpha">${COMBOS.map(([g, s]) => `<div><b lang="el">${g}</b><span>${s}</span></div>`).join('')}</div></section>`,
  };
}

/* ---------- Trip info ---------- */

export function info() {
  return {
    title: L('Trip info'),
    html: `${header(L('Trip info'), { back: 'more' })}
    <section class="section"><h2>${L('Heads-up')}</h2><div class="stack">${HEADSUP.map(h => `<p class="note${h.warn ? ' warn' : ''}">${h.html}</p>`).join('')}</div></section>
    <section class="section"><h2>${L('Before you go')}</h2><p class="small muted">${L('Ticks show on everyone’s phone.')}</p>${checklistHtml()}</section>
    <section class="section"><h2>${L('Tickets')}</h2><div class="tbl-wrap"><table><thead><tr><th>${L('Day')}</th><th>${L('What')}</th><th class="num">${L('Group')}</th></tr></thead><tbody>${TICKETS.rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')}</tbody></table></div><p class="small muted">${TICKETS.note}</p></section>
    <section class="section"><h2>${L('If the weather turns')}</h2><div class="stack">${WEATHER_TIPS.map(w => `<p class="note">${w}</p>`).join('')}</div></section>
    <section class="section"><h2>${L('Addresses')}</h2><dl class="kv">${ADDR.map(a => `<dt>${a[0]}</dt><dd><span class="sel">${a[1]}</span>${a[2] ? ` <button class="copy btn" style="padding:2px 9px;font-size:12px" type="button" data-copy="${esc(a[2])}">${L('Copy')}</button>` : ''}${a[3] ? ` <a href="${mapsDir(a[3])}" ${EXT} class="small">${L('Directions')}</a>` : ''}</dd>`).join('')}</dl></section>`,
    after: root => bindChecklist(root),
  };
}

/* ---------- Credits ---------- */

export function credits() {
  return {
    title: L('Credits'),
    html: `${header(L('Credits'), { back: 'more' })}
    <section class="section stack small">
      <p>${L('Map')} © <a href="https://www.openstreetmap.org/copyright" ${EXT}>OpenStreetMap</a>. ${L('Weather')}: <a href="https://open-meteo.com" ${EXT}>Open-Meteo</a>.</p>
      <p>${L('Narration uses Microsoft neural voices (Latvian: Everita, Greek: Athina).')}</p>
      <p>${L('Food photos (free to reuse):')}</p>
      <ul id="cred" class="stack" style="padding-left:18px;margin:0"><li class="muted">${L('Loading…')}</li></ul>
    </section>`,
    after(root) {
      fetch('img/food/credits.json').then(r => r.json()).then(c => {
        root.querySelector('#cred').innerHTML = Object.entries(c).map(([id, x]) => `<li>${esc(id)}: ${esc(x.author)}, <a href="${esc(x.source)}" ${EXT}>${esc(x.license)}</a></li>`).join('');
      }).catch(() => { root.querySelector('#cred').innerHTML = `<li class="muted">${L('Credits load when online.')}</li>`; });
    },
  };
}
