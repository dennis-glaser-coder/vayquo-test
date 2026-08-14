(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const decimal=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
const PROGRAMS={
 mr:{label:'Membership Rewards',unit:'Punkte',short:'MR'},
 pb:{label:'PAYBACK',unit:'Punkte',short:'PAYBACK'},
 mm:{label:'Miles & More',unit:'Meilen',short:'M&M'}
};
const META_KEY='vayquo:balanceMeta';

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}
function balance(id){return Math.max(0,Math.round(Number(safeState()?.balances?.[id])||0));}
function readMeta(){try{const v=JSON.parse(localStorage.getItem(META_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function known(id){return readMeta()[id]?.known===true||balance(id)>0;}
function ensureStyle(){
 if(q('#v24oc-style'))return;
 const style=document.createElement('style');
 style.id='v24oc-style';
 style.textContent=`
  .v24oc-context,.v24oc-why{margin-top:13px;padding:13px 14px;border:1px solid rgba(23,33,31,.08);border-radius:15px;background:rgba(255,255,255,.48)}
  .v24oc-context small,.v24oc-why small{display:block;font-size:8.5px;letter-spacing:.12em;font-weight:850;color:#7b7469}
  .v24oc-context strong,.v24oc-why strong{display:block;margin-top:5px;color:#1f312f;font-size:14px;line-height:1.3}
  .v24oc-context span,.v24oc-why span{display:block;margin-top:5px;color:#65726e;font-size:11px;line-height:1.45}
  .v24oc-context.is-warn,.v24oc-why.is-warn{background:#f7f1e8;border-color:rgba(148,112,63,.16)}
 `;
 document.head.appendChild(style);
}
function headingText(result){return (q('h3',result)?.textContent||'').replace(/\s+/g,' ').trim();}
function addWhy(result,currency,cpp,cashDifference){
 q('.v24oc-why',result)?.remove();
 let label='',title='',copy='',warn=false;

 if(cashDifference<=0){
  label='WARUM NICHT PUNKTE ODER MEILEN?';
  title='Barzahlung ist bereits günstiger.';
  copy='Die Zuzahlung ist mindestens so hoch wie der vergleichbare Barpreis. Deine Punkte oder Meilen würdest du zusätzlich verbrauchen.';
  warn=true;
 }else if(currency==='pb'){
  if(cpp>=1){
   label='WARUM NICHT PAYBACK DIREKT?';
   title='Dieses Angebot bringt rechnerisch mehr.';
   copy=`Direkt sind 1,00 Cent pro PAYBACK Punkt sicher. Dieses Angebot kommt auf ${decimal(cpp)} Cent pro Punkt.`;
  }else{
   label='WARUM NICHT DIESES ANGEBOT?';
   title='Der direkte PAYBACK-Wert ist stärker.';
   copy=`Dieses Angebot kommt auf ${decimal(cpp)} Cent pro Punkt. Direktes PAYBACK-Einlösen entspricht 1,00 Cent pro Punkt.`;
   warn=true;
  }
 }else if(currency==='mr'){
  const h=headingText(result);
  if(/besser als (dein sicherer plan b|deine planbare payback-alternative)/i.test(h)){
   label='WARUM NICHT DER SICHERE PLAN B?';
   title='Dieses Angebot liegt über dem berechenbaren PAYBACK-Vergleich.';
   copy='VAYQUO verwirft den Plan B hier nicht pauschal, sondern nur im direkten Vergleich mit diesem konkreten Angebot.';
  }else if(/(sicherer plan b|planbare payback-alternative).*(stärker|rechnerisch stärker)/i.test(h)){
   label='WARUM NICHT DIESES ANGEBOT?';
   title='Dein berechenbarer Plan B ist stärker.';
   copy='Der PAYBACK-Vergleich liefert für deine Membership Rewards rechnerisch mehr Gegenwert als dieses konkrete Angebot.';
   warn=true;
  }
 }
 if(!title)return;

 const box=document.createElement('div');
 box.className='v24oc-why'+(warn?' is-warn':'');
 box.innerHTML=`<small>${label}</small><strong>${title}</strong><span>${copy}</span>`;
 result.appendChild(box);
}
function enhanceResult(){
 const result=q('#v24os-result .v24os-result');
 if(!result||result.dataset.v24ocDone==='1')return;
 const cash=Number(q('#v24os-cash')?.value);
 const award=Number(q('#v24os-award')?.value);
 const fees=Number(q('#v24os-fees')?.value||0);
 if(!Number.isFinite(cash)||cash<=0||!Number.isFinite(award)||award<=0||!Number.isFinite(fees)||fees<0)return;

 ensureStyle();
 const cashDifference=cash-fees;
 const cpp=cashDifference>0?(cashDifference/award)*100:0;
 const currency=String(q('#v24os-currency')?.value||'other');
 const p=q('p',result);
 if(p&&cashDifference>0){
  const sentences=(p.textContent||'').trim().split(/(?<=\.)\s+/).filter(Boolean);
  const detail=sentences.filter(s=>!/Gegenüber dem Barpreis|weniger in bar/i.test(s)).join(' ');
  p.textContent=`Bei dieser Buchung würdest du ${euro(cashDifference)} weniger in bar ausgeben als beim vergleichbaren Barpreis. Dafür setzt du ${fmt(award)} Punkte oder Meilen ein.${detail?` ${detail}`:''}`;
 }

 q('.v24oc-context',result)?.remove();
 const program=PROGRAMS[currency];
 if(program){
  const box=document.createElement('div');
  box.className='v24oc-context';
  if(!known(currency)){
   box.classList.add('is-warn');
   box.innerHTML=`<small>DEIN BESTAND</small><strong>Stand noch nicht hinterlegt</strong><span>Trag deinen aktuellen ${program.label}-Stand unter „Punkte“ ein. Dann kann VAYQUO prüfen, ob du dieses Angebot mit deinem Bestand umsetzen kannst.</span>`;
  }else{
   const have=balance(currency);
   if(have>=award){
    const remaining=Math.max(0,have-Math.round(award));
    box.innerHTML=`<small>DEIN BESTAND DANACH</small><strong>${fmt(remaining)} ${program.unit} bleiben übrig</strong><span>Aktuell ${fmt(have)} ${program.unit} · für dieses Angebot ${fmt(award)} ${program.unit}.</span>`;
   }else{
    const missing=Math.max(0,Math.round(award)-have);
    box.classList.add('is-warn');
    box.innerHTML=`<small>MIT DEINEM AKTUELLEN STAND</small><strong>Noch ${fmt(missing)} ${program.unit} zu wenig</strong><span>Du hast ${fmt(have)} ${program.unit}, das Angebot benötigt ${fmt(award)}. Der Vergleichswert ist berechenbar, die Buchung aber mit diesem Bestand noch nicht vollständig möglich.</span>`;
   }
  }
  result.appendChild(box);
 }
 addWhy(result,currency,cpp,cashDifference);
 result.dataset.v24ocDone='1';
}

document.addEventListener('click',ev=>{
 if(ev.target.closest?.('[data-v24os-calc]'))setTimeout(enhanceResult,0);
});
new MutationObserver(()=>{
 const result=q('#v24os-result .v24os-result');
 if(result&&result.dataset.v24ocDone!=='1')setTimeout(enhanceResult,0);
}).observe(document.documentElement,{childList:true,subtree:true});
})();