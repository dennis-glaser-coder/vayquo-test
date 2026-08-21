(()=>{
'use strict';

let selectedGoal='';
let unsureChoice='';
let catalogPromise=null;
const PRIORITIES={
 none:{want:'Eine gute Karte ohne laufende Gebühr',need:'0 € Kartenentgelt, gute Akzeptanz und möglichst geringe Auslandskosten.',label:'Ich möchte eine gute Karte ohne laufende Gebühr'},
 mr:{want:'Aus meinen Ausgaben Punkte & Prämien holen',need:'Ein Sammelsystem, das zu deinem Gebührenrahmen passt und nicht unnötig kompliziert ist.',label:'Ich möchte aus meinen Ausgaben Punkte & Prämien holen'},
 miles_more:{want:'Mehr Komfort auf Reisen',need:'Reisevorteile, die du bei deiner Reisehäufigkeit wirklich nutzt.',label:'Reisen sollen für mich komfortabler werden'},
 payback:{want:'Unkompliziert im Ausland zahlen',need:'Hohe Akzeptanz und möglichst geringe Kosten bei Zahlungen außerhalb des Euroraums.',label:'Ich zahle häufig im Ausland'}
};

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function advisor(){return document.querySelector('#v28-card-advisor');}
function questionNumber(root){return text(root?.querySelector('.v28ca-step small'));}
function choiceButtons(root){return Array.from(root?.querySelectorAll('[data-v28ca-choice]')||[]);}
function loadCatalog(){
 if(catalogPromise)return catalogPromise;
 catalogPromise=fetch('config/vayquo-card-advisor.de.json?v=2802',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
 return catalogPromise;
}

function rememberGoal(root){
 if(questionNumber(root)!=='FRAGE 1 VON 5')return;
 const active=root.querySelector('[data-v28ca-choice].active');
 if(active?.dataset?.v28caChoice)selectedGoal=active.dataset.v28caChoice;
}

function patchQuestion(root){
 if(selectedGoal!=='unsure'||questionNumber(root)!=='FRAGE 5 VON 5')return;
 const step=root.querySelector('.v28ca-step');
 if(!step||step.dataset.unsureUx==='1')return;
 step.dataset.unsureUx='1';
 unsureChoice='';
 const h2=step.querySelector('h2');
 const p=step.querySelector('p');
 if(h2)h2.textContent='Was klingt spontan am ehesten nach dir?';
 if(p)p.textContent='Du musst keine Kreditkarten kennen. Wähle nur, was dir persönlich am wichtigsten wäre.';
 for(const btn of choiceButtons(root)){
  const item=PRIORITIES[btn.dataset.v28caChoice];
  const span=btn.querySelector('span');
  if(item&&span)span.textContent=item.label;
  btn.classList.remove('active');
 }
 const next=root.querySelector('.v28ca-next');
 if(next)next.disabled=true;
}

function relevantReasons(card,choice){
 const features=new Set(card?.features||[]),reasons=[];
 if(choice==='none'){
  if(features.has('free'))reasons.push('0 € laufendes Kartenentgelt erfüllt deinen wichtigsten Wunsch.');
  if(features.has('high_acceptance'))reasons.push(`${card.network==='visa'?'Visa':'Mastercard'} bietet eine hohe Akzeptanz im Alltag und auf Reisen.`);
  if(features.has('no_fx'))reasons.push('Keine Fremdwährungsgebühr des Kartenanbieters.');
  if(features.has('free_cash_abroad'))reasons.push('Bargeldabhebungen im Ausland ohne Abhebegebühr des Kartenanbieters.');
 }else if(choice==='mr'){
  if(features.has('payback'))reasons.push('Du sammelst PAYBACK Punkte, ohne für die Karte ein laufendes Kartenentgelt zu zahlen.');
  if(features.has('mr'))reasons.push('Membership Rewards hält deine gesammelten Punkte flexibel nutzbar.');
  if(Number(card?.monthlyFeeEUR)===0)reasons.push('0 € laufendes Kartenentgelt passt zu deinem Gebührenrahmen.');
  if(features.has('insurance'))reasons.push('Reiseversicherungen ergänzen den Punkte-Nutzen, wenn du häufiger unterwegs bist.');
  if(features.has('insurance_basic'))reasons.push('Basis-Reiseleistungen ergänzen das flexible Punktesammeln.');
 }else if(choice==='miles_more'){
  if(features.has('lounge'))reasons.push('Loungezugang erfüllt deinen Wunsch nach mehr Komfort direkt.');
  if(features.has('premium_travel'))reasons.push('Die Karte bietet echte Premium-Reisevorteile.');
  if(features.has('travel_credit'))reasons.push('Ein Reiseguthaben kann einen Teil des Kartenpreises ausgleichen, wenn du es nutzt.');
  if(features.has('insurance'))reasons.push('Der Versicherungsschutz passt zu regelmäßigen Reisen.');
 }else if(choice==='payback'){
  if(features.has('free'))reasons.push('0 € laufendes Kartenentgelt.');
  if(features.has('high_acceptance'))reasons.push(`${card.network==='visa'?'Visa':'Mastercard'} bietet eine hohe weltweite Akzeptanz.`);
  if(features.has('no_fx'))reasons.push('Keine Fremdwährungsgebühr des Kartenanbieters.');
  if(features.has('free_cash_abroad'))reasons.push('Bargeldabhebungen im Ausland ohne Abhebegebühr des Kartenanbieters.');
 }
 return reasons.slice(0,4);
}

async function patchResult(root){
 if(selectedGoal!=='unsure'||!unsureChoice||questionNumber(root))return;
 const item=PRIORITIES[unsureChoice];
 const summary=root.querySelector('.v28ca-summary');
 if(item&&summary&&summary.dataset.unsureUx!=='1'){
  summary.dataset.unsureUx='1';
  const boxes=Array.from(summary.querySelectorAll(':scope > div'));
  if(boxes[0]){
   const small=boxes[0].querySelector('small'),b=boxes[0].querySelector('b');
   if(small)small.textContent='DEIN SCHWERPUNKT';
   if(b)b.textContent=item.want;
  }
  if(boxes[1]){
   const b=boxes[1].querySelector('b');
   if(b)b.textContent=item.need;
  }
  const intro=root.querySelector('.v28ca-result-head p');
  if(intro)intro.textContent='Du warst dir am Anfang noch unsicher. VAYQUO hat deshalb aus deinen Antworten einen klaren Schwerpunkt abgeleitet.';
 }
 const why=root.querySelector('.v28ca-why');
 const heading=root.querySelector('.v28ca-result-head h2');
 if(!why||!heading||why.dataset.unsureUx==='1')return;
 const data=await loadCatalog();
 const card=(data?.cards||[]).find(c=>c.name===text(heading));
 if(!card)return;
 const reasons=relevantReasons(card,unsureChoice);
 if(reasons.length){
  why.innerHTML=reasons.map(reason=>`<span>✓ ${reason}</span>`).join('');
  why.dataset.unsureUx='1';
 }
}

function sync(){
 const root=advisor();
 if(!root||root.hidden)return;
 rememberGoal(root);
 patchQuestion(root);
 void patchResult(root);
}

document.addEventListener('click',ev=>{
 const btn=ev.target?.closest?.('[data-v28ca-choice]');
 const root=advisor();
 if(btn&&root&&questionNumber(root)==='FRAGE 1 VON 5'){
  selectedGoal=btn.dataset.v28caChoice||'';
  unsureChoice='';
 }
 if(btn&&root&&selectedGoal==='unsure'&&questionNumber(root)==='FRAGE 5 VON 5')unsureChoice=btn.dataset.v28caChoice||'';
 setTimeout(sync,0);
});

document.addEventListener('vayquo:card-advisor-open',()=>{unsureChoice='';setTimeout(sync,0);});
new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
sync();
})();
