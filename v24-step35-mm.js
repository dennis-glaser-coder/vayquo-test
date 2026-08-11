(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PLATINUM_URL='https://www.americanexpress.com/de-de/kreditkarte/platinum-card/';

function benefitsActive(){
  const nav=q('#bottom [data-view="card"]');
  if(nav?.classList.contains('active'))return true;
  return q('#app h1')?.textContent.trim()==='Vorteile';
}

function shouldShow(){
  try{
    const p=state?.programs||{};
    const status=String(state?.mmStatus||'none');
    return benefitsActive()&&!!p.mm&&!p.mr&&status!=='none';
  }catch{return false;}
}

function recommendationHtml(){
  return `<div class="v24s35-section" data-v24s35-mm-reco="1">
    <div class="v24s35-section-head"><h2>Mehr aus deinem Setup</h2><span>optional</span></div>
    <div class="v24s35-reco">
      <div class="v24s35-reco-eyebrow">PASSENDE ERGÄNZUNG · OPTIONAL</div>
      <h3>Dein Status deckt Lounge & Priority bereits gut ab.</h3>
      <p>Was dein Miles-&-More-Status nicht automatisch ergänzt, sind andere Reisevorteile rund um Reisebudget, Restaurants oder Mobilität.</p>
      <div class="v24s35-reason">VAYQUO empfiehlt dir deshalb nicht „mehr Lounge“, sondern prüft nur, ob zusätzliche Reisevorteile überhaupt zu dir passen.</div>
      <button type="button" class="v24s35-reco-btn" data-v24s35-mm-check>Prüfen, ob eine Ergänzung Sinn macht <span>→</span></button>
    </div>
  </div>`;
}

function openCheck(){
  if(typeof openModal!=='function')return;
  openModal('Passt diese Ergänzung zu dir?',`<div class="v24s35-reco-modal">
    <div class="v24s35-reco-modal-kicker">MEHR AUS DEINEM MILES & MORE</div>
    <h3>Dein Status deckt Lounge & Priority bereits ab.</h3>
    <p>Wenn du daneben weitere Reisevorteile regelmäßig nutzt, kann eine zusätzliche Karte dein bestehendes Miles-&-More-Setup sinnvoll ergänzen.</p>
    <div class="v24s35-reco-check">
      <span>✓ dein Miles-&-More-Status bleibt die Basis</span>
      <span>✓ zusätzliche Reise- und Restaurantvorteile</span>
      <span>✓ Mobilitätsvorteile für unterwegs</span>
    </div>
    <div class="v24s35-reco-disclosure">Wenn du diese zusätzlichen Vorteile regelmäßig nutzt, kann eine Ergänzung interessant sein. Die Platinum Card ist eine Möglichkeit dafür; Details und Bedingungen findest du bei American Express.</div>
    <button class="btn" id="v24s35-mm-out">Vorteile der Amex Platinum ansehen ↗</button>
  </div>`);
  q('#v24s35-mm-out')?.addEventListener('click',()=>{try{window.open(PLATINUM_URL,'_blank','noopener,noreferrer');}catch{location.href=PLATINUM_URL;}});
}

function enhance(){
  if(!shouldShow())return;
  const screen=q('#app .v24s35-benefits');
  if(!screen)return;
  if(q('[data-v24s35-mm-reco]',screen))return;

  const current=qa('.v24s35-section',screen).find(section=>q('.v24s35-section-head h2',section)?.textContent.trim()==='Mehr aus deinem Setup');
  if(current)current.outerHTML=recommendationHtml();
  else screen.insertAdjacentHTML('beforeend',recommendationHtml());
  q('[data-v24s35-mm-check]',screen)?.addEventListener('click',openCheck);
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
