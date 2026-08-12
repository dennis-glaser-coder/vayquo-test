(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const META_KEY='vayquo:balanceMeta';
const PROGRAMS={
  mr:{label:'Membership Rewards',unit:'Punkte'},
  pb:{label:'PAYBACK',unit:'Punkte'},
  mm:{label:'Miles & More',unit:'Meilen'}
};

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function fmt(n){return new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));}
function readMeta(){try{const v=JSON.parse(localStorage.getItem(META_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function activeProgram(id){try{return !!state?.programs?.[id];}catch{return false;}}
function balance(id){try{return Math.max(0,Math.round(Number(state?.balances?.[id])||0));}catch{return 0;}}
function known(id){const meta=readMeta();return meta[id]?.known===true||balance(id)>0;}
function ownsPlatinum(){try{return activeProgram('mr')&&state?.card==='platinum';}catch{return false;}}

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test(text(active)))return true;
  return qa('#app *').some(el=>el.children.length===0&&text(el)==='Was möchtest du tun?');
}

function activePrograms(){return Object.keys(PROGRAMS).filter(activeProgram);}

function recommendation(){
  const ids=activePrograms();
  if(!ids.length)return null;

  const missing=ids.find(id=>!known(id));
  if(missing){
    const p=PROGRAMS[missing];
    return {
      key:`balance:${missing}`,
      kind:'balance',program:missing,
      title:`${p.label} Stand ergänzen`,
      body:`Damit VAYQUO wirklich mit deinen Daten rechnet, fehlt noch dein aktueller ${p.unit.toLowerCase()}stand.`,
      cta:'Stand eintragen'
    };
  }

  const mr=activeProgram('mr')?balance('mr'):0;
  const mm=activeProgram('mm')?balance('mm'):0;
  const pb=activeProgram('pb')?balance('pb'):0;

  if(mr>0&&mm>0){
    return {
      key:`flight:${mr}:${mm}`,
      kind:'flight',
      title:'Punkte und Meilen für einen Flug vergleichen',
      body:`${fmt(mr)} Membership Rewards und ${fmt(mm)} Miles & More Meilen sind hinterlegt. Prüfe einen konkreten Flug gegen den Barpreis.`,
      cta:'Flug prüfen'
    };
  }
  if(mm>0){
    return {
      key:`flight-mm:${mm}`,
      kind:'flight',
      title:'Deine Meilen für einen Flug prüfen',
      body:`Mit ${fmt(mm)} Miles & More Meilen kannst du einen konkreten Prämienflug direkt gegen den Barpreis vergleichen.`,
      cta:'Flug prüfen'
    };
  }
  if(mr>0){
    return {
      key:`flight-mr:${mr}`,
      kind:'flight',
      title:'Mehr aus deinen Punkten machen',
      body:`${fmt(mr)} Membership Rewards sind hinterlegt. Prüfe bei einem konkreten Flug, welchen Gegenwert deine Punkte liefern.`,
      cta:'Punkteflug prüfen'
    };
  }
  if(pb>0){
    const value=(pb/100).toLocaleString('de-DE',{maximumFractionDigits:2});
    return {
      key:`payback:${pb}`,
      kind:'payback',
      title:'Deine PAYBACK Punkte sinnvoll einsetzen',
      body:`${fmt(pb)} PAYBACK Punkte entsprechen direkt ${value} €. VAYQUO zeigt dir die passenden Einsatzmöglichkeiten.`,
      cta:'PAYBACK nutzen'
    };
  }
  if(ownsPlatinum()){
    return {
      key:'platinum',
      kind:'benefits',
      title:'Deine Platinum-Vorteile nutzen',
      body:'Reiseguthaben, Restaurantguthaben, SIXT ride und Lounge-Zugang findest du gebündelt unter Vorteile.',
      cta:'Vorteile ansehen'
    };
  }
  return null;
}

function ensureStyle(){
  if(q('#v24na-style'))return;
  const style=document.createElement('style');
  style.id='v24na-style';
  style.textContent=`
    #v24na-card{margin:14px 0 18px;padding:17px;border:1px solid rgba(154,125,80,.22);border-radius:18px;background:linear-gradient(145deg,rgba(247,242,233,.98),rgba(238,232,221,.96));color:#171819;box-shadow:0 12px 30px rgba(10,18,18,.08)}
    #v24na-card .v24na-kicker{font-size:8px;line-height:1.2;letter-spacing:.16em;font-weight:850;color:#9a7d50;text-transform:uppercase}
    #v24na-card h3{margin:7px 0 6px;font-size:18px;line-height:1.2;letter-spacing:-.02em;color:#171819}
    #v24na-card p{margin:0;color:#626966;font-size:12px;line-height:1.5}
    #v24na-card button{display:flex;width:100%;align-items:center;justify-content:space-between;margin-top:13px;padding:12px 14px;border:0;border-radius:13px;background:#171819;color:#f7f2e9;font:inherit;font-size:12px;font-weight:800;text-align:left;cursor:pointer}
    #v24na-card button span{font-size:15px;font-weight:500}
  `;
  document.head.appendChild(style);
}

function choiceAnchor(){
  const heading=qa('#app *').find(el=>el.children.length===0&&text(el)==='Was möchtest du tun?');
  if(!heading)return null;
  let node=heading.parentElement;
  let fallback=node;
  for(let i=0;i<5&&node&&node!==q('#app');i++,node=node.parentElement){
    const controls=qa('button,a,[role="button"]',node).length;
    if(controls>=2&&text(node).length<1800)return node;
  }
  return fallback;
}

function render(){
  if(!startActive()){q('#v24na-card')?.remove();return;}
  const rec=recommendation();
  if(!rec){q('#v24na-card')?.remove();return;}
  const anchor=choiceAnchor();if(!anchor)return;
  ensureStyle();
  let card=q('#v24na-card');
  if(!card){card=document.createElement('section');card.id='v24na-card';anchor.insertAdjacentElement('beforebegin',card);}
  if(card.dataset.sig===rec.key)return;
  card.dataset.sig=rec.key;
  card.innerHTML=`<div class="v24na-kicker">DEIN NÄCHSTER SCHRITT</div><h3>${rec.title}</h3><p>${rec.body}</p><button type="button" data-v24na-action="${rec.kind}" ${rec.program?`data-v24na-program="${rec.program}"`:''}>${rec.cta}<span>→</span></button>`;
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
    if(++tries<8)setTimeout(open,80);
  };
  setTimeout(open,40);
}

function runAction(btn){
  const kind=btn.dataset.v24naAction;
  if(kind==='balance'){openBalance(btn.dataset.v24naProgram);return;}
  if(kind==='benefits'){triggerBottom('Vorteile');return;}
  if(kind==='payback'){
    try{if(typeof go==='function'){go('optimize','payback');return;}}catch{}
    triggerBottom('Punkte');return;
  }
  if(kind==='flight'){
    try{if(typeof go==='function'){go('optimize','flight');return;}}catch{}
    triggerBottom('Prüfen');
  }
}

document.addEventListener('click',ev=>{
  const btn=ev.target.closest?.('[data-v24na-action]');
  if(!btn)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  runAction(btn);
},true);

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{render();}catch(e){console.warn('VAYQUO next action',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
