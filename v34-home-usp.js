(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const HEADER_COPY='Die App für Kreditkarten, Punkte & Meilen';

function ensureStyle(){
  if(q('#v34-home-usp-style'))return;
  const style=document.createElement('style');
  style.id='v34-home-usp-style';
  style.textContent=`
    .v34usp-headerline{display:block!important;margin:0 0 14px!important;font-size:15px!important;line-height:1.28!important;font-weight:760!important;letter-spacing:-.018em!important;text-transform:none!important;color:#66716e!important;white-space:normal!important}
    @media(max-width:390px){.v34usp-headerline{font-size:14px!important;margin-bottom:13px!important}}
  `;
  document.head.appendChild(style);
}

function visible(el){
  if(!el)return false;
  const r=el.getBoundingClientRect();
  const cs=getComputedStyle(el);
  return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden';
}

function findGreeting(){
  const app=q('#app');if(!app)return null;
  return qa('*',app).find(el=>el.children.length===0&&visible(el)&&/^Hallo\b/i.test(text(el)))||null;
}

function greetingRow(greeting){
  if(!greeting)return null;
  const app=q('#app');
  let node=greeting;
  let best=greeting.parentElement||greeting;
  for(let i=0;i<6&&node&&node!==app;i++,node=node.parentElement){
    const r=node.getBoundingClientRect();
    if(r.height>0&&r.height<=90&&r.width>=Math.min(260,(app?.getBoundingClientRect().width||260)*.7))best=node;
  }
  return best;
}

function cleanup(){
  qa('.v34usp-brand').forEach(el=>el.classList.remove('v34usp-brand'));
  qa('.v34usp-title').forEach(el=>{el.classList.remove('v34usp-title');el.removeAttribute('aria-label');});
  qa('.v34usp-support').forEach(el=>el.remove());
}

function apply(){
  ensureStyle();
  cleanup();

  const greeting=findGreeting();
  let line=q('.v34usp-headerline');

  if(!greeting){
    line?.remove();
    return;
  }

  const row=greetingRow(greeting);
  if(!row?.parentElement)return;

  if(!line){
    line=document.createElement('div');
    line.className='v34usp-headerline';
  }
  if(text(line)!==HEADER_COPY)line.textContent=HEADER_COPY;

  if(row.previousElementSibling!==line)row.insertAdjacentElement('beforebegin',line);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO header USP',e);}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();
