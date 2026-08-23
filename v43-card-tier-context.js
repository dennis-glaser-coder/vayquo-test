(()=>{
'use strict';

const POLICY=window.VAYQUOCardTierPolicy;
const ENGINE=window.VAYQUOCardAdvisorEngine;
if(!POLICY||!ENGINE)return;

let catalogPromise=null;
const TRAVEL_LABEL={rare:'fast nie',low:'1–2 Reisen/Jahr',mid:'3–5 Reisen/Jahr',high:'6+ Reisen/Jahr'};
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
 if(document.getElementById('v43-card-tier-style'))return;
 const style=document.createElement('style');
 style.id='v43-card-tier-style';
 style.textContent=`
 .v43-tier-note{margin:12px 0 0;padding:12px 13px;border-radius:14px;background:rgba(148,116,73,.10);border:1px solid rgba(148,116,73,.20);color:inherit}
 .v43-tier-note small{display:block;color:#c6a36b;font-size:8px;font-weight:900;letter-spacing:.12em}
 .v43-tier-note b{display:block;margin-top:4px;color:inherit;font-size:11px;line-height:1.4}
 .v43-tier-note span{display:block;margin-top:5px;color:inherit;opacity:.78;font-size:9.5px;line-height:1.5}
 `;
 document.head.appendChild(style);
}
function shortName(name){
 return String(name||'').replace(/^American Express\s+/,'').replace(/^Miles & More\s+/,'').replace(/\s+Credit Card$/,'').trim();
}
function joinNames(cards){
 const names=cards.map(card=>shortName(card.name)).filter(Boolean);
 if(names.length<=1)return names[0]||'die teurere Alternative';
 return `${names.slice(0,-1).join(', ')} oder ${names[names.length-1]}`;
}
function buildCopy(review){
 const names=joinNames(review.alternatives);
 const travel=TRAVEL_LABEL[review.travel]||'';
 let reason='Die teureren passenden Karten wurden mitbewertet, erreichen für dein Profil aber keinen höheren Gesamtnutzen als die empfohlene Karte.';
 if(review.goal==='points'&&(review.travel==='rare'||review.travel==='low')){
  reason=`Bei ${travel} bewertet VAYQUO die zusätzlichen Reise- und Versicherungsleistungen der teureren Optionen aktuell nicht stark genug, um die höhere Monatsgebühr zu rechtfertigen.`;
 }else if(review.goal==='points'){
  reason='Die teureren Membership-Rewards-Karten wurden mitbewertet. Ihre Zusatzleistungen gleichen die höhere Monatsgebühr in deinem aktuellen Profil nicht ausreichend aus.';
 }
 return {
  title:`Warum nicht ${names}?`,
  body:`Du hast bis zu ${review.feeCap} € pro Monat erlaubt. Das ist ein Maximum, kein Ziel. ${reason}`
 };
}
async function decorate(){
 const root=document.getElementById('v28-card-advisor');
 if(!root||root.hidden||!root.querySelector('.v28ca-card'))return;
 root.querySelector('.v43-tier-note')?.remove();
 const profile=stateProfile();
 if(!profile)return;
 const catalog=await loadCatalog();
 if(!catalog)return;
 const decision=ENGINE.decide(catalog,profile);
 const review=POLICY.review(catalog,profile,decision,ENGINE);
 if(!review)return;
 const copy=buildCopy(review);
 ensureStyle();
 const note=document.createElement('div');
 note.className='v43-tier-note';
 const kicker=document.createElement('small');
 kicker.textContent='WARUM NICHT TEURER?';
 const title=document.createElement('b');
 title.textContent=copy.title;
 const body=document.createElement('span');
 body.textContent=copy.body;
 note.append(kicker,title,body);
 const why=root.querySelector('.v28ca-card .v28ca-why');
 const actions=root.querySelector('.v28ca-card .v28ca-actions');
 if(why)why.insertAdjacentElement('afterend',note);
 else if(actions)actions.insertAdjacentElement('beforebegin',note);
}

window.addEventListener('vayquo:card-advisor-result',()=>setTimeout(()=>void decorate(),0));
})();
