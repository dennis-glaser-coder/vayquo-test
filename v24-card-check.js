(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const DATA_AS_OF='14.08.2026';

const CARD_LABELS={
 none:'Keine Kreditkarte',
 visa_mc_standard:'Visa / Mastercard · Standard',
 visa_mc_premium:'Visa / Mastercard · Premium',
 miles_more:'Miles & More Kreditkarte',
 amex_payback:'PAYBACK American Express',
 amex_gold:'American Express Gold',
 amex_platinum:'American Express Platinum',
 amex_other:'Andere American Express',
 other:'Andere Kreditkarte'
};

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}
function benefitsViewActive(){
 const nav=q('#bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 return q('#app h1')?.textContent.trim()==='Vorteile';
}
function existingCard(){
 const card=String(safeState()?.card||'none');
 if(card==='platinum')return 'amex_platinum';
 if(card==='gold'||card==='goldrose')return 'amex_gold';
 if(card==='payback'||card==='dmpayback')return 'amex_payback';
 if(['green','blue','bmw','bmwpremium'].includes(card))return 'amex_other';
 return safeState()?.cardCheckProfile?.currentCard||'other';
}
function profile(){
 const saved=safeState()?.cardCheckProfile;
 return saved&&typeof saved==='object'?saved:{};
}
function saveProfile(next){
 try{
  const s=safeState();
  s.cardCheckProfile={...next,updatedAt:new Date().toISOString()};
  if(typeof save==='function')save();
  window.dispatchEvent(new CustomEvent('vayquo:card-check',{detail:{profile:s.cardCheckProfile}}));
 }catch(e){console.warn('VAYQUO card check save',e);}
}
function ensureStyle(){
 if(q('#v24-card-check-style'))return;
 const style=document.createElement('style');style.id='v24-card-check-style';
 style.textContent=`
 #v24-card-check-entry{margin:14px 0 18px}.v24cc-entry{padding:17px 16px;border:1px solid rgba(117,91,52,.14);border-radius:19px;background:linear-gradient(145deg,#f8f4ed,#fffdf9);box-shadow:0 7px 22px rgba(54,44,29,.035)}
 .v24cc-kicker{font-size:8px;letter-spacing:.13em;color:#987a4d;font-weight:900}.v24cc-entry h3{margin:7px 0 6px;color:#1d2c29;font-size:18px;line-height:1.18;letter-spacing:-.03em}.v24cc-entry p{margin:0;color:#707b78;font-size:10px;line-height:1.5}
 .v24cc-entry-btn{width:100%;min-height:42px;margin-top:12px;border:0;border-radius:13px;background:#183b35;color:#fff;padding:0 13px;display:flex;align-items:center;justify-content:space-between;text-align:left;font:800 10px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}.v24cc-entry-btn span{font-size:16px}
 #v24-card-check{position:fixed;inset:0;z-index:2147483500;display:flex;align-items:flex-end;justify-content:center;background:rgba(7,25,27,.52);padding:14px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
 #v24-card-check[hidden]{display:none!important}.v24cc-sheet{width:min(100%,520px);max-height:min(88vh,760px);overflow:auto;background:#f7f3ec;color:#18302d;border-radius:25px;padding:20px 18px 22px;box-sizing:border-box;box-shadow:0 25px 80px rgba(0,0,0,.28)}
 .v24cc-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.v24cc-head small{display:block;color:#987a4d;font-size:8px;font-weight:900;letter-spacing:.13em}.v24cc-head h2{margin:6px 0 5px;font-size:26px;line-height:1.05;letter-spacing:-.04em}.v24cc-head p{margin:0;color:#707b78;font-size:11px;line-height:1.5}.v24cc-close{border:0;background:transparent;color:#61706d;font-size:25px;line-height:1;padding:0 2px}
 .v24cc-form{display:grid;gap:13px;margin-top:18px}.v24cc-field>span{display:block;margin:0 0 6px 2px;color:#566662;font-size:10px;font-weight:850}.v24cc-field select{width:100%;height:48px;border:1px solid #dcd8cf;border-radius:14px;background:#fffdf9;color:#18302d;padding:0 12px;font:700 13px inherit;box-sizing:border-box}
 .v24cc-question{padding:12px 13px;border:1px solid #dfdbd2;border-radius:15px;background:#fffdf9}.v24cc-question strong{display:block;font-size:12px;line-height:1.35}.v24cc-toggle{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.v24cc-toggle button{height:38px;border:1px solid #ddd8ce;border-radius:11px;background:#f5f1e9;color:#65716e;font:800 11px inherit}.v24cc-toggle button.active{background:#183b35;color:#fff;border-color:#183b35}
 .v24cc-submit{height:48px;border:0;border-radius:14px;background:#183b35;color:#fff;font:850 13px inherit}.v24cc-result{margin-top:17px;padding:16px;border-radius:17px;background:#fffdf9;border:1px solid #ded9cf}.v24cc-result small{display:block;color:#987a4d;font-size:8px;font-weight:900;letter-spacing:.13em}.v24cc-result h3{margin:7px 0 7px;font-size:20px;line-height:1.15;letter-spacing:-.03em}.v24cc-result p{margin:0;color:#66736f;font-size:10.5px;line-height:1.5}.v24cc-reasons{display:grid;gap:5px;margin:11px 0}.v24cc-reasons span{font-size:10px;color:#405550}.v24cc-note{margin-top:10px!important;color:#8a9390!important;font-size:8.5px!important}.v24cc-reset{margin-top:11px;border:0;background:transparent;padding:0;color:#536762;font:800 10px inherit;text-decoration:underline;text-underline-offset:3px}
 @media(min-width:680px){#v24-card-check{align-items:center}.v24cc-sheet{padding:24px 22px}}
 `;
 document.head.appendChild(style);
}
function yesNo(name,label,value){
 return `<div class="v24cc-question" data-v24cc-q="${name}"><strong>${label}</strong><div class="v24cc-toggle"><button type="button" data-value="yes" class="${value===true?'active':''}">Ja</button><button type="button" data-value="no" class="${value===false?'active':''}">Nein</button></div></div>`;
}
function mountOverlay(){
 let root=q('#v24-card-check');if(root)return root;
 ensureStyle();
 root=document.createElement('div');root.id='v24-card-check';root.hidden=true;
 document.body.appendChild(root);
 root.addEventListener('click',ev=>{if(ev.target===root)close();});
 return root;
}
function currentAnswers(){
 const p=profile();
 return {
  currentCard:p.currentCard||existingCard(),
  budget:String(p.budget??'20'),
  lounge:typeof p.lounge==='boolean'?p.lounge:null,
  credits:typeof p.credits==='boolean'?p.credits:null,
  insurance:typeof p.insurance==='boolean'?p.insurance:null,
  payback:typeof p.payback==='boolean'?p.payback:null
 };
}
function open(){
 const root=mountOverlay();const p=currentAnswers();
 root.innerHTML=`<section class="v24cc-sheet" role="dialog" aria-modal="true" aria-label="Kreditkarte prüfen"><div class="v24cc-head"><div><small>VAYQUO KARTEN-CHECK</small><h2>Welche Karte passt eher zu dir?</h2><p>VAYQUO prüft dein Nutzungsprofil. Ein Wechsel wird nur empfohlen, wenn die Angaben dafür reichen.</p></div><button type="button" class="v24cc-close" aria-label="Schließen">×</button></div>
 <form class="v24cc-form" id="v24cc-form"><label class="v24cc-field"><span>Welche Kreditkarte nutzt du aktuell?</span><select id="v24cc-current">${Object.entries(CARD_LABELS).map(([id,label])=>`<option value="${id}" ${p.currentCard===id?'selected':''}>${label}</option>`).join('')}</select></label>
 <label class="v24cc-field"><span>Was darf deine Karte maximal pro Monat kosten?</span><select id="v24cc-budget"><option value="0" ${p.budget==='0'?'selected':''}>0 €</option><option value="20" ${p.budget==='20'?'selected':''}>bis 20 €</option><option value="60" ${p.budget==='60'?'selected':''}>bis 60 €</option></select></label>
 ${yesNo('lounge','Würdest du Flughafen-Lounges mehrmals im Jahr wirklich nutzen?',p.lounge)}
 ${yesNo('credits','Würdest du Reise-, Mobilitäts- oder Restaurantguthaben tatsächlich nutzen?',p.credits)}
 ${yesNo('insurance','Sind umfangreiche Reiseversicherungen für dich wichtig?',p.insurance)}
 ${yesNo('payback','Sammelst du aktiv PAYBACK Punkte?',p.payback)}
 <button class="v24cc-submit" type="submit">Karte einordnen</button></form><div id="v24cc-result"></div></section>`;
 root.hidden=false;
 q('.v24cc-close',root)?.addEventListener('click',close);
 qa('[data-v24cc-q]',root).forEach(block=>qa('button',block).forEach(btn=>btn.addEventListener('click',()=>{
  qa('button',block).forEach(x=>x.classList.remove('active'));btn.classList.add('active');
 })));
 q('#v24cc-form',root)?.addEventListener('submit',submit);
}
function close(){q('#v24-card-check')?.setAttribute('hidden','');}
function boolAnswer(name){
 const block=q(`[data-v24cc-q="${name}"]`);
 const active=q('button.active',block);if(!active)return null;
 return active.dataset.value==='yes';
}
function recommendation(p){
 const reasons=[];
 const same=(id)=>p.currentCard===id;
 if(p.currentCard==='amex_platinum')return {title:'Deine Platinum bleibt vorerst die Referenz.',copy:'Aus diesen wenigen Angaben lässt sich kein seriöser Wechsel oder Downgrade ableiten. Entscheidend ist jetzt, ob du die enthaltenen Vorteile tatsächlich nutzt.',reasons:['Kein Kartenwechsel nur aufgrund eines kurzen Profils.']};
 if(p.budget>=60&&p.lounge===true&&p.credits===true){
  reasons.push('Du würdest Loungezugang real nutzen.','Du würdest enthaltene Guthaben tatsächlich einsetzen.','Ein Kartenentgelt bis 60 € pro Monat ist für dich grundsätzlich möglich.');
  return {title:same('amex_platinum')?'Platinum passt zu deinem angegebenen Nutzungsprofil.':'American Express Platinum näher prüfen.',copy:'Deine Angaben passen zu den zentralen Reise- und Guthabenmerkmalen der Platinum. Das ist noch keine finanzielle Wechsel-Empfehlung.',reasons};
 }
 if(p.budget>=20&&(p.insurance===true||p.credits===true)){
  if(p.insurance===true)reasons.push('Reiseversicherungen sind dir wichtig.');
  if(p.credits===true)reasons.push('Du würdest Mobilitäts- oder andere Guthaben real nutzen.');
  reasons.push('Ein Kartenentgelt bis 20 € pro Monat ist für dich grundsätzlich möglich.');
  return {title:same('amex_gold')?'Gold passt zu deinem angegebenen Nutzungsprofil.':'American Express Gold näher prüfen.',copy:'Deine Angaben passen eher zur Gold als zu einer pauschalen Premium-Empfehlung. Vor einem Wechsel müssen die Leistungen deiner aktuellen Karte noch dagegen gerechnet werden.',reasons};
 }
 if(p.budget===0&&p.payback===true){
  reasons.push('Du möchtest kein laufendes Kartenentgelt.','PAYBACK ist für dich relevant.');
  return {title:same('amex_payback')?'Deine PAYBACK Amex passt zu diesem Profil.':'PAYBACK American Express näher prüfen.',copy:'Die PAYBACK Amex hat aktuell kein Jahresentgelt und passt deshalb zu deinem angegebenen Kosten- und Punkteprofil. Weitere Entgelte können laut Anbieterbedingungen anfallen.',reasons};
 }
 if(p.budget>=60&&p.lounge===true){
  reasons.push('Loungezugang ist für dich relevant.','Ein höheres Kartenentgelt wäre für dich grundsätzlich möglich.');
  return {title:'Platinum nur als Option näher prüfen.',copy:'Der Lounge-Wunsch spricht dafür. Ohne klaren Nutzen der weiteren Guthaben empfiehlt VAYQUO aber noch keinen Wechsel.',reasons};
 }
 return {title:'Aktuell kein Kartenwechsel empfohlen.',copy:'Deine Angaben reichen nicht für einen klaren Vorteil einer der geprüften Amex-Optionen. Deine bestehende Karte bleibt deshalb vorerst die Referenz.',reasons:['VAYQUO empfiehlt nicht automatisch eine teurere Karte.']};
}
function submit(ev){
 ev.preventDefault();
 const answers={
  currentCard:String(q('#v24cc-current')?.value||'other'),
  budget:Number(q('#v24cc-budget')?.value||0),
  lounge:boolAnswer('lounge'),credits:boolAnswer('credits'),insurance:boolAnswer('insurance'),payback:boolAnswer('payback')
 };
 if([answers.lounge,answers.credits,answers.insurance,answers.payback].some(v=>v===null)){
  q('#v24cc-result').innerHTML='<div class="v24cc-result"><h3>Bitte alle vier Fragen beantworten.</h3></div>';return;
 }
 saveProfile(answers);
 const r=recommendation(answers);
 q('#v24cc-result').innerHTML=`<div class="v24cc-result"><small>DEINE VAYQUO EINORDNUNG</small><h3>${r.title}</h3><p>${r.copy}</p><div class="v24cc-reasons">${r.reasons.map(x=>`<span>✓ ${x}</span>`).join('')}</div><p class="v24cc-note">Datenstand ${DATA_AS_OF}. Kartengebühren und Leistungen können sich ändern und sollten vor einem Antrag beim Anbieter geprüft werden. Affiliate-Verfügbarkeit beeinflusst diese Einordnung nicht.</p><button type="button" class="v24cc-reset">Angaben ändern</button></div>`;
 q('.v24cc-reset')?.addEventListener('click',()=>q('.v24cc-sheet')?.scrollTo?.({top:0,behavior:'smooth'}));
}
function renderEntry(){
 if(!benefitsViewActive()){q('#v24-card-check-entry')?.remove();return;}
 if(q('#v24-card-check-entry'))return;
 ensureStyle();
 const box=document.createElement('section');box.id='v24-card-check-entry';
 box.innerHTML='<div class="v24cc-entry"><div class="v24cc-kicker">KARTE PRÜFEN</div><h3>Passt deine Kreditkarte noch zu dir?</h3><p>Vergleiche dein Nutzungsprofil neutral mit passenden Kartenoptionen – ohne automatische Upgrade-Empfehlung.</p><button type="button" class="v24cc-entry-btn">Karte prüfen <span>→</span></button></div>';
 const guidance=q('#v24-benefit-guidance');
 if(guidance)guidance.insertAdjacentElement('afterend',box);
 else{
  const owned=qa('#app .v24s35-section').find(section=>/Das\s+hast\s+du/i.test(text(section)));
  if(owned)owned.insertAdjacentElement('afterend',box);else q('#app .v24s35-benefits')?.appendChild(box);
 }
 q('.v24cc-entry-btn',box)?.addEventListener('click',open);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{renderEntry();}catch(e){console.warn('VAYQUO card check',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
