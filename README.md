# web_brain
Dashboard cá nhân tối giản (đen–trắng + một màu nhấn). Bản công khai chỉ hiển thị **dữ liệu mẫu**.
- Dữ liệu thật: `data/real.json` (chỉ ở máy cá nhân, gitignore). Không có file này thì trang dùng `data/demo.json`.
- Chạy local: `./serve.sh` → http://localhost:8080 (`?v=nha` = bản chung cho gia đình).

## Cấu trúc mã nguồn
```
web_brain/
├─ index.html          Khung trang: nạp css/ rồi js/ (thứ tự nạp QUAN TRỌNG, đừng đảo)
├─ css/                Giao diện (mỗi file một mảng: base, thẻ, bố cục điện thoại/máy tính…)
├─ js/                 Logic. Mỗi file có dòng chú thích đầu file nói rõ vai trò
├─ data/               demo.json (công khai), real.json (chỉ máy cá nhân), config.json (địa chỉ API)
├─ tools/              bump-version.py (đổi ?v=), i18n_check.py (tìm chuỗi thiếu bản dịch)
├─ design/archive/     Mockup cũ (chỉ ở máy cá nhân, không đưa lên GitHub)
└─ serve.sh            Chạy local
```
**Thứ tự nạp js/** (file sau dùng được hàm của file trước): `core` → `api` → `auto-refresh` → `access-key` → `home-header` → `card-collapse` → `home` → `card-notes` → `home-tasks` → `tab-work` → `card-weather` → `card-mail` → `card-calendar` → `card-health` → `tabs` → `navigation` → `tab-ai` → `orb` → `i18n-dictionary` → `i18n` → `main`.

**Quy ước đặt tên**
- File/thư mục: tiếng Anh, chữ thường, gạch nối (`card-mail.js`). Thẻ trên trang bắt đầu bằng `card-`, tab bằng `tab-`.
- Hàm: động từ + đối tượng, kiểu camelCase: `drawCalendar`, `loadMail`, `saveTick`, `refreshAll`. Hàm trả HTML kết thúc bằng `Html` (`mailRowHtml`). Hàm tải dữ liệu bắt đầu bằng `load`/`fetch`, hàm vẽ bắt đầu bằng `draw`/`render`.
- Hằng số viết HOA_GẠCH_DƯỚI (`API_URL`, `MAIL_GROUP_HUE`).
- Chữ hiển thị cho người dùng viết tiếng Việt, không đặt trong tên hàm; bản EN/JA nằm ở `js/i18n-dictionary.js`.

**Khi sửa css/js**: chạy `python3 tools/bump-version.py` trước khi commit để trình duyệt tải bản mới ngay (GitHub Pages giữ file cũ ~10 phút).
