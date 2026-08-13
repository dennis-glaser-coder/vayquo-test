(()=>{
'use strict';

const SUPABASE_URL='https://fcvffslhnaqlwitaeers.supabase.co';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const SESSION_KEY='vayquo:authSession';
let mounted=false;

function authRedirect(){
 return `${location.origin}${location.pathname}`;
}

function cleanAuthUrl(){
 try{history.replaceState(null,'',location.pathname+location.search);}catch{}
}

function consumeOAuthCallback(){
 const raw=location.hash.startsWith('#')?location.hash.slice(1):location.hash;
 if(!raw)return false;
 const params=new URLSearchParams(raw);
 const access=params.get('access_token');
 const refresh=params.get('refresh_token');
 const expires=Number(params.get('expires_in'))||3600;
 const error=params.get('error_description')||params.get('error');
 if(access&&refresh){
  try{
   localStorage.setItem(SESSION_KEY,JSON.stringify({
    access_token:access,
    refresh_token:refresh,
    token_type:params.get('token_type')||'bearer',
    expires_in:expires,
    expires_at:Date.now()+Math.max(60,expires)*1000
   }));
  }catch{}
  cleanAuthUrl();
  return true;
 }
 if(error){
  try{sessionStorage.setItem('vayquo:socialAuthError',String(error));}catch{}
  cleanAuthUrl();
 }
 return false;
}

function addStyle(){
 if(document.getElementById('v24-social-auth-style'))return;
 const style=document.createElement('style');
 style.id='v24-social-auth-style';
 style.textContent=`
  .v24a-social{margin:18px 0 16px}.v24a-google{width:100%;height:52px;border:1px solid #d9d6cf;border-radius:15px;background:#fff;color:#1e2826;display:flex;align-items:center;justify-content:center;gap:10px;font:800 14px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;box-shadow:0 1px 2px rgba(0,0,0,.025)}
  .v24a-google:active{transform:scale(.995)}.v24a-google[disabled]{opacity:.6}.v24a-google-mark{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;border:1px solid #ddd;font:800 14px Arial,sans-serif;background:#fff;color:#4285f4}
  .v24a-or{display:flex;align-items:center;gap:10px;margin:15px 0 0;color:#98a09d;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.v24a-or:before,.v24a-or:after{content:"";height:1px;background:#ddd9d1;flex:1}
 `;
 document.head.appendChild(style);
}

function showExistingMessage(message,error=true){
 const el=document.getElementById('v24a-msg');
 if(!el)return;
 el.textContent=message||'';
 el.className=`v24a-msg${message?' show':''}${error?' error':''}`;
}

async function googleEnabled(){
 try{
  const res=await fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:API_KEY},cache:'no-store'});
  if(!res.ok)return false;
  const data=await res.json();
  return !!data?.external?.google;
 }catch{return false;}
}

async function beginGoogle(button){
 button.disabled=true;
 showExistingMessage('',false);
 const enabled=await googleEnabled();
 if(!enabled){
  button.disabled=false;
  showExistingMessage('Google-Anmeldung ist vorbereitet. Es fehlt nur noch die einmalige Google-Freigabe.',true);
  return;
 }
 const target=authRedirect();
 const url=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
 url.searchParams.set('provider','google');
 url.searchParams.set('redirect_to',target);
 location.assign(url.toString());
}

function mount(){
 if(mounted)return;
 const root=document.getElementById('v24-auth');
 const card=root?.querySelector('.v24a-card');
 const tabs=root?.querySelector('.v24a-tabs');
 if(!root||!card||!tabs)return;
 mounted=true;
 addStyle();
 const wrap=document.createElement('div');
 wrap.className='v24a-social';
 wrap.innerHTML='<button class="v24a-google" id="v24a-google" type="button"><span class="v24a-google-mark" aria-hidden="true">G</span><span>Mit Google anmelden</span></button><div class="v24a-or">oder mit E-Mail</div>';
 card.insertBefore(wrap,tabs);
 wrap.querySelector('#v24a-google').addEventListener('click',ev=>void beginGoogle(ev.currentTarget));
 try{
  const err=sessionStorage.getItem('vayquo:socialAuthError');
  if(err){sessionStorage.removeItem('vayquo:socialAuthError');setTimeout(()=>showExistingMessage('Google-Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.',true),50);}
 }catch{}
}

function leafByExact(text){
 return Array.from(document.querySelectorAll('*')).find(el=>el.children.length===0&&(el.textContent||'').trim()===text)||null;
}

function removeInternalSettingsFooter(){
 const leaves=Array.from(document.querySelectorAll('*')).filter(el=>el.children.length===0);
 const note=leaves.find(el=>/VAYQUO\s+V2\.3\s+Test|VAYQUO\s*[·•]\s*Unabhängig/i.test((el.textContent||'').trim()));
 if(!note)return;
 let target=note;
 const text=(note.textContent||'').trim();
 for(let i=0;i<3;i++){
  const parent=target.parentElement;
  if(!parent)break;
  if((parent.textContent||'').trim()===text&&parent.children.length<=1)target=parent;else break;
 }
 target.remove();
}

function rowForLeaf(leaf){
 if(!leaf)return null;
 const clickable=leaf.closest('button,[role="button"],a');
 if(clickable)return clickable;
 let node=leaf;
 let best=null;
 for(let i=0;i<6;i++){
  const parent=node.parentElement;
  if(!parent)break;
  const text=(parent.textContent||'').trim();
  if(text.length>180)break;
  if(parent.children.length>=2&&parent.querySelector('svg'))best=parent;
  node=parent;
 }
 return best||leaf.parentElement?.parentElement||leaf.parentElement;
}

function removeSettingsRow(title){
 const leaf=leafByExact(title);
 const row=rowForLeaf(leaf);
 if(row)row.remove();
}

function cleanCustomerSettings(){
 const heading=leafByExact('Einstellungen');
 if(!heading)return;
 if(!document.querySelector('.v24a-account-row'))return;

 const programme=leafByExact('Programme & Amex');
 if(programme)programme.textContent='Programme & Karten';
 const programmeSub=leafByExact('Amex, PAYBACK und Miles & More verwalten.');
 if(programmeSub)programmeSub.textContent='Punkteprogramme und Karten verwalten.';

 const sources=leafByExact('Datenstand & Quellen');
 if(sources)sources.textContent='Daten & Quellen';
 const sourcesSub=leafByExact('Regeln und Prüfstand ansehen.');
 if(sourcesSub)sourcesSub.textContent='Datenquellen und Aktualität ansehen.';

 removeSettingsRow('Daten exportieren');
 removeSettingsRow('Daten importieren');
 removeSettingsRow('Zurücksetzen');
 removeInternalSettingsFooter();
}

function boot(){
 mount();
 removeInternalSettingsFooter();
 setTimeout(cleanCustomerSettings,80);
}

consumeOAuthCallback();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>{
 mount();
 removeInternalSettingsFooter();
 setTimeout(cleanCustomerSettings,50);
}).observe(document.documentElement,{childList:true,subtree:true});
})();