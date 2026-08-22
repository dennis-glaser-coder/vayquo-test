(()=>{
'use strict';

/*
  Minimal final-step compatibility bridge.
  The core v28 advisor remains the only owner of answers, navigation, close,
  ranking and result rendering. This file does one thing only: immediately
  before the Q5 result action, it replays the visibly active Q5 choice through
  the core choice button's existing click handler. That keeps the core session
  in sync with the UI without duplicating any card-advisor business logic.
*/
let syncing=false;

function advisor(){return document.getElementById('v28-card-advisor');}
function isFinalStep(root){
 const label=(root?.querySelector('.v28ca-step small')?.textContent||'').replace(/\s+/g,' ').trim();
 return label==='FRAGE 5 VON 5';
}
function syncFinalChoice(ev){
 if(syncing)return;
 const next=ev.target?.closest?.('#v28-card-advisor .v28ca-next');
 const root=advisor();
 if(!next||!root||root.hidden||next.disabled||!isFinalStep(root))return;
 const active=root.querySelector('[data-v28ca-choice].active');
 if(!active)return;
 syncing=true;
 try{active.click();}finally{syncing=false;}
}

// Do not prevent, stop or replace the real event. After this sync, the normal
// v28 result-button handler continues unchanged.
document.addEventListener('pointerdown',syncFinalChoice,true);
document.addEventListener('touchstart',syncFinalChoice,{capture:true,passive:true});
document.addEventListener('click',syncFinalChoice,true);
})();
