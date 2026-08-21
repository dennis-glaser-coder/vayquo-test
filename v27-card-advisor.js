(()=>{
'use strict';

const CONFIG_URL='config/vayquo-card-advisor.de.json?v=2701';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let catalog=null;
let catalogPromise=null;
let session=null;

const GOALS={
 premium:{icon:'✦',label:'Lounges & komfortabler reisen',short:'komfortabler reisen'},
 points:{icon:'◆',label:'Punkte sammeln & flexibel nutzen',short:'Punkte sammeln'},
 miles:{icon:'✈',label:'Lufthansa-Meilen sammeln',short:'Miles & More sammeln'},
 payback:{icon:'P',label:'PAYBACK Punkte sammeln',short:'PAYBACK sammeln'},
 save_fees:{icon:'0',label:'Möglichst keine Kartengebühr',short:'Gebühren sparen'},
 abroad:{icon:'◎',label:'Vor allem im Ausland bezahlen',short:'im Ausland bezahlen'},
 unsure:{icon:'?',label:'Ich weiß es noch nicht',short:'die passende Karte finden'}
};
const TRAVEL={rare:'Fast nie',low:'1–2 Reisen/Jahr',mid:'3–5 Reisen/Jahr',high:'6+ Reisen/Jahr'};
const SPEND={low:'unter 500 €',mid:'500–1.500 €',high:'1.500–3.000 €',very_high:'über 3.000 €'};
const FEES={zero:'0 €',small:'bis etwa 6 €/Monat',medium:'bis etwa 20 €/Monat',value:'bis 60 €, wenn es sich wirklich lohnt'};
const ECOSYSTEM={none:'Noch nirgendwo',mr:'Amex Membership Rewards',miles_more:'Miles & More',payback:'PAYBACK'};
const FREE_PRIORITY={payback:'PAYBACK Punkte sammeln',miles_more:'Miles & More-Meilen sammeln',acceptance:'Möglichst hohe Akzeptanz im Alltag & Ausland'};
const FEE_CAP={zero:0,small:6,medium:20,value:60};
const STEP_COUNT=5;

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}
function loadCatalog(){
 if(catalog)return Promise.resolve(catalog);
 if(catalogPromise)return catalogPromise;
 catalogPromise=fetch(CONFIG_URL,{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('CARD_CATALOG_UNAVAILABLE');return r.json();})
  .then(data=>catalog=data)
  .finally(()=>{catalogPromise=null;});
 return catalogPromise;
}
function savedProfile(){const p=safeState()?.cardAdvisorProfile;return p&&typeof p==='object'?p:{};}
function saveProfile(profile){
 try{const s=safeState();s.cardAdvisorProfile={...profile,updatedAt:new Date().toISOString()};if(typeof save==='function')save();}catch(e){console.warn('VAYQUO card advisor save',e);}
}
function startActive(){
 const nav=q('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;
 return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}
function benefitsActive(){
 const nav=q('#bottom [data-view="card"],.bottom [data-view="card"]');
 if(nav?.classList.contains('active'))return true;
 return q('#app h1')?.textContent.trim()==='Vorteile';
}
function nearestBlock(el){
 if(!el)return null;const app=q('#app');const section=el.closest('section');
 if(section&&section!==app)return section;
 let node=el.parentElement;
 for(let i=0;i<5&&node&&node!==app;i++,node=node.parentElement){if(qa('button,a,[role="button"]',node).length)return node;}
 return el.parentElement;
}

function ensureStyle(){
 if(q('#v27-card-advisor-style'))return;
 const style=document.createElement('style');style.id='v27-card-advisor-style';
 style.textContent=`
 #v27-card-advisor-entry{margin:14px 0 18px}.v27ca-entry{padding:18px 16px;border:1px solid rgba(117,91,52,.14);border-radius:20px;background:linear-gradient(145deg,#fffaf2,#fffdf9);box-shadow:0 9px 26px rgba(54,44,29,.045)}
 .v27ca-kicker{font-size:8px;letter-spacing:.14em;color:#987a4d;font-weight:900}.v27ca-entry h3{margin:7px 0 6px;color:#1d2c29;font-size:20px;line-height:1.15;letter-spacing:-.035em}.v27ca-entry p{margin:0;color:#707b78;font-size:10.5px;line-height:1.5}.v27ca-entry-btn{width:100%;min-height:46px;margin-top:13px;border:0;border-radius:14px;background:#183b35;color:#fff;padding:0 14px;display:flex;align-items:center;justify-content:space-between;text-align:left;font:850 11px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}.v27ca-entry-btn b{font-size:17px}
 #v27-card-advisor{position:fixed;inset:0;z-index:2147483550;display:flex;align-items:flex-end;justify-content:center;background:rgba(7,25,27,.58);padding:12px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}#v27-card-advisor[hidden]{display:none!important}
 .v27ca-sheet{width:min(100%,540px);max-height:min(91vh,800px);overflow:auto;background:#f7f3ec;color:#18302d;border-radius:26px;padding:20px 18px 22px;box-sizing:border-box;box-shadow:0 28px 90px rgba(0,0,0,.3)}
 .v27ca-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.v27ca-brand{font-size:8px;font-weight:900;letter-spacing:.14em;color:#987a4d}.v27ca-close{border:0;background:transparent;color:#61706d;font-size:26px;line-height:1;padding:0}.v27ca-progress{height:4px;border-radius:99px;background:#e5dfd5;margin:14px 0 19px;overflow:hidden}.v27ca-progress i{display:block;height:100%;background:#183b35;border-radius:99px;transition:width .2s ease}
 .v27ca-step small{display:block;color:#8a9390;font-size:9px;font-weight:800}.v27ca-step h2{margin:6px 0 6px;font-size:26px;line-height:1.05;letter-spacing:-.04em}.v27ca-step>p{margin:0 0 15px;color:#707b78;font-size:11px;line-height:1.5}.v27ca-options{display:grid;gap:8px}.v27ca-choice{width:100%;min-height:54px;border:1px solid #dfdbd2;border-radius:15px;background:#fffdf9;color:#213936;padding:11px 12px;text-align:left;font:800 12px inherit;display:flex;align-items:center;gap:10px}.v27ca-choice strong{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#f2ede4;color:#886d44;font-size:11px;flex:0 0 auto}.v27ca-choice.active{border-color:#183b35;background:#edf3ef}.v27ca-choice.active strong{background:#183b35;color:#fff}
 .v27ca-nav{display:flex;gap:8px;margin-top:15px}.v27ca-back,.v27ca-next{height:46px;border-radius:14px;font:850 11px inherit}.v27ca-back{width:42%;border:1px solid #dad5cc;background:transparent;color:#5f6d69}.v27ca-next{flex:1;border:0;background:#183b35;color:#fff}.v27ca-next:disabled{opacity:.38}.v27ca-mini{margin-top:12px;text-align:center;color:#909a97;font-size:8.5px;line-height:1.4}
 .v27ca-result-head small{display:block;color:#987a4d;font-size:8px;font-weight:900;letter-spacing:.14em}.v27ca-result-head h2{margin:7px 0 6px;font-size:25px;line-height:1.08;letter-spacing:-.04em}.v27ca-result-head p{margin:0;color:#6d7a77;font-size:10.5px;line-height:1.5}.v27ca-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}.v27ca-summary div{padding:11px;border-radius:14px;background:#eee9e0}.v27ca-summary small{display:block;color:#8a9390;font-size:8px;font-weight:850;margin-bottom:3px}.v27ca-summary b{font-size:10.5px;line-height:1.35}
 .v27ca-card{padding:16px;border-radius:18px;background:#fffdf9;border:1px solid #ddd8ce}.v27ca-card-label{font-size:8px;font-weight:900;letter-spacing:.13em;color:#987a4d}.v27ca-card h3{margin:6px 0 5px;font-size:21px;line-height:1.15;letter-spacing:-.035em}.v27ca-fee{font-size:10px;color:#687672}.v27ca-why{display:grid;gap:6px;margin:12px 0}.v27ca-why span{font-size:10.5px;line-height:1.4;color:#405550}.v27ca-warning{margin-top:9px;padding:9px 10px;border-radius:11px;background:#f5ede2;color:#765d3a;font-size:9px;line-height:1.45}.v27ca-actions{display:grid;gap:8px;margin-top:12px}.v27ca-select,.v27ca-provider{height:46px;border-radius:14px;font:850 11px inherit}.v27ca-select{border:0;background:#183b35;color:#fff}.v27ca-provider{display:flex;align-items:center;justify-content:center;border:1px solid #d9d4ca;background:transparent;color:#405550;text-decoration:none}.v27ca-alt{margin-top:10px;padding:11px 12px;border-radius:14px;background:#eee9e0;font-size:9.5px;line-height:1.45;color:#60706c}.v27ca-note{margin-top:12px;color:#8a9390;font-size:8.5px;line-height:1.45}.v27ca-restart{margin-top:12px;border:0;background:transparent;padding:0;color:#536762;font:800 10px inherit;text-decoration:underline;text-underline-offset:3px}
 @media(min-width:680px){#v27-card-advisor{align-items:center}.v27ca-sheet{padding:24px 22px}}
 `;
 document.head.appendChild(style);
}
function mountOverlay(){
 let root=q('#v27-card-advisor');if(root)return root;ensureStyle();
 root=document.createElement('div');root.id='v27-card-advisor';root.hidden=true;document.body.appendChild(root);
 root.addEventListener('click',ev=>{if(ev.target===root)close();});return root;
}
function close(){q('#v27-card-advisor')?.setAttribute('hidden','');}
function initialSession(){
 const saved=savedProfile();
 return {step:0,answers:{goal:saved.goal||'',travel:saved.travel||'',spend:saved.spend||'',fee:saved.fee||'',ecosystem:saved.ecosystem||''}};
}
function open(){session=initialSession();const root=mountOverlay();root.hidden=false;render();try{window.dispatchEvent(new CustomEvent('vayquo:card-advisor-open'));}catch{}}
function choices(map,selected,kind){
 return Object.entries(map).map(([id,value])=>{
  const label=typeof value==='string'?value:value.label;const icon=kind==='goal'?(value.icon||'•'):'•';
  return `<button type="button" class="v27ca-choice ${selected===id?'active':''}" data-v27ca-choice="${esc(id)}"><strong>${esc(icon)}</strong><span>${esc(label)}</span></button>`;
 }).join('');
}
function stepMeta(step){
 if(step===0)return {title:'Was soll deine Karte für dich tun?',copy:'Kein Kartenwissen nötig. Wähle einfach dein wichtigstes Ziel.',map:GOALS,key:'goal'};
 if(step===1)return {title:'Wie oft bist du unterwegs?',copy:'Damit VAYQUO Reisevorteile nicht überbewertet.',map:TRAVEL,key:'travel'};
 if(step===2)return {title:'Wie viel zahlst du ungefähr pro Monat mit Karte?',copy:'Gemeint sind deine Kartenzahlungen insgesamt pro Monat. Eine grobe Spanne reicht.',map:SPEND,key:'spend'};
 if(step===3)return {title:'Was darf eine gute Karte kosten?',copy:'Nicht was du gern zahlst – sondern was okay wäre, wenn der Mehrwert stimmt.',map:FEES,key:'fee'};
 if(session?.answers?.goal==='save_fees')return {title:'Was wäre dir bei 0 € Kartenentgelt wichtiger?',copy:'So kann VAYQUO zwischen mehreren kostenlosen Karten sinnvoll unterscheiden.',map:FREE_PRIORITY,key:'ecosystem'};
 return {title:'Wo sammelst du schon?',copy:'Wenn du noch nirgends sammelst, ist das genauso okay.',map:ECOSYSTEM,key:'ecosystem'};
}
function render(){
 const root=mountOverlay();if(!session)return;if(session.step>=STEP_COUNT){void renderResult();return;}
 const meta=stepMeta(session.step),selected=session.answers[meta.key];
 root.innerHTML=`<section class="v27ca-sheet" role="dialog" aria-modal="true" aria-label="Kreditkarten-Check"><div class="v27ca-top"><div class="v27ca-brand">VAYQUO KARTEN-CHECK</div><button class="v27ca-close" type="button" aria-label="Schließen">×</button></div><div class="v27ca-progress"><i style="width:${((session.step+1)/STEP_COUNT)*100}%"></i></div><div class="v27ca-step"><small>FRAGE ${session.step+1} VON ${STEP_COUNT}</small><h2>${esc(meta.title)}</h2><p>${esc(meta.copy)}</p><div class="v27ca-options">${choices(meta.map,selected,meta.key)}</div><div class="v27ca-nav">${session.step?'<button type="button" class="v27ca-back">Zurück</button>':''}<button type="button" class="v27ca-next" ${selected?'':'disabled'}>${session.step===STEP_COUNT-1?'Ergebnis zeigen':'Weiter'}</button></div><div class="v27ca-mini">Keine Provision beeinflusst die Empfehlung.</div></div></section>`;
 q('.v27ca-close',root)?.addEventListener('click',close);
 qa('[data-v27ca-choice]',root).forEach(btn=>btn.addEventListener('click',()=>{session.answers[meta.key]=btn.dataset.v27caChoice||'';qa('[data-v27ca-choice]',root).forEach(x=>x.classList.toggle('active',x===btn));q('.v27ca-next',root).disabled=false;}));
 q('.v27ca-back',root)?.addEventListener('click',()=>{session.step=Math.max(0,session.step-1);render();});
 q('.v27ca-next',root)?.addEventListener('click',()=>{if(!session.answers[meta.key])return;session.step++;render();});
}

function featureWeights(a){
 const w={};const add=(id,n)=>w[id]=(w[id]||0)+n;
 if(a.goal==='premium'){add('lounge',9);add('premium_travel',8);add('insurance',4);add('travel_credit',3);add('mr',2);}
 if(a.goal==='points'){add(a.ecosystem==='miles_more'?'miles_direct':'mr',9);add('insurance',1);}
 if(a.goal==='miles'){add('miles_direct',10);add('miles_expiry_protection',a.ecosystem==='miles_more'?4:2);}
 if(a.goal==='payback'){add('payback',12);add('free',3);}
 if(a.goal==='save_fees'){add('free',12);if(a.ecosystem==='payback')add('payback',8);if(a.ecosystem==='miles_more')add('miles_direct',8);}
 if(a.goal==='unsure'){add('free',2);if(a.travel==='mid'||a.travel==='high')add('insurance',2);if(a.travel==='high')add('lounge',2);}
 if(a.travel==='high'){add('premium_travel',3);add('insurance',3);add('lounge',3);}else if(a.travel==='mid'){add('insurance',2);add('premium_travel',1);}else if(a.travel==='low')add('insurance',1);
 if(a.spend==='very_high'||a.spend==='high'){if(a.ecosystem==='miles_more')add('miles_direct',2);else if(a.ecosystem==='mr')add('mr',2);}
 if(a.ecosystem==='mr')add('mr',5);if(a.ecosystem==='miles_more'){add('miles_direct',5);add('miles_expiry_protection',2);}if(a.ecosystem==='payback')add('payback',5);
 return w;
}
function scoreCard(card,a){
 const cap=FEE_CAP[a.fee]??0;if(Number(card.monthlyFeeEUR)>cap)return -1000-(Number(card.monthlyFeeEUR)-cap);
 const weights=featureWeights(a);let score=0;for(const [feature,weight] of Object.entries(weights))if(card.features?.includes(feature))score+=weight;
 if(a.goal==='save_fees'&&Number(card.monthlyFeeEUR)>0)score-=8;
 if(a.goal==='save_fees'&&a.ecosystem==='none'){
  if((a.travel==='mid'||a.travel==='high')&&card.id==='mm_myflex')score+=2;
  if((a.travel==='rare'||a.travel==='low')&&card.id==='amex_payback')score+=2;
 }
 if(a.goal==='premium'&&a.travel==='rare'&&card.id==='amex_platinum')score-=10;
 if(a.goal==='points'&&card.rewards?.includes('mr'))score+=3;if(a.goal==='miles'&&card.rewards?.includes('miles_more'))score+=3;if(a.goal==='payback'&&card.rewards?.includes('payback'))score+=4;
 score-=Number(card.monthlyFeeEUR||0)*0.05;return score;
}
function decide(data,a){
 if(a.goal==='abroad'||(a.goal==='save_fees'&&a.ecosystem==='acceptance'))return {outside:data.outsideScope?.free_abroad||null,ranked:[]};
 const ranked=(data.cards||[]).map(card=>({card,score:scoreCard(card,a)})).filter(x=>x.score>-900).sort((x,y)=>y.score-x.score||Number(x.card.monthlyFeeEUR)-Number(y.card.monthlyFeeEUR));
 if(!ranked.length||ranked[0].score<3)return {outside:data.outsideScope?.free_abroad||null,ranked};
 return {outside:null,ranked};
}
function needText(a){
 if(a.goal==='premium')return a.travel==='high'?'Loungezugang, Reiseleistungen und Vorteile, die du oft genug nutzt.':'Reisevorteile, die deine Kartengebühr wirklich wieder hereinholen.';
 if(a.goal==='points')return a.ecosystem==='miles_more'?'Eine Karte, die direkt Miles-&-More-Meilen sammelt.':'Ein flexibles Punkteprogramm statt eines starren Einlösewegs.';
 if(a.goal==='miles')return 'Eine Karte, die direkt Miles-&-More-Meilen sammelt und zu deinem Gebührenrahmen passt.';
 if(a.goal==='payback')return 'Eine einfache Karte mit PAYBACK-Anbindung und möglichst wenig Fixkosten.';
 if(a.goal==='save_fees')return a.ecosystem==='acceptance'?'0 € Fixkosten und möglichst hohe Visa-/Mastercard-Akzeptanz.':'Eine echte 0-€-Karte, deren Sammelwelt zu deiner Auswahl passt.';
 if(a.goal==='abroad')return 'Hohe weltweite Akzeptanz und gute Auslandskonditionen statt eines Punkteprogramms um jeden Preis.';
 return 'Eine Karte, deren laufende Kosten zu deinem tatsächlichen Nutzungsverhalten passen.';
}
function why(card,a){
 const reasons=[];
 if(Number(card.monthlyFeeEUR)===0)reasons.push('0 € laufendes Kartenentgelt passt zu deinem Gebührenwunsch.');
 if(card.features?.includes('mr')&&(a.goal==='points'||a.ecosystem==='mr'))reasons.push('Membership Rewards passt zu deinem Wunsch nach flexibel nutzbaren Punkten.');
 if(card.features?.includes('miles_direct')&&(a.goal==='miles'||a.ecosystem==='miles_more'))reasons.push('Du sammelst damit direkt Miles-&-More-Meilen.');
 if(card.features?.includes('payback')&&(a.goal==='payback'||a.ecosystem==='payback'))reasons.push('PAYBACK passt zu deiner ausgewählten Sammelwelt.');
 if(card.features?.includes('lounge')&&a.travel==='high')reasons.push('Du reist häufig genug, damit Loungezugang relevant werden kann.');
 if(card.features?.includes('insurance')&&(a.travel==='mid'||a.travel==='high'))reasons.push('Reiseversicherungen passen zu deiner Reisehäufigkeit.');
 if(!reasons.length)reasons.push('Sie deckt deine wichtigsten Angaben innerhalb deines Gebührenrahmens am besten ab.');
 return reasons.slice(0,4);
}
function feeLabel(card){const n=Number(card.monthlyFeeEUR)||0;return n===0?'0 € Kartenentgelt':`${new Intl.NumberFormat('de-DE',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).format(n)} € / Monat`;}
function selectionSummary(a){return `${GOALS[a.goal]?.short||'passende Karte'} · ${TRAVEL[a.travel]||''} · ${SPEND[a.spend]||''}/Monat`;}
function externalResultHtml(data,a){
 const outside=data.outsideScope?.free_abroad||{title:'Noch kein sauberer Treffer',copy:'VAYQUO empfiehlt dir hier bewusst keine Karte, solange der passende Marktbereich noch nicht vollständig bewertet ist.'};
 return `<div class="v27ca-result-head"><small>DEINE VAYQUO EINORDNUNG</small><h2>${esc(outside.title)}</h2><p>${esc(outside.copy)}</p></div><div class="v27ca-summary"><div><small>DU WILLST</small><b>${esc(GOALS[a.goal]?.label||'Eine passende Karte')}</b></div><div><small>DAFÜR BRAUCHST DU</small><b>${esc(needText(a))}</b></div></div><div class="v27ca-card"><div class="v27ca-card-label">NOCH KEIN BELASTBARER MARKTSIEGER</div><h3>VAYQUO zeigt lieber keinen falschen Sieger.</h3><p class="v27ca-fee">Für hohe Visa-/Mastercard-Akzeptanz wird der geprüfte Kartenbestand noch erweitert. Bis dahin erfindet VAYQUO keine Empfehlung.</p></div><p class="v27ca-note">Datenstand ${esc(data.checkedAt||'')}. Vor einem Antrag gelten immer die aktuellen Angaben des Kartenanbieters.</p><button type="button" class="v27ca-restart">Angaben ändern</button>`;
}
async function renderResult(){
 const root=mountOverlay();root.innerHTML='<section class="v27ca-sheet"><div class="v27ca-top"><div class="v27ca-brand">VAYQUO KARTEN-CHECK</div><button class="v27ca-close" type="button" aria-label="Schließen">×</button></div><div class="v27ca-progress"><i style="width:100%"></i></div><div class="v27ca-step"><h2>Deine Angaben werden eingeordnet …</h2><p>VAYQUO prüft Nutzen vor Kartenname.</p></div></section>';q('.v27ca-close',root)?.addEventListener('click',close);
 try{
  const data=await loadCatalog();const a=session.answers;saveProfile(a);const decision=decide(data,a);
  if(decision.outside){root.innerHTML=`<section class="v27ca-sheet"><div class="v27ca-top"><div class="v27ca-brand">VAYQUO KARTEN-CHECK</div><button class="v27ca-close" type="button" aria-label="Schließen">×</button></div>${externalResultHtml(data,a)}</section>`;wireResult(root,null,a);return;}
  const best=decision.ranked[0]?.card,alt=decision.ranked[1]?.card;
  if(!best){root.innerHTML=`<section class="v27ca-sheet">${externalResultHtml(data,a)}</section>`;wireResult(root,null,a);return;}
  const reasons=why(best,a),warnings=Array.isArray(best.warnings)?best.warnings:[];
  root.innerHTML=`<section class="v27ca-sheet"><div class="v27ca-top"><div class="v27ca-brand">VAYQUO KARTEN-CHECK</div><button class="v27ca-close" type="button" aria-label="Schließen">×</button></div><div class="v27ca-result-head"><small>DEINE BESTE WAHL IM AKTUELL GEPRÜFTEN SET</small><h2>${esc(best.name)}</h2><p>${esc(selectionSummary(a))}</p></div><div class="v27ca-summary"><div><small>DU WILLST</small><b>${esc(GOALS[a.goal]?.label||'Eine passende Karte')}</b></div><div><small>DAFÜR BRAUCHST DU</small><b>${esc(needText(a))}</b></div></div><div class="v27ca-card"><div class="v27ca-card-label">WARUM DIESE KARTE?</div><h3>${esc(best.name)}</h3><div class="v27ca-fee">${esc(feeLabel(best))}</div><div class="v27ca-why">${reasons.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>${warnings.map(x=>`<div class="v27ca-warning">Wichtig: ${esc(x)}</div>`).join('')}<div class="v27ca-actions"><button type="button" class="v27ca-select" data-card-id="${esc(best.id)}">Diese Karte passt zu mir</button><a class="v27ca-provider" href="${esc(best.officialUrl)}" target="_blank" rel="noopener noreferrer">Details beim Anbieter prüfen</a></div></div>${alt?`<div class="v27ca-alt"><b>Alternative:</b> ${esc(alt.name)} · ${esc(feeLabel(alt))}. VAYQUO zeigt bewusst nur eine Hauptempfehlung.</div>`:''}<p class="v27ca-note">Datenstand ${esc(data.checkedAt||'')}. Empfehlung nach deinen Angaben und Produktmerkmalen – nicht nach Provision. Konditionen und Annahmekriterien vor Antrag beim Anbieter prüfen.</p><button type="button" class="v27ca-restart">Angaben ändern</button></section>`;
  wireResult(root,best,a);try{window.dispatchEvent(new CustomEvent('vayquo:card-advisor-result',{detail:{cardId:best.id,answers:{...a},dataAsOf:data.checkedAt}}));}catch{}
 }catch(e){root.innerHTML='<section class="v27ca-sheet"><div class="v27ca-result-head"><small>VAYQUO KARTEN-CHECK</small><h2>Gerade keine belastbare Empfehlung</h2><p>Die geprüften Kartendaten konnten nicht geladen werden. VAYQUO zeigt deshalb lieber keine Empfehlung als eine unvollständige.</p></div><button type="button" class="v27ca-restart">Erneut versuchen</button></section>';q('.v27ca-restart',root)?.addEventListener('click',()=>{session=initialSession();render();});}
}
function wireResult(root,best,a){
 q('.v27ca-close',root)?.addEventListener('click',close);q('.v27ca-restart',root)?.addEventListener('click',()=>{session={step:0,answers:{goal:a.goal||'',travel:a.travel||'',spend:a.spend||'',fee:a.fee||'',ecosystem:a.ecosystem||''}};render();});
 q('.v27ca-select',root)?.addEventListener('click',ev=>{if(!best)return;const btn=ev.currentTarget;try{const s=safeState();s.cardAdvisorSelection={cardId:best.id,selectedAt:new Date().toISOString(),answers:{...a}};if(typeof save==='function')save();}catch{}btn.textContent='Ausgewählt ✓';btn.disabled=true;try{window.dispatchEvent(new CustomEvent('vayquo:card-selected',{detail:{cardId:best.id,answers:{...a}}}));}catch{}try{window.VAYQUOMonetization?.emit?.('card_selected',{cardId:best.id});}catch{}});
}
function renderEntry(){
 const visible=startActive()||benefitsActive();if(!visible){q('#v27-card-advisor-entry')?.remove();return;}if(q('#v27-card-advisor-entry'))return;ensureStyle();
 const box=document.createElement('section');box.id='v27-card-advisor-entry';box.innerHTML='<div class="v27ca-entry"><div class="v27ca-kicker">KREDITKARTEN-CHECK</div><h3>Welche Kreditkarte lohnt sich für mich?</h3><p>5 einfache Fragen. Kein Fachwissen. VAYQUO sagt dir, was du brauchst – und welche Karte dazu passt.</p><button type="button" class="v27ca-entry-btn">In etwa 60 Sekunden herausfinden <b>→</b></button></div>';
 if(startActive()){
  const optimizeHeading=qa('#app *').find(el=>el.children.length===0&&/Beste Nutzung finden/i.test(text(el)));const target=nearestBlock(optimizeHeading);
  if(target?.parentElement)target.insertAdjacentElement('beforebegin',box);else{const programsHeading=qa('#app *').find(el=>el.children.length===0&&text(el)==='Deine Programme');nearestBlock(programsHeading)?.insertAdjacentElement('afterend',box);}
 }else{const guidance=q('#v24-benefit-guidance');if(guidance)guidance.insertAdjacentElement('afterend',box);else q('#app')?.appendChild(box);}
 q('.v27ca-entry-btn',box)?.addEventListener('click',open);
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{renderEntry();}catch(e){console.warn('VAYQUO card advisor',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();document.addEventListener('click',()=>setTimeout(schedule,0));new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
