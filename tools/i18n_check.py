#!/usr/bin/env python3
"""Liệt kê chuỗi CHƯA có bản dịch EN/JA trong data/real.json (mặc định) hoặc demo.json. Không tốn token.
Chạy:  python3 tools/i18n_check.py          # real.json
       python3 tools/i18n_check.py demo     # demo.json
Cách dùng với Claude: chạy lệnh này, đưa Claude đúng danh sách "THIẾU" để dịch gộp một lần, rồi dán vào mục "i18n"."""
import json, re, sys

SKIP = {'id','url','key','user','c','a','scope','date','in','updated','hide','now','p','la','lo','sit','auto','start','avatar','i18n'}
TEXT = re.compile(r'[A-Za-zÀ-ỹ]{3,}')                 # phải có chữ thật
NOISE = re.compile(r'^(https?://|\d{4}-\d\d-\d\d|\d{1,2}:\d{2}$|(T[2-7]|CN)$)')  # url, ngày, giờ, thứ (từ điển UI lo)

def walk(o, k, out):
    if isinstance(o, dict):
        for kk, v in o.items():
            if kk != 'i18n': walk(v, kk, out)   # bỏ cả khối bản dịch
    elif isinstance(o, list):
        for v in o: walk(v, k, out)
    elif isinstance(o, str) and k not in SKIP and TEXT.search(o) and not NOISE.match(o):
        out.add(o)

name = 'demo' if (len(sys.argv) > 1 and sys.argv[1] == 'demo') else 'real'
d = json.load(open(f'data/{name}.json', encoding='utf-8'))
have = d.get('i18n', {})
strings = set(); walk(d, '', strings)
allstr = set(); [allstr.add(x) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', json.dumps({k: v for k, v in d.items() if k != 'i18n'}, ensure_ascii=False))]
missing = sorted(s for s in strings if s not in have)
stale = sorted(k for k in have if k not in allstr)
ascii_only = [s for s in missing if s.isascii()]
print(f"[{name}.json] đã dịch {len(strings) - len(missing)}/{len(strings)} chuỗi")
print(f"THIẾU ({len(missing)}):")
for s in missing: print("  -", s, "  (chữ Latin, có thể giữ nguyên)" if s in ascii_only else "")
if stale:
    print(f"DƯ ({len(stale)}) — bản dịch không còn chuỗi gốc, có thể xoá:")
    for s in stale: print("  -", s)
sys.exit(1 if [s for s in missing if s not in ascii_only] else 0)
