/* tabs.js — Các tab Kiếm cơm, Tổ ấm, Rèn (dựng giao diện). */
function renderOtherTabs(){
  var di=(new Date().getDay()+6)%7;
  /* Việc */
  var wk=(DATA.workweek||[]).map(function(x,i){return'<div class="wkr'+(i===di?' today':'')+'"><b class="mono">'+escapeHtml(x.d)+'</b><span>'+escapeHtml(x.w)+'</span><em class="mono">'+escapeHtml(x.n||"")+'</em></div>'}).join("");
  var byA=function(a){return (DATA.deadlines||[]).filter(function(x){return x.a===a&&!x.hide&&isVisible(x)}).map(function(x){return{t:x.t,n:daysUntil(x),a:a}}).filter(function(x){return x.n>=0})};
  var wl=(DATA.workdl||[]).map(function(x){return{t:x.t,n:daysUntil(x),a:"work"}}).concat(byA("work")).sort(function(a,b){return a.n-b.n});
  var wd=wl.map(deadlineRowHtml).join("")||'<div class="mr"><span>Chưa khai deadline nào. Đáng ngờ.</span></div>';
  var tk=[["m2","8:00"],["t1","12:00"],["t3","19:00"]].map(function(a){return'<i class="mono'+(st[a[0]]?' ok':'')+'">'+a[1]+'</i>'}).join("");
  var en=daysToMonthEnd();
  /* Việc chính */
  /* Tay trái */
  var bt=(DATA.tasks||[]).filter(function(x){return x.a==="biz"&&isVisible(x)}).map(function(x){return'<div class="row'+(st[x.id]?' done':'')+'"><button class="c">'+(st[x.id]?'✓':'')+'</button><div class="t">'+escapeHtml(x.t)+'</div><span class="d mono">'+escapeHtml(x.d||"")+'</span></div>'}).join("");
  var bd=byA("biz").concat([{t:"Cuối tháng: file hàng, tính tiền",n:en,a:"biz"}]).filter(function(x,i,s){return s.findIndex(function(y){return y.t===x.t})===i}).sort(function(a,b){return a.n-b.n}).map(deadlineRowHtml).join("");
  /* Kiếm cơm = 2 nút: Việc chính (mặc định) | Bán hàng. Nhớ nút đã chọn theo trình duyệt. */
  var sub=readStorage("wb_work_sub","job")==="sales"?"sales":"job";
  var subBar='<div class="wsubs mono" role="tablist"><button type="button" data-ws="job"'+(sub==="job"?' class="on"':'')+'>Việc chính</button>'
    +'<button type="button" data-ws="sales"'+(sub==="sales"?' class="on"':'')+'>Bán hàng'+(salesOweOpen()?'<i class="wdot" aria-hidden="true"></i>':'')+'</button></div>';
  var jobView='<div class="pg"><div><h2 class="lab mono">'+dotHtml("work")+'Việc chính · tuần này ở đâu?</h2>'+wk+'</div><div><h2 class="lab mono">'+dotHtml("work")+'Việc chính · hạn</h2>'+wd+'</div></div>';
  var salesView='<div class="pg"><div>'+salesCardHtml()+'</div><div><h2 class="lab mono">'+dotHtml("biz")+'Tay trái · bán hàng hôm nay</h2><div class="tk">'+tk+'</div>'+bt+'<h2 class="lab mono">'+dotHtml("biz")+'Tay trái · hạn</h2>'+bd+'</div></div>';
  document.getElementById("work").innerHTML=pageHeaderHtml("Kiếm cơm")+subBar+(sub==="sales"?salesView:jobView);
  /* Sống */
  var fam=(DATA.deadlines||[]).filter(function(x){return x.scope==="family"}).map(function(x){return{t:x.t,n:daysUntil(x)}}).filter(function(x){return x.n>=0&&x.n<=7}).sort(function(a,b){return a.n-b.n});
  var fh=fam.map(deadlineRowHtml).join("")||'<div class="mr"><span>Tuần này yên ắng. Tận hưởng đi.</span></div>';
  var dc=(DATA.docs||[]).filter(isVisible).map(function(x){var k=!/chưa/i.test(x.when||"");return'<div class="dl'+(k?' wk':' far')+'"><span>'+escapeHtml(x.t)+'</span><b class="mono">'+escapeHtml(x.when||"")+'</b></div>'}).join("");
  var tl=(DATA.timeline||[]).filter(isVisible);
  document.getElementById("life").innerHTML=pageHeaderHtml("Tổ ấm")+(FAM?salesCardHtml():"")+'<div class="pg"><div><h2 class="lab mono">Tuần này của nhà</h2>'+fh+(dc?'<h2 class="lab mono">Giấy tờ</h2>'+dc:'')+'</div><div><h2 class="lab mono">Đường dài</h2><div class="tl">'+tl.map(function(x){return'<div'+(x.now?' class="now"':'')+'><span class="lab mono">'+escapeHtml(x.when)+'</span><div class="w">'+escapeHtml(x.what)+'</div></div>'}).join("")+'</div></div></div>';
  /* Học */
  var ln=readStorage("wb_ln",{}),LW=(DATA.learn&&DATA.learn.week)||[],ld=LW.filter(function(_,i){return ln[i]}).length;
  var lr=LW.map(function(x,i){return'<div class="row'+(ln[i]?' done':'')+'" data-ln="'+i+'"><button class="c">'+(ln[i]?'✓':'')+'</button><div class="t">'+escapeHtml(x.t)+'</div><span class="d mono">'+escapeHtml(x.d||"")+'</span></div>'}).join("");
  var gl=(DATA.goals||[]).map(function(g){return'<div class="goal"><div class="g"><span>'+escapeHtml(g.g)+'</span><span class="mono">'+(g.p>0?g.p:"")+'</span></div>'+(g.p>0?'<div class="thin"><i style="width:'+g.p+'%"></i></div>':'')+'</div>'}).join("");
  document.getElementById("learn").innerHTML=pageHeaderHtml("Rèn")+'<div class="pg"><div>'+healthCardHtml()+'</div><div><h2 class="lab mono">'+dotHtml("learn")+'Học · tuần này · '+ld+'/'+LW.length+' buổi</h2>'+lr+(DATA.learn&&DATA.learn.next?'<div class="mr"><span>'+escapeHtml(DATA.learn.next)+'</span></div>':'')+'<h2 class="lab mono">Mục tiêu 6 tháng</h2>'+gl+'</div></div>';
  document.getElementById("learn").onclick=function(e){
    var pb=e.target.closest(".pn button");
    if(pb){var pm=readStorage("wb_pain",{});pm[dayKey()]=+pb.dataset.p;writeStorage("wb_pain",pm);if(DATA.__role==="owner")sendToApi({action:"log_pain",ngay:todayIso(),muc_dau:+pb.dataset.p});renderOtherTabs();tickSitReminder();return}
    var r=e.target.closest(".row[data-ln]");
    if(r){var i=r.dataset.ln;ln[i]=!ln[i];writeStorage("wb_ln",ln);renderOtherTabs();return}
    var h=e.target.closest(".row[data-id]");
    if(h){resetTicksOnNewDay();st[h.dataset.id]=!st[h.dataset.id];writeStorage("wb_st",st);saveTick(h.dataset.id);drawTaskList();renderOtherTabs()}
  };
  if(FAM){["work","learn"].forEach(function(id){var e=document.getElementById(id);if(e)e.innerHTML=""})}   // bản gia đình: không dựng tab riêng tư
  renderWorkCompany();
}
