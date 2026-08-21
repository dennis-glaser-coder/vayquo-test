(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const USP='VAYQUO – die App, die das Maximum aus deinen Kreditkarten, Punkten & Meilen holt.';

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test(text(active)))return true;
  return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}

function findHero(){
  const app=q('#app');if(!app)return null;
  const why=qa('button,a,[role="button"]',app).find(el=>/^Warum\?$/i.test(text(el)));
  if(!why)return null;
  let node=why.parentElement;
  for(let i=0;i<8&&node&&node!==app;i++,node=node.parentElement){
    const controls=qa('button,a,[role="button"]',node);
    const heading=q('h1,h2,h3',node);
    if(heading&&controls.length>=2)return node;
  }
  return null;
}

function ensureStyle(){
  if(q('#v34-home-usp-style'))return;
  const style=document.createElement('style');
  style.id='v34-home-usp-style';
  style.textContent=`
    .v34usp-title{font-size:0!important;line-height:0!important}
    .v34usp-title::before{content:"VAYQUO – die App, die das Maximum aus deinen Kreditkarten, Punkten & Meilen holt.";display:block;font-size:clamp(25px,7vw,34px);line-height:1.08;letter-spacing:-.035em;font-weight:780;color:inherit}
    .v34usp-title>*{display:none!important}
    .v34usp-support{display:flex;flex-wrap:wrap;gap:4px 0;margin:10px 0 0;font-size:11px;line-height:1.4;font-weight:700;color:#66706d;letter-spacing:-.01em}
    .v34usp-support span+span::before{content:" · ";white-space:pre;color:#9aa19f}
    @media(max-width:420px){.v34usp-title::before{font-size:27px}.v34usp-support{font-size:10px}}
  `;
  document.head.appendChild(style);
}

function clear(){
  qa('.v34usp-title').forEach(el=>{el.classList.remove('v34usp-title');el.removeAttribute('aria-label');});
  qa('.v34usp-support').forEach(el=>el.remove());
}

function apply(){
  ensureStyle();
  if(!startActive()){clear();return;}
  const hero=findHero();if(!hero)return;
  const title=qa('h1,h2,h3',hero).find(el=>!el.closest('button,a,[role="button"]'))||null;
  if(!title)return;
  title.classList.add('v34usp-title');
  title.setAttribute('aria-label',USP);

  let support=q('.v34usp-support',hero);
  if(!support){
    support=document.createElement('div');
    support.className='v34usp-support';
    support.setAttribute('aria-label','Kreditkarten vergleichen, Punkte und Meilen optimieren, Vorteile besser nutzen');
    support.innerHTML='<span>Kreditkarten</span><span>Punkte &amp; Meilen</span><span>Vorteile nutzen</span>';
    title.insertAdjacentElement('afterend',support);
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO home USP',e);}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});
})();
