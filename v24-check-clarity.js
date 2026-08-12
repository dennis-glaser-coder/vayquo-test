(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

function compareBlock(){
  const cash=q('#fCash');
  if(!cash)return null;
  let node=cash.parentElement;
  for(let i=0;i<8&&node;i++,node=node.parentElement){
    if(q('#fFees',node)&&q('#fAward',node)&&q('#fMin',node))return node;
  }
  return cash.closest('section,.card,.panel,form')||cash.parentElement;
}

function setLabel(id,value){
  const input=q('#'+id);const field=input?.closest('.field');const label=q('label',field);
  if(!label)return;
  const info=q('.v24s2-info',label);
  Array.from(label.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
  label.insertBefore(document.createTextNode(value+' '),info||label.firstChild);
}

function patchTransferClarity(){
  qa('button,a,[role="button"]').filter(el=>/^Membership Rewards prüfen$/i.test(text(el))).forEach(el=>el.textContent='Transferwerte ansehen');

  const heading=qa('h1,h2,h3').find(el=>/^(Deine Punkte bei Partnern|Transferwerte deiner Membership Rewards)$/i.test(text(el)));
  if(!heading)return;
  if(text(heading)!=='Transferwerte deiner Membership Rewards')heading.textContent='Transferwerte deiner Membership Rewards';

  let root=heading.closest('section,.card,.panel,[class*="card"],[class*="panel"]');
  if(!root)root=heading.parentElement?.parentElement||heading.parentElement;
  const intro=root?qa('p',root).find(el=>/Reine Umrechnung|Live-Verfügbarkeit|Transfer sinnvoll/i.test(text(el))):null;
  if(intro){
    const copy='Reine Umrechnung: So viele Partnerpunkte entstehen aus deinem aktuellen MR-Stand. Die Reihenfolge ist keine Rangliste und keine Empfehlung.';
    if(text(intro)!==copy)intro.textContent=copy;
  }
}

function patch(){
  patchTransferClarity();
  const block=compareBlock();if(!block)return;

  const heading=qa('h1,h2,h3,strong',block).find(el=>/^Cash oder Punkte\?$/i.test(text(el)));
  if(heading)heading.textContent='Lohnt sich die Buchung mit Punkten?';

  const intro=qa('p',block).find(el=>/Cashpreis|konkreten Fall|Membership-Rewards-Punkten/i.test(text(el)));
  if(intro)intro.textContent='VAYQUO vergleicht für diesen Flug: Punkte einsetzen oder lieber bar zahlen.';

  setLabel('fCash','Preis bei Barzahlung');
  setLabel('fFees','Zuzahlung bei Punktebuchung');
  setLabel('fAward','Benötigte Punkte oder Meilen');
  setLabel('fMin','Mindestwert pro Punkt');

  qa('*',block).filter(el=>el.children.length===0&&/^Cent pro Punkt$/i.test(text(el))).forEach(el=>el.textContent='Standard: 1 Cent pro Punkt');

  const compare=qa('button',block).find(el=>/^Vergleichen$/i.test(text(el)));
  if(compare)compare.textContent='Jetzt prüfen';
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{patch();}catch(e){console.warn('VAYQUO check clarity',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
