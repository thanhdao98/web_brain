/* home-tasks.js — Danh sách việc hôm nay (tick). */
function dayKey(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function drawTaskList(){
  resetTicksOnNewDay();
  var T=(DATA.tasks||[]).filter(isVisible),Ta=T.filter(function(x){return inGroup(fa,x.a)}),list=Ta.filter(function(x){return f==="all"||x.c===f}),h="";
  list=list.filter(function(x){return !st[x.id]}).concat(list.filter(function(x){return st[x.id]}));
  list.forEach(function(x){h+='<div class="row'+(st[x.id]?' done':'')+(flashIds.indexOf(x.id)>=0?' fl':'')+'" data-id="'+escapeHtml(x.id)+'"><button class="c">'+(st[x.id]?'✓':'')+'</button><div class="t">'+dotHtml(x.a)+escapeHtml(x.t)+'</div><span class="d mono">'+escapeHtml(x.d||"")+'</span></div>'});
  if(!list.length)h='<div class="row"><div class="t" style="color:var(--mute);font-weight:400">Chưa có việc</div></div>';
  document.getElementById("tasks").innerHTML=h;
  var sdEl=document.getElementById("sd");if(sdEl)sdEl.textContent=T.filter(function(x){return st[x.id]}).length+"/"+T.length;
  var un=Ta.filter(function(x){return !st[x.id]}),sn=currentSlot(),n=un.filter(function(x){return x.c===sn})[0]||un[0];
  document.getElementById("nx").innerHTML=n?'<i></i>'+escapeHtml(n.t):'Xong hết. Uống nước đi.';
  document.getElementById("ns").textContent=n?(n.d||""):"Nghỉ đi.";
}
