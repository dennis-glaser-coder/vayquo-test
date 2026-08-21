(()=>{
'use strict';

/*
 Decision-first monetization guard.
 Commercial links may only be shown after VAYQUO has produced a qualifying
 product decision. Partner availability never changes the recommendation.
 A tracking URL alone is never sufficient: the global and channel launch
 gates must also be fully open.
*/
const PARTNER_CONFIG_URL='config/vayquo-partner-links.de.json?v=3502';
const GATE_CONFIG_URL='config/vayquo-commercial-launch-gates.de.json?v=3502';
const links=Object.create(null);
const partnerMeta=Object.create(null);
const activeChannels=new Set();
let partnerMode='preparation_only';

const ELIGIBLE={
 'amex-platinum':new Set(['card-fit-platinum']),
 'amex-gold':new Set(['card-fit-gold']),
 'amex-payback':new Set(['card-fit-payback']),
 'hotel':new Set(['cash-hotel']),
 'car':new Set(['cash-car']),
 'attraction':new Set(['cash-attraction'])
};
const KIND_CHANNEL={
 'amex-platinum':'amex_cards',
 'amex-gold':'amex_cards',
 'amex-payback':'amex_cards',
 hotel:'expedia',
 car:'expedia',
 attraction:'getyourguide'
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
function clearLinks(){Object.keys(links).forEach(key=>delete links[key]);}
function checksOpen(value){
 if(!value||typeof value!=='object')return false;
 const checks=Object.values(value);
 return checks.length>0&&checks.every(item=>item===true);
}
function resolveActiveChannels(gates){
 activeChannels.clear();
 const global=gates?.globalGate;
 if(global?.commercialLive!==true||global?.allRequired!==true||!checksOpen(global.checks))return;
 const channelGates=gates?.channelGates&&typeof gates.channelGates==='object'?gates.channelGates:{};
 Object.entries(channelGates).forEach(([channel,checks])=>{if(checksOpen(checks))activeChannels.add(channel);});
}
function channelOpenForKind(kind){
 const channel=KIND_CHANNEL[kind];
 return !!channel&&activeChannels.has(channel);
}

function setPartnerLinks(next){
 if(!next||typeof next!=='object')return false;
 let changed=false;
 Object.entries(next).forEach(([key,value])=>{
  if(!Object.prototype.hasOwnProperty.call(ELIGIBLE,key))return;
  if(!channelOpenForKind(key)){
   if(links[key]){delete links[key];changed=true;}
   return;
  }
  const url=cleanUrl(value);
  if(url){links[key]=url;changed=true;}
  else if(links[key]){delete links[key];changed=true;}
 });
 return changed;
}

function applyPartnerConfig(data){
 partnerMode=String(data?.mode||'unavailable');
 const cards=data?.cards&&typeof data.cards==='object'?data.cards:{};
 Object.entries(cards).forEach(([cardId,entry])=>{
  if(!entry||typeof entry!=='object')return;
  partnerMeta[cardId]={...entry,cardId};
  const kind=CARD_KIND[cardId]||String(entry.kind||'');
  if(!kind||!Object.prototype.hasOwnProperty.call(ELIGIBLE,kind))return;
  const mayActivate=partnerMode==='live'&&channelOpenForKind(kind)&&entry.status==='active';
  if(!mayActivate){delete links[kind];return;}
  const url=cleanUrl(entry.trackingUrl);
  if(url)links[kind]=url;
  else delete links[kind];
 });
}
async function fetchJson(url){
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw new Error('COMMERCIAL_CONFIG_UNAVAILABLE');
 return response.json();
}
async function loadPartnerConfig(){
 clearLinks();
 try{
  const [partners,gates]=await Promise.all([fetchJson(PARTNER_CONFIG_URL),fetchJson(GATE_CONFIG_URL)]);
  resolveActiveChannels(gates);
  applyPartnerConfig(partners);
  window.dispatchEvent(new CustomEvent('vayquo:commercial-policy-ready',{detail:{mode:partnerMode,activeChannels:Array.from(activeChannels)}}));
  return {partners,gates};
 }catch{
  activeChannels.clear();
  partnerMode='unavailable';
  clearLinks();
  window.dispatchEvent(new CustomEvent('vayquo:commercial-policy-ready',{detail:{mode:'unavailable',activeChannels:[]}}));
  return null;
 }
}

function canShow(kind,decision){
 return channelOpenForKind(kind)&&!!links[kind]&&!!ELIGIBLE[kind]?.has(String(decision||''));
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
 return kind&&channelOpenForKind(kind)?links[kind]||'':'';
}
function getCardPartnerMeta(cardId){
 const meta=partnerMeta[String(cardId||'')];
 return meta?{...meta}:null;
}

window.VAYQUO_COMMERCIAL=Object.freeze({
 setPartnerLinks,
 canShow,
 prepareLink,
 getPartnerUrl:kind=>channelOpenForKind(kind)?links[kind]||'':'',
 getCardPartnerUrl,
 getCardPartnerMeta,
 getActiveChannels:()=>Array.from(activeChannels),
 loadPartnerConfig
});
void loadPartnerConfig();
})();
