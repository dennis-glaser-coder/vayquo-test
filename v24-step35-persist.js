(()=>{
'use strict';

const KEY='vayquo:lastAmexCard';
const VALID=new Set(['platinum','gold','goldrose','green','blue','payback','dmpayback','bmwpremium','bmw']);
const q=s=>document.querySelector(s);

function read(){
  try{const v=localStorage.getItem(KEY);return VALID.has(v)?v:null;}catch{return null;}
}
function remember(v){
  if(!VALID.has(v))return;
  try{localStorage.setItem(KEY,v);}catch{}
}
function currentCard(){
  try{return VALID.has(state?.card)?state.card:null;}catch{return null;}
}
function persistCurrent(){const c=currentCard();if(c)remember(c);}
function restoreHiddenCard(){
  let remembered=read();
  if(!remembered)return false;
  try{
    if(!state?.card||state.card==='none'){
      state.card=remembered;
      if(typeof save==='function')save();
      return true;
    }
  }catch{}
  return false;
}
function hydrateCardSelect(){
  const select=q('#v24s35-card');
  if(!select)return;
  const remembered=read();
  if(!remembered)return;
  try{
    if((!state?.card||state.card==='none')&&Array.from(select.options).some(o=>o.value===remembered))select.value=remembered;
  }catch{}
}

// Sobald eine echte Karte vorhanden ist, separat merken. So darf ein reiner
// Programmfilter die Kartenidentität nie wieder löschen.
persistCurrent();

document.addEventListener('change',ev=>{
  if(ev.target?.id==='v24s35-card')remember(ev.target.value);
});

document.addEventListener('click',ev=>{
  const saveBtn=ev.target.closest?.('#v24s35-save');
  if(!saveBtn)return;

  // Vor dem bestehenden Step-3.5-Save sichern, solange die alte Karte noch da ist.
  persistCurrent();
  const select=q('#v24s35-card');
  if(select)remember(select.value);

  // Der alte Handler kann state.card auf "none" setzen, wenn Amex ausgeblendet wird.
  // Danach legen wir die gemerkte Karte wieder unsichtbar in state ab. Die Anzeige
  // richtet sich weiterhin ausschließlich nach state.programs.mr.
  setTimeout(()=>{
    const restored=restoreHiddenCard();
    hydrateCardSelect();
    try{
      if(restored&&state?.programs?.mr&&typeof render==='function')render();
    }catch{}
  },0);
},true);

new MutationObserver(()=>{
  persistCurrent();
  hydrateCardSelect();
}).observe(document.documentElement,{childList:true,subtree:true});
})();
