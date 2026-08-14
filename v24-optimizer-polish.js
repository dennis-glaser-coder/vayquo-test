(()=>{
'use strict';

if(!document.querySelector('script[data-v24ob-loader]')){
 const loader=document.createElement('script');
 loader.src='v24-onboarding.js?v=2401';
 loader.defer=true;
 loader.dataset.v24obLoader='1';
 document.body.appendChild(loader);
}

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let scheduled=false;
let lastScreen=null;
let intentOpen=true;

function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}

function addStyle(){
 if(document.getElementById('v24-optimizer-polish-style'))return;
 const style=document.createElement('style');
 style.id='v24-optimizer-polish-style';
 style.textContent=`
 .v24os-landing .v24os-decision{padding:19px 21px!important}
 .v24os-landing .v24os-decision-top{margin-bottom:12px!important}
 .v24os-landing .v24os-decision h1{margin-bottom:12px!important}
 .v24os-landing .v24os-decision>p{margin-bottom:15px!important;line-height:1.5!important}
 .v24os-landing .v24os-decision-action{min-height:48px!important}
 .v24os-landing .v24os-hold{margin-top:11px!important;padding-top:11px!important}
 .v24os-landing .v24os-why{margin-top:15px!important}
 .v24os-landing .v24os-proof-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 .v24os-landing .v24os-proof{padding:14px}
 .v24os-landing .v24os-proof strong{font-size:14px}
 .v24os-landing .v24os-proof span{font-size:10.5px}
 .v24os-landing>.v24os-text-action{display:inline-flex;margin:14px 2px 2px;font-size:12px}
 .v24os-landing .v24os-offer-late{margin-top:12px;margin-bottom:20px}
 .v24ctx{display:grid;gap:14px;padding:5px 0 22px}
 .v24ctx-head{padding:5px 2px 2px}
 .v24ctx-head small{display:block;font-size:9px;letter-spacing:.14em;font-weight:900;color:#8a7451}
 .v24ctx-head h1{margin:7px 0 8px;color:#171817;font-size:30px;line-height:1.05;letter-spacing:-.045em}
 .v24ctx-head p{margin:0;color:#68716e;font-size:13px;line-height:1.5}
 .v24ctx-list{display:grid;gap:10px}
 .v24ctx-option{width:100%;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:12px;padding:14px;border:1px solid rgba(23,24,23,.10);border-radius:18px;background:#fffdf9;color:#171817;text-align:left;font:inherit;cursor:pointer;box-shadow:0 6px 18px rgba(23,33,31,.035)}
 .v24ctx-option:active{transform:scale(.995)}
 .v24ctx-nr{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#eee9df;color:#7e6948;font-size:10px;font-weight:900;letter-spacing:.06em}
 .v24ctx-copy strong{display:block;font-size:14px;line-height:1.25;color:#1d2d2a}
 .v24ctx-copy span{display:block;margin-top:4px;color:#6f7975;font-size:10.5px;line-height:1.4}
 .v24ctx-arrow{font-size:20px;color:#b89b64}
 .v24ctx-return{display:inline-flex;margin:0 0 11px;padding:0;border:0;background:transparent;color:#596762;font:800 11px inherit;cursor:pointer}
 @media(max-width:360px){.v24os-landing .v24os-proof-grid{grid-template-columns:1fr!important}.v24ctx-head h1{font-size:27px}}
 `;
 document.head.appendChild(style);
}

function restoreIntentContent(screen){
 qa(':scope>[data-v24ctx-hidden="1"]',screen).forEach(el=>{el.hidden=false;delete el.dataset.v24ctxHidden;});
 q(':scope>.v24ctx',screen)?.remove();
}
function showIntent(screen){
 if(q(':scope>.v24ctx',screen))return;
 qa(':scope>*',screen).forEach(el=>{if(!el.classList.contains('v24ctx')){el.dataset.v24ctxHidden='1';el.hidden=true;}});
 const wrap=document.createElement('section');
 wrap.className='v24ctx';
 wrap.innerHTML=`<div class="v24ctx-head"><small>DEIN VORHABEN</small><h1>Was möchtest du gerade machen?</h1><p>Wähle dein Ziel. VAYQUO führt dich direkt zur passenden Auswertung.</p></div>
  <div class="v24ctx-list">
   <button type="button" class="v24ctx-option" data-v24ctx="flight"><span class="v24ctx-nr">01</span><span class="v24ctx-copy"><strong>Flug mit Punkten oder Meilen prüfen</strong><span>Prüfe den passenden Weg für einen Flug und deinen vorhandenen Bestand.</span></span><span class="v24ctx-arrow">›</span></button>
   <button type="button" class="v24ctx-option" data-v24ctx="offer"><span class="v24ctx-nr">02</span><span class="v24ctx-copy"><strong>Ich habe schon ein Angebot</strong><span>Barpreis, Punkte oder Meilen und Zuzahlung miteinander vergleichen.</span></span><span class="v24ctx-arrow">›</span></button>
   <button type="button" class="v24ctx-option" data-v24ctx="best"><span class="v24ctx-nr">03</span><span class="v24ctx-copy"><strong>Das Beste aus meinem Bestand machen</strong><span>VAYQUO zeigt dir, womit du anhand deines Setups anfangen solltest.</span></span><span class="v24ctx-arrow">›</span></button>
   <button type="button" class="v24ctx-option" data-v24ctx="benefits"><span class="v24ctx-nr">04</span><span class="v24ctx-copy"><strong>Meine Vorteile nutzen</strong><span>Guthaben, Status- und Kartenvorteile öffnen.</span></span><span class="v24ctx-arrow">›</span></button>
  </div>`;
 screen.prepend(wrap);
 qa('[data-v24ctx]',wrap).forEach(btn=>btn.addEventListener('click',()=>runIntent(btn.dataset.v24ctx,screen)));
}
function showExistingLanding(screen){
 intentOpen=false;
 restoreIntentContent(screen);
 if(!q(':scope>.v24ctx-return',screen)){
  const back=document.createElement('button');
  back.type='button';back.className='v24ctx-return';back.textContent='← Anderes Vorhaben';
  back.addEventListener('click',()=>{back.remove();intentOpen=true;showIntent(screen);});
  screen.prepend(back);
 }
}
function openBenefits(){
 const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>{
  const v=String(el.dataset?.view||'').toLowerCase();
  const t=txt(el).toLowerCase();
  return v==='card'||v==='benefits'||/vorteile/.test(t);
 });
 nav?.click();
}
function runIntent(action,screen){
 if(action==='best'){showExistingLanding(screen);return;}
 if(action==='offer'){
  const button=q('[data-v24os-offer]',screen);
  if(button){button.click();return;}
 }
 if(action==='flight'){
  const button=q('[data-v24os-action="flight"]',screen);
  if(button){button.click();return;}
  const offer=q('[data-v24os-offer]',screen);
  if(offer){offer.click();return;}
 }
 if(action==='benefits')openBenefits();
}

function polishLanding(screen){
 if(screen.dataset.v24copy==='1')return;
 screen.dataset.v24copy='1';
 const decision=q('.v24os-decision',screen);
 if(decision){
  setText(q('.v24os-decision-reason small',decision),'DEIN NÄCHSTER SCHRITT');
  const reason=q('.v24os-decision-reason strong',decision);
  if(reason&&/Prämienflug/i.test(txt(reason)))setText(reason,'Prämienflug prüfen');
  const p=q(':scope>p',decision);
  if(p)setText(p,'Hier kann deutlich mehr drin sein als bei einer einfachen Einlösung.');
  const hold=q('.v24os-hold',decision);
  if(hold){setText(q('b',hold),'Noch nichts übertragen.');setText(q('span',hold),'Erst prüfen, ob ein passender Flug verfügbar ist.');}
 }
 const why=q('.v24os-why',screen);
 if(why){
  const section=q('.v24os-section',why);
  setText(q('small',section),'WARUM?');
  setText(q('h2',section),'Eine Empfehlung statt zehn Möglichkeiten.');
  setText(q('p',section),'Wir starten mit dem Weg, der aus deinen Punkten am meisten machen kann. Gibt es dafür nichts Passendes, zeigen wir dir direkt die nächste gute Option.');
  const proofs=qa('.v24os-proof',why);
  if(proofs[0]){setText(q('small',proofs[0]),'ZUERST');setText(q('strong',proofs[0]),'Prämienflug prüfen');setText(q('span',proofs[0]),'Wenn ein guter Flug verfügbar ist, kann hier deutlich mehr für dich drin sein.');}
  if(proofs[1]){setText(q('small',proofs[1]),'PLAN B');setText(q('strong',proofs[1]),'Punkte direkt nutzen');setText(q('span',proofs[1]),'Wenn kein guter Prämienflug passt, bleibt dieser einfache Weg offen.');}
 }
 const alts=q('.v24os-alternatives',screen);
 if(alts){
  const link=q('[data-v24os-recommend]',alts);
  if(link){setText(link,'Weitere Möglichkeiten ansehen →');alts.insertAdjacentElement('beforebegin',link);}
  alts.remove();
 }
 const offer=q('.v24os-offer-late',screen);
 if(offer){
  setText(q('small',offer),'SCHON ETWAS GEFUNDEN?');
  setText(q('strong',offer),'Lohnt sich dein Angebot?');
  setText(q('em',offer),'Gib dein Angebot ein – VAYQUO prüft, ob sich der Einsatz deiner Punkte oder Meilen lohnt.');
 }
 const empty=q('.v24os-empty-decision',screen);
 if(empty){
  setText(q('.v24os-kicker',empty),'NOCH KEIN PUNKTESTAND');
  setText(q('h2',empty),'Trag zuerst deine Punkte oder Meilen ein.');
  setText(q('p',empty),'Danach sagt dir VAYQUO direkt, womit du anfangen solltest.');
 }
}

function polishRecommendation(screen){
 if(screen.dataset.v24copy==='1')return;
 screen.dataset.v24copy='1';
 const head=q('.v24os-head',screen);
 if(head){setText(q('.v24os-eyebrow',head),'DEINE MÖGLICHKEITEN');setText(q('h1',head),'Was sich für dich lohnt');setText(q('p',head),'Starte mit Nummer 1. Die anderen Wege bleiben offen.');}
 const section=q('.v24os-section',screen);
 if(section){setText(q('small',section),'DEINE REIHENFOLGE');setText(q('h2',section),'Damit solltest du anfangen');setText(q('p',section),'Starte oben. Nur wenn das nicht passt, gehst du weiter.');}
 qa('.v24os-card',screen).forEach(card=>{
  const title=q('h3',card),copy=q('p',card),label=q('small',card);
  const t=txt(title);
  if(/Airline-Partner|Prämienflug/i.test(t)){
   setText(label,'ZUERST');setText(title,'Prämienflug prüfen');setText(copy,'Hier steckt die beste Chance, deutlich mehr aus deinen Punkten zu machen. Erst Verfügbarkeit prüfen, dann übertragen.');
  }else if(/PAYBACK/i.test(t)){
   setText(label,'PLAN B');setText(title,'PAYBACK behalten');setText(copy,'Sicher und einfach. Erst interessant, wenn kein besserer Einsatz passt.');
  }else if(/direkt für Reisen|direkt einsetzen/i.test(t)){
   setText(label,'EINFACH');setText(title,'Punkte direkt einsetzen');setText(copy,'Bequem, aber meist nicht der erste Weg, wenn du mehr herausholen willst.');
  }else if(/Miles & More/i.test(t)){
   setText(label,'PRÜFEN');setText(title,'Flug oder Upgrade prüfen');setText(copy,'Ob es sich lohnt, zeigt das konkrete Angebot: Meilen, Zuzahlung und Barpreis.');
  }
 });
 const note=q('.v24os-note',screen);
 if(note)setText(note,'Erst prüfen, dann übertragen. So bleiben dir alle Wege offen.');
}

function polishOffer(screen){
 if(screen.dataset.v24copy!=='1'){
  screen.dataset.v24copy='1';
  const head=q('.v24os-head',screen);
  if(head){setText(q('.v24os-eyebrow',head),'ANGEBOT PRÜFEN');setText(q('h1',head),'Lohnt sich das?');setText(q('p',head),'VAYQUO vergleicht dein Angebot mit dem Barpreis.');}
  const section=q('.v24os-section',screen);
  if(section){setText(q('small',section),'DEIN ANGEBOT');setText(q('h2',section),'Lohnt sich das Angebot?');setText(q('p',section),'Barpreis, Punkte oder Meilen und Zuzahlung reichen. VAYQUO rechnet den Rest.');}
 }
 const result=q('.v24os-result',screen);
 if(result){
  setText(q('small',result),'ERGEBNIS');
  const h=q('h3',result);
  if(h){
   const t=txt(h);
   if(t==='Jetzt hast du einen sauberen Vergleichswert.')setText(h,'So viel holst du aus deinen Punkten heraus.');
   else if(t==='Besser als der direkte PAYBACK-Basiswert.')setText(h,'Das schlägt den direkten PAYBACK-Wert.');
   else if(t==='Direktes PAYBACK-Einlösen ist wertvoller.')setText(h,'Mit PAYBACK direkt bist du besser dran.');
   else if(t==='Besser als deine planbare PAYBACK-Alternative.')setText(h,'Das ist besser als dein sicherer Plan B.');
   else if(t==='Die planbare PAYBACK-Alternative ist rechnerisch stärker.')setText(h,'Dein sicherer Plan B ist hier stärker.');
  }
  const p=q('p',result);
  if(p){
   let s=txt(p).replace('Gegenüber dem Barpreis sparst du rechnerisch','Gegenüber dem Barpreis sparst du');
   s=s.replace('Der über PAYBACK berechenbare Vergleichswert liegt bei rund','Dein PAYBACK-Vergleich liegt bei rund');
   s=s.replace('Dieses Angebot liegt darüber.','Dieses Angebot ist besser.');
   setText(p,s);
  }
 }
}

function polish(){
 addStyle();
 const screen=q('#app .v24os-screen');
 if(!screen){lastScreen=null;return;}
 const mode=screen.dataset.v24os;
 if(screen!==lastScreen){lastScreen=screen;if(mode==='landing')intentOpen=true;}
 if(mode==='landing'){
  polishLanding(screen);
  if(intentOpen)showIntent(screen);
 }else if(mode==='recommend')polishRecommendation(screen);
 else if(mode==='offer')polishOffer(screen);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{polish();}catch(e){console.warn('VAYQUO optimizer polish',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
