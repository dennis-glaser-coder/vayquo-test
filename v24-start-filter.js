(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const exact=(el,text)=>(el?.textContent||'').trim()===text;

const PROGRAMS=[
  {key:'mr',label:'Amex'},
  {key:'pb',label:'PAYBACK'},
  {key:'mm',label:'Miles & More'}
];

const HERO={
  mr:{kicker:'AMERICAN EXPRESS',title:'Vorteile nicht nur haben. Auch nutzen.',body:'VAYQUO zeigt dir, welche deiner Kartenvorteile du jetzt nutzen kannst.',cta:'Vorteile ansehen',action:'benefits'},
  pb:{kicker:'PAYBACK',title:'Punkte nicht nur sammeln. Mehr daraus machen.',body:'VAYQUO zeigt dir, was deine PAYBACK Punkte wert sind und wie du sie sinnvoll nutzt.',cta:'PAYBACK nutzen',action:'payback'},
  mm:{kicker:'MILES & MORE',title:'Meilen nicht nur sammeln. Besser einsetzen.',body:'VAYQUO zeigt dir, wie du deine Meilen und deinen Status sinnvoll nutzt.',cta:'Miles & More nutzen',action:'miles'},
  multi:{kicker:'DEIN VAYQUO SETUP',title:'Alles, was du nutzt. An einem Ort.',body:'VAYQUO berücksichtigt dein komplettes Setup und zeigt dir, was sich jetzt für dich lohnt.',cta:'Was lohnt sich?',action:'overview'},
  empty:{kicker:'VAYQUO',title:'Dein Setup fehlt noch.',body:'Hinterlege deine Programme, damit VAYQUO passende Punkte, Meilen und Vorteile zeigen kann.',cta:'Programme hinzufügen',action:'manage'}
};

const KNOWN_KICKERS=new Set(['AMERICAN EXPRESS','PAYBACK','MILES & MORE','DEIN VAYQUO SETUP','VAYQUO']);
const KNOWN_TITLES=new Set(Object.values(HERO).map(x=>x.title));
const KNOWN_BODIES=new Set(Object.values(HERO).map(x=>x.body));
const KNOWN_CTAS=new Set(Object.values(HERO).map(x=>x.cta));

function ensureStyle(){
  if(q('#v24sp-style'))return;
  const style=document.createElement('style');
  style.id='v24sp-style';
  style.textContent=`
    [data-v24sp-row]{display:flex!important;flex-wrap:wrap!important;gap:9px!important;padding:8px!important;align-items:center!important}
    [data-v24sp-row] .v24sp-chip{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 15px;border-radius:14px;background:#171819;color:#f7f2e9;font-size:14px;font-weight:760;line-height:1;box-sizing:border-box;white-space:nowrap}
    [data-v24sp-row] .v24sp-chip:before{content:'✓';font-size:12px;color:#d8bd84;font-weight:800}
    [data-v24sp-row] .v24sp-empty{display:flex;align-items:center;min-height:42px;padding:0 12px;color:#8d918e;font-size:13px;font-weight:650}
    @media(max-width:420px){[data-v24sp-row] .v24sp-chip{font-size:13px;padding:0 13px}}
  `;
  document.head.appendChild(style);
}

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test((active.textContent||'').trim()))return true;
  return qa('#app *').some(el=>exact(el,'Was möchtest du tun?'))&&qa('#app *').some(el=>exact(el,'Deine Programme'));
}

function selectedPrograms(){
  let programs={};
  try{programs=(typeof state!=='undefined'&&state?.programs)||{};}catch{}
  return PROGRAMS.filter(p=>!!programs[p.key]);
}

function findProgramBox(){
  const heading=qa('#app *').find(el=>exact(el,'Deine Programme'));
  if(!heading)return null;
  let node=heading.parentElement;
  const app=q('#app');
  while(node&&node!==app){
    const text=node.textContent||'';
    if(/Ändern/.test(text)&&(/Amex|PAYBACK|Alle|Miles & More/.test(text)||q('[data-v24sp-row]',node)))return node;
    node=node.parentElement;
  }
  return heading.parentElement;
}

function findProgramRow(box){
  if(!box)return null;
  const existing=q('[data-v24sp-row]',box);if(existing)return existing;
  const leaves=qa('*',box).filter(el=>el.children.length===0);
  const old=leaves.filter(el=>['Amex','PAYBACK','Alle','Miles & More'].includes((el.textContent||'').trim()));
  if(!old.length)return null;
  let node=old[0].parentElement;
  while(node&&node!==box){
    const text=node.textContent||'';
    const count=['Amex','PAYBACK','Alle'].filter(x=>text.includes(x)).length;
    if(count>=2)return node;
    node=node.parentElement;
  }
  return old[0].parentElement;
}

function renderPrograms(){
  const box=findProgramBox();
  const row=findProgramRow(box);if(!row)return;
  const active=selectedPrograms();
  row.dataset.v24spRow='1';
  row.setAttribute('aria-label','In VAYQUO aktive Programme');
  const sig=active.map(p=>p.key).join(',')||'empty';
  if(row.dataset.v24spSig===sig)return;
  row.dataset.v24spSig=sig;
  row.innerHTML=active.length
    ?active.map(p=>`<span class="v24sp-chip" data-v24sp-program="${p.key}">${p.label}</span>`).join('')
    :'<span class="v24sp-empty">Noch kein Programm hinterlegt</span>';
}

function leafWith(set,root){return qa('*',root).find(el=>el.children.length===0&&set.has((el.textContent||'').trim()));}

function findHero(){
  const app=q('#app');if(!app)return null;
  const kickers=qa('*',app).filter(el=>el.children.length===0&&KNOWN_KICKERS.has((el.textContent||'').trim()));
  for(const kicker of kickers){
    let node=kicker.parentElement;
    while(node&&node!==app){
      const leaves=qa('*',node).filter(el=>el.children.length===0);
      const hasWhy=leaves.some(el=>/^Warum\?$/i.test((el.textContent||'').trim()));
      const hasBody=leaves.some(el=>KNOWN_BODIES.has((el.textContent||'').trim()));
      if(hasWhy&&hasBody)return node;
      node=node.parentElement;
    }
  }
  return null;
}

function restoreToday(){
  const app=q('#app');if(!app)return;
  const date=qa('*',app).find(el=>el.children.length===0&&/^\d{1,2}\.\s+[A-Za-zÄÖÜäöü]{3,}\.?$/.test((el.textContent||'').trim()));
  if(!date)return;
  let node=date.parentElement;
  for(let i=0;i<4&&node&&node!==app;i++,node=node.parentElement){
    const candidate=qa('*',node).find(el=>el.children.length===0&&el!==date&&KNOWN_TITLES.has((el.textContent||'').trim()));
    if(candidate){if(candidate.textContent!=='Heute')candidate.textContent='Heute';break;}
  }
}

function heroMode(){
  const active=selectedPrograms();
  if(active.length===0)return HERO.empty;
  if(active.length===1)return HERO[active[0].key]||HERO.multi;
  return HERO.multi;
}

function renderHero(){
  const hero=findHero();if(!hero)return;
  const copy=heroMode();
  const kicker=leafWith(KNOWN_KICKERS,hero);
  const title=leafWith(KNOWN_TITLES,hero);
  const body=leafWith(KNOWN_BODIES,hero);
  const leaves=qa('*',hero).filter(el=>el.children.length===0);
  const why=leaves.find(el=>/^Warum\?$/i.test((el.textContent||'').trim()));
  const cta=leaves.find(el=>KNOWN_CTAS.has((el.textContent||'').trim()))||leaves.find(el=>el!==why&&/ansehen|nutzen|lohnt|hinzufügen/i.test((el.textContent||'').trim()));
  if(kicker&&kicker.textContent!==copy.kicker)kicker.textContent=copy.kicker;
  if(title&&title.textContent!==copy.title)title.textContent=copy.title;
  if(body&&body.textContent!==copy.body)body.textContent=copy.body;
  if(cta){
    if(cta.textContent!==copy.cta)cta.textContent=copy.cta;
    const clickTarget=cta.closest?.('button,[role="button"],a')||cta;
    clickTarget.dataset.v24spAction=copy.action;
  }
}

function triggerBottom(label){
  const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>new RegExp('^'+label+'$','i').test((el.textContent||'').trim()));
  nav?.click();
}

function handleAction(action){
  if(action==='benefits'){triggerBottom('Vorteile');return;}
  if(action==='payback'){
    if(typeof go==='function')go('optimize','payback');else triggerBottom('Punkte');
    return;
  }
  if(action==='miles'){
    if(typeof go==='function')go('optimize','flight');else triggerBottom('Prüfen');
    return;
  }
  if(action==='overview'){
    qa('#app *').find(el=>exact(el,'Was möchtest du tun?'))?.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if(action==='manage'){
    const box=findProgramBox();
    const btn=qa('button,[role="button"],a',box||document).find(el=>/Ändern/i.test((el.textContent||'').trim()));
    btn?.click();
  }
}

document.addEventListener('click',ev=>{
  if(!startActive())return;
  const target=ev.target.closest?.('[data-v24sp-action]');if(!target)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  handleAction(target.dataset.v24spAction);
},true);

function apply(){
  if(!startActive())return;
  ensureStyle();
  restoreToday();
  renderPrograms();
  renderHero();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO start setup',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
