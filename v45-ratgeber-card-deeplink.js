(()=>{
'use strict';
const p=new URLSearchParams(location.search);
if(p.get('source')!=='ratgeber'||p.get('entry')!=='card_advisor')return;
let done=false,observer=null;
const clean=()=>{const u=new URL(location.href);u.searchParams.delete('source');u.searchParams.delete('entry');history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():'')+u.hash);};
const active=el=>!!el&&(el.classList.contains('active')||el.getAttribute('aria-current')==='page'||el.getAttribute('aria-selected')==='true');
function openCardCheck(){
 if(done)return;
 const start=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(start&&!active(start)){start.click();return;}
 const btn=document.querySelector('#v28-card-advisor-entry .v28ca-entry-btn');
 if(!btn)return;
 done=true;observer?.disconnect();btn.click();clean();
}
const schedule=()=>requestAnimationFrame(()=>{try{openCardCheck();}catch(e){console.warn('VAYQUO Ratgeber Karten-Deep-Link',e);}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','aria-selected']});
window.addEventListener('pageshow',schedule);
})();
