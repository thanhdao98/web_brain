/* tab-ai.js — Tab AI tháng: thanh dùng AI nhập tay. */
/* AI nhập tay */
function exp(){var d=new Date(),n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return Math.round(d.getDate()/n*100)}
function drawAiUsage(){
  var e=exp(),over=used>e;
  document.getElementById("aiBig").textContent=used+"%";document.getElementById("aiBar").style.width=used+"%";
  document.getElementById("aiMark").style.left=e+"%";
  document.getElementById("aiNote").textContent="Vạch = nên ở "+e+"% hôm nay"+(over?" · vượt":"");
  document.getElementById("aiBox").classList.toggle("over",over);document.getElementById("aiIn").value=used;
  var t=document.getElementById("aiTxt");if(t){t.textContent=over?"Vượt tiến độ":"Trong tiến độ";document.getElementById("aiPct").textContent=used+"% / "+e+"%";document.getElementById("aiRow").classList.toggle("hot",over)}
  hot.ai=over;hot.brain=over;
}
document.getElementById("aiIn").oninput=function(){used=+this.value;writeStorage("wb_ai",used);drawAiUsage()};
