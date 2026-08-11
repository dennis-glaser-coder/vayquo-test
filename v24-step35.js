(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const integer=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.round(Number(n)||0));
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const CARD_NAMES={
 platinum:'Platinum Card',gold:'Gold Card aus Metall',goldrose:'Gold Card Rosé aus Metall',green:'American Express Card',blue:'Blue Card',payback:'PAYBACK American Express Karte',dmpayback:'dm PAYBACK American Express Karte',bmwpremium:'BMW Premium Card Carbon',bmw:'BMW Card von American Express',none:'Keine / andere'
};
const CARD_OPTIONS=['platinum','gold','goldrose','green','blue','payback','dmpayback','bmwpremium','bmw','none'];
const MM_STATUS={
 none:{label:'Kein Status',short:'Kein Status',benefits:[],url:'https://www.miles-and-more.com/de/de/program/status-benefits/status-levels.html'},
 ftl:{label:'Frequent Traveller',short:'Frequent Traveller',benefits:['Business Lounge Zugang','Business Class Check-in','Unbegrenzte Meilengültigkeit'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/frequent-traveller-status.html'},
 senator:{label:'Senator',short:'Senator',benefits:['Senator / Star Alliance Gold Lounges','First Class Check-in','Priority Boarding'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/senator-status.html'},
 hon:{label:'HON Circle Member',short:'HON Circle',benefits:['First Class Lounge Zugang','First Class Check-in','Limousinen- und Transferservice'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/status-level-hon-circle.html'}
};
const LINKS={
 paybackAmex:'https://www.americanexpress.com/de-de/kreditkarte/payback-karte/'
};

function statusKey(){
 const key=String(state?.mmStatus||'none');
 return MM_STATUS[key]?key:'none';
}
function cardName(){return CARD_NAMES[state?.card]||'American Express';}
function hasAmexCard(){return !!state?.card&&state.card!=='none';}
function paybackValue(){return (+state?.balances?.pb||0)/100;}
function sixtUsedValue(){return Math.min(8,Math.max(0,+state?.benefits?.sixtCredits||0))*25;}
function platinumUsed(){
 return Math.min(200,+state?.benefits?.travel||0)+Math.min(150,+state?.benefits?.restaurant||0)+sixtUsedValue()+Math.min(50,+state?.benefits?.lodenH1||0)+Math.min(50,+state?.benefits?.lodenH2||0);
}
function platinumOpen(){return Math.max(0,650-platinumUsed());}
function openExternal(url){try{window.open(url,'_blank','noopener,noreferrer');}catch{location.href=url;}}

function cardOptions(){return CARD_OPTIONS.map(id=>`<option value="${id}" ${state.card===id?'selected':''}>${CARD_NAMES[id]}</option>`).join('');}
function mmOptions(){const selected=statusKey();return Object.entries(MM_STATUS).map(([id,v])=>`<option value="${id}" ${selected===id?'selected':''}>${v.label}</option>`).join('');}

function openManager(){
 if(typeof openModal!=='function') return;
 openModal('Dein Setup',`<div class="v24s35-manager-intro">VAYQUO zeigt nur Vorteile, die zu deinem hinterlegten Setup passen. Fehlende Vorteile werden getrennt und nur dann empfohlen, wenn sie sinnvoll wirken.</div>
 <div class="v20-modal-grid v24s35-manager-grid">
  <label class="v20-modal-item"><span class="mi">AX</span><span><strong>Amex / Membership Rewards</strong><span>Punkte und Kartenvorteile</span></span><input type="checkbox" data-v24s35-prog="mr" ${state.programs.mr?'checked':''}></label>
  <label class="v20-modal-item"><span class="mi">PB</span><span><strong>PAYBACK</strong><span>Punkte, Coupons und Transferoptionen</span></span><input type="checkbox" data-v24s35-prog="pb" ${state.programs.pb?'checked':''}></label>
  <label class="v20-modal-item"><span class="mi">M&M</span><span><strong>Miles & More</strong><span>Meilen und Statusvorteile</span></span><input type="checkbox" data-v24s35-prog="mm" ${state.programs.mm?'checked':''}></label>
 </div>
 <div class="field"><label>Welche American Express Karte? <small>optional</small></label><select class="select" id="v24s35-card">${cardOptions()}</select></div>
 <div class="field" id="v24s35-mm-wrap" ${state.programs.mm?'':'hidden'}><label>Welchen Miles-&-More-Status hast du?</label><select class="select" id="v24s35-mm">${mmOptions()}</select><small class="v24s35-field-note">Damit zeigt VAYQUO Lounge-, Check-in- und Statusvorteile nicht fälschlich bei jedem Miles-&-More-Konto.</small></div>
 <div class="v24s35-manager-note"><strong>Keine Verkaufslogik hier.</strong> Diese Angaben steuern zuerst nur, was VAYQUO als deinen eigenen Vorteil anzeigen darf.</div>
 <button class="btn" id="v24s35-save">Übernehmen</button>`);
 const mmCheck=q('[data-v24s35-prog="mm"]');
 const syncMm=()=>{const w=q('#v24s35-mm-wrap');if(w)w.hidden=!mmCheck.checked;};
 mmCheck?.addEventListener('change',syncMm);
 q('#v24s35-save')?.addEventListener('click',()=>{
  qa('[data-v24s35-prog]').forEach(i=>state.programs[i.dataset.v24s35Prog]=i.checked);
  state.card=q('#v24s35-card')?.value||'none';
  state.mmStatus=q('#v24s35-mm')?.value||state.mmStatus||'none';
  if(!Object.values(state.programs).some(Boolean)&&state.card==='none'){typeof toast==='function'&&toast('Wähle mindestens ein Programm oder eine Karte');return;}
  typeof save==='function'&&save();
  typeof closeModal==='function'&&closeModal();
  typeof render==='function'&&render();
  typeof toast==='function'&&toast('Setup aktualisiert');
 });
}

function setupChips(){
 const chips=[];
 if(hasAmexCard())chips.push(`<span class="v24s35-chip"><b>AX</b>${esc(cardName())}</span>`);
 else if(state.programs.mr)chips.push(`<span class="v24s35-chip"><b>MR</b>Membership Rewards</span>`);
 if(state.programs.pb)chips.push(`<span class="v24s35-chip"><b>PB</b>PAYBACK</span>`);
 if(state.programs.mm)chips.push(`<span class="v24s35-chip"><b>M&M</b>${esc(MM_STATUS[statusKey()].short)}</span>`);
 return `<div class="v24s35-setup"><div class="v24s35-setup-title"><span>DEIN SETUP</span><button type="button" data-v24s35-manage>Ändern</button></div><div class="v24s35-chips">${chips.join('')}</div></div>`;
}

function paybackBlock(){
 if(!state.programs.pb)return '';
 const mm=state.programs.mm;
 return `<div class="v24s35-source-card" data-source="payback"><div class="v24s35-source-head"><span class="v24s35-monogram">PB</span><div><small>PAYBACK</small><strong>${integer(state.balances.pb)} Punkte</strong></div><div class="v24s35-source-value"><b>${euro(paybackValue())}</b><span>direkter Wert</span></div></div>
 <div class="v24s35-facts"><span>1 Punkt = 1 Cent</span>${mm?'<span>1:1 zu Miles & More möglich</span>':'<span>ab 200 Punkten flexibel einlösbar</span>'}</div>
 <button type="button" class="v24s35-action" data-v24s35-action="payback">Punkte sinnvoll einsetzen <span>→</span></button></div>`;
}

function mmBlock(){
 if(!state.programs.mm)return '';
 const key=statusKey(),info=MM_STATUS[key];
 const benefits=info.benefits.length?`<div class="v24s35-benefit-tags">${info.benefits.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>`:`<div class="v24s35-status-empty"><strong>Kein Vielfliegerstatus hinterlegt.</strong><span>Deshalb zeigt VAYQUO dir aktuell keine Status-Lounge oder Priority-Vorteile als vorhanden an.</span></div>`;
 return `<div class="v24s35-source-card" data-source="mm"><div class="v24s35-source-head"><span class="v24s35-monogram wide">M&M</span><div><small>MILES & MORE</small><strong>${integer(state.balances.mm)} Meilen</strong></div><div class="v24s35-source-value"><b>${esc(info.short)}</b><span>Status</span></div></div>${benefits}
 <div class="v24s35-dual"><button type="button" class="v24s35-action" data-v24s35-action="flight">Flug mit Meilen prüfen <span>→</span></button>${key!=='none'?'<button type="button" class="v24s35-action soft" data-v24s35-action="mm-status">Statusdetails ↗</button>':'<button type="button" class="v24s35-action soft" data-v24s35-manage>Status ergänzen</button>'}</div></div>`;
}

function amexBlock(){
 if(!hasAmexCard()&& !state.programs.mr)return '';
 if(state.card==='platinum')return '';
 if(state.card==='payback'||state.card==='dmpayback'){
  return `<div class="v24s35-source-card" data-source="amex"><div class="v24s35-source-head"><span class="v24s35-monogram">AX</span><div><small>AMERICAN EXPRESS</small><strong>${esc(cardName())}</strong></div><div class="v24s35-source-value"><b>aktiv</b><span>hinterlegt</span></div></div><div class="v24s35-benefit-tags"><span>✓ PAYBACK Punkte bei Kartenzahlungen</span><span>✓ dauerhaft ohne Jahresentgelt</span></div><div class="v24s35-source-note">VAYQUO zeigt hier nur bekannte Kernmerkmale der hinterlegten Karte – keine Platinum-Vorteile.</div></div>`;
 }
 const mr=state.programs.mr?`${integer(state.balances.mr)} Membership Rewards`:'Karte hinterlegt';
 return `<div class="v24s35-source-card" data-source="amex"><div class="v24s35-source-head"><span class="v24s35-monogram">AX</span><div><small>AMERICAN EXPRESS</small><strong>${esc(hasAmexCard()?cardName():'Membership Rewards')}</strong></div><div class="v24s35-source-value"><b>${esc(mr)}</b><span>${state.programs.mr?'Punkte':'Setup'}</span></div></div><div class="v24s35-source-note">Für diese Karte zeigt VAYQUO noch keine Platinum-Guthaben an. So werden Vorteile nicht einer falschen Karte zugeschrieben.</div>${state.programs.mr?'<button type="button" class="v24s35-action" data-v24s35-action="mr">Membership Rewards prüfen <span>→</span></button>':''}</div>`;
}

function recommendation(){
 if(state.card==='platinum')return null;
 if(state.programs.pb&&!hasAmexCard()){
  return {kind:'payback-amex',eyebrow:'PASSENDE ERGÄNZUNG · OPTIONAL',title:'Du nutzt PAYBACK – aber sammelst noch nicht bei jeder normalen Kartenzahlung.',copy:'Eine PAYBACK-Karte kann dein bestehendes Programm ergänzen. VAYQUO zeigt sie hier nur, weil PAYBACK bereits zu deinem Setup gehört.',reason:'Warum du das siehst: PAYBACK ist aktiv, aber keine American-Express-Karte ist hinterlegt.',cta:'Für mich prüfen'};
 }
 if(state.programs.mm&&statusKey()==='none'){
  return {kind:'mm-status',eyebrow:'MEHR AUS DEINEM SETUP',title:'Dir fehlen aktuell Statusvorteile – nicht Meilen.',copy:'VAYQUO erkennt Miles & More, aber keinen Vielfliegerstatus. Deshalb werden Lounge- und Priority-Vorteile bewusst nicht als vorhanden angezeigt.',reason:'Das ist keine Kartenwerbung: zuerst sollte dein tatsächlicher Miles-&-More-Status geklärt werden.',cta:'Statusmöglichkeiten ansehen'};
 }
 if(state.programs.mr&&!hasAmexCard()){
  return {kind:'complete-amex',eyebrow:'SETUP VERVOLLSTÄNDIGEN',title:'Membership Rewards ist aktiv, aber die Karte fehlt.',copy:'Wenn du deine Amex-Karte ergänzt, kann VAYQUO Kartenvorteile korrekt zuordnen – ohne dir automatisch eine neue Karte zu empfehlen.',reason:'Mehr Daten statt mehr Werbung.',cta:'Karte ergänzen'};
 }
 return null;
}

function recommendationHtml(){
 const r=recommendation();if(!r)return '';
 return `<div class="v24s35-section"><div class="v24s35-section-head"><h2>Mehr aus deinem Setup</h2><span>max. 1 Hinweis</span></div><div class="v24s35-reco"><div class="v24s35-reco-eyebrow">${esc(r.eyebrow)}</div><h3>${esc(r.title)}</h3><p>${esc(r.copy)}</p><div class="v24s35-reason">${esc(r.reason)}</div><button type="button" class="v24s35-reco-btn" data-v24s35-reco="${r.kind}">${esc(r.cta)} <span>→</span></button></div></div>`;
}

function openReco(kind){
 if(kind==='complete-amex'){openManager();return;}
 if(kind==='mm-status'){openExternal(MM_STATUS.none.url);return;}
 if(kind!=='payback-amex'||typeof openModal!=='function')return;
 openModal('Passt diese Ergänzung zu dir?',`<div class="v24s35-reco-modal"><div class="v24s35-reco-modal-kicker">DEIN AUSGANGSPUNKT</div><h3>Du nutzt PAYBACK bereits.</h3><p>Die PAYBACK American Express Karte ergänzt genau dieses bestehende System: Du sammelst damit auch bei normalen Kartenzahlungen PAYBACK Punkte. Laut aktuellem offiziellen Angebot fällt dauerhaft kein Jahresentgelt an.</p><div class="v24s35-reco-check"><span>✓ passt zu deinem vorhandenen PAYBACK-Konto</span><span>✓ keine zweite Punktewelt nötig</span><span>✓ erst Nutzen, dann Produkt</span></div><div class="v24s35-reco-disclosure">VAYQUO vergleicht hier keine Karten. Es wird genau eine Ergänzung gezeigt, weil sie direkt zu deinem hinterlegten PAYBACK-Setup passt. Der aktuelle Testlink führt direkt zu American Express und enthält noch kein Affiliate-Tracking.</div><button class="btn" id="v24s35-out">Offizielle Karte ansehen ↗</button><button class="btn soft" id="v24s35-close">Nicht jetzt</button></div>`);
 q('#v24s35-out')?.addEventListener('click',()=>openExternal(LINKS.paybackAmex));
 q('#v24s35-close')?.addEventListener('click',()=>typeof closeModal==='function'&&closeModal());
}

function bindCommon(root=document){
 qa('[data-v24s35-manage]',root).forEach(b=>b.onclick=openManager);
 qa('[data-v24s35-action]',root).forEach(b=>b.onclick=()=>{
  const a=b.dataset.v24s35Action;
  if(a==='payback'&&typeof go==='function')go('optimize','payback');
  if(a==='flight'&&typeof go==='function')go('optimize','flight');
  if(a==='mr'&&typeof go==='function')go('optimize','transfer');
  if(a==='mm-status')openExternal(MM_STATUS[statusKey()].url);
 });
 qa('[data-v24s35-reco]',root).forEach(b=>b.onclick=()=>openReco(b.dataset.v24s35Reco));
}

function renderNonPlatinum(){
 const owned=[amexBlock(),paybackBlock(),mmBlock()].filter(Boolean).join('');
 app.innerHTML=`<section class="screen v24s35-benefits" data-v24s35="1"><div class="v19-head v24s35-head"><div><div class="over">DEINE VORTEILE</div><h1>Vorteile</h1><p>Nur das, was zu deinem hinterlegten Setup passt.</p></div><button class="v19-card-change" data-v24s35-manage>Ändern</button></div>${setupChips()}<div class="v24s35-section"><div class="v24s35-section-head"><h2>Das hast du</h2><span>keine fremden Vorteile</span></div><div class="v24s35-owned">${owned||'<div class="v24s35-empty">Noch keine Vorteile hinterlegt.</div>'}</div></div>${recommendationHtml()}</section>`;
 bindCommon(app);
}

function enhancePlatinum(screen){
 screen.dataset.v24s35='1';
 const head=q('.v19-head',screen);
 if(head){
  const button=q('#v23Switch',head);if(button)button.textContent='Setup ändern';
  head.insertAdjacentHTML('afterend',setupChips());
 }
 const summary=q('.v19-benefits',screen);
 if(summary)summary.insertAdjacentHTML('beforeend',`<div class="v24s35-sync">Offener Betrag laut deinem VAYQUO-Stand · nicht automatisch mit Amex oder SIXT synchronisiert.</div>`);
 const extras=[paybackBlock(),mmBlock()].filter(Boolean).join('');
 if(extras){
  screen.insertAdjacentHTML('beforeend',`<div class="v24s35-section v24s35-platinum-extra"><div class="v24s35-section-head"><h2>Weitere Programme</h2><span>gehören ebenfalls zu dir</span></div><div class="v24s35-owned">${extras}</div></div>`);
 }
 bindCommon(screen);
}

function benefitsViewActive(){
 const nav=q('#bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 const h=q('#app h1');return !!h&&h.textContent.trim()==='Vorteile';
}
function enhanceBenefits(){
 if(!benefitsViewActive())return;
 const screen=q('#app .screen');if(!screen||screen.dataset.v24s35)return;
 if(state.card==='platinum')enhancePlatinum(screen);else renderNonPlatinum();
}

document.addEventListener('click',ev=>{
 const hit=ev.target.closest?.('#v20ManageInline,#v20ManageSources,#v23Switch,#switchCard,[data-v24s35-manage]');
 if(!hit)return;
 ev.preventDefault();ev.stopImmediatePropagation();openManager();
},true);

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceBenefits();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();