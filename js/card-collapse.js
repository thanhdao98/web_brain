/* card-collapse.js — Thẻ gấp được: chỉ gấp khi hơn 3 mục, nhớ trạng thái theo máy. */
/* thẻ gấp được: chỉ khi có hơn 3 mục (Lịch, Ghi chú); gấp thì vẫn thấy 3 mục đầu. Thẻ ít mục luôn hiện đủ. Nhớ theo máy */
var COLIDS=["nc","cl"],COL=ls("wb_col",{});
function colFit(id){var el=document.getElementById(id);if(!el)return;
  var items=[].slice.call(el.querySelectorAll(id==="cl"?".ce:not(.pst)":".row")),big=items.length>3;
  [].forEach.call(el.querySelectorAll(".xx"),function(n){n.classList.remove("xx")});
  el.classList.toggle("cd",big);if(!big){el.classList.remove("c");return}
  el.classList.toggle("c",COL[id]!==0);
  items.forEach(function(n,i){if(i>=3)n.classList.add("xx")});
  if(id==="cl"){[].forEach.call(el.querySelectorAll(".ce.pst"),function(n){n.classList.add("xx")});
    [].forEach.call(el.querySelectorAll(".dh"),function(h){var n=h.nextElementSibling,all=true;while(n&&!n.classList.contains("dh")&&!n.classList.contains("nt")){if(!n.classList.contains("xx"))all=false;n=n.nextElementSibling}if(all)h.classList.add("xx")})}}
function colInit(){COLIDS.forEach(colFit);
  var rt=document.querySelector("#home .top .rt");
  if(rt&&!rt.querySelector(".xab")){var b=document.createElement("button");b.className="xab";b.title="Mở/đóng tất cả";b.setAttribute("aria-label","Mở/đóng tất cả");b.textContent="\u21D5";rt.insertBefore(b,rt.firstChild)}}
function colToggle(id,on){var el=document.getElementById(id);if(!el||!el.classList.contains("cd"))return;var c=on==null?!el.classList.contains("c"):on;el.classList.toggle("c",c);COL[id]=c?1:0;lset("wb_col",COL)}
document.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
  if(t.closest(".xab")){var cs=COLIDS.map(function(i){return document.getElementById(i)}).filter(function(c){return c&&c.classList.contains("cd")}),anyC=cs.some(function(c){return c.classList.contains("c")});cs.forEach(function(c){colToggle(c.id,!anyC)});return}
  var h=t.closest(".cd>.mh,.cd>.nh,.cd>.mh *,.cd>.nh *");if(!h||!t.closest("#home"))return;
  if(t.closest("a,button,input,form"))return;var card=t.closest(".cd");if(card)colToggle(card.id)});
