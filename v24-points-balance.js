(()=>{
'use strict';

const META_KEY='vayquo:balanceMeta';
const PROGRAMS={
 mr:{label:'Membership Rewards',unit:'Punkte',mono:'MR'},
 pb:{label:'PAYBACK',unit:'Punkte',mono:'PB'},
 mm:{label:'Miles & More',unit:'Meilen',mono:'M&M'}
};
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));

function readMeta(){
 try{const v=JSON.parse(localStorage.getItem(META_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}
}
function writeMeta(meta){try{localStorage.setItem(META_KEY,JSON.stringify(meta));}catch{}}
function programActive(id){try{return !!state?.programs?.[id];}catch{return false;}}
function balance(id){try{return Math.max(0,Math.round(Number(state?.balances?.[id])||0));}catch{return 0;}}
function known(id){
 const meta=readMeta();
 if(meta[id]?.known===true)return true;
 return balance(id)>0;
}
function pointsViewActive(){
 const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 if(active&&/punkte/i.test(active.textContent||''))return true;
 const h=qa('#app h1,#app h2,main h1,main h2').find(el=>/^punkte$/i.test((el.textContent||'').trim()));
 return !!h;
}
function activePrograms(){return Object.keys(PROGRAMS).filter(programActive);}
function updatedLabel(id){
 const ts=readMeta()[id]?.updatedAt;
 if(!ts)return known(id)?'In VAYQUO hinterlegt':'Noch nicht eingetragen';
 const d=new Date(ts);if(Number.isNaN(d.getTime()))return 'In VAYQUO hinterlegt';
 const today=new Date();
 const same=today.toDateString()===d.toDateString();
 return same?`Heute · ${d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:`${d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}`;
}
function cardHtml(id){
 const p=PROGRAMS[id],isKnown=known(id),value=balance(id);
 return `<div class="v24pb-card" data-v24pb-program="${id}">
  <div class="v24pb-row">
   <span class="v24pb-mono ${id==='mm'?'wide':''}">${esc(p.mono)}</span>
   <div class="v24pb-copy"><small>${esc(p.label)}</small><strong>${isKnown?`${fmt(value)} ${esc(p.unit)}`:'Noch kein Stand hinterlegt'}</strong><span>${esc(updatedLabel(id))}</span></div>
   <button type="button" class="v24pb-edit" data-v24pb-edit="${id}">${isKnown?'Aktualisieren':'Eintragen'}</button>
  </div>
 </div>`;
}
function panelHtml(){
 const ids=activePrograms();
 if(!ids.length)return `<section id="v24pb-panel" class="v24pb-panel"><div class="v24pb-head"><div><span>DEINE PUNKTESTÄNDE</span><h2>Noch kein Programm aktiv</h2><p>Aktiviere zuerst ein Programm. Danach kannst du seinen aktuellen Stand hier direkt pflegen.</p></div></div></section>`;
 return `<section id="v24pb-panel" class="v24pb-panel">
  <div class="v24pb-head"><div><span>DEINE PUNKTESTÄNDE</span><h2>Was VAYQUO gerade kennt</h2><p>Halte deine Stände hier aktuell. VAYQUO nutzt sie für Berechnungen, Transfers und Empfehlungen.</p></div><button type="button" class="v24pb-all" id="v24pb-all">Alle aktualisieren</button></div>
  <div class="v24pb-list">${ids.map(cardHtml).join('')}</div>
  <div class="v24pb-note">Noch keine automatische Kontosynchronisation. Ein manuell eingetragener Stand bleibt deshalb klar als VAYQUO-Stand erkennbar.</div>
 </section>`;
}
function mountPoint(){
 const heading=qa('#app h1,#app h2,main h1,main h2').find(el=>/^punkte$/i.test((el.textContent||'').trim()));
 if(!heading)return q('#app main,main,#app');
 return heading.closest('section,.page,.view,[class*="page"],[class*="view"]')||heading.parentElement||q('#app main,main,#app');
}
function renderPanel(){
 if(!pointsViewActive()){q('#v24pb-panel')?.remove();return;}
 const root=mountPoint();if(!root)return;
 const existing=q('#v24pb-panel');
 const wrapper=document.createElement('div');wrapper.innerHTML=panelHtml();const next=wrapper.firstElementChild;
 if(existing){if(existing.outerHTML===next.outerHTML)return;existing.replaceWith(next);}
 else{
  const heading=qa('h1,h2',root).find(el=>/^punkte$/i.test((el.textContent||'').trim()));
  const anchor=heading?.parentElement;
  if(anchor&&anchor!==root)anchor.insertAdjacentElement('afterend',next);else root.insertBefore(next,root.firstChild);
 }
 bindPanel();
}
function openEditor(id){
 const p=PROGRAMS[id];if(!p||typeof openModal!=='function')return;
 const isKnown=known(id),value=balance(id);
 openModal(`${p.label} aktualisieren`,`<div class="v24pb-modal">
  <div class="v24pb-modal-intro"><small>AKTUELLER STAND</small><strong>${isKnown?`${fmt(value)} ${esc(p.unit)}`:'Noch kein Stand hinterlegt'}</strong><p>Trage den Stand ein, den du aktuell in deinem ${esc(p.label)} Konto siehst.</p></div>
  <label class="field v24pb-field"><span>${esc(p.unit)}</span><input id="v24pb-input" type="number" min="0" step="1" inputmode="numeric" placeholder="z. B. ${id==='mr'?'100000':id==='pb'?'8430':'42000'}" value="${isKnown?value:''}"></label>
  <button class="btn" id="v24pb-save">Stand speichern</button>
 </div>`);
 const input=q('#v24pb-input');setTimeout(()=>input?.focus(),80);
 q('#v24pb-save')?.addEventListener('click',()=>{
  const raw=String(input?.value??'').trim();
  if(raw===''){typeof toast==='function'&&toast('Bitte einen Punktestand eintragen');return;}
  const n=Number(raw);
  if(!Number.isFinite(n)||n<0){typeof toast==='function'&&toast('Bitte einen gültigen Stand eintragen');return;}
  state.balances=state.balances||{};state.balances[id]=Math.round(n);
  const meta=readMeta();meta[id]={known:true,updatedAt:new Date().toISOString()};writeMeta(meta);
  typeof save==='function'&&save();
  typeof closeModal==='function'&&closeModal();
  typeof render==='function'&&render();
  typeof toast==='function'&&toast(`${p.label} Stand aktualisiert`);
  setTimeout(renderPanel,0);
 });
}
function openAll(){
 const ids=activePrograms();if(!ids.length||typeof openModal!=='function')return;
 const fields=ids.map(id=>{const p=PROGRAMS[id],isKnown=known(id);return `<label class="field v24pb-field"><span>${esc(p.label)} · ${esc(p.unit)}</span><input type="number" min="0" step="1" inputmode="numeric" data-v24pb-all-input="${id}" value="${isKnown?balance(id):''}" placeholder="Stand eintragen"></label>`;}).join('');
 openModal('Punktestände aktualisieren',`<div class="v24pb-modal"><div class="v24pb-modal-intro"><small>DEIN VAYQUO-STAND</small><strong>Alle aktiven Programme</strong><p>Leere Felder bleiben unverändert. Auch 0 kannst du bewusst als echten Stand speichern.</p></div>${fields}<button class="btn" id="v24pb-save-all">Stände speichern</button></div>`);
 q('#v24pb-save-all')?.addEventListener('click',()=>{
  const meta=readMeta();let changed=0;
  qa('[data-v24pb-all-input]').forEach(input=>{
   const raw=String(input.value??'').trim();if(raw==='')return;
   const n=Number(raw);if(!Number.isFinite(n)||n<0)return;
   const id=input.dataset.v24pbAllInput;state.balances=state.balances||{};state.balances[id]=Math.round(n);meta[id]={known:true,updatedAt:new Date().toISOString()};changed++;
  });
  if(!changed){typeof toast==='function'&&toast('Keine neuen Stände eingetragen');return;}
  writeMeta(meta);typeof save==='function'&&save();typeof closeModal==='function'&&closeModal();typeof render==='function'&&render();typeof toast==='function'&&toast('Punktestände aktualisiert');setTimeout(renderPanel,0);
 });
}
function bindPanel(){
 qa('[data-v24pb-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.v24pbEdit));
 q('#v24pb-all')?.addEventListener('click',openAll);
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{renderPanel();}catch(e){console.warn('VAYQUO point balances',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
})();
