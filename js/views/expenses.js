import { sync, backendUrl } from '../sync.js';
import { esc, euro, store, todayISO, shortDate } from '../util.js';
import { header } from '../ui.js';
import { L, F } from '../i18n.js';

const CATS = [['food', L('Food and drinks')], ['groceries', L('Groceries')], ['fuel', L('Fuel and tolls')], ['tickets', L('Tickets and tours')], ['stay', L('Stay')], ['other', L('Other')]];
const catLabel = c => (CATS.find(x => x[0] === c) || [, L('Other')])[1];

export const people = () => (sync.setting('people', []) || []).filter(Boolean);

function balances(list, ppl) {
  const net = Object.fromEntries(ppl.map(p => [p, 0]));
  const paid = Object.fromEntries(ppl.map(p => [p, 0]));
  for (const x of list) {
    const split = (x.split && x.split.length ? x.split : ppl).filter(p => p in net);
    if (!split.length) continue;
    if (x.paidBy in net) { net[x.paidBy] += x.amount; paid[x.paidBy] += x.amount; }
    split.forEach(p => { net[p] -= x.amount / split.length; });
  }
  // Settle with as few payments as possible: biggest debtor pays biggest creditor.
  const debt = ppl.filter(p => net[p] < -0.005).map(p => [p, -net[p]]).sort((a, b) => b[1] - a[1]);
  const cred = ppl.filter(p => net[p] > 0.005).map(p => [p, net[p]]).sort((a, b) => b[1] - a[1]);
  const pay = [];
  while (debt.length && cred.length) {
    const d = debt[0], c = cred[0], m = Math.min(d[1], c[1]);
    pay.push([d[0], c[0], m]);
    d[1] -= m; c[1] -= m;
    if (d[1] < 0.005) debt.shift();
    if (c[1] < 0.005) cred.shift();
  }
  return { net, paid, pay };
}

export function expenses() {
  const ppl = people();
  const list = [...sync.state.expenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const total = list.reduce((a, x) => a + x.amount, 0);
  const { net, paid, pay } = balances(list, ppl);
  const me = store.get('me', '');
  const byDate = {};
  list.forEach(x => { (byDate[x.date] = byDate[x.date] || []).push(x); });

  const setup = ppl.length < 2 ? `<section class="section"><div class="card">
      <h3>${L('Who’s splitting?')}</h3>
      <p class="small muted">${L('Add people or families, for example “Mārtiņš &amp; Ieva”, “Parents”. Everyone sees the same list.')}</p>
      <div class="row" style="flex-wrap:nowrap"><input type="text" id="p-name" placeholder="${L('Name')}"><button type="button" class="btn primary" id="p-add">${L('Add')}</button></div>
      ${ppl.length ? `<p class="small">${ppl.map(esc).join(', ')}</p>` : ''}
    </div></section>` : '';

  return {
    title: L('Expenses'),
    html: `${header(L('Expenses'), { back: 'more', sub: backendUrl() ? L('Shared with everyone and saved in the Google Sheet.') : L('Saved on this phone only until sharing is set up in Settings.') })}
    ${setup}
    ${ppl.length >= 2 ? `<section class="section"><form class="card" id="exp-form" autocomplete="off">
      <h3>${L('Add an expense')}</h3>
      <div class="grid2">
        <div class="field"><label for="x-amount">${L('Amount (€)')}</label><input type="text" inputmode="decimal" id="x-amount" placeholder="0.00" required></div>
        <div class="field"><label for="x-date">${L('Date')}</label><input type="date" id="x-date" value="${todayISO()}"></div>
      </div>
      <div class="field"><label for="x-desc">${L('What for')}</label><input type="text" id="x-desc" placeholder="${L('Dinner in Limeni')}"></div>
      <div class="grid2">
        <div class="field"><label for="x-cat">${L('Category')}</label><select id="x-cat">${CATS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
        <div class="field"><label for="x-paid">${L('Paid by')}</label><select id="x-paid">${ppl.map(p => `<option${p === me ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><span class="flabel">${L('Split between')}</span><div class="chips" style="flex-wrap:wrap">${ppl.map(p => `<button type="button" class="chip" data-split="${esc(p)}" aria-pressed="true">${esc(p)}</button>`).join('')}</div></div>
      <p class="small" id="x-err" style="color:var(--warn)" hidden></p>
      <div class="row"><button type="submit" class="btn primary big">${L('Add expense')}</button></div>
    </form></section>` : ''}
    ${list.length ? `<section class="section"><h2>${L('Balance')}</h2>
      <div class="money"><div class="card"><span class="small muted">${L('Total spent')}</span><b>${euro(total)}</b></div>
      ${ppl.map(p => `<div class="card"><span class="small muted">${F('{name} paid {amount}', { name: esc(p), amount: euro(paid[p]) })}</span><b class="${net[p] >= 0 ? 'pos' : 'neg'}">${net[p] >= 0 ? '+' : '−'}${euro(Math.abs(net[p]))}</b></div>`).join('')}</div>
      ${pay.length ? `<div class="card"><p class="eyebrow">${L('To settle up')}</p>${pay.map(([a, b, m]) => `<p>${F('{from} pays {to} {amount}', { from: `<b>${esc(a)}</b>`, to: `<b>${esc(b)}</b>`, amount: euro(m) })}</p>`).join('')}</div>` : `<p class="small muted">${L('Everyone is even.')}</p>`}
    </section>
    <section class="section"><h2>${L('All expenses')}</h2>${Object.keys(byDate).map(d => `<div><p class="eyebrow" style="margin-top:12px">${/^\d{4}-/.test(d) ? shortDate(d) : esc(d)}</p>${byDate[d].map(x => `<div class="exp">
      <div><b>${esc(x.description || catLabel(x.category))}</b><div class="meta">${catLabel(x.category)} · ${F('paid by {name}', { name: esc(x.paidBy) })}${x.split && x.split.length && x.split.length < ppl.length ? ' · ' + F('split: {names}', { names: x.split.map(esc).join(', ') }) : ''}</div></div>
      <div style="text-align:right"><div class="amt">${euro(x.amount)}</div><button type="button" class="linkbtn" data-del="${esc(x.id)}">${L('Delete')}</button></div>
    </div>`).join('')}</div>`).join('')}</section>` : (ppl.length >= 2 ? `<p class="section muted">${L('No expenses yet.')}</p>` : '')}`,
    after(root) {
      const addP = root.querySelector('#p-add');
      if (addP) {
        const inp = root.querySelector('#p-name');
        const add = () => { const n = inp.value.trim(); if (n && !ppl.includes(n)) sync.set('people', [...ppl, n]); inp.value = ''; inp.blur(); };
        addP.addEventListener('click', add);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
      }
      root.querySelectorAll('[data-split]').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')));
      root.querySelector('#exp-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const err = root.querySelector('#x-err');
        const amount = Math.round(parseFloat(root.querySelector('#x-amount').value.replace(',', '.')) * 100) / 100;
        const split = [...root.querySelectorAll('[data-split][aria-pressed="true"]')].map(b => b.dataset.split);
        if (!(amount > 0)) { err.textContent = L('Enter an amount, for example 42.50.'); err.hidden = false; return; }
        if (!split.length) { err.textContent = L('Pick at least one person to split with.'); err.hidden = false; return; }
        document.activeElement?.blur();
        sync.addExpense({
          date: root.querySelector('#x-date').value || todayISO(), amount,
          description: root.querySelector('#x-desc').value.trim(), category: root.querySelector('#x-cat').value,
          paidBy: root.querySelector('#x-paid').value || ppl[0], split: split.length === ppl.length ? [] : split,
        });
      });
      root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.armed) { sync.deleteExpense(b.dataset.del); return; }
        b.dataset.armed = '1'; b.textContent = L('Tap again to delete');
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = L('Delete'); } }, 3000);
      }));
    },
  };
}
