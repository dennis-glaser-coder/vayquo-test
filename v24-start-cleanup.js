(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const HEADING='Was möchtest du tun?';

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test(text(active)))return true;
  return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}

function hasExact(root,value){
  return qa('*',root).some(el=>el.children.length===0&&text(el)===value);
}

function safeBlock(heading){
  const app=q('#app');
  const forbidden=node=>hasExact(node,'Deine Programme')||hasExact(node,'Nicht einfach Punkte haben. Das Maximum daraus machen.')||hasExact(node,'Beste Nutzung finden');
  const section=heading.closest('section');
  if(section&&section!==app&&!forbidden(section))return section;

  let node=heading.parentElement;
  for(let i=0;i<7&&node&&node!==app;i++,node=node.parentElement){
    if(forbidden(node))break;
    const actions=qa('button,a,[role="button"],[onclick]',node);
    if(actions.length>=2)return node;
  }
  return heading.parentElement&&heading.parentElement!==app?heading.parentElement:null;
}

function apply(){
  if(!startActive())return;
  const heading=qa('#app *').find(el=>el.children.length===0&&text(el)===HEADING);
  if(!heading)return;
  safeBlock(heading)?.remove();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO start cleanup',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
