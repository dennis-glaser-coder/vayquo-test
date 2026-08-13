(()=>{
'use strict';

const CONFIG_URL='config/vayquo-monetization.de.json';
let config=null;
let loading=null;

const safeUrl=value=>{
 try{
  const u=new URL(String(value||''),location.origin);
  if(u.protocol!=='https:')return '';
  return u.href;
 }catch{return '';}
};

async function load(){
 if(config)return config;
 if(loading)return loading;
 loading=fetch(CONFIG_URL,{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('monetization config unavailable')))
  .then(data=>config=data)
  .catch(()=>null)
  .finally(()=>{loading=null;});
 return loading;
}

function channel(id){
 const c=config?.channels?.[id];
 if(!c||c.enabled!==true)return null;
 const href=safeUrl(c.href||c.trackingUrl||'');
 if(c.type!=='subscription'&&c.type!=='service'&&c.type!=='b2b'&&!href)return null;
 return {...c,id,href};
}

function eligible(context={}){
 const out=[];
 const add=id=>{const c=channel(id);if(c)out.push(c);};
 if(context.cardGap===true)add('amex_cards');
 if(context.tripIntent===true){add('expedia');}
 if(context.destinationKnown===true){add('getyourguide');}
 if(context.internationalTrip===true){add('airalo');}
 if(context.valueDemonstrated===true)add('vayquo_pro');
 if(context.complexAwardCase===true||context.userRequestsHelp===true)add('concierge');
 return out;
}

function disclosure(){return config?.disclosure?.short||'';}

function emit(name,detail={}){
 document.dispatchEvent(new CustomEvent('vayquo:monetization',{detail:{name,...detail,ts:Date.now()}}));
}

window.VAYQUOMonetization={
 version:'1.0.0',
 load,
 channel,
 eligible,
 disclosure,
 emit,
 get config(){return config;}
};

load();
})();
