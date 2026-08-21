(()=>{
'use strict';

let selectedGoal='';
const LABELS={
 none:'Einfach weltweit ohne Fremdwährungsgebühr bezahlen',
 mr:'Auch Bargeld im Ausland möglichst günstig abheben',
 miles_more:'Eine Reiseversicherung ist mir wichtig',
 payback:'Das beste Gesamtpaket aus Kosten & Reisevorteilen'
};

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function advisor(){return document.querySelector('#v28-card-advisor');}
function questionNumber(root){return text(root?.querySelector('.v28ca-step small'));}
function choiceButtons(root){return Array.from(root?.querySelectorAll('[data-v28ca-choice]')||[]);}

function rememberGoal(root){
 if(questionNumber(root)!=='FRAGE 1 VON 5')return;
 const active=root.querySelector('[data-v28ca-choice].active');
 if(active?.dataset?.v28caChoice)selectedGoal=active.dataset.v28caChoice;
}

function patchAbroadQuestion(root){
 if(selectedGoal!=='abroad'||questionNumber(root)!=='FRAGE 5 VON 5')return;
 const step=root.querySelector('.v28ca-step');
 if(!step||step.dataset.abroadUx==='1')return;
 step.dataset.abroadUx='1';
 const h2=step.querySelector('h2');
 const p=step.querySelector('p');
 if(h2)h2.textContent='Was ist dir im Ausland am wichtigsten?';
 if(p)p.textContent='Damit VAYQUO kostenlose Visa/Mastercard nicht einfach über einen Kamm schert.';
 const buttons=choiceButtons(root);
 for(const btn of buttons){
  const label=LABELS[btn.dataset.v28caChoice];
  const span=btn.querySelector('span');
  if(label&&span)span.textContent=label;
  btn.classList.remove('active');
 }
 const next=root.querySelector('.v28ca-next');
 if(next)next.disabled=true;
}

async function patchAbroadReasons(root){
 if(selectedGoal!=='abroad')return;
 const why=root.querySelector('.v28ca-why');
 const heading=root.querySelector('.v28ca-result-head h2');
 if(!why||!heading||why.dataset.abroadUx==='1')return;
 try{
  const response=await fetch('config/vayquo-card-advisor.de.json?v=2802',{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  const card=(data.cards||[]).find(item=>item.name===text(heading));
  if(!card)return;
  const features=new Set(card.features||[]),reasons=[];
  if(features.has('free'))reasons.push('0 € laufendes Kartenentgelt.');
  if(features.has('no_fx'))reasons.push('Keine Fremdwährungsgebühr des Kartenanbieters.');
  if(features.has('high_acceptance'))reasons.push(`${card.network==='visa'?'Visa':'Mastercard'} bietet eine hohe weltweite Akzeptanz.`);
  if(features.has('free_cash_abroad'))reasons.push('Bargeldabhebungen im Ausland ohne Abhebegebühr des Kartenanbieters.');
  if(features.has('insurance_included'))reasons.push('Reiseversicherung ist unter den jeweiligen Anbieterbedingungen enthalten.');
  why.innerHTML=reasons.slice(0,4).map(reason=>`<span>✓ ${reason}</span>`).join('');
  why.dataset.abroadUx='1';
 }catch{}
}

function sync(){
 const root=advisor();
 if(!root||root.hidden)return;
 rememberGoal(root);
 patchAbroadQuestion(root);
 void patchAbroadReasons(root);
}

document.addEventListener('click',ev=>{
 const btn=ev.target?.closest?.('[data-v28ca-choice]');
 const root=advisor();
 if(btn&&root&&questionNumber(root)==='FRAGE 1 VON 5')selectedGoal=btn.dataset.v28caChoice||'';
 setTimeout(sync,0);
});

new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
sync();
})();
