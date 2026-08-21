(()=>{
'use strict';

const q=(selector,root=document)=>root.querySelector(selector);
const RELEASE_STATE=Object.freeze({
  mode:'coming_soon',
  live:false,
  testData:false,
  public:true,
  providerConnected:false
});

function ensureStyle(){
  if(q('#vayquo-award-coming-soon-style'))return;
  const style=document.createElement('style');
  style.id='vayquo-award-coming-soon-style';
  style.textContent=`
    #vayquo-flight-optimizer{margin:14px 0 12px;border:1px solid rgba(120,126,124,.18);background:rgba(255,255,255,.6);border-radius:20px;padding:16px;box-sizing:border-box}
    .vqa-kicker{font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--muted,#879391)}
    .vqa-title{margin:5px 0 6px;font-size:19px;line-height:1.22;letter-spacing:-.02em}
    .vqa-copy{margin:0;font-size:12px;line-height:1.55;color:var(--muted,#879391)}
    .vqa-badge{display:inline-flex;margin-top:11px;padding:5px 8px;border-radius:999px;background:rgba(120,126,124,.08);font-size:10px;font-weight:800;color:var(--muted,#667674)}
    .vqa-foot{margin-top:12px;padding-top:11px;border-top:1px solid rgba(120,126,124,.12);font-size:10px;line-height:1.5;color:var(--muted,#879391)}
  `;
  document.head.appendChild(style);
}

function mountBox(){
  ensureStyle();
  let box=q('#vayquo-flight-optimizer');
  if(box)return box;
  box=document.createElement('section');
  box.id='vayquo-flight-optimizer';
  box.dataset.vayquoAwardRelease='coming-soon';
  const results=q('#vayquo-flight-results');
  const status=q('#vayquo-flight-live-status');
  if(results?.parentElement)results.insertAdjacentElement('beforebegin',box);
  else if(status?.parentElement)status.insertAdjacentElement('beforebegin',box);
  else return null;
  return box;
}

function syncVisibility(){
  const box=q('#vayquo-flight-optimizer');
  if(!box)return;
  const manualMode=q('#vayquo-flight-search-controls')?.hidden===true;
  box.hidden=manualMode;
}

function expose(extra={}){
  const detail={...RELEASE_STATE,...extra};
  window.VAYQUO_AWARD_RELEASE=detail;
  window.VAYQUO_AWARD_SEARCH=detail;
  document.documentElement.dataset.vayquoAwardSearch='coming-soon';
  try{window.dispatchEvent(new CustomEvent('vayquo:award-release',{detail}));}catch{}
}

function renderComingSoon(detail={}){
  const box=mountBox();
  if(!box)return;
  box.innerHTML=`<div class="vqa-kicker">LIVE-PRÄMIENFLÜGE</div><h3 class="vqa-title">Echte Prämienflug-Verfügbarkeiten kommen bald</h3><p class="vqa-copy">VAYQUO bereitet die Live-Suche für Miles &amp; More, Flying Blue und Qatar Privilege Club vor. Bis eine kommerziell nutzbare Live-Datenquelle angebunden ist, zeigen wir bewusst keine simulierten Verfügbarkeiten oder erfundenen Meilenpreise.</p><span class="vqa-badge">KOMMT BALD · KEINE TESTDATEN</span><div class="vqa-foot">Deine aktuelle Flugsuche bleibt davon unberührt. Eine Punkte- oder Transferempfehlung wird erst freigeschaltet, wenn echte Award-Verfügbarkeit, benötigte Meilen sowie Steuern und Gebühren live verifiziert werden können.</div>`;
  syncVisibility();
  expose({query:detail?.query||null});
}

function clear(){
  q('#vayquo-flight-optimizer')?.remove();
  expose({query:null});
}

window.addEventListener('vayquo:flight-live',event=>{
  const detail=event.detail||{};
  if(detail.status==='loading'){
    clear();
    return;
  }
  if(detail.status==='success'||detail.status==='sandbox')renderComingSoon(detail);
});

document.addEventListener('click',event=>{
  if(event.target.closest?.('#vayquo-manual-flight-toggle'))setTimeout(syncVisibility,0);
});

new MutationObserver(syncVisibility).observe(document.documentElement,{
  subtree:true,
  childList:true,
  attributes:true,
  attributeFilter:['hidden']
});

expose({query:null});
})();
