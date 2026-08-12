(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AMEX_RESTAURANTS='https://www.amex.de/platinum-restaurantguthaben';
const AMEX_LOGIN='https://www.americanexpress.com/de-de/account/login';
const BENEFIT_CARD_SELECTOR='.v23-benefit-wrap,.v19-benefit,.benefit,.benefit-card,.card,[class*="benefit"]';

function openExternal(url){
  try{window.open(url,'_blank','noopener,noreferrer');}
  catch{location.href=url;}
}

function euro(n){
  const v=Math.max(0,Math.min(150,Number(n)||0));
  return new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(v)+' €';
}

function restaurantState(){
  try{
    const b=(typeof state!=='undefined'&&state?.benefits&&typeof state.benefits==='object')?state.benefits:null;
    if(b){
      const direct=['restaurantOpen','restaurantRemaining','restaurantRemain','restaurantLeft','diningOpen','diningRemaining'];
      for(const key of direct){
        if(Number.isFinite(Number(b[key])))return {amount:Math.max(0,Math.min(150,Number(b[key]))),known:true};
      }
      const used=['restaurantUsed','restaurantSpent','restaurantSpend','diningUsed','diningSpent'];
      for(const key of used){
        if(Number.isFinite(Number(b[key])))return {amount:Math.max(0,150-Number(b[key])),known:true};
      }
      for(const [key,value] of Object.entries(b)){
        if(!/restaurant|dining|gastro/i.test(key)||!Number.isFinite(Number(value)))continue;
        if(/open|remain|left/i.test(key))return {amount:Math.max(0,Math.min(150,Number(value))),known:true};
        if(/used|spent|spend|verbrauch|genutzt/i.test(key))return {amount:Math.max(0,150-Number(value)),known:true};
      }
    }
  }catch{}

  const candidates=qa('.v23-benefit-wrap,.v19-benefit,.benefit,.benefit-card,.card').filter(el=>!el.closest('#v24-sheet'));
  for(const el of candidates){
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(!/restaurantguthaben/i.test(t))continue;
    const m=t.match(/(?:noch\s+)?offen[^0-9]{0,30}(\d+(?:[.,]\d{1,2})?)\s*€/i);
    if(m)return {amount:Math.max(0,Math.min(150,Number(m[1].replace(',','.')))),known:true};
  }
  return {amount:150,known:false};
}

function closeSheet(){
  q('#v24-backdrop')?.classList.remove('is-open');
  q('#v24-sheet')?.classList.remove('is-open');
}

function restaurantOverviewCards(){
  const found=[];
  for(const el of qa('h1,h2,h3,h4,strong,b,span,small,p,div')){
    if(el.closest('#v24-sheet,#v24s3-sheet,[role="dialog"]'))continue;
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(text.length>80||!/^restaurantguthaben(?:\b|\s|$)/i.test(text))continue;
    const card=el.closest(BENEFIT_CARD_SELECTOR);
    if(card&&!found.includes(card))found.push(card);
  }
  return found;
}

function existingRestaurantTrigger(card){
  const direct=qa('button,a,[role="button"],[onclick]',card)
    .map(el=>({el,text:(el.textContent||'').replace(/\s+/g,' ').trim()}))
    .filter(x=>/restaurants?\b|bedingungen|nutzen|öffnen|prüfen/i.test(x.text))
    .sort((a,b)=>a.text.length-b.text.length);
  if(direct[0])return direct[0].el;

  const textTarget=qa('span,small,p,div',card)
    .map(el=>({el,text:(el.textContent||'').replace(/\s+/g,' ').trim()}))
    .filter(x=>x.text.length>0&&x.text.length<90&&/restaurants?\b|bedingungen|nutzen|öffnen|prüfen/i.test(x.text))
    .sort((a,b)=>a.text.length-b.text.length)[0];
  return textTarget?.el||null;
}

function bindRestaurantOverview(){
  for(const card of restaurantOverviewCards()){
    if(card.dataset.v24RestaurantCard==='1')continue;
    const trigger=existingRestaurantTrigger(card);
    if(!trigger)continue;
    card.dataset.v24RestaurantCard='1';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.style.cursor='pointer';

    const activate=ev=>{
      if(ev.target?.closest?.('button,a,input,select,textarea,[role="button"]'))return;
      ev.preventDefault();
      ev.stopPropagation();
      trigger.click();
    };
    card.addEventListener('click',activate);
    card.addEventListener('keydown',ev=>{
      if((ev.key!=='Enter'&&ev.key!==' ')||ev.target!==card)return;
      ev.preventDefault();
      trigger.click();
    });
  }
}

function enhanceRestaurant(){
  const place=q('#v24-rest-place');
  const oldButton=q('#v24-rest-check');
  if(!place||!oldButton)return;
  const root=place.closest('#v24-sheet-content')||q('#v24-sheet-content');
  if(!root||q('#v24-rest-official',root))return;

  const s=restaurantState();
  const statusLabel=s.known?'Noch offen · VAYQUO-Stand':'Jahresguthaben';
  const statusCopy=s.known
    ? 'Dein hinterlegter Stand · Einlösungszeitraum 2026: 07.01.–31.12.'
    : '150 € pro Einlösungszeitraum · den offenen Stand führst du auf der Vorteilsseite.';

  root.innerHTML=`
    <div class="v24-sheet-head">
      <div><div class="v24-sheet-kicker">PLATINUM · GENUSS</div><h3>Restaurantguthaben</h3></div>
      <button type="button" class="v24-close" aria-label="Schließen">×</button>
    </div>
    <div class="v24-result is-visible">
      <strong>${statusLabel}: ${euro(s.amount)}</strong>
      <small>${statusCopy}</small>
    </div>
    <div class="v24-result is-visible">
      <strong>Vorteil bei Amex aktivieren</strong>
      <small>Vor der ersten Nutzung einmal über Amex Offers aktivieren. VAYQUO kann die Aktivierung nicht automatisch prüfen.</small>
    </div>
    <button type="button" class="v24-secondary v24-wide" id="v24-rest-activate">Aktivierung bei Amex prüfen <span>↗</span></button>
    <button type="button" class="v24-primary v24-wide" id="v24-rest-official">Teilnehmende Restaurants anzeigen <span>↗</span></button>
    <p class="v24-mini">Nur Restaurants aus der aktuellen Amex-Teilnehmerliste sind für das Guthaben relevant. Die Liste kann sich ändern.</p>`;

  q('.v24-close',root)?.addEventListener('click',closeSheet);
  q('#v24-rest-activate',root)?.addEventListener('click',()=>openExternal(AMEX_LOGIN));
  q('#v24-rest-official',root)?.addEventListener('click',()=>openExternal(AMEX_RESTAURANTS));
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    try{bindRestaurantOverview();enhanceRestaurant();}
    catch(e){console.warn('VAYQUO restaurant direct',e);}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
