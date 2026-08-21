(()=>{
'use strict';
if(document.querySelector('script[data-vayquo-card-advisor-v26]'))return;
const script=document.createElement('script');
script.src='v26-card-advisor.js?v=2601';
script.dataset.vayquoCardAdvisorV26='1';
script.async=false;
script.addEventListener('error',()=>console.warn('VAYQUO card advisor V26 konnte nicht geladen werden.'));
document.head.appendChild(script);
})();
