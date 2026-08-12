(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const exact=(el,value)=>(el?.textContent||'').trim()===value;

const PROGRAMS=[
  {key:'mr',label:'Amex'},
  {key:'pb',label:'PAYBACK'},
  {key:'mm',label:'Miles & More'}
];

function ensureStyle(){
  if(q('#v24sp-style'))return;
  const style=document.createElement('style');
  style.id='v24sp-style';
  style.textContent=`
    [data-v24sp-row]{display:flex!important;flex-wrap:wrap!important;gap:9px!important;padding:8px!important;align-items:center!important}
    [data-v24sp-row] .v24sp-chip{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 15px;border-radius:14px;background:#171819;color:#f7f2e9;font-size:14px;font-weight:760;line-height:1;box-sizing:border-box;white-space:nowrap}
    [data-v24sp-row] .v24sp-chip:before{content:'✓';font-size:12px;color:#d8bd84;font-weight:800}
    [data-v24sp-row] .v24sp-empty{display:flex;align-items:center;min-height:42px;padding:0 12px;color:#8d918e;font-size:13px;font-weight:650}
    @media(max-width:420px){[data-v24sp-row] .v24sp-chip{font-size:13px;padding:0 13px}}
  `;
  document.head.appendChild(style);
}

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test((active.textContent||'').trim()))return true;
  return qa('#app *').some(el=>exact(el,'Deine Programme'));
}

function selectedPrograms(){
  let programs={};
  try{programs=(typeof state!=='undefined'&&state?.programs)||{};}catch{}
  return PROGRAMS.filter(p=>!!programs[p.key]);
}

function findProgramBox(){
  const heading=qa('#app *').find(el=>exact(el,'Deine Programme'));
  if(!heading)return null;
  let node=heading.parentElement;
  const app=q('#app');
  while(node&&node!==app){
    const value=node.textContent||'';
    if(/Ändern/.test(value)&&(/Amex|PAYBACK|Alle|Miles & More/.test(value)||q('[data-v24sp-row]',node)))return node;
    node=node.parentElement;
  }
  return heading.parentElement;
}

function findProgramRow(box){
  if(!box)return null;
  const existing=q('[data-v24sp-row]',box);if(existing)return existing;
  const leaves=qa('*',box).filter(el=>el.children.length===0);
  const old=leaves.filter(el=>['Amex','PAYBACK','Alle','Miles & More'].includes((el.textContent||'').trim()));
  if(!old.length)return null;
  let node=old[0].parentElement;
  while(node&&node!==box){
    const value=node.textContent||'';
    const count=['Amex','PAYBACK','Alle'].filter(x=>value.includes(x)).length;
    if(count>=2)return node;
    node=node.parentElement;
  }
  return old[0].parentElement;
}

function renderPrograms(){
  const box=findProgramBox();
  const row=findProgramRow(box);if(!row)return;
  const active=selectedPrograms();
  row.dataset.v24spRow='1';
  row.setAttribute('aria-label','In VAYQUO aktive Programme');
  const sig=active.map(p=>p.key).join(',')||'empty';
  if(row.dataset.v24spSig===sig)return;
  row.dataset.v24spSig=sig;
  row.innerHTML=active.length
    ?active.map(p=>`<span class="v24sp-chip" data-v24sp-program="${p.key}">${p.label}</span>`).join('')
    :'<span class="v24sp-empty">Noch kein Programm hinterlegt</span>';
}

function apply(){
  if(!startActive())return;
  ensureStyle();
  renderPrograms();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO start programs',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
