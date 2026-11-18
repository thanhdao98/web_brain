/* main.js — Khởi động: tải dữ liệu rồi dựng các tab. */
loadData().then(function(d){
  DATA=d;if(d.i18n)Object.keys(d.i18n).forEach(function(k){TR[k]=d.i18n[k]});st=readStorage("wb_st",{});
  if(d.__ticks){st={};d.__ticks.forEach(function(id){st[id]=true});writeStorage("wb_st",st);writeStorage("wb_std",dayKey())}
  if(d.__live&&d.pain){var pm0=readStorage("wb_pain",{});d.pain.forEach(function(x){var kk=String(x.date).replace(/-0(\d)/g,"-$1");if(x.p!==""&&x.p!=null)pm0[kk]=+x.p});writeStorage("wb_pain",pm0)}
  if(d.__ideas){writeStorage("wb_qn",d.__ideas.map(function(x){return{id:x.id,t:x.text}}))}
  dataSignature=d.__sig||"";serverSignature=d.__ssig||"";
  used=+readStorage("wb_ai",40);f=currentSlot();if(d.__role==="family")FAM=true;if(FAM)document.body.classList.add("fam");if(FAM&&!(d.tasks||[]).length)document.body.classList.add("fam0");
  hot.home=!FAM&&(d.urgent||[]).length>0;
  TABS=FAM?[["home","Hôm nay"],["brain","Brain"],["life","Tổ ấm"]]:[["home","Hôm nay"],["brain","AI Family"],["work","Kiếm cơm"],["life","Tổ ấm"],["learn","Rèn"]];
  document.getElementById("nav").innerHTML=TABS.map(function(t,i){return'<button'+(i===0?' class="on"':'')+' data-t="'+t[0]+'">'+t[1]+'</button>'}).join("");
  document.getElementById("nav").onclick=function(e){var b=e.target.closest("button");if(b)goToTab(b.dataset.t)};
  document.getElementById("foot").textContent=(d.label||"").toUpperCase()+(FAM?" · BẢN GIA ĐÌNH":"");
  renderTodayTab();drawTaskList();renderOtherTabs();drawAiUsage();placeOrb();animateOrb();showSplash();initLanguage();scheduleMidnightReset();startAutoRefresh();setSyncStatus("ok");var mq=matchMedia("(min-width:900px)");if(mq.addEventListener)mq.addEventListener("change",placeOrb);else mq.addListener(placeOrb);
}).catch(function(e){document.getElementById("home").innerHTML='<div class="top mono"><span class="lab">Lỗi tải dữ liệu</span></div><p class="mono">Hãy chạy ./serve.sh rồi mở http://localhost:8080</p>'});
