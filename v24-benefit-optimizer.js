(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.max(0,Number(n)||0));

const DEFINITIONS=[
 {id:'travel',label:'Online-Reiseguthaben',max:200,pattern:/Online[-\s]?Reiseguthaben|Reiseguthaben/i},
 {id:'sixt',label:'SIXT ride',max:200,pattern:/SIXT\s*ride/i},
 {id:'restaurant',label:'Restaurantguthaben',max:150,pattern:/Restaurantguthaben/i},
 {id:'loden',label:'LODENFREY',max:100,pattern:/LODENFREY|Shoppingguthaben/i}
];

function active(){
 try{
  const nav=q('#bottom [data-view="card"]');
  const benefits=nav?.classList.contains('active')||q('#app h1')?.textContent.trim()==='Vorteile';
  return !!benefits&&!!state?.programs?.mr&&state?.card==='platinum';
 }catch{return false;}
}
function clamp(value,max){return Math.max(0,Math.min(max,Number(value)||0));}
function benefitWrap(def){return qa('.v23-benefit-wrap').find(w=>def.pattern.test(text(w)))||null;}

/*
 A remaining amount is only "known" when the visible benefit card explicitly
 marks it as a VAYQUO usage state. Numeric defaults inside state.benefits are
 deliberately not trusted here because 0 can mean "not entered yet".
*/
function explicitRemaining(def,wrap){
 if(!wrap)return null;
 const raw=text(wrap);
 if(!/Noch\s+offen(?:\s*·\s*VAYQUO-Stand)?/i.test(raw))return null;
 const patterns=[
  /Noch\s+offen(?:\s*·\s*VAYQUO-Stand)?[^0-9€]{0,50}(\d+(?:[.,]\d{1,2})?)\s*€/i,
  /(\d+(?:[.,]\d{1,2})?)\s*€[^0-9]{0,50}Noch\s+offen(?:\s*·\s*VAYQUO-Stand)?/i
 ];
 for(const pattern of patterns){
  const m=raw.match(pattern);
  if(m)return clamp(Number(m[1].replace(',','.')),def.max);
 }
 const marker=qa('*',wrap).find(el=>el.children.length===0&&/Noch\s+offen/i.test(text(el)));
 if(!marker)return null;
 const scope=marker.parentElement||wrap;
 const amounts=qa('*',scope).filter(el=>el.children.length===0).map(el=>{
  const m=text(el).match(/^(\d+(?:[.,]\d{1,2})?)\s*€$/);
  return m?Number(m[1].replace(',','.')):null;
 }).filter(n=>n!==null&&n>=0&&n<=def.max);
 return amounts.length?clamp(amounts[0],def.max):null;
}

function snapshot(){
 return DEFINITIONS.map(def=>{
  const wrap=benefitWrap(def);
  const remaining=explicitRemaining(def,wrap);
  return {...def,wrap,remaining,known:remaining!==null};
 }).filter(x=>x.wrap);
}

function ensureStyle(){
 if(q('#v24bo-style'))return;
 const style=document.createElement('style');style.id='v24bo-style';
 style.textContent=`
 #v24-benefit-optimizer{margin:14px 0 18px;padding:15px;border:1px solid rgba(117,91,52,.15);border-radius:19px;background:linear-gradient(145deg,#f8f4ed,#fffdf9);box-shadow:0 7px 22px rgba(54,44,29,.035);box-sizing:border-box}
 .v24bo-kicker{font-size:7.5px;letter-spacing:.13em;color:#987a4d;font-weight:850}
 .v24bo-top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:6px}
 .v24bo-top h3{margin:0;color:#1d2c29;font-size:18px;line-height:1.15;letter-spacing:-.03em}
 .v24bo-total{text-align:right;flex:0 0 auto}.v24bo-total b{display:block;color:#183b35;font-size:17px;line-height:1.1}.v24bo-total span{display:block;margin-top:2px;color:#8a918f;font-size:8px}
 .v24bo-copy{margin:7px 0 0;color:#707b78;font-size:9px;line-height:1.5}
 .v24bo-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.v24bo-chip{padding:6px 8px;border-radius:999px;background:#eef2ee;color:#526660;font-size:8.5px;font-weight:700}.v24bo-chip b{color:#24453e}
 .v24bo-next{appearance:none;width:100%;min-height:42px;margin-top:12px;border:0;border-radius:13px;background:#183b35;color:#fff;padding:0 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font:780 10px/1.15 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
 .v24bo-next span{font-size:16px;line-height:1}.v24bo-note{margin-top:7px;color:#979d9b;font-size:7.8px;line-height:1.4}
 `;
 document.head.appendChild(style);
}

function actionFor(item){
 if(!item?.wrap)return null;
 return qa('button,a,[role="button"]',item.wrap).find(el=>{
  const t=text(el);
  if(item.id==='travel')return /Reise.*(?:buchen|Guthaben)|Guthaben.*buchen/i.test(t)&&!/aktualisieren/i.test(t);
  if(item.id==='restaurant')return /Teilnehmende Restaurants/i.test(t);
  if(item.id==='sixt')return /Fahrt planen|Fahrt bei SIXT ride suchen/i.test(t);
  return /Nutzung aktualisieren|bearbeiten/i.test(t);
 })||null;
}
function openItem(item){
 const action=actionFor(item);
 if(action){action.click();return;}
 item?.wrap?.scrollIntoView?.({behavior:'smooth',block:'center'});
}

function render(){
 if(!active()){q('#v24-benefit-optimizer')?.remove();return;}
 const items=snapshot();if(!items.length){q('#v24-benefit-optimizer')?.remove();return;}
 const first=items[0].wrap;
 let box=q('#v24-benefit-optimizer');
 if(!box){ensureStyle();box=document.createElement('section');box.id='v24-benefit-optimizer';first.insertAdjacentElement('beforebegin',box);}
 const known=items.filter(x=>x.known);
 const open=known.filter(x=>x.remaining>0);
 const total=open.reduce((sum,x)=>sum+x.remaining,0);
 const next=[...open].sort((a,b)=>b.remaining-a.remaining||DEFINITIONS.findIndex(d=>d.id===a.id)-DEFINITIONS.findIndex(d=>d.id===b.id))[0]||null;
 const signature=JSON.stringify(items.map(x=>[x.id,x.known,x.remaining]));
 if(box.dataset.v24boSignature===signature)return;
 box.dataset.v24boSignature=signature;
 const chips=known.map(x=>`<span class="v24bo-chip">${x.label}: <b>${x.remaining>0?`${euro(x.remaining)} offen`:'voll genutzt'}</b></span>`).join('');
 const unknown=items.length-known.length;
 const title=!known.length?'Nutzungsstände fehlen':total>0?'Noch nicht ausgeschöpft':'Bekannte Guthaben ausgeschöpft';
 const copy=!known.length
  ?`Für ${items.length} Vorteil${items.length===1?'':'e'} ist bisher nur der enthaltene Vorteil bekannt – nicht, wie viel du schon genutzt hast.`
  :`Nur ausdrücklich in VAYQUO hinterlegte Nutzungsstände werden gerechnet.${unknown?` ${unknown} Vorteil${unknown===1?'':'e'} ohne bekannten Nutzungsstand.`:''}`;
 box.innerHTML=`<div class="v24bo-kicker">VAYQUO VORTEILS-CHECK</div><div class="v24bo-top"><h3>${title}</h3>${known.length?`<div class="v24bo-total"><b>${euro(total)}</b><span>bekannter offener Wert</span></div>`:''}</div><p class="v24bo-copy">${copy}</p>${chips?`<div class="v24bo-chips">${chips}</div>`:''}${next?`<button type="button" class="v24bo-next" data-v24bo-next><b>Als Nächstes prüfen: ${next.label} · ${euro(next.remaining)} offen</b><span>→</span></button><div class="v24bo-note">Priorisiert nach dem größten ausdrücklich hinterlegten offenen Betrag – nicht nach Defaultwerten.</div>`:''}`;
 q('[data-v24bo-next]',box)?.addEventListener('click',()=>openItem(next));
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{render();}catch(e){console.warn('VAYQUO benefit optimizer',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
