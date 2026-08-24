(()=>{
'use strict';

const DURATION=150;
const EASING='cubic-bezier(.2,.8,.2,1)';
let lastView='';
let currentAnimation=null;
let observer=null;
let scheduled=false;

function navRoot(){
  return document.querySelector('#bottom,.bottom');
}

function navItems(root){
  return root?Array.from(root.querySelectorAll('[data-view]')):[];
}

function activeView(root){
  const active=navItems(root).find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
  return String(active?.dataset?.view||'').trim().toLowerCase();
}

function contentRoot(){
  return document.querySelector('#app main')||document.querySelector('main');
}

function reducedMotion(){
  try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}
}

function animateContent(){
  if(reducedMotion())return;
  const content=contentRoot();
  if(!content||typeof content.animate!=='function')return;
  try{currentAnimation?.cancel();}catch{}
  try{
    currentAnimation=content.animate([
      {opacity:.955},
      {opacity:1}
    ],{
      duration:DURATION,
      easing:EASING,
      fill:'none'
    });
  }catch{}
}

function sync(){
  const root=navRoot();
  if(!root)return;
  const view=activeView(root);
  if(!view)return;
  if(!lastView){lastView=view;return;}
  if(view===lastView)return;
  lastView=view;
  animateContent();
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;sync();});
}

function start(){
  const root=navRoot();
  if(!root)return;
  sync();
  observer=new MutationObserver(schedule);
  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','aria-current']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
