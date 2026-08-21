(()=>{
'use strict';
const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-flight-search';
const APIKEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const ANON_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdmZmc2xobmFxbHdpdGFlZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjY1MTksImV4cCI6MjEwMTcwMjUxOX0.1hB-03qo16qMBfOngy3w9oJBkjf7p992KzPjTyTzHcw';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const normFlight=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

function injectStyle(){
 if($('#v25-live-cash-style'))return;
 const st=document.createElement('style');st.id='v25-live-cash-style';st.textContent=`
 .v25lc{margin-top:12px;border:1px solid rgba(247,241,231,.12);border-radius:22px;background:rgba(255,255,255,.04);padding:16px}
 .v25lc-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.v25lc-head small{display:block;font-size:9px;letter-spacing:.09em;font-weight:850;color:#d6bd8a}.v25lc-head h3{font-size:15px;margin:5px 0 3px}.v25lc-head p{font-size:10px;line-height:1.45;color:#9fb0ae;margin:0}.v25lc-toggle{border:1px solid rgba(247,241,231,.12);background:rgba(255,255,255,.035);color:#f7f1e7;border-radius:12px;padding:8px 10px;font-size:10px;font-weight:800}
 .v25lc-body{display:grid;gap:10px;margin-top:12px}.v25lc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v25lc label{display:block;font-size:9px;font-weight:750;color:#9fb0ae;margin-bottom:5px}.v25lc input,.v25lc select{width:100%;min-height:44px;padding:10px 11px;border:1px solid rgba(247,241,231,.12);border-radius:13px;background:rgba(255,255,255,.035);color:#f7f1e7;outline:0}.v25lc select option{color:#111;background:#fff}.v25lc button.v25lc-search{width:100%;border:0;border-radius:14px;background:#f7f1e7;color:#092022;padding:12px 13px;font-weight:850}.v25lc-status{font-size:10px;line-height:1.45;color:#9fb0ae}.v25lc-status.good{color:#9ed1af}.v25lc-status.warn{color:#e2c27a}.v25lc-offers{display:grid;gap:7px}.v25lc-offer{border:1px solid rgba(247,241,231,.1);border-radius:13px;padding:9px 10px;background:rgba(0,0,0,.1);display:flex;justify-content:space-between;gap:9px}.v25lc-offer b{font-size:11px}.v25lc-offer span{font-size:9px;color:#9fb0ae}.v25lc-offer strong{font-size:12px;white-space:nowrap}
 `;document.head.appendChild(st);
}
function todayPlus(days){const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function mount(){
 const screen=$('#screen-check');if(!screen||$('#v25-live-cash'))return;
 injectStyle();
 const firstCard=screen.querySelector('.card');
 const box=document.createElement('section');box.id='v25-live-cash';box.className='v25lc';box.innerHTML=`
  <div class="v25lc-head"><div><small>LIVE-BARPREIS</small><h3>Vergleichsflug automatisch suchen</h3><p>Optional. Mit Flugnummer versucht VAYQUO denselben Flug zu treffen.</p></div><button class="v25lc-toggle" type="button">Öffnen</button></div>
  <div class="v25lc-body hide">
   <div class="v25lc-grid"><div><label>Von</label><input id="v25lc-from" maxlength="3" placeholder="FRA" autocapitalize="characters"></div><div><label>Nach</label><input id="v25lc-to" maxlength="3" placeholder="JFK" autocapitalize="characters"></div></div>
   <div class="v25lc-grid"><div><label>Hinflug</label><input id="v25lc-date" type="date" value="${todayPlus(21)}"></div><div><label>Reise</label><select id="v25lc-trip"><option value="oneway">Einfach</option><option value="roundtrip">Hin & zurück</option></select></div></div>
   <div class="v25lc-grid hide" id="v25lc-return-row"><div><label>Rückflug</label><input id="v25lc-return" type="date" value="${todayPlus(28)}"></div><div></div></div>
   <div class="v25lc-grid"><div><label>Kabine</label><select id="v25lc-cabin"><option value="ECONOMY">Economy</option><option value="PREMIUM_ECONOMY">Premium Economy</option><option value="BUSINESS">Business</option><option value="FIRST">First</option></select></div><div><label>Erwachsene</label><input id="v25lc-adults" type="number" min="1" max="9" value="1"></div></div>
   <div><label>Flugnummer optional</label><input id="v25lc-flight" placeholder="z. B. LH400"><div style="font-size:9px;color:#9fb0ae;margin-top:4px">Ohne Flugnummer ist der gefundene Preis nur ein Marktvergleich und wird nicht automatisch als identisches Angebot markiert.</div></div>
   <button class="v25lc-search" type="button">Live-Barpreis suchen</button>
   <div class="v25lc-status" id="v25lc-status"></div><div class="v25lc-offers" id="v25lc-offers"></div>
  </div>`;
 if(firstCard)firstCard.insertAdjacentElement('afterend',box);else screen.prepend(box);
 box.querySelector('.v25lc-toggle').addEventListener('click',()=>{const body=box.querySelector('.v25lc-body');body.classList.toggle('hide');box.querySelector('.v25lc-toggle').textContent=body.classList.contains('hide')?'Öffnen':'Schließen';});
 $('#v25lc-trip').addEventListener('change',()=>$('#v25lc-return-row').classList.toggle('hide',$('#v25lc-trip').value!=='roundtrip'));
 box.querySelector('.v25lc-search').addEventListener('click',search);
}
function setStatus(text,kind='') {const el=$('#v25lc-status');if(!el)return;el.textContent=text;el.className='v25lc-status '+kind;}
function renderOffers(offers){const el=$('#v25lc-offers');if(!el)return;el.innerHTML=(offers||[]).slice(0,3).map(o=>`<div class="v25lc-offer"><div><b>${esc(o.airline||'Airline')}</b><br><span>${esc((o.flightNumbers||[]).join(' · '))}</span></div><strong>${esc(euro(o.price?.total))}</strong></div>`).join('');}
async function search(){
 const origin=String($('#v25lc-from')?.value||'').trim().toUpperCase(),destination=String($('#v25lc-to')?.value||'').trim().toUpperCase(),departureDate=$('#v25lc-date')?.value||'',tripType=$('#v25lc-trip')?.value||'oneway',returnDate=tripType==='roundtrip'?($('#v25lc-return')?.value||''):'',cabinClass=$('#v25lc-cabin')?.value||'ECONOMY',adults=Math.max(1,Number($('#v25lc-adults')?.value)||1),wanted=normFlight($('#v25lc-flight')?.value);
 if(!/^[A-Z]{3}$/.test(origin)||!/^[A-Z]{3}$/.test(destination)||!departureDate){setStatus('Bitte IATA-Codes und Datum vollständig eingeben.','warn');return;}
 setStatus('Live-Preis wird geprüft …');renderOffers([]);
 try{
  const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':APIKEY,'Authorization':`Bearer ${ANON_JWT}`},body:JSON.stringify({origin,destination,departureDate,tripType,returnDate:returnDate||null,adults,children:0,infants:0,cabinClass,currency:'EUR'})});
  const data=await res.json().catch(()=>null);
  if(!res.ok){setStatus(data?.error==='UNAUTHORIZED'?'Live-Suche benötigt noch die VAYQUO-Anmeldung.':`Live-Suche nicht verfügbar (${data?.error||res.status}).`,'warn');return;}
  if(data?.liveData!==true||data?.environment!=='production'){setStatus('Der Flugprovider liefert aktuell noch keine freigegebenen Produktionspreise. VAYQUO verwendet deshalb keine Testpreise.','warn');return;}
  const offers=Array.isArray(data.offers)?data.offers:[];renderOffers(offers);
  if(!offers.length){setStatus('Kein validierter Live-Preis für diese Suche gefunden.','warn');return;}
  let pick=null,exact=false;
  if(wanted){pick=offers.find(o=>(o.flightNumbers||[]).some(f=>normFlight(f)===wanted))||null;exact=!!pick;if(!pick){setStatus('Live-Flüge gefunden, aber die angegebene Flugnummer war nicht dabei. Preis wurde nicht übernommen.','warn');return;}}
  else pick=offers[0];
  const cash=$('#cash'),comp=$('#comparable');if(cash)cash.value=Number(pick.price?.total)||'';
  if(comp&&!exact)comp.checked=false;
  setStatus(exact?`${pick.flightNumbers.join(' · ')} gefunden: ${euro(pick.price.total)} übernommen. Tarifbedingungen bitte noch vergleichen.`:`Günstigster Live-Marktpreis ${euro(pick.price.total)} übernommen. „Vergleichbar“ wurde ausgeschaltet, weil es nicht zwingend derselbe Flug ist.`,exact?'good':'warn');
 }catch(e){setStatus('Live-Suche konnte nicht erreicht werden. Deine manuelle Angebotsprüfung funktioniert weiter.','warn');}
}
function boot(){mount();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();