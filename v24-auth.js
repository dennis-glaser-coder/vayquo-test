(()=>{
'use strict';

const SUPABASE_URL='https://fcvffslhnaqlwitaeers.supabase.co';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const SESSION_KEY='vayquo:authSession';
const LAST_USER_KEY='vayquo:lastUserId';
const BALANCE_META_KEY='vayquo:balanceMeta';
const REMOTE_SCHEMA_VERSION=2;
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clone=v=>JSON.parse(JSON.stringify(v));

let session=null;
let user=null;
let syncTimer=null;
let lastSynced='';
let mode='login';
let gateContext=null;
let lastOfferDecisionNode=null;

function headers(auth=false,extra={}){
 const h={'apikey':API_KEY,'Content-Type':'application/json',...extra};
 if(auth&&session?.access_token)h.Authorization=`Bearer ${session.access_token}`;
 return h;
}
function readSession(){
 try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}
}
function writeSession(value){
 session=value||null;
 try{value?localStorage.setItem(SESSION_KEY,JSON.stringify(value)):localStorage.removeItem(SESSION_KEY);}catch{}
}
function readBalanceMeta(){
 try{const value=JSON.parse(localStorage.getItem(BALANCE_META_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}
}
function writeBalanceMeta(value){
 try{localStorage.setItem(BALANCE_META_KEY,JSON.stringify(value&&typeof value==='object'?value:{}));}catch{}
}
function withExpiry(payload){
 if(!payload?.access_token)return null;
 return {...payload,expires_at:Date.now()+Math.max(60,Number(payload.expires_in)||3600)*1000};
}
async function jsonFetch(url,options={}){
 const res=await fetch(url,{cache:'no-store',...options});
 let body=null;try{body=await res.json();}catch{}
 if(!res.ok){const msg=body?.msg||body?.message||body?.error_description||body?.error||`HTTP ${res.status}`;throw new Error(String(msg));}
 return body;
}
async function refreshSession(){
 if(!session?.refresh_token)throw new Error('SESSION_EXPIRED');
 const payload=await jsonFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
  method:'POST',headers:headers(false),body:JSON.stringify({refresh_token:session.refresh_token})
 });
 const next=withExpiry(payload);writeSession(next);return next;
}
async function ensureSession(){
 session=readSession();
 if(!session?.access_token)return null;
 if(!session.expires_at||session.expires_at-Date.now()<60000){try{await refreshSession();}catch{writeSession(null);return null;}}
 try{
  user=await jsonFetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(true)});
  return session;
 }catch{
  try{await refreshSession();user=await jsonFetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(true)});return session;}catch{writeSession(null);user=null;return null;}
 }
}
function snapshot(){
 try{return (typeof state!=='undefined'&&state&&typeof state==='object')?clone(state):null;}catch{return null;}
}
function remoteSnapshot(){
 const appState=snapshot();
 if(!appState)return null;
 return {schema_version:REMOTE_SCHEMA_VERSION,state:appState,balance_meta:clone(readBalanceMeta())};
}
function decodeRemoteSnapshot(value){
 if(value&&typeof value==='object'&&Number(value.schema_version)>=2&&value.state&&typeof value.state==='object'){
  return {state:value.state,balanceMeta:value.balance_meta&&typeof value.balance_meta==='object'?value.balance_meta:{},legacy:false};
 }
 return {state:value&&typeof value==='object'?value:null,balanceMeta:null,legacy:true};
}
function replaceState(next){
 if(!next||typeof next!=='object')return;
 try{
  Object.keys(state).forEach(k=>delete state[k]);
  Object.assign(state,clone(next));
  if(typeof save==='function')save();
  if(typeof render==='function')render();
 }catch(e){console.warn('VAYQUO auth state load',e);}
}
function neutralState(){
 return {programs:{mr:false,pb:false,mm:false},balances:{mr:0,pb:0,mm:0},card:'none',mmStatus:'none',benefits:{}};
}
async function fetchRemoteState(){
 if(!user?.id)return null;
 const url=`${SUPABASE_URL}/rest/v1/vayquo_user_state?user_id=eq.${encodeURIComponent(user.id)}&select=app_state,updated_at&limit=1`;
 const rows=await jsonFetch(url,{headers:{'apikey':API_KEY,'Authorization':`Bearer ${session.access_token}`}});
 return Array.isArray(rows)&&rows[0]?rows[0]:null;
}
async function pushRemoteState(force=false){
 if(!user?.id||!session?.access_token)return;
 const snap=remoteSnapshot();if(!snap)return;
 const signature=JSON.stringify(snap);if(!force&&signature===lastSynced)return;
 try{
  await ensureSession();if(!user?.id)return;
  await jsonFetch(`${SUPABASE_URL}/rest/v1/vayquo_user_state?on_conflict=user_id`,{
   method:'POST',
   headers:{'apikey':API_KEY,'Authorization':`Bearer ${session.access_token}`,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},
   body:JSON.stringify([{user_id:user.id,app_state:snap}])
  });
  lastSynced=signature;
 }catch(e){console.warn('VAYQUO account sync',e);}
}
function syncSoon(){
 if(!user?.id)return;
 clearTimeout(syncTimer);syncTimer=setTimeout(()=>void pushRemoteState(false),900);
}
async function hydrateUser(){
 const remote=await fetchRemoteState();
 const rawRemote=remote?.app_state&&typeof remote.app_state==='object'?remote.app_state:null;
 const decoded=decodeRemoteSnapshot(rawRemote);
 const hasRemote=decoded.state&&Object.keys(decoded.state).length>0;
 const previous=localStorage.getItem(LAST_USER_KEY)||'';
 const switching=!!previous&&previous!==user.id;
 if(switching)writeBalanceMeta({});
 if(hasRemote){
  replaceState(decoded.state);
  if(decoded.legacy){
   if(previous!==user.id)writeBalanceMeta({});
   await pushRemoteState(true);
  }else{
   writeBalanceMeta(decoded.balanceMeta);
   lastSynced=JSON.stringify(remoteSnapshot()||{});
  }
 }else{
  if(switching){replaceState(neutralState());writeBalanceMeta({});}
  await pushRemoteState(true);
 }
 localStorage.setItem(LAST_USER_KEY,user.id);
}
function friendlyError(message){
 const m=String(message||'');
 if(/invalid login credentials/i.test(m))return 'E-Mail oder Passwort stimmt nicht.';
 if(/email not confirmed/i.test(m))return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
 if(/user already registered/i.test(m))return 'Für diese E-Mail gibt es bereits ein Konto.';
 if(/password/i.test(m)&&/characters|length|short/i.test(m))return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
 if(/rate limit/i.test(m))return 'Zu viele Versuche. Bitte kurz warten und erneut versuchen.';
 return 'Das hat gerade nicht funktioniert. Bitte versuche es erneut.';
}
function ensureStyle(){
 if(q('#v24-auth-style'))return;
 const style=document.createElement('style');style.id='v24-auth-style';
 style.textContent=`
 html.vq-auth-pending #app,html.vq-auth-pending .bottom{visibility:hidden!important}
 #v24-auth{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 0,#232522 0,#171918 46%,#0e100f 100%);box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
 #v24-auth[hidden]{display:none!important}.v24a-card{width:min(100%,430px);background:#f7f3ec;color:#172c2a;border-radius:30px;padding:28px 24px 22px;box-shadow:0 30px 80px rgba(0,0,0,.3);box-sizing:border-box}.v24a-brand{font-size:13px;font-weight:900;letter-spacing:.22em;color:#8f7348}.v24a-card h1{margin:18px 0 7px;font-size:31px;line-height:1.05;letter-spacing:-.045em}.v24a-sub{margin:0 0 22px;color:#77827f;font-size:14px;line-height:1.45}.v24a-tabs{display:grid;grid-template-columns:1fr 1fr;background:#ebe7df;border-radius:14px;padding:4px;margin-bottom:18px}.v24a-tab{height:40px;border:0;border-radius:11px;background:transparent;color:#75807d;font:750 13px inherit}.v24a-tab.active{background:#fff;color:#17312e;box-shadow:0 2px 8px rgba(0,0,0,.05)}.v24a-field{display:block;margin-top:12px}.v24a-field span{display:block;margin:0 0 6px 2px;font-size:11px;font-weight:800;color:#566662}.v24a-field input{width:100%;height:52px;border:1px solid #dcd8cf;border-radius:15px;background:#fffdf9;color:#172c2a;padding:0 14px;box-sizing:border-box;font:600 16px inherit;outline:none}.v24a-field input:focus{border-color:#343a38;box-shadow:0 0 0 3px rgba(52,58,56,.09)}.v24a-primary{width:100%;height:52px;margin-top:18px;border:0;border-radius:15px;background:#171918;color:#fff;font:800 15px inherit}.v24a-note{margin:12px 2px 0;color:#8b9491;font-size:11px;line-height:1.45;text-align:center}.v24a-msg{display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#eee9df;color:#635d52;font-size:12px;line-height:1.4}.v24a-msg.show{display:block}.v24a-msg.error{background:#f4e5e2;color:#925950}.v24a-primary[disabled]{opacity:.55}
 .v24a-account-row{width:100%;margin-top:12px;padding:12px 14px;border:1px solid rgba(120,126,124,.18);border-radius:15px;background:rgba(255,255,255,.55);box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:10px;color:inherit;font:inherit}.v24a-account-row strong{display:block;font-size:12px}.v24a-account-row span{display:block;margin-top:2px;color:#7f8b88;font-size:10px}.v24a-account-row button{border:0;background:transparent;color:#795f35;font-weight:800;font-size:11px}
 `;
 document.head.appendChild(style);
}
function defaultGateContext(){return {mode:'login',title:'Dein VAYQUO-Konto.',copy:'Melde dich an, um deine gespeicherten Entscheidungen und Stände auf mehreren Geräten zu nutzen.'};}
function applyGateContext(root){
 const ctx=gateContext||defaultGateContext();
 const h1=q('.v24a-card h1',root),sub=q('.v24a-sub',root);
 if(h1)h1.textContent=ctx.title;
 if(sub)sub.textContent=ctx.copy;
}
function mount(){
 ensureStyle();let root=q('#v24-auth');if(root)return root;
 root=document.createElement('div');root.id='v24-auth';root.hidden=true;
 root.innerHTML=`<section class="v24a-card"><div class="v24a-brand">VAYQUO</div><h1>Dein VAYQUO-Konto.</h1><p class="v24a-sub">Melde dich an, um deine gespeicherten Entscheidungen und Stände auf mehreren Geräten zu nutzen.</p><div class="v24a-tabs"><button class="v24a-tab active" type="button" data-v24a-mode="login">Anmelden</button><button class="v24a-tab" type="button" data-v24a-mode="register">Registrieren</button></div><form id="v24a-form"><label class="v24a-field"><span>E-Mail</span><input id="v24a-email" type="email" autocomplete="email" inputmode="email" required></label><label class="v24a-field"><span>Passwort</span><input id="v24a-password" type="password" autocomplete="current-password" minlength="8" required></label><div class="v24a-msg" id="v24a-msg" role="status"></div><button class="v24a-primary" id="v24a-submit" type="submit">Anmelden</button><p class="v24a-note">Deine VAYQUO-Daten werden deinem Konto zugeordnet und nicht zwischen Nutzern geteilt.</p></form></section>`;
 document.body.appendChild(root);
 qa('[data-v24a-mode]',root).forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.v24aMode)));
 q('#v24a-form',root).addEventListener('submit',submitAuth);
 return root;
}
function setMode(next){
 mode=next==='register'?'register':'login';const root=mount();
 qa('[data-v24a-mode]',root).forEach(b=>b.classList.toggle('active',b.dataset.v24aMode===mode));
 const pass=q('#v24a-password',root);if(pass)pass.autocomplete=mode==='register'?'new-password':'current-password';
 q('#v24a-submit',root).textContent=mode==='register'?'Konto erstellen':'Anmelden';
 showMessage('');
}
function showMessage(message,error=false){
 const el=q('#v24a-msg',mount());el.textContent=message||'';el.className=`v24a-msg${message?' show':''}${error?' error':''}`;
}
function setBusy(busy){const btn=q('#v24a-submit',mount());btn.disabled=busy;btn.textContent=busy?'Bitte warten …':(mode==='register'?'Konto erstellen':'Anmelden');}
async function submitAuth(ev){
 ev.preventDefault();const root=mount();const email=String(q('#v24a-email',root).value||'').trim().toLowerCase();const password=String(q('#v24a-password',root).value||'');
 if(!email||password.length<8){showMessage('Bitte gültige E-Mail und mindestens 8 Zeichen Passwort eingeben.',true);return;}
 setBusy(true);showMessage('');
 try{
  if(mode==='register'){
   const redirect=`${location.origin}${location.pathname}`;
   const payload=await jsonFetch(`${SUPABASE_URL}/auth/v1/signup?redirect_to=${encodeURIComponent(redirect)}`,{method:'POST',headers:headers(false),body:JSON.stringify({email,password})});
   if(payload?.access_token){writeSession(withExpiry(payload));await startAuthenticated();return;}
   showMessage('Konto erstellt. Bitte bestätige jetzt deine E-Mail und melde dich danach an.');setMode('login');q('#v24a-email',root).value=email;
  }else{
   const payload=await jsonFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:headers(false),body:JSON.stringify({email,password})});
   writeSession(withExpiry(payload));await startAuthenticated();
  }
 }catch(e){showMessage(friendlyError(e.message),true);}finally{setBusy(false);}
}
function hideGate(){
 q('#v24-auth')?.setAttribute('hidden','');document.documentElement.classList.remove('vq-auth-pending');gateContext=null;
}
function showGate(context={}){
 gateContext={...defaultGateContext(),...context};
 document.documentElement.classList.remove('vq-auth-pending');
 const root=mount();applyGateContext(root);root.removeAttribute('hidden');setMode(gateContext.mode||'login');
}
function decisionGate(kind='decision'){
 if(user)return;
 const title=kind==='card'?'Deine Karten-Empfehlung ist fertig.':'Deine VAYQUO-Empfehlung ist fertig.';
 showGate({
  mode:'register',
  title,
  copy:'Erstelle kostenlos ein Konto oder melde dich an. Danach öffnet sich genau deine fertige Empfehlung – und du kannst sie später wiederfinden.'
 });
}
async function startAuthenticated(){
 await ensureSession();if(!session||!user){showGate(gateContext||defaultGateContext());return;}
 try{await hydrateUser();}catch(e){console.warn('VAYQUO account load',e);}
 hideGate();patchSettings();
}
async function logout(){
 try{await pushRemoteState(true);}catch{}
 try{if(session?.access_token)await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:headers(true)});}catch{}
 writeSession(null);session=null;user=null;lastSynced='';
 try{localStorage.removeItem(LAST_USER_KEY);}catch{}
 writeBalanceMeta({});
 replaceState(neutralState());
 hideGate();patchSettings();
}
function patchSettings(){
 const leaves=qa('*').filter(el=>el.children.length===0);
 const note=leaves.find(el=>/VAYQUO\s+V2\.3\s+Test/i.test(el.textContent||''));
 if(note)note.textContent='VAYQUO · Unabhängig. Markennamen dienen nur zur Identifikation unterstützter Programme.';
 const heading=leaves.find(el=>/^Einstellungen$/i.test((el.textContent||'').trim()));if(!heading)return;
 let panel=heading.parentElement;for(let i=0;i<5&&panel?.parentElement;i++){if(/Programme\s*&\s*(?:Amex|Karten)/i.test(panel.textContent||''))break;panel=panel.parentElement;}
 if(!panel)return;
 let row=q('.v24a-account-row',panel);
 if(!row){row=document.createElement('div');row.className='v24a-account-row';const firstCard=qa('*',panel).find(el=>el.children.length&&/Programme\s*&\s*(?:Amex|Karten)/i.test(el.textContent||'')&&!/Einstellungen/i.test(el.textContent||''));if(firstCard?.parentElement)firstCard.parentElement.insertBefore(row,firstCard);else panel.appendChild(row);}
 const safeEmail=user?.email?String(user.email).replace(/[<>&]/g,''):'';
 row.innerHTML=user?.email
  ?`<div><strong>Konto</strong><span>${safeEmail}</span></div><button type="button">Abmelden</button>`
  :'<div><strong>Konto</strong><span>Gastmodus · Entscheidungen bleiben nur auf diesem Gerät</span></div><button type="button">Anmelden</button>';
 row.querySelector('button')?.addEventListener('click',()=>user?void logout():showGate({mode:'login',title:'Dein VAYQUO-Konto.',copy:'Melde dich an, um gespeicherte Entscheidungen und Stände wieder zu laden.'}));
}
function detectOfferDecision(){
 if(user)return;
 const node=q('#v24os-result [data-v24oc-done="1"]');
 if(!node||node===lastOfferDecisionNode)return;
 lastOfferDecisionNode=node;
 decisionGate('offer');
}
function observe(){
 document.addEventListener('input',ev=>{if(!ev.target.closest?.('#v24-auth'))syncSoon();},true);
 document.addEventListener('change',ev=>{if(!ev.target.closest?.('#v24-auth'))syncSoon();},true);
 document.addEventListener('click',ev=>{if(!ev.target.closest?.('#v24-auth')){syncSoon();setTimeout(patchSettings,30);}},true);
 window.addEventListener('pagehide',()=>{void pushRemoteState(false);});
 window.addEventListener('vayquo:decision-ready',ev=>decisionGate(String(ev?.detail?.kind||'decision')));
 new MutationObserver(()=>{setTimeout(patchSettings,0);detectOfferDecision();}).observe(document.documentElement,{childList:true,subtree:true});
}
async function init(){
 ensureStyle();mount();observe();
 const ok=await ensureSession();
 if(ok&&user)await startAuthenticated();
 else{hideGate();patchSettings();}
}

window.VAYQUO_AUTH={
 logout,
 getUser:()=>user?{id:user.id,email:user.email}:null,
 sync:()=>pushRemoteState(true),
 show:context=>showGate(context||{}),
 requireDecision:kind=>decisionGate(kind||'decision')
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void init(),{once:true});else void init();
})();