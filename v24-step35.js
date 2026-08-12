(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const integer=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.round(Number(n)||0));
const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));

const CARD_NAMES={platinum:'Platinum Card',gold:'Gold Card aus Metall',goldrose:'Gold Card Rosé aus Metall',green:'American Express Card',blue:'Blue Card',payback:'PAYBACK American Express Karte',dmpayback:'dm PAYBACK American Express Karte',bmwpremium:'BMW Premium Card Carbon',bmw:'BMW Card von American Express',none:'Keine / andere'};
const CARD_OPTIONS=['platinum','gold','goldrose','green','blue','payback','dmpayback','bmwpremium','bmw','none'];
const MM_STATUS={
 none:{label:'Kein Status',short:'Kein Status',benefits:[],url:'https://www.miles-and-more.com/de/de/program/status-benefits/status-levels.html'},
 ftl:{label:'Frequent Traveller',short:'Frequent Traveller',benefits:['Business Lounge Zugang','Business Class Check-in','Unbegrenzte Meilengültigkeit'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/frequent-traveller-status.html'},
 senator:{label:'Senator',short:'Senator',benefits:['Senator / Star Alliance Gold Lounges','First Class Check-in','Priority Boarding'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/senator-status.html'},
 hon:{label:'HON Circle Member',short:'HON Circle',benefits:['First Class Lounge Zugang','First Class Check-in','Limousinen- und Transferservice'],url:'https://www.miles-and-more.com/de/de/program/status-benefits/status-level-hon-circle.html'}
};
const LINKS={paybackAmex:'https://www.americanexpress.com/de-de/kreditkarte/payback-karte/'};

function programs(){return state?.programs||{};}
function hasProgram(id){return !!programs()[id];}
function statusKey(){const key=String(state?.mmStatus||'none');return MM_STATUS[key]?key:'none';}
function hasAmexCard(){return hasProgram('mr')&&!!state?.card&&state.card!=='none';}
function ownsPlatinum(){return hasProgram('mr')&&state?.card==='platinum';}
function cardName(){return CARD_NAMES[state?.card]||'American Express';}
function paybackValue(){return (+state?.balances?.pb||0)/100;}
function sixtUsedValue(){return Math.min(8,Math.max(0,+state?.benefits?.sixtCredits||0))*25;}
function openExternal(url){try{window.open(url,'_blank','noopener,noreferrer');}catch{location.href=url;}}
function cardOptions(){return CARD_OPTIONS.map(id=>`<option value="${id}" ${state?.card===id?'selected':''}>${CARD_NAMES[id]}</option>`).join('');}
function mmOptions(){const selected=statusKey();return Object.entries(MM_STATUS).map(([id,v])=>`<option value="${id}" ${selected===id?'selected':''}>${v.label}</option>`).join('');}

function benefitsViewActive(){
 const nav=q('#bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 const h=q('#app h1');
 return !!h&&h.textContent.trim()==='Vorteile';
}

function openManager(){
 if(!benefitsViewActive()||typeof openModal!=='function')return;
 const mr=hasProgram('mr'),mm=hasProgram('mm');
 openModal('Dein Setup',`<div class="v24s35-manager-intro">Hier steuerst du nur, welche Vorteile auf der Vorteilsseite wirklich zu dir gehören. Empfehlungen bleiben davon klar getrennt.</div>
 <div class="v20-modal-grid v24s35-manager-grid">
  <label class="v20-modal-item"><span class="mi">AX</span><span><strong>Amex / Membership Rewards</strong><span>Punkte und Kartenvorteile</span></span><input type="checkbox" data-v24s35-prog="mr" ${mr?'checked':''}></label>
  <label class="v20-modal-item"><span class="mi">PB</span><span><strong>PAYBACK</strong><span>Punkte, Coupons und Transferoptionen</span></span><input type="checkbox" data-v24s35-prog="pb" ${hasProgram('pb')?'checked':''}></label>
  <label class="v20-modal-item"><span class="mi">M&M</span><span><strong>Miles & More</strong><span>Meilen und Statusvorteile</span></span><input type="checkbox" data-v24s35-prog="mm" ${mm?'checked':''}></label>
 </div>
 <div class="field" id="v24s35-amex-wrap" ${mr?'':'hidden'}><label>Welche American Express Karte?</label><select class="select" id="v24s35-card">${cardOptions()}</select></div>
 <div class="field" id="v24s35-mm-wrap" ${mm?'':'hidden'}><label>Welchen Miles-&-More-Status hast du?</label><select class="select" id="v24s35-mm">${mmOptions()}</select><small class="v24s35-field-note">So zeigt VAYQUO Lounge-, Check-in- und Statusvorteile nur dann als vorhanden, wenn sie wirklich zu deinem Status gehören.</small></div>
 <div class="v24s35-manager-note"><strong>Wichtig:</strong> Abgewählte Programme verschwinden auf der Vorteilsseite vollständig als eigener Besitz. Sie können höchstens getrennt als optionale Ergänzung auftauchen.</div>
 <button class="btn" id="v24s35-save">Übernehmen</button>`);

 const mrCheck=q('[data-v24s35-prog="mr"]');
 const mmCheck=q('[data-v24s35-prog="mm"]');
 const sync=()=>{
  const aw=q('#v24s35-amex-wrap');if(aw)aw.hidden=!mrCheck?.checked;
  const mw=q('#v24s35-mm-wrap');if(mw)mw.hidden=!mmCheck?.checked;
 };
 mrCheck?.addEventListener('change',sync);
 mmCheck?.addEventListener('change',sync);

 q('#v24s35-save')?.addEventListener('click',()=>{
  const checks=qa('[data-v24s35-prog]');
  const next={};checks.forEach(i=>next[i.dataset.v24s35Prog]=i.checked);
  if(!Object.values(next).some(Boolean)){typeof toast==='function'&&toast('Wähle mindestens ein Programm');return;}
  state.programs={...state.programs,...next};
  if(next.mr)state.card=q('#v24s35-card')?.value||state.card||'none';
  if(next.mm)state.mmStatus=q('#v24s35-mm')?.value||state.mmStatus||'none';
  typeof save==='function'&&save();
  typeof closeModal==='function'&&closeModal();
  typeof render==='function'&&render();
  typeof toast==='function'&&toast('Setup aktualisiert');
 });
}

function setupChips(){
 const chips=[];
 if(hasProgram('mr'))chips.push(`<span class="v24s35-chip"><b>${hasAmexCard()?'AX':'MR'}</b>${esc(hasAmexCard()?cardName():'Membership Rewards')}</span>`);
 if(hasProgram('pb'))chips.push(`<span class="v24s35-chip"><b>PB</b>PAYBACK</span>`);
 if(hasProgram('mm'))chips.push(`<span class="v24s35-chip"><b>M&M</b>${esc(MM_STATUS[statusKey()].short)}</span>`);
 return `<div class="v24s35-setup"><div class="v24s35-setup-title"><span>DEIN SETUP</span><button type="button" data-v24s35-manage>Ändern</button></div><div class="v24s35-chips">${chips.join('')}</div></div>`;
}

function paybackBlock(){
 if(!hasProgram('pb'))return '';
 const mm=hasProgram('mm');
 return `<div class="v24s35-source-card" data-source="payback"><div class="v24s35-source-head"><span class="v24s35-monogram">PB</span><div><small>PAYBACK</small><strong>${integer(state?.balances?.pb)} Punkte</strong></div><div class="v24s35-source-value"><b>${euro(paybackValue())}</b><span>direkter Wert</span></div></div><div class="v24s35-facts"><span>1 Punkt = 1 Cent</span>${mm?'<span>1:1 zu Miles & More möglich</span>':'<span>ab 200 Punkten flexibel einlösbar</span>'}</div><button type="button" class="v24s35-action" data-v24s35-action="payback">Punkte sinnvoll einsetzen <span>→</span></button></div>`;
}

function mmBlock(){
 if(!hasProgram('mm'))return '';
 const key=statusKey(),info=MM_STATUS[key];
 const benefits=info.benefits.length?`<div class="v24s35-benefit-tags">${info.benefits.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>`:`<div class="v24s35-status-empty"><strong>Kein Vielfliegerstatus hinterlegt.</strong><span>Deshalb zeigt VAYQUO dir aktuell keine Status-Lounge oder Priority-Vorteile als vorhanden an.</span></div>`;
 return `<div class="v24s35-source-card" data-source="mm"><div class="v24s35-source-head"><span class="v24s35-monogram wide">M&M</span><div><small>MILES & MORE</small><strong>${integer(state?.balances?.mm)} Meilen</strong></div><div class="v24s35-source-value"><b>${esc(info.short)}</b><span>Status</span></div></div>${benefits}<div class="v24s35-dual"><button type="button" class="v24s35-action" data-v24s35-action="flight">Flug mit Meilen prüfen <span>→</span></button>${key!=='none'?'<button type="button" class="v24s35-action soft" data-v24s35-action="mm-status">Statusdetails ↗</button>':'<button type="button" class="v24s35-action soft" data-v24s35-manage>Status ergänzen</button>'}</div></div>`;
}

function amexBlock(){
 if(!hasProgram('mr'))return '';
 if(ownsPlatinum())return '';
 if(state.card==='payback'||state.card==='dmpayback')return `<div class="v24s35-source-card" data-source="amex"><div class="v24s35-source-head"><span class="v24s35-monogram">AX</span><div><small>AMERICAN EXPRESS</small><strong>${esc(cardName())}</strong></div><div class="v24s35-source-value"><b>aktiv</b><span>hinterlegt</span></div></div><div class="v24s35-benefit-tags"><span>✓ PAYBACK Punkte bei Kartenzahlungen</span><span>✓ keine Platinum-Vorteile zugeschrieben</span></div></div>`;
 const mr=`${integer(state?.balances?.mr)} Membership Rewards`;
 return `<div class="v24s35-source-card" data-source="amex"><div class="v24s35-source-head"><span class="v24s35-monogram">AX</span><div><small>AMERICAN EXPRESS</small><strong>${esc(hasAmexCard()?cardName():'Membership Rewards')}</strong></div><div class="v24s35-source-value"><b>${esc(mr)}</b><span>Punkte</span></div></div><div class="v24s35-source-note">VAYQUO zeigt nur Vorteile der tatsächlich hinterlegten Karte.</div><button type="button" class="v24s35-action" data-v24s35-action="mr">Membership Rewards prüfen <span>→</span></button></div>`;
}

function recommendation(){
 if(ownsPlatinum())return null;
 if(hasProgram('mm')&&statusKey()==='none')return {kind:'mm-status',eyebrow:'MEHR AUS DEINEM SETUP',title:'Dein Miles-&-More-Status ist noch offen.',copy:'Bevor VAYQUO zusätzliche Produkte empfiehlt, sollte zuerst klar sein, welche Statusvorteile du bereits besitzt.',reason:'Zuerst vorhandene Vorteile prüfen – erst danach ergänzen.',cta:'Status ergänzen'};
 if(hasProgram('mr')&&!hasAmexCard())return {kind:'complete-amex',eyebrow:'SETUP VERVOLLSTÄNDIGEN',title:'Membership Rewards ist aktiv, aber die Karte fehlt.',copy:'Wenn du deine Amex-Karte ergänzt, kann VAYQUO Kartenvorteile korrekt zuordnen.',reason:'Mehr Genauigkeit statt mehr Werbung.',cta:'Karte ergänzen'};
 if(hasProgram('pb')&&!hasProgram('mr'))return {kind:'payback-amex',eyebrow:'PASSENDE ERGÄNZUNG · OPTIONAL',title:'Du könntest PAYBACK auch bei normalen Kartenzahlungen sammeln.',copy:'Diese Ergänzung erscheint nur, weil PAYBACK bereits zu deinem Setup gehört.',reason:'Amex gehört nicht zu deinen vorhandenen Vorteilen – das hier ist nur eine getrennte Option.',cta:'Für mich prüfen'};
 return null;
}
function recommendationHtml(){const r=recommendation();if(!r)return '';return `<div class="v24s35-section"><div class="v24s35-section-head"><h2>Mehr aus deinem Setup</h2><span>optional</span></div><div class="v24s35-reco"><div class="v24s35-reco-eyebrow">${esc(r.eyebrow)}</div><h3>${esc(r.title)}</h3><p>${esc(r.copy)}</p><div class="v24s35-reason">${esc(r.reason)}</div><button type="button" class="v24s35-reco-btn" data-v24s35-reco="${r.kind}">${esc(r.cta)} <span>→</span></button></div></div>`;}

function openReco(kind){
 if(kind==='complete-amex'||kind==='mm-status'){openManager();return;}
 if(kind!=='payback-amex'||typeof openModal!=='function')return;
 openModal('Passt diese Ergänzung zu dir?',`<div class="v24s35-reco-modal"><div class="v24s35-reco-modal-kicker">OPTIONALE ERGÄNZUNG</div><h3>Du nutzt PAYBACK bereits.</h3><p>Die PAYBACK American Express Karte wäre eine Möglichkeit, auch bei normalen Kartenzahlungen PAYBACK Punkte zu sammeln.</p><div class="v24s35-reco-check"><span>✓ passt zu deinem vorhandenen PAYBACK-Setup</span><span>✓ bleibt klar von deinen vorhandenen Vorteilen getrennt</span><span>✓ kein Kartenvergleich</span></div><div class="v24s35-reco-disclosure">Der aktuelle Testlink führt direkt zu American Express und enthält noch kein Affiliate-Tracking.</div><button class="btn" id="v24s35-out">Offizielle Karte ansehen ↗</button><button class="btn soft" id="v24s35-close">Nicht jetzt</button></div>`);
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
 app.innerHTML=`<section class="screen v24s35-benefits" data-v24s35="1"><div class="v19-head v24s35-head"><div><div class="over">DEINE VORTEILE</div><h1>Vorteile</h1><p>Nur das, was zu deinem hinterlegten Setup passt.</p></div><button class="v19-card-change" data-v24s35-manage>Ändern</button></div>${setupChips()}<div class="v24s35-section"><div class="v24s35-section-head"><h2>Das hast du</h2><span>nur dein Setup</span></div><div class="v24s35-owned">${owned||'<div class="v24s35-empty">Noch keine Vorteile hinterlegt.</div>'}</div></div>${recommendationHtml()}</section>`;
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
 if(summary&&!q('.v24s35-sync',summary))summary.insertAdjacentHTML('beforeend',`<div class="v24s35-sync">Offener Betrag laut deinem VAYQUO-Stand · nicht automatisch mit Amex oder SIXT synchronisiert.</div>`);
 const extras=[paybackBlock(),mmBlock()].filter(Boolean).join('');
 if(extras)screen.insertAdjacentHTML('beforeend',`<div class="v24s35-section v24s35-platinum-extra"><div class="v24s35-section-head"><h2>Weitere Programme</h2><span>gehören ebenfalls zu dir</span></div><div class="v24s35-owned">${extras}</div></div>`);
 bindCommon(screen);
}

function enhanceBenefits(){
 if(!benefitsViewActive())return;
 const screen=q('#app .screen');
 if(!screen||screen.dataset.v24s35)return;
 if(ownsPlatinum())enhancePlatinum(screen);else renderNonPlatinum();
}

// Nur auf der Vorteilsseite eingreifen. Startseiten-Manager bleibt vollständig unangetastet.
document.addEventListener('click',ev=>{
 if(!benefitsViewActive())return;
 const hit=ev.target.closest?.('#v23Switch,[data-v24s35-manage]');
 if(!hit||!q('#app')?.contains(hit))return;
 ev.preventDefault();ev.stopImmediatePropagation();openManager();
},true);

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceBenefits();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
