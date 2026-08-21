(()=>{
'use strict';

const RULES_URL='config/vayquo-optimizer-rules.de.json?v=2507';
const q=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0);
const cents=n=>`${new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)} Cent`;

let rules=null;
let healthy=false;
let loading=null;

function safeState(){
 try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 return {};
}
function balances(){
 const b=safeState()?.balances||{};
 return {mr:Math.max(0,Number(b.mr)||0),pb:Math.max(0,Number(b.pb)||0),mm:Math.max(0,Number(b.mm)||0)};
}
function mrActive(){return !!safeState()?.programs?.mr;}
function programName(id){return rules?.programs?.[id]?.name||id;}
function isCoreTarget(v){return ['mr','pb','mm','other'].includes(v);}
function toEngineTarget(v){return v==='mr'?'mr_de':v==='pb'?'payback_de':v==='mm'?'miles_and_more':v;}

async function ensureReady(){
 if(healthy&&rules)return true;
 if(loading)return loading;
 loading=(async()=>{
  try{
   rules=await fetch(RULES_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('RULES');return r.json();});
   if(!window.VayquoEngine||!window.VayquoSelfTest)throw new Error('ENGINE');
   const test=window.VayquoSelfTest.run(rules);
   healthy=!!test?.ok;
   return healthy;
  }catch(e){healthy=false;return false;}
 })();
 return loading;
}

function ensureStyle(){
 if(q('#v25-classic-bridge-style'))return;
 const style=document.createElement('style');
 style.id='v25-classic-bridge-style';
 style.textContent=`
  .v25cb-extra{margin-top:9px;padding-top:9px;border-top:1px solid rgba(23,33,31,.08);display:grid;gap:6px}
  .v25cb-row{display:flex;justify-content:space-between;gap:12px;font-size:10.5px;line-height:1.4;color:#69736f}
  .v25cb-row b{color:#263633;text-align:right;font-weight:780}
  .v25cb-gold{margin-top:10px;padding:10px 11px;border-radius:13px;background:#f4eee2;border:1px solid rgba(166,132,77,.16);color:#5e513c;font-size:10.5px;line-height:1.45}
  .v25cb-target-existing{display:none}
  .v25cb-target-existing.is-visible{display:block}
  .v25cb-result-good{border-color:rgba(166,132,77,.2)!important;background:linear-gradient(180deg,#fffdf9,#f7f1e8)!important}
 `;
 document.head.appendChild(style);
}

function enhanceSelect(){
 const sel=q('#v24os-currency');if(!sel||!rules||sel.dataset.v25Bridge==='1')return;
 sel.dataset.v25Bridge='1';
 if(mrActive()){
  const targets=window.VayquoEngine.reachableMrTargets(rules);
  if(targets.length){
   const group=document.createElement('optgroup');group.label='Airline-Partner via Membership Rewards';
   targets.forEach(id=>{const opt=document.createElement('option');opt.value=id;opt.textContent=`${programName(id)} via MR`;group.appendChild(opt);});
   sel.appendChild(group);
  }
 }
 const form=sel.closest('.v24os-form');
 if(form&&!q('#v25cb-existing',form)){
  const label=document.createElement('label');
  label.className='v25cb-target-existing';
  label.id='v25cb-existing-wrap';
  label.innerHTML='<span>Bereits im Zielprogramm vorhanden</span><div class="v24os-control"><input id="v25cb-existing" type="number" min="0" step="1" inputmode="numeric" placeholder="0"></div>';
  const award=q('#v24os-award')?.closest('label');
  award?.insertAdjacentElement('afterend',label);
 }
 const sync=()=>q('#v25cb-existing-wrap')?.classList.toggle('is-visible',!isCoreTarget(sel.value));
 sel.addEventListener('change',sync);sync();
}

function metricValue(label,value){
 if(/eur/.test(label)||label==='Barpreis'||label==='Zuzahlung')return euro(value);
 if(/cents/.test(label))return cents(value);
 return fmt(value);
}
function detailLabel(k){return ({
 points:'Benötigte PAYBACK Punkte',safe_value_eur:'Sicherer Gegenwert',cash_saved_eur:'Bargeld gespart',mr:'Benötigte MR',award:'Prämienpreis',existing_mm:'M&M vorhanden',pb_needed:'PAYBACK zum Auffüllen',pb_safe_value_eur:'Sicherer PAYBACK-Wert',mm_leftover_after_booking:'Meilen danach übrig',target:'Zielprogramm',existing:'Dort schon vorhanden',mr_needed:'Benötigte MR',path:'Bester Transferweg',days:'Transferdauer',mr_safe_value_eur:'Sicherer MR-Unterwert',copay_eur:'Zuzahlung'
 }[k]||k);}
function detailValue(d){
 if(d.label==='target')return programName(d.value);
 if(d.label==='path')return String(d.value);
 if(d.label==='days')return d.value===null?'nicht sicher bekannt':Number(d.value)===0?'sofort':`bis zu ${fmt(d.value)} Werktage`;
 if(/eur/.test(d.label))return euro(d.value);
 return fmt(d.value);
}
function render(r){
 const out=q('#v24os-result');if(!out)return;
 const valueMetric=(r.metrics||[]).find(m=>m.label==='value_cents');
 const rows=[];
 (r.metrics||[]).filter(m=>m!==valueMetric).slice(0,3).forEach(m=>rows.push([m.label,metricValue(m.label,m.value)]));
 (r.details||[]).slice(0,6).forEach(d=>rows.push([detailLabel(d.label),detailValue(d)]));
 const resultClass=r.kind==='good'?' v25cb-result-good':'';
 out.innerHTML=`<div class="v24os-result${resultClass}" data-v24oc-done="1"><small>VAYQUO ERGEBNIS</small>${valueMetric?`<div class="v24os-result-number">${Number(valueMetric.value).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} <span>Cent pro Punkt/Meile</span></div>`:''}<h3>${esc(r.title)}</h3><p>${esc(r.copy)}</p>${rows.length?`<div class="v25cb-extra">${rows.map(([l,v])=>`<div class="v25cb-row"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}</div>`:''}${r.kind==='good'&&/AWARD|MR_|PB_|MM_/.test(r.code)?'<div class="v25cb-gold">Vor einem Transfer oder einer Buchung die Prämienverfügbarkeit beim Anbieter noch einmal prüfen.</div>':''}</div>`;
}
function renderUnavailable(){
 const out=q('#v24os-result');if(!out)return;
 out.innerHTML='<div class="v24os-result" data-v24oc-done="1"><small>VAYQUO</small><h3>Berechnung gerade nicht verfügbar.</h3><p>Der geprüfte Rechenkern oder die aktuellen Transferregeln konnten nicht geladen werden. VAYQUO gibt deshalb bewusst keine Ersatzschätzung aus.</p></div>';
}
async function calculate(ev){
 const btn=ev.target.closest?.('[data-v24os-calc]');if(!btn)return;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
 const ready=await ensureReady();
 if(!ready){renderUnavailable();return;}
 enhanceSelect();
 const currency=String(q('#v24os-currency')?.value||'other');
 const cash=Number(q('#v24os-cash')?.value),award=Number(q('#v24os-award')?.value),copay=Number(q('#v24os-fees')?.value||0),existing=Number(q('#v25cb-existing')?.value||0);
 if(currency==='other'){
  const out=q('#v24os-result');if(!out)return;
  if(!Number.isFinite(cash)||cash<=0||!Number.isFinite(award)||award<=0||!Number.isFinite(copay)||copay<0){out.innerHTML='<div class="v24os-error">Bitte Barpreis, Punkte oder Meilen und Zuzahlung vollständig eintragen.</div>';return;}
  const saving=cash-copay;
  if(saving<=0){render({kind:'bad',title:'Barzahlung ist hier günstiger.',copy:'Die Zuzahlung ist bereits so hoch wie oder höher als der vergleichbare Barpreis.',metrics:[],details:[],code:'GENERIC_CASH'});return;}
  const cpp=saving/award*100;
  render({kind:'warn',title:'Vergleichswert berechnet – aber noch keine Empfehlung.',copy:'Für ein nicht hinterlegtes Programm kennt VAYQUO weder deinen Bestand noch einen belastbaren Transfer- oder Alternativwert.',metrics:[{label:'value_cents',value:cpp},{label:'cash_saved_eur',value:saving}],details:[],code:'GENERIC_VALUE_ONLY'});return;
 }
 const result=window.VayquoEngine.evaluate({target:toEngineTarget(currency),cash,award,copay,existing,balances:balances(),comparable:true},rules);
 render(result);
}

function enhance(){
 if(!q('#v24os-currency'))return;
 ensureStyle();
 ensureReady().then(ok=>{if(ok)enhanceSelect();});
}

document.addEventListener('click',calculate,true);
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();