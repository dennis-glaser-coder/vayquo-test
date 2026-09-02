(()=>{
'use strict';
const $=s=>document.querySelector(s);
const FOOTPRINTS={
  gym:{floor:[2.4,2.4],dumbbells:[1.2,.6],bench:[1.4,.55],rack:[1.25,1.35],bar:[2.2,.18],plates:[.65,.45],pullup:[1.0,.35],bands:[.4,.25],cable:[1.1,.9],cardio:[1.7,.75]},
  workshop:{safety:[.35,.25],driver:[.35,.25],bits:[.35,.25],measure:[.55,.25],circular:[.45,.35],clamps:[.55,.25],vac:[.55,.55],sander:[.35,.3],jigsaw:[.35,.3],bench:[1.8,.75],multi:[.35,.3],router:[.45,.4]},
  garage:{socket:[.65,.45],torque:[.55,.2],light:[.4,.25],stands:[.7,.45],jack:[1.15,.45],obd:[.35,.25],impact:[.4,.3],brake:[.55,.4],fluid:[.45,.4],cart:[.85,.5]},
  apartment:{bed:[2.0,1.4],bedding:[.55,.4],cook:[.65,.5],dishes:[.55,.4],clean:[.55,.4],storage:[1.2,.6],light:[.4,.4],table:[1.2,.75],tools:[.55,.35],sofa:[1.8,.9]}
};
const roomWidth=$('#roomWidth'),roomDepth=$('#roomDepth'),canvas=$('#roomCanvas'),studioCategory=$('#studioCategory'),studioRoom=$('#studioRoom'),studioUsage=$('#studioUsage'),studioFree=$('#studioFree');
let current={cat:null,name:'Raumvorschau',chosen:[]};
function dim(){return {w:Math.max(1.5,Math.min(30,Number(roomWidth?.value)||4.2)),d:Math.max(1.5,Math.min(30,Number(roomDepth?.value)||3.6))}}
function format(n){return new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(n)}
function updateLabels(used=0){const {w,d}=dim(),area=w*d;studioRoom.textContent=`${format(w)} × ${format(d)} m`;studioUsage.textContent=current.chosen.length?`${Math.min(100,Math.round(used/area*100))} %`:'–';studioFree.textContent=current.chosen.length?`${format(Math.max(0,area-used))} m²`:'–'}
function shortName(name){return String(name||'').replace(/Verstellbare |Grundausstattung|-/g,' ').trim().split(' ').slice(0,3).join(' ')}
function footprint(item){
  if(current.cat==='gym'){
    const live=window.VAYQUO_LIVE_HOMEGYM?.[item.id];
    if(live?.dimensions?.w&&live?.dimensions?.d)return {fp:[live.dimensions.w,live.dimensions.d],live:true,model:live.model};
  }
  return {fp:FOOTPRINTS[current.cat]?.[item.id]||[.55,.45],live:false,model:null};
}
function render(){if(!canvas)return;const {w,d}=dim();if(!current.cat||!current.chosen.length){canvas.innerHTML='<div class="empty-room"><span>Wähle ein Setup</span><small>Danach zeigt VAYQUO hier die geplante Stellfläche.</small></div>';updateLabels(0);return}
  canvas.innerHTML='';
  const items=current.chosen.map((x,i)=>{const f=footprint(x);return {...x,fw:f.fp[0],fd:f.fp[1],liveMeasure:f.live,liveModel:f.model,i}}).sort((a,b)=>(b.fw*b.fd)-(a.fw*a.fd));
  let x=.18,y=.18,rowH=0,used=0;
  for(const item of items){used+=item.fw*item.fd;const iw=Math.min(84,(item.fw/w)*100),ih=Math.min(70,(item.fd/d)*100);if(x+item.fw>w-.18){x=.18;y+=rowH+.18;rowH=0}if(y+item.fd>d-.18){x=Math.max(.18,(item.i%4)*(.55));y=Math.max(.18,d-.18-item.fd)}
    const el=document.createElement('div');el.className=`room-item${item.liveMeasure?' live-measure':''}`;el.style.left=`${(x/w)*100}%`;el.style.top=`${(y/d)*100}%`;el.style.width=`${Math.max(8,iw)}%`;el.style.height=`${Math.max(7,ih)}%`;el.innerHTML=`<b>${shortName(item.liveModel||item.name)}</b>${item.liveMeasure?'<small>Originalmaß</small>':''}`;el.title=`${item.liveModel||item.name} · ${item.liveMeasure?'verifiziertes Produktmaß':'Planmaß'} ${format(item.fw)} × ${format(item.fd)} m`;canvas.appendChild(el);x+=item.fw+.18;rowH=Math.max(rowH,item.fd)}
  updateLabels(used)
}
window.addEventListener('vayquo:category',e=>{current={cat:e.detail.cat,name:e.detail.name,chosen:[]};studioCategory.textContent=e.detail.name;render()});
window.addEventListener('vayquo:render',e=>{current={cat:e.detail.cat,name:e.detail.name,chosen:e.detail.chosen||[]};studioCategory.textContent=`${e.detail.name} · ${current.chosen.length} Bausteine`;render()});
roomWidth?.addEventListener('input',render);roomDepth?.addEventListener('input',render);
updateLabels(0);
})();