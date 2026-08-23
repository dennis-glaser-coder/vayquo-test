(()=>{
'use strict';

if(window.__VAYQUO_CARD_RESULT_DIAGNOSTICS__)return;
window.__VAYQUO_CARD_RESULT_DIAGNOSTICS__=true;

const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_events';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const diagnosticSession=(globalThis.crypto?.randomUUID?.()||`vqdbg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`).slice(0,80);
let armed=false;
let armedRoot=null;
let seq=0;
let sent=0;
let lastSignature='';
let stopTimer=null;

const clean=(value,max=120)=>String(value??'').replace(/[\r\n\t]/g,' ').trim().slice(0,max);
function rootState(){
 const roots=Array.from(document.querySelectorAll('#v28-card-advisor'));
 const root=roots[roots.length-1]||null;
 const question=clean(root?.querySelector('.v28ca-step small')?.textContent||'',40);
 const hasResult=!!root?.querySelector('.v28ca-result-head,.v28ca-card');
 const checking=/Deine Angaben werden geprüft/i.test(root?.textContent||'');
 const kind=hasResult?'result':checking?'checking':question==='FRAGE 5 VON 5'?'q5':question?'question':'other';
 return {
  root,
  properties:{
   stage:'',
   kind,
   question:question||'none',
   hidden:root?.hidden?'1':'0',
   root_count:String(roots.length),
   result_count:String(root?.querySelectorAll('.v28ca-result-head,.v28ca-card').length||0),
   step_count:String(root?.querySelectorAll('.v28ca-step').length||0),
   sheet_count:String(root?.querySelectorAll('.v28ca-sheet').length||0),
   same_root:armedRoot&&root===armedRoot?'1':'0',
   child_count:String(root?.childElementCount||0),
   html_len:String((root?.innerHTML||'').length)
  }
 };
}
function send(stage,force=false){
 if(!armed&&stage!=='diagnostic_loaded')return;
 if(sent>=30)return;
 try{
  const state=rootState();
  state.properties.stage=clean(stage,50);
  const signature=JSON.stringify(state.properties);
  if(!force&&signature===lastSignature)return;
  lastSignature=signature;
  sent++;
  const payload={
   session_id:diagnosticSession,
   event_name:'card_check_debug',
   path:clean(location.pathname||'/',240)||'/',
   source:'diagnostic',
   referrer_host:null,
   utm:{},
   properties:{...state.properties,seq:String(++seq)},
   user_id:null
  };
  fetch(ENDPOINT,{
   method:'POST',
   headers:{'apikey':API_KEY,'Authorization':`Bearer ${API_KEY}`,'Content-Type':'application/json','Prefer':'return=minimal'},
   body:JSON.stringify(payload),
   keepalive:true,
   credentials:'omit'
  }).catch(()=>{});
 }catch{}
}
function scheduleSnapshots(){
 Promise.resolve().then(()=>send('microtask',true));
 requestAnimationFrame(()=>send('raf',true));
 for(const [delay,label] of [[0,'t0'],[50,'t50'],[250,'t250'],[1000,'t1000'],[2000,'t2000']]){
  setTimeout(()=>send(label,true),delay);
 }
 clearTimeout(stopTimer);
 stopTimer=setTimeout(()=>{send('diagnostic_end',true);armed=false;armedRoot=null;},2600);
}

window.addEventListener('vayquo:card-advisor-result',()=>{
 if(!armed)return;
 send('result_event',true);
 setTimeout(()=>send('result_event_t50',true),50);
 setTimeout(()=>send('result_event_t250',true),250);
});

document.addEventListener('click',event=>{
 const button=event.target instanceof Element?event.target.closest('.v28ca-next'):null;
 if(!button)return;
 const root=button.closest('#v28-card-advisor');
 const question=clean(root?.querySelector('.v28ca-step small')?.textContent||'',40);
 if(question!=='FRAGE 5 VON 5')return;
 armed=true;
 armedRoot=root;
 seq=0;
 sent=0;
 lastSignature='';
 send('before_q5_next',true);
 scheduleSnapshots();
},true);

new MutationObserver(()=>{
 if(armed)send('mutation');
}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','style']});

send('diagnostic_loaded',true);
})();
