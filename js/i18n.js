/* i18n.js — Máy dịch: tra từ điển, áp dụng cho trang, nút chuyển ngôn ngữ. */
function trOne(s){var i=LANG==="en"?0:1,e=TR[s];if(e)return e[i];
  for(var k=0;k<PT.length;k++){var m=PT[k][0].exec(s);if(m)return PT[k][i+1].replace(/([$§¶])(\d)/g,function(_,c,n){var v=m[+n]||"";return c==="$"?v:c==="§"?trText(v):trText(v)})}
  return s}
function trText(s){if(LANG==="vi"||!s)return s;var r=trOne(s);if(r!==s)return r;
  if(s.indexOf(" · ")>0){var any=false,o=s.split(" · ").map(function(p){var t=trOne(p);if(t!==p)any=true;return t});return any?o.join(" · "):s}
  return s}
function LT(s){return trText(s)}
function lgHtml(){return '<span class="lg mono">'+["vi","en","ja"].map(function(l){return'<button data-l="'+l+'"'+(l===LANG?' class="on"':'')+'>'+l.toUpperCase()+'</button>'}).join("")+'</span>'}
var LBUSY=false,LPEND=false,LOBS=null,LUSED=LANG!=="vi";
function langApply(){
  if(LANG==="vi"&&!LUSED)return;
  LBUSY=true;document.documentElement.lang=LANG;
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n,L=[];
  while((n=w.nextNode())){var pn=n.parentNode&&n.parentNode.nodeName;if(pn==="SCRIPT"||pn==="STYLE"||pn==="CANVAS"||pn==="TEXTAREA")continue;L.push(n)}
  L.forEach(function(n){var cur=n.nodeValue,src=(n.__t!==undefined&&cur===n.__t)?n.__vi:cur;n.__vi=src;
    var core=src.trim();if(!core){n.__t=cur;return}
    var out=src.replace(core,trText(core));n.__t=out;if(out!==cur)n.nodeValue=out});
  [].forEach.call(document.querySelectorAll("[title],[aria-label],[placeholder]"),function(el){el.__a=el.__a||{};
    ["title","aria-label","placeholder"].forEach(function(a){var cur=el.getAttribute(a);if(cur===null)return;
      var o=el.__a[a],src=(o&&o.t===cur)?o.v:cur,out=trText(src);el.__a[a]={v:src,t:out};if(out!==cur)el.setAttribute(a,out)})});
  [].forEach.call(document.querySelectorAll(".lg button"),function(b){b.classList.toggle("on",b.dataset.l===LANG)});
  if(LOBS)LOBS.takeRecords();LBUSY=false}
function langInit(){
  langApply();
  LOBS=new MutationObserver(function(){if(LBUSY)return;langApply()});
  LOBS.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".lg button");if(!b)return;
    LANG=b.dataset.l;lset("wb_lang",LANG);LUSED=true;langApply()})}
