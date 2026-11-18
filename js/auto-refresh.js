/* auto-refresh.js — Tự động cập nhật 30 giây, nút Cập nhật ngay, tạm dừng khi không thao tác. */
/* tự động cập nhật: bật/tắt bằng nút ở đầu trang; 30 giây/lần, tạm dừng sau 10 phút không thao tác */
function auHtml(){var c=AUTO?(PAUSED?" on pz":" on"):"";return '<button class="rfb" title="Cập nhật ngay" aria-label="Cập nhật ngay">↻</button><button class="aub'+c+'" title="'+(PAUSED&&AUTO?"Tạm dừng vì không thao tác. Chạm để tiếp tục.":"Tự động cập nhật 30 giây")+'" aria-pressed="'+AUTO+'"><i class="sd"></i>Tự động</button>'}
function auPaint(){[].forEach.call(document.querySelectorAll(".aub"),function(b){b.classList.toggle("on",AUTO);b.classList.toggle("pz",AUTO&&PAUSED);b.setAttribute("aria-pressed",AUTO);b.title=trText(AUTO&&PAUSED?"Tạm dừng vì không thao tác. Chạm để tiếp tục.":"Tự động cập nhật 30 giây")})}
function auSet(on){AUTO=on;PAUSED=false;LASTACT=Date.now();try{localStorage.setItem("wb_auto",on?"on":"off")}catch(e){}auPaint();if(on)syncAll(false)}
function rfSpin(on){[].forEach.call(document.querySelectorAll(".rfb"),function(b){b.classList.toggle("spin",on)})}
function softRender(){if(!BASE||!DATA)return;var y=window.scrollY;renderHome();draw();renderOthers();aiDraw();window.scrollTo(0,y);synSet()}
function fetchFull(manual){
  if(!(DATA&&DATA.__live&&APIKEY)||FULLING)return Promise.resolve();FULLING=true;
  return getJ(APIURL+"?k="+encodeURIComponent(APIKEY),12000).then(function(j){
    if(!j||j.error)return;lset("wb_api",{t:Date.now(),d:j});
    if(SSIG&&j.sig===SSIG&&!manual)return;
    if(j.sig===SSIG)return;
    var nd=mergeApi(BASE,j);if(nd.i18n)Object.keys(nd.i18n).forEach(function(k){TR[k]=nd.i18n[k]});
    nd.__live=true;DATA=nd;SIG=nd.__sig;SSIG=nd.__ssig;hot.home=!FAM&&(nd.urgent||[]).length>0;softRender()
  }).catch(function(){}).then(function(){FULLING=false})}
function syncAll(manual){
  if(!(DATA&&DATA.__live&&APIKEY))return;
  var ps=[];
  if(manual){rfSpin(true);lset("wb_wx",null);try{wxInit()}catch(e){}ps.push(mailInit(true,true),calInit(true,true))}else{mailInit(false,true);calInit(false,true)}
  ps.push(syncPull(true),fetchFull(manual));
  if(manual)Promise.all(ps.map(function(p){return Promise.resolve(p).catch(function(){})})).then(function(){setTimeout(function(){rfSpin(false)},400)})}
function auTick(){
  if(!AUTO||document.hidden)return;
  if(!PAUSED&&Date.now()-LASTACT>6e5){PAUSED=true;auPaint();return}
  if(PAUSED)return;syncPull(true)}
function auWake(){LASTACT=Date.now();if(PAUSED){PAUSED=false;auPaint();if(AUTO)syncAll(false)}}
var RESUMED=false;
function startSync(){
  document.addEventListener("visibilitychange",function(){if(!document.hidden){auWake();if(AUTO)syncAll(false)}});
  window.addEventListener("pointerdown",function(e){RESUMED=!!(PAUSED&&e.target.closest&&e.target.closest(".aub"))},true);
  ["pointerdown","keydown","touchstart","scroll"].forEach(function(ev){window.addEventListener(ev,auWake,{passive:true})});
  document.addEventListener("click",function(e){var t=e.target.closest?e.target:null;if(!t)return;
    if(t.closest("#synb")||t.closest(".rfb"))syncAll(true);else if(t.closest(".aub")){if(RESUMED){RESUMED=false;return}auSet(!AUTO)}});
  setInterval(auTick,30000);
  setInterval(function(){if(AUTO&&!PAUSED&&!document.hidden){calInit(true,true);mailInit(true,true)}},300000)}
