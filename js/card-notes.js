/* card-notes.js — Thẻ Ghi chú chung: thêm, đánh dấu xong, xoá. */
var NOTES=[],LASTNOTE=0;
function ncTime(s){var m=/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/.exec(String(s||""));if(!m)return"";var d=new Date();return(+m[1]===d.getFullYear()&&+m[2]===d.getMonth()+1&&+m[3]===d.getDate())?m[4]+":"+m[5]:(+m[3])+"."+(+m[2])}
function ncDraw(){
  var el=document.getElementById("nc");if(!el)return;
  var cur=document.getElementById("nin"),val=cur?cur.value:"",foc=!!cur&&document.activeElement===cur;
  var op=NOTES.filter(function(n){return n.status!=="xong"}),dn=NOTES.filter(function(n){return n.status==="xong"});
  var rows=op.concat(dn).slice(0,14).map(function(n){var who=n.by==="vo"?"Vợ":(n.by==="thanh"?"Chồng":esc(n.by||""));
    return'<div class="row'+(n.status==="xong"?' done':'')+'" data-nid="'+esc(n.id)+'"><button class="c">'+(n.status==="xong"?'✓':'')+'</button><div class="t">'+esc(n.text)+'<span class="d mono">'+who+' · '+ncTime(n.time)+(/^tmp/.test(String(n.id))?' · <em>đang lưu…</em>':'')+'</span></div><button class="qx" title="Xoá" aria-label="Xoá">×</button></div>'}).join("");
  var sc=SYN==="err"?"er":(SYN==="save"||SYN==="sy"?"sy":"ok");
  el.innerHTML='<div class="nh"><span class="lab mono"><i class="sd '+sc+'"></i>Ghi chú chung</span><b class="mono">'+op.length+'</b></div><form id="nf"><input id="nin" placeholder="Thêm ghi chú…" autocomplete="off" enterkeyhint="send"><button type="submit" class="nsub" aria-label="Thêm" title="Thêm">+</button></form>'+rows;
  var inp=document.getElementById("nin");inp.value=val;if(foc)inp.focus();colFit("nc")}
function noteAdd(t){var n=new Date(),p=function(x){return String(x).padStart(2,"0")};
  var o={id:"tmp"+Date.now(),time:n.getFullYear()+"-"+p(n.getMonth()+1)+"-"+p(n.getDate())+" "+p(n.getHours())+":"+p(n.getMinutes()),by:DATA.__role==="family"?"vo":"thanh",text:t,status:"mo"};
  LASTNOTE=Date.now();NOTES.unshift(o);var i=document.getElementById("nin");if(i)i.value="";ncDraw();
  apiPost({action:"add_note",noi_dung:t},false,function(j){if(j&&j.id){o.id=j.id;ncDraw();if(o.del)apiPost({action:"delete_note",id:j.id});else if(o.st)apiPost({action:"update_note",id:j.id,trang_thai:o.st})}})}
function noteTog(id){var o=NOTES.filter(function(x){return x.id===id})[0];if(!o)return;o.status=o.status==="xong"?"mo":"xong";LASTNOTE=Date.now();ncDraw();
  if(/^tmp/.test(id))o.st=o.status;else apiPost({action:"update_note",id:id,trang_thai:o.status})}
function noteDel(id){var i=NOTES.findIndex(function(x){return x.id===id});if(i<0)return;var o=NOTES.splice(i,1)[0];LASTNOTE=Date.now();ncDraw();
  if(/^tmp/.test(id))o.del=true;else apiPost({action:"delete_note",id:id})}
