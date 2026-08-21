(()=>{
'use strict';

const MARKER_ID='v26-card-advisor-start-marker';
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

if(document.querySelector('script[data-vayquo-card-advisor-v26]'))return;
const script=document.createElement('script');
script.src='v26-card-advisor.js?v=2601';
script.dataset.vayquoCardAdvisorV26='1';
script.async=false;
script.addEventListener('error',()=>console.warn('VAYQUO card advisor V26 konnte nicht geladen werden.'));
document.head.appendChild(script);
})();
