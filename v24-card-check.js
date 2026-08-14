(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const DATA_AS_OF='14.08.2026';

const CURRENT_CARD_LABELS={
 none:'Keine Kreditkarte',
 visa_mc_standard:'Visa / Mastercard · Standard',
 visa_mc_premium:'Visa / Mastercard · Premium',
 miles_more:'Miles & More Kreditkarte',
 amex_payback:'PAYBACK American Express',
 amex_blue:'American Express Blue Card',
 amex_green:'American Express Card',
 amex_gold:'American Express Gold',
 amex_platinum:'American Express Platinum',
 amex_other:'Andere American Express',
 other:'Andere Kreditkarte'
};

const BENEFITS={
 mr:'Membership Rewards',
 payback:'PAYBACK Punkte',
 insurance:'Reiseversicherungen',
 mobility:'Mobilitätsguthaben',
 lounge:'Loungezugang',
 travel:'Reiseguthaben',
 restaurant:'Restaurantguthaben'
};

const CANDIDATES=[
 {id:'amex_payback',label:'PAYBACK American Express',fee:0,features:['payback']},
 {id:'amex_green',label:'American Express Card',fee:5,features:['mr']},
 {id:'amex_gold',label:'American Express Gold',fee:20,features:['mr','insurance','mobility']},
 {id:'amex_platinum',label:'American Express Platinum',fee:60,features:['mr','insurance','mobility','lounge','travel','restaurant']}
];

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
 if(card==='green')return 'amex_green';
 if(card==='blue')return 'amex_blue';
 if(card==='payback'||card==='dmpayback')return 'amex_payback';
 if(['bmw','bmwpremium'].includes(card))return 'amex_other';
 return safeState()?.cardCheckProfile?.currentCard||'other';
}
function profile(){
 const saved=safeState()?.cardCheckProfile;
 return saved&&typeof saved==='object'?saved:{};
}
function defaultBudget(card){
 if(card==='amex_platinum')return '60';
 if(card==='amex_gold')return '20';
 if(card==='amex_green')return '5';
 if(card==='amex_payback'||card==='amex_blue'||card==='none')return '0';
 return '20';
}
function legacyBenefits(p){
 const out=[];
 if(p?.lounge===true)out.push('lounge');
 if(p?.insurance===true)out.push('insurance');
 if(p?.payback===true)out.push('payback');
 return out;
}
function currentAnswers(){
 const p=profile();
 const currentCard=p.currentCard||existingCard();
 const savedBenefits=Array.isArray(p.benefits)?p.benefits.filter(x=>BENEFITS[x]):legacyBenefits(p);
 return {
  currentCard,
  budget:String(p.budget??defaultBudget(currentCard)),
  benefits:savedBenefits
 };
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
 .v24cc-form{display:grid;gap:13px;margin-top:18px}.v24cc-field>span,.v24cc-benefit-title{display:block;margin:0 0 6px 2px;color:#566662;font-size:10px;font-weight:850}.v24cc-field select{width:100%;height:48px;border:1px solid #dcd8cf;border-radius:14px;background:#fffdf9;color:#18302d;padding:0 12px;font:700 13px inherit;box-sizing:border-box}
 .v24cc-benefit-box{padding:13px;border:1px solid #dfdbd2;border-radius:15px;background:#fffdf9}.v24cc-benefit-box>small{display:block;margin-top:-1px;color:#8a9390;font-size:9px;line-height:1.4}.v24cc-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.v24cc-chip{min-height:38px;border:1px solid #ddd8ce;border-radius:12px;background:#f5f1e9;color:#65716e;padding:8px 11px;font:800 10px inherit}.v24cc-chip.active{background:#183b35;color:#fff;border-color:#183b35}.v24cc-none{width:100%}
 .v24cc-scope{margin:-2px 2px 0;color:#8a9390;font-size:8.5px;line-height:1.45}.v24cc-submit{height:48px;border:0;border-radius:14px;background:#183b35;color:#fff;font:850 13px inherit}.v24cc-result{margin-top:17px;padding:16px;border-radius:17px;background:#fffdf9;border:1px solid #ded9cf}.v24cc-result small{display:block;color:#987a4d;font-size:8px;font-weight:900;letter-spacing:.13em}.v24cc-result h3{margin:7px 0 7px;font-size:20px;line-height:1.15;letter-spacing:-.03em}.v24cc-result p{margin:0;color:#66736f;font-size:10.5px;line-height:1.5}.v24cc-reasons{display:grid;gap:5px;margin:11px 0}.v24cc-reasons span{font-size:10px;color:#405550}.v24cc-note{margin-top:10px!important;color:#8a9390!important;font-size:8.5px!important}.v24cc-reset{margin-top:11px;border:0;background:transparent;padding:0;color:#536762;font:800 10px inherit;text-decoration:underline;text-underline-offset:3px}
 @media(min-width:680px){#v24-card-check{align-items:center}.v24cc-sheet{padding:24px 22px}}
 `;
 document.head.appendChild(style);
}
function mountOverlay(){
 let root=q('#v24-card-check');if(root)return root;
 ensureStyle();
 root=document.createElement('div');root.id='v24-card-check';root.hidden=true;
 document.body.appendChild(root);
 root.addEventListener('click',ev=>{if(ev.target===root)close();});
 return root;
}
function benefitButtons(selected){
 const buttons=Object.entries(BENEFITS).map(([id,label])=>`<button type="button" class="v24cc-chip ${selected.includes(id)?'active':''}" data-v24cc-benefit="${id}">${label}</button>`).join('');
 return `${buttons}<button type="button" class="v24cc-chip v24cc-none ${selected.length?'':'active'}" data-v24cc-benefit="none">Keinen davon</button>`;
}
function open(){
 const root=mountOverlay();const p=currentAnswers();
 root.innerHTML=`<section class="v24cc-sheet" role="dialog" aria-modal="true" aria-label="Kreditkarte prüfen"><div class="v24cc-head"><div><small>VAYQUO KARTEN-CHECK</small><h2>Passt eine Amex zu deinem Profil?</h2><p>Deine aktuelle Karte ist der Ausgangspunkt. Wähle nur Vorteile, die du wirklich nutzen würdest.</p></div><button type="button" class="v24cc-close" aria-label="Schließen">×</button></div>
 <form class="v24cc-form" id="v24cc-form"><label class="v24cc-field"><span>Welche Kreditkarte nutzt du aktuell?</span><select id="v24cc-current">${Object.entries(CURRENT_CARD_LABELS).map(([id,label])=>`<option value="${id}" ${p.currentCard===id?'selected':''}>${label}</option>`).join('')}</select></label>
 <label class="v24cc-field"><span>Was darf deine Karte maximal pro Monat kosten?</span><select id="v24cc-budget"><option value="0" ${p.budget==='0'?'selected':''}>0 €</option><option value="5" ${p.budget==='5'?'selected':''}>bis 5 €</option><option value="20" ${p.budget==='20'?'selected':''}>bis 20 €</option><option value="60" ${p.budget==='60'?'selected':''}>bis 60 €</option><option value="999" ${p.budget==='999'?'selected':''}>Mehr, wenn der Mehrwert stimmt</option></select></label>
 <div class="v24cc-benefit-box"><span class="v24cc-benefit-title">Welche Vorteile würdest du wirklich nutzen?</span><small>Mehrfachauswahl möglich.</small><div class="v24cc-chips">${benefitButtons(p.benefits)}</div></div>
 <p class="v24cc-scope">Aktuell berücksichtigt VAYQUO PAYBACK Amex, American Express Card, Gold und Platinum. Individuelle Leistungen anderer Karten werden noch nicht automatisch bewertet.</p>
 <button class="v24cc-submit" type="submit">Karte einordnen</button></form><div id="v24cc-result"></div></section>`;
 root.hidden=false;
 q('.v24cc-close',root)?.addEventListener('click',close);
 qa('[data-v24cc-benefit]',root).forEach(btn=>btn.addEventListener('click',()=>toggleBenefit(btn,root)));
 q('#v24cc-form',root)?.addEventListener('submit',submit);
}
function close(){q('#v24-card-check')?.setAttribute('hidden','');}
function toggleBenefit(btn,root){
 const id=btn.dataset.v24ccBenefit;
 if(id==='none'){
  qa('[data-v24cc-benefit]',root).forEach(x=>x.classList.toggle('active',x===btn));
  return;
 }
 btn.classList.toggle('active');
 q('[data-v24cc-benefit="none"]',root)?.classList.remove('active');
 const any=qa('[data-v24cc-benefit]:not([data-v24cc-benefit="none"])',root).some(x=>x.classList.contains('active'));
 if(!any)q('[data-v24cc-benefit="none"]',root)?.classList.add('active');
}
function selectedBenefits(){
 return qa('[data-v24cc-benefit].active').map(x=>x.dataset.v24ccBenefit).filter(x=>BENEFITS[x]);
}
function isExternalCurrent(card){
 return !String(card||'').startsWith('amex_');
}
function fitCandidates(p){
 const selected=p.benefits;
 const budget=Number(p.budget)||0;
 return CANDIDATES.map(card=>{
  const affordable=budget>=999||card.fee<=budget;
  const matches=selected.filter(x=>card.features.includes(x));
  const missing=selected.filter(x=>!card.features.includes(x));
  const coverage=selected.length?matches.length/selected.length:0;
  return {...card,affordable,matches,missing,coverage};
 });
}
function recommendation(p){
 const selected=p.benefits;
 if(!selected.length){
  return {title:'Aktuell kein Kartenwechsel ableitbar.',copy:'Du hast keinen der abgefragten Vorteile ausgewählt. Deshalb empfiehlt VAYQUO keine andere Karte nur wegen ihres Namens oder ihrer Positionierung.',reasons:['Keine unnötige Kartenempfehlung ohne konkreten Nutzen.']};
 }
 const fits=fitCandidates(p);
 const affordable=fits.filter(x=>x.affordable&&x.matches.length>0).sort((a,b)=>b.matches.length-a.matches.length||b.coverage-a.coverage||a.fee-b.fee);
 const best=affordable[0];
 if(!best){
  const closest=fits.filter(x=>x.matches.length>0).sort((a,b)=>b.matches.length-a.matches.length||a.fee-b.fee)[0];
  const extra=closest?` Die naheliegendste Option wäre ${closest.label} mit ${closest.fee} € Monatsentgelt.`:'';
  return {title:'Dein Budget und deine Wünsche passen noch nicht zusammen.',copy:`Innerhalb deines gewählten Monatsbudgets deckt keine der aktuell berücksichtigten Amex-Karten deine ausgewählten Schwerpunkte sinnvoll ab.${extra}`,reasons:['VAYQUO empfiehlt keine Karte oberhalb deines gewählten Budgets.']};
 }
 if(selected.length>1&&best.coverage<0.67){
  return {title:'Noch kein eindeutiger Karten-Treffer.',copy:`${best.label} deckt nur einen Teil deiner ausgewählten Wünsche ab. Für eine klare Empfehlung ist das zu wenig.`,reasons:[`Passend: ${best.matches.map(x=>BENEFITS[x]).join(', ')}.`,`Nicht abgedeckt: ${best.missing.map(x=>BENEFITS[x]).join(', ')}.`]};
 }
 const same=p.currentCard===best.id;
 const reasons=best.matches.map(x=>`${BENEFITS[x]} passt zu deinen Angaben.`);
 if(best.missing.length)reasons.push(`Nicht direkt abgedeckt: ${best.missing.map(x=>BENEFITS[x]).join(', ')}.`);
 reasons.push(best.fee===0?'Kein laufendes Jahresentgelt für diese Karte.':`Aktuelles Kartenentgelt: ${best.fee} € pro Monat.`);
 let copy=same
  ?'Von den aktuell berücksichtigten Amex-Karten passt deine bestehende Karte am besten zu den von dir ausgewählten Schwerpunkten und deinem Budget.'
  :`Von den aktuell berücksichtigten Amex-Karten passt ${best.label} am besten zu deinen ausgewählten Schwerpunkten und deinem Budget.`;
 if(isExternalCurrent(p.currentCard))copy+=' Die individuellen Leistungen deiner aktuellen Karte werden dabei noch nicht automatisch gegengerechnet.';
 return {title:same?`Deine ${best.label} passt zu deinem Profil.`:`${best.label} näher prüfen.`,copy,reasons};
}
function submit(ev){
 ev.preventDefault();
 const answers={
  currentCard:String(q('#v24cc-current')?.value||'other'),
  budget:Number(q('#v24cc-budget')?.value||0),
  benefits:selectedBenefits()
 };
 saveProfile(answers);
 const r=recommendation(answers);
 q('#v24cc-result').innerHTML=`<div class="v24cc-result"><small>DEINE VAYQUO EINORDNUNG</small><h3>${r.title}</h3><p>${r.copy}</p><div class="v24cc-reasons">${r.reasons.map(x=>`<span>✓ ${x}</span>`).join('')}</div><p class="v24cc-note">Datenstand ${DATA_AS_OF}. Berücksichtigt werden die öffentlich ausgewiesenen Kartenentgelte und die hier abgefragten Kernleistungen. Weitere Entgelte, Bedingungen und Versicherungsdetails können gelten und sollten vor einem Antrag beim Anbieter geprüft werden. Affiliate-Verfügbarkeit beeinflusst diese Einordnung nicht.</p><button type="button" class="v24cc-reset">Angaben ändern</button></div>`;
 q('.v24cc-reset')?.addEventListener('click',()=>q('.v24cc-sheet')?.scrollTo?.({top:0,behavior:'smooth'}));
}
function renderEntry(){
 if(!benefitsViewActive()){q('#v24-card-check-entry')?.remove();return;}
 if(q('#v24-card-check-entry'))return;
 ensureStyle();
 const box=document.createElement('section');box.id='v24-card-check-entry';
 box.innerHTML='<div class="v24cc-entry"><div class="v24cc-kicker">KARTE PRÜFEN</div><h3>Passt deine Kreditkarte noch zu dir?</h3><p>Prüfe, ob eine Amex-Karte zu deinem Nutzungsprofil passt – oder ob du keinen Wechsel brauchst.</p><button type="button" class="v24cc-entry-btn">Karte prüfen <span>→</span></button></div>';
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