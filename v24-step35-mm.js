(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PLATINUM_URL='https://www.americanexpress.com/de-de/kreditkarte/platinum-card/';
const STATUS_COPY={
  ftl:{summary:'Business Lounge & Business Class Check-in sind bereits Teil deines Status.'},
  senator:{summary:'Senator Lounge, Priority Boarding & First Class Check-in sind bereits Teil deines Status.'},
  hon:{summary:'First Class Lounge, First Class Check-in & Transferservice sind bereits Teil deines Status.'}
};

function benefitsActive(){
  const nav=q('#bottom [data-view="card"]');
  if(nav?.classList.contains('active'))return true;
  return q('#app h1')?.textContent.trim()==='Vorteile';
}

function statusKey(){
  try{
    const key=String(state?.mmStatus||'none');
    return STATUS_COPY[key]?key:'none';
  }catch{return 'none';}
}

function statusCopy(){return STATUS_COPY[statusKey()]||STATUS_COPY.ftl;}

function shouldShow(){
  try{
    const p=state?.programs||{};
    return benefitsActive()&&!!p.mm&&!p.mr&&statusKey()!=='none';
  }catch{return false;}
}

function recommendationHtml(){
  const copy=statusCopy();
  return `<div class="v24s35-section" data-v24s35-mm-reco="1">
    <div class="v24s35-section-head"><h2>Mehr aus deinem Setup</h2><span>optional</span></div>
    <div class="v24s35-reco">
      <div class="v24s35-reco-eyebrow">PASSENDE ERGÄNZUNG · OPTIONAL</div>
      <h3>${copy.summary}</h3>
      <p>Was dein Miles-&-More-Status nicht automatisch ergänzt, sind andere Reisevorteile rund um Reisebudget, Restaurants oder Mobilität.</p>
      <div class="v24s35-reason">VAYQUO empfiehlt dir deshalb nicht noch einmal dieselben Statusvorteile, sondern prüft nur, ob zusätzliche Reisevorteile überhaupt zu dir passen.</div>
      <button type="button" class="v24s35-reco-btn" data-v24s35-mm-check>Prüfen, ob eine Ergänzung Sinn macht <span>→</span></button>
    </div>
  </div>`;
}

function openCheck(){
  if(typeof openModal!=='function')return;
  const copy=statusCopy();
  openModal('Passt diese Ergänzung zu dir?',`<div class="v24s35-reco-modal">
    <div class="v24s35-reco-modal-kicker">MEHR AUS DEINEM MILES & MORE</div>
    <h3>${copy.summary}</h3>
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
