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
 let uiStarted=false;
 const loadUi=()=>{
  if(uiStarted)return;uiStarted=true;
  const ui=document.createElement('script');
  ui.src='v28-card-advisor.js?v=2806';
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
     let ctaStarted=false;
     const loadMoment=()=>{
      if(document.querySelector('script[data-vayquo-card-moment-v49]'))return;
      const moment=document.createElement('script');
      moment.src='v49-card-moment-entry.js?v=4901';
      moment.dataset.vayquoCardMomentV49='1';
      moment.async=false;
      moment.addEventListener('error',()=>console.warn('VAYQUO MOMENT konnte nicht geladen werden.'));
      document.head.appendChild(moment);
     };
     const loadCta=()=>{
      if(ctaStarted)return;ctaStarted=true;
      const cta=document.createElement('script');
      cta.src='v28-card-advisor-provider-cta.js?v=2804';
      cta.dataset.vayquoCardAdvisorProviderCtaV28='1';
      cta.async=false;
      cta.addEventListener('error',()=>console.warn('VAYQUO Kartenanbieter-Weiterleitung konnte nicht geladen werden.'));
      document.head.appendChild(cta);
      loadMoment();
     };
     const loadTierContext=()=>{
      const tier=document.createElement('script');
      tier.src='v43-card-tier-context.js?v=4301';
      tier.dataset.vayquoCardTierContextV43='1';
      tier.async=false;
      tier.addEventListener('load',loadCta,{once:true});
      tier.addEventListener('error',()=>{console.warn('VAYQUO Karten-Gebührenstufen-Erklärung konnte nicht geladen werden.');loadCta();},{once:true});
      document.head.appendChild(tier);
     };
     const ecosystem=document.createElement('script');
     ecosystem.src='v42-card-ecosystem-context.js?v=4201';
     ecosystem.dataset.vayquoCardEcosystemContextV42='1';
     ecosystem.async=false;
     ecosystem.addEventListener('load',loadTierContext,{once:true});
     ecosystem.addEventListener('error',()=>{console.warn('VAYQUO Karten-Ökosystem-Erklärung konnte nicht geladen werden.');loadTierContext();},{once:true});
     document.head.appendChild(ecosystem);
    });
    document.head.appendChild(abroad);
   });
   document.head.appendChild(unsure);
  });
  document.head.appendChild(ui);
 };
 const loadTierPolicy=()=>{
  const tierPolicy=document.createElement('script');
  tierPolicy.src='v43-card-tier-policy.js?v=4301';
  tierPolicy.dataset.vayquoCardTierPolicyV43='1';
  tierPolicy.async=false;
  tierPolicy.addEventListener('load',loadUi,{once:true});
  tierPolicy.addEventListener('error',()=>{console.warn('VAYQUO Karten-Gebührenstufen-Policy konnte nicht geladen werden.');loadUi();},{once:true});
  document.head.appendChild(tierPolicy);
 };
 const policy=document.createElement('script');
 policy.src='v42-card-ecosystem-policy.js?v=4201';
 policy.dataset.vayquoCardEcosystemPolicyV42='1';
 policy.async=false;
 policy.addEventListener('load',loadTierPolicy,{once:true});
 policy.addEventListener('error',()=>{console.warn('VAYQUO Karten-Ökosystem-Policy konnte nicht geladen werden.');loadTierPolicy();},{once:true});
 document.head.appendChild(policy);
});
document.head.appendChild(engine);
})();
