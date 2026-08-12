(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
let scheduled=false;
function ensureStyle(){
 if(q('#vayquo-flight-date-mobile-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-date-mobile-style';
 style.textContent=`
 @media(max-width:679px){
  .vayquo-departure-field{grid-column:1/-1!important;justify-self:stretch!important;align-self:stretch!important;width:auto!important;min-width:0!important;max-width:none!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;overflow:hidden}
  .vayquo-departure-input{display:block!important;width:100%!important;inline-size:100%!important;min-width:0!important;max-width:100%!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important}
 }
 `;
 document.head.appendChild(style);
}
function findDeparture(){
 const direct=q('#fDate,#fDepartureDate,#flightDate');
 if(direct)return direct;
 const cabin=q('#fCabin');
 const grid=cabin?.closest('.field')?.parentElement;
 const dates=grid?Array.from(grid.querySelectorAll('input[type="date"]')):[];
 return dates.find(el=>el.id!=='fReturnDate')||null;
}
function patch(){
 const input=findDeparture();if(!input)return;
 const field=input.closest('.field')||input.parentElement;if(!field)return;
 ensureStyle();
 field.classList.add('vayquo-departure-field');
 input.classList.add('vayquo-departure-input');
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{patch();}catch(e){console.warn('VAYQUO mobile date',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
