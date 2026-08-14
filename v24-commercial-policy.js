(()=>{
'use strict';

/*
 Decision-first monetization guard.
 Commercial links may only be shown after VAYQUO has produced a qualifying
 product decision. Partner availability never changes the recommendation.
 Only approved affiliate-network URLs should be configured here later.
*/
const links=Object.create(null);
const ELIGIBLE={
 'amex-platinum':new Set(['card-fit-platinum']),
 'amex-gold':new Set(['card-fit-gold']),
 'amex-payback':new Set(['card-fit-payback']),
 'hotel':new Set(['cash-hotel']),
 'car':new Set(['cash-car']),
 'attraction':new Set(['cash-attraction'])
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

function canShow(kind,decision){
 return !!links[kind]&&!!ELIGIBLE[kind]?.has(String(decision||''));
}

function prepareLink(element,kind,decision){
 if(!element)return false;
 if(!canShow(kind,decision)){
  element.hidden=true;
  element.removeAttribute('href');
  return false;
 }
 element.hidden=false;
 element.href=links[kind];
 element.target='_blank';
 element.rel='sponsored noopener noreferrer';
 element.dataset.vqCommercial='1';
 return true;
}

setPartnerLinks(window.VAYQUO_PARTNER_LINKS);
window.VAYQUO_COMMERCIAL=Object.freeze({
 setPartnerLinks,
 canShow,
 prepareLink,
 getPartnerUrl:kind=>links[kind]||''
});
})();