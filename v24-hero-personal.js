(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const BRAND_TITLE='Nicht einfach Punkte haben. Das Maximum daraus machen.';
const CTA_COPY='Beste Nutzung finden';
const META_KEY='vayquo:balanceMeta';

const PROGRAMS={
  mr:{label:'Membership Rewards',unit:'Punkte',mono:'MR',kicker:'MEMBERSHIP REWARDS'},
  pb:{label:'PAYBACK',unit:'Punkte',mono:'PB',kicker:'PAYBACK'},
  mm:{label:'Miles & More',unit:'Meilen',mono:'M&M',kicker:'MILES & MORE'}
};
const KNOWN_KICKERS=new Set(['MEMBERSHIP REWARDS','AMERICAN EXPRESS','PAYBACK','MILES & MORE','DEIN VAYQUO SETUP','VAYQUO']);

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function fmt(n){return new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));}
function programs(){try{return (typeof state!=='undefined'&&state?.programs)||{};}catch{return {};}}
function balance(id){try{return Math.max(0,Math.round(Number(state?.balances?.[id])||0));}catch{return 0;}}
function readMeta(){try{const v=JSON.parse(localStorage.getItem(META_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function known(id){const meta=readMeta();return meta[id]?.known===true||balance(id)>0;}
function activePrograms(){const p=programs();return Object.keys(PROGRAMS).filter(id=>!!p[id]);}
function ownsPlatinum(){try{return !!programs().mr&&state?.card==='platinum';}catch{return false;}}

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test(text(active)))return true;
  return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}

function findHero(){
  const app=q('#app');if(!app)return null;
  const why=qa('button,a,[role="button"]',app).find(el=>/^Warum\?$/i.test(text(el)));
  if(!why)return null;
  let node=why.parentElement;
  for(let i=0;i<8&&node&&node!==app;i++,node=node.parentElement){
    const controls=qa('button,a,[role="button"]',node);
    const heading=q('h1,h2,h3',node);
    if(heading&&controls.length>=2)return node;
  }
  return null;
}

function heroKicker(){
  const active=activePrograms();
  if(active.length===1)return PROGRAMS[active[0]].kicker;
  if(active.length>1)return 'DEIN VAYQUO SETUP';
  return 'VAYQUO';
}

function singleHeroCopy(id){
  const p=PROGRAMS[id];
  if(!known(id))return `Dein ${p.label}-Stand fehlt noch. Ergänze ihn für eine vollständige VAYQUO-Auswertung.`;
  return `${fmt(balance(id))} ${p.label}${id==='pb'?' Punkte':id==='mm'?' Meilen':''} sind hinterlegt. Finde heraus, welche Nutzung zu deinem Setup am besten passt.`;
}

function heroCopy(){
  const active=activePrograms();
  if(!active.length)return 'Wähle deine Programme aus, damit VAYQUO dein Setup auswerten kann.';
  if(active.length===1)return singleHeroCopy(active[0]);

  const missing=active.filter(id=>!known(id));
  if(missing.length===1)return `${active.length} Programme sind hinterlegt. Für eine vollständige Auswertung fehlt noch ein aktueller Stand.`;
  if(missing.length>1)return `${active.length} Programme sind hinterlegt. Für eine vollständige Auswertung fehlen noch ${missing.length} aktuelle Stände.`;
  return `${active.length} Programme sind hinterlegt. VAYQUO führt deine Punkte, Meilen und Vorteile in einer Auswertung zusammen.`;
}

function findTitle(hero){
  return qa('h1,h2,h3',hero).find(el=>!el.closest('button,a,[role="button"]'))||null;
}

function findKicker(hero,title){
  const exact=qa('*',hero).find(el=>el.children.length===0&&el!==title&&KNOWN_KICKERS.has(text(el)));
  if(exact)return exact;
  return qa('*',hero).find(el=>{
    if(el.children.length!==0||el===title||el.closest('button,a,[role="button"]'))return false;
    const t=text(el);
    return t.length>1&&t.length<=28&&t===t.toUpperCase()&&/[A-ZÄÖÜ]/.test(t);
  })||null;
}

function findBody(hero,title,kicker){
  const paragraphs=qa('p',hero).filter(el=>el!==title&&el!==kicker&&!el.closest('button,a,[role="button"]')&&text(el).length>=20&&text(el).length<=320);
  if(paragraphs.length)return paragraphs.sort((a,b)=>text(b).length-text(a).length)[0];
  const candidates=qa('*',hero).filter(el=>{
    if(el.children.length!==0||el===title||el===kicker)return false;
    if(el.matches('h1,h2,h3,h4,h5,h6')||el.closest('button,a,[role="button"]'))return false;
    const t=text(el);
    if(!t||/^Warum\?$/i.test(t)||KNOWN_KICKERS.has(t))return false;
    return t.length>=20&&t.length<=320;
  });
  return candidates.sort((a,b)=>text(b).length-text(a).length)[0]||null;
}

function findPrimary(hero){
  return qa('button,a,[role="button"]',hero).find(el=>!/^Warum\?$/i.test(text(el)))||null;
}

function ensureStyle(){
  if(q('#v24hero-style'))return;
  const style=document.createElement('style');
  style.id='v24hero-style';
  style.textContent=`
    .v24hero-eval{display:grid;gap:12px}
    .v24hero-intro{padding:2px 0 4px}
    .v24hero-intro small{display:block;font-size:9px;letter-spacing:.14em;font-weight:850;color:#8a7451}
    .v24hero-intro strong{display:block;margin-top:5px;font-size:20px;line-height:1.15;letter-spacing:-.025em;color:#171819}
    .v24hero-intro p{margin:7px 0 0;font-size:12px;line-height:1.5;color:#68706d}
    .v24hero-status{display:flex;flex-wrap:wrap;gap:7px}
    .v24hero-status span{display:inline-flex;align-items:center;min-height:28px;padding:0 9px;border-radius:999px;background:#f1f3ef;color:#59635f;font-size:10px;font-weight:750}
    .v24hero-status span.missing{background:#f7f2e9;color:#806a47}
    .v24hero-list{display:grid;gap:9px}
    .v24hero-option{width:100%;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:11px;padding:12px;border:1px solid rgba(19,35,32,.11);border-radius:15px;background:#fff;color:#171819;text-align:left;cursor:pointer;font:inherit}
    .v24hero-option:active{transform:scale(.995)}
    .v24hero-mono{width:42px;height:42px;border-radius:12px;background:#f1f3ef;display:grid;place-items:center;font-size:10px;font-weight:850;color:#314642}
    .v24hero-option.missing .v24hero-mono{background:#f7f2e9;color:#806a47}
    .v24hero-copy{min-width:0}
    .v24hero-copy small{display:block;font-size:8px;letter-spacing:.1em;font-weight:850;color:#8a918e}
    .v24hero-copy strong{display:block;margin-top:3px;font-size:13px;line-height:1.25;color:#171819}
    .v24hero-copy span{display:block;margin-top:4px;font-size:10px;line-height:1.4;color:#69726f}
    .v24hero-arrow{font-size:18px;color:#8c9491}
    .v24hero-note{font-size:9px;line-height:1.45;color:#89918e;text-align:center;padding:1px 6px}
  `;
  document.head.appendChild(style);
}

function statusHtml(){
  return activePrograms().map(id=>{
    const p=PROGRAMS[id];
    const isKnown=known(id);
    const value=isKnown?`${fmt(balance(id))} ${p.unit}`:'Stand fehlt';
    return `<span class="${isKnown?'':'missing'}">${p.mono} · ${value}</span>`;
  }).join('');
}

function options(){
  const active=activePrograms();
  const items=[];

  active.filter(id=>!known(id)).forEach(id=>{
    const p=PROGRAMS[id];
    items.push({
      kind:'balance',program:id,mono:p.mono,eyebrow:'SETUP VERVOLLSTÄNDIGEN',
      title:`${p.label}-Stand ergänzen`,
      body:`Ergänze deinen aktuellen ${p.unit.toLowerCase()}stand, damit VAYQUO das Programm vollständig berücksichtigen kann.`,
      missing:true
    });
  });

  if(active.includes('mr')&&known('mr')&&balance('mr')>0){
    items.push({
      kind:'mr',mono:'MR',eyebrow:'MEMBERSHIP REWARDS',
      title:'Punkte gezielt einsetzen',
      body:'Prüfe Transfer- und Einsatzmöglichkeiten für deine Membership Rewards.'
    });
  }

  if(active.includes('pb')&&known('pb')&&balance('pb')>0){
    items.push({
      kind:'payback',mono:'PB',eyebrow:'PAYBACK',
      title:'PAYBACK sinnvoll einsetzen',
      body:'Prüfe, welche der vorhandenen Einsatzmöglichkeiten zu deinem Setup passt.'
    });
  }

  if(active.includes('mm')&&known('mm')&&balance('mm')>0){
    items.push({
      kind:'flight',mono:'M&M',eyebrow:'MILES & MORE',
      title:'Meilen für einen Flug prüfen',
      body:'Vergleiche einen konkreten Prämienflug mit dem Barpreis und deinem Meileneinsatz.'
    });
  }

  if(ownsPlatinum()){
    items.push({
      kind:'benefits',mono:'AX',eyebrow:'PLATINUM',
      title:'Kartenvorteile nutzen',
      body:'Reiseguthaben, Restaurantguthaben, SIXT ride und Lounge-Zugang gebündelt ansehen.'
    });
  }

  if(!items.length){
    items.push({
      kind:'points',mono:'↻',eyebrow:'AKTUELLER STAND',
      title:'Punktestände aktualisieren',
      body:'Prüfe deine hinterlegten Stände, bevor VAYQUO weitere Einsatzmöglichkeiten bewertet.'
    });
  }
  return items;
}

function optionHtml(item){
  return `<button type="button" class="v24hero-option${item.missing?' missing':''}" data-v24hero-action="${item.kind}"${item.program?` data-v24hero-program="${item.program}"`:''}>
    <span class="v24hero-mono">${item.mono}</span>
    <span class="v24hero-copy"><small>${item.eyebrow}</small><strong>${item.title}</strong><span>${item.body}</span></span>
    <span class="v24hero-arrow">›</span>
  </button>`;
}

function openEvaluation(){
  if(typeof openModal!=='function')return;
  ensureStyle();
  const active=activePrograms();
  const missing=active.filter(id=>!known(id)).length;
  const intro=missing
    ?'Ein Teil deines Setups ist noch unvollständig. Du kannst fehlende Stände ergänzen oder bereits verfügbare Möglichkeiten öffnen.'
    :'VAYQUO zeigt dir nur Möglichkeiten, die sich aus deinem aktuell hinterlegten Setup ableiten lassen.';
  openModal('Beste Nutzung finden',`<div class="v24hero-eval">
    <div class="v24hero-intro"><small>VAYQUO-AUSWERTUNG</small><strong>Deine Möglichkeiten</strong><p>${intro}</p></div>
    <div class="v24hero-status">${statusHtml()}</div>
    <div class="v24hero-list">${options().map(optionHtml).join('')}</div>
    <div class="v24hero-note">Keine automatische Kontosynchronisierung · Grundlage sind deine in VAYQUO hinterlegten Daten.</div>
  </div>`);
  qa('[data-v24hero-action]').forEach(btn=>btn.addEventListener('click',()=>runAction(btn)));
}

function triggerBottom(label){
  const nav=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>new RegExp('^'+label+'$','i').test(text(el)));
  nav?.click();
}

function openBalance(id){
  triggerBottom('Punkte');
  let tries=0;
  const open=()=>{
    const btn=q(`[data-v24pb-edit="${id}"]`);
    if(btn){btn.click();return;}
    if(++tries<10)setTimeout(open,80);
  };
  setTimeout(open,50);
}

function runAction(btn){
  const kind=btn.dataset.v24heroAction;
  const program=btn.dataset.v24heroProgram;
  try{if(typeof closeModal==='function')closeModal();}catch{}
  setTimeout(()=>{
    if(kind==='balance'){openBalance(program);return;}
    if(kind==='points'){triggerBottom('Punkte');return;}
    if(kind==='benefits'){triggerBottom('Vorteile');return;}
    if(kind==='payback'){
      try{if(typeof go==='function'){go('optimize','payback');return;}}catch{}
      triggerBottom('Punkte');return;
    }
    if(kind==='mr'){
      try{if(typeof go==='function'){go('optimize','transfer');return;}}catch{}
      triggerBottom('Prüfen');return;
    }
    if(kind==='flight'){
      try{if(typeof go==='function'){go('optimize','flight');return;}}catch{}
      triggerBottom('Prüfen');
    }
  },70);
}

function bindPrimary(primary){
  primary.removeAttribute('data-v24sp-action');
  primary.dataset.v24heroOpen='1';
  if(primary.dataset.v24heroBound==='1')return;
  primary.dataset.v24heroBound='1';
  primary.addEventListener('click',ev=>{
    ev.preventDefault();
    ev.stopImmediatePropagation();
    openEvaluation();
  },true);
}

function render(){
  q('#v24na-card')?.remove();
  if(!startActive())return;
  const hero=findHero();if(!hero)return;
  const title=findTitle(hero);
  const kicker=findKicker(hero,title);
  const body=findBody(hero,title,kicker);
  const primary=findPrimary(hero);

  if(kicker&&text(kicker)!==heroKicker())kicker.textContent=heroKicker();
  if(title&&text(title)!==BRAND_TITLE)title.textContent=BRAND_TITLE;
  const bodyCopy=heroCopy();
  if(body&&text(body)!==bodyCopy)body.textContent=bodyCopy;

  if(primary){
    const leaf=qa('*',primary).find(el=>el.children.length===0&&text(el)&&!/^→$/.test(text(el)));
    if(leaf&&text(leaf)!==CTA_COPY)leaf.textContent=CTA_COPY;
    else if(!leaf&&text(primary)!==CTA_COPY)primary.textContent=CTA_COPY;
    bindPrimary(primary);
  }
  hero.dataset.v24heroState=activePrograms().join(',')||'empty';
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{render();}catch(e){console.warn('VAYQUO hero personal',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
