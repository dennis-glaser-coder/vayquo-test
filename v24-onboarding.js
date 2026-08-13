(()=>{
'use strict';

const META_KEY='vayquo:balanceMeta';
const PROGRAMS={
  mr:{label:'Membership Rewards',short:'MR',unit:'Punkte',hint:'American Express'},
  pb:{label:'PAYBACK',short:'PB',unit:'Punkte',hint:'PAYBACK'},
  mm:{label:'Miles & More',short:'M&M',unit:'Meilen',hint:'Miles & More'}
};
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let step=1;
let selected=new Set();
let mounted=false;
let scheduled=false;

function appState(){
  try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
  try{if(window.state&&typeof window.state==='object')return window.state;}catch{}
  return null;
}
function readMeta(){
  try{const value=JSON.parse(localStorage.getItem(META_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}
}
function writeMeta(value){try{localStorage.setItem(META_KEY,JSON.stringify(value||{}));}catch{}}
function authVisible(){
  const root=q('#v24-auth');
  return !!(root&&!root.hidden);
}
function authPending(){return document.documentElement.classList.contains('vq-auth-pending');}
function hasExistingSetup(){
  const s=appState();if(!s)return true;
  if(s.onboardingComplete===true)return true;
  const meta=readMeta();
  if(Object.values(meta).some(x=>x?.known===true))return true;
  return Object.keys(PROGRAMS).some(id=>Math.max(0,Number(s?.balances?.[id])||0)>0);
}
function shouldOpen(){
  return !mounted&&!authVisible()&&!authPending()&&!hasExistingSetup();
}
function ensureStyle(){
  if(q('#v24ob-style'))return;
  const style=document.createElement('style');style.id='v24ob-style';
  style.textContent=`
  #v24-onboarding{position:fixed;inset:0;z-index:2147483500;overflow:auto;background:#121310;color:#171817;padding:max(18px,env(safe-area-inset-top)) 16px max(22px,env(safe-area-inset-bottom));box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
  #v24-onboarding *{box-sizing:border-box}
  .v24ob-shell{width:min(100%,430px);min-height:calc(100dvh - 40px);margin:0 auto;display:flex;align-items:center}
  .v24ob-card{width:100%;padding:25px 21px 22px;border-radius:30px;background:#f5f0e8;box-shadow:0 30px 80px rgba(0,0,0,.28)}
  .v24ob-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .v24ob-brand{font-size:12px;font-weight:900;letter-spacing:.22em;color:#171817}
  .v24ob-step{font-size:9px;font-weight:850;letter-spacing:.13em;color:#947b4d}
  .v24ob-card h1{margin:22px 0 8px;font-size:30px;line-height:1.04;letter-spacing:-.045em;color:#171817}
  .v24ob-lead{margin:0 0 20px;color:#68716e;font-size:13px;line-height:1.5}
  .v24ob-list{display:grid;gap:10px}
  .v24ob-program{width:100%;display:grid;grid-template-columns:46px 1fr 28px;align-items:center;gap:12px;padding:13px;border:1px solid rgba(23,24,23,.10);border-radius:17px;background:#fffdf9;color:#171817;text-align:left;font:inherit;cursor:pointer}
  .v24ob-program[aria-pressed="true"]{border-color:#1b1c1a;background:#fff}
  .v24ob-mono{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#ece7de;font-size:10px;font-weight:900;color:#313633}
  .v24ob-program[aria-pressed="true"] .v24ob-mono{background:#1a1b19;color:#ead5a9}
  .v24ob-copy strong{display:block;font-size:14px;line-height:1.2}
  .v24ob-copy span{display:block;margin-top:4px;color:#7b827f;font-size:11px}
  .v24ob-check{display:grid;place-items:center;width:25px;height:25px;border:1px solid #d2ccc1;border-radius:50%;color:transparent;font-size:12px;font-weight:900}
  .v24ob-program[aria-pressed="true"] .v24ob-check{border-color:#1a1b19;background:#1a1b19;color:#efdcae}
  .v24ob-primary{width:100%;min-height:52px;margin-top:18px;border:0;border-radius:16px;background:#171817;color:#fffaf2;font:850 14px inherit;cursor:pointer}
  .v24ob-primary[disabled]{opacity:.38;cursor:default}
  .v24ob-note{margin:11px 4px 0;text-align:center;color:#929895;font-size:10px;line-height:1.45}
  .v24ob-balance-list{display:grid;gap:11px}
  .v24ob-balance{padding:14px;border:1px solid rgba(23,24,23,.10);border-radius:18px;background:#fffdf9}
  .v24ob-balance-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
  .v24ob-balance-head span{font-size:12px;font-weight:800;color:#303432}
  .v24ob-balance-head small{font-size:9px;font-weight:850;letter-spacing:.10em;color:#987d4b}
  .v24ob-input{display:flex;align-items:center;border:1px solid #ded8cf;border-radius:14px;background:#f5f1ea;overflow:hidden}
  .v24ob-input input{width:100%;height:50px;border:0;outline:0;background:transparent;padding:0 13px;color:#171817;font:750 17px inherit}
  .v24ob-input b{padding-right:13px;color:#747c78;font-size:11px}
  .v24ob-error{display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#f5e6e1;color:#8a5147;font-size:11px;line-height:1.4}
  .v24ob-error.show{display:block}
  .v24ob-back{display:inline-flex;margin-top:12px;border:0;background:transparent;padding:5px 2px;color:#626b67;font:800 11px inherit;cursor:pointer}
  @media(max-width:360px){.v24ob-card{padding:22px 17px 19px}.v24ob-card h1{font-size:27px}}
  `;
  document.head.appendChild(style);
}
function rootHtml(){
  return `<div class="v24ob-shell"><section class="v24ob-card" aria-live="polite"></section></div>`;
}
function mount(){
  if(mounted||!shouldOpen())return;
  ensureStyle();
  const root=document.createElement('div');root.id='v24-onboarding';root.innerHTML=rootHtml();
  document.body.appendChild(root);
  mounted=true;
  render();
}
function programStep(){
  return `<div class="v24ob-top"><div class="v24ob-brand">VAYQUO</div><div class="v24ob-step">1 VON 2</div></div>
   <h1>Willkommen bei VAYQUO.</h1>
   <p class="v24ob-lead">In zwei Schritten zu deiner ersten Empfehlung. Welche Programme nutzt du?</p>
   <div class="v24ob-list">${Object.entries(PROGRAMS).map(([id,p])=>`
    <button type="button" class="v24ob-program" data-v24ob-program="${id}" aria-pressed="${selected.has(id)}">
      <span class="v24ob-mono">${esc(p.short)}</span>
      <span class="v24ob-copy"><strong>${esc(p.label)}</strong><span>${esc(p.hint)}</span></span>
      <span class="v24ob-check">✓</span>
    </button>`).join('')}</div>
   <button type="button" class="v24ob-primary" data-v24ob-next ${selected.size?'':'disabled'}>Weiter →</button>
   <p class="v24ob-note">Du kannst Programme und Stände später jederzeit ändern.</p>`;
}
function balanceStep(){
  return `<div class="v24ob-top"><div class="v24ob-brand">VAYQUO</div><div class="v24ob-step">2 VON 2</div></div>
   <h1>Wie viele Punkte oder Meilen hast du?</h1>
   <p class="v24ob-lead">Ein ungefährer Stand reicht für den Start. VAYQUO nutzt ihn für deine erste Empfehlung.</p>
   <div class="v24ob-balance-list">${Array.from(selected).map(id=>{const p=PROGRAMS[id];return `
    <label class="v24ob-balance">
      <span class="v24ob-balance-head"><span>${esc(p.label)}</span><small>${esc(p.unit.toUpperCase())}</small></span>
      <span class="v24ob-input"><input type="number" min="0" step="1" inputmode="numeric" data-v24ob-balance="${id}" placeholder="${id==='mr'?'100000':id==='pb'?'8500':'42000'}"><b>${esc(p.unit)}</b></span>
    </label>`;}).join('')}</div>
   <div class="v24ob-error" data-v24ob-error></div>
   <button type="button" class="v24ob-primary" data-v24ob-finish>Meine Empfehlung anzeigen →</button>
   <button type="button" class="v24ob-back" data-v24ob-back>← Programme ändern</button>`;
}
function render(){
  const card=q('#v24-onboarding .v24ob-card');if(!card)return;
  card.innerHTML=step===1?programStep():balanceStep();
  bind();
}
function bind(){
  qa('[data-v24ob-program]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.v24obProgram;
    selected.has(id)?selected.delete(id):selected.add(id);
    render();
  }));
  q('[data-v24ob-next]')?.addEventListener('click',()=>{if(selected.size){step=2;render();}});
  q('[data-v24ob-back]')?.addEventListener('click',()=>{step=1;render();});
  q('[data-v24ob-finish]')?.addEventListener('click',finish);
}
function showError(message){
  const el=q('[data-v24ob-error]');if(!el)return;
  el.textContent=message||'';el.classList.toggle('show',!!message);
}
function goOptimize(){
  const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>{
    const v=String(el.dataset?.view||'').toLowerCase();
    const t=(el.textContent||'').trim().toLowerCase();
    return v==='check'||/optimieren|prüfen/.test(t);
  });
  if(nav){nav.click();return;}
  try{if(typeof go==='function'){go('check');return;}}catch{}
  try{if(typeof window.go==='function')window.go('check');}catch{}
}
function finish(){
  const values={};
  let positive=false;
  for(const id of selected){
    const input=q(`[data-v24ob-balance="${id}"]`);
    const raw=String(input?.value??'').trim();
    if(raw===''){showError('Bitte trage für jedes ausgewählte Programm einen Stand ein.');input?.focus();return;}
    const value=Number(raw);
    if(!Number.isFinite(value)||value<0){showError('Bitte trage gültige Stände ein.');input?.focus();return;}
    values[id]=Math.round(value);
    if(value>0)positive=true;
  }
  if(!positive){showError('Für deine erste Empfehlung brauchen wir bei mindestens einem Programm einen Stand über 0.');return;}
  const s=appState();if(!s){showError('VAYQUO ist noch nicht bereit. Bitte versuche es noch einmal.');return;}
  s.programs=s.programs||{};
  s.balances=s.balances||{};
  Object.keys(PROGRAMS).forEach(id=>{s.programs[id]=selected.has(id);if(!selected.has(id))s.balances[id]=0;});
  const now=new Date().toISOString();
  const meta=readMeta();
  Object.entries(values).forEach(([id,value])=>{s.balances[id]=value;meta[id]={known:true,updatedAt:now};});
  s.onboardingComplete=true;
  writeMeta(meta);
  try{if(typeof save==='function')save();}catch{}
  try{if(typeof render==='function')render();}catch{}
  document.dispatchEvent(new Event('change',{bubbles:true}));
  q('#v24-onboarding')?.remove();
  mounted=false;
  setTimeout(goOptimize,120);
}
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;if(shouldOpen())mount();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0),true);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
setTimeout(schedule,250);
setTimeout(schedule,900);
})();
