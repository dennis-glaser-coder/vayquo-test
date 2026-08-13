(()=>{
'use strict';

const params=new URLSearchParams(window.location.search);
if(params.get('source')!=='ratgeber')return;

const entry=params.get('entry');
const targets={
  mr_value:{view:'points',labels:['Punkte']},
  payback_value:{view:'points',labels:['Punkte']},
  offer_compare:{view:'check',labels:['Prüfen','Optimieren']}
};
const target=targets[entry];
if(!target)return;

const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let completed=false;
let observer=null;

function isVisible(el){
  if(!el)return false;
  const style=getComputedStyle(el);
  if(style.display==='none'||style.visibility==='hidden')return false;
  return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
}

function findTarget(){
  const scoped=[
    ...document.querySelectorAll(`#bottom [data-view="${target.view}"],.bottom [data-view="${target.view}"]`),
    ...document.querySelectorAll(`[data-view="${target.view}"]`)
  ];
  const direct=scoped.find(isVisible);
  if(direct)return direct;

  const nav=[...document.querySelectorAll('#bottom .nav,.bottom .nav,#bottom button,.bottom button,#bottom a,.bottom a,nav [role="button"],nav button,nav a')];
  return nav.find(el=>isVisible(el)&&target.labels.includes(text(el)) )||null;
}

function isActive(el){
  return !!el&&(el.classList.contains('active')||el.getAttribute('aria-current')==='page'||el.getAttribute('aria-selected')==='true');
}

function cleanEntryUrl(){
  const url=new URL(window.location.href);
  url.searchParams.delete('entry');
  url.searchParams.delete('source');
  const query=url.searchParams.toString();
  history.replaceState(history.state,'',url.pathname+(query?'?'+query:'')+url.hash);
}

function finish(){
  if(completed)return;
  completed=true;
  observer?.disconnect();
  cleanEntryUrl();
}

function route(){
  if(completed)return;
  const el=findTarget();
  if(!el)return;
  if(isActive(el)){finish();return;}
  el.click();
  requestAnimationFrame(()=>requestAnimationFrame(finish));
}

function schedule(){
  requestAnimationFrame(()=>{try{route();}catch(e){console.warn('VAYQUO Ratgeber entry',e);}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-current','aria-selected']});
document.addEventListener('vq-auth-ready',schedule);
window.addEventListener('pageshow',schedule);
})();
