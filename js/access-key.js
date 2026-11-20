/* access-key.js — Mã truy cập (OWNER/FAMILY KEY): hỏi khi mở, nhớ 30 ngày (tính lại mỗi lần mở), thoát chế độ dữ liệu thật. */
var KEY_TTL_MS=30*864e5;
function readSession(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function writeSession(k,v){try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}}
function dropStorage(k){try{localStorage.removeItem(k)}catch(e){}}
function keyIsRemembered(){return !!readStorage("wb_key","")}
function getAccessKey(){   // mã chỉ-phiên (không tick "ghi nhớ") ưu tiên; mã ghi nhớ hết hạn sau 30 ngày không mở, mỗi lần mở tính lại
  var s=readSession("wb_key_s");if(s)return s;
  var k=readStorage("wb_key",""),t=+readStorage("wb_kt",0),n=Date.now();if(!k)return"";
  if(t&&n-t>KEY_TTL_MS){clearAccessKey();return""}
  writeStorage("wb_kt",n);return k}
function saveAccessKey(k,remember){
  if(!remember){writeSession("wb_key_s",k);if(readSession("wb_key_s")===k){writeStorage("wb_key","");writeStorage("wb_kt",0);return}}   // trình duyệt chặn sessionStorage thì rơi xuống ghi nhớ thường
  writeStorage("wb_key",k);writeStorage("wb_kt",Date.now());writeSession("wb_key_s",null)}
function clearAccessKey(){   // xoá mã + bản lưu tạm dữ liệu thật trong máy
  ["wb_key","wb_kt","wb_api","wb_mail","wb_mhide","wb_pain","wb_qn"].forEach(dropStorage);writeSession("wb_key_s",null)}
function accessKeyButtonHtml(){if(!API_URL)return"";return DATA&&DATA.__live?'<button class="kb on" id="kb" title="Thoát">'+(DATA.__role==="family"?"Gia đình ✓":"Dữ liệu thật ✓")+'</button>':'<button class="kb" id="kb">Nhập mã</button>'}
function askAccessKeyOnOpen(){   // mỗi lần mở (phiên mới) mà chưa có mã: hỏi 1 lần; chọn "Xem bản mẫu" thì không hỏi lại trong phiên này
  if(!API_URL||(DATA&&DATA.__live)||readSession("wb_ask"))return;writeSession("wb_ask","1");openAccessKeyDialog(false,true)}
function openAccessKeyDialog(live,ask){
  var o=document.createElement("div");o.id="kd";
  o.innerHTML='<div class="kc">'+(live?'<div class="kt">Thoát chế độ dữ liệu thật?</div><div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kout">Thoát</button></div>'
    :ask?'<div class="kt">Dùng dữ liệu thật?</div><div class="ks">Nhập mã để mở dữ liệu của bạn. Bỏ qua thì xem bản mẫu.</div><div class="ka"><button class="kbtn" id="kno">Xem bản mẫu</button><button class="kbtn kp" id="kyes">Có, nhập mã</button></div>'
    :'<div class="kt">Nhập mã truy cập</div><input id="kin" type="password" autocomplete="off" placeholder="Dán mã do Thành gửi"><label class="kr"><input type="checkbox" id="krm" checked><span>Ghi nhớ trên thiết bị này (30 ngày)</span></label><div class="kmsg" id="kmsg"></div><div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kgo">Mở</button></div>')+'</div>';
  document.body.appendChild(o);var $=function(i){return document.getElementById(i)};
  $("kno").onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  if(ask){$("kyes").onclick=function(){o.remove();openAccessKeyDialog(false)};return}
  if(live){$("kout").onclick=function(){clearAccessKey();writeSession("wb_ask","1");location.reload()};return}
  var submitKey=function(){var k=$("kin").value.trim();if(!k)return;$("kmsg").textContent="Đang kiểm tra…";
    fetchJson(API_URL+"?k="+encodeURIComponent(k),12000).then(function(j){if(j.error){$("kmsg").textContent="Mã không đúng";return}saveAccessKey(k,$("krm").checked);location.reload()},function(){$("kmsg").textContent="Không kết nối được"})};
  $("kgo").onclick=submitKey;$("kin").onkeydown=function(e){if(e.key==="Enter")submitKey()};setTimeout(function(){$("kin").focus()},50)}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#kb"))openAccessKeyDialog(!!(DATA&&DATA.__live))});
(function(){var m=/[#&]k=([0-9a-fA-F]{20,})/.exec(location.hash);if(m){saveAccessKey(m[1],true);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}})();
