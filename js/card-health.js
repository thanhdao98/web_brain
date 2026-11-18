/* card-health.js — Thẻ Cơ thể: nhắc ngồi 45 phút, mức đau 0–10. */
/* khoẻ: dải nhắc ngồi lâu (chỉ chạy khi đang mở web) */
function sitReminderHtml(){return '<div class="sit" id="sit"><div><span class="lab mono">Cơ thể</span><div id="sv"></div></div><button id="sb" class="mono">Vừa đứng dậy</button></div>'}
function tickSitReminder(){
  var el=document.getElementById("sv");if(!el)return;
  var t=+readStorage("wb_sit",0),now=Date.now();if(!t||t>now||now-t>36e6){t=now;writeStorage("wb_sit",t)}
  var m=Math.floor((now-t)/6e4),lim=+((DATA.health||{}).sit)||45,over=m>=lim,p=readStorage("wb_pain",{})[dayKey()];
  document.getElementById("sit").classList.toggle("hot",over);
  el.innerHTML='<div class="sm">'+(over?'Ngồi '+m+' phút rồi. Đứng dậy, giãn cổ vai gáy 1 phút.':'Ngồi '+m+' phút · còn '+(lim-m)+' phút')+'</div><div class="sp mono" id="sp">Đau hôm nay: '+(p==null?'chưa ghi':p+'/10')+'</div>';
  hot.learn=over;
}
function healthCardHtml(){
  var hl=DATA.health;if(!hl||FAM)return"";
  var pn=readStorage("wb_pain",{}),td=pn[dayKey()],b="",bars="",i,k,d,v;
  for(i=0;i<=10;i++)b+='<button data-p="'+i+'"'+(td===i?' class="on"':'')+'>'+i+'</button>';
  for(k=6;k>=0;k--){d=new Date();d.setDate(d.getDate()-k);v=pn[d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()];bars+='<div><i style="height:'+(v==null?3:Math.max(v*6,3))+'px;opacity:'+(v==null?.15:1)+'"></i>'+["CN","T2","T3","T4","T5","T6","T7"][d.getDay()]+'</div>'}
  var rows=(DATA.tasks||[]).filter(function(x){return x.a==="fit"}).map(function(x){return'<div class="row'+(st[x.id]?' done':'')+'" data-id="'+escapeHtml(x.id)+'"><button class="c">'+(st[x.id]?'✓':'')+'</button><div class="t">'+escapeHtml(x.t)+'</div><span class="d mono">'+escapeHtml(x.d||"")+'</span></div>'}).join("");
  var wk=(hl.week||[]).map(function(x){return'<div class="wkr"><b class="mono">'+escapeHtml(x.d)+'</b><span>'+escapeHtml(x.t)+'</span><em></em></div>'}).join("");
  var tp=(hl.tips||[]).map(function(x){return'<div>'+escapeHtml(x)+'</div>'}).join("");
  return '<h2 class="lab mono">'+dotHtml("fit")+'Khoẻ · mục tiêu</h2><div class="mr"><span>'+escapeHtml(hl.goal||"")+'</span></div>'+(hl.note?'<div class="nt">'+escapeHtml(hl.note)+'</div>':'')
   +'<h2 class="lab mono">Mức đau hôm nay (0–10)</h2><div class="pn">'+b+'</div><div class="week">'+bars+'</div>'
   +(rows?'<h2 class="lab mono">Việc cơ thể hôm nay</h2>'+rows:'')
   +(wk?'<h2 class="lab mono">Vận động tuần này</h2>'+wk:'')
   +(tp?'<h2 class="lab mono">Nhắc bản thân</h2><div class="rul tp">'+tp+'</div><div class="nt">Gợi ý chung, không thay bác sĩ.</div>':'');
}
