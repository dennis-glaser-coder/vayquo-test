(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const BRAND_TITLE='Nicht einfach Punkte haben. Das Maximum daraus machen.';
const CTA_COPY='Beste Nutzung prüfen';

function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function fmt(n){return new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));}
function programs(){try{return (typeof state!=='undefined'&&state?.programs)||{};}catch{return {};}}
function balance(id){try{return Math.max(0,Math.round(Number(state?.balances?.[id])||0));}catch{return 0;}}

function startActive(){
  const active=qa('#bottom [data-view],.bottom [data-view],#bottom .nav,.bottom .nav').find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  if(active&&/^start$/i.test(text(active)))return true;
  return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}

function findHero(){
  const title=qa('#app *').find(el=>el.children.length===0&&text(el)===BRAND_TITLE);
  if(!title)return null;
  let node=title.parentElement;
  const app=q('#app');
  for(let i=0;i<7&&node&&node!==app;i++,node=node.parentElement){
    const controls=qa('button,a,[role="button"]',node);
    const hasWhy=controls.some(el=>/^Warum\?$/i.test(text(el)));
    if(hasWhy&&controls.length>=2)return node;
  }
  return null;
}

function heroCopy(){
  const p=programs();
  const active=['mr','pb','mm'].filter(id=>!!p[id]);
  if(!active.length)return null;

  if(active.length===1&&active[0]==='mr'){
    const mr=balance('mr');
    return mr>0
      ?`${fmt(mr)} Membership Rewards sind hinterlegt. Finde heraus, wo sie für dich den größten Gegenwert haben.`
      :'Hinterlege deinen Membership-Rewards-Stand und finde heraus, welche Nutzung für dich am sinnvollsten ist.';
  }

  if(active.length===1&&active[0]==='pb'){
    const pb=balance('pb');
    return pb>0
      ?`${fmt(pb)} PAYBACK Punkte sind hinterlegt. Finde heraus, welche Nutzung für dich am meisten daraus macht.`
      :'Hinterlege deinen PAYBACK Punktestand und finde heraus, welche Nutzung für dich am sinnvollsten ist.';
  }

  if(active.length===1&&active[0]==='mm'){
    const mm=balance('mm');
    return mm>0
      ?`${fmt(mm)} Miles & More Meilen sind hinterlegt. Finde heraus, wo sie für dich den größten Gegenwert haben.`
      :'Hinterlege deinen Miles-&-More-Meilenstand und finde heraus, welche Nutzung für dich am sinnvollsten ist.';
  }

  const known=[];
  if(p.mr&&balance('mr')>0)known.push(`${fmt(balance('mr'))} Membership Rewards`);
  if(p.pb&&balance('pb')>0)known.push(`${fmt(balance('pb'))} PAYBACK Punkte`);
  if(p.mm&&balance('mm')>0)known.push(`${fmt(balance('mm'))} Miles & More Meilen`);
  if(known.length)return `${known.join(' · ')} sind hinterlegt. Finde heraus, welche Nutzung zu deinem Setup am besten passt.`;
  return 'Dein Setup ist hinterlegt. Ergänze deine aktuellen Stände und finde heraus, welche Nutzung für dich am sinnvollsten ist.';
}

function findBody(hero){
  const candidates=qa('*',hero).filter(el=>{
    if(el.children.length!==0)return false;
    if(el.closest('button,a,[role="button"]'))return false;
    const t=text(el);
    if(!t||t===BRAND_TITLE||/^Warum\?$/i.test(t))return false;
    if(t.length<20||t.length>320)return false;
    return true;
  });
  return candidates.sort((a,b)=>text(b).length-text(a).length)[0]||null;
}

function findPrimary(hero){
  return qa('button,a,[role="button"]',hero).find(el=>!/^Warum\?$/i.test(text(el)))||null;
}

function render(){
  q('#v24na-card')?.remove();
  if(!startActive())return;
  const hero=findHero();if(!hero)return;
  const bodyCopy=heroCopy();if(!bodyCopy)return;
  const body=findBody(hero);
  const primary=findPrimary(hero);
  if(body&&text(body)!==bodyCopy)body.textContent=bodyCopy;
  if(primary&&text(primary)!==CTA_COPY){
    const leaf=qa('*',primary).find(el=>el.children.length===0&&text(el)&&!/^→$/.test(text(el)));
    if(leaf)leaf.textContent=CTA_COPY;
    else primary.textContent=CTA_COPY;
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{render();}catch(e){console.warn('VAYQUO hero personal',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
