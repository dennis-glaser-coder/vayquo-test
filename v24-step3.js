(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const OFFICIAL_SIXT_RIDE='https://www.sixt.de/ride/';
const AMEX_PARTNERPROGRAMS='https://www.americanexpress.de/partnerprogramme';

function safeSixtState(){
  try{
    const credits=(typeof state!=='undefined'&&state?.benefits)?Math.min(8,Math.max(0,Number(state.benefits.sixtCredits)||0)):null;
    const used=credits===null?null:credits*25;
    const open=credits===null?null:Math.max(0,200-used);
    let period='12 Monate ab Registrierung';
    if(typeof benefitPeriod==='function') period=benefitPeriod('sixt')||period;
    return {credits,used,open,period};
  }catch{return {credits:null,used:null,open:null,period:'12 Monate ab Registrierung'};}
}

function ensureSheet(){
  if(q('#v24s3-sheet'))return;
  document.body.insertAdjacentHTML('beforeend',`
    <div id="v24s3-backdrop" class="v24s3-backdrop"></div>
    <section id="v24s3-sheet" class="v24s3-sheet" role="dialog" aria-modal="true" aria-label="SIXT ride">
      <div class="v24s3-grab"></div>
      <div id="v24s3-content"></div>
    </section>`);
  q('#v24s3-backdrop').addEventListener('click',closeSheet);
}

function closeSheet(){
  q('#v24s3-backdrop')?.classList.remove('is-open');
  q('#v24s3-sheet')?.classList.remove('is-open');
}

function updateUsage(){
  closeSheet();
  setTimeout(()=>{
    try{
      if(typeof editVorteil==='function'){editVorteil('sixt');return;}
      if(typeof openV15BenefitSetup==='function'){openV15BenefitSetup();return;}
    }catch{}
  },120);
}

function openOfficial(){
  try{window.open(OFFICIAL_SIXT_RIDE,'_blank','noopener,noreferrer');}
  catch{location.href=OFFICIAL_SIXT_RIDE;}
}

function openActivation(){
  try{window.open(AMEX_PARTNERPROGRAMS,'_blank','noopener,noreferrer');}
  catch{location.href=AMEX_PARTNERPROGRAMS;}
}

function openSixt(){
  ensureSheet();
  const s=safeSixtState();
  const status=s.open===null
    ? `<div class="v24s3-status"><span>Dein Guthaben</span><strong>Stand in VAYQUO</strong><small>Die Nutzung kannst du hier direkt aktualisieren.</small></div>`
    : `<div class="v24s3-status"><span>Noch offen</span><strong>${s.open.toLocaleString('de-DE')} €</strong><small>${s.credits} von 8 Credits als genutzt markiert · ${s.period}</small></div>`;
  q('#v24s3-content').innerHTML=`
    <div class="v24s3-head">
      <div><div class="v24s3-kicker">PLATINUM · MOBILITÄT</div><h3>SIXT ride</h3></div>
      <button type="button" class="v24s3-close" aria-label="Schließen">×</button>
    </div>
    <div class="v24s3-status"><span>Vor der ersten Nutzung</span><strong>SIXT ride bei Amex aktivieren</strong><small>Einmal registrieren und bei SIXT dieselbe E-Mail-Adresse verwenden. VAYQUO kann die Aktivierung nicht automatisch prüfen.</small></div>
    <button type="button" class="v24s3-secondary" id="v24s3-activate">Aktivierung bei Amex prüfen <span>↗</span></button>
    ${status}
    <button type="button" class="v24s3-primary" id="v24s3-open">Fahrt bei SIXT ride suchen <span>↗</span></button>
    <button type="button" class="v24s3-secondary" id="v24s3-update">Nutzung aktualisieren</button>
    <p class="v24s3-note">Preise und Verfügbarkeit werden direkt bei SIXT geprüft. VAYQUO zeigt hier bewusst keine erfundenen Live-Daten.</p>`;
  q('.v24s3-close').addEventListener('click',closeSheet);
  q('#v24s3-activate').addEventListener('click',openActivation);
  q('#v24s3-open').addEventListener('click',openOfficial);
  q('#v24s3-update').addEventListener('click',updateUsage);
  q('#v24s3-backdrop').classList.add('is-open');
  q('#v24s3-sheet').classList.add('is-open');
}

function bindSixt(){
  const btn=q('#v23Sixt');
  if(!btn||btn.dataset.v24s3Bound)return;
  btn.dataset.v24s3Bound='1';
  btn.textContent='Fahrt planen →';
  const wrap=btn.closest('.v23-benefit-wrap')||btn;
  wrap.classList.add('v24s3-sixt-wrap');
  const handler=ev=>{
    if(ev.target.closest?.('#v24s3-sheet'))return;
    ev.preventDefault();ev.stopPropagation();
    openSixt();
  };
  wrap.addEventListener('click',handler,true);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;bindSixt();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();