// Shared state backed by the Google Sheet (Apps Script web app).
// Changes apply locally right away, queue while offline, and upload when there's signal.
import { CONFIG } from '../data/config.js';
import { store, uid } from './util.js';

let remote = store.get('remote', { settings: {}, notes: {}, expenses: [] });
let pending = store.get('pending', []);
let lastSync = store.get('lastSync', null);
let lastError = null;
let busy = false;
const listeners = new Set();

export const backendUrl = () => (store.get('backendUrl', '') || CONFIG.backendUrl || '').trim();

function effective() {
  const s = { settings: { ...remote.settings }, notes: { ...remote.notes }, expenses: [...remote.expenses] };
  for (const op of pending) {
    if (op.type === 'set') s.settings[op.key] = op.value;
    else if (op.type === 'note') s.notes[op.key] = { text: op.text, by: op.by };
    else if (op.type === 'expense' && !s.expenses.some(x => x.id === op.expense.id)) s.expenses.push(op.expense);
    else if (op.type === 'deleteExpense') s.expenses = s.expenses.filter(x => x.id !== op.id);
  }
  return s;
}
let state = effective();

function emit() { state = effective(); listeners.forEach(fn => fn(state)); }
function save() { store.set('remote', remote); store.set('pending', pending); store.set('lastSync', lastSync); }

export const sync = {
  get state() { return state; },
  setting(key, fallback) { return key in state.settings ? state.settings[key] : fallback; },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  status() { return { url: backendUrl(), pending: pending.length, lastSync, lastError, busy }; },

  push(op) {
    op.opId = uid();
    op.by = store.get('me', '');
    pending.push(op);
    save(); emit(); flush();
  },
  set(key, value) { this.push({ type: 'set', key, value }); },
  note(key, text) { this.push({ type: 'note', key, text }); },
  addExpense(expense) { this.push({ type: 'expense', expense: { id: uid(), ...expense } }); },
  deleteExpense(id) { this.push({ type: 'deleteExpense', id }); },
  pull, flush,
};

async function pull() {
  const url = backendUrl();
  if (!url || busy || !navigator.onLine) return;
  if (pending.length) return flush();
  busy = true;
  try {
    const r = await fetch(url + '?action=all', { cache: 'no-store' });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || 'Sync failed');
    const next = { settings: d.settings || {}, notes: d.notes || {}, expenses: d.expenses || [] };
    const changed = JSON.stringify(next) !== JSON.stringify(remote);
    remote = next;
    lastSync = Date.now(); lastError = null; save();
    busy = false;
    if (changed) emit();
    return;
  } catch (e) { lastError = String(e.message || e); }
  busy = false;
}

async function flush() {
  const url = backendUrl();
  if (!url || busy || !navigator.onLine || !pending.length) return;
  busy = true;
  const sending = pending.slice();
  try {
    // text/plain keeps this a "simple" request, so Apps Script needs no CORS preflight.
    const r = await fetch(url, { method: 'POST', body: JSON.stringify({ ops: sending }) });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || 'Save failed');
    const sent = new Set(sending.map(o => o.opId));
    pending = pending.filter(o => !sent.has(o.opId));
    remote = { settings: d.settings || {}, notes: d.notes || {}, expenses: d.expenses || [] };
    lastSync = Date.now(); lastError = null; save();
  } catch (e) { lastError = String(e.message || e); }
  busy = false; emit();
  if (pending.length && !lastError) flush();
}

export async function fetchPins() {
  const url = backendUrl();
  if (!url || !navigator.onLine) return null;
  try {
    const d = await (await fetch(url + '?action=pins')).json();
    if (d.ok && Array.isArray(d.pins)) { store.set('pins', d.pins); return d.pins; }
  } catch (e) { /* offline or backend not deployed yet */ }
  return null;
}

export function startSync() {
  pull();
  window.addEventListener('online', () => sync.pull());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync.pull(); });
  setInterval(() => { if (document.visibilityState === 'visible') sync.pull(); }, 60000);
}
