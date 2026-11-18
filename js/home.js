/* home.js — Tab Hôm nay: dựng giao diện, nhạc nền, reset tick lúc 0:00, danh sách ý tưởng. */
function renderHome(){
  var hd=head(today()),pf="",pst="",pmo="",pwx="",pid="",pd="",pnc="",p2="",p2b="",p3="";
  var pr=DATA.profile;
  if(pr){pf+='<div class="prof">'+(pr.avatar?'<div class="ban" style="background-image:url('+esc(pr.avatar)+')"></div>':'<div class="ban ph mono">WB</div>')+'<div class="tg">'+esc(pr.tagline||"")+'</div><div class="tags mono">'+(pr.tags||[]).map(esc).join(" · ")+'</div></div>'}
  var u=(DATA.urgent||[]),ug="",ut=FAM?"Nhà mình cần gấp":"Cháy rồi";
  ug=u.length?'<div class="urg"><div class="n mono">'+u.length+'</div><div><span class="lab mono">'+ut+'</span><ul>'+u.map(function(x){return'<li>'+esc(x.t||x)+(x.when?'<span class="w mono">'+esc(x.when)+'</span>':'')+'</li>'}).join("")+'</ul></div></div>'
    :'<div class="urg"><div class="n mono" style="color:var(--mute)">0</div><div><span class="lab mono">'+ut+'</span><ul><li>'+(FAM?"Nhà mình yên ổn.":"Yên bình. Đáng ngờ.")+'</li></ul></div></div>';
  if(!FAM&&DATA.updated){var ag=Math.floor((new Date()-new Date(DATA.updated))/864e5);if(ag>=2)pst+='<div class="stale"><h2 class="lab mono">Cần cập nhật</h2><div class="mr"><span>'+ag+' ngày rồi chưa kể tao nghe lịch. Tao sắp quên mày.</span></div></div>'}
  var tl=(DATA.timeline||[]).filter(vis).slice(0,2);
  if(tl.length)pmo+='<div class="wide mo" id="moc"><h2 class="lab mono">Mốc sắp tới</h2>'+tl.map(function(x){return'<div class="mr"><span>'+esc(x.what)+'</span><b class="mono">'+esc(x.when)+'</b></div>'}).join("")+'</div>';
  pwx+='<div class="wx" id="wx"></div>';
  pnc=DATA.__live?'<div class="nc" id="nc"></div>':"";p2+='<div class="next"><span class="lab mono">Làm gì giờ?</span><div class="t" id="nx"></div><div class="s mono" id="ns"></div>'+dayStrip()+'</div>'+(FAM?"":sitHtml());
  p2b+=segHtml()+arHtml()+'<div id="tasks"></div><div class="nt" id="syn">Tick tự reset lúc 0:00</div>';
  if(!FAM)pid+='<div class="wide" id="ideas"><h2 class="lab mono">Thả ý tưởng</h2><form id="qf"><input id="qn" class="qn mono" placeholder="Gõ ý tưởng, Enter là xong" autocomplete="off" enterkeyhint="send"><button type="submit" class="nsub" aria-label="Thêm" title="Thêm">+</button></form><div id="qnl"></div></div>';
  if(!FAM&&DATA.week)p3+='<h2 class="lab mono">Tuần</h2><div class="week" id="week"></div>';
  var dl=(DATA.deadlines||[]).filter(vis).filter(function(x){return !x.hide}).map(function(x){return{t:x.t,n:days(x),a:x.a}}).filter(function(x){return x.n>=0}).sort(function(a,b){return a.n-b.n});
  if(dl.length){var gh=function(n){return n<=1?"Hôm nay · ngày mai":(n<=7?"Tuần này":"Sau đó")},lg="",k=0,hh="";
    dl.forEach(function(x){var g=gh(x.n),xc=k>=4?" x":"";if(g!==lg){hh+='<h2 class="lab mono dg'+xc+'">'+g+'</h2>';lg=g}hh+='<div class="dl'+(x.n<=1?' hot':(x.n<=7?' wk':' far'))+xc+'"><span>'+dotH(x.a)+esc(x.t)+'</span><b class="mono">'+(x.n===0?"hôm nay":(x.n===1?"ngày mai":x.n+" ngày"))+'</b></div>';k++});
    pd+='<div id="dlc"><h2 class="lab mono">Sắp tới hạn</h2><div class="dlw" id="dlw">'+hh+(dl.length>4?'<button class="more mono" id="more" data-n="'+(dl.length-4)+'">Xem thêm +'+(dl.length-4)+'</button>':'')+'</div></div>'}
  document.getElementById("home").innerHTML=hd+'<div class="g"><div class="c1">'+pst+pf+pwx+pmo+pnc+pid+'</div><div class="c2">'+ug+p2+p2b+'</div><div class="c3"><div id="slot"></div>'+pd+(FAM||!calSrc()?"":'<div class="ml cl" id="cl"></div><div class="ml" id="ml"></div>')+p3+'</div></div>';
  colInit();
  var tb=document.querySelector("#home .top b");if(tb&&!FAM){tb.textContent+=" · AI "+used+"%";tb.style.cursor="pointer";tb.onclick=function(){go("ai")}}
  var mo=document.getElementById("more");if(mo)mo.onclick=function(){var w=document.getElementById("dlw");w.classList.toggle("open");this.textContent=w.classList.contains("open")?"Thu gọn":"Xem thêm +"+this.dataset.n};
  if(DATA.music&&DATA.music.url){var mm=/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(DATA.music.url);if(mm){var tp=document.querySelector("#home .top"),mb=document.createElement("button");mb.id="mu";mb.className="mono";mb.textContent="\u266a";tp.insertBefore(mb,tp.lastElementChild);var bx=document.createElement("div");bx.id="mubox";tp.parentNode.insertBefore(bx,tp.nextSibling);var ifr=function(){return '<iframe src="https://www.youtube.com/embed/'+mm[1]+'?autoplay=1&loop=1&playlist='+mm[1]+'&playsinline=1&start='+(DATA.music.start||0)+'" allow="autoplay; encrypted-media" allowfullscreen></iframe>'};
function mOn(){bx.innerHTML=ifr();mb.classList.add("on");lset("wb_mu","on")}
function mOff(){bx.innerHTML="";mb.classList.remove("on");lset("wb_mu","off")}
mb.onclick=function(){if(bx.firstChild)mOff();else mOn()};
window.mPlay=mOn;
}}
  if(!FAM&&DATA.week){var D=["T2","T3","T4","T5","T6","T7","CN"],w="",di=(new Date().getDay()+6)%7;
    D.forEach(function(d,i){var v=DATA.week[i]||0;w+='<div class="'+(i===di?'today':'')+'"><i style="height:'+Math.max(v*.5,3)+'px;opacity:'+(v?1:.15)+'"></i>'+d+'</div>'});
    document.getElementById("week").innerHTML=w}
  var qn=document.getElementById("qn");
  if(qn){QS=(ls("wb_qn",[])||[]).map(function(x){return typeof x==="string"?{id:null,t:x}:x});qr();
    document.getElementById("qf").onsubmit=function(e){e.preventDefault();if(qn.value.trim()){var o={id:null,t:qn.value.trim()};
      if(DATA.__live&&DATA.__role==="owner"){o.id="tmp"+Date.now();LASTIDEA=Date.now();apiPost({action:"add_idea",noi_dung:o.t},false,function(j){if(j&&j.id){o.id=j.id;lset("wb_qn",QS);if(o.del)apiPost({action:"delete_idea",id:j.id})}})}
      QS.unshift(o);lset("wb_qn",QS);qn.value="";qr()}};
    document.getElementById("qnl").onclick=function(e){var b=e.target.closest(".qx");if(!b)return;var o=QS.splice(+b.dataset.i,1)[0];lset("wb_qn",QS);qr();
      if(o&&DATA.__live&&DATA.__role==="owner"){LASTIDEA=Date.now();if(/^tmp/.test(String(o.id)))o.del=true;else if(o.id)apiPost({action:"delete_idea",id:o.id})}}}
  var nc=document.getElementById("nc");
  if(nc){NOTES=(DATA.notes||[]).map(function(x){return{id:x.id,time:x.time,by:x.by,text:x.text,status:x.status}});ncDraw();
    nc.addEventListener("submit",function(e){e.preventDefault();var i=document.getElementById("nin");if(i&&i.value.trim())noteAdd(i.value.trim())});
    nc.onclick=function(e){var r=e.target.closest(".row");if(!r)return;var id=r.dataset.nid;if(e.target.closest(".qx"))noteDel(id);else if(e.target.closest(".c"))noteTog(id)}}
  var seg=document.getElementById("seg");
  seg.onclick=function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call(seg.children,function(x){x.classList.remove("on")});b.classList.add("on");f=b.dataset.c;draw()};
  var sga=document.getElementById("segA");
  sga.onclick=function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call(sga.children,function(x){x.classList.remove("on")});b.classList.add("on");fa=b.dataset.a;draw()};
  document.getElementById("tasks").onclick=function(e){var r=e.target.closest(".row");if(!r)return;dayRoll();st[r.dataset.id]=!st[r.dataset.id];lset("wb_st",st);tickSync(r.dataset.id);draw()};
  wxInit();mailInit();calInit();
  var sitEl=document.getElementById("sit");
  if(sitEl){sitEl.onclick=function(e){if(e.target.closest("#sb")){lset("wb_sit",Date.now());sitTick()}else if(e.target.id==="sp")go("learn")};sitTick();if(!window.__sit){window.__sit=1;setInterval(sitTick,30000)}}
  var ar=document.getElementById("aiRow");if(ar)ar.onclick=function(){go("ai")};
}
function dayRoll(){if(ls("wb_std","")!==dayKey()){st={};lset("wb_st",st);lset("wb_std",dayKey())}}
function midnight(){var n=new Date(),ms=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,2)-n;setTimeout(function(){dayRoll();draw();renderOthers();midnight()},ms)}
function qr(){var el=document.getElementById("qnl");if(!el)return;el.innerHTML=QS.map(function(o,i){return'<div class="mr"><span>'+esc(o.t)+'</span><button class="qx" data-i="'+i+'">×</button></div>'}).join("")}
