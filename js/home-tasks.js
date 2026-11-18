/* home-tasks.js — Danh sách việc hôm nay (tick). */
function dayKey(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function draw(){
  dayRoll();
  var T=(DATA.tasks||[]).filter(vis),Ta=T.filter(function(x){return inG(fa,x.a)}),list=Ta.filter(function(x){return f==="all"||x.c===f}),h="";
  list=list.filter(function(x){return !st[x.id]}).concat(list.filter(function(x){return st[x.id]}));
  list.forEach(function(x){h+='<div class="row'+(st[x.id]?' done':'')+(FLASH.indexOf(x.id)>=0?' fl':'')+'" data-id="'+esc(x.id)+'"><button class="c">'+(st[x.id]?'✓':'')+'</button><div class="t">'+dotH(x.a)+esc(x.t)+'</div><span class="d mono">'+esc(x.d||"")+'</span></div>'});
  if(!list.length)h='<div class="row"><div class="t" style="color:var(--mute);font-weight:400">Chưa có việc</div></div>';
  document.getElementById("tasks").innerHTML=h;
  var sdEl=document.getElementById("sd");if(sdEl)sdEl.textContent=T.filter(function(x){return st[x.id]}).length+"/"+T.length;
  var un=Ta.filter(function(x){return !st[x.id]}),sn=slotNow(),n=un.filter(function(x){return x.c===sn})[0]||un[0];
  document.getElementById("nx").innerHTML=n?'<i></i>'+esc(n.t):'Xong hết. Uống nước đi.';
  document.getElementById("ns").textContent=n?(n.d||""):"Nghỉ đi.";
}
