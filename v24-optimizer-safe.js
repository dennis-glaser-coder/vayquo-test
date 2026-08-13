(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const PROGRAMS={mr:{label:'Membership Rewards',unit:'Punkte',mono:'MR'},pb:{label:'PAYBACK',unit:'Punkte',mono:'PB'},mm:{label:'Miles & More',unit:'Meilen',mono:'M&M'}};
let mode='landing';
let legacyMode='';
let rules=null;
let rulesLoading=false;
let scheduled=false;

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}
function active(id){return !!safeState()?.programs?.[id];}
function balance(id){return Math.max(0,Math.round(Number(safeState()?.balances?.[id])||0));}
function activeBalances(){return Object.keys(PROGRAMS).filter(active).map(id=>({id,...PROGRAMS[id],value:balance(id)}));}
function navItems(){return qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav');}
function navKind(el){
 const v=String(el?.dataset?.view||'').toLowerCase();
 const t=(el?.textContent||'').trim().toLowerCase();
 if(v==='home'||v==='start'||/start/.test(t))return 'home';
 if(v==='points'||v==='punkte'||/punkte/.test(t))return 'points';
 if(v==='check'||/prüfen|optimieren/.test(t))return 'optimize';
 if(v==='card'||v==='benefits'||/vorteile/.test(t))return 'benefits';
 return '';
}
function activeKind(){
 const activeNav=navItems().find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 return navKind(activeNav);
}
function replaceLeafLabel(el,newLabel){
 const leaf=qa('*',el).find(x=>x.children.length===0&&/^(Prüfen|Optimieren)$/i.test((x.textContent||'').trim()));
 if(leaf){leaf.textContent=newLabel;return;}
 Array.from(el.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE&&/^(Prüfen|Optimieren)$/i.test((n.textContent||'').trim())).forEach(n=>n.textContent=newLabel);
}
function patchNav(){
 const order={home:1,points:2,optimize:3,benefits:4};
 navItems().forEach(el=>{
  const kind=navKind(el);
  if(kind==='optimize')replaceLeafLabel(el,'Optimieren');
  if(order[kind])el.style.order=String(order[kind]);
 });
}
function loadRules(){
 if(rules||rulesLoading)return;
 rulesLoading=true;
 fetch('config/vayquo-optimizer-rules.de.json',{cache:'no-store'})
  .then(r=>r.ok?r.json():null)
  .then(data=>{rules=data||null;})
  .catch(()=>{})
  .finally(()=>{rulesLoading=false;if(mode==='landing'||mode==='recommend')setTimeout(()=>renderOptimizer(true),0);else schedule();});
}
function transferFor(from,to){return rules?.directTransfers?.find(x=>x.from===from&&x.to===to&&x.status==='active')||null;}
function mrToPayback(){
 const t=transferFor('mr_de','payback_de');
 const mr=balance('mr');
 if(!t||mr<(Number(t.minimumSource)||0))return null;
 const step=Math.max(1,Number(t.sourceStep)||1);
 const usable=Math.floor(mr/step)*step;
 const target=Math.floor((usable/Number(t.sourceUnits))*Number(t.targetUnits));
 return {source:usable,target,eur:target/100,centsPerMr:(target/usable)};
}
function pointsSummary(){
 const rows=activeBalances();
 if(!rows.length)return '<span class="v24os-chip">Noch keine Punkte hinterlegt</span>';
 return rows.map(p=>`<span class="v24os-chip"><b>${esc(p.mono)}</b><span>${fmt(p.value)} ${esc(p.unit)}</span></span>`).join('');
}
function shell(body,back=false){
 return `<section class="v24os-screen" data-v24os="${esc(mode)}">
  <div class="v24os-head">
   ${back?'<button type="button" class="v24os-back" data-v24os-back>← Zurück</button>':''}
   <div class="v24os-eyebrow">VAYQUO PRIORISIERT FÜR DICH</div>
   <h1>Optimieren</h1>
   <p>Die Empfehlung steht zuerst. Details und Alternativen kommen erst danach.</p>
  </div>${body}</section>`;
}
function buildRecommendations(){
 const cards=[];
 if(active('mr')&&balance('mr')>0){
  cards.push({priority:10,tag:'VAYQUO EMPFEHLUNG',title:'Prämienflug über Airline-Partner zuerst prüfen',copy:`Mit ${fmt(balance('mr'))} Membership Rewards liegt hier dein größtes Potenzial. Noch nichts übertragen: VAYQUO prüft zuerst, ob ein konkreter Prämienflug wirklich mehr für dich herausholt.`,cta:'Passende Flüge prüfen',action:'flight'});
  cards.push({priority:30,tag:'EINFACH & FLEXIBEL',title:'Punkte direkt für Reisen nutzen',copy:'Bequem, aber nicht der erste Weg, solange eine höherwertige Nutzung noch nicht geprüft wurde.',cta:'Konkretes Angebot bewerten',action:'offer'});
  const pb=mrToPayback();
  if(pb)cards.push({priority:20,tag:'SICHERHEITSNETZ',title:'PAYBACK nur als Untergrenze behalten',copy:'Der PAYBACK-Weg bleibt als planbarer Basiswert im Hintergrund. Erst wenn kein besserer Einsatz überzeugt, wird er relevant.',cta:'Alternative dagegen prüfen',action:'offer'});
 }
 if(active('pb')&&balance('pb')>0){
  cards.push({priority:15,tag:'SICHERHEITSNETZ',title:'PAYBACK nicht vorschnell direkt einlösen',copy:'Der direkte Wert ist deine Untergrenze. VAYQUO prüft zuerst, ob ein konkreter Meilen- oder Reiseeinsatz nachvollziehbar mehr bringt.',cta:'Bessere Alternative prüfen',action:'offer'});
 }
 if(active('mm')&&balance('mm')>0){
  cards.push({priority:12,tag:'REISEPOTENZIAL',title:'Miles & More für Flug oder Upgrade prüfen',copy:'Der tatsächliche Gegenwert entsteht erst beim konkreten Angebot. VAYQUO vergleicht Meilenpreis, Zuzahlung und einen realistischen Barpreis.',cta:'Angebot bewerten',action:'offer'});
 }
 return cards.sort((a,b)=>a.priority-b.priority).slice(0,4).map((c,i)=>({...c,rank:String(i+1).padStart(2,'0')}));
}
function decisionProofHtml(){
 const items=[];
 if(active('mr')&&balance('mr')>0){
  items.push({label:'WARUM ZUERST',value:'Höchstes Potenzial prüfen',copy:'Ein passender Prämienflug kann deutlich mehr aus deinen Punkten machen als eine einfache Einlösung.'});
  items.push({label:'SICHERHEITSNETZ',value:'PAYBACK bleibt die Untergrenze',copy:'Den genauen Basiswert brauchst du erst, wenn keine bessere Nutzung überzeugt.'});
 }else if(active('pb')&&balance('pb')>0){
  items.push({label:'VAYQUO REGEL',value:'Basiswert nicht verschenken',copy:'Der direkte PAYBACK-Wert bleibt deine Untergrenze.'});
  items.push({label:'DESHALB',value:'Erst bessere Nutzung prüfen',copy:'Nur wechseln, wenn der konkrete Einsatz wirklich mehr bringt.'});
 }else if(active('mm')&&balance('mm')>0){
  items.push({label:'ENTSCHEIDEND',value:'Konkretes Angebot',copy:'Meilen haben ohne verfügbaren Flug und Zuzahlung keinen belastbaren Einzelwert.'});
  items.push({label:'VAYQUO PRÜFT',value:'Barpreis vs. Meilen',copy:'Damit siehst du, ob der Einsatz für dich wirklich sinnvoll ist.'});
 }
 return items.length?`<div class="v24os-proof-grid">${items.map(x=>`<div class="v24os-proof"><small>${esc(x.label)}</small><strong>${esc(x.value)}</strong><span>${esc(x.copy)}</span></div>`).join('')}</div>`:'';
}
function landingHtml(){
 const cards=buildRecommendations();
 if(!cards.length){
  return `<section class="v24os-screen v24os-landing" data-v24os="landing">
   <div class="v24os-summary">${pointsSummary()}</div>
   <div class="v24os-hero v24os-empty-decision">
    <div class="v24os-icon">↗</div>
    <div class="v24os-kicker">VAYQUO BRAUCHT DEINEN STAND</div>
    <h2>Hinterlege zuerst deine Punkte oder Meilen.</h2>
    <p>Danach zeigt VAYQUO nicht nur Möglichkeiten, sondern priorisiert direkt, womit du anfangen solltest.</p>
   </div>
   <button type="button" class="v24os-offer" data-v24os-offer><span><small>SCHON ETWAS GEFUNDEN?</small><strong>Konkretes Angebot bewerten</strong><em>Barpreis, Punkte oder Meilen und Zuzahlung eingeben.</em></span><b>→</b></button>
  </section>`;
 }
 const primary=cards[0];
 const alternatives=cards.slice(1,3);
 const isMr=active('mr')&&balance('mr')>0;
 const headline=isMr?`Deine ${fmt(balance('mr'))} Punkte können mehr.`:primary.title;
 const recommended=isMr?'Prämienflug über Airline-Partner zuerst prüfen':primary.title;
 const intro=isMr?'VAYQUO hat deine Wege bereits vorsortiert. Hier liegt aktuell die beste Chance, deutlich mehr aus deinem Punktestand herauszuholen.':primary.copy;
 const hold=isMr?'<div class="v24os-hold"><b>Noch nichts übertragen.</b><span>Erst prüfen, ob der bessere Weg für dich wirklich verfügbar ist.</span></div>':'';
 return `<section class="v24os-screen v24os-landing" data-v24os="landing">
  <div class="v24os-summary">${pointsSummary()}</div>
  <section class="v24os-decision">
   <div class="v24os-decision-top"><span>DEINE VAYQUO EMPFEHLUNG</span><b>JETZT</b></div>
   <h1>${esc(headline)}</h1>
   <div class="v24os-decision-reason"><small>DESHALB ZUERST</small><strong>${esc(recommended)}</strong></div>
   <p>${esc(intro)}</p>
   <button type="button" class="v24os-decision-action" data-v24os-action="${esc(primary.action)}">${esc(primary.cta)} <span>→</span></button>
   ${hold}
  </section>
  <section class="v24os-why">
   <div class="v24os-section"><small>WARUM VAYQUO DAS EMPFIEHLT</small><h2>Eine Empfehlung statt zehn Möglichkeiten.</h2><p>VAYQUO prüft zuerst den Weg mit dem größten sinnvollen Potenzial. Einfachere Einlösungen bleiben als Rückfalloption erhalten.</p></div>
   ${decisionProofHtml()}
  </section>
  ${alternatives.length?`<section class="v24os-alternatives"><div class="v24os-alt-head"><small>ERST DANACH</small><strong>Falls die Empfehlung nicht passt</strong></div>${alternatives.map(c=>`<div class="v24os-alt-row"><span><small>${esc(c.tag)}</small><b>${esc(c.title)}</b></span><em>${c.rank}</em></div>`).join('')}<button type="button" class="v24os-text-action" data-v24os-recommend>Alle eingeordneten Möglichkeiten ansehen →</button></section>`:''}
  <button type="button" class="v24os-offer v24os-offer-late" data-v24os-offer><span><small>SCHON ETWAS GEFUNDEN?</small><strong>Eigenes Angebot gegen VAYQUO prüfen</strong><em>Barpreis, Punkte oder Meilen und Zuzahlung eingeben.</em></span><b>→</b></button>
 </section>`;
}
function recommendHtml(){
 const cards=buildRecommendations();
 const body=`<div class="v24os-summary">${pointsSummary()}</div>
  <div class="v24os-section"><small>VAYQUO PRIORISIERUNG</small><h2>${cards.length?'So sind deine Möglichkeiten eingeordnet':'Noch fehlt dein Punktestand'}</h2><p>${cards.length?'Oben steht, was du zuerst prüfen solltest. Die weiteren Wege sind bewusst nachgeordnet.':'Hinterlege unter „Punkte“ deinen aktuellen Stand. Danach kann VAYQUO die Möglichkeiten für dich einordnen.'}</p></div>
  <div class="v24os-list">${cards.map(c=>`<article class="v24os-card"><div class="v24os-rank">${c.rank}</div><div><small>${esc(c.tag)}</small><h3>${esc(c.title)}</h3><p>${esc(c.copy)}</p><button type="button" data-v24os-action="${esc(c.action)}">${esc(c.cta)} <span>→</span></button></div></article>`).join('')}</div>
  ${cards.length?'<div class="v24os-note">VAYQUO-Regel: Potenzial allein reicht nicht. Erst konkrete Verfügbarkeit und Preis prüfen, dann übertragen oder einlösen.</div>':''}`;
 return shell(body,true);
}
function offerHtml(){
 const body=`<div class="v24os-section"><small>ANGEBOT BEWERTEN</small><h2>Lohnt sich dieses konkrete Angebot?</h2><p>Du brauchst nur die drei Zahlen, die du beim Anbieter siehst. Abflugort und Datum sind für diese Bewertung nicht nötig.</p></div>
  <div class="v24os-form">
   <label><span>Welche Punkte oder Meilen setzt du ein?</span><div class="v24os-control"><select id="v24os-currency"><option value="other">Airline-Meilen / anderes Programm</option>${active('mr')?'<option value="mr">Membership Rewards</option>':''}${active('pb')?'<option value="pb">PAYBACK Punkte</option>':''}${active('mm')?'<option value="mm">Miles & More Meilen</option>':''}</select></div></label>
   <label><span>Barpreis des vergleichbaren Angebots</span><div class="v24os-control"><input id="v24os-cash" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 980"><b>€</b></div></label>
   <label><span>Benötigte Punkte oder Meilen</span><div class="v24os-control"><input id="v24os-award" type="number" min="1" step="1" inputmode="numeric" placeholder="z. B. 55000"></div></label>
   <label><span>Zuzahlung</span><div class="v24os-control"><input id="v24os-fees" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 190"><b>€</b></div></label>
   <button type="button" class="v24os-primary" data-v24os-calc>Angebot bewerten <span>→</span></button>
  </div><div id="v24os-result"></div>`;
 return shell(body,true);
}
function renderOfferResult(){
 const cash=Number(q('#v24os-cash')?.value);
 const award=Number(q('#v24os-award')?.value);
 const fees=Number(q('#v24os-fees')?.value||0);
 const out=q('#v24os-result');
 if(!out)return;
 if(!Number.isFinite(cash)||cash<=0||!Number.isFinite(award)||award<=0||!Number.isFinite(fees)||fees<0){out.innerHTML='<div class="v24os-error">Bitte Barpreis, Punkte oder Meilen und Zuzahlung vollständig eintragen.</div>';return;}
 const saving=cash-fees;
 if(saving<=0){out.innerHTML='<div class="v24os-result"><small>ERGEBNIS</small><h3>Barzahlung ist hier günstiger.</h3><p>Die Zuzahlung ist bereits so hoch wie oder höher als der vergleichbare Barpreis.</p></div>';return;}
 const cpp=(saving/award)*100;
 const currency=String(q('#v24os-currency')?.value||'other');
 let verdict='Jetzt hast du einen sauberen Vergleichswert.';
 let note='Für eine endgültige Empfehlung muss dieser Wert mit deinen realen Alternativen in diesem Programm verglichen werden.';
 if(currency==='pb'){
  if(cpp>=1){verdict='Besser als der direkte PAYBACK-Basiswert.';note='PAYBACK lässt sich direkt mit 1 Cent pro Punkt nutzen. Dieses Angebot liegt rechnerisch darüber.';}
  else{verdict='Direktes PAYBACK-Einlösen ist wertvoller.';note='PAYBACK hat einen festen Direktwert von 1 Cent pro Punkt. Dieses Angebot liegt darunter.';}
 }
 if(currency==='mr'){
  const pb=mrToPayback();
  if(pb){const baseline=pb.centsPerMr; if(cpp>baseline){verdict='Besser als deine planbare PAYBACK-Alternative.';note=`Der über PAYBACK berechenbare Vergleichswert liegt bei rund ${baseline.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} Cent pro MR. Dieses Angebot liegt darüber.`;}else{verdict='Die planbare PAYBACK-Alternative ist rechnerisch stärker.';note=`Der über PAYBACK berechenbare Vergleichswert liegt bei rund ${baseline.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} Cent pro MR.`;}}
 }
 out.innerHTML=`<div class="v24os-result"><small>DEIN VERGLEICHSWERT</small><div class="v24os-result-number">${cpp.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} <span>Cent pro Punkt</span></div><h3>${esc(verdict)}</h3><p>Gegenüber dem Barpreis sparst du rechnerisch ${euro(saving)}. ${esc(note)}</p></div>`;
}
function callLegacy(view,arg){
 try{if(typeof go==='function'){go(view,arg);return true;}}catch{}
 try{if(typeof window.go==='function'){window.go(view,arg);return true;}}catch{}
 return false;
}
function openLegacyFlight(){
 legacyMode='flight';
 if(!callLegacy('check','flight')){legacyMode='';return;}
 setTimeout(decorateLegacy,30);
}
function decorateLegacy(){
 if(!legacyMode||activeKind()!=='optimize')return;
 const app=q('#app');if(!app)return;
 if(!q('#v24os-legacy-back',app)){
  const back=document.createElement('button');
  back.id='v24os-legacy-back';back.type='button';back.className='v24os-legacy-back';back.textContent='← Zurück zu Optimieren';
  back.onclick=()=>{legacyMode='';mode='recommend';renderOptimizer(true);};
  app.insertBefore(back,app.firstChild);
 }
 const h=qa('h1,h2',app).find(x=>/^Prüfen$/i.test((x.textContent||'').trim()));
 if(h)h.textContent='Flug optimieren';
}
function renderOptimizer(force=false){
 if(activeKind()!=='optimize')return;
 if(legacyMode){decorateLegacy();return;}
 const app=q('#app');if(!app)return;
 const current=q('#app [data-v24os]');
 if(!force&&current?.dataset?.v24os===mode)return;
 const html=mode==='recommend'?recommendHtml():mode==='offer'?offerHtml():landingHtml();
 app.innerHTML=html;
 q('[data-v24os-back]')?.addEventListener('click',()=>{mode='landing';renderOptimizer(true);});
 q('[data-v24os-recommend]')?.addEventListener('click',()=>{mode='recommend';renderOptimizer(true);});
 q('[data-v24os-offer]')?.addEventListener('click',()=>{mode='offer';renderOptimizer(true);});
 q('[data-v24os-calc]')?.addEventListener('click',renderOfferResult);
 qa('[data-v24os-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.v24osAction;
  if(action==='offer'){mode='offer';renderOptimizer(true);}
  if(action==='flight')openLegacyFlight();
 }));
}
function resetWhenLeaving(){
 if(activeKind()!=='optimize'){legacyMode='';mode='landing';}
}
function apply(){
 loadRules();
 patchNav();
 resetWhenLeaving();
 renderOptimizer();
}
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO safe optimizer',e);}});
}

document.addEventListener('click',ev=>{
 const nav=ev.target.closest?.('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav');
 if(nav){
  const kind=navKind(nav);
  legacyMode='';
  if(kind==='optimize')mode='landing';
  setTimeout(schedule,0);
 }
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();