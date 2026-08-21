(()=>{
'use strict';

const HELPER_SCRIPTS=[
 ['v24-monetization-core.js?v=3501','v35-monetization-core-loader'],
 ['v24-revenue-runtime-prep.js?v=3501','v35-revenue-prep-loader']
];
const queued=[];
let pendingAuthGate=false;
let gateShownRecorded=false;

function loadScript(src,id){
 if(document.getElementById(id))return Promise.resolve();
 return new Promise(resolve=>{
  const script=document.createElement('script');
  script.id=id;
  script.src=src;
  script.async=false;
  script.addEventListener('load',resolve,{once:true});
  script.addEventListener('error',()=>resolve(),{once:true});
  document.head.appendChild(script);
 });
}
function flush(){
 if(!window.VAYQUORevenuePrep?.record)return;
 while(queued.length){
  const event=queued.shift();
  try{window.VAYQUORevenuePrep.record(event.name,event.payload);}catch{}
 }
}
function record(name,payload={}){
 if(window.VAYQUORevenuePrep?.record){
  try{return window.VAYQUORevenuePrep.record(name,payload);}catch{return false;}
 }
 queued.push({name,payload});
 return true;
}
function getUser(){
 try{return window.VAYQUO_AUTH?.getUser?.()||null;}catch{return null;}
}
function authRoot(){return document.getElementById('v24-auth');}
function patchCardGate(){
 if(!pendingAuthGate)return;
 const root=authRoot();
 if(!root||root.hidden)return;
 const title=root.querySelector('.v24a-card h1');
 const copy=root.querySelector('.v24a-sub');
 if(title)title.textContent='Dein Ergebnis ist fertig.';
 if(copy)copy.textContent='VAYQUO hat eine passende Karte für deine Angaben gefunden. Erstelle kostenlos ein Konto oder melde dich an – danach siehst du die vollständige Empfehlung.';
 if(!gateShownRecorded){
  gateShownRecorded=true;
  record('card_registration_gate_shown',{});
 }
}
function syncAuthGate(){
 const root=authRoot();
 if(!pendingAuthGate||!root)return;
 if(!root.hidden){patchCardGate();return;}
 if(getUser()){
  pendingAuthGate=false;
  gateShownRecorded=false;
  record('card_registration_gate_completed',{});
  record('card_result_shown',{});
 }
}

Promise.all(HELPER_SCRIPTS.map(([src,id])=>loadScript(src,id))).then(flush);

window.addEventListener('vayquo:card-advisor-open',()=>{
 record('card_check_started',{});
});
window.addEventListener('vayquo:card-advisor-result',()=>{
 const guest=!getUser();
 record('card_result_ready',{authState:guest?'guest':'signed_in'});
 if(guest){
  pendingAuthGate=true;
  gateShownRecorded=false;
  setTimeout(patchCardGate,0);
 }else{
  record('card_result_shown',{});
 }
});

new MutationObserver(()=>syncAuthGate()).observe(document.documentElement,{
 childList:true,
 subtree:true,
 attributes:true,
 attributeFilter:['hidden']
});
})();
