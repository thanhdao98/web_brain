/* auto-refresh.js — Tự động cập nhật 30 giây, nút Cập nhật ngay, tạm dừng khi không thao tác. */
/* tự động cập nhật: bật/tắt bằng nút ở đầu trang; 30 giây/lần, tạm dừng sau 10 phút không thao tác */
function refreshControlsHtml(){var c=autoRefreshOn?(autoRefreshPaused?" on pz":" on"):"";return '<button class="rfb" title="Cập nhật ngay" aria-label="Cập nhật ngay">↻</button><button class="aub'+c+'" title="'+(autoRefreshPaused&&autoRefreshOn?"Tạm dừng vì không thao tác. Chạm để tiếp tục.":"Tự động cập nhật 30 giây")+'" aria-pressed="'+autoRefreshOn+'"><i class="sd"></i>Tự động</button>'}
function paintAutoButton(){[].forEach.call(document.querySelectorAll(".aub"),function(b){b.classList.toggle("on",autoRefreshOn);b.classList.toggle("pz",autoRefreshOn&&autoRefreshPaused);b.setAttribute("aria-pressed",autoRefreshOn);b.title=translateText(autoRefreshOn&&autoRefreshPaused?"Tạm dừng vì không thao tác. Chạm để tiếp tục.":"Tự động cập nhật 30 giây")})}
function setAutoRefresh(on){autoRefreshOn=on;autoRefreshPaused=false;lastActivityAt=Date.now();try{localStorage.setItem("wb_auto",on?"on":"off")}catch(e){}paintAutoButton();if(on)refreshAll(false)}
function spinRefreshButton(on){[].forEach.call(document.querySelectorAll(".rfb"),function(b){b.classList.toggle("spin",on)})}
function softRenderToday(){if(!baseData||!DATA)return;var y=window.scrollY;renderTodayTab();drawTaskList();renderOtherTabs();drawAiUsage();window.scrollTo(0,y);setSyncStatus()}
function fetchFullData(manual){
  if(!(DATA&&DATA.__live&&API_KEY)||fullFetching)return Promise.resolve();fullFetching=true;
  return fetchJson(API_URL+"?k="+encodeURIComponent(API_KEY),12000).then(function(j){
    if(!j||j.error)return;writeStorage("wb_api",{t:Date.now(),d:j});
    if(serverSignature&&j.sig===serverSignature&&!manual)return;
    if(j.sig===serverSignature)return;
    var nd=mergeApiData(baseData,j);if(nd.i18n)Object.keys(nd.i18n).forEach(function(k){TR[k]=nd.i18n[k]});
    nd.__live=true;DATA=nd;dataSignature=nd.__sig;serverSignature=nd.__ssig;hot.home=!FAM&&(nd.urgent||[]).length>0;softRenderToday()
  }).catch(function(){}).then(function(){fullFetching=false})}
function refreshAll(manual){
  if(!(DATA&&DATA.__live&&API_KEY))return;
  var ps=[];
  if(manual){spinRefreshButton(true);writeStorage("wb_wx",null);try{loadWeather()}catch(e){}ps.push(loadMail(true,true),loadCalendar(true,true))}else{loadMail(false,true);loadCalendar(false,true)}
  ps.push(pullLightSync(true),fetchFullData(manual));
  if(manual)Promise.all(ps.map(function(p){return Promise.resolve(p).catch(function(){})})).then(function(){setTimeout(function(){spinRefreshButton(false)},400)})}
function autoRefreshTick(){
  if(!autoRefreshOn||document.hidden)return;
  if(!autoRefreshPaused&&Date.now()-lastActivityAt>6e5){autoRefreshPaused=true;paintAutoButton();return}
  if(autoRefreshPaused)return;pullLightSync(true)}
function wakeAutoRefresh(){lastActivityAt=Date.now();if(autoRefreshPaused){autoRefreshPaused=false;paintAutoButton();if(autoRefreshOn)refreshAll(false)}}
var resumedByTap=false;
function startAutoRefresh(){
  document.addEventListener("visibilitychange",function(){if(!document.hidden){wakeAutoRefresh();if(autoRefreshOn)refreshAll(false)}});
  window.addEventListener("pointerdown",function(e){resumedByTap=!!(autoRefreshPaused&&e.target.closest&&e.target.closest(".aub"))},true);
  ["pointerdown","keydown","touchstart","scroll"].forEach(function(ev){window.addEventListener(ev,wakeAutoRefresh,{passive:true})});
  document.addEventListener("click",function(e){var t=e.target.closest?e.target:null;if(!t)return;
    if(t.closest("#synb")||t.closest(".rfb"))refreshAll(true);else if(t.closest(".aub")){if(resumedByTap){resumedByTap=false;return}setAutoRefresh(!autoRefreshOn)}});
  setInterval(autoRefreshTick,30000);
  setInterval(function(){if(autoRefreshOn&&!autoRefreshPaused&&!document.hidden){loadCalendar(true,true);loadMail(true,true)}},300000)}
