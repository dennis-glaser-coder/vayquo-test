(()=>{
'use strict';

/*
 Decision-first monetization guard.
 Commercial links may only be shown after VAYQUO has produced a qualifying
 product decision. Partner availability never changes the recommendation.
 Only approved affiliate-network URLs may become active.
*/
const CONFIG_URL='config/vayquo-partner-links.de.json?v=3501';
const links=Object.create(null);
const partnerMeta=Object.create(null);
const ELIGIBLE={
 'amex-platinum':new Set(['card-fit-platinum']),
 'amex-gold':new Set(['card-fit-gold']),
 'amex-payback':new Set(['card-fit-payback']),
 'hotel':new Set(['cash-hotel']),
 'car':new Set(['cash-car']),
 'attraction':new Set(['cash-attraction'])
};
const CARD_KIND={
 amex_platinum:'amex-platinum',
 amex_gold:'amex-gold',
 amex_payback:'amex-payback'
};

function cleanUrl(value){
 if(!value)return '';
 try{
  const url=new URL(String(value),location.href);
  return url.protocol==='https:'?url.href:'';
 }catch{return '';}
}

function setPartnerLinks(next){
 if(!next||typeof next!=='object')return;
 Object.entries(next).forEach(([key,value])=>{
  if(!Object.prototype.hasOwnProperty.call(ELIGIBLE,key))return;
  const url=cleanUrl(value);
  if(url)links[key]=url;
  else delete links[key];
 });
}

function applyPartnerConfig(data){
 if(!data||typeof data!=='object')return;
 const cards=data.cards&&typeof data.cards==='object'?data.cards:{};
 Object.entries(cards).forEach(([cardId,entry])=>{
  if(!entry||typeof entry!=='object')return;
  partnerMeta[cardId]={...entry,cardId};
  const kind=CARD_KIND[cardId]||String(entry.kind||'');
  if(!kind||!Object.prototype.hasOwnProperty.call(ELIGIBLE,kind))return;
  if(entry.status!=='active'){
   delete links[kind];
   return;
  }
  const url=cleanUrl(entry.trackingUrl);
  if(url)links[kind]=url;
  else delete links[kind];
 });
}

async function loadPartnerConfig(){
 try{
  const response=await fetch(CONFIG_URL,{cache:'no-store'});
  if(!response.ok)throw new Error('PARTNER_CONFIG_UNAVAILABLE');
  const data=await response.json();
  applyPartnerConfig(data);
  window.dispatchEvent(new CustomEvent('vayquo:commercial-policy-ready',{detail:{mode:data.mode||'unknown'}}));
  return data;
 }catch{
  window.dispatchEvent(new CustomEvent('vayquo:commercial-policy-ready',{detail:{mode:'unavailable'}}));
  return null;
 }
}

function canShow(kind,decision){
 return !!links[kind]&&!!ELIGIBLE[kind]?.has(String(decision||''));
}

function prepareLink(element,kind,decision){
 if(!element)return false;
 if(!canShow(kind,decision)){
  element.hidden=true;
  element.removeAttribute('href');
  element.removeAttribute('data-vq-commercial');
  return false;
 }
 element.hidden=false;
 element.href=links[kind];
 element.target='_blank';
 element.rel='sponsored noopener noreferrer';
 element.dataset.vqCommercial='1';
 return true;
}

function getCardPartnerUrl(cardId){
 const kind=CARD_KIND[String(cardId||'')];
 return kind?links[kind]||'':'';
}
function getCardPartnerMeta(cardId){
 const meta=partnerMeta[String(cardId||'')];
 return meta?{...meta}:null;
}

setPartnerLinks(window.VAYQUO_PARTNER_LINKS);
window.VAYQUO_COMMERCIAL=Object.freeze({
 setPartnerLinks,
 canShow,
 prepareLink,
 getPartnerUrl:kind=>links[kind]||'',
 getCardPartnerUrl,
 getCardPartnerMeta,
 loadPartnerConfig
});
void loadPartnerConfig();
})();