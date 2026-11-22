/* motion.js — Chuyển động tiết chế: số chạy đếm, thẻ hiện lần lượt khi đổi tab, gạch chân thanh dưới trượt.
   Chỉ chạy khi vào tab (không chạy lại mỗi lần tự cập nhật 30 giây). Tắt hết khi máy đặt "giảm chuyển động". */
var COUNT_SEEN={};      // khoá → số đã chạy xong (cập nhật ngầm cùng số thì không chạy lại)
var tickJust="";        // id việc vừa tick, để chỉ vẽ nét tick cho đúng dòng đó
function prefersReducedMotion(){return !!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)}

/* chạy số từ 0 → giá trị cuối trong ~0,9 giây; phần tử cần data-count, data-ck (khoá), tuỳ chọn data-yen */
function animateCounts(root){
  if(prefersReducedMotion()||!window.requestAnimationFrame)return;
  [].forEach.call((root||document).querySelectorAll("[data-count]"),function(el){
    var end=+el.dataset.count,key=el.dataset.ck||"",yen=!!el.dataset.yen;
    if(!key||!end||COUNT_SEEN[key]===end)return;
    COUNT_SEEN[key]=end;
    var fmt=function(v){return yen?formatYen(v):formatThousands(v)},t0=null;
    function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);el.textContent=fmt(end*e);if(p<1)requestAnimationFrame(step)}
    el.textContent=fmt(0);requestAnimationFrame(step)})
}

/* vào tab: các thẻ trượt lên lần lượt (class play, tự gỡ sau ~1 giây để lần vẽ lại sau không chạy lại) + chạy số */
function playTabMotion(id){
  var s=typeof id==="string"?document.getElementById(id):id;if(!s||prefersReducedMotion())return;
  if(s.id!=="home"){s.classList.remove("play");void s.offsetWidth;s.classList.add("play");clearTimeout(s._pt);s._pt=setTimeout(function(){s.classList.remove("play")},1200)}
  [].forEach.call(s.querySelectorAll("[data-count]"),function(el){delete COUNT_SEEN[el.dataset.ck]});
  animateCounts(s)
}

/* gạch chân thanh điều hướng: một thanh trượt sang nút đang chọn (không có JS thì dùng gạch chân chữ như cũ) */
function moveNavIndicator(){
  var nav=document.getElementById("nav"),b=nav&&nav.querySelector("button.on");if(!b||!b.offsetWidth)return;
  var ind=nav.querySelector(".nav-ind");if(!ind){ind=document.createElement("span");ind.className="nav-ind";nav.appendChild(ind)}
  var cs=getComputedStyle(b),pl=parseFloat(cs.paddingLeft)||0,pr=parseFloat(cs.paddingRight)||0;
  ind.style.width=(b.offsetWidth-pl-pr)+"px";
  ind.style.transform="translate("+(b.offsetLeft+pl)+"px,"+(b.offsetTop+b.offsetHeight-4)+"px)";
  nav.classList.add("hasind")
}
(function(){
  var raf=0,again=function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(moveNavIndicator)};
  window.addEventListener("resize",again);window.addEventListener("load",again);
  if(window.MutationObserver)document.addEventListener("DOMContentLoaded",function(){var n=document.getElementById("nav");if(n)new MutationObserver(function(m){if(m.some(function(x){return x.target.className!=="nav-ind"&&!(x.addedNodes[0]&&x.addedNodes[0].className==="nav-ind")}))again()}).observe(n,{childList:true,subtree:true,characterData:true})})
})();
