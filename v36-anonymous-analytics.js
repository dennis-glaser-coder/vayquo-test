(()=>{
'use strict';
if(!location.hash){
  try{history.scrollRestoration='manual'}catch{}
  const forceTop=()=>{try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch{window.scrollTo(0,0)}};
  forceTop();
  requestAnimationFrame(forceTop);
  window.addEventListener('DOMContentLoaded',forceTop,{once:true});
  window.addEventListener('pageshow',()=>{forceTop();setTimeout(forceTop,0);setTimeout(forceTop,120)},{once:true});
}
if(window.__VAYQUO_ANONYMOUS_ANALYTICS__)return;
window.__VAYQUO_ANONYMOUS_ANALYTICS__=true;
const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_events';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const EVENT_SCHEMAS=Object.freeze({page_view:[],setup_category_select:['category'],setup_build:['category','budget_bucket','mode','goal_count','owned_count'],setup_share:['category','budget_bucket'],setup_shop_click:['category','target_host'],preset_open:['preset'],outbound_click:['target_host']});
const sessionId=(globalThis.crypto?.randomUUID?.()||`vq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`).slice(0,80);
const clean=(value,max=120)=>String(value??'').replace(/[\r\n\t]/g,' ').trim().slice(0,max);
const safeToken=(value,max=100)=>{const v=clean(value,max);return v&&/^[A-Za-z0-9._-]+$/.test(v)?v:''};
const params=()=>{try{return new URLSearchParams(location.search)}catch{return new URLSearchParams()}};
const activeCategory=()=>safeToken(document.querySelector('.cat.active[data-cat]')?.dataset?.cat||'',40);
const budgetBucket=()=>{const n=Number(document.getElementById('budget')?.value||0);if(!Number.isFinite(n)||n<=0)return'';if(n<500)return'under_500';if(n<1000)return'500_999';if(n<1500)return'1000_1499';if(n<2500)return'1500_2499';if(n<4000)return'2500_3999';return'4000_plus'};
const currentMode=()=>safeToken(document.querySelector('.mode.on[data-mode]')?.dataset?.mode||'',30);
const goalCount=()=>String(document.querySelectorAll('.chip.on').length);
const ownedCount=()=>String(document.querySelectorAll('#owned input:checked').length);
function referrerHost(){try{return document.referrer?new URL(document.referrer).hostname.slice(0,120):null}catch{return null}}
function attribution(){const p=params(),utm={};for(const key of ['utm_source','utm_medium','utm_campaign']){const value=safeToken(p.get(key),100);if(value)utm[key.replace('utm_','')]=value}const explicit=safeToken(p.get('source'),80),ref=referrerHost();return{source:clean(utm.source||explicit||ref||'direct',80),referrer_host:ref,utm}}
function propagateAttribution(){const p=params(),keys=['utm_source','utm_medium','utm_campaign'];if(!keys.some(k=>p.get(k)))return;for(const a of document.querySelectorAll('a.cta')){try{const u=new URL(a.href,location.href);if(u.origin!==location.origin)continue;for(const k of keys){const v=safeToken(p.get(k),100);if(v)u.searchParams.set(k,v)}a.href=u.href}catch{}}}
function sanitize(eventName,properties={}){const allowed=EVENT_SCHEMAS[eventName];if(!allowed)return null;const out={};for(const key of allowed){let value=clean(properties?.[key],120);if(!value)continue;if(['category','budget_bucket','mode','goal_count','owned_count','preset'].includes(key)&&!/^[A-Za-z0-9._-]+$/.test(value))continue;if(key==='target_host'&&!/^[A-Za-z0-9.-]+$/.test(value))continue;out[key]=value}return out}
function send(eventName,properties={}){try{const safeProperties=sanitize(eventName,properties);if(!safeProperties)return;const a=attribution(),payload={session_id:sessionId,event_name:eventName,path:clean(location.pathname||'/',240)||'/',source:a.source,referrer_host:a.referrer_host,utm:a.utm,properties:safeProperties,user_id:null};fetch(ENDPOINT,{method:'POST',headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload),keepalive:true,credentials:'omit'}).catch(()=>{})}catch{}}
function presetName(){const p=location.pathname.replace(/\/+$/,''),m=p.match(/\/setups\/([a-z0-9-]+)\.html$/i);return m?safeToken(m[1],80):''}
function setupSnapshot(){return{category:activeCategory(),budget_bucket:budgetBucket(),mode:currentMode(),goal_count:goalCount(),owned_count:ownedCount()}}
propagateAttribution();
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target.closest('a,button,[role="button"]'):null;if(!target)return;if(target.matches('.cat[data-cat]'))send('setup_category_select',{category:safeToken(target.dataset.cat,40)});if(target.matches('#build'))send('setup_build',setupSnapshot());if(target.matches('#share'))send('setup_share',{category:activeCategory(),budget_bucket:budgetBucket()});if(target instanceof HTMLAnchorElement){try{const u=new URL(target.href,location.href);if(target.matches('.shop')&&u.origin!==location.origin)send('setup_shop_click',{category:activeCategory(),target_host:u.hostname.slice(0,120)});else if(u.origin!==location.origin&&/^https?:$/.test(u.protocol))send('outbound_click',{target_host:u.hostname.slice(0,120)})}catch{}}},true);
send('page_view');
const preset=presetName();if(preset)send('preset_open',{preset});
if(/^#setup=/.test(location.hash))setTimeout(()=>{if(activeCategory())send('setup_build',setupSnapshot())},80);
window.VAYQUO_ANALYTICS={track:(name,props={})=>send(name,props)};
})();