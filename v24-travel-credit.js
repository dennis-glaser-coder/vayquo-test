(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const OFFICIAL_AMEX_TRAVEL='https://www.americanexpress.com/de/reisen/';
const PERIOD_COPY='Gültigkeit im Amex-Reisekonto prüfen';

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}

function active(){
  try{
    const p=state?.programs||{};
    const nav=q('#bottom [data-view="card"]');
    const benefits=nav?.classList.contains('active')||q('#app h1')?.textContent.trim()==='Vorteile';
    return !!benefits&&!!p.mr&&state?.card==='platinum';
  }catch{return false;}
}

function openTravel(){
  try{window.open(OFFICIAL_AMEX_TRAVEL,'_blank','noopener,noreferrer');}
  catch{location.href=OFFICIAL_AMEX_TRAVEL;}
}

function travelWrap(){
  if(!active())return null;
  return qa('.v23-benefit-wrap').find(wrap=>/Online[-\s]?Reiseguthaben/i.test(text(wrap)))||null;
}

function updatePeriod(wrap){
  const period=q('.v24pc-period b',wrap);
  if(period&&text(period)!==PERIOD_COPY)period.textContent=PERIOD_COPY;

  qa('small,span,b,p,div',wrap).forEach(el=>{
    const t=text(el);
    if(/^12\s*Monate\s*·\s*bis\s+zum\s+nächsten\s+Mitgliedschaftsjahrestag$/i.test(t))el.textContent=PERIOD_COPY;
  });
}

function travelCta(wrap){
  return qa('button,a,[role="button"]',wrap).find(el=>{
    const t=text(el);
    return /Reiseguthaben.*(?:nutzen|einlösen|buchen)|(?:Reise|Guthaben).*buchen/i.test(t)&&!/aktualisieren|bearbeiten/i.test(t);
  })||null;
}

function bindTravel(){
  const wrap=travelWrap();
  if(!wrap)return;
  updatePeriod(wrap);
  if(wrap.dataset.v24TravelBound==='1')return;

  wrap.dataset.v24TravelBound='1';
  wrap.style.cursor='pointer';

  const cta=travelCta(wrap);
  if(cta){
    const clone=cta.cloneNode(true);
    clone.textContent='Reise mit Guthaben buchen →';
    cta.replaceWith(clone);
    clone.addEventListener('click',ev=>{
      ev.preventDefault();
      ev.stopPropagation();
      openTravel();
    });
  }

  wrap.addEventListener('click',ev=>{
    if(ev.target.closest?.('#v24-sheet,#v24s3-sheet,[role="dialog"]'))return;
    if(ev.target.closest?.('button,a,input,select,textarea,[role="button"]'))return;
    ev.preventDefault();
    ev.stopPropagation();
    openTravel();
  },true);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    try{bindTravel();}catch(e){console.warn('VAYQUO travel credit',e);}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
