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
    .v34usp-headerline{display:block!important;margin:10px 0 13px!important;font-size:clamp(13px,3.5vw,15px)!important;line-height:1.25!important;font-weight:720!important;letter-spacing:-.012em!important;text-transform:none!important;color:#697471!important;white-space:normal!important}
    @media(max-width:390px){.v34usp-headerline{font-size:13px!important;margin-top:8px!important;margin-bottom:12px!important}}
  `;
  document.head.appendChild(style);
}

function clearLegacy(){
  qa('.v34usp-brand').forEach(el=>el.classList.remove('v34usp-brand'));
  qa('.v34usp-title').forEach(el=>{el.classList.remove('v34usp-title');el.removeAttribute('aria-label');});
  qa('.v34usp-support').forEach(el=>el.remove());
}

function visible(el){
  if(!el)return false;
  const r=el.getBoundingClientRect();
  const cs=getComputedStyle(el);
  return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden';
}

function findHeaderBrand(){
  const app=q('#app');if(!app)return null;
  const candidates=qa('*',app).filter(el=>{
    if(el.children.length!==0||el.closest('button,a,[role="button"]')||!visible(el))return false;
    return text(el).replace(/\s+/g,'').toUpperCase()==='VAYQUO';
  });
  if(!candidates.length)return null;
  return candidates.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
}

function findGreeting(){
  const app=q('#app');if(!app)return null;
  return qa('*',app).find(el=>el.children.length===0&&visible(el)&&/^Hallo\b/i.test(text(el)))||null;
}

function lowestCommonAncestor(a,b){
  if(!a||!b)return null;
  const seen=new Set();
  for(let n=a;n;n=n.parentElement)seen.add(n);
  for(let n=b;n;n=n.parentElement)if(seen.has(n))return n;
  return null;
}

function directChildWithin(node,ancestor){
  if(!node||!ancestor)return null;
  let current=node;
  while(current.parentElement&&current.parentElement!==ancestor)current=current.parentElement;
  return current.parentElement===ancestor?current:null;
}

function targetAnchor(brand,greeting){
  if(!brand)return null;
  if(greeting){
    const common=lowestCommonAncestor(brand,greeting);
    if(common){
      const brandBlock=directChildWithin(brand,common);
      const greetingBlock=directChildWithin(greeting,common);
      if(brandBlock&&greetingBlock&&brandBlock!==greetingBlock)return {mode:'after',node:brandBlock};
    }
  }

  let node=brand.parentElement;
  for(let i=0;i<5&&node;i++,node=node.parentElement){
    const r=node.getBoundingClientRect();
    if(r.height>0&&r.height<=100&&r.width>=brand.getBoundingClientRect().width)return {mode:'after',node};
  }
  return {mode:'after',node:brand};
}

function apply(){
  ensureStyle();
  clearLegacy();

  const brand=findHeaderBrand();
  if(!brand)return;
  const greeting=findGreeting();
  const anchor=targetAnchor(brand,greeting);
  if(!anchor?.node?.parentElement)return;

  let line=q('.v34usp-headerline');
  if(!line){
    line=document.createElement('div');
    line.className='v34usp-headerline';
  }
  if(text(line)!==HEADER_COPY)line.textContent=HEADER_COPY;

  if(anchor.mode==='after'){
    if(anchor.node.nextElementSibling!==line)anchor.node.insertAdjacentElement('afterend',line);
  }
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
