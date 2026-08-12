(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
let scheduled=false;

function leafByText(value,root=document){
  return qa('*',root).find(el=>el.children.length===0&&norm(el.textContent)===value)||null;
}
function visualCardFor(value){
  const leaf=leafByText(value,q('#app')||document); if(!leaf)return null;
  let node=leaf;
  for(let i=0;i<8&&node&&node!==document.body;i++,node=node.parentElement){
    const r=node.getBoundingClientRect?.();
    if(r&&r.width>240&&r.height>=64&&r.height<260)return node;
  }
  return leaf.parentElement;
}
function lowestCommon(nodes){
  const live=nodes.filter(Boolean); if(!live.length)return null;
  let p=live[0].parentElement;
  while(p&&p!==document.body){if(live.every(n=>p.contains(n)))return p;p=p.parentElement;}
  return null;
}
function activeView(){
  const stored=document.documentElement.dataset.vayquoView;
  if(stored)return stored;
  const active=qa('.bottom .nav,#bottom .nav,[data-view]').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  const t=norm(active?.textContent).toLowerCase();
  if(t.includes('start'))return 'start'; if(t.includes('prüfen'))return 'check'; if(t.includes('punkte'))return 'points'; if(t.includes('vorteile'))return 'benefits';
  return '';
}

function markCheck(){
  const labels=['Flug mit Punkten prüfen','Transferbedarf prüfen','Cash oder Punkte?','Punkte bei Partnern'];
  const cards=labels.map(visualCardFor);
  if(cards.filter(Boolean).length<3)return;
  const parent=lowestCommon(cards);
  parent?.classList.add('v24b-check-stack');
  cards[0]?.classList.add('v24b-check-primary');
  cards.slice(1).forEach((card,i)=>{card?.classList.add('v24b-check-secondary');card?.setAttribute('data-v24b-order',String(i+1));});
  const transfer=leafByText('Punkte bei Partnern');
  if(transfer){transfer.textContent='Transferwerte';transfer.dataset.v24bRenamed='1';}
  const cash=leafByText('Cash oder Punkte?');
  if(cash){cash.textContent='Buchung vergleichen';cash.dataset.v24bRenamed='1';}
}

function markPoints(){
  const panel=q('#v24pb-panel');
  if(panel){
    panel.classList.add('v24b-points-overview');
    const h=panel.querySelector('h2'); if(h&&/Punktestände/i.test(norm(h.textContent)))h.textContent='Punkte & Meilen';
    const p=panel.querySelector('.v24pb-head p'); if(p)p.textContent='Die Bestände, mit denen VAYQUO deine besten Wege berechnet.';
  }
  const title=leafByText('Punkte & Meilen');
  if(title&&!panel?.contains(title)){
    let wrap=title.parentElement;
    for(let i=0;i<3&&wrap?.parentElement;i++){
      if(/DEINE BESTÄNDE/i.test(norm(wrap.textContent))||wrap.querySelector?.('h1,h2'))break;
      wrap=wrap.parentElement;
    }
    wrap?.classList.add('v24b-hide-duplicate-heading');
  }
  const programs=visualCardFor('Deine Programme');
  programs?.classList.add('v24b-programs-compact');
  qa('.v24s35-source-card').forEach(c=>c.classList.add('v24b-points-action-card'));
}

function markBenefits(){
  const hero=visualCardFor('Bis zu 650 €');
  hero?.classList.add('v24b-benefits-hero');
  const setup=visualCardFor('DEIN SETUP')||q('.v24s35-setup');
  setup?.classList.add('v24b-benefits-setup');
  const direct=leafByText('Guthaben direkt nutzen');
  if(direct){direct.textContent='Deine Guthaben';direct.classList.add('v24b-benefits-section-title');}
  const update=leafByText('Nutzung aktualisieren');
  update?.closest('button,a,[role="button"]')?.classList.add('v24b-benefits-update');
  const init=leafByText('Nutzung einrichten');
  init?.closest('button,a,[role="button"]')?.classList.add('v24b-benefits-init');
}

function markStart(){
  q('.v24premium-hero')?.classList.add('v24b-start-hero');
  const claim=qa('#app h1,#app h2,#app h3,.v24hero-intro strong').find(el=>/Nicht einfach Punkte haben/i.test(norm(el.textContent)));
  claim?.classList.add('v24b-start-claim');
  const programs=visualCardFor('Deine Programme');
  programs?.classList.add('v24b-start-programs');
}

function apply(){
  document.documentElement.dataset.v24Benchmark='b';
  const view=activeView();
  if(view==='check')markCheck();
  if(view==='points')markPoints();
  if(view==='benefits')markBenefits();
  if(view==='start')markStart();
}
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO benchmark B',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
