/* access-key.js — Mã truy cập (OWNER/FAMILY KEY): hỏi khi mở, nhớ 30 ngày (tính lại mỗi lần mở), thoát chế độ dữ liệu thật. */
var KEY_TTL_MS=30*864e5;
function readSession(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function writeSession(k,v){try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}}
function dropStorage(k){try{localStorage.removeItem(k)}catch(e){}}
function keyIsRemembered(){return !!readStorage("wb_key","")}
var CACHE_KEYS=["wb_api","wb_mail","wb_mhide","wb_pain","wb_qn","wb_cal"];   // bản lưu tạm dữ liệu riêng của Chủ: xoá khi đổi bản xem hoặc thoát
function inPreview(){return readSession("wb_view")==="family"&&!!readStorage("wb_fk","")}   // máy Chủ đang xem thử bản gia đình (chỉ trong phiên này)
function isOwnerDevice(){return readStorage("wb_role","")==="owner"}
function switchView(toFam){CACHE_KEYS.forEach(dropStorage);writeSession("wb_view",toFam?"family":null);location.reload()}
function getAccessKey(){   // mã chỉ-phiên (không tick "ghi nhớ") ưu tiên; mã ghi nhớ hết hạn sau 30 ngày không mở, mỗi lần mở tính lại
  if(inPreview())return readStorage("wb_fk","");   // xem thử bản gia đình: dùng mã gia đình thật
  var s=readSession("wb_key_s");if(s)return s;
  var k=readStorage("wb_key",""),t=+readStorage("wb_kt",0),n=Date.now();if(!k)return"";
  if(t&&n-t>KEY_TTL_MS){clearAccessKey();return""}
  writeStorage("wb_kt",n);return k}
function saveAccessKey(k,remember,role){   // role: quyền của mã (owner/family) nếu biết; máy nhận mã mới thì bỏ mã gia đình xem thử cũ
  dropStorage("wb_fk");dropStorage("wb_role");writeSession("wb_view",null);if(role)writeStorage("wb_role",role);
  if(!remember){writeSession("wb_key_s",k);if(readSession("wb_key_s")===k){writeStorage("wb_key","");writeStorage("wb_kt",0);return}}   // trình duyệt chặn sessionStorage thì rơi xuống ghi nhớ thường
  writeStorage("wb_key",k);writeStorage("wb_kt",Date.now());writeSession("wb_key_s",null)}
function clearAccessKey(){   // xoá mã + bản lưu tạm dữ liệu thật trong máy
  ["wb_key","wb_kt","wb_fk","wb_role"].concat(CACHE_KEYS).forEach(dropStorage);writeSession("wb_key_s",null);writeSession("wb_view",null)}
function accessKeyButtonHtml(){if(!API_URL)return"";if(DATA&&DATA.__live&&!inPreview())writeStorage("wb_role",DATA.__role);   // nhớ quyền của mã đang dùng (máy Chủ mới có nút đổi bản)
  return DATA&&DATA.__live?'<button class="kb on" id="kb" title="Thoát">'+(DATA.__role==="family"?"Gia đình ✓":"Chủ ✓")+'</button>':'<button class="kb" id="kb">Nhập mã</button>'}
function askAccessKeyOnOpen(){   // mỗi lần mở (phiên mới) mà chưa có mã: hỏi 1 lần; chọn "Xem bản mẫu" thì không hỏi lại trong phiên này
  if(!API_URL||(DATA&&DATA.__live)||readSession("wb_ask"))return;writeSession("wb_ask","1");openAccessKeyDialog(false,true)}
function openSwitchDialog(){   // chỉ máy Chủ: đổi qua lại bản Chủ ↔ bản Gia đình (xem thử bằng mã gia đình thật, máy chủ lọc đúng như máy vợ thấy)
  var pv=inPreview(),o=document.createElement("div");o.id="kd";
  o.innerHTML='<div class="kc"><div class="kt">Chọn bản xem</div><div class="ks">Bản gia đình dùng mã gia đình thật, đúng như máy vợ thấy.</div><div class="kv"><button class="kbtn'+(pv?'':' kp')+'" id="vown">Bản Chủ</button><button class="kbtn'+(pv?' kp':'')+'" id="vfam">Bản Gia đình</button></div><div id="kfw" hidden><input id="kin" type="password" autocomplete="off" placeholder="Dán mã gia đình (nhập 1 lần)"><div class="kmsg" id="kmsg"></div><div class="ka"><button class="kbtn kp" id="kfgo">Xem thử</button></div></div><div class="ka"><button class="kbtn" id="kno">Đóng</button><button class="kbtn" id="kout">Thoát</button></div></div>';
  document.body.appendChild(o);var $=function(i){return document.getElementById(i)};
  $("kno").onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  $("vown").onclick=function(){if(pv)switchView(false);else o.remove()};
  $("vfam").onclick=function(){if(pv){o.remove();return}if(readStorage("wb_fk",""))switchView(true);else{$("kfw").hidden=false;$("kin").focus()}};
  var tryFam=function(){var k=$("kin").value.trim();if(!k)return;$("kmsg").textContent="Đang kiểm tra…";
    fetchJson(API_URL+"?k="+encodeURIComponent(k),12000).then(function(j){if(j.error){$("kmsg").textContent="Mã không đúng";return}
      if(j.role!=="family"){$("kmsg").textContent="Đây không phải mã gia đình";return}
      writeStorage("wb_fk",k);writeSession("wb_view","family");switchView(true)},function(){$("kmsg").textContent="Không kết nối được"})};
  $("kfgo").onclick=tryFam;$("kin").onkeydown=function(e){if(e.key==="Enter")tryFam()};
  $("kout").onclick=function(){if(!this.sure){this.sure=1;this.textContent="Bấm lần nữa để thoát";return}clearAccessKey();writeSession("wb_ask","1");location.reload()}}
function openAccessKeyDialog(live,ask,wantOwner){   // wantOwner: máy đang dùng mã gia đình, nhập thêm mã Chủ → máy thành máy Chủ, mã gia đình cũ giữ lại để xem thử
  if(live&&isOwnerDevice()){openSwitchDialog();return}
  var o=document.createElement("div");o.id="kd";
  o.innerHTML='<div class="kc">'+(live?'<div class="kt">Thoát chế độ dữ liệu thật?</div>'+(DATA&&DATA.__role==="family"?'<button class="klink" id="kown">Tôi là Chủ: nhập mã Chủ</button>':'')+'<div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kout">Thoát</button></div>'
    :ask?'<div class="kt">Dùng dữ liệu thật?</div><div class="ks">Nhập mã để mở dữ liệu của bạn. Bỏ qua thì xem bản mẫu.</div><div class="ka"><button class="kbtn" id="kno">Xem bản mẫu</button><button class="kbtn kp" id="kyes">Có, nhập mã</button></div>'
    :'<div class="kt">'+(wantOwner?'Nhập mã Chủ':'Nhập mã truy cập')+'</div><input id="kin" type="password" autocomplete="off" placeholder="Dán mã do Thành gửi"><label class="kr"><input type="checkbox" id="krm" checked><span>Ghi nhớ trên thiết bị này (30 ngày)</span></label><div class="kmsg" id="kmsg"></div><div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kgo">Mở</button></div>')+'</div>';
  document.body.appendChild(o);var $=function(i){return document.getElementById(i)};
  $("kno").onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  if(ask){$("kyes").onclick=function(){o.remove();openAccessKeyDialog(false)};return}
  if(live){var ko=$("kown");if(ko)ko.onclick=function(){o.remove();openAccessKeyDialog(false,false,true)};$("kout").onclick=function(){clearAccessKey();writeSession("wb_ask","1");location.reload()};return}
  var submitKey=function(){var k=$("kin").value.trim();if(!k)return;$("kmsg").textContent="Đang kiểm tra…";
    var prev=(DATA&&DATA.__live&&DATA.__role==="family"&&!inPreview())?getAccessKey():"";   // mã gia đình đang dùng, giữ lại làm mã xem thử
    fetchJson(API_URL+"?k="+encodeURIComponent(k),12000).then(function(j){if(j.error){$("kmsg").textContent="Mã không đúng";return}
      if(wantOwner&&j.role!=="owner"){$("kmsg").textContent="Đây không phải mã Chủ";return}
      saveAccessKey(k,$("krm").checked,j.role);if(prev&&j.role==="owner"&&prev!==k){writeStorage("wb_fk",prev);CACHE_KEYS.forEach(dropStorage)}location.reload()},function(){$("kmsg").textContent="Không kết nối được"})};
  $("kgo").onclick=submitKey;$("kin").onkeydown=function(e){if(e.key==="Enter")submitKey()};setTimeout(function(){$("kin").focus()},50)}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#kb"))openAccessKeyDialog(!!(DATA&&DATA.__live))});
(function(){if(!inPreview())return;   // dải báo "đang xem thử" ở đầu trang, để khỏi nhầm đang xem bản nào
  var add=function(){var b=document.createElement("div");b.id="pv";b.innerHTML='<span>Đang xem thử bản gia đình</span><button id="pvb">Về bản Chủ</button>';document.body.insertBefore(b,document.body.firstChild);document.getElementById("pvb").onclick=function(){switchView(false)}};
  if(document.body)add();else document.addEventListener("DOMContentLoaded",add)})();
(function(){var m=/[#&]k=([0-9a-fA-F]{20,})/.exec(location.hash);if(m){saveAccessKey(m[1],true);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}})();
