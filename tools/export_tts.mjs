// Collects every text that needs narration into tools/tts.json (read by tools/gen_audio.py).
import { writeFileSync } from 'node:fs';
import { PLACES } from '../data/places.js';
import { EPISODES } from '../data/stories.js';
import { DISHES } from '../data/food.js';
import { PHRASES } from '../data/cheats.js';

const items = {};
for (const [id, p] of Object.entries(PLACES)) if (p.lv) items[`places/${id}`] = { voice: 'lv', text: p.lv };
for (const e of EPISODES) items[`stories/${e.id}`] = { voice: 'lv', text: e.lv };
for (const d of DISHES) items[`el/${d.id}`] = { voice: 'el', text: d.el.replace(/\s*·\s*/g, ', ') };
for (const p of PHRASES) items[`el/${p.id}`] = { voice: 'el', text: p.el.replace(/\s*·\s*/g, '. ') };
writeFileSync(new URL('./tts.json', import.meta.url), JSON.stringify(items, null, 1));
console.log(Object.keys(items).length, 'texts');
