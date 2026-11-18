/* orb.js — Quả cầu 3D điều hướng (vẽ bằng canvas). */
/* quả cầu */
/* điểm trên quả cầu = các tab; màu khớp màu lĩnh vực (AR) */
var N=[{h:190,k:"home",l:"HÔM NAY",la:22,lo:0},{h:330,k:"brain",l:"AI FAMILY",la:-22,lo:72},{h:210,k:"work",l:"KIẾM CƠM",la:8,lo:144},{h:140,k:"life",l:"TỔ ẤM",la:-14,lo:216},{h:270,k:"learn",l:"RÈN",la:16,lo:288}];
var cv=document.getElementById("cv"),cx=cv.getContext("2d"),W=0,ang=0,drag=null,moved=0,tilt=.35;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function fitOrbCanvas(){var r=window.devicePixelRatio||1;W=Math.min(cv.parentNode.clientWidth,440,matchMedia("(min-width:1180px)").matches?Math.round(innerHeight*.3):440)||320;cv.style.width=W+"px";cv.style.height=W+"px";cv.width=W*r;cv.height=W*r;cx.setTransform(r,0,0,r,0,0)}
function P(la,lo){var a=la*Math.PI/180,b=lo*Math.PI/180+ang,x=Math.cos(a)*Math.sin(b),y=-Math.sin(a),z=Math.cos(a)*Math.cos(b);var y2=y*Math.cos(tilt)-z*Math.sin(tilt),z2=y*Math.sin(tilt)+z*Math.cos(tilt);var R=W*.36;return{x:W/2+R*x,y:W/2+R*y2,z:z2}}
function col(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function hs(h,l,a){return "hsla("+h+",85%,"+l+"%,"+a+")"}
function curve(p,h){for(var i=1;i<p.length;i++){var a=p[i-1],b=p[i],fr=(a.z+b.z)/2>0;cx.strokeStyle=hs(h,fr?64:50,fr?.7:.14);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
function nodes(){return N.filter(function(n){return !FAM||n.k==="home"||n.k==="life"})}
function animateOrb(){
  if(cv.offsetParent!==null&&W){
    var acc=col("--acc"),R=W*.36,la,lo,p;cx.clearRect(0,0,W,W);cx.globalAlpha=1;cx.lineWidth=1.1;
    var g=cx.createRadialGradient(W/2,W/2,R*.1,W/2,W/2,R*1.05);g.addColorStop(0,"rgba(120,90,255,.24)");g.addColorStop(1,"rgba(120,90,255,0)");
    cx.fillStyle=g;cx.beginPath();cx.arc(W/2,W/2,R*1.05,0,7);cx.fill();
    for(la=-60;la<=60;la+=30){p=[];for(lo=0;lo<=360;lo+=10)p.push(P(la,lo));curve(p,190+(la+60)/120*130)}
    for(lo=0;lo<360;lo+=30){p=[];for(la=-90;la<=90;la+=10)p.push(P(la,lo));curve(p,190+lo/360*130)}
    var t=Date.now()/1000;
    nodes().map(function(n){n.p=P(n.la,n.lo);return n}).sort(function(a,b){return a.p.z-b.p.z}).forEach(function(n){
      var fr=n.p.z>0,h=hot[n.k],x=n.p.x,y=n.p.y;
      var gg=cx.createRadialGradient(x,y,0,x,y,20);gg.addColorStop(0,hs(n.h,66,fr?.55:.1));gg.addColorStop(1,hs(n.h,66,0));
      cx.fillStyle=gg;cx.beginPath();cx.arc(x,y,20,0,7);cx.fill();
      if(h&&fr){cx.strokeStyle=acc;cx.globalAlpha=.6*(1-(t%1.6)/1.6);cx.beginPath();cx.arc(x,y,8+16*((t%1.6)/1.6),0,7);cx.stroke()}
      cx.globalAlpha=fr?1:.3;cx.fillStyle=h?acc:"hsl("+n.h+",90%,70%)";cx.beginPath();cx.arc(x,y,h?6.5:5,0,7);cx.fill();
      if(fr){cx.font="12px ui-monospace,Menlo,monospace";cx.textAlign="center";cx.lineJoin="round";cx.lineWidth=3.5;cx.strokeStyle="rgba(11,11,12,.9)";cx.strokeText(translateLabel(n.l),x,y-15);cx.fillStyle="#f4f4f5";cx.fillText(translateLabel(n.l),x,y-15);cx.lineWidth=1.1}cx.globalAlpha=1});
    if(!drag&&!reduce)ang+=.004;
  }
  requestAnimationFrame(animateOrb);
}
cv.addEventListener("pointerdown",function(e){drag={x:e.clientX};moved=0;cv.setPointerCapture(e.pointerId)});
cv.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-drag.x;drag.x=e.clientX;moved+=Math.abs(dx);ang+=dx*.012});
cv.addEventListener("pointerup",function(e){var tap=moved<6;drag=null;if(!tap)return;
  var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,best=null,bd=40;
  nodes().forEach(function(n){var p=P(n.la,n.lo);if(p.z<=0)return;var d=Math.hypot(p.x-mx,p.y-my);if(d<bd){bd=d;best=n}});if(best)goToTab(best.k)});
window.addEventListener("resize",fitOrbCanvas);
function placeOrb(){var d=matchMedia("(min-width:900px)").matches,sl=document.getElementById("slot"),br=document.getElementById("brain");if(d&&sl)sl.appendChild(cv);else br.insertBefore(cv,br.querySelector(".hint"));fitOrbCanvas()}

