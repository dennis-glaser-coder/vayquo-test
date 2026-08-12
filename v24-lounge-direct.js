(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const AMEX_LOUNGE_BASE='https://www.americanexpress.com/de-de/travel/lounges/the-platinum-card/';

function openAmexAirport(code){
 const url=AMEX_LOUNGE_BASE+encodeURIComponent(code);
 try{window.open(url,'_blank','noopener,noreferrer');}
 catch{location.href=url;}
}

function hasPlatinumAccess(){
 try{return !!state?.programs?.mr&&state?.card==='platinum';}
 catch{return false;}
}

function findVisibleLoungeDialog(){
 const titles=qa('h1,h2,h3,h4,strong,b,span,div').filter(el=>clean(el.textContent)==='Lounge für deinen Flug prüfen');
 for(const title of titles){
  let node=title;
  for(let depth=0;node&&depth<9;depth++,node=node.parentElement){
   const t=clean(node.textContent);
   if(t.includes('Diesen Flug mit Punkten prüfen')&&(t.includes('Amex Lounge-Finder öffnen')||t.includes('Lounges anzeigen')))return node;
  }
 }
 return null;
}

function findAirportInput(dialog){
 return qa('input',dialog).find(input=>{
  const field=input.closest('label,.field,.form-row,.form-group')||input.parentElement;
  const context=clean(field?.textContent);
  return /Flughafen|IATA/i.test(context)||/DUS/i.test(input.getAttribute('placeholder')||'');
 });
}

function restoreAirportIds(dialog,input){
 const oldId=input.dataset.v24LoungeOriginalId;
 if(oldId&&input.id==='v24-lounge-airport'){
  const label=qa('label',dialog).find(el=>el.htmlFor==='v24-lounge-airport');
  if(label)label.htmlFor=oldId;
  input.id=oldId;
  delete input.dataset.v24LoungeOriginalId;
 }
 const legacy=q('#v24-lounge-airport-legacy[data-v24-lounge-restore="1"]');
 if(legacy){legacy.id='v24-lounge-airport';delete legacy.dataset.v24LoungeRestore;}
}

function triggerAirportPickerEnhancement(dialog,input){
 if(input.dataset.v24s2Airport){restoreAirportIds(dialog,input);return;}
 const existing=q('#v24-lounge-airport');
 if(existing&&existing!==input){existing.id='v24-lounge-airport-legacy';existing.dataset.v24LoungeRestore='1';}
 if(input.id!=='v24-lounge-airport'){
  const oldId=input.id;
  if(oldId){
   const label=qa('label',dialog).find(el=>el.htmlFor===oldId);
   if(label)label.htmlFor='v24-lounge-airport';
   input.dataset.v24LoungeOriginalId=oldId;
  }
  input.id='v24-lounge-airport';
 }
 if(dialog.dataset.v24LoungePickerKick==='1')return;
 dialog.dataset.v24LoungePickerKick='1';
 const pulse=document.createElement('span');
 pulse.hidden=true;pulse.setAttribute('aria-hidden','true');
 document.body.appendChild(pulse);pulse.remove();
 setTimeout(()=>restoreAirportIds(dialog,input),120);
}

function renderPlatinumAccess(dialog,input){
 const existing=q('[data-v24-lounge-platinum]',dialog);
 if(!hasPlatinumAccess()){
  existing?.remove();
  return;
 }
 if(existing)return;
 const field=input.closest('label,.field,.form-row,.form-group')||input.parentElement;
 if(!field)return;
 const box=document.createElement('div');
 box.dataset.v24LoungePlatinum='1';
 box.style.cssText='margin:0 0 14px;padding:13px 14px;border:1px solid rgba(154,125,80,.28);border-radius:14px;background:rgba(154,125,80,.08);display:flex;flex-direction:column;gap:4px;';
 box.innerHTML='<strong style="font-size:13px;line-height:1.35;color:#2f3935;">✓ Lounge-Zugang über deine Platinum Card</strong><span style="font-size:11px;line-height:1.45;color:#727d79;">Teilnehmende Lounge und Zugangsbedingungen für deinen Flughafen prüfen.</span>';
 field.insertAdjacentElement('beforebegin',box);
}

function replaceCopy(dialog){
 const candidates=qa('p,div,span,small',dialog);
 const note=candidates.find(el=>/Öffnungszeiten, Zugang und teilnehmende Lounges können sich ändern/i.test(clean(el.textContent)));
 if(note){
  const strong=q('strong,b',note);
  if(strong){
   const heading=clean(strong.textContent);
   note.innerHTML=`<strong>${heading}</strong><br>Öffnungszeiten, Zugang und teilnehmende Lounges können sich ändern. VAYQUO öffnet deshalb direkt den offiziellen Amex Lounge-Finder für deinen gewählten Flughafen.`;
  }else note.textContent='Öffnungszeiten, Zugang und teilnehmende Lounges können sich ändern. VAYQUO öffnet deshalb direkt den offiziellen Amex Lounge-Finder für deinen gewählten Flughafen.';
 }
}

function removePriorityPass(dialog){
 const button=qa('button,a,[role="button"]',dialog).find(el=>/^Priority Pass gegenprüfen$/i.test(clean(el.textContent)));
 if(button)button.remove();
}

function wirePrimary(dialog,input){
 const button=qa('button,a,[role="button"]',dialog).find(el=>el.dataset.v24LoungeDirect==='1'||/^Amex Lounge-Finder öffnen$/i.test(clean(el.textContent))||/^Lounges anzeigen(?:\s*→)?$/i.test(clean(el.textContent)));
 if(!button||button.dataset.v24LoungeDirect==='1')return;
 const cleanButton=button.cloneNode(true);
 cleanButton.textContent='Lounges anzeigen';
 cleanButton.dataset.v24LoungeDirect='1';
 button.replaceWith(cleanButton);
 cleanButton.addEventListener('click',ev=>{
  ev.preventDefault();ev.stopImmediatePropagation();
  const code=clean(input.value).toUpperCase();
  if(!/^[A-Z]{3}$/.test(code)){
   triggerAirportPickerEnhancement(dialog,input);
   setTimeout(()=>input.click(),30);
   return;
  }
  openAmexAirport(code);
 },true);
}

function enhanceVisibleLounge(){
 const dialog=findVisibleLoungeDialog();if(!dialog)return;
 const input=findAirportInput(dialog);if(!input)return;
 triggerAirportPickerEnhancement(dialog,input);
 renderPlatinumAccess(dialog,input);
 replaceCopy(dialog);
 removePriorityPass(dialog);
 wirePrimary(dialog,input);
}

let scheduled=false;
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;try{enhanceVisibleLounge();}catch(e){console.warn('VAYQUO lounge direct',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
