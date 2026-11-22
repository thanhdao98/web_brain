/* card-sales.js — Thẻ Bán hàng (tab Kiếm cơm): còn phải chuyển cho VA, lãi thực, lãi dự kiến, biểu đồ lãi theo tháng.
   Dữ liệu: DATA.sales (bản công khai = số mẫu trong data/demo.json, có cờ sample:true).
   DATA.sales.months = danh sách tháng cũ → mới; phần tử CUỐI là tháng đã chốt gần nhất.
   Chủ (OWNER) thấy ở tab Kiếm cơm (nút Bán hàng); bản gia đình (FAMILY_KEY) thấy ở đầu tab Tổ ấm. */

/* số nguyên có dấu chấm nghìn: 72000 → "72.000" */
function formatThousands(n){
  var v=Math.round(Math.abs(+n||0)),s=String(v).replace(/\B(?=(\d{3})+(?!\d))/g,".");
  return (n<0?"−":"")+s;
}
function formatYen(n){return formatThousands(n)+" ¥"}
/* số thập phân kiểu Việt: 23.7 → "23,7" (digits = số chữ số sau dấu phẩy) */
function formatDecimalVi(x,digits){return (+x).toFixed(digits).replace(".",",")}
/* phần trăm thay đổi có dấu: 2.857 → "+2,9%" ; âm dùng dấu trừ thật "−" */
function formatSignedPercent(x,digits){
  var t=formatDecimalVi(Math.abs(x),digits)+"%";
  return (x<0?"−":"+")+t;
}
/* % thay đổi từ tháng trước sang tháng này; null nếu không có tháng trước hoặc bằng 0 */
function percentChange(cur,prev){return prev?(cur-prev)/prev*100:null}
/* "T5+T6" → "6" (số tháng cuối cùng trong nhãn) */
function lastMonthNumber(label){var m=String(label).match(/\d+/g);return m?m[m.length-1]:""}

/* nhãn tháng (T4, T5+T6…) gắn data-nt để máy dịch bỏ qua (tránh nhầm với thứ T4 = Thứ Tư) */
/* biểu đồ cột lãi thực theo tháng (HTML/CSS thuần, không thư viện) */
function salesChartHtml(months){
  var max=Math.max.apply(null,months.map(function(m){return +m.profit||0}))||1;
  return '<div class="sbars">'+months.map(function(m,i){
    var h=Math.max(2,(+m.profit||0)/max*84),last=i===months.length-1,prev=months[i-1];
    var line2=m.merged?'<em class="mg1">gộp 2 tháng</em><em class="mg2">gộp</em>':(prev&&i>=months.length-3?formatSignedPercent(percentChange(m.profit,prev.profit),0):"");
    var p=Math.round(+m.profit||0);
    return '<div class="sbc"><div class="sbt"><b class="sv1 mono">'+formatThousands(p)+'</b><b class="sv2 mono">'+Math.round(p/1000)+'</b>'
      +'<i class="sbb'+(last?' now':'')+'" style="height:'+h.toFixed(1)+'%"></i></div>'
      +'<div class="sbl"><b class="mono" data-nt>'+escapeHtml(m.k)+'</b><span class="mono">'+line2+'</span></div></div>';
  }).join("")+'</div>';
}

/* phần gấp: tỷ giá đã chốt + bảng các tháng cũ (mới nhất trước), ẩn mặc định; điện thoại: mỗi tháng 2 dòng */
function salesOldMonthsHtml(months,open,fx){
  var old=months.slice(0,-1).reverse(),hasFx=fx&&fx.v!=null;
  if(!old.length&&!hasFx)return"";
  var cell=function(lab,val){return'<span class="sc"><i class="lab mono">'+lab+'</i><b class="mono">'+val+'</b></span>'};
  var head='<div class="sr sh lab mono"><span>Tháng</span><span>Lãi thực</span><span>Lãi dự kiến</span><span>Thu</span><span>Đơn</span><span>Còn nợ VA</span></div>';
  var rows=old.map(function(m){
    return '<div class="sr"><span class="sc sk"><b data-nt>'+escapeHtml(m.k)+'</b></span>'
      +cell("Lãi thực",formatYen(m.profit))+cell("Lãi dự kiến",formatYen(m.expected))
      +cell("Thu",formatYen(m.rev))+cell("Đơn",Math.round(+m.orders||0))+cell("Còn nợ VA",formatYen(m.owe))+'</div>';
  }).join("");
  var fxRow=hasFx?'<div class="sfx"><span class="lab mono">Tỷ giá đã chốt</span><b class="mono">'+formatDecimalVi(fx.v,1)+'</b><span class="mono">'+escapeHtml(fx.pair||"")+'</span></div>':"";
  return '<button class="sx mono" id="sx" type="button">'+(open?"Ẩn các tháng cũ":"Xem các tháng cũ")+'</button>'
    +'<div class="sold'+(open?' on':'')+'">'+fxRow+(old.length?head+rows:"")+'</div>';
}

/* thẻ trống ở chế độ dữ liệu thật: chưa có dòng ban_hang thì KHÔNG hiện số mẫu */
function salesEmptyHtml(){return '<div class="sal"><div class="ssub">Chưa có dữ liệu bán hàng. Số sẽ hiện sau khi chốt tháng.</div></div>'}
/* còn nợ VA ở tháng gần nhất? (dùng cho chấm màu nhấn ở nút "Bán hàng") */
function salesOweOpen(){var M=DATA&&DATA.sales&&DATA.sales.months;return !!(M&&M.length&&(+M[M.length-1].owe||0)>0)}

function salesCardHtml(){
  var S=DATA&&DATA.sales;
  if(!S||!S.months||!S.months.length)return(DATA&&DATA.__live)?salesEmptyHtml():"";
  var M=S.months,cur=M[M.length-1],prev=M.length>1?M[M.length-2]:null;
  var open=!!readStorage("wb_sales_open",false);
  var year=String(S.month||"").split("/")[1]||"";
  var yearTotal=M.reduce(function(a,m){return a+(+m.profit||0)},0);
  /* chữ phụ ngắn, 1 dòng */
  var owe=+cur.owe||0;
  var s1="VA ứng "+formatThousands(cur.advance)+" · thẻ VA "+formatThousands(cur.card)+(owe>0?"":" · đã chuyển đủ");
  var pc=prev?percentChange(cur.profit,prev.profit):null,margin=cur.rev?cur.profit/cur.rev*100:0;
  var s2=(pc===null?"":formatSignedPercent(pc,1)+" so T"+lastMonthNumber(prev.k)+" · ")+"tỷ lệ "+formatDecimalVi(margin,1)+"%";
  var s3="Dự kiến "+formatYen(cur.expected)+((+cur.pend>0)?" · còn "+cur.pend+" đơn chưa CK":" · đã thu hết");
  var rc=prev?percentChange(cur.rev,prev.rev):null;
  var smallRev=rc===null?"":formatSignedPercent(rc,1)+" so với "+prev.k;
  var smallOrders=prev?prev.k+": "+Math.round(+prev.orders||0)+" đơn":"";
  var adsPct=cur.rev?Math.round(cur.ads/cur.rev*100):0;
  return '<div class="sal">'
    +'<div class="sh1 lab mono"><span>Bán hàng · Tháng '+escapeHtml(S.month||"")+(S.closed===false?' · Chưa chốt':' · Đã chốt')+'</span>'+(S.sample?'<span>Số mẫu</span>':'')+'</div>'
    +'<div class="s3">'
      +'<div><div class="lab mono">Còn phải chuyển cho VA</div><div class="sbig acc">'+formatYen(owe)+'</div><div class="ssub">'+s1+'</div></div>'
      +'<div><div class="lab mono">Lãi thực</div><div class="sbig">'+formatYen(cur.profit)+'</div><div class="ssub">'+s2+'</div><div class="ssub">'+s3+'</div></div>'
    +'</div>'
    +'<div class="s4">'
      +'<div><div class="lab mono">Thu</div><b class="sn">'+formatYen(cur.rev)+'</b><div class="ssub">'+smallRev+'</div></div>'
      +'<div><div class="lab mono">Số đơn</div><b class="sn">'+Math.round(+cur.orders||0)+'</b><div class="ssub">'+smallOrders+'</div></div>'
      +'<div><div class="lab mono">Quảng cáo</div><b class="sn">'+formatYen(cur.ads)+'</b><div class="ssub">'+adsPct+'% thu</div></div>'
    +'</div>'
    +'<div class="sch"><div class="sh2"><span class="lab mono">Lãi thực theo tháng'+(year?' · '+escapeHtml(year):'')+'</span><b class="sy">Cả năm '+formatYen(yearTotal)+'</b></div>'
      +salesChartHtml(M)
      +(S.note?'<div class="snote ssub sn1">'+escapeHtml(S.note)+'</div>':'')
      +'<div class="snote ssub sn2">Số trên cột tính bằng nghìn ¥. Dưới cột là chênh lệch so với tháng trước.</div>'
    +'</div>'
    +salesOldMonthsHtml(M,open,S.fx)
  +'</div>';
}

/* nút "Xem các tháng cũ": nhớ trạng thái mở/đóng rồi dựng lại tab */
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("#sx");
  if(!b)return;
  writeStorage("wb_sales_open",!readStorage("wb_sales_open",false));
  renderOtherTabs();
});

/* 2 nút đầu tab Kiếm cơm (Việc chính | Bán hàng): nhớ nút đã chọn rồi dựng lại tab */
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest(".wsubs button");
  if(!b)return;
  writeStorage("wb_work_sub",b.dataset.ws==="sales"?"sales":"job");
  renderOtherTabs();
});
