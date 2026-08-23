(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const HOME_READY_CLASS='vq-home-layout-ready';
let scheduled=false;

function ensureStyle(){
 if(q('#v29-ui-consistency-style'))return;
 const style=document.createElement('style');
 style.id='v29-ui-consistency-style';
 style.textContent=`
 :root{--vqp-accent:#171918!important}
 .v28ca-entry-btn,.v28ca-next,.v28ca-select,.v24premium-primary,.v24s3-primary,.v24s35-reco-btn{background:#171918!important;color:#fff!important}
 .v28ca-progress i,.v28ca-choice.active strong{background:#171918!important;color:#fff!important}
 .v28ca-choice.active{border-color:#171918!important;background:#f2efe8!important}
 .v24premium-search .v24premium-primary{box-shadow:0 9px 22px rgba(23,25,24,.15)!important}
 .v24os-landing .v24os-offer-late{display:none!important}
 `;
 document.head.appendChild(style);
}

function leaves(root=document){return qa('*',root).filter(el=>el.children.length===0);}
function startActive(){
 const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 if(active&&/^start$/i.test(text(active)))return true;
 return leaves(q('#app')||document).some(el=>text(el)==='Deine Programme');
}
function findProgramsBlock(){
 const app=q('#app');if(!app)return null;
 const heading=leaves(app).find(el=>text(el)==='Deine Programme');if(!heading)return null;
 const section=heading.closest('section');
 if(section&&section!==app)return section;
 let node=heading.parentElement;
 for(let i=0;i<7&&node&&node!==app;i++,node=node.parentElement){
  const ownText=text(node);
  if(/Deine Programme/.test(ownText)&&/Ändern/.test(ownText))return node;
 }
 return heading.parentElement&&heading.parentElement!==app?heading.parentElement:null;
}
function findOptimizerBlock(){
 const app=q('#app');if(!app)return null;
 const trigger=leaves(app).find(el=>text(el)==='Beste Nutzung finden')||qa('button,a,[role="button"]',app).find(el=>text(el)==='Beste Nutzung finden');
 if(!trigger)return null;
 let node=trigger.closest('button,a,[role="button"]')||trigger;
 let fallback=node.parentElement&&node.parentElement!==app?node.parentElement:node;
 for(let i=0;i<8&&node&&node!==app;i++,node=node.parentElement){
  const ownText=text(node);
  if(/Beste Nutzung finden/.test(ownText)&&/Maximum daraus machen/i.test(ownText))fallback=node;
  if(/Beste Nutzung finden/.test(ownText)&&/Warum\?/.test(ownText)&&/Maximum daraus machen/i.test(ownText))return node;
 }
 return fallback&&fallback!==app?fallback:null;
}
function moveCardCheckBeforeOptimizer(){
 if(!startActive())return;
 const entry=q('#v28-card-advisor-entry');
 if(!entry)return;
 const optimizer=findOptimizerBlock();
 if(!optimizer||!optimizer.parentElement)return;
 if(optimizer.previousElementSibling===entry)return;
 optimizer.insertAdjacentElement('beforebegin',entry);
 entry.dataset.v29Position='before-optimizer';
}
function ensureHomeEntries(){
 try{window.VAYQUO_RATGEBER_ENTRY?.ensureLegal?.();}catch{}
 if(!startActive()){
  document.documentElement.classList.remove(HOME_READY_CLASS);
  try{window.VAYQUO_RATGEBER_ENTRY?.ensureHome?.();}catch{}
  try{window.VAYQUO_PULSE_ENTRY?.ensureHome?.();}catch{}
  return {pulse:null,ratgeber:null};
 }
 let ratgeber=null,pulse=null;
 try{ratgeber=window.VAYQUO_RATGEBER_ENTRY?.ensureHome?.()||q('.v24-ratgeber-home');}catch{ratgeber=q('.v24-ratgeber-home');}
 try{pulse=window.VAYQUO_PULSE_ENTRY?.ensureHome?.()||q('.v46-pulse-home');}catch{pulse=q('.v46-pulse-home');}
 return {pulse,ratgeber};
}
function reorderTopChoices(){
 const grid=q('#v44-home-visual-trust .v44-grid');if(!grid)return false;
 const card=q('[data-v44-kind="card"]',grid),points=q('[data-v44-kind="points"]',grid),travel=q('[data-v44-kind="travel"]',grid);
 if(!card||!points||!travel)return false;
 if(grid.children[0]!==card||grid.children[1]!==points||grid.children[2]!==travel)grid.append(card,points,travel);
 return grid.children[0]===card&&grid.children[1]===points&&grid.children[2]===travel;
}
function placeHomeTools(){
 if(!startActive()){document.documentElement.classList.remove(HOME_READY_CLASS);ensureHomeEntries();return;}
 const programs=findProgramsBlock();
 const visual=q('#v44-home-visual-trust');
 const {pulse,ratgeber}=ensureHomeEntries();
 if(!programs||!programs.parentElement||!visual||!pulse||!ratgeber){document.documentElement.classList.remove(HOME_READY_CLASS);return;}
 const parent=programs.parentElement;
 if(pulse.parentElement!==parent||programs.nextElementSibling!==pulse)programs.insertAdjacentElement('afterend',pulse);
 if(ratgeber.parentElement!==parent||pulse.nextElementSibling!==ratgeber)pulse.insertAdjacentElement('afterend',ratgeber);
 const choicesReady=reorderTopChoices();
 const ready=choicesReady&&programs.nextElementSibling===pulse&&pulse.nextElementSibling===ratgeber&&!!q('#v44-home-visual-trust');
 document.documentElement.classList.toggle(HOME_READY_CLASS,ready);
 pulse.dataset.v29Position='after-programs';
 ratgeber.dataset.v29Position='after-pulse';
}
function markDuplicateOffer(){
 const duplicate=q('.v24os-landing .v24os-offer-late');
 if(!duplicate)return;
 duplicate.setAttribute('aria-hidden','true');
 duplicate.dataset.v29Duplicate='hidden';
}
function apply(){ensureStyle();moveCardCheckBeforeOptimizer();placeHomeTools();markDuplicateOffer();}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO UI consistency',e);}});}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
window.addEventListener('pageshow',schedule);
window.addEventListener('popstate',schedule);
document.addEventListener('vq-auth-ready',schedule);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();
