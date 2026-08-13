(()=>{
'use strict';

const SESSION_KEY='vayquo:authSession';
const RECOVERY_KEY='vayquo:passwordRecovery';

function cleanAuthUrl(){
 try{history.replaceState(null,'',location.pathname+location.search);}catch{}
}

function consumeAuthCallback(){
 const raw=location.hash.startsWith('#')?location.hash.slice(1):location.hash;
 if(!raw)return false;
 const params=new URLSearchParams(raw);
 const access=params.get('access_token');
 const refresh=params.get('refresh_token');
 const expires=Number(params.get('expires_in'))||3600;
 const type=String(params.get('type')||'').toLowerCase();
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
   if(type==='recovery')sessionStorage.setItem(RECOVERY_KEY,'1');
  }catch{}
  cleanAuthUrl();
  return true;
 }
 if(error){
  try{sessionStorage.setItem('vayquo:authCallbackError',String(error));}catch{}
  cleanAuthUrl();
 }
 return false;
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
 removeInternalSettingsFooter();
 setTimeout(cleanCustomerSettings,80);
}

consumeAuthCallback();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>{
 removeInternalSettingsFooter();
 setTimeout(cleanCustomerSettings,50);
}).observe(document.documentElement,{childList:true,subtree:true});
})();