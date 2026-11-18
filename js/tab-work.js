/* tab-work.js — Tab Kiếm cơm: hạn công ty, đếm ngược. */
function fd(n){return n===0?"hôm nay":(n===1?"ngày mai":n+" ngày")}
function eomN(){var d=new Date(),a=new Date(d.getFullYear(),d.getMonth(),d.getDate()),t=new Date(d.getFullYear(),d.getMonth(),29);if(d.getDate()>29)t=new Date(d.getFullYear(),d.getMonth()+1,29);return Math.round((t-a)/864e5)}
function dlRow(x){var n=x.n;return'<div class="dl'+(n<=1?' hot':(n<=7?' wk':' far'))+'"><span>'+dotH(x.a)+esc(x.t)+'</span><b class="mono">'+fd(n)+'</b></div>'}
function renderCompany(){
  var c=DATA.company,el=document.getElementById("co");if(!el)return;
  if(FAM||!c){el.innerHTML="";return}
  el.innerHTML='<div class="co"><div class="sl">'+esc(c.slogan||"")+'</div><div class="cg"><div><h2 class="lab mono">Nhân viên</h2>'+(c.staff||[]).map(function(s){return'<div class="stf"><b>'+esc(s.r)+'</b><span>'+esc(s.m)+'</span></div>'}).join("")+'</div><div><h2 class="lab mono">Nội quy</h2><div class="rul">'+(c.rules||[]).map(function(r){return'<div>'+esc(r)+'</div>'}).join("")+'</div></div></div></div>';
}
