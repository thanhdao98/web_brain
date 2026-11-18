#!/usr/bin/env python3
"""Đổi số phiên bản (?v=...) sau mỗi tên file css/js trong index.html.

Vì sao cần: GitHub Pages cho trình duyệt giữ file ~10 phút. Mỗi lần sửa css/js, chạy
file này trước khi commit để mọi máy tải bản mới ngay, không bị lẫn bản cũ và bản mới.

Dùng:  python3 tools/bump-version.py
"""
import re, time, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
v = time.strftime("%Y%m%d%H%M")
s = p.read_text(encoding="utf-8")
s2 = re.sub(r'((?:css|js)/[\w-]+\.(?:css|js))\?v=\w+', r'\1?v=' + v, s)
p.write_text(s2, encoding="utf-8")
print("Phiên bản:", v, "-", len(re.findall(r'\?v=' + v, s2)), "file")
