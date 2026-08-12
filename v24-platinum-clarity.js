(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const leaves=root=>qa('*',root).filter(el=>el.children.length===0);

function active(){
  try{
    const p=state?.programs||{};
    const nav=q('#bottom [data-view="card"]');
    const benefits=nav?.classList.contains('active')||q('#app h1')?.textContent.trim()==='Vorteile';
    return !!benefits&&!!p.mr&&state?.card==='platinum';
  }catch{return false;}
}

function ensureStyle(){
  if(q('#v24pc-style'))return;
  const style=document.createElement('style');
  style.id='v24pc-style';
  style.textContent=`
    #app .v24pc-period{display:flex;align-items:baseline;gap:7px;margin:-1px 14px 10px;color:#727d79;font-size:9px;line-height:1.4}
    #app .v24pc-period span{flex:0 0 auto;color:#9a7d50;font-size:7px;letter-spacing:.12em;font-weight:850}
    #app .v24pc-period b{font-weight:650;color:#66716d}
  `;
  document.head.appendChild(style);
}

function refineSummary(screen){
  const root=q('.v19-benefits',screen)||screen;
  leaves(root).forEach(el=>{
    const t=text(el);
    if(/^650(?:[.,]00)?\s*€$/i.test(t))el.textContent='Bis zu 650 €';
    else if(/650\s*€.*Guthaben.*2026/i.test(t))el.textContent='Bis zu 650 € bezifferbare Guthaben';
    else if(/^Guthaben\s*2026$/i.test(t))el.textContent='bezifferbare Guthaben';
    else if(/^(Noch\s+)?offen$/i.test(t))el.textContent='Noch offen · VAYQUO-Stand';
  });
  const sync=q('.v24s35-sync',root)||q('.v24s35-sync',screen);
  if(sync)sync.textContent='Offene Beträge laut deinem VAYQUO-Stand · Zeiträume unterscheiden sich je Vorteil · keine automatische Amex- oder SIXT-Synchronisierung.';
}

function sixtPeriod(){
  try{
    if(typeof benefitPeriod==='function'){
      const p=String(benefitPeriod('sixt')||'').trim();
      if(p)return p;
    }
  }catch{}
  return '12 Monate ab Registrierung';
}

function periodFor(raw){
  const t=String(raw||'');
  if(/SIXT\s*ride/i.test(t))return sixtPeriod();
  if(/Restaurantguthaben|Restaurant/i.test(t))return 'Einlösungszeitraum 2026 · 07.01.–31.12.';
  if(/Online[-\s]?Reiseguthaben|Reiseguthaben/i.test(t))return '12 Monate · bis zum nächsten Mitgliedschaftsjahrestag';
  if(/LODENFREY|Shoppingguthaben/i.test(t))return '2 × 50 € · 50 € je Kalenderhalbjahr';
  return '';
}

function refineBenefit(wrap){
  if(wrap.dataset.v24pcChecked==='1')return;
  const period=periodFor(wrap.textContent);
  if(!period)return;
  wrap.dataset.v24pcChecked='1';
  leaves(wrap).forEach(el=>{
    if(/^(Noch\s+)?offen$/i.test(text(el)))el.textContent='Noch offen · VAYQUO-Stand';
  });
  const note=document.createElement('div');
  note.className='v24pc-period';
  note.innerHTML=`<span>ZEITRAUM</span><b>${period}</b>`;
  const anchor=q('button,a,[role="button"]',wrap);
  if(anchor)anchor.insertAdjacentElement('beforebegin',note);
  else wrap.appendChild(note);
}

function enhance(){
  if(!active())return;
  const screen=q('#app .screen');
  if(!screen)return;
  ensureStyle();
  refineSummary(screen);
  qa('.v23-benefit-wrap',screen).forEach(refineBenefit);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{enhance();}catch(e){console.warn('VAYQUO platinum clarity',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();