(()=>{
'use strict';

const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-flight-search';
const PUBLISHABLE_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const MANUAL_IDS=['fCash','fFees','fAward','fHave','fMin'];

let lastSignature='';
let inFlight=null;
let seq=0;
let manualMode=false;
let scheduled=false;

function setText(el,value){if(el&&text(el)!==value)el.textContent=value;}

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

function patchUi(){
 if(!q('#fFrom')||!q('#fTo')||!q('#fCash'))return;
 const btn=primaryButton();
 if(!btn)return;
 btn.dataset.vayquoLivePrimary='1';
 ensureStatus(btn);
 ensureFallback(btn);
 setManualVisibility(manualMode);
 const fallback=q('#vayquo-manual-flight-toggle');
 if(manualMode){
  setText(btn,'Jetzt prüfen');
  setText(fallback,'Zur automatischen Flugsuche');
  setStatus('Manueller Vergleich: Werte nur eingeben, wenn du ein konkretes Angebot selbst prüfen möchtest.');
 }else{
  setText(btn,'Flüge suchen');
  setText(fallback,'Angebot selbst vergleichen');
  if(window.VAYQUO_FLIGHT_LIVE?.status!=='loading'&&window.VAYQUO_FLIGHT_LIVE?.status!=='success')setStatus('');
 }
}

function expose(status,extra={}){
 const detail={status,...extra};
 window.VAYQUO_FLIGHT_LIVE=detail;
 document.documentElement.dataset.vayquoFlightLive=status;
 if(status==='loading')setStatus('Flüge werden gesucht …');
 if(status==='success')setStatus('Flugdaten empfangen. VAYQUO bereitet die Ergebnisse vor.');
 if(status==='error')setStatus('Die Live-Flugsuche konnte dieses Angebot noch nicht laden. Du kannst es bei Bedarf unten selbst vergleichen.','error');
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
   expose('success',{query,source:payload.source||'nuitee',data:payload.data});
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
  setStatus('Bitte zuerst Abflughafen, Zielflughafen und Reisedatum auswählen.','error');
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
