/* access-key.js — Nhập mã truy cập (OWNER/FAMILY KEY) và thoát chế độ dữ liệu thật. */
function accessKeyButtonHtml(){if(!API_URL)return"";return DATA&&DATA.__live?'<button class="kb on" id="kb" title="Thoát">'+(DATA.__role==="family"?"Gia đình ✓":"Dữ liệu thật ✓")+'</button>':'<button class="kb" id="kb">Nhập mã</button>'}
function openAccessKeyDialog(live){
  var o=document.createElement("div");o.id="kd";
  o.innerHTML='<div class="kc">'+(live?'<div class="kt">Thoát chế độ dữ liệu thật?</div><div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kout">Thoát</button></div>'
    :'<div class="kt">Nhập mã truy cập</div><input id="kin" type="password" autocomplete="off" placeholder="Dán mã do Thành gửi"><div class="kmsg" id="kmsg"></div><div class="ka"><button class="kbtn" id="kno">Huỷ</button><button class="kbtn kp" id="kgo">Mở</button></div>')+'</div>';
  document.body.appendChild(o);var $=function(i){return document.getElementById(i)};
  $("kno").onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  if(live){$("kout").onclick=function(){writeStorage("wb_key","");writeStorage("wb_api",null);location.reload()};return}
  var submitKey=function(){var k=$("kin").value.trim();if(!k)return;$("kmsg").textContent="Đang kiểm tra…";
    fetchJson(API_URL+"?k="+encodeURIComponent(k),12000).then(function(j){if(j.error){$("kmsg").textContent="Mã không đúng";return}writeStorage("wb_key",k);location.reload()},function(){$("kmsg").textContent="Không kết nối được"})};
  $("kgo").onclick=submitKey;$("kin").onkeydown=function(e){if(e.key==="Enter")submitKey()};setTimeout(function(){$("kin").focus()},50)}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#kb"))openAccessKeyDialog(!!(DATA&&DATA.__live))});
(function(){var m=/[#&]k=([0-9a-fA-F]{20,})/.exec(location.hash);if(m){writeStorage("wb_key",m[1]);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}})();
