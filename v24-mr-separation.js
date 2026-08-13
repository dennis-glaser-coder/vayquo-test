(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PAYBACK_AMEX=new Set(['payback','dmpayback']);
const PAYBACK_CARD_NAMES={
  none:'Keine PAYBACK American Express Karte',
  payback:'PAYBACK American Express Karte',
  dmpayback:'dm PAYBACK American Express Karte'
};

function card(){
  try{return String(state?.card||'none');}catch{return 'none';}
}
function programs(){
  try{return state?.programs||{};}catch{return {};}
}
function paybackCard(){
  try{
    const value=String(state?.paybackCard||'none');
    if(PAYBACK_AMEX.has(value))return value;
    const legacy=card();
    return PAYBACK_AMEX.has(legacy)?legacy:'none';
  }catch{return 'none';}
}
function ownsPaybackAmex(){return PAYBACK_AMEX.has(paybackCard());}
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}

function migrateLegacy(){
  try{
    const legacy=card();
    if(!PAYBACK_AMEX.has(legacy))return false;
    state.paybackCard=legacy;
    state.card='none';
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
    const b=q('b',chip);
    if(!b)return;
    const t=(chip.textContent||'').replace(/\s+/g,' ').trim();
    if(programs().mr&&(b.textContent.trim()==='AX'||/Membership Rewards|Platinum Card|Gold Card|Blue Card|American Express Card|BMW/i.test(t))){
      setText(b,'MR');
      Array.from(chip.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
      chip.appendChild(document.createTextNode('Membership Rewards'));
      chip.dataset.v24MrSeparated='1';
      return;
    }
    if(programs().pb&&b.textContent.trim()==='PB'){
      const suffix=paybackCard()==='payback'?' · PAYBACK Amex':paybackCard()==='dmpayback'?' · dm PAYBACK Amex':'';
      Array.from(chip.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
      chip.appendChild(document.createTextNode(`PAYBACK${suffix}`));
      chip.dataset.v24PaybackCard='1';
    }
  });
}

function ensurePaybackCardField(){
  const pbCheck=q('[data-v24s35-prog="pb"]');
  if(!pbCheck)return;
  let field=q('#v24mr-payback-card-wrap');
  if(!field){
    field=document.createElement('div');
    field.className='field';
    field.id='v24mr-payback-card-wrap';
    field.innerHTML=`<label for="v24mr-payback-card">Welche PAYBACK American Express Karte nutzt du?</label><select class="select" id="v24mr-payback-card"><option value="none">${PAYBACK_CARD_NAMES.none}</option><option value="payback">${PAYBACK_CARD_NAMES.payback}</option><option value="dmpayback">${PAYBACK_CARD_NAMES.dmpayback}</option></select>`;
    const amex=q('#v24s35-amex-wrap');
    const mm=q('#v24s35-mm-wrap');
    const save=q('#v24s35-save');
    if(amex?.parentElement)amex.insertAdjacentElement('afterend',field);
    else if(mm?.parentElement)mm.insertAdjacentElement('beforebegin',field);
    else save?.insertAdjacentElement('beforebegin',field);
  }
  const select=q('#v24mr-payback-card',field);
  if(select&&select.value!==paybackCard())select.value=paybackCard();
  field.hidden=!pbCheck.checked;
  if(pbCheck.dataset.v24PaybackCardBound!=='1'){
    pbCheck.dataset.v24PaybackCardBound='1';
    pbCheck.addEventListener('change',()=>{field.hidden=!pbCheck.checked;});
  }
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
  ensurePaybackCardField();
}

function storePaybackCardBeforeSave(ev){
  const save=ev.target.closest?.('#v24s35-save');
  if(!save)return;
  const pbCheck=q('[data-v24s35-prog="pb"]');
  const select=q('#v24mr-payback-card');
  if(!pbCheck||!select)return;
  try{
    const next=pbCheck.checked&&PAYBACK_AMEX.has(select.value)?select.value:'none';
    state.paybackCard=next;
    if(PAYBACK_AMEX.has(state.card))state.card='none';
  }catch{}
}

function patchPaybackBenefit(){
  if(!programs().pb||!ownsPaybackAmex())return;
  const block=q('.v24s35-source-card[data-source="payback"]');
  const facts=q('.v24s35-facts',block);
  if(!facts||q('[data-v24-payback-card-fact]',facts))return;
  const span=document.createElement('span');
  span.dataset.v24PaybackCardFact='1';
  span.textContent=paybackCard()==='dmpayback'?'dm PAYBACK Amex hinterlegt':'PAYBACK Amex hinterlegt';
  facts.appendChild(span);
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
  patchPaybackBenefit();
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
document.addEventListener('click',storePaybackCardBeforeSave,true);
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
