// Lists every string that still needs a translation:
//   tools/i18n/todo-lv.json  English strings missing from data/i18n-lv.js
//   tools/i18n/todo-en.json  Latvian strings (quiz, story titles) missing from data/i18n-en.js
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { SKIP } from '../js/i18n.js';
import { TO_LV } from '../data/i18n-lv.js';
import { TO_EN } from '../data/i18n-en.js';
import { PLANS } from '../data/plans.js';
import { PLACES } from '../data/places.js';
import * as INFO from '../data/info.js';
import * as FOOD from '../data/food.js';
import { RESTAURANTS, AREAS } from '../data/restaurants.js';
import * as CHEATS from '../data/cheats.js';
import { EPISODES } from '../data/stories.js';
import { QUIZ } from '../data/quiz.js';

const en = new Set(), lv = new Set();
const worthy = s => /[A-Za-zĀ-ž]/.test(s) && !/^https?:/.test(s) && !/^[a-z0-9_:\-\/.]+$/.test(s);
function collect(data, into, extraSkip = []) {
  const skip = new Set([...SKIP, ...extraSkip]);
  const walk = (v, key) => {
    if (typeof v === 'string') { if (!skip.has(key) && worthy(v)) into.add(v); }
    else if (Array.isArray(v)) v.forEach(x => walk(x, key));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(data, '');
}
[PLANS, PLACES, INFO.TRIP, INFO.HEADSUP, INFO.TODO, INFO.TICKETS, INFO.WEATHER_TIPS, INFO.ADDR, FOOD.DISHES, FOOD.FOOD_CATS, FOOD.FLAGS, AREAS, CHEATS.ALPHABET, CHEATS.SIGNS]
  .forEach(d => collect(d, en));
collect(RESTAURANTS, en, ['name']);
collect(EPISODES, en, ['title']);
EPISODES.forEach(e => lv.add(e.title));
collect(QUIZ, lv);

// UI strings in code: L('…') and the first argument of F('…', …)
const files = ['js', 'js/views'].flatMap(d => readdirSync(d).filter(f => f.endsWith('.js')).map(f => `${d}/${f}`));
const re = /\b[LF]\(\s*(['"])((?:\\.|(?!\1).)*)\1/g;
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(re)) en.add(m[2].replace(/\\(['"\\])/g, '$1'));

const todoLv = [...en].filter(s => !(s in TO_LV));
const todoEn = [...lv].filter(s => !(s in TO_EN));
writeFileSync('tools/i18n/todo-lv.json', JSON.stringify(todoLv, null, 1));
writeFileSync('tools/i18n/todo-en.json', JSON.stringify(todoEn, null, 1));
console.log(`${en.size} English strings (${todoLv.length} untranslated), ${lv.size} Latvian strings (${todoEn.length} untranslated)`);
