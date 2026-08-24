(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const HEADER_COPY='VAYQUO zeigt dir, was sich bei Kreditkarten, Punkten, Meilen und Vorteilen wirklich lohnt.';
const CARD_ENTRY_PAINT_CLASS='v44-card-entry-pending';

function armCardEntryPaintGate(){
  if(!q('#v44-card-entry-paint-gate')){
    const style=document.createElement('style');
    style.id='v44-card-entry-paint-gate';
    style.textContent=`html.${CARD_ENTRY_PAINT_CLASS} #v28-card-advisor-entry{visibility:hidden!important}`;
    document.head.appendChild(style);
  }
  document.documentElement.classList.add(CARD_ENTRY_PAINT_CLASS);
  try{clearTimeout(window.__v44CardEntryPaintFallback);}catch{}
  window.__v44CardEntryPaintFallback=setTimeout(()=>document.documentElement.classList.remove(CARD_ENTRY_PAINT_CLASS),3000);
}

function releaseCardEntryPaintGate(){
  document.documentElement.classList.remove(CARD_ENTRY_PAINT_CLASS);
  try{clearTimeout(window.__v44CardEntryPaintFallback);}catch{}
}

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

function findLoggedOutAnchor(){
  const app=q('#app');if(!app)return null;
  // Guests have no "Hallo …" row. Anchor the USP to the first real home section,
  // not to the card advisor that the central layout intentionally moves lower down.
  const visual=q('#v44-home-visual-trust',app);
  if(visual&&visible(visual))return visual;
  const cardCheck=q('#v28-card-advisor-entry',app);
  if(cardCheck&&visible(cardCheck))return cardCheck;
  return null;
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
  const anchor=greeting?greetingRow(greeting):findLoggedOutAnchor();
  let line=q('.v34usp-headerline');

  if(!anchor?.parentElement){
    line?.remove();
    return;
  }

  if(!line){
    line=document.createElement('div');
    line.className='v34usp-headerline';
  }
  if(text(line)!==HEADER_COPY)line.textContent=HEADER_COPY;

  if(anchor.previousElementSibling!==line)anchor.insertAdjacentElement('beforebegin',line);
}

function loadVisualTrust(){
  const existing=document.querySelector('script[data-vayquo-home-visual-trust-v44]');
  const wanted='v44-home-visual-trust.js?v=4409';
  if(existing&&String(existing.getAttribute('src')||'').includes('v=4409'))return;
  existing?.remove();
  const oldRoot=q('#v44-home-visual-trust');
  oldRoot?.remove();
  const script=document.createElement('script');
  script.src=wanted;
  script.async=false;
  script.dataset.vayquoHomeVisualTrustV44='1';
  script.addEventListener('error',()=>{releaseCardEntryPaintGate();console.warn('VAYQUO Startseiten-Bildbereich konnte nicht geladen werden.');},{once:true});
  document.head.appendChild(script);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO header USP',e);}});
}

armCardEntryPaintGate();
loadVisualTrust();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();
