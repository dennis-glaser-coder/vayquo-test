(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const AMEX_LOUNGE_BASE='https://www.americanexpress.com/de-de/travel/lounges/the-platinum-card/';

function openAmexAirport(code){
 const url=AMEX_LOUNGE_BASE+encodeURIComponent(code);
 try{window.open(url,'_blank','noopener,noreferrer');}
 catch{location.href=url;}
}

function enhanceLounge(){
 const input=q('#v24-lounge-airport');
 const button=q('#v24-lounge-check');
 if(!input||!button||button.dataset.v24LoungeDirect)return;
 button.dataset.v24LoungeDirect='1';

 const terminal=q('#v24-lounge-terminal');
 const terminalField=terminal?.closest('label,.v24-field,.field');
 if(terminalField)terminalField.hidden=true;
 const airportField=input.closest('label,.v24-field,.field');
 if(airportField)airportField.style.gridColumn='1 / -1';

 const dialog=input.closest('[role="dialog"],section');
 const intro=dialog?.querySelector('p');
 if(intro&&/terminal|flughafen/i.test(intro.textContent||'')){
  intro.textContent='Wähle deinen Flughafen einmal aus. VAYQUO öffnet anschließend direkt die passenden Amex-Lounges für diesen Airport.';
 }
 button.textContent='Passende Lounges anzeigen →';

 button.addEventListener('click',ev=>{
  const code=(input.value||'').trim().toUpperCase();
  ev.preventDefault();
  ev.stopImmediatePropagation();
  if(!/^[A-Z]{3}$/.test(code)){
   input.click();
   return;
  }
  openAmexAirport(code);
 },true);
}

let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;enhanceLounge();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
