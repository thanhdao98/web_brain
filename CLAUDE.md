# web_brain — context
Dashboard cá nhân tối giản (HTML/CSS/JS thuần, không build). Mã nguồn chia css/ + js/ (bản đồ file và quy ước đặt tên: README.md); sửa css/js xong chạy `python3 tools/bump-version.py`. Dữ liệu tách khỏi giao diện.
- Chạy local: `./serve.sh` → http://localhost:8080 (`?v=nha` = bản gia đình).
- Dữ liệu: `data/real.json` (chỉ máy cá nhân, gitignore) nếu có, ngược lại `data/demo.json` (dữ liệu mẫu, công khai).
- Phong cách: đen–trắng + 1 màu nhấn; quả cầu nhiều màu (ngoại lệ). Mobile-first, ≥900px thành 3 cột.
## Quy tắc
- Không bao giờ commit `data/real.json`, `data/avatar.*`, `.env`; repo này sẽ Public khi deploy → chỉ chứa dữ liệu mẫu.
- Deploy chỉ khi chủ dự án yêu cầu rõ; workflow Pages có bước quét bí mật.
- Trình bày cách làm, chờ duyệt rồi mới sửa/chạy.
- Thẻ bán hàng (js/card-sales.js + css/card-sales.css): giao diện nằm trong nút Bán hàng của tab Kiếm cơm; số mẫu trong `sales` của demo.json chỉ hiện ở bản công khai. Đọc `sales` từ Brain API (tab `ban_hang` trong Brain DB, 1 dòng/tháng; XONG 22/11). Tab Kiếm cơm có 2 nút Việc chính | Bán hàng; bản công khai (demo) và bản gia đình thấy nút Việc chính nhưng nội dung bị khoá. Chỉ 2 key OWNER/FAMILY (VA dùng FAMILY_KEY, thấy đủ thẻ bán hàng). Logic bán hàng: ../../automation/bot_ban_hang/CLAUDE.md — không chép sang đây.
- Đa ngôn ngữ VI·EN·JA: từ điển giao diện trong js/i18n-dictionary.js (TR/PT); nội dung riêng dịch trong `i18n` của real.json; `?lang=en|ja`. Thêm chuỗi UI mới thì thêm vào TR/PT.
