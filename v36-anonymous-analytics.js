(()=>{
'use strict';

if(window.__VAYQUO_ANONYMOUS_ANALYTICS__)return;
window.__VAYQUO_ANONYMOUS_ANALYTICS__=true;

const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_events';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const EVENT_SCHEMAS=Object.freeze({
 page_view:[],
 nav_view:['view'],
 card_check_start:[],
 card_check_complete:[],
 card_check_abandon:[],
 card_check_provider_click:[],
 card_check_restart:[],
 ratgeber_click:['target_path'],
 outbound_click:['target_host']
});
const sessionId=(globalThis.crypto?.randomUUID?.()||`vq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`).slice(0,80);
let cardCheckCompleted=false;
let cardCheckStarted=false;
let cardCheckAbandoned=false;

const clean=(value,max=120)=>String(value??'').replace(/[\r\n\t]/g,' ').trim().slice(0,max);
const urlParams=()=>{try{return new URLSearchParams(location.search);}catch{return new URLSearchParams();}};
const safeToken=(value,max=100)=>{
 const v=clean(value,max);
 return v&&/^[A-Za-z0-9._-]+$/.test(v)?v:'';
};
function referrerHost(){try{return document.referrer?new URL(document.referrer).hostname.slice(0,120):null;}catch{return null;}}
function attribution(){
 const p=urlParams();
 const utm={};
 for(const key of ['utm_source','utm_medium','utm_campaign']){
  const value=safeToken(p.get(key),100);
  if(value)utm[key.replace('utm_','')]=value;
 }
 const explicit=safeToken(p.get('source'),80);
 const ref=referrerHost();
 return {source:clean(utm.source||explicit||ref||'direct',80),referrer_host:ref,utm};
}
function sanitizeProperties(eventName,properties={}){
 const allowed=EVENT_SCHEMAS[eventName];
 if(!allowed)return null;
 const out={};
 for(const key of allowed){
  let value=clean(properties?.[key],key==='target_path'?180:120);
  if(!value)continue;
  if(key==='view'&&!/^[A-Za-z0-9._-]+$/.test(value))continue;
  if(key==='target_host'&&!/^[A-Za-z0-9.-]+$/.test(value))continue;
  if(key==='target_path'&&!/^\/[A-Za-z0-9._~\/-]*$/.test(value))continue;
  out[key]=value;
 }
 return out;
}
function baseProperties(extra={}){
 const out={...extra};
 const entry=safeToken(urlParams().get('entry'),80);
 if(entry)out.entry=entry;
 return out;
}
function send(eventName,properties={}){
 try{
  const safeProperties=sanitizeProperties(eventName,properties);
  if(!safeProperties)return;
  const a=attribution();
  const payload={
   session_id:sessionId,
   event_name:eventName,
   path:clean(location.pathname||'/',240)||'/',
   source:a.source,
   referrer_host:a.referrer_host,
   utm:a.utm,
   properties:baseProperties(safeProperties),
   user_id:null
  };
  fetch(ENDPOINT,{
   method:'POST',
   headers:{'apikey':API_KEY,'Authorization':`Bearer ${API_KEY}`,'Content-Type':'application/json','Prefer':'return=minimal'},
   body:JSON.stringify(payload),
   keepalive:true,
   credentials:'omit'
  }).catch(()=>{});
 }catch{}
}

function markAbandon(){
 if(!cardCheckStarted||cardCheckCompleted||cardCheckAbandoned)return;
 cardCheckAbandoned=true;
 send('card_check_abandon');
}
function trackCardResult(){
 const root=document.getElementById('v28-card-advisor');
 if(!cardCheckStarted||!root||root.hidden||cardCheckCompleted)return;
 if(root.querySelector('.v28ca-result-head,.v28ca-card')){
  cardCheckCompleted=true;
  send('card_check_complete');
 }
}

window.addEventListener('vayquo:card-advisor-open',()=>{
 cardCheckStarted=true;
 cardCheckCompleted=false;
 cardCheckAbandoned=false;
 send('card_check_start');
});
window.addEventListener('pagehide',markAbandon,{capture:true});

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target.closest('a,button,[role="button"]'):null;
 if(!target)return;
 const view=clean(target.getAttribute('data-view'),40);
 if(view)send('nav_view',{view});
 if(target.matches('.v28ca-close'))markAbandon();
 if(target.matches('.v28ca-provider'))send('card_check_provider_click');
 if(target.matches('.v28ca-restart'))send('card_check_restart');
 if(target instanceof HTMLAnchorElement){
  try{
   const u=new URL(target.href,location.href);
   if(u.origin===location.origin&&u.pathname.startsWith('/ratgeber/'))send('ratgeber_click',{target_path:u.pathname.slice(0,180)});
   else if(u.origin!==location.origin&&/^https?:$/.test(u.protocol))send('outbound_click',{target_host:u.hostname.slice(0,120)});
  }catch{}
 }
},true);

new MutationObserver(trackCardResult).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});

send('page_view');
window.VAYQUO_ANALYTICS={track:(name,props={})=>send(name,props)};
})();
