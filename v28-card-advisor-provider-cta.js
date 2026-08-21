(()=>{
'use strict';

const ALLOWED_PROVIDER_HOSTS=new Set([
 'www.americanexpress.com',
 'www.miles-and-more-kreditkarte.com',
 'www.banknorwegian.de',
 'www.hanseaticbank.de',
 'tfbank.de',
 'www.financeads.net'
]);

function validProviderUrl(value){
 try{
  const url=new URL(value);
  if(url.protocol!=='https:')return '';
  if(!ALLOWED_PROVIDER_HOSTS.has(url.hostname))return '';
  return url.href;
 }catch{return '';}
}
function ensureStyle(){
 if(document.getElementById('v32-card-conversion-style'))return;
 const style=document.createElement('style');
 style.id='v32-card-conversion-style';
 style.textContent=`
  .v32-card-next{margin:12px 0 2px;padding:12px 13px;border-radius:14px;background:#f3eee5;border:1px solid rgba(151,119,70,.18)}
  .v32-card-next small{display:block;color:#947449;font-size:8px;font-weight:900;letter-spacing:.13em}
  .v32-card-next b{display:block;margin-top:4px;color:#21322f;font-size:12px;line-height:1.35}
  .v32-card-next span{display:block;margin-top:4px;color:#6f7a77;font-size:9.5px;line-height:1.45}
  .v28ca-actions .v28ca-select{min-height:50px!important;background:#171918!important;color:#fff!important;font-size:11.5px!important;box-shadow:0 9px 22px rgba(23,25,24,.14)!important}
  .v28ca-actions .v28ca-provider{min-height:44px!important;background:#fffdf9!important}
  .v32-affiliate-note{margin-top:8px;color:#89928f;font-size:8.5px;line-height:1.45}
 `;
 document.head.appendChild(style);
}
function syncCommercialDisclosure(root){
 if(!root)return;
 const actions=root.querySelector('.v28ca-actions');
 if(!actions)return;
 const commercial=!!root.querySelector('[data-vq-commercial="1"]');
 let note=root.querySelector('.v32-affiliate-note');
 if(!commercial){note?.remove();return;}
 if(!note){
  note=document.createElement('div');
  note.className='v32-affiliate-note';
  note.textContent='Für dich bleibt VAYQUO kostenlos. Bei einem Abschluss über diesen Partnerlink kann VAYQUO eine Vergütung erhalten. Deine Empfehlung bleibt davon unabhängig.';
  actions.insertAdjacentElement('afterend',note);
 }
}
function decorateRecommendation(){
 const root=document.getElementById('v28-card-advisor');
 const card=root?.querySelector('.v28ca-card');
 const actions=card?.querySelector('.v28ca-actions');
 if(!root||!card||!actions)return;
 ensureStyle();
 let next=card.querySelector('.v32-card-next');
 if(!next){
  next=document.createElement('div');
  next.className='v32-card-next';
  next.innerHTML='<small>DEIN NÄCHSTER SCHRITT</small><b>Passende Konditionen jetzt prüfen</b><span>VAYQUO hat die Auswahl bereits eingegrenzt. Prüfe jetzt die aktuellen Konditionen und Annahmekriterien direkt beim Anbieter.</span>';
  actions.insertAdjacentElement('beforebegin',next);
 }
 const primary=actions.querySelector('.v28ca-select');
 const detail=actions.querySelector('.v28ca-provider');
 if(primary&&!primary.disabled)primary.textContent='Passende Karte beim Anbieter prüfen →';
 if(detail)detail.textContent='Alle Details & Konditionen ansehen';
 syncCommercialDisclosure(root);
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

window.addEventListener('vayquo:card-advisor-result',()=>setTimeout(decorateRecommendation,0));
new MutationObserver(()=>{
 const root=document.getElementById('v28-card-advisor');
 if(root&&!root.hidden&&root.querySelector('.v28ca-card'))decorateRecommendation();
}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-vq-commercial','hidden']});
})();