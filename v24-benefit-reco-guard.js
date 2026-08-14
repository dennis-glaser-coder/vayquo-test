(()=>{
'use strict';

// Only hide card prompts that VAYQUO cannot yet justify from personal usage data.
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function benefitsViewActive(){
 const nav=q('#bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 const h=q('#app h1');
 return !!h&&h.textContent.trim()==='Vorteile';
}

function removeUnprovenCardRecommendations(){
 if(!benefitsViewActive())return;
 qa('#app .v24s35-reco').forEach(reco=>{
  const section=reco.closest('.v24s35-section');
  if(section&&/Mehr\s+für\s+dich/i.test(section.textContent||''))section.remove();
  else reco.remove();
 });
}

let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  try{removeUnprovenCardRecommendations();}catch(e){console.warn('VAYQUO benefit recommendation guard',e);}
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();