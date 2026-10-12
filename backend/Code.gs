/**
 * Greece trip guide backend.
 *
 * Lives inside the Google Sheet (Extensions → Apps Script). Deploy it as a web app:
 *   Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone.
 * The tabs (settings, notes, expenses) are created automatically on first use.
 *
 * GET  ?action=all   → { settings, notes, expenses }
 * GET  ?action=pins  → pins from the shared Google My Maps (cached 10 min)
 * POST { ops: [...] } → applies the ops, returns the same as ?action=all
 */

const MYMAP_ID = '1V9nXn0qyupGXmL1IGmQECzKKDhrxlg4';

const TABS = {
  settings: ['key', 'value', 'updatedAt', 'by'],
  notes: ['key', 'text', 'updatedAt', 'by'],
  expenses: ['id', 'date', 'paidBy', 'amount', 'description', 'category', 'split', 'createdAt', 'by', 'deleted'],
};

/** Run once from the editor to create the tabs and grant permissions. */
function setup() {
  Object.keys(TABS).forEach(sheet_);
  pins_();
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'all';
  try {
    if (action === 'pins') return json_({ ok: true, pins: pins_() });
    return json_(Object.assign({ ok: true }, all_()));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    (body.ops || []).forEach(apply_);
    return json_(Object.assign({ ok: true }, all_()));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function apply_(op) {
  const now = new Date();
  const by = text_(op.by || '');
  if (op.type === 'set') {
    upsert_('settings', op.key, [op.key, JSON.stringify(op.value), now, by]);
  } else if (op.type === 'note') {
    upsert_('notes', op.key, [op.key, text_(op.text), now, by]);
  } else if (op.type === 'expense') {
    const x = op.expense;
    if (find_('expenses', x.id) > 0) return;
    const sh = sheet_('expenses');
    sh.appendRow([x.id, '', text_(x.paidBy), Number(x.amount) || 0, text_(x.description), text_(x.category), (x.split || []).map(text_).join(', '), now, by, '']);
    sh.getRange(sh.getLastRow(), 2).setNumberFormat('@').setValue(String(x.date));
  } else if (op.type === 'deleteExpense') {
    const row = find_('expenses', op.id);
    if (row > 0) sheet_('expenses').getRange(row, 10).setValue(true);
  }
}

function all_() {
  const settings = {};
  rows_('settings').forEach(function (r) {
    try { settings[r.key] = JSON.parse(r.value); } catch (_) { settings[r.key] = r.value; }
  });
  const notes = {};
  rows_('notes').forEach(function (r) {
    notes[r.key] = { text: String(r.text), updatedAt: r.updatedAt, by: r.by };
  });
  const expenses = rows_('expenses')
    .filter(function (r) { return r.deleted !== true && String(r.deleted).toUpperCase() !== 'TRUE'; })
    .map(function (r) {
      return {
        id: String(r.id), date: date_(r.date), paidBy: String(r.paidBy), amount: Number(r.amount) || 0,
        description: String(r.description), category: String(r.category),
        split: String(r.split || '').split(',').map(function (s) { return s.trim(); }).filter(String),
        by: String(r.by),
      };
    });
  return { settings: settings, notes: notes, expenses: expenses, serverTime: new Date().toISOString() };
}

function pins_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('pins');
  if (hit) return JSON.parse(hit);
  const xml = UrlFetchApp.fetch('https://www.google.com/maps/d/kml?forcekml=1&mid=' + MYMAP_ID).getContentText();
  const ns = XmlService.getNamespace('http://www.opengis.net/kml/2.2');
  const out = [];
  (function walk(el) {
    el.getChildren().forEach(function (ch) {
      const name = ch.getName();
      if (name === 'Placemark') {
        const pt = ch.getChild('Point', ns);
        if (!pt) return;
        const c = pt.getChildText('coordinates', ns).trim().split(',');
        out.push({
          name: (ch.getChildText('name', ns) || '').trim(),
          note: (ch.getChildText('description', ns) || '').trim(),
          lng: Number(c[0]), lat: Number(c[1]),
        });
      } else if (name === 'Folder' || name === 'Document') {
        walk(ch);
      }
    });
  })(XmlService.parse(xml).getRootElement());
  cache.put('pins', JSON.stringify(out), 600);
  return out;
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold');
  }
  return sh;
}

function rows_(name) {
  const values = sheet_(name).getDataRange().getValues();
  const head = values.shift();
  return values.filter(function (r) { return r[0] !== ''; }).map(function (r) {
    const o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
}

function find_(name, key) {
  const sh = sheet_(name);
  const n = sh.getLastRow();
  if (n < 2) return -1;
  const keys = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < keys.length; i++) if (String(keys[i][0]) === String(key)) return i + 2;
  return -1;
}

function upsert_(name, key, row) {
  const sh = sheet_(name);
  const r = find_(name, key);
  if (r > 0) sh.getRange(r, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
}

/** Stops Sheets from treating user text as a formula. */
function text_(s) {
  s = String(s == null ? '' : s);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function date_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  return String(v);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
