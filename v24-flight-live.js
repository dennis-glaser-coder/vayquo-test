(()=>{
'use strict';

const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-flight-search';
const PUBLISHABLE_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const q=(s,r=document)=>r.querySelector(s);
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

let lastSignature='';
let inFlight=null;
let seq=0;

function commonRoot(){
 const from=q('#fFrom'),to=q('#fTo');
 if(!from||!to)return q('#app')||document;
 let node=from.parentElement;
 for(let i=0;i<8&&node;i++,node=node.parentElement){if(node.contains(to))return node;}
 return q('#app')||document;
}

function dateInput(returnTrip=false){
 const direct=returnTrip
  ?q('#fReturnDate,#fReturn,#flightReturnDate')
  :q('#fDate,#fDepartureDate,#flightDate');
 if(direct)return direct;
 const root=commonRoot();
 const dates=Array.from(root.querySelectorAll('input[type="date"]'));
 if(returnTrip)return dates[1]||null;
 if(dates[0])return dates[0];
 const inputs=Array.from(root.querySelectorAll('input'));
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

function expose(status,extra={}){
 const detail={status,...extra};
 window.VAYQUO_FLIGHT_LIVE=detail;
 document.documentElement.dataset.vayquoFlightLive=status;
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

function relevantAction(btn){
 if(!btn||btn.closest('#bottom,.bottom,.v24s2-info-sheet,.v24s2-airport-sheet'))return false;
 const root=commonRoot();
 if(root!==document&&!root.contains(btn))return false;
 return /weiter|flug|prüfen|vergleichen|auswählen|suchen/i.test(text(btn));
}

document.addEventListener('click',ev=>{
 const btn=ev.target.closest?.('button,[role="button"]');
 if(!relevantAction(btn))return;
 const query=buildQuery();
 if(query)void search(query);
},true);

window.VAYQUO_FLIGHT_API={search:()=>{const query=buildQuery();return query?search(query):Promise.resolve(null);},getQuery:buildQuery};
})();
