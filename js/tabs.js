/* tabs.js — Các tab Kiếm cơm, Tổ ấm, Rèn (dựng giao diện). */
function renderOthers(){
  var di=(new Date().getDay()+6)%7;
  /* Việc */
  var wk=(DATA.workweek||[]).map(function(x,i){return'<div class="wkr'+(i===di?' today':'')+'"><b class="mono">'+esc(x.d)+'</b><span>'+esc(x.w)+'</span><em class="mono">'+esc(x.n||"")+'</em></div>'}).join("");
  var byA=function(a){return (DATA.deadlines||[]).filter(function(x){return x.a===a&&!x.hide&&vis(x)}).map(function(x){return{t:x.t,n:days(x),a:a}}).filter(function(x){return x.n>=0})};
  var wl=(DATA.workdl||[]).map(function(x){return{t:x.t,n:days(x),a:"work"}}).concat(byA("work")).sort(function(a,b){return a.n-b.n});
  var wd=wl.map(dlRow).join("")||'<div class="mr"><span>Chưa khai deadline nào. Đáng ngờ.</span></div>';
  var tk=[["m2","8:00"],["t1","12:00"],["t3","19:00"]].map(function(a){return'<i class="mono'+(st[a[0]]?' ok':'')+'">'+a[1]+'</i>'}).join("");
  var en=eomN();
  /* Việc chính */
  /* Tay trái */
  var bt=(DATA.tasks||[]).filter(function(x){return x.a==="biz"&&vis(x)}).map(function(x){return'<div class="row'+(st[x.id]?' done':'')+'"><button class="c">'+(st[x.id]?'✓':'')+'</button><div class="t">'+esc(x.t)+'</div><span class="d mono">'+esc(x.d||"")+'</span></div>'}).join("");
  var bd=byA("biz").concat([{t:"Cuối tháng: file hàng, tính tiền",n:en,a:"biz"}]).filter(function(x,i,s){return s.findIndex(function(y){return y.t===x.t})===i}).sort(function(a,b){return a.n-b.n}).map(dlRow).join("");
  /* Kiếm cơm = Việc chính (trái) + Tay trái (phải) */
  document.getElementById("work").innerHTML=head("Kiếm cơm")+'<div class="pg"><div><h2 class="lab mono">'+dotH("work")+'Việc chính · tuần này ở đâu?</h2>'+wk+'<h2 class="lab mono">'+dotH("work")+'Việc chính · hạn</h2>'+wd+'</div><div><h2 class="lab mono">'+dotH("biz")+'Tay trái · bán hàng hôm nay</h2><div class="tk">'+tk+'</div>'+bt+'<h2 class="lab mono">'+dotH("biz")+'Tay trái · hạn</h2>'+bd+'</div></div>';
  /* Sống */
  var fam=(DATA.deadlines||[]).filter(function(x){return x.scope==="family"}).map(function(x){return{t:x.t,n:days(x)}}).filter(function(x){return x.n>=0&&x.n<=7}).sort(function(a,b){return a.n-b.n});
  var fh=fam.map(dlRow).join("")||'<div class="mr"><span>Tuần này yên ắng. Tận hưởng đi.</span></div>';
  var dc=(DATA.docs||[]).filter(vis).map(function(x){var k=!/chưa/i.test(x.when||"");return'<div class="dl'+(k?' wk':' far')+'"><span>'+esc(x.t)+'</span><b class="mono">'+esc(x.when||"")+'</b></div>'}).join("");
  var tl=(DATA.timeline||[]).filter(vis);
  document.getElementById("life").innerHTML=head("Tổ ấm")+'<div class="pg"><div><h2 class="lab mono">Tuần này của nhà</h2>'+fh+(dc?'<h2 class="lab mono">Giấy tờ</h2>'+dc:'')+'</div><div><h2 class="lab mono">Đường dài</h2><div class="tl">'+tl.map(function(x){return'<div'+(x.now?' class="now"':'')+'><span class="lab mono">'+esc(x.when)+'</span><div class="w">'+esc(x.what)+'</div></div>'}).join("")+'</div></div></div>';
  /* Học */
  var ln=ls("wb_ln",{}),LW=(DATA.learn&&DATA.learn.week)||[],ld=LW.filter(function(_,i){return ln[i]}).length;
  var lr=LW.map(function(x,i){return'<div class="row'+(ln[i]?' done':'')+'" data-ln="'+i+'"><button class="c">'+(ln[i]?'✓':'')+'</button><div class="t">'+esc(x.t)+'</div><span class="d mono">'+esc(x.d||"")+'</span></div>'}).join("");
  var gl=(DATA.goals||[]).map(function(g){return'<div class="goal"><div class="g"><span>'+esc(g.g)+'</span><span class="mono">'+(g.p>0?g.p:"")+'</span></div>'+(g.p>0?'<div class="thin"><i style="width:'+g.p+'%"></i></div>':'')+'</div>'}).join("");
  document.getElementById("learn").innerHTML=head("Rèn")+'<div class="pg"><div>'+healthHtml()+'</div><div><h2 class="lab mono">'+dotH("learn")+'Học · tuần này · '+ld+'/'+LW.length+' buổi</h2>'+lr+(DATA.learn&&DATA.learn.next?'<div class="mr"><span>'+esc(DATA.learn.next)+'</span></div>':'')+'<h2 class="lab mono">Mục tiêu 6 tháng</h2>'+gl+'</div></div>';
  document.getElementById("learn").onclick=function(e){
    var pb=e.target.closest(".pn button");
    if(pb){var pm=ls("wb_pain",{});pm[dayKey()]=+pb.dataset.p;lset("wb_pain",pm);if(DATA.__role==="owner")apiPost({action:"log_pain",ngay:padDay(),muc_dau:+pb.dataset.p});renderOthers();sitTick();return}
    var r=e.target.closest(".row[data-ln]");
    if(r){var i=r.dataset.ln;ln[i]=!ln[i];lset("wb_ln",ln);renderOthers();return}
    var h=e.target.closest(".row[data-id]");
    if(h){dayRoll();st[h.dataset.id]=!st[h.dataset.id];lset("wb_st",st);tickSync(h.dataset.id);draw();renderOthers()}
  };
  if(FAM){["work","learn"].forEach(function(id){var e=document.getElementById(id);if(e)e.innerHTML=""})}   // bản gia đình: không dựng tab riêng tư
  renderCompany();
}
