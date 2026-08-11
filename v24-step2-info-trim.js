(()=>{
'use strict';

const REMOVE_INFO_IDS=['fFrom','fTo','fDate'];

function trimInfoButtons(){
  for(const id of REMOVE_INFO_IDS){
    const control=document.getElementById(id);
    const field=control?.closest('.field');
    const button=field?.querySelector('label .v24s2-info');
    if(button)button.remove();
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;trimInfoButtons();});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
