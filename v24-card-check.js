(()=>{
'use strict';

const MARKER_ID='v28-card-advisor-start-marker';
function syncStartMarker(){
 const app=document.querySelector('#app');
 if(!app)return;
 const startNav=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');
 const active=!!startNav&&(startNav.classList.contains('active')||startNav.getAttribute('aria-current')==='page');
 let marker=document.getElementById(MARKER_ID);
 if(active&&!marker){
  marker=document.createElement('span');
  marker.id=MARKER_ID;
  marker.textContent='Deine Programme';
  marker.hidden=true;
  marker.setAttribute('aria-hidden','true');
  app.appendChild(marker);
 }else if(!active&&marker){
  marker.remove();
 }
}

syncStartMarker();
new MutationObserver(syncStartMarker).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-current']});

if(document.querySelector('script[data-vayquo-card-advisor-v28]'))return;
const engine=document.createElement('script');
engine.src='v28-card-advisor-engine.js?v=2803';
engine.dataset.vayquoCardAdvisorEngineV28='1';
engine.async=false;
engine.addEventListener('error',()=>console.warn('VAYQUO card advisor engine V28 konnte nicht geladen werden.'));
engine.addEventListener('load',()=>{
 const ui=document.createElement('script');
 ui.src='v28-card-advisor.js?v=2805';
 ui.dataset.vayquoCardAdvisorV28='1';
 ui.async=false;
 ui.addEventListener('error',()=>console.warn('VAYQUO card advisor V28 konnte nicht geladen werden.'));
 ui.addEventListener('load',()=>{
  const unsure=document.createElement('script');
  unsure.src='v31-card-advisor-unsure-ux.js?v=3101';
  unsure.dataset.vayquoCardAdvisorUnsureUxV31='1';
  unsure.async=false;
  unsure.addEventListener('error',()=>console.warn('VAYQUO Kartenberater Unsicher-Pfad konnte nicht geladen werden.'));
  unsure.addEventListener('load',()=>{
   const abroad=document.createElement('script');
   abroad.src='v28-card-advisor-abroad-ux.js?v=2802';
   abroad.dataset.vayquoCardAdvisorAbroadUxV28='1';
   abroad.async=false;
   abroad.addEventListener('error',()=>console.warn('VAYQUO Ausland-Kartenlogik konnte nicht geladen werden.'));
   abroad.addEventListener('load',()=>{
    const cta=document.createElement('script');
    cta.src='v28-card-advisor-provider-cta.js?v=2803';
    cta.dataset.vayquoCardAdvisorProviderCtaV28='1';
    cta.async=false;
    cta.addEventListener('error',()=>console.warn('VAYQUO Kartenanbieter-Weiterleitung konnte nicht geladen werden.'));
    document.head.appendChild(cta);
   });
   document.head.appendChild(abroad);
  });
  document.head.appendChild(unsure);
 });
 document.head.appendChild(ui);
});
document.head.appendChild(engine);
})();
