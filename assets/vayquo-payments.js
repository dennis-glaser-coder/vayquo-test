(()=>{
'use strict';
const SUPABASE_URL='https://fcvffslhnaqlwitaeers.supabase.co';
const SUPABASE_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const PAYMENT_LINK='https://buy.stripe.com/aFa28r69J1kqgjrdpYbjW00';
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PENDING_KEY='vq_pending_paid_match';

async function getLead(matchId){
  const {data,error}=await client.rpc('vayquo_my_leads');
  if(error) return null;
  return (data||[]).find(row=>row.match_id===matchId)||null;
}

async function unlockPaid(matchId){
  const lead=await getLead(matchId);
  if(!lead||!['paid','waived'].includes(lead.billing_status)) return false;
  const {data,error}=await client.rpc('vayquo_partner_unlock_contact',{p_match_id:matchId});
  const contact=Array.isArray(data)?data[0]:data;
  return !error&&!!contact;
}

function checkoutUrl(matchId){
  const url=new URL(PAYMENT_LINK);
  url.searchParams.set('client_reference_id',matchId);
  return url.toString();
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-unlock]');
  if(!button||button.classList.contains('secondary')) return;
  const matchId=button.dataset.unlock||'';
  if(!UUID.test(matchId)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  const original=button.textContent;
  button.disabled=true;
  button.textContent='Zahlung wird geprüft …';

  if(await unlockPaid(matchId)){
    location.reload();
    return;
  }

  sessionStorage.setItem(PENDING_KEY,matchId);
  location.href=checkoutUrl(matchId);
  setTimeout(()=>{button.disabled=false;button.textContent=original},1500);
},true);

async function handlePaymentReturn(){
  const params=new URLSearchParams(location.search);
  if(params.get('payment')!=='success') return;
  const matchId=sessionStorage.getItem(PENDING_KEY)||'';
  history.replaceState({},'',location.pathname);
  if(!UUID.test(matchId)) return;

  for(let i=0;i<8;i++){
    if(await unlockPaid(matchId)){
      sessionStorage.removeItem(PENDING_KEY);
      location.reload();
      return;
    }
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  alert('Die Zahlung wurde abgeschlossen und wird gerade bestätigt. Aktualisieren Sie das Partnerportal gleich noch einmal. Kontaktdaten bleiben bis zur Stripe-Bestätigung gesperrt.');
}

window.addEventListener('load',()=>setTimeout(handlePaymentReturn,500));
})();