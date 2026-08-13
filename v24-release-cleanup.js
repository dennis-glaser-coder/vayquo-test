(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let scheduled=false;

function ensureStyle(){
 if(q('#v24-release-cleanup-style'))return;
 const style=document.createElement('style');
 style.id='v24-release-cleanup-style';
 style.textContent=`
  #vayquo-flight-results::before{display:none!important;content:none!important}
 `;
 document.head.appendChild(style);
}

function cleanFlightStatus(){
 const status=q('#vayquo-flight-live-status');
 if(!status)return;
 const raw=text(status);
 if(/Testumgebung|Sandbox-Flüge|Sandbox|Testdaten/i.test(raw)){
  status.textContent='Die automatische Live-Flugsuche ist derzeit noch nicht verfügbar. Du kannst unten ein konkretes Angebot selbst vergleichen.';
 }
}

function safeOptimizerUnavailable(box){
 if(!box||box.dataset.v24ReleaseSafe==='1')return;
 box.dataset.v24ReleaseSafe='1';
 box.innerHTML='<div class="vqo-kicker">VAYQUO PUNKTE-CHECK</div><h3 class="vqo-title">Punktevergleich derzeit nicht verfügbar</h3><p class="vqo-copy">Für diese Suche liegen noch keine verlässlichen Live-Awarddaten vor. VAYQUO gibt deshalb bewusst keine Punkte- oder Transferempfehlung aus.</p>';
 try{
  window.VAYQUO_FLIGHT_OPTIMIZER={mode:'unavailable',liveData:false,bookable:false};
 }catch{}
}

function cleanOptimizer(){
 const box=q('#vayquo-flight-optimizer');
 if(!box)return;
 const raw=text(box);
 if(/TEST-OPTIMIZER|TESTDATEN|Testdaten|Cash-Testpreis|künstliche|Award-Testangebote|Testrechnung|im Test|Testprogramm/i.test(raw)){
  safeOptimizerUnavailable(box);
 }
}

function apply(){
 ensureStyle();
 cleanFlightStatus();
 cleanOptimizer();
}

function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  try{apply();}catch(e){console.warn('VAYQUO release cleanup',e);}
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('vayquo:flight-live',()=>setTimeout(schedule,0));
window.addEventListener('vayquo:flight-optimizer',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
