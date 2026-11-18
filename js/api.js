/* api.js — Nói chuyện với Brain API (Apps Script): tải dữ liệu, ghi tick/ghi chú, đồng bộ nhẹ. */
/* trộn dữ liệu cuộc sống từ Brain API lên bản nền (real.json trên máy, hoặc demo.json trên bản công khai) */
function dataSig(o){return JSON.stringify([o.deadlines,o.urgent,o.timeline,o.docs,o.workweek,o.goals,o.tasks,(o.learn||{}).week])}
function mergeApi(b,j){var d=JSON.parse(JSON.stringify(b));
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
  d.__sig=dataSig(j);d.__ssig=j.sig||"";
  d.label="Dữ liệu thật";d.__role=j.role;d.__live=true;return d}
function load(){
  var base=null,key=ls("wb_key","");
  return getJ("data/real.json").then(function(r){base=r},function(){}).then(function(){return base?0:getJ("data/demo.json").then(function(r){base=r})})
    .then(function(){return getJ("data/config.json").catch(function(){return{}})})
    .then(function(cfg){
      BASE=base;var ba=base.brain_api||{};APIURL=ba.url||cfg.api||"";key=key||ba.key||"";APIKEY=key;
      if(!APIURL||!key)return base;
      return getJ(APIURL+"?k="+encodeURIComponent(key),12000).then(function(j){
        if(j.error){if(ls("wb_key","")){lset("wb_key","");lset("wb_api",null)}throw 0}
        lset("wb_api",{t:Date.now(),d:j});return mergeApi(base,j)
      }).catch(function(){var c=ls("wb_api",null);return(c&&c.d&&ls("wb_key",""))?mergeApi(base,c.d):base})})}
function apiPost(b,retry,cb){if(!(DATA&&DATA.__live&&APIKEY))return;b.k=APIKEY;if(!retry)synSet("save");
  fetch(APIURL,{method:"POST",body:JSON.stringify(b)}).then(function(r){return r.json()}).then(function(j){if(j&&j.error&&j.error!=="forbidden")throw 0;synSet("ok");if(cb)cb(j)})
    .catch(function(){if(!retry){synSet("err");setTimeout(function(){apiPost(b,true,cb)},3000)}else synSet("err")})}
function tickSync(id){LASTTOG=Date.now();if(DATA&&DATA.__live)apiPost({action:"set_tick",id:id,done:!!st[id]})}
function padDay(){var d=new Date(),p=function(n){return String(n).padStart(2,"0")};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function sameTicks(s,arr){var a=Object.keys(s).filter(function(k){return s[k]}).sort().join(","),b=arr.slice().sort().join(",");return a===b}
function synSet(state){
  if(state){SYN=state;if(document.getElementById("nc"))ncDraw()} var el=document.getElementById("syn");if(!el)return;
  if(!(DATA&&DATA.__live)){el.innerHTML="Tick tự reset lúc 0:00";return}
  var rs=document.body.classList.contains("fam0")?"":' · <span>Tick tự reset lúc 0:00</span>';
  var t=new Date(),hm=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");
  var s={ok:'<i class="sd ok"></i><span>Đã đồng bộ '+hm+'</span>'+rs+'<button id="synb" title="Đồng bộ ngay" aria-label="Đồng bộ ngay">↻</button>',
         sy:'<i class="sd sy"></i><span>Đang đồng bộ…</span>',save:'<i class="sd sy"></i><span>Đang lưu…</span>',
         err:'<i class="sd er"></i><span>Chưa lưu được</span> · <span>sẽ thử lại</span><button id="synb" title="Thử lại" aria-label="Thử lại">↻</button>'}[SYN||"ok"];
  el.innerHTML=s}
function syncPull(force){
  if(!(DATA&&DATA.__live&&APIKEY))return;
  var n=Date.now();if(!force&&n-TPULL<12000)return;TPULL=n;synSet("sy");
  return getJ(APIURL+"?k="+encodeURIComponent(APIKEY)+"&a=sync",9000).then(function(j){
    if(!j||!j.ticks){synSet("ok");return}
    if(j.sig&&SSIG&&j.sig!==SSIG)fetchFull();
    var late=Date.now()-LASTTOG>=8000;
    if(late){dayRoll();if(!sameTicks(st,j.ticks)){var old=Object.keys(st).filter(function(k){return st[k]}),ns={};j.ticks.forEach(function(id){ns[id]=true});
      FLASH=j.ticks.filter(function(id){return old.indexOf(id)<0}).concat(old.filter(function(id){return !ns[id]}));
      st=ns;lset("wb_st",st);draw();renderOthers();setTimeout(function(){FLASH=[]},1700)}}
    if(j.notes&&Date.now()-LASTNOTE>=8000&&!NOTES.some(function(x){return /^tmp/.test(String(x.id))})){var nn=j.notes.map(function(x){return{id:x.id,time:x.time,by:x.by,text:x.text,status:x.status}});if(JSON.stringify(nn)!==JSON.stringify(NOTES)){NOTES=nn;ncDraw()}}
    if(DATA.__role==="owner"&&j.ideas&&Date.now()-LASTIDEA>=8000&&!QS.some(function(x){return /^tmp/.test(String(x.id))})){
      var nq=j.ideas.map(function(x){return{id:x.id,t:x.text}});if(JSON.stringify(nq)!==JSON.stringify(QS)){QS=nq;lset("wb_qn",QS);qr()}}
    if(j.pain&&j.pain.length){var pm=ls("wb_pain",{}),ch=false;j.pain.forEach(function(x){var kk=String(x.date).replace(/-0(\d)/g,"-$1");if(x.p!==""&&x.p!=null&&pm[kk]!==+x.p){pm[kk]=+x.p;ch=true}});if(ch){lset("wb_pain",pm);renderOthers();sitTick()}}
    synSet("ok")}).catch(function(){synSet("err")})}
