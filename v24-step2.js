(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const norm=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const txt=e=>norm(e&&e.textContent);

const AIRPORTS=[
  ['FRA','Frankfurt am Main'],['MUC','München'],['DUS','Düsseldorf'],['BER','Berlin Brandenburg'],['HAM','Hamburg'],['CGN','Köln/Bonn'],['STR','Stuttgart'],['HAJ','Hannover'],['NUE','Nürnberg'],['LEJ','Leipzig/Halle'],['DTM','Dortmund'],['FMO','Münster/Osnabrück'],['PAD','Paderborn/Lippstadt'],
  ['PMI','Palma de Mallorca'],['BCN','Barcelona'],['MAD','Madrid'],['LIS','Lissabon'],['CDG','Paris Charles de Gaulle'],['ORY','Paris Orly'],['AMS','Amsterdam'],['LHR','London Heathrow'],['LGW','London Gatwick'],['VIE','Wien'],['ZRH','Zürich'],['FCO','Rom Fiumicino'],['MXP','Mailand Malpensa'],['ATH','Athen'],['AYT','Antalya'],['HER','Heraklion'],['RHO','Rhodos'],
  ['DXB','Dubai'],['DOH','Doha'],['AUH','Abu Dhabi'],['JFK','New York JFK'],['EWR','Newark'],['MIA','Miami'],['LAX','Los Angeles'],['SFO','San Francisco'],['BKK','Bangkok'],['SIN','Singapur']
];

const helpMap=[
  ['abflughafen','Abflughafen','Wähle, wo deine Reise startet. Du kannst nach Stadt oder IATA-Code suchen, zum Beispiel Düsseldorf oder DUS.'],
  ['zielflughafen','Zielflughafen','Wähle dein Reiseziel. Die Strecke dient als Grundlage, damit VAYQUO später passende Bar- und Prämienflüge vergleichen kann.'],
  ['barpreis des gleichen fluges','Barpreis','Der normale Preis desselben Fluges. VAYQUO braucht ihn für den Vergleich mit dem Einsatz deiner Punkte oder Meilen.'],
  ['prämienpreis im programm','Prämienpreis','So viele Punkte oder Meilen verlangt das jeweilige Programm für diesen Flug. Mit Live-Daten soll VAYQUO diesen Wert später automatisch übernehmen.'],
  ['steuern & gebühren','Steuern & Gebühren','Der Geldbetrag, der bei einer Prämienbuchung zusätzlich zu Punkten oder Meilen anfällt. Er fließt in den echten Gegenwert ein.'],
  ['im programm schon vorhanden','Bereits vorhandene Punkte','Punkte oder Meilen, die du im Zielprogramm bereits hast. VAYQUO berücksichtigt sie, bevor ein Transfer empfohlen wird.'],
  ['dein mindestwert','Dein Mindestwert','Deine persönliche Untergrenze pro Punkt. VAYQUO kann dich damit vor einem schlechten Einsatz warnen.']
];

function ownTextElements(){
  return qa('button,a,label,h1,h2,h3,h4,p,span,div,small,strong').filter(e=>e.children.length<4);
}
function findText(needle){
  const n=norm(needle);
  return ownTextElements().find(e=>txt(e).includes(n));
}
function findLabelInput(needle){
  const n=norm(needle);
  for(const el of qa('label,.field,.form-row,.form-group,[class*="field-"],[class$="-field"]')){
    if(!txt(el).includes(n)) continue;
    if(el.tagName==='LABEL'&&el.htmlFor){
      const linked=document.getElementById(el.htmlFor);
      if(linked?.matches('input,select')) return linked;
    }
    const input=q('input,select',el);
    if(input) return input;
  }
  const t=findText(needle);
  let p=t;
  for(let depth=0;p&&depth<5;depth++,p=p.parentElement){
    if(!txt(p).includes(n)) continue;
    const input=q('input,select',p);
    if(input) return input;
  }
  return null;
}

function ensureSheet(){
  if(q('#v24s2-sheet')) return;
  document.body.insertAdjacentHTML('beforeend','<div id="v24s2-backdrop" class="v24s2-backdrop"></div><section id="v24s2-sheet" class="v24s2-sheet" role="dialog" aria-modal="true" aria-label="Info"><div class="v24s2-grab"></div><div id="v24s2-sheet-content"></div></section>');
  q('#v24s2-backdrop').addEventListener('click',closeSheet);
}
function openHelp(title,body){
  ensureSheet();
  q('#v24s2-sheet-content').innerHTML=`<div class="v24s2-sheet-head"><div><div class="v24s2-sheet-kicker">Kurz erklärt</div><h3>${title}</h3></div><button type="button" class="v24s2-close" aria-label="Schließen">×</button></div><p>${body}</p>`;
  q('.v24s2-close').addEventListener('click',closeSheet);
  q('#v24s2-backdrop').classList.add('is-open');
  q('#v24s2-sheet').classList.add('is-open');
}
function closeSheet(){
  q('#v24s2-backdrop')?.classList.remove('is-open');
  q('#v24s2-sheet')?.classList.remove('is-open');
}
function helpButton(title,body){
  const b=document.createElement('button');
  b.type='button';
  b.className='v24s2-help';
  b.textContent='i';
  b.setAttribute('aria-label',`${title} erklären`);
  b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openHelp(title,body);});
  return b;
}

function addHelpButtons(){
  for(const [needle,title,body] of helpMap){
    const el=findText(needle);
    if(!el||el.dataset.v24s2Help) continue;
    el.appendChild(helpButton(title,body));
    el.dataset.v24s2Help='1';
  }
}

function airportValue(code,name){return `${code} — ${name}`;}
function airportCode(value){
  const m=String(value||'').toUpperCase().match(/\b([A-Z]{3})\b/);
  return m?m[1]:'';
}
function airportName(code){return AIRPORTS.find(([c])=>c===code)?.[1]||'';}
function saveRoute(from,to){
  try{localStorage.setItem('vayquo:flightRoute',JSON.stringify({from,to}));}catch{}
}
function loadRoute(){
  try{return JSON.parse(localStorage.getItem('vayquo:flightRoute')||'{}')||{};}catch{return {};}
}
function setRouteSummary(shell){
  const from=q('#v24s2-from',shell)?.value||'';
  const to=q('#v24s2-to',shell)?.value||'';
  const fromCode=airportCode(from),toCode=airportCode(to);
  const summary=q('#v24s2-route-summary',shell);
  if(!summary) return;
  if(fromCode&&toCode){
    summary.textContent=`${fromCode} → ${toCode}`;
    summary.classList.add('is-ready');
  }else{
    summary.textContent='Strecke auswählen';
    summary.classList.remove('is-ready');
  }
  saveRoute(from,to);
}

function addAirportPicker(){
  const cash=findLabelInput('barpreis des gleichen fluges');
  if(!cash||q('#v24s2-airports')) return;

  const inputBlock=cash.closest('.field,.input,.form-row,.form-group')||cash.parentElement?.parentElement||cash.parentElement;
  if(!inputBlock?.parentNode) return;

  const saved=loadRoute();
  const shell=document.createElement('section');
  shell.id='v24s2-airports';
  shell.className='v24s2-airports';
  const options=AIRPORTS.map(([code,name])=>`<option value="${airportValue(code,name)}"></option>`).join('');
  shell.innerHTML=`
    <div class="v24s2-airport-head">
      <div>
        <div class="v24s2-kicker">Dein Punkteflug</div>
        <strong id="v24s2-route-summary">Strecke auswählen</strong>
      </div>
      <button type="button" class="v24s2-help v24s2-route-help" aria-label="Flughafenauswahl erklären">i</button>
    </div>
    <div class="v24s2-airport-grid">
      <label class="v24s2-field"><span>Abflughafen</span><input id="v24s2-from" list="v24s2-airport-list" autocomplete="off" placeholder="z. B. DUS oder Düsseldorf"></label>
      <button type="button" id="v24s2-swap" class="v24s2-swap" aria-label="Abflug und Ziel tauschen">⇄</button>
      <label class="v24s2-field"><span>Zielflughafen</span><input id="v24s2-to" list="v24s2-airport-list" autocomplete="off" placeholder="z. B. PMI oder Palma"></label>
    </div>
    <datalist id="v24s2-airport-list">${options}</datalist>
    <div class="v24s2-airport-note">Stadt oder 3-stelligen Flughafencode eingeben – passende Flughäfen erscheinen direkt.</div>`;

  inputBlock.parentNode.insertBefore(shell,inputBlock);
  const from=q('#v24s2-from',shell),to=q('#v24s2-to',shell);
  from.value=saved.from||'';
  to.value=saved.to||'';
  setRouteSummary(shell);

  const routeHelp=q('.v24s2-route-help',shell);
  routeHelp.addEventListener('click',()=>openHelp('Flughafenauswahl','Wähle Start und Ziel über Stadt oder IATA-Code. Die Auswahl verändert noch keine Preise – sie bereitet die Strecke für die spätere Live-Flugsuche und den Punktevergleich vor.'));

  for(const input of [from,to]){
    input.addEventListener('input',()=>setRouteSummary(shell));
    input.addEventListener('change',()=>{
      const code=airportCode(input.value);
      const name=airportName(code);
      if(code&&name) input.value=airportValue(code,name);
      setRouteSummary(shell);
    });
  }
  q('#v24s2-swap',shell).addEventListener('click',()=>{
    const current=from.value;from.value=to.value;to.value=current;setRouteSummary(shell);
  });
}

function init(){
  addAirportPicker();
  addHelpButtons();
}

let scheduled=false;
const schedule=()=>{
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;init();});
};

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
