(()=>{
'use strict';

const KEY='vayquo:offerDraft';
const IDS=['v24os-currency','v24os-cash','v24os-award','v24os-fees'];
let restoring=false;

function q(s,r=document){return r.querySelector(s);}
function read(){try{const d=JSON.parse(sessionStorage.getItem(KEY)||'null');return d&&d.active&&d.values&&typeof d.values==='object'?d:null;}catch{return null;}}
function write(d){try{sessionStorage.setItem(KEY,JSON.stringify(d));}catch{}}
function clear(){try{sessionStorage.removeItem(KEY);}catch{}}
function snapshot(calculated){
 const current=read()||{active:true,values:{},calculated:false};
 for(const id of IDS){const el=document.getElementById(id);if(el)current.values[id]=String(el.value??'');}
 current.active=true;if(typeof calculated==='boolean')current.calculated=calculated;write(current);
}
function waitFor(fn,timeout=1800){return new Promise(resolve=>{const start=Date.now();const tick=()=>{const v=fn();if(v)return resolve(v);if(Date.now()-start>timeout)return resolve(null);setTimeout(tick,30);};tick();});}
async function openOffer(){
 const existing=q('#v24os-cash');if(existing)return true;
 const intent=await waitFor(()=>q('[data-v24ctx="offer"]')||q('[data-v24os-offer]'));if(!intent)return false;
 intent.click();
 return !!(await waitFor(()=>q('#v24os-cash')));
}
async function restore(){
 const d=read();if(!d||restoring)return;restoring=true;
 try{
  if(!(await openOffer()))return;
  for(const id of IDS){
   const el=document.getElementById(id);if(!el||!Object.prototype.hasOwnProperty.call(d.values,id))continue;
   el.value=d.values[id];el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(d.calculated){const calc=q('[data-v24os-calc]');if(calc)calc.click();}
 }finally{restoring=false;}
}

document.addEventListener('input',ev=>{if(IDS.includes(ev.target?.id))snapshot(false);},true);
document.addEventListener('change',ev=>{if(IDS.includes(ev.target?.id))snapshot(false);},true);
document.addEventListener('click',ev=>{
 if(ev.target?.closest?.('[data-v24os-calc]')){snapshot(true);return;}
 if(ev.target?.closest?.('[data-v24os-back],.v24ctx-return')){
  if(q('#v24os-cash'))clear();
 }
},true);

function restoreOnLoad(){if(read())setTimeout(()=>void restore(),260);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreOnLoad,{once:true});else restoreOnLoad();
})();
