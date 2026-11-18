/* core.js — Hằng số, biến chung, hàm tiện ích (đọc/ghi bộ nhớ trình duyệt, tải JSON). */
/* ── Biến dùng chung toàn trang (đọc kỹ trước khi sửa) ──
   FAM    : true khi mở bản gia đình (?v=nha) hoặc đăng nhập bằng FAMILY_KEY → ẩn các thẻ riêng tư
   DATA   : toàn bộ dữ liệu đang hiển thị (đã trộn demo/real + Brain API)
   st     : việc nào đã tick hôm nay, dạng {idViệc: true}; tự xoá lúc 0:00
   used   : % hạn mức AI tháng đã dùng (nhập tay ở tab AI)
   f / fa : bộ lọc đang chọn ở danh sách việc — f = theo buổi (Sáng/Tàu/Khuya), fa = theo lĩnh vực
   hot    : tab nào đang có cảnh báo (hiện chấm đỏ trên quả cầu)
   TABS   : danh sách tab theo vai trò (chủ có 5 tab, vợ có 3) */
var FAM=/[?&]v=nha/.test(location.search);
var DATA=null,st={},used=40,f="all",fa="all",hot={},TABS=[];
/* lĩnh vực: khoá → [tên hiển thị, màu hue]. Đổi tên chỉ cần sửa ở đây. */
var AR={work:["Việc chính",210],biz:["Tay trái",30],home:["Tổ ấm",140],learn:["Học",270],fit:["Khoẻ",175]};
/* nhóm = tab = điểm trên quả cầu; AR vẫn là màu chi tiết từng lĩnh vực */
var GR={earn:["Kiếm cơm",["work","biz"]],home:["Tổ ấm",["home"]],grow:["Rèn",["learn","fit"]]};
function inGroup(g,a){return g==="all"||(GR[g]&&GR[g][1].indexOf(a)>=0)}
function dotHtml(a){return AR[a]?'<i class="dot" style="background:hsl('+AR[a][1]+',70%,55%)"></i>':""}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function readStorage(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}}
function writeStorage(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function isVisible(x){return !FAM||x.scope==="family"}
var baseData=null,serverSignature="",autoRefreshOn=(function(){try{return localStorage.getItem("wb_auto")!=="off"}catch(e){return true}})(),autoRefreshPaused=false,lastActivityAt=Date.now(),fullFetching=false,API_URL="",API_KEY="",lastTickToggleAt=0,lastIdeaEditAt=0,lastPullAt=0,DCHK=0,dataSignature="",flashIds=[],syncState="",ideaList=[];
function fetchJson(u,ms){var c=new AbortController(),t=setTimeout(function(){c.abort()},ms||9000);
  return fetch(u,{cache:"no-store",signal:c.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.json()},function(e){clearTimeout(t);throw e})}
