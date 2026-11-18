/* card-calendar.js — Thẻ Lịch Google Calendar; calSrc dùng chung nguồn với Gmail. */
function calSrc(){var s=DATA&&((DATA.digest&&DATA.digest.url)?DATA.digest:(DATA.mail&&DATA.mail.url?DATA.mail:null));return(s&&s.key)?s:null}
function calHead(n){return'<div class="mh"><svg class="mic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg><span class="lab mono">Lịch</span><b class="mono">'+(n==null?"":n)+'</b><a class="go mono" href="https://calendar.google.com/calendar/u/0/r" target="_blank" rel="noopener">Mở Calendar ↗</a><button class="mrf" id="clr" title="Làm mới" aria-label="Làm mới">↻</button></div>'}
function calDraw(d,stale){
  var el=document.getElementById("cl");if(!el||!d)return;
  var ev=(d.events||[]).filter(function(x){return !/^\W*XONG\b/i.test(x.t||"")}),td=padDay(),nowT=td+"T"+String(new Date().getHours()).padStart(2,"0")+":"+String(new Date().getMinutes()).padStart(2,"0"),by={};
  ev.forEach(function(x){var k=x.s.slice(0,10);if(x.all&&k<td&&x.e.slice(0,10)>td)k=td;(by[k]=by[k]||[]).push(x)});
  var days=Object.keys(by).filter(function(k){return k>=td}).sort(),tm=new Date();tm.setDate(tm.getDate()+1);
  var tmw=tm.getFullYear()+"-"+String(tm.getMonth()+1).padStart(2,"0")+"-"+String(tm.getDate()).padStart(2,"0");
  var more=0,rows=0,html="",nToday=(by[td]||[]).length;
  days.forEach(function(k){
    var list=by[k];if(k!==td&&rows>=6){more+=list.length;return}
    var lab=k===td?"Hôm nay":(k===tmw?"Ngày mai":WXD[new Date(k+"T00:00:00").getDay()]+" · "+(+k.slice(8))+"."+(+k.slice(5,7)));
    html+='<div class="dh mono">'+lab+'</div>'+list.map(function(x){if(k!==td)rows++;
      var past=k===td&&!x.all&&x.e.slice(0,16)<nowT,cur=k===td&&!x.all&&x.s.slice(0,16)<=nowT&&x.e.slice(0,16)>nowT;
      return'<div class="ce'+(past?' pst':'')+(cur?' now':'')+'"><span class="ct mono">'+(x.all?"Cả ngày":x.s.slice(11,16))+'</span><div><span class="cn">'+esc(x.t)+'</span>'+(x.loc?'<span class="cd mono">'+esc(x.loc)+'</span>':'')+'</div></div>'}).join("")});
  var np=ev.filter(function(x){return x.s.slice(0,10)===td&&!x.all&&x.e.slice(0,16)<nowT}).length;
  el.innerHTML=calHead(nToday)+(np?'<button class="mht mono" id="clp">Đã qua hôm nay ('+np+') '+(el.classList.contains("sp")?'▴':'▾')+'</button>':'')+(nToday?"":'<div class="nt">Hôm nay không có lịch.</div>')+html+(more?'<div class="nt">+'+more+' sự kiện nữa</div>':"")+(stale?'<div class="nt">(dữ liệu cũ)</div>':"");
  colFit("cl")}
function calInit(fresh,silent){
  var el=document.getElementById("cl"),s=calSrc();if(!el||!s)return;
  if(!el.onclick)el.onclick=function(e){if(e.target.closest("#clp")){el.classList.toggle("sp");calDraw(ls("wb_cal",{}).d);return}if(e.target.closest("#clr")){try{localStorage.removeItem("wb_cal")}catch(x){}calInit(true)}};
  var c=ls("wb_cal",null);if(!fresh&&c&&Date.now()-c.t<3e5){calDraw(c.d);return}
  if(!silent||!c)el.innerHTML=calHead(null)+'<div class="nt">Đang tải…</div>';
  return getJ(s.url+(s.url.indexOf("?")<0?"?":"&")+"k="+encodeURIComponent(s.key)+"&a=cal"+(fresh?"&fresh=1":""),12000)
    .then(function(j){if(j.error||!j.events)throw 0;lset("wb_cal",{t:Date.now(),d:j});calDraw(j)})
    .catch(function(){if(c&&c.d)calDraw(c.d,true);else el.innerHTML=calHead(null)+'<div class="nt">Chưa lấy được lịch.</div>'})}
