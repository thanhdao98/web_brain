/* api.js — Nói chuyện với Brain API (Apps Script): tải dữ liệu, ghi tick/ghi chú, đồng bộ nhẹ. */
/* trộn dữ liệu cuộc sống từ Brain API lên bản nền (real.json trên máy, hoặc demo.json trên bản công khai) */
function dataFingerprint(o){return JSON.stringify([o.deadlines,o.urgent,o.timeline,o.docs,o.workweek,o.goals,o.tasks,(o.learn||{}).week])}
function mergeApiData(b,j){var d=JSON.parse(JSON.stringify(b));
  ["deadlines","tasks","urgent","timeline","docs","workweek","goals","notes","pain"].forEach(function(k){if(j[k]!==undefined)d[k]=j[k]});
  d.learn=d.learn||{};if(j.learn&&j.learn.week)d.learn.week=j.learn.week;
  if(j.updated)d.updated=String(j.updated).replace(" ","T");
  var c=j.config||{};["profile","company","health","loc","music","workdl","digest"].forEach(function(k){if(c[k]!==undefined)d[k]=c[k]});
  if(c.i18n)d.i18n=c.i18n;if(c.learn_next!==undefined){d.learn=d.learn||{};d.learn.next=c.learn_next}
  delete d.week;delete d.work;   // biểu đồ tuần và mục 'work' là dữ liệu mẫu, không có trong Sheet
  if(j.role==="family"){delete d.health;delete d.company}
  if(j.avatar){d.profile=d.profile||{};d.profile.avatar=j.avatar}
  if(j.ticks)d.__ticks=j.ticks;
  if(j.ideas)d.__ideas=j.ideas;
  d.__sig=dataFingerprint(j);d.__ssig=j.sig||"";
  d.label="Dữ liệu thật";d.__role=j.role;d.__live=true;return d}
function loadData(){
  var base=null,key=getAccessKey();
  return fetchJson("data/real.json").then(function(r){base=r},function(){}).then(function(){return base?0:fetchJson("data/demo.json").then(function(r){base=r})})
    .then(function(){return fetchJson("data/config.json").catch(function(){return{}})})
    .then(function(cfg){
      baseData=base;var ba=base.brain_api||{};API_URL=ba.url||cfg.api||"";key=key||ba.key||"";API_KEY=key;
      if(!API_URL||!key)return base;
      return fetchJson(API_URL+"?k="+encodeURIComponent(key),12000).then(function(j){
        if(j.error){if(j.error==="no")clearAccessKey();throw 0}   // chỉ xoá mã khi máy chủ báo mã sai; lỗi mạng/lỗi tạm thì giữ mã
        if(keyIsRemembered())writeStorage("wb_api",{t:Date.now(),d:j});return mergeApiData(base,j)   // không tick "ghi nhớ" thì không lưu dữ liệu thật vào máy
      }).catch(function(){var c=readStorage("wb_api",null);return(c&&c.d&&getAccessKey())?mergeApiData(base,c.d):base})})}
function sendToApi(b,retry,cb){if(!(DATA&&DATA.__live&&API_KEY))return;b.k=API_KEY;if(!retry)setSyncStatus("save");
  fetch(API_URL,{method:"POST",body:JSON.stringify(b)}).then(function(r){return r.json()}).then(function(j){if(j&&j.error&&j.error!=="forbidden")throw 0;setSyncStatus("ok");if(cb)cb(j)})
    .catch(function(){if(!retry){setSyncStatus("err");setTimeout(function(){sendToApi(b,true,cb)},3000)}else setSyncStatus("err")})}
function saveTick(id){lastTickToggleAt=Date.now();if(DATA&&DATA.__live)sendToApi({action:"set_tick",id:id,done:!!st[id]})}
function todayIso(){var d=new Date(),p=function(n){return String(n).padStart(2,"0")};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function sameTickSet(s,arr){var a=Object.keys(s).filter(function(k){return s[k]}).sort().join(","),b=arr.slice().sort().join(",");return a===b}
function setSyncStatus(state){
  if(state){syncState=state;if(document.getElementById("nc"))drawNotes()} var el=document.getElementById("syn");if(!el)return;
  if(!(DATA&&DATA.__live)){el.innerHTML="Tick tự reset lúc 0:00";return}
  var rs=document.body.classList.contains("fam0")?"":' · <span>Tick tự reset lúc 0:00</span>';
  var t=new Date(),hm=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");
  var s={ok:'<i class="sd ok"></i><span>Đã đồng bộ '+hm+'</span>'+rs+'<button id="synb" title="Đồng bộ ngay" aria-label="Đồng bộ ngay">↻</button>',
         sy:'<i class="sd sy"></i><span>Đang đồng bộ…</span>',save:'<i class="sd sy"></i><span>Đang lưu…</span>',
         err:'<i class="sd er"></i><span>Chưa lưu được</span> · <span>sẽ thử lại</span><button id="synb" title="Thử lại" aria-label="Thử lại">↻</button>'}[syncState||"ok"];
  el.innerHTML=s}
function pullLightSync(force){
  if(!(DATA&&DATA.__live&&API_KEY))return;
  var n=Date.now();if(!force&&n-lastPullAt<12000)return;lastPullAt=n;setSyncStatus("sy");
  return fetchJson(API_URL+"?k="+encodeURIComponent(API_KEY)+"&a=sync",9000).then(function(j){
    if(!j||!j.ticks){setSyncStatus("ok");return}
    if(j.sig&&serverSignature&&j.sig!==serverSignature)fetchFullData();
    var late=Date.now()-lastTickToggleAt>=8000;
    if(late){resetTicksOnNewDay();if(!sameTickSet(st,j.ticks)){var old=Object.keys(st).filter(function(k){return st[k]}),ns={};j.ticks.forEach(function(id){ns[id]=true});
      flashIds=j.ticks.filter(function(id){return old.indexOf(id)<0}).concat(old.filter(function(id){return !ns[id]}));
      st=ns;writeStorage("wb_st",st);drawTaskList();renderOtherTabs();setTimeout(function(){flashIds=[]},1700)}}
    if(j.notes&&Date.now()-lastNoteEditAt>=8000&&!noteList.some(function(x){return /^tmp/.test(String(x.id))})){var nn=j.notes.map(function(x){return{id:x.id,time:x.time,by:x.by,text:x.text,status:x.status}});if(JSON.stringify(nn)!==JSON.stringify(noteList)){noteList=nn;drawNotes()}}
    if(DATA.__role==="owner"&&j.ideas&&Date.now()-lastIdeaEditAt>=8000&&!ideaList.some(function(x){return /^tmp/.test(String(x.id))})){
      var nq=j.ideas.map(function(x){return{id:x.id,t:x.text}});if(JSON.stringify(nq)!==JSON.stringify(ideaList)){ideaList=nq;writeStorage("wb_qn",ideaList);drawIdeaList()}}
    if(j.pain&&j.pain.length){var pm=readStorage("wb_pain",{}),ch=false;j.pain.forEach(function(x){var kk=String(x.date).replace(/-0(\d)/g,"-$1");if(x.p!==""&&x.p!=null&&pm[kk]!==+x.p){pm[kk]=+x.p;ch=true}});if(ch){writeStorage("wb_pain",pm);renderOtherTabs();tickSitReminder()}}
    setSyncStatus("ok")}).catch(function(){setSyncStatus("err")})}
