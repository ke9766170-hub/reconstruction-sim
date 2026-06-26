// 简易仿真原型逻辑
let map, markersLayer;
const neighborhoods = [];
const results = [];
let simInterval = null;
let simTime = 0;
const MAX_TIME = 30;

function initMap(){
  map = L.map('map').setView([31.23,121.47], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  for(let i=0;i<12;i++){
    const lat = 31.05 + Math.random()*0.36;
    const lng = 121.25 + Math.random()*0.5;
    const pop = Math.round(200 + Math.random()*1500);
    const damage = +(0.3 + Math.random()*0.7).toFixed(2);
    const vulnerable = Math.random()<0.2;
    neighborhoods.push({id:i,lat,lng,pop,damage,vulnerable,reconstructed:0});
  }
  drawNeighborhoods();
}

function drawNeighborhoods(){
  markersLayer.clearLayers();
  neighborhoods.forEach(n=>{
    const color = getColorByDamage(n.damage*(1-n.reconstructed));
    const circle = L.circle([n.lat,n.lng],{radius:200,fillColor:color,color:'#333',weight:1,fillOpacity:0.6})
      .bindPopup(`小区 ${n.id}<br>人口: ${n.pop}<br>受损: ${(n.damage*100).toFixed(0)}%<br>已重建: ${(n.reconstructed*100).toFixed(0)}%`);
    markersLayer.addLayer(circle);
  })
}

function getColorByDamage(d){
  if(d>0.75) return '#b30000';
  if(d>0.5) return '#ff6600';
  if(d>0.25) return '#ffcc00';
  return '#66cc66';
}

function stepSimulation(){
  const resource = +document.getElementById('resource').value;
  const strategy = document.getElementById('strategy').value;
  const sortKey = (a,b)=>{
    if(strategy==='byPopulation') return b.pop - a.pop;
    if(strategy==='byDamage') return (b.damage*(1-b.reconstructed)) - (a.damage*(1-a.reconstructed));
    if(strategy==='byVulnerable') return (b.vulnerable?1:0) - (a.vulnerable?1:0);
    return 0;
  }
  const list = neighborhoods.slice().sort(sortKey);
  let remaining = resource;
  for(const n of list){
    if(remaining<=0) break;
    const assign = Math.min(1, remaining/5);
    const delta = 0.02 * assign;
    n.reconstructed = Math.min(1, n.reconstructed + delta);
    remaining -= assign;
  }
  neighborhoods.forEach(n=>{
    if(n.reconstructed<0.5){
      n.damage = Math.min(1, n.damage + 0.002);
    }
  })
  simTime++;
  recordMetrics();
  drawNeighborhoods();
  updateUI();
}

function recordMetrics(){
  const totalPop = neighborhoods.reduce((s,n)=>s+n.pop,0);
  const reconstructedPop = neighborhoods.reduce((s,n)=>s + n.pop * n.reconstructed,0);
  const reconstructPct = +(reconstructedPop/totalPop*100).toFixed(2);
  const riskIndex = +(neighborhoods.reduce((s,n)=>s + n.damage*(1-n.reconstructed),0)/neighborhoods.length).toFixed(3);
  results.push({time:simTime,reconstructPct,riskIndex});
}

function updateUI(){
  document.getElementById('timeLabel').textContent = simTime;
  document.getElementById('metricReconstruct').textContent = results.length? results[results.length-1].reconstructPct + '%':'0%';
  document.getElementById('metricRisk').textContent = results.length? results[results.length-1].riskIndex:'0';
  document.getElementById('timeSlider').value = simTime;
  if(window.myChart){
    const labels = results.map(r=>r.time);
    const ds1 = results.map(r=>r.reconstructPct);
    const ds2 = results.map(r=>r.riskIndex);
    window.myChart.data.labels = labels;
    window.myChart.data.datasets[0].data = ds1;
    window.myChart.data.datasets[1].data = ds2;
    window.myChart.update();
  }
}

function initChart(){
  const ctx = document.getElementById('chart').getContext('2d');
  window.myChart = new Chart(ctx,{type:'line',data:{labels:[],datasets:[{label:'重建覆盖率(%)',borderColor:'#0f4c81',backgroundColor:'rgba(15,76,129,0.1)',data:[]},{label:'风险指数',borderColor:'#b30000',backgroundColor:'rgba(179,0,0,0.1)',data:[]} ]},options:{interaction:{mode:'index'},scales:{y:{beginAtZero:true}}}});
}

function resetSimulation(){
  neighborhoods.length = 0;
  results.length = 0;
  simTime = 0;
  initMap();
  if(window.myChart){window.myChart.data.labels=[];window.myChart.data.datasets.forEach(ds=>ds.data=[]);window.myChart.update();}
}

function startAuto(){
  if(simInterval) return;
  simInterval = setInterval(()=>{
    if(simTime>=MAX_TIME){ pauseAuto(); return; }
    stepSimulation();
  },700);
}

function pauseAuto(){
  if(simInterval){ clearInterval(simInterval); simInterval=null; }
}

function downloadJSON(){
  const payload = {params:{resource:+document.getElementById('resource').value,strategy:document.getElementById('strategy').value},neighborhoods,results};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='scenario.json'; a.click(); URL.revokeObjectURL(url);
}

function exportCSV(){
  let csv = 'time,reconstructPct,riskIndex\n';
  results.forEach(r=>{csv += `${r.time},${r.reconstructPct},${r.riskIndex}\n`});
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='report.csv'; a.click(); URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded',()=>{
  initMap();
  initChart();
  document.getElementById('resource').addEventListener('input',e=>{document.getElementById('resVal').textContent = e.target.value});
  document.getElementById('btnStart').addEventListener('click',startAuto);
  document.getElementById('btnPause').addEventListener('click',pauseAuto);
  document.getElementById('btnReset').addEventListener('click',()=>{pauseAuto();resetSimulation();});
  document.getElementById('btnSave').addEventListener('click',downloadJSON);
  document.getElementById('btnExportCSV').addEventListener('click',exportCSV);
  document.getElementById('timeSlider').addEventListener('input',e=>{simTime=+e.target.value;document.getElementById('timeLabel').textContent=simTime});
  document.getElementById('preset1').addEventListener('click',()=>{document.getElementById('resource').value=8;document.getElementById('resVal').textContent=8;});
  document.getElementById('preset2').addEventListener('click',()=>{document.getElementById('resource').value=3;document.getElementById('resVal').textContent=3;});
});
