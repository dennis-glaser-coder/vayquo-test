(()=>{
'use strict';

const URLS={
 monetization:'config/vayquo-monetization.de.json',
 readiness:'config/vayquo-commercial-readiness.de.json',
 slots:'config/vayquo-commercial-slots.de.json'
};
let cache=null;
let loading=null;

async function json(url){
 const r=await fetch(url,{cache:'no-store'});
 if(!r.ok)throw new Error(`commercial config unavailable: ${url}`);
 return r.json();
}

async function load(){
 if(cache)return cache;
 if(loading)return loading;
 loading=Promise.all([json(URLS.monetization),json(URLS.readiness),json(URLS.slots)])
  .then(([monetization,readiness,slots])=>cache={monetization,readiness,slots})
  .catch(()=>null)
  .finally(()=>{loading=null;});
 return loading;
}

function requiredChecksReady(readiness){
 return !!readiness?.requiredChecks&&Object.values(readiness.requiredChecks).every(Boolean);
}

function channelGateReady(readiness,id){
 if(readiness?.commercialLive!==true)return false;
 if(!requiredChecksReady(readiness))return false;
 const gate=readiness?.channelChecks?.[id];
 if(!gate)return false;
 return Object.values(gate).every(Boolean);
}

function relevant(id,context={}){
 if(id==='amex_cards')return context.cardGap===true&&context.valueDemonstrated===true;
 if(id==='expedia')return context.tripIntent===true||context.destinationKnown===true;
 if(id==='getyourguide')return context.destinationKnown===true;
 if(id==='airalo')return context.internationalTrip===true;
 if(id==='vayquo_pro')return context.valueDemonstrated===true;
 if(id==='concierge')return context.complexAwardCase===true||context.userRequestsHelp===true;
 return false;
}

function safeHttps(value){
 try{const u=new URL(String(value||''),location.origin);return u.protocol==='https:'?u.href:'';}catch{return '';}
}

async function plan(slotId,context={}){
 const data=await load();
 if(!data)return [];
 const ids=data.slots?.slots?.[slotId]||[];
 return ids.filter(id=>relevant(id,context)).map(id=>({
  id,
  type:data.monetization?.channels?.[id]?.type||'',
  actionable:false,
  blocked:!channelGateReady(data.readiness,id)
 }));
}

async function resolve(slotId,context={}){
 const data=await load();
 if(!data)return [];
 const ids=data.slots?.slots?.[slotId]||[];
 const max=Math.max(0,Number(data.slots?.rules?.maxCommercialCardsPerSurface)||1);
 const out=[];
 for(const id of ids){
  const channel=data.monetization?.channels?.[id];
  if(!channel||channel.enabled!==true||!relevant(id,context)||!channelGateReady(data.readiness,id))continue;
  const needsUrl=!['subscription','service','b2b'].includes(channel.type);
  const href=needsUrl?safeHttps(channel.trackingUrl||channel.href||''):'';
  if(needsUrl&&!href)continue;
  out.push({id,type:channel.type,href,disclosure:data.monetization?.disclosure?.short||''});
  if(out.length>=max)break;
 }
 return out;
}

window.VAYQUOCommercial={version:'1.0.0',load,plan,resolve};
})();
