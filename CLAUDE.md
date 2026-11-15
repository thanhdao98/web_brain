# web_brain — context
Dashboard cá nhân tối giản (HTML/CSS/JS thuần, không build). Dữ liệu tách khỏi giao diện.
- Chạy local: `./serve.sh` → http://localhost:8080 (`?v=nha` = bản gia đình).
- Dữ liệu: `data/real.json` (chỉ máy cá nhân, gitignore) nếu có, ngược lại `data/demo.json` (dữ liệu mẫu, công khai).
- Phong cách: đen–trắng + 1 màu nhấn; quả cầu nhiều màu (ngoại lệ). Mobile-first, ≥900px thành 3 cột.
## Quy tắc
- Không bao giờ commit `data/real.json`, `data/avatar.*`, `.env`; repo này sẽ Public khi deploy → chỉ chứa dữ liệu mẫu.
- Deploy chỉ khi chủ dự án yêu cầu rõ; workflow Pages có bước quét bí mật.
- Trình bày cách làm, chờ duyệt rồi mới sửa/chạy.
