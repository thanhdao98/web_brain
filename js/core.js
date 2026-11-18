/* core.js — Hằng số, biến chung, hàm tiện ích (đọc/ghi bộ nhớ trình duyệt, tải JSON). */
var FAM=/[?&]v=nha/.test(location.search);
var DATA=null,st={},used=40,f="all",fa="all",hot={},TABS=[];
/* lĩnh vực: khoá → [tên hiển thị, màu hue]. Đổi tên chỉ cần sửa ở đây. */
var AR={work:["Việc chính",210],biz:["Tay trái",30],home:["Tổ ấm",140],learn:["Học",270],fit:["Khoẻ",175]};
/* nhóm = tab = điểm trên quả cầu; AR vẫn là màu chi tiết từng lĩnh vực */
var GR={earn:["Kiếm cơm",["work","biz"]],home:["Tổ ấm",["home"]],grow:["Rèn",["learn","fit"]]};
function inG(g,a){return g==="all"||(GR[g]&&GR[g][1].indexOf(a)>=0)}
function dotH(a){return AR[a]?'<i class="dot" style="background:hsl('+AR[a][1]+',70%,55%)"></i>':""}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ls(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function vis(x){return !FAM||x.scope==="family"}
var BASE=null,SSIG="",AUTO=(function(){try{return localStorage.getItem("wb_auto")!=="off"}catch(e){return true}})(),PAUSED=false,LASTACT=Date.now(),FULLING=false,APIURL="",APIKEY="",LASTTOG=0,LASTIDEA=0,TPULL=0,DCHK=0,SIG="",FLASH=[],SYN="",QS=[];
function getJ(u,ms){var c=new AbortController(),t=setTimeout(function(){c.abort()},ms||9000);
  return fetch(u,{cache:"no-store",signal:c.signal}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.json()},function(e){clearTimeout(t);throw e})}
