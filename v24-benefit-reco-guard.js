(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}

function benefitsViewActive(){
 const nav=q('#bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 const h=q('#app h1');
 return !!h&&h.textContent.trim()==='Vorteile';
}

function patchFlightRoute(){
 const current=window.go;
 if(typeof current!=='function'||current.__v24FlightRouteFixed)return;
 const wrapped=function(view,arg,...rest){
  if(view==='check'&&arg==='flight')return current.call(this,'optimize','flight',...rest);
  return current.call(this,view,arg,...rest);
 };
 wrapped.__v24FlightRouteFixed=true;
 wrapped.__v24Original=current;
 window.go=wrapped;
}

function removeUnprovenCardRecommendations(){
 if(!benefitsViewActive())return;
 qa('#app .v24s35-reco').forEach(reco=>{
  const section=reco.closest('.v24s35-section');
  if(section&&/Mehr\s+für\s+dich/i.test(section.textContent||''))section.remove();
  else reco.remove();
 });
}

function nextAction(){
 const s=safeState();
 if(s?.card==='platinum')return null;
 const mr=!!s?.programs?.mr?Math.max(0,Number(s?.balances?.mr)||0):0;
 const mm=!!s?.programs?.mm?Math.max(0,Number(s?.balances?.mm)||0):0;
 const pb=!!s?.programs?.pb?Math.max(0,Number(s?.balances?.pb)||0):0;
 if(mr>0)return {
  title:`${fmt(mr)} Membership Rewards zuerst konkret prüfen`,
  copy:'Mit deinem aktuellen Bestand ist ein konkreter Einsatz aussagekräftiger als ein pauschaler Kartenwechsel. Deshalb empfiehlt VAYQUO hier zuerst die Punkte-Optimierung.',
  cta:'Jetzt optimieren'
 };
 if(mm>0)return {
  title:`${fmt(mm)} Miles & More Meilen konkret vergleichen`,
  copy:'Ohne verfügbaren Flug, Meilenpreis und Zuzahlung wäre eine pauschale Empfehlung nicht belastbar. Deshalb zuerst einen konkreten Einsatz prüfen.',
  cta:'Jetzt optimieren'
 };
 if(pb>0)return {
  title:`${fmt(pb)} PAYBACK Punkte gegen Alternativen prüfen`,
  copy:`Dein direkter PAYBACK-Wert liegt bei ${(pb/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'})}. Eine andere Nutzung ist nur sinnvoll, wenn sie nachweisbar mehr bringt.`,
  cta:'Jetzt optimieren'
 };
 return null;
}

function ensureStyle(){
 if(q('#v24-benefit-guidance-style'))return;
 const style=document.createElement('style');
 style.id='v24-benefit-guidance-style';
 style.textContent=`
 #v24-benefit-guidance{margin-top:14px}.v24bg-card{padding:17px 16px;border:1px solid rgba(117,91,52,.14);border-radius:19px;background:linear-gradient(145deg,#f8f4ed,#fffdf9);box-shadow:0 7px 22px rgba(54,44,29,.035)}
 .v24bg-kicker{font-size:8px;letter-spacing:.13em;color:#987a4d;font-weight:900}.v24bg-card h3{margin:7px 0 6px;color:#1d2c29;font-size:18px;line-height:1.18;letter-spacing:-.03em}.v24bg-card p{margin:0;color:#707b78;font-size:10px;line-height:1.5}
 .v24bg-btn{width:100%;min-height:42px;margin-top:12px;border:0;border-radius:13px;background:#183b35;color:#fff;padding:0 13px;display:flex;align-items:center;justify-content:space-between;text-align:left;font:800 10px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}.v24bg-btn span{font-size:16px}
 `;
 document.head.appendChild(style);
}

function openOptimize(){
 const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>{
  const v=String(el.dataset?.view||'').toLowerCase();
  const t=text(el).toLowerCase();
  return v==='check'||v==='optimize'||/optimieren|prüfen/.test(t);
 });
 nav?.click();
}

function renderGroundedGuidance(){
 if(!benefitsViewActive()){q('#v24-benefit-guidance')?.remove();return;}
 const info=nextAction();
 if(!info){q('#v24-benefit-guidance')?.remove();return;}
 ensureStyle();
 const signature=`${info.title}|${info.copy}`;
 let box=q('#v24-benefit-guidance');
 if(box?.dataset.signature===signature)return;
 if(!box){
  box=document.createElement('section');
  box.id='v24-benefit-guidance';
  const owned=qa('#app .v24s35-section').find(section=>/Das\s+hast\s+du/i.test(section.textContent||''));
  if(owned)owned.insertAdjacentElement('afterend',box);else q('#app .v24s35-benefits')?.appendChild(box);
 }
 box.dataset.signature=signature;
 box.innerHTML=`<div class="v24bg-card"><div class="v24bg-kicker">DEINE NÄCHSTE SINNVOLLE AKTION</div><h3>${info.title}</h3><p>${info.copy}</p><button type="button" class="v24bg-btn">${info.cta}<span>→</span></button></div>`;
 q('.v24bg-btn',box)?.addEventListener('click',openOptimize);
}

let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  try{
   patchFlightRoute();
   removeUnprovenCardRecommendations();
   renderGroundedGuidance();
  }catch(e){console.warn('VAYQUO benefit recommendation guard',e);}
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();