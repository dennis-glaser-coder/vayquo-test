(()=>{
'use strict';

const ALLOWED_PROVIDER_HOSTS=new Set([
 'www.americanexpress.com',
 'www.miles-and-more-kreditkarte.com',
 'www.banknorwegian.de',
 'www.hanseaticbank.de',
 'tfbank.de'
]);

function validProviderUrl(value){
 try{
  const url=new URL(value);
  if(url.protocol!=='https:')return '';
  if(!ALLOWED_PROVIDER_HOSTS.has(url.hostname))return '';
  return url.href;
 }catch{return '';}
}

function goToProvider(href){
 const safe=validProviderUrl(href||'');
 if(!safe)return false;
 try{window.VAYQUOMonetization?.emit?.('card_provider_click',{destination:'provider'});}catch{}
 setTimeout(()=>window.location.assign(safe),0);
 return true;
}

document.addEventListener('click',ev=>{
 const detailLink=ev.target?.closest?.('.v28ca-provider[href]');
 if(detailLink){
  ev.preventDefault();
  goToProvider(detailLink.getAttribute('href'));
  return;
 }

 const btn=ev.target?.closest?.('.v28ca-select');
 if(!btn)return;
 const root=btn.closest('#v28-card-advisor');
 const provider=root?.querySelector('.v28ca-provider[href]');
 goToProvider(provider?.getAttribute('href')||'');
});
})();
