(()=>{
'use strict';

const KEY='vayquo:startFilter';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const exact=(el,text)=>(el?.textContent||'').trim()===text;
let selected='amex';
try{selected=sessionStorage.getItem(KEY)||'amex';}catch{}

const COPY={
  amex:{kicker:'AMERICAN EXPRESS',title:'Vorteile nicht nur haben. Auch nutzen.',body:'VAYQUO zeigt dir, welche deiner Kartenvorteile du jetzt nutzen kannst.',cta:'Vorteile ansehen'},
  payback:{kicker:'PAYBACK',title:'Punkte nicht nur sammeln. Auch nutzen.',body:'VAYQUO zeigt dir, wie du deine PAYBACK Punkte sinnvoll einsetzt.',cta:'PAYBACK ansehen'},
  all:{kicker:'VAYQUO',title:'Punkte, Meilen & Vorteile. Alles im Blick.',body:'VAYQUO zeigt dir, was du hast und was sich jetzt für dich lohnt.',cta:'Übersicht ansehen'}
};

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test((active.textContent||'').trim()))return true;
  return qa('#app *').some(el=>exact(el,'Was möchtest du tun?'))&&qa('#app *').some(el=>exact(el,'Deine Programme'));
}

function clickable(el){return el?.closest?.('button,[role="button"],a')||el;}
function findTabs(){
  if(!startActive())return [];
  const heading=qa('#app *').find(el=>exact(el,'Deine Programme'));
  if(!heading)return [];
  let box=heading.parentElement;
  while(box&&box!==q('#app')){
    const descendants=qa('*',box);
    const found=['Amex','PAYBACK','Alle'].map(label=>descendants.find(el=>exact(el,label))).filter(Boolean);
    if(found.length>=3)return found.map(clickable);
    box=box.parentElement;
  }
  return [];
}

function keyFor(tab){
  const t=(tab?.textContent||'').trim().toLowerCase();
  if(t==='payback')return 'payback';
  if(t==='alle')return 'all';
  return 'amex';
}

function luminance(color){
  const m=String(color).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);if(!m)return 255;
  return (+m[1]*.2126)+(+m[2]*.7152)+(+m[3]*.0722);
}
function captureStyles(tabs){
  if(tabs[0]?.dataset.v24sfStyleReady)return;
  let active=tabs.slice().sort((a,b)=>luminance(getComputedStyle(a).backgroundColor)-luminance(getComputedStyle(b).backgroundColor))[0];
  let inactive=tabs.find(t=>t!==active)||tabs[0];
  const props=['background-color','color','box-shadow','border-color','font-weight'];
  const a=getComputedStyle(active),i=getComputedStyle(inactive);
  tabs.forEach(tab=>{
    tab.dataset.v24sfStyleReady='1';
    props.forEach(p=>{tab.dataset['v24sfA'+p.replace(/-/g,'')]=a.getPropertyValue(p);tab.dataset['v24sfI'+p.replace(/-/g,'')]=i.getPropertyValue(p);});
  });
}
function styleTabs(tabs){
  if(!tabs.length)return;
  captureStyles(tabs);
  const available=new Set(tabs.map(keyFor));
  if(!available.has(selected))selected=available.has('amex')?'amex':keyFor(tabs[0]);
  const props=['background-color','color','box-shadow','border-color','font-weight'];
  tabs.forEach(tab=>{
    const on=keyFor(tab)===selected;
    props.forEach(p=>{
      const k='v24sf'+(on?'A':'I')+p.replace(/-/g,'');
      const v=tab.dataset[k];if(v)tab.style.setProperty(p,v,'important');
    });
    tab.setAttribute('aria-selected',on?'true':'false');
    tab.setAttribute('aria-pressed',on?'true':'false');
  });
}

function findHero(){
  const app=q('#app');if(!app)return null;
  const kicker=qa('*',app).find(el=>['AMERICAN EXPRESS','PAYBACK','VAYQUO'].includes((el.textContent||'').trim())&&el.children.length===0);
  if(!kicker)return null;
  let node=kicker.parentElement;
  while(node&&node!==app){
    const buttons=qa('button,[role="button"],a',node);
    if(buttons.some(b=>/Warum\?/i.test((b.textContent||'').trim()))&&q('h1,h2,h3',node))return node;
    node=node.parentElement;
  }
  return null;
}

function applyHero(){
  const hero=findHero();if(!hero)return;
  hero.dataset.v24sfHero='1';
  const c=COPY[selected]||COPY.amex;
  const leaf=qa('*',hero).filter(el=>el.children.length===0);
  const kicker=leaf.find(el=>['AMERICAN EXPRESS','PAYBACK','VAYQUO'].includes((el.textContent||'').trim()));
  const title=q('h1,h2,h3',hero);
  const body=qa('p',hero).find(p=>/VAYQUO/i.test(p.textContent||''))||q('p',hero);
  const buttons=qa('button,[role="button"],a',hero);
  const why=buttons.find(b=>/^Warum\?$/i.test((b.textContent||'').trim()));
  const primary=buttons.find(b=>b!==why);
  if(kicker)kicker.textContent=c.kicker;
  if(title)title.textContent=c.title;
  if(body)body.textContent=c.body;
  if(primary){primary.textContent=c.cta;primary.dataset.v24sfPrimary=selected;}
}

function apply(){
  if(!startActive())return;
  const tabs=findTabs();if(!tabs.length)return;
  styleTabs(tabs);applyHero();
}

function choose(key){
  selected=key;
  try{sessionStorage.setItem(KEY,key);}catch{}
  apply();
  setTimeout(apply,0);setTimeout(apply,80);
}

document.addEventListener('click',ev=>{
  if(!startActive())return;
  const tabs=findTabs();
  const hit=tabs.find(tab=>tab===ev.target||tab.contains?.(ev.target));
  if(hit){
    ev.preventDefault();ev.stopImmediatePropagation();choose(keyFor(hit));return;
  }
  const primary=ev.target.closest?.('[data-v24sf-primary]');
  if(!primary)return;
  const key=primary.dataset.v24sfPrimary;
  if(key==='payback'){
    ev.preventDefault();ev.stopImmediatePropagation();
    if(typeof go==='function')go('optimize','payback');
    else qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>/^punkte$/i.test((el.textContent||'').trim()))?.click();
  }else if(key==='all'){
    ev.preventDefault();ev.stopImmediatePropagation();
    qa('#app *').find(el=>exact(el,'Was möchtest du tun?'))?.scrollIntoView({behavior:'smooth',block:'start'});
  }
},true);

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO start filter',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();