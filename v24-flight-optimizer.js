(()=>{
'use strict';

const AWARD_ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-award-search';
const PUBLISHABLE_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const RULES_URL='config/vayquo-optimizer-rules.de.json?v=2401';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
const money=(n,c='EUR')=>{try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:c}).format(Number(n)||0);}catch{return `${Number(n||0).toFixed(2)} ${c}`;}};

let rulesPromise=null;
let requestSeq=0;
let lastDetail=null;

function loadRules(){
 if(!rulesPromise)rulesPromise=fetch(RULES_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('RULES_UNAVAILABLE');return r.json();});
 return rulesPromise;
}
function active(id){try{return !!state?.programs?.[id];}catch{return false;}}
function balance(id){try{return Math.max(0,Math.round(Number(state?.balances?.[id])||0));}catch{return 0;}}
function balanceMeta(){try{const x=JSON.parse(localStorage.getItem('vayquo:balanceMeta')||'{}');return x&&typeof x==='object'?x:{};}catch{return {};}}
function known(id){const meta=balanceMeta();return meta[id]?.known===true||balance(id)>0;}
function programSnapshot(){return {
 mr:{active:active('mr'),known:known('mr'),balance:balance('mr')},
 pb:{active:active('pb'),known:known('pb'),balance:balance('pb')},
 mm:{active:active('mm'),known:known('mm'),balance:balance('mm')}
};}
function programLabel(id,rules){return rules?.programs?.[id]?.name||id;}
function unitLabel(programId){
 if(programId==='miles_and_more')return 'Meilen';
 if(programId==='flying_blue')return 'Flying-Blue-Meilen';
 if(programId==='ba_club'||programId==='qatar_privilege'||programId==='iberia_club')return 'Avios';
 return 'Punkte';
}
function ensureStyle(){
 if(q('#vayquo-flight-optimizer-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-optimizer-style';
 style.textContent=`
 #vayquo-flight-optimizer{margin:14px 0 12px;border:1px solid rgba(120,126,124,.18);background:rgba(255,255,255,.6);border-radius:20px;padding:16px;box-sizing:border-box}
 .vqo-kicker{font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--muted,#879391)}
 .vqo-title{margin:5px 0 5px;font-size:19px;line-height:1.22;letter-spacing:-.02em}
 .vqo-copy{margin:0;font-size:12px;line-height:1.5;color:var(--muted,#879391)}
 .vqo-test{display:inline-flex;margin-top:10px;padding:5px 8px;border-radius:999px;background:rgba(184,106,99,.1);font-size:10px;font-weight:800;color:#9c625d}
 .vqo-balances{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
 .vqo-balance{padding:6px 8px;border-radius:999px;background:rgba(120,126,124,.08);font-size:10px;color:var(--muted,#667674)}
 .vqo-list{display:grid;gap:8px;margin-top:12px}
 .vqo-option{border:1px solid rgba(120,126,124,.14);border-radius:15px;padding:12px;background:rgba(255,255,255,.48)}
 .vqo-option-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
 .vqo-program{font-size:13px;font-weight:800;line-height:1.25}.vqo-award{font-size:13px;font-weight:800;text-align:right;white-space:nowrap}
 .vqo-path{margin-top:6px;font-size:11px;line-height:1.45;color:var(--muted,#74817f)}
 .vqo-state{display:inline-flex;margin-top:7px;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:750;background:rgba(120,126,124,.08);color:var(--muted,#667674)}
 .vqo-state.ok{background:rgba(70,120,90,.1);color:#52705e}.vqo-state.warn{background:rgba(190,145,70,.12);color:#8b6f3f}
 .vqo-foot{margin-top:12px;padding-top:11px;border-top:1px solid rgba(120,126,124,.12);font-size:10px;line-height:1.5;color:var(--muted,#879391)}
 `;
 document.head.appendChild(style);
}
function mountBox(){
 ensureStyle();
 let box=q('#vayquo-flight-optimizer');
 if(box)return box;
 box=document.createElement('section');
 box.id='vayquo-flight-optimizer';
 const results=q('#vayquo-flight-results');
 const status=q('#vayquo-flight-live-status');
 if(results?.parentElement)results.insertAdjacentElement('beforebegin',box);
 else if(status?.parentElement)status.insertAdjacentElement('beforebegin',box);
 else return null;
 return box;
}
function syncVisibility(){
 const box=q('#vayquo-flight-optimizer');if(!box)return;
 box.hidden=q('#vayquo-flight-search-controls')?.hidden===true;
}
function renderLoading(){
 const box=mountBox();if(!box)return;
 box.innerHTML='<div class="vqo-kicker">VAYQUO TEST-OPTIMIZER</div><h3 class="vqo-title">Punktewege werden geprüft …</h3><p class="vqo-copy">Cash- und Awarddaten werden zusammengeführt.</p>';
 syncVisibility();
}
function renderError(message='Die Punktewege konnten gerade nicht geladen werden.'){
 const box=mountBox();if(!box)return;
 box.innerHTML=`<div class="vqo-kicker">VAYQUO TEST-OPTIMIZER</div><h3 class="vqo-title">Noch kein Punktevergleich</h3><p class="vqo-copy">${esc(message)}</p>`;
 syncVisibility();
}

function activeEdges(rules){
 const direct=(rules?.directTransfers||[]).filter(e=>e.status==='active').map(e=>({...e,kind:'direct'}));
 const inter=(rules?.interProgramTransfers||[]).filter(e=>e.status==='active').map(e=>({...e,kind:'inter'}));
 return [...direct,...inter];
}
function explicitPolicy(path,rules){
 return (rules?.pathPolicies||[]).find(p=>JSON.stringify(p.path)===JSON.stringify(path))||null;
}
function pathAllowed(path,rules){
 const policy=explicitPolicy(path,rules);
 if(policy&&policy.status!=='allowed')return false;
 if(path.includes('payback_de')&&path.includes('miles_and_more')&&path[0]==='mr_de')return false;
 return true;
}
function findPaths(source,target,rules,maxEdges=2){
 const edges=activeEdges(rules),out=[];
 function walk(node,path,pathEdges){
  if(pathEdges.length>maxEdges)return;
  if(node===target&&pathEdges.length){if(pathAllowed(path,rules))out.push({path:[...path],edges:[...pathEdges]});return;}
  for(const edge of edges){
   if(edge.from!==node||path.includes(edge.to))continue;
   walk(edge.to,[...path,edge.to],[...pathEdges,edge]);
  }
 }
 walk(source,[source],[]);
 return out;
}
function roundUp(value,step=1){const s=Math.max(1,Math.trunc(Number(step)||1));return Math.ceil(value/s)*s;}
function sourceNeededForPath(targetNeeded,pathObj){
 let needed=Math.max(0,Math.ceil(Number(targetNeeded)||0));
 for(let i=pathObj.edges.length-1;i>=0;i--){
  const e=pathObj.edges[i];
  const sourceUnits=Number(e.sourceUnits)||1,targetUnits=Number(e.targetUnits)||1;
  needed=Math.ceil(needed*sourceUnits/targetUnits);
  needed=roundUp(needed,e.sourceStep||1);
  if(e.minimumSource)needed=Math.max(needed,Number(e.minimumSource)||0);
 }
 return Math.ceil(needed);
}
function bestMrPath(target,amount,rules){
 const candidates=findPaths('mr_de',target,rules,2).map(p=>({...p,sourceNeeded:sourceNeededForPath(amount,p)})).sort((a,b)=>a.sourceNeeded-b.sourceNeeded||a.edges.length-b.edges.length);
 return {best:candidates[0]||null,alternatives:candidates.slice(1)};
}
function formatPath(path,rules){return path.map(id=>id==='mr_de'?'MR':id==='payback_de'?'PAYBACK':id==='miles_and_more'?'Miles & More':programLabel(id,rules)).join(' → ');}
function statusInfo(type,missing=0,unit='Punkte'){
 if(type==='ok')return {cls:'ok',text:'Mit deinem Stand möglich'};
 if(type==='unknown')return {cls:'warn',text:'Punktestand fehlt'};
 if(type==='inactive')return {cls:'warn',text:'Programm nicht aktiv'};
 if(type==='unsupported')return {cls:'warn',text:'Kein freigegebener Weg'};
 return {cls:'warn',text:`Noch ${fmt(missing)} ${unit} nötig`};
}
function evaluateOffer(offer,rules,snap){
 const target=offer?.program?.id;
 const amount=Math.max(0,Math.round(Number(offer?.award?.amount)||0));
 const copay=offer?.award?.cashCopay||{amount:0,currency:'EUR'};
 const base={target,amount,copay,program:offer?.program?.name||programLabel(target,rules),testData:true};

 if(target==='miles_and_more'){
  if(!snap.mm.active)return {...base,status:statusInfo('inactive'),path:'Miles & More',detail:'Miles & More ist in VAYQUO nicht aktiv.'};
  if(!snap.mm.known)return {...base,status:statusInfo('unknown'),path:'Miles & More',detail:'Für den Fehlbetrag braucht VAYQUO zuerst deinen aktuellen Miles-&-More-Stand.'};
  const useMm=Math.min(snap.mm.balance,amount),shortfall=Math.max(0,amount-useMm);
  if(shortfall===0)return {...base,status:statusInfo('ok'),path:`${fmt(amount)} Miles-&-More-Meilen`,detail:'Komplett aus deinem hinterlegten Miles-&-More-Stand.'};
  const edge=(rules?.interProgramTransfers||[]).find(e=>e.from==='payback_de'&&e.to==='miles_and_more'&&e.status==='active');
  if(!edge||!snap.pb.active)return {...base,status:statusInfo('insufficient',shortfall,'Meilen'),path:`${fmt(useMm)} vorhandene Meilen`,detail:'MR → PAYBACK → Miles & More bleibt gesperrt, solange dieser Kettenweg nicht offiziell bestätigt ist.'};
  if(!snap.pb.known)return {...base,status:statusInfo('unknown'),path:`${fmt(useMm)} M&M + PAYBACK`,detail:'PAYBACK kann 1:1 auffüllen, aber dein PAYBACK-Stand ist noch nicht hinterlegt.'};
  const pbNeeded=Math.max(Number(edge.minimumSource)||0,sourceNeededForPath(shortfall,{edges:[edge]}));
  if(snap.pb.balance>=pbNeeded)return {...base,status:statusInfo('ok'),path:`${fmt(useMm)} M&M + ${fmt(pbNeeded)} PAYBACK`,detail:`PAYBACK füllt den Fehlbetrag 1:1 auf. ${fmt(pbNeeded)} PAYBACK-Punkte haben zugleich mindestens ${money(pbNeeded/100)} sicheren Alternativwert.`};
  return {...base,status:statusInfo('insufficient',pbNeeded-snap.pb.balance,'PAYBACK-Punkte'),path:`${fmt(useMm)} M&M + PAYBACK`,detail:`Benötigt würden ${fmt(pbNeeded)} PAYBACK-Punkte für den Fehlbetrag.`};
 }

 const mr=bestMrPath(target,amount,rules);
 if(!mr.best)return {...base,status:statusInfo('unsupported'),path:base.program,detail:'Für dieses Testprogramm ist aktuell kein freigegebener VAYQUO-Transferweg hinterlegt.'};
 const required=mr.best.sourceNeeded;
 const direct=mr.alternatives.find(x=>x.edges.length===1);
 const saving=direct&&direct.sourceNeeded>required?direct.sourceNeeded-required:0;
 if(!snap.mr.active)return {...base,status:statusInfo('inactive'),path:formatPath(mr.best.path,rules),detail:'Membership Rewards ist in VAYQUO nicht aktiv.'};
 if(!snap.mr.known)return {...base,status:statusInfo('unknown'),path:formatPath(mr.best.path,rules),detail:`Für diesen Weg wären im Test ${fmt(required)} MR nötig. Dein MR-Stand ist noch nicht hinterlegt.`};
 const detail=saving?`VAYQUO erkennt den günstigeren Transferweg: ${fmt(saving)} MR weniger als über den direkten Transfer.`:`Benötigt im Test: ${fmt(required)} Membership-Rewards-Punkte. Zielkonto muss vorhanden und mit Amex verknüpft sein.`;
 if(snap.mr.balance>=required)return {...base,status:statusInfo('ok'),path:`${fmt(required)} MR · ${formatPath(mr.best.path,rules)}`,detail};
 return {...base,status:statusInfo('insufficient',required-snap.mr.balance,'MR'),path:`${fmt(required)} MR · ${formatPath(mr.best.path,rules)}`,detail};
}
function balanceHtml(snap){
 const chips=[];
 if(snap.mr.active)chips.push(`<span class="vqo-balance">MR: ${snap.mr.known?fmt(snap.mr.balance):'nicht hinterlegt'}</span>`);
 if(snap.pb.active)chips.push(`<span class="vqo-balance">PAYBACK: ${snap.pb.known?fmt(snap.pb.balance):'nicht hinterlegt'}</span>`);
 if(snap.mm.active)chips.push(`<span class="vqo-balance">M&M: ${snap.mm.known?fmt(snap.mm.balance):'nicht hinterlegt'}</span>`);
 return chips.join('');
}
function optionHtml(x){
 const state=x.status||statusInfo('unsupported');
 return `<div class="vqo-option"><div class="vqo-option-top"><div class="vqo-program">${esc(x.program)}</div><div class="vqo-award">${fmt(x.amount)} ${esc(unitLabel(x.target))}<br><span style="font-size:10px;font-weight:650;color:var(--muted,#879391)">+ ${esc(money(x.copay?.amount,x.copay?.currency||'EUR'))}</span></div></div><div class="vqo-path">${esc(x.path)}<br>${esc(x.detail)}</div><span class="vqo-state ${esc(state.cls)}">${esc(state.text)}</span></div>`;
}
async function optimize(detail){
 const seq=++requestSeq;lastDetail=detail;
 renderLoading();
 try{
  const [rules,res]=await Promise.all([
   loadRules(),
   fetch(AWARD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE_KEY},body:JSON.stringify(detail.query),cache:'no-store'})
  ]);
  let payload=null;try{payload=await res.json();}catch{}
  if(seq!==requestSeq)return;
  if(!res.ok||!payload?.ok||payload?.testData!==true)throw new Error('AWARD_TEST_UNAVAILABLE');
  const snap=programSnapshot();
  const evaluated=(payload.offers||[]).map(o=>evaluateOffer(o,rules,snap));
  const cashOffers=Array.isArray(detail.offers)?detail.offers:[];
  const cashValues=cashOffers.map(o=>Number(o?.price?.total)).filter(Number.isFinite);
  const cashPrice=cashValues.length?Math.min(...cashValues):null;
  const pax=detail.query||{};
  const family=(Number(pax.children)||0)+(Number(pax.infants)||0)>0;
  const box=mountBox();if(!box)return;
  box.innerHTML=`<div class="vqo-kicker">VAYQUO TEST-OPTIMIZER</div><h3 class="vqo-title">Barpreis und deine Punktewege – zusammen gedacht</h3><p class="vqo-copy">${cashPrice!==null?`Cash-Testpreis ab ${esc(money(cashPrice,'EUR'))}. `:''}Die Awardwerte darunter sind künstliche Testdaten. Deshalb gibt VAYQUO hier bewusst noch keinen echten Sieger aus.</p><span class="vqo-test">TESTDATEN · NICHT BUCHBAR</span><div class="vqo-balances">${balanceHtml(snap)||'<span class="vqo-balance">Keine Punktestände aktiv</span>'}</div><div class="vqo-list">${evaluated.map(optionHtml).join('')}</div><div class="vqo-foot">${family?'Kinder/Babys erkannt: Die künstlichen Awarddaten enthalten keine belastbare altersabhängige Preislogik. Familienrabatte werden deshalb noch nicht als echte Ersparnis angewendet.<br>':''}Award-Testangebote sind Alternativen und werden nicht als derselbe Flug wie ein Cash-Angebot ausgegeben. Eine echte „Beste Nutzung“-Empfehlung wird erst freigeschaltet, wenn Live-Awardverfügbarkeit und vergleichbare Cashdaten vorliegen.</div>`;
  syncVisibility();
  window.VAYQUO_FLIGHT_OPTIMIZER={mode:'test',query:detail.query,cashOffers,awardOffers:payload.offers||[],evaluated};
  try{window.dispatchEvent(new CustomEvent('vayquo:flight-optimizer',{detail:window.VAYQUO_FLIGHT_OPTIMIZER}));}catch{}
 }catch{
  if(seq===requestSeq)renderError();
 }
}

window.addEventListener('vayquo:flight-live',ev=>{
 const detail=ev.detail||{};
 if(detail.status==='loading'){requestSeq++;q('#vayquo-flight-optimizer')?.remove();return;}
 if(detail.status==='success'&&detail.query)void optimize(detail);
});
window.addEventListener('vayquo:flight-selected',()=>{if(lastDetail)syncVisibility();});
document.addEventListener('click',ev=>{if(ev.target.closest?.('#vayquo-manual-flight-toggle'))setTimeout(syncVisibility,0);});
new MutationObserver(syncVisibility).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
})();
