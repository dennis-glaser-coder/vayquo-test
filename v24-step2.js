(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const AIRPORT_DATA_FILES=Array.from({length:21},(_,i)=>`assets/airports-${String(i+1).padStart(2,'0')}.txt`);

const FALLBACK_AIRPORTS=[
 ['DUS','Düsseldorf Airport','Düsseldorf','DE'],['FRA','Frankfurt Airport','Frankfurt am Main','DE'],['MUC','Munich Airport','München','DE'],['BER','Berlin Brandenburg Airport','Berlin','DE'],['HAM','Hamburg Airport','Hamburg','DE'],['CGN','Cologne Bonn Airport','Köln/Bonn','DE'],['STR','Stuttgart Airport','Stuttgart','DE'],['HAJ','Hannover Airport','Hannover','DE'],['NUE','Nürnberg Airport','Nürnberg','DE'],['DTM','Dortmund Airport','Dortmund','DE'],['FMO','Münster Osnabrück Airport','Münster/Osnabrück','DE'],['PAD','Paderborn Lippstadt Airport','Paderborn/Lippstadt','DE'],
 ['PMI','Palma de Mallorca Airport','Palma de Mallorca','ES'],['BCN','Barcelona El Prat Airport','Barcelona','ES'],['MAD','Adolfo Suárez Madrid–Barajas Airport','Madrid','ES'],['LIS','Humberto Delgado Airport','Lissabon','PT'],['CDG','Charles de Gaulle Airport','Paris','FR'],['ORY','Paris Orly Airport','Paris','FR'],['AMS','Amsterdam Airport Schiphol','Amsterdam','NL'],['LHR','London Heathrow Airport','London','GB'],['LGW','London Gatwick Airport','London','GB'],['VIE','Vienna International Airport','Wien','AT'],['ZRH','Zürich Airport','Zürich','CH'],['FCO','Rome Fiumicino Airport','Rom','IT'],['MXP','Milan Malpensa Airport','Mailand','IT'],
 ['DXB','Dubai International Airport','Dubai','AE'],['DOH','Hamad International Airport','Doha','QA'],['AUH','Zayed International Airport','Abu Dhabi','AE'],['JFK','John F. Kennedy International Airport','New York','US'],['EWR','Newark Liberty International Airport','Newark / New York','US'],['MIA','Miami International Airport','Miami','US'],['LAX','Los Angeles International Airport','Los Angeles','US'],['SFO','San Francisco International Airport','San Francisco','US'],['BKK','Suvarnabhumi Airport','Bangkok','TH'],['SIN','Singapore Changi Airport','Singapur','SG']
].map(([code,name,city,country])=>({code,name,city,country}));

const HELP={
 fCabin:['Reiseklasse','Economy, Premium Economy, Business und First können sehr unterschiedliche Punktewerte haben. Deshalb wird die gewünschte Kabine separat berücksichtigt.'],
 fProgram:['Programm','Hier wählst du das Vielflieger- oder Transferprogramm, über das der konkrete Prämienflug bewertet werden soll.'],
 fCash:['Barpreis','Das ist der normale Geldpreis genau desselben Fluges. Nur so lässt sich fair berechnen, welchen Gegenwert deine Punkte oder Meilen wirklich liefern.'],
 fAward:['Prämienpreis','So viele Punkte oder Meilen verlangt das gewählte Programm für genau diesen Flug.'],
 fFees:['Steuern & Gebühren','Diese Zuzahlung fällt bei vielen Prämienflügen zusätzlich zu den Punkten oder Meilen an und wird beim Gegenwert mitgerechnet.'],
 fHave:['Bereits vorhandene Punkte','Das sind Punkte oder Meilen, die du im Zielprogramm bereits besitzt. VAYQUO berücksichtigt sie, bevor ein Transfer empfohlen wird.'],
 fMin:['Dein Mindestwert','Deine persönliche Untergrenze für den Wert eines Membership-Rewards-Punktes. Liegt ein Flug darunter, ist Barzahlung möglicherweise sinnvoller.']
};

let airports=null;
let loadingAirports=null;
let activeAirportInput=null;
let resultLimit=80;
let airportSource='fallback';

async function loadAirports(){
 if(airports)return airports;
 if(loadingAirports)return loadingAirports;
 loadingAirports=(async()=>{
  try{
   const parts=await Promise.all(AIRPORT_DATA_FILES.map(async file=>{
    const res=await fetch(file,{cache:'force-cache'});
    if(!res.ok)throw new Error('airport list '+res.status);
    return (await res.text()).trim();
   }));
   const binary=atob(parts.join(''));
   const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
   const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
   const rows=JSON.parse(await new Response(stream).text());
   if(!Array.isArray(rows)||rows.length<1000)throw new Error('airport list invalid');
   airports=rows.filter(a=>Array.isArray(a)&&/^[A-Z]{3}$/.test(a[0]||'')).map(([code,name,city,country])=>({code,name,city,country}));
   if(airports.length<1000)throw new Error('airport list invalid');
   airportSource='local';
  }catch(err){console.warn('VAYQUO airport list fallback',err);airports=FALLBACK_AIRPORTS;airportSource='fallback';}
  return airports;
 })();
 return loadingAirports;
}

function ensureInfoSheet(){
 if(q('#v24s2-info-backdrop'))return;
 document.body.insertAdjacentHTML('beforeend','<div id="v24s2-info-backdrop" class="v24s2-backdrop"></div><section id="v24s2-info-sheet" class="v24s2-info-sheet" role="dialog" aria-modal="true"><div class="v24s2-grab"></div><div id="v24s2-info-content"></div></section>');
 q('#v24s2-info-backdrop').addEventListener('click',closeInfo);
}
function openInfo(title,body){
 ensureInfoSheet();
 q('#v24s2-info-content').innerHTML=`<div class="v24s2-sheet-head"><div><div class="v24s2-kicker">Kurz erklärt</div><h3>${title}</h3></div><button type="button" class="v24s2-close" aria-label="Schließen">×</button></div><p>${body}</p>`;
 q('#v24s2-info-content .v24s2-close').addEventListener('click',closeInfo);
 q('#v24s2-info-backdrop').classList.add('is-open');q('#v24s2-info-sheet').classList.add('is-open');
}
function closeInfo(){q('#v24s2-info-backdrop')?.classList.remove('is-open');q('#v24s2-info-sheet')?.classList.remove('is-open');}
function makeInfoButton(title,body){
 const b=document.createElement('button');b.type='button';b.className='v24s2-info';b.textContent='i';b.setAttribute('aria-label',`${title} erklären`);
 b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openInfo(title,body);});return b;
}
function addInfoButtons(){
 for(const [id,[title,body]] of Object.entries(HELP)){
  const control=q('#'+id);const field=control?.closest('.field');const label=q('label',field);
  if(!control||!field||!label||field.dataset.v24s2Info)continue;
  label.appendChild(makeInfoButton(title,body));field.dataset.v24s2Info='1';
 }
}

function ensureAirportSheet(){
 if(q('#v24s2-airport-backdrop'))return;
 document.body.insertAdjacentHTML('beforeend',`<div id="v24s2-airport-backdrop" class="v24s2-backdrop"></div><section id="v24s2-airport-sheet" class="v24s2-airport-sheet" role="dialog" aria-modal="true" aria-label="Flughafen auswählen"><div class="v24s2-grab"></div><div class="v24s2-sheet-head"><div><div class="v24s2-kicker">Flughafenliste</div><h3>Flughafen auswählen</h3><small id="v24s2-airport-count">Flughäfen werden geladen …</small></div><button type="button" class="v24s2-close" aria-label="Schließen">×</button></div><div class="v24s2-search-wrap"><span>⌕</span><input id="v24s2-airport-search" type="search" autocomplete="off" placeholder="Stadt, Flughafen oder IATA-Code"></div><button type="button" id="v24s2-airport-clear" class="v24s2-clear">Keine Angabe / Auswahl löschen</button><div id="v24s2-airport-results" class="v24s2-airport-results"></div></section>`);
 q('#v24s2-airport-backdrop').addEventListener('click',closeAirportPicker);
 q('#v24s2-airport-sheet .v24s2-close').addEventListener('click',closeAirportPicker);
 q('#v24s2-airport-search').addEventListener('input',()=>{resultLimit=80;renderAirportResults();});
 q('#v24s2-airport-clear').addEventListener('click',()=>selectAirport(''));
}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function airportHaystack(a){return norm(`${a.code} ${a.name} ${a.city} ${a.country}`);}
function currentMatches(){
 const query=norm(q('#v24s2-airport-search')?.value||'');
 const source=airports||FALLBACK_AIRPORTS;
 let matches=query?source.filter(a=>airportHaystack(a).includes(query)):source.slice();
 if(query.length===3){const exact=query.toUpperCase();matches.sort((a,b)=>(a.code===exact?-1:0)-(b.code===exact?-1:0));}
 return matches;
}
function renderAirportResults(){
 const results=q('#v24s2-airport-results');if(!results)return;
 const matches=currentMatches();const shown=matches.slice(0,resultLimit);
 results.innerHTML=shown.map(a=>`<button type="button" class="v24s2-airport-row" data-code="${a.code}"><span class="v24s2-code">${a.code}</span><span class="v24s2-airport-copy"><b>${escapeHtml(a.city||a.name||a.code)}</b><small>${escapeHtml(a.name)}${a.country?` · ${escapeHtml(a.country)}`:''}</small></span><span class="v24s2-chevron">›</span></button>`).join('')||'<div class="v24s2-empty">Kein Flughafen gefunden. Suche z. B. nach „Düsseldorf“, „Mallorca“ oder „JFK“.</div>';
 if(matches.length>shown.length)results.insertAdjacentHTML('beforeend',`<button type="button" id="v24s2-more" class="v24s2-more">Weitere ${Math.min(80,matches.length-shown.length)} anzeigen</button>`);
 qa('.v24s2-airport-row',results).forEach(row=>row.addEventListener('click',()=>selectAirport(row.dataset.code)));
 q('#v24s2-more',results)?.addEventListener('click',()=>{resultLimit+=80;renderAirportResults();});
}
async function openAirportPicker(input){
 activeAirportInput=input;ensureAirportSheet();resultLimit=80;
 q('#v24s2-airport-backdrop').classList.add('is-open');q('#v24s2-airport-sheet').classList.add('is-open');
 const search=q('#v24s2-airport-search');search.value='';renderAirportResults();setTimeout(()=>search.focus(),120);
 const list=await loadAirports();
 const suffix=airportSource==='local'?' · lokal gespeichert':' · Basisliste';
 q('#v24s2-airport-count').textContent=`${new Intl.NumberFormat('de-DE').format(list.length)} Flughäfen mit IATA-Code${suffix}`;
 renderAirportResults();
}
function closeAirportPicker(){q('#v24s2-airport-backdrop')?.classList.remove('is-open');q('#v24s2-airport-sheet')?.classList.remove('is-open');activeAirportInput=null;}
function selectAirport(code){
 if(!activeAirportInput)return;
 const descriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 if(descriptor?.set)descriptor.set.call(activeAirportInput,code);else activeAirportInput.value=code;
 activeAirportInput.dispatchEvent(new Event('input',{bubbles:true}));activeAirportInput.dispatchEvent(new Event('change',{bubbles:true}));
 closeAirportPicker();
}
function enhanceAirportInput(id,title){
 const input=q('#'+id);if(!input||input.dataset.v24s2Airport)return;
 input.dataset.v24s2Airport='1';input.readOnly=true;input.setAttribute('inputmode','none');input.setAttribute('autocomplete','off');input.setAttribute('aria-haspopup','dialog');input.classList.add('v24s2-airport-input');
 input.setAttribute('aria-label',`${title} aus Liste auswählen`);
 input.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openAirportPicker(input);});
}
function enhanceFlight(){
 q('#v24s2-airports')?.remove();
 if(!q('#fCash')||!q('#fFrom')||!q('#fTo'))return;
 enhanceAirportInput('fFrom','Abflughafen');enhanceAirportInput('fTo','Zielflughafen');addInfoButtons();
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceFlight();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
