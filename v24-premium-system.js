(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let scheduled=false;

function activeView(){
 const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 const raw=String(active?.dataset?.view||text(active)||'').toLowerCase();
 if(raw.includes('start'))return 'start';
 if(raw.includes('point')||raw.includes('punkte'))return 'points';
 if(raw.includes('check')||raw.includes('prüfen')||raw.includes('optimize'))return 'check';
 if(raw.includes('card')||raw.includes('vorteil'))return 'benefits';
 const heading=qa('#app h1,#app h2,main h1,main h2').map(text);
 if(heading.some(x=>/^punkte$/i.test(x)))return 'points';
 if(heading.some(x=>/^vorteile$/i.test(x)))return 'benefits';
 if(q('#fFrom')&&q('#fTo'))return 'check';
 if(qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme'))return 'start';
 return '';
}

function commonSearchRoot(){
 const from=q('#fFrom'),to=q('#fTo'),cabin=q('#fCabin'),cash=q('#fCash');
 if(!from||!to||!cabin||!cash)return null;
 let node=cash.parentElement;
 for(let i=0;i<10&&node&&node!==document.body;i++,node=node.parentElement){
  if(node.id==='app'||node.tagName==='MAIN')continue;
  if(node.contains(from)&&node.contains(to)&&node.contains(cabin)&&node.querySelector('button'))return node;
 }
 return null;
}

function markStart(){
 const heading=qa('#app *').find(el=>el.children.length===0&&text(el)==='Deine Programme');
 if(!heading)return;
 let node=heading.parentElement;
 for(let i=0;i<7&&node&&node!==q('#app');i++,node=node.parentElement){
  if(/Ändern/.test(text(node))){node.classList.add('v24premium-start-programs');break;}
 }
}

function markSearch(){
 const root=commonSearchRoot();
 if(root)root.classList.add('v24premium-search');
 const date=q('#fDate,#fDepartureDate,#flightDate');
 date?.closest('.field')?.classList.add('v24premium-date-field');
 q('#fCabin')?.closest('.field')?.classList.add('v24premium-cabin-field');
 const btn=root?qa('button,[role="button"]',root).find(el=>/^(Flüge suchen|Jetzt prüfen)$/i.test(text(el))):null;
 btn?.classList.add('v24premium-primary');
 q('#vayquo-flight-optimizer')?.classList.add('v24premium-result-card');
}

function markPoints(){
 q('#v24pb-panel')?.classList.add('v24premium-surface');
 qa('.v24pb-card').forEach(el=>el.classList.add('v24premium-inner-card'));
}

function markBenefits(){
 qa('.v24s35-source-card,.v24s35-reco').forEach(el=>el.classList.add('v24premium-surface'));
 q('.v24s35-setup')?.classList.add('v24premium-setup');
}

function markSheets(){
 qa('.v24s2-info-sheet,.v24s2-airport-sheet,.v24s3-sheet').forEach(el=>el.classList.add('v24premium-sheet'));
}

function apply(){
 const view=activeView();
 if(view)document.documentElement.dataset.vayquoView=view;
 markStart();
 markSearch();
 markPoints();
 markBenefits();
 markSheets();
}

function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO premium UI',e);}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',ev=>{
 const travellers=q('#vayquo-travellers');
 if(travellers?.open&&!ev.target.closest?.('#vayquo-travellers'))travellers.open=false;
 setTimeout(schedule,0);
});
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();

(()=>{
 const css=document.createElement('link');
 css.rel='stylesheet';css.href='v24-benchmark-b.css?v=2401';
 document.head.appendChild(css);
 const js=document.createElement('script');
 js.src='v24-benchmark-b.js?v=2401';
 document.body.appendChild(js);
})();
