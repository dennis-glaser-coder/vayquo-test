(()=>{
'use strict';

const POLICY=window.VAYQUOCardEcosystemPolicy;
const ENGINE=window.VAYQUOCardAdvisorEngine;
if(!POLICY||!ENGINE)return;

let catalogPromise=null;
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
function stateProfile(){
 try{
  const s=(window.state&&typeof window.state==='object')?window.state:(typeof state!=='undefined'&&state&&typeof state==='object'?state:null);
  const p=s?.cardAdvisorProfile;
  return p&&typeof p==='object'?{...p}:null;
 }catch{return null;}
}
function loadCatalog(){
 if(catalogPromise)return catalogPromise;
 catalogPromise=fetch('config/vayquo-card-advisor.de.json?v=2802',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
 return catalogPromise;
}
function ensureStyle(){
 if(document.getElementById('v42-card-ecosystem-style'))return;
 const style=document.createElement('style');
 style.id='v42-card-ecosystem-style';
 style.textContent=`
 .v42-ecosystem-note{margin:0 0 12px;padding:12px 13px;border-radius:14px;background:#eee9e0;color:#405550;border:1px solid rgba(117,91,52,.08)}
 .v42-ecosystem-note small{display:block;color:#947449;font-size:8px;font-weight:900;letter-spacing:.12em}
 .v42-ecosystem-note b{display:block;margin-top:4px;color:#213936;font-size:11px;line-height:1.35}
 .v42-ecosystem-note span{display:block;margin-top:5px;color:#667572;font-size:9.5px;line-height:1.45}
 `;
 document.head.appendChild(style);
}
function copyFor(review){
 if(review.kind==='aligned')return {
  title:`${review.ecosystemLabel} passt zu deiner Empfehlung.`,
  body:`Dein bestehendes Programm wurde berücksichtigt und steht nicht im Widerspruch zu deinem Hauptziel „${review.primaryGoalLabel}“.`
 };
 if(review.challenger){
  if(review.primaryGoal==='points')return {
   title:`${review.ecosystemLabel} wurde mitgeprüft.`,
   body:`Die stärkste direkte ${review.ecosystemLabel}-Alternative in deinem Gebührenrahmen ist ${review.challenger.name}. Du hast aber flexible Punkte priorisiert; deshalb erfüllt ${review.winnerName} dein Hauptziel besser.`
  };
  return {
   title:`${review.ecosystemLabel} wurde mitgeprüft.`,
   body:`Als stärkste Alternative im bestehenden Programm wurde ${review.challenger.name} geprüft. Sie erfüllt dein Hauptziel „${review.primaryGoalLabel}“ nicht vollständig – deshalb bleibt ${review.winnerName} vorne.`
  };
 }
 return {
  title:`${review.ecosystemLabel} wurde berücksichtigt.`,
  body:`Innerhalb deines Gebührenrahmens gibt es aktuell keine geprüfte ${review.ecosystemLabel}-Alternative, die dein Hauptziel „${review.primaryGoalLabel}“ besser erfüllt.`
 };
}
async function decorate(){
 const root=document.getElementById('v28-card-advisor');
 if(!root||root.hidden||!root.querySelector('.v28ca-result-head,.v28ca-card'))return;
 const profile=stateProfile();
 if(!profile)return;
 const catalog=await loadCatalog();
 if(!catalog)return;
 const decision=ENGINE.decide(catalog,profile);
 const review=POLICY.review(catalog,profile,decision,ENGINE);
 root.querySelector('.v42-ecosystem-note')?.remove();
 if(!review)return;
 const winnerName=text(root.querySelector('.v28ca-result-head h2'))||review.winnerName;
 if(winnerName&&winnerName!==review.winnerName)review.winnerName=winnerName;
 const copy=copyFor(review);
 ensureStyle();
 const note=document.createElement('div');
 note.className='v42-ecosystem-note';
 note.innerHTML=`<small>DEIN BESTEHENDES PROGRAMM</small><b>${copy.title}</b><span>${copy.body}</span>`;
 const summary=root.querySelector('.v28ca-summary');
 const card=root.querySelector('.v28ca-card');
 if(summary)summary.insertAdjacentElement('afterend',note);
 else if(card)card.insertAdjacentElement('beforebegin',note);
}

window.addEventListener('vayquo:card-advisor-result',()=>setTimeout(()=>void decorate(),0));
})();
