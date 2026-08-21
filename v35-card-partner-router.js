(()=>{
'use strict';

const FINANCEADS_HOST='www.financeads.net';
let lastCardId='';

function validFinanceAdsUrl(value){
 try{
  const url=new URL(String(value||''));
  if(url.protocol!=='https:'||url.hostname!==FINANCEADS_HOST)return '';
  return url.href;
 }catch{return '';}
}
function validOfficialUrl(value){
 try{
  const url=new URL(String(value||''));
  return url.protocol==='https:'?url.href:'';
 }catch{return '';}
}
function providerLink(){
 return document.querySelector('#v28-card-advisor .v28ca-provider[href]');
}
function setHref(link,href){
 if(!href)return;
 try{if(new URL(link.href).href===new URL(href).href)return;}catch{}
 link.href=href;
}
function applyRoute(){
 const link=providerLink();
 if(!link)return;
 if(!link.dataset.vqOfficialHref){
  const official=validOfficialUrl(link.getAttribute('href'));
  if(official)link.dataset.vqOfficialHref=official;
 }
 const affiliate=validFinanceAdsUrl(window.VAYQUO_COMMERCIAL?.getCardPartnerUrl?.(lastCardId));
 if(affiliate){
  setHref(link,affiliate);
  link.rel='sponsored noopener noreferrer';
  link.dataset.vqCommercial='1';
  link.dataset.vqCardId=lastCardId;
 }else{
  const official=validOfficialUrl(link.dataset.vqOfficialHref);
  if(official)setHref(link,official);
  link.rel='noopener noreferrer';
  link.removeAttribute('data-vq-commercial');
  if(lastCardId)link.dataset.vqCardId=lastCardId;
 }
}
function isAffiliate(link){
 return link?.dataset?.vqCommercial==='1'&&!!validFinanceAdsUrl(link.getAttribute('href'));
}
function recordClick(link){
 if(!link)return;
 const affiliate=isAffiliate(link);
 const destination=affiliate?'affiliate':'provider';
 try{window.VAYQUORevenuePrep?.record?.('card_external_click',{destination});}catch{}
 if(affiliate){
  try{window.VAYQUORevenuePrep?.record?.('commercial_offer_clicked',{slot:'after_card_gap_analysis',channel:'amex_cards'});}catch{}
  try{window.VAYQUOMonetization?.emit?.('card_affiliate_click',{destination:'affiliate'});}catch{}
 }
}
function openAffiliate(ev,link){
 if(!isAffiliate(link))return false;
 const safe=validFinanceAdsUrl(link.getAttribute('href'));
 if(!safe)return false;
 ev.preventDefault();
 ev.stopImmediatePropagation();
 recordClick(link);
 setTimeout(()=>window.location.assign(safe),0);
 return true;
}

document.addEventListener('click',ev=>{
 const detail=ev.target?.closest?.('.v28ca-provider[href]');
 if(detail){
  if(openAffiliate(ev,detail))return;
  recordClick(detail);
  return;
 }
 const primary=ev.target?.closest?.('.v28ca-select');
 if(!primary)return;
 const link=primary.closest('#v28-card-advisor')?.querySelector('.v28ca-provider[href]');
 if(openAffiliate(ev,link))return;
 recordClick(link);
},true);

window.addEventListener('vayquo:card-advisor-result',ev=>{
 lastCardId=String(ev?.detail?.cardId||'');
 setTimeout(applyRoute,0);
});
window.addEventListener('vayquo:commercial-policy-ready',()=>setTimeout(applyRoute,0));
new MutationObserver(()=>{
 const root=document.getElementById('v28-card-advisor');
 if(root&&!root.hidden&&root.querySelector('.v28ca-provider[href]'))applyRoute();
}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','href']});
})();
