"""Merges translation batches (tools/i18n/out-lv-*.json, out-en.json) into data/i18n-lv.js and data/i18n-en.js.
Checks that placeholders and HTML tags survived. Existing translations are kept unless a batch overrides them."""
import glob, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PH = re.compile(r'\{\w+\}')
TAG = re.compile(r'</?[a-z][^>]*>')

def load_js(path, name):
    p = ROOT / path
    if not p.exists():
        return {}
    s = p.read_text(encoding='utf-8')
    return json.loads(s[s.index('{', s.index(name)):s.rindex('}') + 1] or '{}')

def check(src, dst):
    probs = []
    if sorted(PH.findall(src)) != sorted(PH.findall(dst)): probs.append('placeholders')
    if len(TAG.findall(src)) != len(TAG.findall(dst)): probs.append('html tags')
    return probs

def merge(pattern, path, name, header):
    cur = load_js(path, name)
    bad = 0
    for f in sorted(glob.glob(str(ROOT / 'tools/i18n' / pattern))):
        for k, v in json.load(open(f, encoding='utf-8')).items():
            p = check(k, v)
            if p:
                bad += 1
                print(f'SKIPPED ({", ".join(p)}): {k[:70]!r} -> {v[:70]!r}')
                continue
            cur[k] = v
    (ROOT / path).write_text(f'{header}\nexport const {name} = ' + json.dumps(cur, ensure_ascii=False, indent=1, sort_keys=True) + ';\n', encoding='utf-8')
    print(f'{path}: {len(cur)} entries, {bad} skipped')

merge('out-lv-*.json', 'data/i18n-lv.js', 'TO_LV', '// English → Latvian. Keys are the exact English strings. Edit freely; run tools/i18n_extract.mjs to find gaps.')
merge('out-en.json', 'data/i18n-en.js', 'TO_EN', '// Latvian → English, for text written in Latvian (quiz, story titles).')
