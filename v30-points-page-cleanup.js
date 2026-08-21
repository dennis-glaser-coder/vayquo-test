(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let scheduled=false;

function pointsActive(){
 const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
 if(nav&&(/^points$/i.test(nav.dataset?.view||'')||/^Punkte$/i.test(txt(nav))))return true;
 return !!qa('#app h1,#app h2,main h1,main h2').find(el=>/^Punkte\s*&\s*Meilen$/i.test(txt(el)));
}

function ensureStyle(){
 if(q('#v30-points-cleanup-style'))return;
 const style=document.createElement('style');
 style.id='v30-points-cleanup-style';
 style.textContent=`
  #v24pb-panel.v30-points-balance{margin-top:14px!important;margin-bottom:20px!important}
  #v24pb-panel.v30-points-balance .v24pb-head{display:block!important}
  #v24pb-panel.v30-points-balance .v24pb-head>button{display:none!important}
  .v30-pb-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;margin:12px 0 0}
  .v30-pb-actions .v24pb-all,.v30-programs-manage{width:100%!important;min-height:42px!important;margin:0!important;border:1px solid rgba(21,35,32,.10)!important;border-radius:14px!important;background:#f1f2ee!important;color:#263a36!important;padding:0 12px!important;font:800 10.5px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;box-shadow:none!important}
  .v30-programs-manage{background:#fffdf9!important;color:#755f3e!important}
  .v30-points-filter-block{margin:10px 0 20px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
  .v30-points-filter-block [data-v30-filter-hide="1"]{display:none!important}
  .v30-points-filter-label{margin:0 2px 8px;color:#88724f;font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
  .v30-points-filter-row{margin:0!important}
  [data-v30-duplicate-balance="1"]{display:none!important}
  .v30-single-action{grid-template-columns:1fr!important}
  .v30-single-action>button:not([data-v30-duplicate-balance="1"]),.v30-single-action>a:not([data-v30-duplicate-balance="1"]){width:100%!important;max-width:none!important;flex:1 1 100%!important;grid-column:1/-1!important}
  @media(max-width:360px){.v30-pb-actions{grid-template-columns:1fr}}
 `;
 document.head.appendChild(style);
}

function pageHeading(){
 return qa('#app h1,#app h2,main h1,main h2').find(el=>/^Punkte\s*&\s*Meilen$/i.test(txt(el)))||null;
}

function headingAnchor(heading){
 if(!heading)return null;
 let best=heading;
 let node=heading.parentElement;
 for(let i=0;i<4&&node&&node.id!=='app';i++,node=node.parentElement){
  const t=txt(node);
  if(t.length>240||/Deine Programme|Deine aktuellen Punktestände|Membership Rewards|PAYBACK/.test(t))break;
  best=node;
 }
 return best;
}

function moveBalanceBelowTitle(){
 const panel=q('#v24pb-panel');
 const heading=pageHeading();
 if(!panel||!heading)return;
 const anchor=headingAnchor(heading);
 if(!anchor?.parentElement)return;
 if(anchor.nextElementSibling!==panel)anchor.insertAdjacentElement('afterend',panel);
 panel.classList.add('v30-points-balance');
 const kicker=q('.v24pb-head span',panel),title=q('.v24pb-head h2',panel),copy=q('.v24pb-head p',panel);
 if(kicker)kicker.textContent='AKTUELLE STÄNDE';
 if(title)title.textContent='Deine Bestände';
 if(copy)copy.textContent='Diese Stände nutzt VAYQUO für deine Auswertungen.';
}

function exactControl(label){
 return qa('#app button,#app a,#app [role="button"]').find(el=>txt(el)===label&&!el.classList.contains('v30-programs-manage'))||null;
}

function sourceManageButton(){return exactControl('Programme ändern');}

function ensureBalanceActions(){
 const panel=q('#v24pb-panel');if(!panel)return;
 const head=q('.v24pb-head',panel);if(!head)return;
 let actions=q('.v30-pb-actions',panel);
 if(!actions){actions=document.createElement('div');actions.className='v30-pb-actions';head.insertAdjacentElement('afterend',actions);}
 const all=q('#v24pb-all',panel);
 if(all&&all.parentElement!==actions)actions.appendChild(all);
 let manage=q('.v30-programs-manage',actions);
 if(!manage){
  manage=document.createElement('button');manage.type='button';manage.className='v30-programs-manage';manage.textContent='Programme verwalten';
  manage.addEventListener('click',()=>{
   const source=sourceManageButton();
   if(source){source.click();return;}
   try{typeof toast==='function'&&toast('Programmverwaltung gerade nicht verfügbar');}catch{}
  });
  actions.appendChild(manage);
 }
}

function commonParent(nodes){
 if(!nodes.length)return null;
 let node=nodes[0].parentElement;
 while(node&&node.id!=='app'){
  if(nodes.every(x=>node.contains(x)))return node;
  node=node.parentElement;
 }
 return null;
}

function simplifyProgramFilter(){
 const manage=sourceManageButton();
 const controls=qa('#app button,#app a,#app [role="button"]');
 const wanted=['Amex','PAYBACK','Alle'].map(label=>controls.find(el=>txt(el)===label)).filter(Boolean);
 if(wanted.length<2)return;
 const row=commonParent(wanted);if(!row)return;
 row.classList.add('v30-points-filter-row');
 let block=row;
 for(let i=0;i<5&&block.parentElement&&block.parentElement.id!=='app';i++){
  const parent=block.parentElement;
  const t=txt(parent);
  if(/Deine Programme/.test(t)&&(/Programme ändern/.test(t)||/Antippen und direkt filtern/.test(t))){block=parent;break;}
  block=parent;
 }
 block.classList.add('v30-points-filter-block');
 qa('*',block).filter(el=>el.children.length===0).forEach(el=>{
  const t=txt(el);
  if(t==='Deine Programme'||t==='Antippen und direkt filtern')el.dataset.v30FilterHide='1';
 });
 if(manage){manage.dataset.v30FilterHide='1';manage.setAttribute('aria-hidden','true');manage.tabIndex=-1;}
 let label=q('.v30-points-filter-label',block);
 if(!label){label=document.createElement('div');label.className='v30-points-filter-label';label.textContent='Anzeigen';row.insertAdjacentElement('beforebegin',label);}
}

function hideDuplicateBalanceActions(){
 qa('#app button,#app a,#app [role="button"]').forEach(el=>{
  if(txt(el)!=='Bestand ändern')return;
  el.dataset.v30DuplicateBalance='1';
  el.setAttribute('aria-hidden','true');
  el.tabIndex=-1;
  const parent=el.parentElement;
  if(parent&&qa('button,a,[role="button"]',parent).some(x=>x!==el&&txt(x)==='Punkte sinnvoll einsetzen'))parent.classList.add('v30-single-action');
 });
}

function apply(){
 if(!pointsActive())return;
 ensureStyle();
 moveBalanceBelowTitle();
 simplifyProgramFilter();
 ensureBalanceActions();
 hideDuplicateBalanceActions();
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO points cleanup',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();
