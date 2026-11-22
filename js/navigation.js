/* navigation.js — Màn chào và chuyển tab. */
function showSplash(){
  if(!(DATA.music&&DATA.music.url&&window.mPlay)||readStorage("wb_mu","on")==="off")return;
  var u=(DATA.urgent||[]).length,el=document.createElement("div");el.id="splash";
  el.innerHTML='<div class="mono"><div class="sp-dot"></div><div class="sp-t">BRAIN</div><div class="sp-s">Chạm để vào ♪</div><div class="sp-d">'+todayLabel()+(FAM?'':' · '+u+' gấp')+'</div><button id="sp-no">Vào không nhạc</button></div>';
  document.body.appendChild(el);
  function out(){el.classList.add("out");setTimeout(function(){el.remove()},700)}
  el.onclick=function(e){if(e.target.id==="sp-no"){writeStorage("wb_mu","off");out();return}window.mPlay();out()};
}
function goToTab(t){
  [].forEach.call(document.getElementById("nav").children,function(x){x.classList.toggle("on",x.dataset.t===t)});
  document.querySelectorAll("section").forEach(function(c){c.classList.toggle("on",c.id===t)});
  window.scrollTo(0,0);if(t==="brain")fitOrbCanvas();
  if(typeof moveNavIndicator==="function")moveNavIndicator();if(typeof playTabMotion==="function")playTabMotion(t);
}
