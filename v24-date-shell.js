(()=>{
'use strict';
// VAYQUO stable iOS date shell v2402
const q=(s,r=document)=>r.querySelector(s);
let scheduled=false;

function ensureStyle(){
 if(q('#v24-date-shell-style'))return;
 const style=document.createElement('style');
 style.id='v24-date-shell-style';
 style.textContent=`
 @media(max-width:679px){
  .v24premium-date-field{overflow:visible!important}
  .v24-date-shell{position:relative!important;width:100%!important;min-width:0!important;max-width:100%!important;height:var(--vqp-control,52px)!important;min-height:var(--vqp-control,52px)!important;box-sizing:border-box!important;border:1px solid rgba(21,35,32,.11)!important;border-radius:15px!important;background:#fff!important;box-shadow:0 1px 0 rgba(255,255,255,.8) inset!important;overflow:hidden!important}
  .v24-date-shell-display{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;padding:0 14px!important;box-sizing:border-box!important;color:var(--vqp-ink,#17211f)!important;font-size:16px!important;font-weight:600!important;line-height:1.2!important;white-space:nowrap!important;pointer-events:none!important;z-index:1!important}
  .v24-date-shell>input[type="date"]{position:absolute!important;inset:0!important;z-index:2!important;width:100%!important;height:100%!important;min-width:0!important;max-width:100%!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:15px!important;background:transparent!important;box-shadow:none!important;opacity:.001!important;color:transparent!important;-webkit-text-fill-color:transparent!important;box-sizing:border-box!important;cursor:pointer!important}
  .v24-date-shell:focus-within{border-color:rgba(23,58,53,.34)!important;box-shadow:0 0 0 4px rgba(23,58,53,.06)!important}
 }
 `;
 document.head.appendChild(style);
}

function findDate(){
 const direct=q('#fDate,#fDepartureDate,#flightDate');
 if(direct?.type==='date')return direct;
 const cabin=q('#fCabin');
 const grid=cabin?.closest('.field')?.parentElement;
 const dates=grid?Array.from(grid.querySelectorAll('input[type="date"]')):[];
 return dates.find(el=>el.id!=='fReturnDate')||dates[0]||null;
}

function formatDate(value){
 const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?`${m[3]}.${m[2]}.${m[1]}`:'Datum wählen';
}

function install(){
 const input=findDate();
 if(!input)return;
 const field=input.closest('.field')||input.parentElement;
 if(!field)return;
 field.classList.add('v24premium-date-field');
 ensureStyle();
 let shell=input.closest('.v24-date-shell');
 if(!shell){
  shell=document.createElement('div');
  shell.className='v24-date-shell';
  const display=document.createElement('span');
  display.className='v24-date-shell-display';
  display.setAttribute('aria-hidden','true');
  input.parentNode.insertBefore(shell,input);
  shell.appendChild(display);
  shell.appendChild(input);
  const sync=()=>{display.textContent=formatDate(input.value);};
  input.addEventListener('input',sync);
  input.addEventListener('change',sync);
  sync();
 }else{
  const display=q('.v24-date-shell-display',shell);
  if(display)display.textContent=formatDate(input.value);
 }
}

function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;try{install();}catch(e){console.warn('VAYQUO date shell',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('change',schedule);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();

(()=>{
 if(document.querySelector('script[data-v36-anonymous-analytics]'))return;
 const script=document.createElement('script');
 script.src='v36-anonymous-analytics.js?v=3601';
 script.dataset.v36AnonymousAnalytics='1';
 script.async=true;
 script.addEventListener('error',()=>console.warn('VAYQUO anonymous analytics konnte nicht geladen werden.'));
 document.head.appendChild(script);
})();
