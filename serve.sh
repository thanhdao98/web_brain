#!/bin/bash
# Chạy web trên máy cá nhân (chỉ truy cập từ máy này): http://localhost:8080
# Xem bản cho gia đình: http://localhost:8080/?v=nha
# Server luôn gửi "Cache-Control: no-store" để trình duyệt không giữ bản cũ khi sửa web.
cd "$(dirname "$0")" && exec python3 - <<'PY'
import http.server

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

http.server.ThreadingHTTPServer(("127.0.0.1", 8080), H).serve_forever()
PY
