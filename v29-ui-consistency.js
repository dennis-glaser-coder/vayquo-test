(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
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
function moveRatgeberBelowPrograms(){
 const link=q('.v24-ratgeber-home');
 if(!startActive())return;
 if(!link)return;
 const programs=findProgramsBlock();
 if(!programs||!programs.parentElement)return;
 if(programs.nextElementSibling===link)return;
 programs.insertAdjacentElement('afterend',link);
 link.dataset.v29Position='after-programs';
}
function markDuplicateOffer(){
 const duplicate=q('.v24os-landing .v24os-offer-late');
 if(!duplicate)return;
 duplicate.setAttribute('aria-hidden','true');
 duplicate.dataset.v29Duplicate='hidden';
}
function apply(){ensureStyle();moveCardCheckBeforeOptimizer();moveRatgeberBelowPrograms();markDuplicateOffer();}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO UI consistency',e);}});}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();
