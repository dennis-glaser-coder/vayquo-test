(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const PAYBACK_AMEX_URL='https://www.americanexpress.com/de-de/kreditkarte/payback-karte/';

function benefitsActive(){
  const nav=q('#bottom [data-view="card"]');
  if(nav?.classList.contains('active'))return true;
  return q('#app h1')?.textContent.trim()==='Vorteile';
}

function openPaybackRecommendation(){
  if(typeof openModal!=='function')return;
  openModal('Passt diese Ergänzung zu dir?',`<div class="v24s35-reco-modal">
    <div class="v24s35-reco-modal-kicker">MEHR AUS DEINEM PAYBACK</div>
    <h3>Mehr Punkte aus deinen normalen Ausgaben holen.</h3>
    <p>Du nutzt PAYBACK bereits. Mit der PAYBACK American Express Karte kannst du zusätzlich PAYBACK Punkte sammeln, wenn du mit der Karte bezahlst.</p>
    <div class="v24s35-reco-check">
      <span>✓ dein bestehendes PAYBACK Konto bleibt die Basis</span>
      <span>✓ zusätzliche PAYBACK Punkte bei Kartenzahlungen</span>
      <span>✓ dauerhaft keine Jahresgebühr</span>
    </div>
    <div class="v24s35-reco-disclosure">So ergänzt die Karte dein vorhandenes PAYBACK Setup, ohne dass du ein neues Punkteprogramm brauchst. Für Punktegutschriften und Kartennutzung gelten die Bedingungen von American Express.</div>
    <button class="btn" id="v24s35-payback-out">Vorteile der PAYBACK Amex ansehen ↗</button>
  </div>`);
  q('#v24s35-payback-out')?.addEventListener('click',()=>{
    try{window.open(PAYBACK_AMEX_URL,'_blank','noopener,noreferrer');}
    catch{location.href=PAYBACK_AMEX_URL;}
  });
}

document.addEventListener('click',ev=>{
  if(!benefitsActive())return;
  const hit=ev.target.closest?.('[data-v24s35-reco="payback-amex"]');
  if(!hit)return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  openPaybackRecommendation();
},true);
})();
