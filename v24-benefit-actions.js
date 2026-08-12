(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

const URLS={
  travel:'https://www.americanexpress.com/de/reisen/',
  restaurant:'https://www.amex.de/platinum-restaurantguthaben',
  sixt:'https://www.sixt.de/ride/'
};

function platinumActive(){
  try{
    const p=state?.programs||{};
    const nav=q('#bottom [data-view="card"]');
    const benefits=nav?.classList.contains('active')||q('#app h1')?.textContent.trim()==='Vorteile';
    return !!benefits&&!!p.mr&&state?.card==='platinum';
  }catch{return false;}
}

function openExternal(url){
  try{window.open(url,'_blank','noopener,noreferrer');}
  catch{location.href=url;}
}

function ensureStyle(){
  if(q('#v24ba-style'))return;
  const style=document.createElement('style');
  style.id='v24ba-style';
  style.textContent=`
    #v24ba-update{appearance:none;width:100%;min-height:44px;margin:0 0 13px;border:1px solid rgba(117,91,52,.16);border-radius:14px;background:#f2eee7;color:#755b34;padding:0 14px;display:flex;align-items:center;justify-content:space-between;text-align:left;font:780 11px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;cursor:pointer;box-sizing:border-box}
    #v24ba-update span{font-size:17px;line-height:1}
    [data-v24ba-hidden-update="1"]{display:none!important}
  `;
  document.head.appendChild(style);
}

function benefitWrap(pattern){
  return qa('.v23-benefit-wrap').find(w=>pattern.test(text(w)))||null;
}

function findAction(wrap,pattern){
  if(!wrap)return null;
  return qa('button,a,[role="button"]',wrap).find(el=>pattern.test(text(el)))||null;
}

function cleanDirectClone(clone,label,kind){
  clone.removeAttribute('id');
  clone.removeAttribute('data-v24ba-hidden-update');
  clone.textContent=label;
  clone.dataset.v24baDirect=kind;
  return clone;
}

function makeDirectFrom(target,label,kind){
  if(!target)return;
  if(q(`[data-v24ba-direct="${kind}"]`,target.parentElement||document))return;
  const clone=cleanDirectClone(target.cloneNode(true),label,kind);
  target.insertAdjacentElement('afterend',clone);
}

function prepareTravel(){
  const wrap=benefitWrap(/Online[-\s]?Reiseguthaben/i);if(!wrap)return;
  if(q('[data-v24ba-direct="travel"]',wrap))return;
  const update=findAction(wrap,/^Nutzung aktualisieren\s*→?$/i);
  if(update){
    update.dataset.v24baHiddenUpdate='1';
    makeDirectFrom(update,'Reise mit Guthaben buchen →','travel');
    return;
  }
  const existing=findAction(wrap,/Reiseguthaben.*(?:nutzen|einlösen|buchen)|(?:Reise|Guthaben).*buchen/i);
  if(existing){
    const clone=cleanDirectClone(existing.cloneNode(true),'Reise mit Guthaben buchen →','travel');
    existing.replaceWith(clone);
  }
}

function prepareRestaurant(){
  const wrap=benefitWrap(/Restaurantguthaben/i);if(!wrap||q('[data-v24ba-direct="restaurant"]',wrap))return;
  const existing=findAction(wrap,/^Teilnehmende Restaurants (?:finden|öffnen|anzeigen)\s*→?$/i);
  if(!existing)return;
  const clone=cleanDirectClone(existing.cloneNode(true),'Teilnehmende Restaurants finden →','restaurant');
  existing.replaceWith(clone);
}

function prepareSixt(){
  const wrap=benefitWrap(/SIXT\s*ride/i);if(!wrap||q('[data-v24ba-direct="sixt"]',wrap))return;
  const existing=findAction(wrap,/^(?:Fahrt planen|Fahrt bei SIXT ride suchen)\s*→?$/i);
  if(!existing)return;
  const clone=cleanDirectClone(existing.cloneNode(true),'Fahrt planen →','sixt');
  existing.replaceWith(clone);
}

function prepareLodenfrey(){
  const wrap=benefitWrap(/LODENFREY/i);if(!wrap)return;
  const update=findAction(wrap,/^Nutzung aktualisieren\s*→?$/i);
  if(update)update.dataset.v24baHiddenUpdate='1';
}

function usageHeading(){
  return qa('#app h1,#app h2,#app h3').find(el=>/^Guthaben direkt nutzen$/i.test(text(el)))||null;
}

function ensureCentralUpdate(){
  if(q('#v24ba-update'))return;
  const heading=usageHeading();if(!heading)return;
  const btn=document.createElement('button');
  btn.type='button';btn.id='v24ba-update';btn.innerHTML='<b>Nutzung aktualisieren</b><span>→</span>';
  heading.insertAdjacentElement('afterend',btn);
}

function openUsageUpdate(){
  try{
    if(typeof openV15BenefitSetup==='function'){openV15BenefitSetup();return;}
  }catch{}
  try{
    if(typeof openModal==='function'&&typeof editVorteil==='function'){
      openModal('Nutzung aktualisieren',`<div style="display:grid;gap:9px"><p style="margin:0 0 4px;color:#6f7875;font-size:11px;line-height:1.5">Welchen Guthabenstand möchtest du aktualisieren?</p><button class="btn" data-v24ba-edit="travel">Online-Reiseguthaben</button><button class="btn" data-v24ba-edit="restaurant">Restaurantguthaben</button><button class="btn" data-v24ba-edit="sixt">SIXT ride</button><button class="btn" data-v24ba-edit="loden">LODENFREY</button></div>`);
      qa('[data-v24ba-edit]').forEach(btn=>btn.addEventListener('click',()=>{
        const id=btn.dataset.v24baEdit;
        try{if(typeof closeModal==='function')closeModal();}catch{}
        setTimeout(()=>{try{editVorteil(id);}catch{}},80);
      }));
      return;
    }
  }catch{}
  if(typeof toast==='function')toast('Nutzung kann gerade nicht geöffnet werden');
}

function apply(){
  if(!platinumActive()){q('#v24ba-update')?.remove();return;}
  ensureStyle();
  ensureCentralUpdate();
  prepareTravel();
  prepareRestaurant();
  prepareSixt();
  prepareLodenfrey();
}

document.addEventListener('click',ev=>{
  const direct=ev.target.closest?.('[data-v24ba-direct]');
  if(direct){
    const url=URLS[direct.dataset.v24baDirect];if(!url)return;
    ev.preventDefault();ev.stopImmediatePropagation();openExternal(url);return;
  }
  if(ev.target.closest?.('#v24ba-update')){
    ev.preventDefault();ev.stopImmediatePropagation();openUsageUpdate();
  }
},true);

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO benefit actions',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
