/* tab-ai-learning.js — Trang AI Family: nhịp học AI 12 tuần, "học được gì hôm nay", sổ ma sát.
   Không đổi máy chủ: mỗi dòng lưu như một "ý tưởng" có tiền tố "ms:NGÀY " hoặc "hoc:NGÀY " (đồng bộ qua Sheet như Thả ý tưởng).
   Danh sách Thả ý tưởng ở trang Hôm nay ẩn các dòng này (xem drawIdeaList). Kế hoạch đầy đủ: _brain/learning-plan.md */
var LEARN_START="2026-11-23",LEARN_WEEKS=12;   // thứ Hai tuần 1
var LEARN_MONTHS=["Tháng 1 · Dùng AI đúng, đo token","Tháng 2 · Đọc hiểu code, tự duyệt, test","Tháng 3 · Hệ thống, cloud, agent nhỏ"];
var LEARN_RHYTHM={1:["Buổi kỹ thuật","30 phút: 1 chủ đề, thử ngay"],3:["Buổi dự án","45–60 phút: làm, duyệt, test"],5:["Buổi ý tưởng","30 phút: chấm sổ ma sát, viết đặc tả 1 trang"],0:["Buổi chốt tuần","30 phút: ghi học được gì, đo token"]};   // khoá = getDay()
var LEARN_RX=/^(ms|hoc):(\d{4}-\d{2}-\d{2}) (.*)$/;
function isLearnEntry(o){return LEARN_RX.test((o&&o.t)||"")}
function learnEntries(kind){var r=[];(ideaList||[]).forEach(function(o,i){var m=LEARN_RX.exec((o&&o.t)||"");if(m&&m[1]===kind)r.push({i:i,d:m[2],t:m[3]})});return r}
function learnIso(d){var p=function(n){return String(n).padStart(2,"0")};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function learnWeekNo(){return Math.floor((new Date()-new Date(LEARN_START+"T00:00:00"))/6048e5)+1}
function learnMondayIso(){var d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return learnIso(d)}
function learnShortDate(iso){return iso.slice(8)+"/"+iso.slice(5,7)}
function learnListHtml(kind,max){var L=learnEntries(kind).slice(0,max);
  return L.length?L.map(function(x){return'<div class="mr"><span><b class="mono">'+learnShortDate(x.d)+'</b> '+escapeHtml(x.t)+'</span><button class="qx" data-i="'+x.i+'">×</button></div>'}).join(""):'<div class="mr"><span>Chưa có dòng nào.</span></div>'}
function learnFormHtml(kind){return'<form class="lf" data-k="'+kind+'"><input class="qn mono lq" data-k="'+kind+'" maxlength="160" placeholder="Gõ 1 dòng, Enter là xong" autocomplete="off" enterkeyhint="done"></form>'}
/* thêm/xoá một dòng trong danh sách ý tưởng (cùng cách làm với ô Thả ý tưởng ở home.js) */
function addIdeaText(text){var o={id:null,t:text};
  if(DATA.__live&&DATA.__role==="owner"){o.id="tmp"+Date.now();lastIdeaEditAt=Date.now();sendToApi({action:"add_idea",noi_dung:text},false,function(j){if(j&&j.id){o.id=j.id;writeStorage("wb_qn",ideaList);if(o.del)sendToApi({action:"delete_idea",id:j.id})}})}
  ideaList.unshift(o);writeStorage("wb_qn",ideaList);drawIdeaList()}
function removeIdeaAt(i){var o=ideaList.splice(i,1)[0];writeStorage("wb_qn",ideaList);drawIdeaList();
  if(o&&DATA.__live&&DATA.__role==="owner"){lastIdeaEditAt=Date.now();if(/^tmp/.test(String(o.id)))o.del=true;else if(o.id)sendToApi({action:"delete_idea",id:o.id})}}
function drawLearnAi(){
  var el=document.getElementById("aif");if(!el)return;
  if(FAM||!DATA){el.innerHTML="";return}   // bản gia đình không thấy
  var keep={},act=document.activeElement;
  el.querySelectorAll("input.lq").forEach(function(i){keep[i.dataset.k]=i.value});
  var w=learnWeekNo(),on=w>=1&&w<=LEARN_WEEKS,mon=learnMondayIso(),days={},td=LEARN_RHYTHM[new Date().getDay()];
  var head=w<1?"Bắt đầu thứ Hai 23/11":on?"Học AI · tuần "+w+"/"+LEARN_WEEKS:"Đã qua 12 tuần. Lên kế hoạch tiếp.";
  learnEntries("hoc").forEach(function(x){if(x.d>=mon)days[x.d]=1});
  var done=Object.keys(days).length,mi=Math.min(2,Math.max(0,Math.floor((w-1)/4))),msw=learnEntries("ms").filter(function(x){return x.d>=mon}).length;
  var plan=LEARN_MONTHS.map(function(m,i){return'<div class="mr'+(on&&i===mi?' now':'')+'"><span>'+m+'</span></div>'}).join("");
  el.innerHTML='<div class="pg"><div>'
    +'<h2 class="lab mono">'+dotHtml("learn")+head+'</h2>'
    +(td?'<div class="mr lr"><span>'+td[0]+'</span><b class="mono">'+td[1]+'</b></div>':'<div class="mr"><span>Hôm nay nghỉ. Ghi ma sát là đủ.</span></div>')
    +'<div class="thin"><i style="width:'+Math.min(100,done*25)+'%"></i></div><div class="mr"><span>Tuần này: '+done+'/4 buổi</span></div>'
    +'<h2 class="lab mono">12 tuần</h2>'+plan
    +'<h2 class="lab mono">Học được gì hôm nay</h2>'+learnFormHtml("hoc")+learnListHtml("hoc",5)
    +'</div><div>'
    +'<h2 class="lab mono">'+dotHtml("work")+'Sổ ma sát</h2><div class="mr"><span>Việc nào hôm nay làm tay, lặp lại, chậm?</span></div>'+learnFormHtml("ms")+learnListHtml("ms",8)
    +'<div class="mr"><span>Tuần này: '+msw+' dòng</span></div>'
    +'</div></div>';
  el.querySelectorAll("input.lq").forEach(function(i){if(keep[i.dataset.k]!=null)i.value=keep[i.dataset.k];if(act&&act.classList&&act.classList.contains("lq")&&act.dataset.k===i.dataset.k)i.focus()})}
(function(){var el=document.getElementById("aif");if(!el)return;
  el.addEventListener("submit",function(e){var f=e.target.closest&&e.target.closest("form.lf");if(!f)return;e.preventDefault();
    var i=f.querySelector("input.lq"),v=i.value.replace(/\s+/g," ").trim();if(!v)return;i.value="";addIdeaText(f.dataset.k+":"+learnIso(new Date())+" "+v)});
  el.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".qx");if(b)removeIdeaAt(+b.dataset.i)})})();
