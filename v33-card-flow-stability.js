(()=>{
'use strict';

const KEY='vayquo:cardAdvisorDraft';
let restoring=false;
let scheduled=false;
let finalMustBeFresh=false;

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
function root(){return q('#v28-card-advisor');}
function question(r=root()){
 const m=text(q('.v28ca-step small',r)).match(/FRAGE\s+(\d+)\s+VON\s+5/i);
 return m?Math.max(0,Math.min(4,Number(m[1])-1)):null;
}
function read(){try{const d=JSON.parse(sessionStorage.getItem(KEY)||'null');return d&&d.active&&d.answers&&typeof d.answers==='object'?d:null;}catch{return null;}}
function write(d){try{sessionStorage.setItem(KEY,JSON.stringify(d));}catch{}}
function clear(){try{sessionStorage.removeItem(KEY);}catch{}finalMustBeFresh=false;}
function empty(){return {active:true,step:0,answers:{goal:'',travel:'',spend:'',fee:'',ecosystem:'',freePriority:''}};}
function keyForStep(step,answers){
 if(step===0)return 'goal';if(step===1)return 'travel';if(step===2)return 'spend';if(step===3)return 'fee';
 return answers?.goal==='save_fees'?'freePriority':'ecosystem';
}
function ensureDraft(){const d=read()||empty();write(d);return d;}
function saveChoice(btn){
 const r=root(),step=question(r);if(step===null)return;
 const value=String(btn?.dataset?.v28caChoice||'');if(!value)return;
 const d=ensureDraft(),key=keyForStep(step,d.answers);
 if(step===0&&d.answers.goal&&d.answers.goal!==value){
  d.answers.ecosystem='';d.answers.freePriority='';finalMustBeFresh=true;
 }
 d.answers[key]=value;d.step=step;write(d);
}
function syncStep(){
 const r=root();if(!r||r.hidden)return;
 const step=question(r),d=ensureDraft();
 if(step===null){
  if(q('.v28ca-result-head',r)){d.step=5;write(d);}return;
 }
 d.step=step;write(d);
 if(step===4&&finalMustBeFresh){
  qa('[data-v28ca-choice].active',r).forEach(el=>el.classList.remove('active'));
  const next=q('.v28ca-next',r);if(next)next.disabled=true;
 }
}
function choiceFor(d,step){return d.answers?.[keyForStep(step,d.answers)]||'';}
function waitFor(predicate,timeout=1600){
 return new Promise(resolve=>{const start=Date.now();const tick=()=>{const v=predicate();if(v)return resolve(v);if(Date.now()-start>timeout)return resolve(null);setTimeout(tick,25);};tick();});
}
async function replay(d){
 if(restoring||!d?.active)return;restoring=true;finalMustBeFresh=false;
 try{
  let r=root();
  if(!r||r.hidden){
   const entry=await waitFor(()=>q('.v28ca-entry-btn'));if(!entry)return;
   entry.click();r=await waitFor(()=>{const x=root();return x&&!x.hidden?x:null;});if(!r)return;
  }
  const target=Math.max(0,Math.min(5,Number(d.step)||0));
  for(let step=0;step<target&&step<5;step++){
   const current=await waitFor(()=>question(root())===step?root():null);if(!current)break;
   const value=choiceFor(d,step);if(!value)break;
   const btn=q(`[data-v28ca-choice="${CSS.escape(value)}"]`,current);if(!btn)break;
   if(!btn.classList.contains('active'))btn.click();
   const next=q('.v28ca-next',current);if(!next||next.disabled)break;
   next.click();
  }
  if(target<5){
   const current=await waitFor(()=>question(root())===target?root():null);
   const value=current?choiceFor(d,target):'';
   const btn=value?q(`[data-v28ca-choice="${CSS.escape(value)}"]`,current):null;
   if(btn&&!btn.classList.contains('active'))btn.click();
  }
 }finally{restoring=false;setTimeout(syncStep,0);}
}

window.addEventListener('vayquo:card-advisor-open',()=>{
 if(restoring)return;
 const d=read();if(!d)write(empty());
 setTimeout(syncStep,0);
});
window.addEventListener('vayquo:card-advisor-result',()=>{const d=ensureDraft();d.step=5;write(d);});

document.addEventListener('click',ev=>{
 const choice=ev.target?.closest?.('[data-v28ca-choice]');if(choice&&root()&&!root().hidden)saveChoice(choice);
 if(ev.target?.closest?.('.v28ca-close')){clear();return;}
 if(ev.target?.closest?.('.v28ca-restart')){const d=ensureDraft();d.step=0;write(d);finalMustBeFresh=false;setTimeout(syncStep,0);return;}
 if(ev.target?.closest?.('.v28ca-next,.v28ca-back'))setTimeout(syncStep,0);
},true);

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;syncStep();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});

function restoreOnLoad(){const d=read();if(d?.active)setTimeout(()=>void replay(d),180);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreOnLoad,{once:true});else restoreOnLoad();
})();
