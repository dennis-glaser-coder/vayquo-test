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
  if(chip&&chip.textContent.trim()!=='Membership Rewards')chip.textContent='Membership Rewards';
}

function patchBenefitsSetup(){
  qa('.v24s35-chip').forEach(chip=>{
    const b=q('b',chip);
    if(!b)return;
    const t=(chip.textContent||'').replace(/\s+/g,' ').trim();
    if(programs().mr&&(b.textContent.trim()==='AX'||/Membership Rewards|Platinum Card|Gold Card|Blue Card|American Express Card|BMW/i.test(t))){
      b.textContent='MR';
      const nodes=Array.from(chip.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE);
      nodes.forEach(n=>n.remove());
      chip.appendChild(document.createTextNode('Membership Rewards'));
    }
  });
}

function patchManager(){
  const mrCheck=q('[data-v24s35-prog="mr"]');
  if(!mrCheck)return;
  const item=mrCheck.closest('label');
  if(item){
    const mono=q('.mi',item);if(mono)mono.textContent='MR';
    const strong=q('strong',item);if(strong)strong.textContent='Membership Rewards';
    const copy=qa('span',item).find(el=>el.children.length===0&&/Punkte und Kartenvorteile/i.test(el.textContent||''));
    if(copy)copy.textContent='Punkte, Transfers und deine Amex-Karte';
  }
  const select=q('#v24s35-card');
  if(select){
    ['payback','dmpayback'].forEach(value=>q(`option[value="${value}"]`,select)?.remove());
    const field=select.closest('.field');
    const label=q('label',field);
    if(label)label.textContent='Welche American Express Karte nutzt du mit Membership Rewards?';
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
