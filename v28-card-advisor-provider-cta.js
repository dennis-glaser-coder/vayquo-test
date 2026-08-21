(()=>{
'use strict';

function validProviderUrl(value){
 try{
  const url=new URL(value,window.location.href);
  return url.protocol==='https:'?url.href:'';
 }catch{return '';}
}

document.addEventListener('click',ev=>{
 const btn=ev.target?.closest?.('.v28ca-select');
 if(!btn)return;
 const root=btn.closest('#v28-card-advisor');
 const provider=root?.querySelector('.v28ca-provider[href]');
 const href=validProviderUrl(provider?.getAttribute('href')||'');
 if(!href)return;
 try{window.VAYQUOMonetization?.emit?.('card_provider_click',{destination:'provider'});}catch{}
 setTimeout(()=>window.location.assign(href),0);
});
})();
