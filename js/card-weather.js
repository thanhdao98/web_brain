/* card-weather.js — Thời tiết 7 ngày (Open-Meteo, không cần khoá) và gợi ý theo thời tiết. */
/* thời tiết: Open-Meteo (không cần khoá). Vị trí chỉ lưu trên trình duyệt (wb_loc), làm tròn ~10 km, không ghi vào repo. */
var WEEKDAY_SHORT=["CN","T2","T3","T4","T5","T6","T7"];
var WEATHER_CLOUD_SVG='<path class="cl" d="M7 15h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 6.6 4.2 4.2 0 0 0 7 15z"/>';
function weatherKind(c){return c<=1?"sun":c<=3?"cloud":(c===45||c===48)?"fog":(c>=71&&c<=77)||c===85||c===86?"snow":c>=95?"storm":"rain"}
function weatherName(c){return{sun:"Nắng",cloud:"Mây",fog:"Sương mù",snow:"Tuyết",storm:"Dông",rain:"Mưa"}[weatherKind(c)]}
function weatherIconSvg(c){var k=weatherKind(c),b="";
  if(k==="sun")b='<circle cx="12" cy="12" r="4"/><path class="rays" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  else if(k==="cloud")b='<path class="cl" d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 9.6 4.2 4.2 0 0 0 7 18z"/>';
  else if(k==="fog")b='<path class="cl" d="M4 8h16M6 12h12M4 16h16"/>';
  else if(k==="snow")b=WEATHER_CLOUD_SVG+'<path class="dr dr1" d="M8 18h.01M16 18h.01M10 21h.01"/><path class="dr dr2" d="M12 19h.01M14 21h.01"/>';
  else if(k==="storm")b=WEATHER_CLOUD_SVG+'<path class="bolt" d="M12 15l-2 3h3l-2 3"/>';
  else b=WEATHER_CLOUD_SVG+'<path class="dr dr1" d="M8 18l-1 2"/><path class="dr dr2" d="M12 18l-1 2"/><path class="dr dr3" d="M16 18l-1 2"/>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+b+'</svg>'}
function askLocation(el,msg){
  el.innerHTML='<h2 class="lab mono">Thời tiết 7 ngày</h2><button class="more mono" id="wxb">Cho phép vị trí</button>'+(msg?'<div class="nt">'+msg+'</div>':'');
  document.getElementById("wxb").onclick=function(){
    if(!navigator.geolocation){askLocation(el,"Trình duyệt không hỗ trợ định vị.");return}
    navigator.geolocation.getCurrentPosition(function(p){writeStorage("wb_loc",{la:+p.coords.latitude.toFixed(1),lo:+p.coords.longitude.toFixed(1)});loadWeather()},function(){askLocation(el,"Không lấy được vị trí. Bấm thử lại.")},{timeout:10000,maximumAge:864e5})}
}
function loadWeather(){
  var el=document.getElementById("wx");if(!el)return;
  var loc=(DATA.loc&&DATA.loc.la!=null)?DATA.loc:readStorage("wb_loc",null);if(!loc){askLocation(el,"");return}
  var c=readStorage("wb_wx",null);
  if(c&&c.d&&c.d.hi&&c.la===loc.la&&c.lo===loc.lo&&Date.now()-c.t<108e5){drawWeather(c.d);return}
  fetch("https://api.open-meteo.com/v1/forecast?latitude="+loc.la+"&longitude="+loc.lo+"&daily=weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7")
    .then(function(r){if(!r.ok)throw 0;return r.json()})
    .then(function(j){var d={time:j.daily.time,c:j.daily.weather_code,p:j.daily.precipitation_probability_max,hi:j.daily.temperature_2m_max,lo:j.daily.temperature_2m_min};writeStorage("wb_wx",{t:Date.now(),la:loc.la,lo:loc.lo,d:d});drawWeather(d)})
    .catch(function(){if(c&&c.d)drawWeather(c.d);else{el.innerHTML='<h2 class="lab mono">Thời tiết 7 ngày</h2><div class="nt">Chưa lấy được dự báo.</div><button class="more mono" id="wxr">Thử lại</button>';document.getElementById("wxr").onclick=function(){loadWeather()}}});
}
/* nhiệt độ cao nhất / thấp nhất trong ngày, làm tròn độ C: "28°" trên, "19°" dưới (xám) */
function weatherTempHtml(d,i){
  var hi=d.hi&&d.hi[i],lo=d.lo&&d.lo[i];if(hi==null||lo==null)return"";
  return '<span class="t mono"><b>'+Math.round(hi)+'°</b><em>'+Math.round(lo)+'°</em></span>'}
function weatherAdvice(d){
  var L=[],wet=function(k){return k>=0&&k<d.time.length&&(d.p[k]||0)>=60},dn=function(k){return WEEKDAY_SHORT[new Date(d.time[k]+"T00:00:00").getDay()]};
  (DATA.deadlines||[]).filter(isVisible).forEach(function(x){var k=daysUntil(x);if(!wet(k)||k>6)return;
    if(/đá bóng/i.test(x.t))L.push(dn(k)+" đá bóng, mưa "+d.p[k]+"%: tính phương án B.");
    else if(x.scope==="family"&&!x.hide&&(x.out||/ngắm|lá đỏ|đi chơi|dã ngoại|picnic|công viên|đạp xe|đi dạo|biển/i.test(x.t)))L.push(escapeHtml(x.t)+" ("+dn(k)+"), mưa "+d.p[k]+"%: xem lại kế hoạch.")});
  var late=new Date().getHours()>=20;
  if((!late&&wet(0))||wet(1))L.push("Mưa "+((!late&&wet(0))?"hôm nay":"ngày mai")+": đổi đi bộ thành giãn cơ trong nhà.");
  if(!FAM&&DATA.workweek){var di=(new Date().getDay()+6)%7;
    for(var k=(new Date().getHours()>=18?1:0);k<=6-di&&k<d.time.length;k++){var w=DATA.workweek.filter(function(x){return x.d===dn(k)})[0];if(w&&/khách/i.test(w.w)&&wet(k))L.push(dn(k)+" đi khách hàng, mưa "+d.p[k]+"%: nhớ mang ô.")}}
  return L.slice(0,3);
}
function drawWeather(d){
  var el=document.getElementById("wx");if(!el||!d||!d.time)return;
  var g=d.time.map(function(t,i){var p=d.p[i]||0,cl=(i===0?"today":"")+(p>=60?" wet":"");
    return '<div class="'+cl.trim()+'" title="'+weatherName(d.c[i])+(p?' · mưa '+p+'%':'')+'" aria-label="'+weatherName(d.c[i])+(p?', mưa '+p+'%':'')+'">'+weatherIconSvg(d.c[i])+WEEKDAY_SHORT[new Date(t+"T00:00:00").getDay()]+weatherTempHtml(d,i)+'<span class="p mono">'+(p>=30?p+"%":"")+'</span></div>'}).join("");
  el.innerHTML='<h2 class="lab mono">Thời tiết 7 ngày</h2><div class="wxg">'+g+'</div>'+weatherAdvice(d).map(function(s){return'<div class="wxn">'+s+'</div>'}).join("");
}
