(()=>{
'use strict';

const KEY='vayquo:sessionView';
const RETURN_PARAM='vqReturn';
const VALID=new Set(['today','wallet','optimize','card']);
let ready=false;
let suppress=false;
let last='';
let returnView=readReturnView();

function navs(){return Array.from(document.querySelectorAll('#bottom [data-view],.bottom [data-view]'));}
function canonical(value){
 const v=String(value||'').toLowerCase();
 if(v==='start')return 'today';
 if(v==='points')return 'wallet';
 if(v==='benefits')return 'card';
 if(v==='check')return 'optimize';
 return VALID.has(v)?v:'';
}
function readReturnView(){
 try{return canonical(new URL(location.href).searchParams.get(RETURN_PARAM));}catch{return '';}
}
function consumeReturnView(){
 const target=returnView;
 if(!target)return '';
 returnView='';
 try{
  const url=new URL(location.href);
  url.searchParams.delete(RETURN_PARAM);
  history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
 }catch{}
 return target;
}
function activeView(){
 const active=navs().find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 return canonical(active?.dataset?.view||'');
}
function navigate(view){
 const target=canonical(view);if(!target)return false;
 const button=navs().find(el=>canonical(el.dataset?.view)===target);
 if(button){button.click();return true;}
 try{if(typeof window.go==='function'){window.go(target);return true;}}catch{}
 try{if(typeof go==='function'){go(target);return true;}}catch{}
 return false;
}
function stored(){try{return canonical(sessionStorage.getItem(KEY));}catch{return '';}}
function store(view){try{sessionStorage.setItem(KEY,view);}catch{}}
function replace(view){
 try{history.replaceState({...history.state,vq:true,vqView:view},'',location.href);}catch{}
}
function push(view){
 try{history.pushState({vq:true,vqView:view},'',location.href);}catch{}
}
function sync(){
 const current=activeView();
 if(!current){
  if(returnView){
   const wanted=consumeReturnView();
   store(wanted);
   suppress=true;
   if(navigate(wanted))return;
   suppress=false;
  }
  return;
 }
 if(!ready){
  ready=true;
  const explicit=consumeReturnView();
  const wanted=explicit||stored();
  if(wanted&&wanted!==current){
   store(wanted);
   suppress=true;
   if(navigate(wanted))return;
   suppress=false;
  }
  last=current;store(current);replace(current);return;
 }
 if(current===last){if(suppress)suppress=false;return;}
 const previous=last;last=current;store(current);
 if(suppress){suppress=false;replace(current);return;}
 if(previous)push(current);else replace(current);
}

window.addEventListener('popstate',ev=>{
 const target=canonical(ev.state?.vqView||'');
 if(!target)return;
 if(target===activeView()){last=target;store(target);return;}
 suppress=true;last=target;store(target);navigate(target);
});

let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();document.addEventListener('click',()=>setTimeout(schedule,0),true);new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-current']});
})();
