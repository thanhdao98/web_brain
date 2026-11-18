/* card-mail.js — Thẻ Gmail quan trọng (Mail Digest): tải, vẽ, ẩn/hiện lại mail. */
/* mail cần xem: gọi Apps Script mail_digest (chỉ người gửi/tiêu đề, tối đa 3). url + key chỉ nằm trong real.json (gitignore). */
var MAIL_GROUP_HUE={"Con · thành phố":140,"Phòng khám con":140,"Máy bay":210,"Bảo mật tài khoản":350,"Tiền điện":30,"Thẻ JCB":30,"SIM":30,"Tiền vào":30,"Gắn sao":48};
var mailData=null,mailStale=false,mailHiddenOpen=false;
function loadHiddenMail(){var o=readStorage("wb_mhide",{}),n=Date.now(),ch=false;
  Object.keys(o).forEach(function(k){if(n-o[k].t>8*864e5){delete o[k];ch=true}else if(o[k].x&&n-o[k].t>864e5){o[k].x=null;ch=true}});
  if(ch)writeStorage("wb_mhide",o);return o}
function mailAgeText(s){var p=String(s||"").split(/[-T:]/);if(p.length<5)return"";var d=new Date(+p[0],+p[1]-1,+p[2],+p[3],+p[4]),m=Math.round((Date.now()-d)/6e4);
  if(m<1)return"vừa xong";if(m<60)return m+" phút trước";var hh=Math.floor(m/60);if(hh<24)return hh+" giờ trước";var dd=Math.floor(hh/24);return dd===1?"hôm qua":dd+" ngày trước"}
function mailHeaderHtml(n,note,spin){return '<div class="mh"><svg class="mic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span class="lab mono">Gmail · quan trọng</span><b class="mono">'+(n==null?"":n+'/3')+(note?' · '+note:'')+'</b><button class="mrf'+(spin?' spin':'')+'" id="mrf" title="Làm mới" aria-label="Làm mới">↻</button></div>'}
function mailRowHtml(x,i,anim,hid,base){
  var hu=MAIL_GROUP_HUE[x.g],dot='<span class="md" style="background:'+(hu==null?'var(--mute)':'hsl('+hu+',70%,55%)')+'"></span>',lk=base+'#all/'+encodeURIComponent(x.id),id=escapeHtml(x.id);
  var g='<span class="mg mono">'+escapeHtml(x.g)+' · '+mailAgeText(x.t)+(x.st?' · ★':'')+'</span><span class="ms">'+escapeHtml(x.s)+'</span>',st=anim?' style="animation-delay:'+(i*70)+'ms"':' style="animation:none"';
  if(hid)return'<div class="mi hid" data-id="'+id+'" style="animation:none">'+dot+'<div class="mt">'+g+'</div><div class="act"><button class="mrs mono" data-id="'+id+'">Hiện lại</button></div></div>';
  return'<div class="mi'+(x.u?' nw':'')+'" data-id="'+id+'"'+st+'>'+dot+'<a class="mt" href="'+lk+'" target="_blank" rel="noopener">'+g+'</a><div class="act"><a class="go mono" href="'+lk+'" target="_blank" rel="noopener">Mở ↗</a><button class="mx" data-id="'+id+'" title="Ẩn" aria-label="Ẩn mail này">×</button></div></div>'}
function drawMail(d,stale,anim){
  var el=document.getElementById("ml");if(!el||!d)return;mailData=d;mailStale=!!stale;
  var H=loadHiddenMail(),m=DATA.mail||DATA.digest||{},base='https://mail.google.com/mail/'+(m.user?'?authuser='+encodeURIComponent(m.user):'u/0/');
  var all=d.items||[],vis=all.filter(function(x){return !H[x.id]}).slice(0,3),hidIn=all.filter(function(x){return H[x.id]}).length;
  var hids=Object.keys(H).filter(function(k){return H[k].x}).sort(function(a,b){return H[b].t-H[a].t}).map(function(k){return H[k].x});
  var more=d.n-vis.length-hidIn;
  var ck='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  el.innerHTML=mailHeaderHtml(vis.length,stale?'cũ':'')
    +(vis.length?vis.map(function(x,i){return mailRowHtml(x,i,anim,false,base)}).join(''):'<div class="nt">'+ck+'Không có mail quan trọng cần xem.</div>')
    +(more>0?'<div class="nt">+'+more+' mail khác trong Gmail</div>':'')
    +(hids.length?'<button class="mht mono" id="mht">Đã ẩn ('+hids.length+') '+(mailHiddenOpen?'▴':'▾')+'</button>'+(mailHiddenOpen?hids.map(function(x,i){return mailRowHtml(x,i,false,true,base)}).join(''):''):'');
}
function hideMail(id){var it=((mailData&&mailData.items)||[]).filter(function(x){return x.id===id})[0];if(!it)return;var H=loadHiddenMail();H[id]={t:Date.now(),x:it};writeStorage("wb_mhide",H);drawMail(mailData,mailStale,false)}
function restoreMail(id){var H=loadHiddenMail();delete H[id];writeStorage("wb_mhide",H);drawMail(mailData,mailStale,false)}
function loadMail(fresh,silent){
  var el=document.getElementById("ml"),m=digestSource();if(!el||!m||!m.url)return;
  if(!el.onclick)el.onclick=function(e){
    var t;
    if(e.target.closest("#mrf")){try{localStorage.removeItem("wb_mail")}catch(x){}loadMail(true);return}
    if(e.target.closest("#mht")){mailHiddenOpen=!mailHiddenOpen;drawMail(mailData,mailStale,false);return}
    if((t=e.target.closest(".mrs"))){restoreMail(t.dataset.id);return}
    if((t=e.target.closest(".mx"))){var row=t.closest(".mi"),id=t.dataset.id;row.classList.add("out");setTimeout(function(){hideMail(id)},270)}};
  var c=readStorage("wb_mail",null);
  if(!fresh&&c&&Date.now()-c.t<3e5){drawMail(c.d,false,true);return}
  if(!silent||!c)el.innerHTML=mailHeaderHtml(null,'',true)+'<div class="nt">Đang tải…</div>';
  return fetch(m.url+(m.url.indexOf("?")<0?"?":"&")+"k="+encodeURIComponent(m.key||"")+(fresh?"&fresh=1":""))
    .then(function(r){if(!r.ok)throw 0;return r.json()})
    .then(function(j){if(j.error||!j.items)throw 0;writeStorage("wb_mail",{t:Date.now(),d:j});drawMail(j,false,!silent)})
    .catch(function(){if(c&&c.d)drawMail(c.d,true,true);else el.innerHTML=mailHeaderHtml(null,'')+'<div class="nt">Chưa lấy được mail (kiểm tra mạng hoặc link trong real.json).</div>'});
}
