(()=>{
'use strict';

const READINESS_URL='config/vayquo-commercial-readiness.de.json';
let readiness=null;
let loading=null;

async function load(){
 if(readiness)return readiness;
 if(loading)return loading;
 loading=fetch(READINESS_URL,{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('commercial readiness unavailable')))
  .then(data=>readiness=data)
  .catch(()=>null)
  .finally(()=>{loading=null;});
 return loading;
}

function allChecksReady(){
 const checks=readiness?.requiredChecks;
 return !!checks&&Object.values(checks).every(Boolean);
}

function channelReady(id){
 if(!readiness||readiness.commercialLive!==true)return false;
 if(readiness.externalPartnerTrackingAllowed!==true&&['amex_cards','expedia','getyourguide','airalo'].includes(id))return false;
 if(!allChecksReady())return false;
 const c=readiness.channelChecks?.[id];
 if(!c)return false;
 if('partnerApproved' in c&&c.partnerApproved!==true)return false;
 if('trackingConfigured' in c&&c.trackingConfigured!==true)return false;
 if('commercialSetupReady' in c&&c.commercialSetupReady!==true)return false;
 return true;
}

function blockers(id){
 const out=[];
 if(!readiness){out.push('readiness_not_loaded');return out;}
 if(readiness.commercialLive!==true)out.push('commercial_live_off');
 Object.entries(readiness.requiredChecks||{}).forEach(([key,value])=>{if(value!==true)out.push(key);});
 const c=readiness.channelChecks?.[id];
 if(!c)out.push('channel_not_configured');
 else Object.entries(c).forEach(([key,value])=>{if(value!==true)out.push(`${id}.${key}`);});
 if(['amex_cards','expedia','getyourguide','airalo'].includes(id)&&readiness.externalPartnerTrackingAllowed!==true)out.push('external_partner_tracking_off');
 return out;
}

window.VAYQUOCommercialGate={
 version:'1.0.0',
 load,
 channelReady,
 blockers,
 get readiness(){return readiness;}
};

load();
})();
