(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PAYBACK_AMEX=new Set(['payback','dmpayback']);

function card(){
  try{return String(state?.card||'none');}catch{return 'none';}
}
function programs(){
  try{return state?.programs||{};}catch{return {};}
}
function ownsPaybackAmex(){return PAYBACK_AMEX.has(card());}
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}

function migrateLegacy(){
  try{
    if(!programs().mr||!ownsPaybackAmex())return false;
    state.programs={...programs(),mr:false,pb:true};
    if(typeof save==='function')save();
    return true;
  }catch{return false;}
}

function patchStartChip(){
  const chip=q('[data-v24sp-program="mr"]');
  setText(chip,'Membership Rewards');
}

function patchBenefitsSetup(){
  qa('.v24s35-chip').forEach(chip=>{
    if(chip.dataset.v24MrSeparated==='1')return;
    const b=q('b',chip);
    if(!b)return;
    const t=(chip.textContent||'').replace(/\s+/g,' ').trim();
    if(!programs().mr||!(b.textContent.trim()==='AX'||/Membership Rewards|Platinum Card|Gold Card|Blue Card|American Express Card|BMW/i.test(t)))return;
    setText(b,'MR');
    Array.from(chip.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
    chip.appendChild(document.createTextNode('Membership Rewards'));
    chip.dataset.v24MrSeparated='1';
  });
}

function patchManager(){
  const mrCheck=q('[data-v24s35-prog="mr"]');
  if(!mrCheck)return;
  const item=mrCheck.closest('label');
  if(item){
    setText(q('.mi',item),'MR');
    setText(q('strong',item),'Membership Rewards');
    const copy=qa('span',item).find(el=>el.children.length===0&&/Punkte und Kartenvorteile/i.test(el.textContent||''));
    setText(copy,'Punkte, Transfers und deine Amex-Karte');
  }
  const select=q('#v24s35-card');
  if(select){
    ['payback','dmpayback'].forEach(value=>q(`option[value="${value}"]`,select)?.remove());
    const field=select.closest('.field');
    setText(q('label',field),'Welche American Express Karte nutzt du mit Membership Rewards?');
  }
}

function suppressOwnCardRecommendation(){
  if(!ownsPaybackAmex()||!programs().pb)return;
  const btn=q('[data-v24s35-reco="payback-amex"]');
  btn?.closest('.v24s35-section')?.remove();
}

function apply(){
  const migrated=migrateLegacy();
  patchStartChip();
  patchBenefitsSetup();
  patchManager();
  suppressOwnCardRecommendation();
  if(migrated&&typeof render==='function'){
    try{render();}catch{}
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO MR separation',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
