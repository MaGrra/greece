import { DISHES, FOOD_CATS, FLAGS, MENU_WORDS } from '../../data/food.js';
import { RESTAURANTS, AREAS } from '../../data/restaurants.js';
import { esc, ICON } from '../util.js';
import { header, sayBtn, restaurantCard } from '../ui.js';

let query = '';
let flag = '';
let credits = null;

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ς/g, 'σ');
const hay = d => norm([d.el, d.name, d.aka, d.en, d.inside, d.lv].join(' '));

const thumb = (d, cls = 'thumb') => `<span class="${cls}">${esc(d.el.charAt(0).toUpperCase())}<img src="img/food/${d.id}.webp" alt="" loading="lazy" onerror="this.remove()"></span>`;
const flagChips = d => d.flags.length ? `<span class="flags">${d.flags.map(f => `<span class="flag ${f}">${FLAGS[f]}</span>`).join('')}</span>` : '';

function dishList() {
  const q = norm(query);
  const hits = DISHES.filter(d => (!q || hay(d).includes(q)) && (!flag || (flag === 'nopork' ? !d.flags.includes('pork') : d.flags.includes(flag))));
  if (!hits.length) return `<p class="muted">Nothing matches “${esc(query)}”. Try the Greek spelling from the menu, or check the Menu words tab.</p>`;
  return FOOD_CATS.map(([cat, label]) => {
    const list = hits.filter(d => d.cat === cat);
    if (!list.length) return '';
    return `<section class="section"><h2>${label}</h2><ul class="dishes">${list.map(d => `<li><button type="button" class="dish" data-go="dish/${d.id}">
      ${thumb(d)}
      <span class="stack" style="gap:3px;min-width:0"><span class="gr" lang="el">${esc(d.el)}</span><span class="nm">${esc(d.name)}</span><span class="ds">${esc(d.en)}</span>${flagChips(d)}</span>
    </button></li>`).join('')}</ul></section>`;
  }).join('');
}

function wordList() {
  const q = norm(query);
  const hits = MENU_WORDS.filter(w => !q || norm([w.el, w.tr, w.en, w.lv].join(' ')).includes(q));
  return `<p class="small muted">Words you’ll see on Greek menus. An asterisk next to a dish means frozen; fish and house wine are priced by the kilo.</p>
  <ul class="words">${hits.map(w => `<li><span><span class="g" lang="el">${esc(w.el)}</span><br><span class="t">${esc(w.tr)}</span></span><span><span>${esc(w.en)}</span><br><span class="t" lang="lv">${esc(w.lv)}</span></span></li>`).join('')}</ul>`;
}

function eatList() {
  return `<p class="small muted">Picked for good reviews, fair prices and families. Seaside places can close for winter in October: ones marked “Check it’s open” had no proof either way. Ratings were checked on Oct 12; tap Reviews for live ones.</p>
  ${Object.entries(AREAS).map(([area, label]) => {
    const list = RESTAURANTS.filter(r => r.area === area);
    return list.length ? `<section class="section"><h2>${label}</h2><div class="stack">${list.map(restaurantCard).join('')}</div></section>` : '';
  }).join('')}`;
}

export function food(arg) {
  const tab = ['words', 'eat'].includes(arg) ? arg : 'dishes';
  const searchable = tab !== 'eat';
  return {
    title: 'Food',
    html: `${header('Food', { sub: 'What’s on the menu, and where to eat it.' })}
    <div class="section" style="margin-top:16px">
      <div class="seg" role="tablist">${[['dishes', 'Dishes'], ['words', 'Menu words'], ['eat', 'Where to eat']].map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" data-go="food${k === 'dishes' ? '' : '/' + k}">${l}</button>`).join('')}</div>
      ${searchable ? `<div class="search">${ICON.search}<input type="search" id="food-q" placeholder="${tab === 'dishes' ? 'Search: moussaka, μουσακάς, cheese…' : 'Search menu words'}" value="${esc(query)}" autocomplete="off"></div>` : ''}
      ${tab === 'dishes' ? `<div class="chips" role="group" aria-label="Filter">${[['', 'All'], ['veg', 'Vegetarian'], ['baby', 'Good for the baby'], ['sea', 'Seafood'], ['nopork', 'No pork']].map(([k, l]) => `<button type="button" class="chip" data-flag="${k}" aria-pressed="${k === flag}">${l}</button>`).join('')}</div>` : ''}
    </div>
    <div id="food-list">${tab === 'dishes' ? dishList() : tab === 'words' ? wordList() : eatList()}</div>`,
    after(root) {
      const list = root.querySelector('#food-list');
      const draw = () => { list.innerHTML = tab === 'dishes' ? dishList() : wordList(); };
      root.querySelector('#food-q')?.addEventListener('input', e => { query = e.target.value; draw(); });
      root.querySelectorAll('[data-flag]').forEach(b => b.addEventListener('click', () => {
        flag = b.dataset.flag;
        root.querySelectorAll('[data-flag]').forEach(x => x.setAttribute('aria-pressed', x === b));
        draw();
      }));
    },
  };
}

export function dish(id) {
  const d = DISHES.find(x => x.id === id);
  if (!d) return { html: header('Not found', { back: 'food' }) };
  const cat = FOOD_CATS.find(c => c[0] === d.cat)[1];
  return {
    title: d.name,
    html: `<header class="page-head">
      <button type="button" class="back" data-go="food">${ICON.back}<span>Food</span></button>
      <p class="eyebrow">${cat}</p>
    </header>
    <div class="section" style="margin-top:16px">
      <img class="hero-img" src="img/food/${d.id}.webp" alt="${esc(d.name)}" onerror="this.remove()">
      <div class="row" style="gap:12px;flex-wrap:nowrap"><span class="big-greek" lang="el">${esc(d.el)}</span>${sayBtn('el/' + d.id, d.el)}</div>
      <h1 style="font-size:1.6rem">${esc(d.name)}</h1>
      ${flagChips(d)}
      <p>${esc(d.en)}</p>
      <div class="card"><p class="eyebrow">What’s in it</p><p>${esc(d.inside)}</p></div>
      <div class="lvbox" lang="lv"><p class="eyebrow">Latviski</p><p>${esc(d.lv)}</p></div>
      <p class="small muted" id="credit"></p>
    </div>`,
    after(root) {
      const show = c => { const x = c && c[d.id]; const el = root.querySelector('#credit'); if (x && el) el.innerHTML = `Photo: ${esc(x.author)}, <a href="${esc(x.source)}" target="_blank" rel="noopener">${esc(x.license)}</a>`; };
      if (credits) show(credits);
      else fetch('img/food/credits.json').then(r => r.json()).then(c => { credits = c; show(c); }).catch(() => {});
    },
  };
}
