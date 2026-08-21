(()=>{
'use strict';

function ensureStyle(){
 if(document.getElementById('v33-contextual-setup-style'))return;
 const style=document.createElement('style');
 style.id='v33-contextual-setup-style';
 style.textContent=`.v33-points-setup{width:100%;min-height:48px;margin-top:14px;border:0;border-radius:14px;background:#171918;color:#fff;padding:0 14px;font:850 11px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}`;
 document.head.appendChild(style);
}
function addOptimizerSetup(){
 const empty=document.querySelector('.v24os-empty-decision');if(!empty)return;
 if(empty.querySelector('.v33-points-setup'))return;
 ensureStyle();
 const btn=document.createElement('button');btn.type='button';btn.className='v33-points-setup';btn.textContent='Punkte & Meilen einrichten →';
 btn.addEventListener('click',()=>{
  if(window.VAYQUO_ONBOARDING?.open?.())return;
  const points=Array.from(document.querySelectorAll('#bottom [data-view],.bottom [data-view]')).find(el=>/punkte/i.test(el.textContent||''));
  points?.click();
 });
 empty.appendChild(btn);
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;addOptimizerSetup();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
