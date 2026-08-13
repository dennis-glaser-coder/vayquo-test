(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PROGRAMS={mr:{label:'Membership Rewards',unit:'Punkte',mono:'MR'},pb:{label:'PAYBACK',unit:'Punkte',mono:'PB'},mm:{label:'Miles & More',unit:'Meilen',mono:'M&M'}};
let mode='landing';
let legacyMode='';
let rules=null;
let rulesLoading=false;

function safeState(){try{return state||{};}catch{return {};}}
function active(id){return !!safeState()?.programs?.[id];}
function balance(id){return Math.max(0,Math.round(Number(safeState()?.balances?.[id])||0));}
function activeBalances(){return Object.keys(PROGRAMS).filter(active).map(id=>({id,...PROGRAMS[id],value:balance(id)}));}
function navItems(){return qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav');}
function navView(el){
 const v=String(el?.dataset?.view||'').toLowerCase();
 if(v)return v;
 const t=(el?.textContent||'').trim().toLowerCase();
 if(/start/.test(t))return 'home';
 if(/punkte/.test(t))return 'points';
 if(/prüfen|optimieren/.test(t))return 'optimize';
 if(/vorteile/.test(t))return 'card';
 return '';
}
function activeView(){
 const el=navItems().find(x=>x.classList.contains('active')||x.getAttribute('aria-current')==='page');
 return navView(el);
}
function replaceLeafLabel(el,re,newLabel){
 const leaf=qa('*',el).find(x=>x.children.length===0&&re.test((x.textContent||'').trim()));
 if(leaf){leaf.textContent=newLabel;return;}
 Array.from(el.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE&&re.test((n.textContent||'').trim())).forEach(n=>n.textContent=newLabel);
}
function patchNav(){
 const order={home:1,start:1,points:2,punkte:2,optimize:3,card:4,benefits:4};
 navItems().forEach(el=>{
  const v=navView(el);
  if(v==='optimize')replaceLeafLabel(el,/^(Prüfen|Optimieren)$/i,'Optimieren');
  if(order[v])el.style.order=String(order[v]);
 });
}
function goView(view,arg){
 try{if(typeof go==='function'){go(view,arg);return true;}}catch{}
 return false;
}
function pointsSummary(){
 const rows=activeBalances();
 if(!rows.length)return '<span class="v24ox-empty-chip">Noch keine Punkte hinterlegt</span>';
 return rows.map(p=>`<span class="v24ox-balance"><b>${esc(p.mono)}</b><span>${fmt(p.value)} ${esc(p.unit)}</span></span>`).join('');
}
function loadRules(){
 if(rules||rulesLoading)return;
 rulesLoading=true;
 fetch('config/vayquo-optimizer-rules.de.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{rules=data||null;}).catch(()=>{}).finally(()=>{rulesLoading=false;schedule();});
}
function programName(id){return rules?.programs?.[id]?.name||id;}
function transferFor(from,to){return rules?.directTransfers?.find(x=>x.from===from&&x.to===to&&x.status==='active')||null;}
function mrPaybackValue(){
 const t=transferFor('mr_de','payback_de');
 const mr=balance('mr');
 if(!t||mr<(Number(t.minimumSource)||0))return null;
 const step=Math.max(1,Number(t.sourceStep)||1);
 const transferable=Math.floor(mr/step)*step;
 const target=Math.floor((transferable/Number(t.sourceUnits))*Number(t.targetUnits));
 return {source:transferable,target,eur:target/100};
}
function pointRecommendation(){
 const items=[];
 if(active('mr')&&balance('mr')>0){
  items.push({tag:'HÖCHSTES POTENZIAL',title:'Airline-Partner zuerst prüfen',copy:'Ein Transfer kann deutlich mehr Gegenwert ermöglichen als eine einfache Einlösung. VAYQUO empfiehlt einen Transfer aber erst, wenn ein konkretes passendes Angebot geprüft ist.',action:'optimize'});
 }
 if(active('pb')&&balance('pb')>0){
  items.push({tag:'PLANBARER BASISWERT',title:`${fmt(balance('pb'))} PAYBACK Punkte entsprechen ${euro(balance('pb')/100)}`,copy:'PAYBACK hat einen festen Direktwert von 1 Cent pro Punkt. Ein Transfer zu Miles & More kann mehr Potenzial haben, muss aber am konkreten Einsatz geprüft werden.',action:'optimize'});
 }
 if(active('mm')&&balance('mm')>0){
  items.push({tag:'FÜR REISEN INTERESSANT',title:'Prämienflug oder Upgrade prüfen',copy:'Der tatsächliche Wert deiner Meilen hängt vom konkreten Angebot, der Zuzahlung und einem vergleichbaren Barpreis ab.',action:'optimize'});
 }
 return items[0]||null;
}
function pointsViewActive(){return activeView()==='points'||!!qa('#app h1,#app h2').find(x=>/^Punkte$/i.test((x.textContent||'').trim()));}
function pointsRoot(){
 const panel=q('#v24pb-panel');
 if(panel?.parentElement)return panel.parentElement;
 const h=qa('#app h1,#app h2').find(x=>/^Punkte$/i.test((x.textContent||'').trim()));
 return h?.closest('section,.screen,.page,.view')||q('#app');
}
function renderPointsEnhancement(){
 if(!pointsViewActive()){q('#v24ox-points')?.remove();return;}
 const root=pointsRoot();if(!root)return;
 const rec=pointRecommendation();
 const html=`<section id="v24ox-points" class="v24ox-points-card">
  <div class="v24ox-eyebrow">DEIN NÄCHSTER SCHRITT</div>
  <h2>${rec?esc(rec.title):'Was kannst du aus deinen Punkten machen?'}</h2>
  <p>${rec?esc(rec.copy):'Sobald du einen Punktestand hinterlegt hast, zeigt dir VAYQUO sinnvolle Wege und den nächsten Schritt.'}</p>
  <div class="v24ox-points-actions">
   <button type="button" class="v24ox-primary" data-v24ox-open-optimizer>${rec?'Beste Nutzung vergleichen':'Optimieren öffnen'} <span>→</span></button>
   ${active('mr')?'<button type="button" class="v24ox-secondary" data-v24ox-transfers>Transferwerte ansehen</button>':''}
  </div>
 </section>`;
 const current=q('#v24ox-points');
 if(current){if(current.outerHTML!==html)current.outerHTML=html;}
 else root.insertAdjacentHTML('beforeend',html);
 q('[data-v24ox-open-optimizer]')?.addEventListener('click',()=>{mode='recommend';goView('optimize');setTimeout(renderOptimizer,0);});
 q('[data-v24ox-transfers]')?.addEventListener('click',()=>{mode='transfers';goView('optimize');setTimeout(renderOptimizer,0);});
}
function optimizeViewActive(){return activeView()==='optimize'||!!qa('#app h1,#app h2').find(x=>/^(Prüfen|Optimieren)$/i.test((x.textContent||'').trim()));}
function shell(body,back=false){
 return `<section class="screen v24ox-screen" data-v24ox="1">
  <div class="v24ox-head">
   <div>${back?'<button type="button" class="v24ox-back" data-v24ox-back aria-label="Zurück">←</button>':''}<div class="v24ox-eyebrow">DEINE PUNKTE. BESSER GENUTZT.</div><h1>Optimieren</h1><p>VAYQUO macht aus Punkteständen eine klare Entscheidung – ohne unnötige Fachbegriffe.</p></div>
  </div>
  ${body}
 </section>`;
}
function landingHtml(){
 return shell(`<div class="v24ox-summary">${pointsSummary()}</div>
  <div class="v24ox-hero">
   <div class="v24ox-hero-icon">↗</div>
   <div class="v24ox-kicker">DEINE BESTE NUTZUNG</div>
   <h2>Wo holst du aus deinen Punkten am meisten heraus?</h2>
   <p>Wir berücksichtigen deinen Punktestand, Transfermöglichkeiten und den konkreten Einsatz. Keine erfundenen Live-Preise.</p>
   <button type="button" class="v24ox-primary" data-v24ox-recommend>Beste Nutzung finden <span>→</span></button>
  </div>
  <button type="button" class="v24ox-offer" data-v24ox-offer>
   <span><small>SCHON ETWAS GEFUNDEN?</small><strong>Konkretes Angebot bewerten</strong><em>Barpreis, Punkte/Meilen und Zuzahlung eingeben.</em></span><b>→</b>
  </button>`);
}
function recommendationCards(){
 const cards=[];
 if(active('mr')&&balance('mr')>0){
  cards.push({rank:'01',tag:'HÖCHSTES WERTPOTENZIAL',title:'Airline-Transfer für einen passenden Prämienflug',copy:'Das kann besonders viel Gegenwert bringen. Entscheidend sind aber echte Verfügbarkeit, Meilenpreis und Gebühren. Deshalb erst Flug prüfen, dann transferieren.',cta:'Passenden Flug prüfen',action:'flight'});
  const pb=mrPaybackValue();
  if(pb)cards.push({rank:'02',tag:'PLANBARER GEGENWERT',title:`Über PAYBACK wären rund ${euro(pb.eur)} direkt nutzbar`,copy:`Aus ${fmt(pb.source)} Membership Rewards werden nach dem hinterlegten Transferverhältnis ${fmt(pb.target)} PAYBACK Punkte. Das ist ein Vergleichswert – nicht automatisch die beste Nutzung.`,cta:'Transferwege ansehen',action:'transfers'});
  cards.push({rank:'03',tag:'EINFACHER WEG',title:'Direkt für Reiseleistungen einsetzen',copy:'Bequem, aber der tatsächliche Umrechnungskurs muss beim konkreten Angebot geprüft werden. VAYQUO erfindet dafür keinen festen Wert.',cta:'Angebot bewerten',action:'offer'});
 }
 if(active('pb')&&balance('pb')>0){
  cards.push({rank:String(cards.length+1).padStart(2,'0'),tag:'SICHERER BASISWERT',title:`${fmt(balance('pb'))} PAYBACK Punkte = ${euro(balance('pb')/100)}`,copy:'Das ist der feste direkte Gegenwert. Ein Transfer zu Miles & More kann mehr Potenzial bieten, wenn ein konkreter Prämienflug dafür sinnvoll ist.',cta:'Möglichkeiten vergleichen',action:'offer'});
 }
 if(active('mm')&&balance('mm')>0){
  cards.push({rank:String(cards.length+1).padStart(2,'0'),tag:'KONKRETER REISEWERT',title:'Miles & More für Flug oder Upgrade bewerten',copy:'Ob sich die Meilen lohnen, entscheidet der Vergleich aus Barpreis, Meilenpreis und Zuzahlung.',cta:'Angebot bewerten',action:'offer'});
 }
 return cards.slice(0,4);
}
function recommendHtml(){
 const cards=recommendationCards();
 const body=`<div class="v24ox-summary">${pointsSummary()}</div>
  <div class="v24ox-section-title"><small>FÜR DEINEN AKTUELLEN STAND</small><h2>${cards.length?'Das solltest du zuerst prüfen':'Noch fehlt dein Punktestand'}</h2><p>${cards.length?'VAYQUO trennt bewusst zwischen Wertpotenzial und einem tatsächlich verfügbaren Deal.':'Trage unter „Punkte“ zuerst deinen aktuellen Stand ein.'}</p></div>
  <div class="v24ox-reco-list">${cards.map(c=>`<article class="v24ox-reco"><div class="v24ox-rank">${c.rank}</div><div><small>${esc(c.tag)}</small><h3>${esc(c.title)}</h3><p>${esc(c.copy)}</p><button type="button" data-v24ox-action="${esc(c.action)}">${esc(c.cta)} <span>→</span></button></div></article>`).join('')}</div>
  ${cards.length?'<div class="v24ox-trust">Wichtig: VAYQUO empfiehlt keinen Punktetransfer ohne ein konkretes geprüftes Angebot.</div>':''}`;
 return shell(body,true);
}
function transferRows(){
 const mr=balance('mr');
 if(!rules||!active('mr'))return [];
 return (rules.directTransfers||[]).filter(t=>t.from==='mr_de'&&t.status==='active').map(t=>{
  const step=Math.max(1,Number(t.sourceStep)||1);
  const usable=Math.floor(mr/step)*step;
  const target=usable>0?Math.floor((usable/Number(t.sourceUnits))*Number(t.targetUnits)):0;
  return {to:t.to,name:programName(t.to),ratio:`${t.sourceUnits}:${t.targetUnits}`,target,minimum:Number(t.minimumSource)||0};
 });
}
function transfersHtml(){
 const rows=transferRows();
 const body=`<div class="v24ox-section-title"><small>TRANSFERWERTE</small><h2>Was wird aus deinen Membership Rewards?</h2><p>Reine Umrechnung deines aktuellen Stands. Das ist noch keine Empfehlung zum Übertragen.</p></div>
  <div class="v24ox-transfer-list">${rows.length?rows.map(r=>`<div class="v24ox-transfer-row"><span><b>${esc(r.name)}</b><small>Transfer ${esc(r.ratio)}</small></span><strong>${balance('mr')>=r.minimum?`${fmt(r.target)} Punkte/Meilen`:`ab ${fmt(r.minimum)} MR`}</strong></div>`).join(''):'<div class="v24ox-empty">Aktiviere Membership Rewards und hinterlege deinen Punktestand, um Transferwerte zu sehen.</div>'}</div>
  <div class="v24ox-trust">Transferverhältnisse stammen aus den in VAYQUO hinterlegten Regeln. Vor einem Transfer muss ein konkretes Angebot und die aktuelle Verfügbarkeit geprüft werden.</div>`;
 return shell(body,true);
}
function offerHtml(){
 const body=`<div class="v24ox-section-title"><small>ANGEBOT BEWERTEN</small><h2>Lohnt sich dieses konkrete Angebot?</h2><p>Wähle die Punkteart und trage die drei Zahlen ein, die du beim Anbieter siehst.</p></div>
  <div class="v24ox-form">
   <label><span>Welche Punkte oder Meilen setzt du ein?</span><div><select id="v24ox-currency"><option value="other">Airline-Meilen / anderes Programm</option>${active('mr')?'<option value="mr">Membership Rewards</option>':''}${active('pb')?'<option value="pb">PAYBACK Punkte</option>':''}${active('mm')?'<option value="mm">Miles & More Meilen</option>':''}</select></div></label>
   <label><span>Barpreis des vergleichbaren Angebots</span><div><input id="v24ox-cash" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 980"><b>€</b></div></label>
   <label><span>Benötigte Punkte oder Meilen</span><div><input id="v24ox-award" type="number" min="1" step="1" inputmode="numeric" placeholder="z. B. 55000"></div></label>
   <label><span>Zuzahlung bei Punkte-/Meilenbuchung</span><div><input id="v24ox-fees" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 190"><b>€</b></div></label>
   <button type="button" class="v24ox-primary" data-v24ox-calc>Angebot bewerten <span>→</span></button>
  </div>
  <div id="v24ox-result"></div>`;
 return shell(body,true);
}
function renderOfferResult(){
 const cash=Number(q('#v24ox-cash')?.value),award=Number(q('#v24ox-award')?.value),fees=Number(q('#v24ox-fees')?.value||0);
 const out=q('#v24ox-result');if(!out)return;
 if(!Number.isFinite(cash)||cash<=0||!Number.isFinite(award)||award<=0||!Number.isFinite(fees)||fees<0){out.innerHTML='<div class="v24ox-error">Bitte Barpreis, Punkte/Meilen und Zuzahlung vollständig eintragen.</div>';return;}
 const saving=cash-fees;
 const cpp=(saving/award)*100;
 if(saving<=0){out.innerHTML=`<div class="v24ox-result bad"><small>ERGEBNIS</small><h3>Barzahlung ist hier günstiger.</h3><p>Die Zuzahlung ist bereits so hoch wie oder höher als der vergleichbare Barpreis.</p></div>`;return;}
 const currency=String(q('#v24ox-currency')?.value||'other');
 const payback=currency==='pb';
 let verdict='Jetzt hast du einen sauberen Vergleichswert.';
 let note='Ob dieser Wert gut ist, hängt vom verwendeten Punkte- oder Meilenprogramm und deinen Alternativen ab.';
 if(payback&&cpp<1){verdict='Direktes PAYBACK-Einlösen wäre wertvoller.';note='PAYBACK hat einen festen Direktwert von 1 Cent pro Punkt. Dieses Angebot liegt darunter.';}
 else if(payback&&cpp>=1){verdict='Das Angebot schlägt den direkten PAYBACK-Basiswert.';note='Prüfe trotzdem, ob Gebühren, Verfügbarkeit und Bedingungen wirklich vergleichbar sind.';}
 out.innerHTML=`<div class="v24ox-result"><small>DEIN VERGLEICHSWERT</small><div class="v24ox-result-number">${cpp.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} <span>Cent</span></div><h3>${esc(verdict)}</h3><p>Du sparst gegenüber dem Barpreis rechnerisch ${euro(saving)} vor dem Wert deiner eingesetzten Punkte/Meilen. ${esc(note)}</p></div>`;
}
function renderOptimizer(){
 if(!optimizeViewActive())return;
 if(legacyMode){enhanceLegacy();return;}
 const app=q('#app');if(!app)return;
 const html=mode==='recommend'?recommendHtml():mode==='offer'?offerHtml():mode==='transfers'?transfersHtml():landingHtml();
 if(q('#app [data-v24ox="1"]')?.outerHTML===html)return;
 app.innerHTML=html;
 q('[data-v24ox-back]')?.addEventListener('click',()=>{mode='landing';renderOptimizer();});
 q('[data-v24ox-recommend]')?.addEventListener('click',()=>{mode='recommend';renderOptimizer();});
 q('[data-v24ox-offer]')?.addEventListener('click',()=>{mode='offer';renderOptimizer();});
 q('[data-v24ox-calc]')?.addEventListener('click',renderOfferResult);
 qa('[data-v24ox-action]').forEach(b=>b.addEventListener('click',()=>{
  const a=b.dataset.v24oxAction;
  if(a==='offer'){mode='offer';renderOptimizer();return;}
  if(a==='transfers'){mode='transfers';renderOptimizer();return;}
  if(a==='flight'){openLegacyFlight();}
 }));
}
function openLegacyFlight(){
 legacyMode='flight';
 if(!goView('optimize','flight')){legacyMode='';return;}
 setTimeout(enhanceLegacy,0);
}
function enhanceLegacy(){
 if(!legacyMode||!optimizeViewActive())return;
 const app=q('#app');if(!app)return;
 const h=qa('h1,h2',app).find(x=>/^(Prüfen|Optimieren)$/i.test((x.textContent||'').trim()));
 if(h)h.textContent='Flug optimieren';
 const chooser=qa('h2,h3,strong',app).find(x=>/Wähle, was du prüfen möchtest/i.test((x.textContent||'').trim()));
 const chooserBlock=chooser?.closest('section,.card,.panel,[class*="card"],[class*="panel"]')||chooser?.parentElement;
 if(chooserBlock)chooserBlock.style.display='none';
 if(!q('#v24ox-legacy-back',app)){
  const back=document.createElement('button');back.id='v24ox-legacy-back';back.className='v24ox-legacy-back';back.textContent='← Zurück zu Optimieren';
  back.onclick=()=>{legacyMode='';mode='recommend';renderOptimizer();};
  app.insertBefore(back,app.firstChild);
 }
}
function resetModeOnLeave(){if(activeView()!=='optimize'){legacyMode='';mode='landing';}}

let scheduled=false;
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  try{
   loadRules();patchNav();resetModeOnLeave();renderPointsEnhancement();renderOptimizer();
  }catch(e){console.warn('VAYQUO optimizer UX',e);}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
