#!/bin/bash
# Chạy web trên máy cá nhân (chỉ truy cập từ máy này): http://localhost:8080
# Xem bản cho gia đình: http://localhost:8080/?v=nha
cd "$(dirname "$0")" && python3 -m http.server 8080 --bind 127.0.0.1
