(()=>{
'use strict';

const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-flight-search';
const PUBLISHABLE_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const MANUAL_IDS=['fProgram','fCash','fFees','fAward','fHave','fMin'];

let lastSignature='';
let inFlight=null;
let seq=0;
let manualMode=false;
let scheduled=false;
let visibleOffers=8;
let latestOffers=[];

function setText(el,value){if(el&&text(el)!==value)el.textContent=value;}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function flightBlock(){
 const from=q('#fFrom'),to=q('#fTo'),cash=q('#fCash');
 if(!from||!to||!cash)return q('#app')||document;
 let node=cash.parentElement;
 for(let i=0;i<10&&node;i++,node=node.parentElement){
  if(node.contains(from)&&node.contains(to))return node;
 }
 return q('#app')||document;
}

function dateInput(returnTrip=false){
 const direct=returnTrip
  ?q('#fReturnDate,#fReturn,#flightReturnDate')
  :q('#fDate,#fDepartureDate,#flightDate');
 if(direct)return direct;
 const root=flightBlock();
 const dates=qa('input[type="date"]',root);
 if(returnTrip)return dates[1]||null;
 if(dates[0])return dates[0];
 const inputs=qa('input',root);
 return inputs.find(el=>/reisedatum|hinflug|abflugdatum|datum/i.test(text(el.closest('.field')?.querySelector('label'))))||null;
}

function normalizeDate(value){
 const raw=String(value??'').trim();
 return /^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:'';
}

function cabinClass(){
 const el=q('#fCabin');
 const raw=`${el?.value||''} ${el?.selectedOptions?.[0]?.textContent||''}`.trim().toLowerCase();
 if(/first|erste/.test(raw))return 'FIRST';
 if(/business/.test(raw))return 'BUSINESS';
 if(/premium/.test(raw))return 'PREMIUM_ECONOMY';
 return 'ECONOMY';
}

function adults(){
 const el=q('#fAdults,#flightAdults,#travellers,#passengers');
 const n=Math.trunc(Number(el?.value));
 return Number.isFinite(n)&&n>=1?Math.min(9,n):1;
}

function buildQuery(){
 const origin=String(q('#fFrom')?.value||'').trim().toUpperCase();
 const destination=String(q('#fTo')?.value||'').trim().toUpperCase();
 const departureDate=normalizeDate(dateInput(false)?.value);
 const returnDate=normalizeDate(dateInput(true)?.value);
 if(!/^[A-Z]{3}$/.test(origin)||!/^[A-Z]{3}$/.test(destination)||origin===destination||!departureDate)return null;
 return {origin,destination,departureDate,returnDate:returnDate||undefined,adults:adults(),cabinClass:cabinClass(),currency:'EUR'};
}

function signature(query){return JSON.stringify(query);}
function fieldWrap(id){const el=q('#'+id);return el?.closest('.field')||el?.parentElement||null;}

function primaryButton(){
 const root=flightBlock();
 const candidates=qa('button,[role="button"]',root).filter(btn=>!btn.closest('#bottom,.bottom,.v24s2-info-sheet,.v24s2-airport-sheet'));
 return candidates.find(btn=>btn.dataset.vayquoLivePrimary==='1')
  ||candidates.find(btn=>/^(jetzt prüfen|vergleichen|flüge suchen|diesen flug bewerten)$/i.test(text(btn)))
  ||null;
}

function ensureStyle(){
 if(q('#vayquo-flight-live-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-live-style';
 style.textContent=`
  #vayquo-flight-results{margin:14px 0 16px;display:grid;gap:10px}
  .vayquo-flight-result{width:100%;box-sizing:border-box;text-align:left;border:1px solid rgba(120,126,124,.18);background:rgba(255,255,255,.52);border-radius:18px;padding:14px 15px;color:inherit;font:inherit;box-shadow:0 7px 20px rgba(25,29,28,.04)}
  .vayquo-flight-result:active{transform:scale(.995)}
  .vayquo-flight-result.is-selected{border-color:rgba(26,28,28,.65);box-shadow:0 0 0 1px rgba(26,28,28,.12)}
  .vayquo-flight-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .vayquo-flight-airline{font-size:15px;font-weight:750;line-height:1.25}
  .vayquo-flight-number{margin-top:3px;font-size:11px;color:var(--muted,#879391)}
  .vayquo-flight-price{font-size:18px;font-weight:800;white-space:nowrap;letter-spacing:-.02em}
  .vayquo-flight-route{display:flex;align-items:center;gap:9px;margin-top:13px;font-size:17px;font-weight:740}
  .vayquo-flight-route span:nth-child(2){font-size:12px;color:var(--muted,#879391);font-weight:500}
  .vayquo-flight-meta{margin-top:7px;font-size:12px;line-height:1.45;color:var(--muted,#879391)}
  .vayquo-flight-more{width:100%;border:0;background:transparent;padding:8px 0;color:var(--muted,#879391);font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:3px}
 `;
 document.head.appendChild(style);
}

function ensureStatus(btn){
 let el=q('#vayquo-flight-live-status');
 if(el||!btn)return el;
 el=document.createElement('div');
 el.id='vayquo-flight-live-status';
 el.setAttribute('role','status');
 el.style.cssText='margin:10px 0 0;font-size:13px;line-height:1.45;color:var(--muted,#9ba9a8);display:none';
 btn.insertAdjacentElement('beforebegin',el);
 return el;
}

function setStatus(message,type='info'){
 const btn=primaryButton();
 const el=ensureStatus(btn);
 if(!el)return;
 setText(el,message||'');
 el.style.display=message?'block':'none';
 el.style.color=type==='error'?'#b86a63':'var(--muted,#9ba9a8)';
}

function setManualVisibility(show){
 MANUAL_IDS.forEach(id=>{const wrap=fieldWrap(id);if(wrap)wrap.hidden=!show;});
 const results=q('#vayquo-flight-results');
 if(results)results.hidden=show;
}

function hideOptionalMarker(control){
 const field=control?.closest('.field');
 if(!field)return;
 qa('small,span',field).filter(el=>/^optional$/i.test(text(el))).forEach(el=>el.hidden=true);
}

function ensureFallback(btn){
 if(!btn||q('#vayquo-manual-flight-toggle'))return;
 const fallback=document.createElement('button');
 fallback.type='button';
 fallback.id='vayquo-manual-flight-toggle';
 fallback.textContent='Angebot selbst vergleichen';
 fallback.style.cssText='display:block;width:100%;margin:10px 0 0;padding:8px 0;border:0;background:transparent;color:var(--muted,#9ba9a8);font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer';
 fallback.addEventListener('click',ev=>{
  ev.preventDefault();ev.stopPropagation();
  manualMode=!manualMode;
  patchUi();
 });
 btn.insertAdjacentElement('afterend',fallback);
}

function timeOnly(value){
 if(!value)return '';
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return String(value).slice(11,16);
 return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(d);
}
function durationLabel(minutes){
 const n=Number(minutes);if(!Number.isFinite(n)||n<=0)return '';
 const h=Math.floor(n/60),m=n%60;
 return `${h?`${h} Std. `:''}${m?`${m} Min.`:''}`.trim();
}
function priceLabel(price){
 const total=Number(price?.total);if(!Number.isFinite(total))return '';
 try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:price?.currency||'EUR'}).format(total);}catch{return `${total.toFixed(2)} ${price?.currency||'EUR'}`;}
}
function stopsLabel(stops){const n=Math.max(0,Number(stops)||0);return n===0?'Direkt':n===1?'1 Stopp':`${n} Stopps`;}

function ensureResults(){
 let box=q('#vayquo-flight-results');
 const btn=primaryButton();
 if(box||!btn)return box;
 box=document.createElement('div');
 box.id='vayquo-flight-results';
 btn.insertAdjacentElement('beforebegin',box);
 return box;
}

function selectOffer(offer,button){
 qa('.vayquo-flight-result').forEach(el=>el.classList.remove('is-selected'));
 button?.classList.add('is-selected');
 window.VAYQUO_SELECTED_FLIGHT=offer;
 const cash=q('#fCash');
 if(cash&&Number.isFinite(Number(offer?.price?.total))){
  const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  const value=String(offer.price.total);
  if(descriptor?.set)descriptor.set.call(cash,value);else cash.value=value;
  cash.dispatchEvent(new Event('input',{bubbles:true}));
  cash.dispatchEvent(new Event('change',{bubbles:true}));
 }
 setStatus('Flug ausgewählt. Den Barpreis hat VAYQUO automatisch übernommen.');
 try{window.dispatchEvent(new CustomEvent('vayquo:flight-selected',{detail:{offer}}));}catch{}
}

function renderOffers(offers){
 ensureStyle();
 const box=ensureResults();
 if(!box)return;
 latestOffers=Array.isArray(offers)?offers:[];
 box.innerHTML='';
 box.hidden=manualMode;
 if(!latestOffers.length){
  box.innerHTML='<div style="padding:12px 0;font-size:13px;color:var(--muted,#879391)">Für diese Suche wurden keine buchbaren Flüge gefunden.</div>';
  return;
 }
 const shown=latestOffers.slice(0,visibleOffers);
 for(const offer of shown){
  const button=document.createElement('button');
  button.type='button';
  button.className='vayquo-flight-result';
  const numbers=Array.isArray(offer.flightNumbers)?offer.flightNumbers.join(' · '):'';
  const meta=[stopsLabel(offer.stops),durationLabel(offer.durationMinutes),offer.cabin].filter(Boolean).join(' · ');
  const bags=[offer?.baggage?.carryOnIncluded?'Handgepäck inklusive':'',offer?.baggage?.checkedIncluded?'Aufgabegepäck inklusive':''].filter(Boolean).join(' · ');
  button.innerHTML=`<div class="vayquo-flight-top"><div><div class="vayquo-flight-airline">${esc(offer.airline||'Flug')}</div>${numbers?`<div class="vayquo-flight-number">${esc(numbers)}</div>`:''}</div><div class="vayquo-flight-price">${esc(priceLabel(offer.price))}</div></div><div class="vayquo-flight-route"><b>${esc(timeOnly(offer.departureTime))}</b><span>${esc(offer.origin||'')} → ${esc(offer.destination||'')}</span><b>${esc(timeOnly(offer.arrivalTime))}</b></div><div class="vayquo-flight-meta">${esc(meta)}${bags?`<br>${esc(bags)}`:''}</div>`;
  button.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();selectOffer(offer,button);});
  box.appendChild(button);
 }
 if(latestOffers.length>shown.length){
  const more=document.createElement('button');
  more.type='button';more.className='vayquo-flight-more';
  more.textContent=`Weitere ${Math.min(8,latestOffers.length-shown.length)} Flüge anzeigen`;
  more.addEventListener('click',()=>{visibleOffers+=8;renderOffers(latestOffers);});
  box.appendChild(more);
 }
}

function patchUi(){
 if(!q('#fFrom')||!q('#fTo')||!q('#fCash'))return;
 const btn=primaryButton();
 if(!btn)return;
 btn.dataset.vayquoLivePrimary='1';
 ensureStatus(btn);
 ensureFallback(btn);
 hideOptionalMarker(q('#fFrom'));
 hideOptionalMarker(q('#fTo'));
 hideOptionalMarker(dateInput(false));
 setManualVisibility(manualMode);
 const fallback=q('#vayquo-manual-flight-toggle');
 if(manualMode){
  setText(btn,'Jetzt prüfen');
  setText(fallback,'Zur automatischen Flugsuche');
  setStatus('Manueller Vergleich: Werte nur eingeben, wenn du ein konkretes Angebot selbst prüfen möchtest.');
 }else{
  setText(btn,'Flüge suchen');
  setText(fallback,'Angebot selbst vergleichen');
  if(latestOffers.length&&!q('#vayquo-flight-results'))renderOffers(latestOffers);
  else if(!latestOffers.length&&window.VAYQUO_FLIGHT_LIVE?.status!=='loading'&&window.VAYQUO_FLIGHT_LIVE?.status!=='success')setStatus('');
 }
}

function expose(status,extra={}){
 const detail={status,...extra};
 window.VAYQUO_FLIGHT_LIVE=detail;
 document.documentElement.dataset.vayquoFlightLive=status;
 if(status==='loading'){
  latestOffers=[];visibleOffers=8;
  q('#vayquo-flight-results')?.remove();
  setStatus('Flüge werden gesucht …');
 }
 if(status==='success'){
  const offers=Array.isArray(extra.offers)?extra.offers:[];
  renderOffers(offers);
  setStatus(offers.length?`${offers.length} Flug${offers.length===1?'':'e'} gefunden.`:'Keine buchbaren Flüge gefunden.');
 }
 if(status==='error')setStatus('Die Live-Flugsuche konnte gerade keine Ergebnisse laden. Du kannst es erneut versuchen oder unten ein Angebot selbst vergleichen.','error');
 try{window.dispatchEvent(new CustomEvent('vayquo:flight-live',{detail}));}catch{}
}

async function search(query){
 const sig=signature(query);
 if(sig===lastSignature&&(inFlight||window.VAYQUO_FLIGHT_LIVE?.status==='success'))return inFlight||window.VAYQUO_FLIGHT_LIVE;
 lastSignature=sig;
 const requestId=++seq;
 expose('loading',{query});
 const task=(async()=>{
  try{
   const res=await fetch(ENDPOINT,{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':PUBLISHABLE_KEY},
    body:JSON.stringify(query),
    cache:'no-store'
   });
   let payload=null;
   try{payload=await res.json();}catch{}
   if(requestId!==seq)return null;
   if(!res.ok||!payload?.ok){
    expose('error',{query,httpStatus:res.status,error:payload?.error||'FLIGHT_SEARCH_FAILED',providerStatus:payload?.providerStatus||null});
    return null;
   }
   expose('success',{query,source:payload.source||'nuitee',offers:Array.isArray(payload.offers)?payload.offers:[]});
   return payload;
  }catch{
   if(requestId===seq)expose('error',{query,error:'FLIGHT_SEARCH_UNREACHABLE'});
   return null;
  }finally{
   if(requestId===seq)inFlight=null;
  }
 })();
 inFlight=task;
 return task;
}

function focusMissing(){
 const from=q('#fFrom'),to=q('#fTo'),date=dateInput(false);
 if(!/^[A-Z]{3}$/.test(String(from?.value||'').trim().toUpperCase()))return from?.click?.();
 if(!/^[A-Z]{3}$/.test(String(to?.value||'').trim().toUpperCase()))return to?.click?.();
 date?.focus?.();
}

document.addEventListener('click',ev=>{
 const btn=ev.target.closest?.('button,[role="button"]');
 const primary=primaryButton();
 if(!btn||btn!==primary||manualMode)return;
 ev.preventDefault();
 ev.stopImmediatePropagation();
 const query=buildQuery();
 if(!query){
  setStatus('Bitte Abflughafen, Zielflughafen und Reisedatum auswählen.','error');
  focusMissing();
  return;
 }
 void search(query);
},true);

function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;try{patchUi();}catch(e){console.warn('VAYQUO flight live UI',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});

window.VAYQUO_FLIGHT_API={search:()=>{const query=buildQuery();return query?search(query):Promise.resolve(null);},getQuery:buildQuery};
})();
