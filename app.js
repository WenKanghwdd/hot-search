const PLATFORM_NAMES = {weibo:"微博",douyin:"抖音",baidu:"百度",toutiao:"今日头条",bilibili:"B站",zhihu:"知乎"};
let currentPeriod="day", currentPlatform="weibo", allData=null;

function formatTime(t) {
  if(!t) return "";
  let d=new Date(t);
  return (d.getMonth()+1)+"月"+d.getDate()+"日 "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
}

async function loadData() {
  document.getElementById("loading").style.display="block";
  document.getElementById("hotList").innerHTML="";
  try {
    let r=await fetch("data/latest.json");
    if(!r.ok) throw Error("no data");
    allData=await r.json();
    document.getElementById("updateTime").textContent="更新时间："+formatTime(allData.update_time);
    render();
  } catch(e) {
    document.getElementById("loading").style.display="none";
    document.getElementById("hotList").innerHTML='<div class="empty-state"><div style="font-size:48px">📡</div><div style="font-size:14px;margin-top:12px">数据采集中，请稍后再来</div></div>';
  }
}

function render() {
  let el=document.getElementById("loading"), list=document.getElementById("hotList");
  if(!allData||!allData.platforms) {el.textContent="暂无数据";return;}
  el.style.display="none";
  let items=allData.platforms[currentPlatform];
  if(!items||items.length===0) {
    list.innerHTML='<div class="empty-state"><div style="font-size:48px">🔍</div><div style="font-size:14px;margin-top:12px">该平台暂无数据</div></div>';
    return;
  }
  list.innerHTML=items.map(function(item,i){
    let r=item.rank||i+1, rc=r===1?"top-1":r===2?"top-2":r===3?"top-3":"";
    let heat=item.hot||"", link=item.url||"#";
    return '<div class="hot-item"><div class="hot-rank '+rc+'">'+r+'</div><div class="hot-content"><div class="hot-title"><a href="'+link+'" target="_blank" rel="noopener">'+item.title+'</a></div><div class="hot-meta">'+({day:"今日",week:"本周",month:"本月"}[currentPeriod])+'热搜</div></div><div class="hot-heat">'+heat+'</div></div>';
  }).join("");
}

document.querySelectorAll(".period-btn").forEach(function(b){b.addEventListener("click",function(){
  document.querySelectorAll(".period-btn").forEach(function(x){x.classList.remove("active")});
  this.classList.add("active");currentPeriod=this.dataset.period;render();
})});
document.querySelectorAll(".platform-btn").forEach(function(b){b.addEventListener("click",function(){
  document.querySelectorAll(".platform-btn").forEach(function(x){x.classList.remove("active")});
  this.classList.add("active");currentPlatform=this.dataset.platform;render();
})});
loadData();
setInterval(loadData,300000);
