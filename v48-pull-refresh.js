(()=>{
'use strict';

const THRESHOLD=72;
const SHOW_AFTER=14;
let tracking=false,startY=0,startX=0,scroller=null,ready=false,indicator=null;

function ignoredTarget(target){
 return target instanceof Element&&!!target.closest('input,textarea,select,button,a,[role="button"],[contenteditable="true"]');
}
function scrollParent(target){
 let node=target instanceof Element?target:null;
 while(node&&node!==document.body&&node!==document.documentElement){
  const style=getComputedStyle(node);
  if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+2)return node;
  node=node.parentElement;
 }
 return document.scrollingElement||document.documentElement;
}
function atTop(node){return !node||Number(node.scrollTop||0)<=1;}
function ensureIndicator(){
 if(indicator?.isConnected)return indicator;
 const style=document.createElement('style');
 style.id='v48-pull-refresh-style';
 style.textContent=`
 #v48-pull-refresh{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 9px);z-index:2147483000;display:flex;align-items:center;gap:7px;min-height:30px;padding:0 11px;border:1px solid rgba(45,42,36,.12);border-radius:999px;background:rgba(255,253,248,.96);box-shadow:0 8px 24px rgba(23,25,24,.12);color:#5f6764;font:750 10px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;opacity:0;transform:translate(-50%,-145%);transition:opacity .13s ease,transform .13s ease;pointer-events:none;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
 #v48-pull-refresh[data-visible="true"]{opacity:1;transform:translate(-50%,0)}
 #v48-pull-refresh .v48-refresh-icon{font-size:14px;line-height:1;transform:rotate(0deg);transition:transform .12s ease}
 #v48-pull-refresh[data-ready="true"] .v48-refresh-icon{transform:rotate(135deg)}
 #v48-pull-refresh[data-refreshing="true"] .v48-refresh-icon{animation:v48-spin .65s linear infinite}
 @keyframes v48-spin{to{transform:rotate(360deg)}}
 @media(prefers-reduced-motion:reduce){#v48-pull-refresh,#v48-pull-refresh .v48-refresh-icon{transition:none!important;animation:none!important}}
 `;
 document.head.appendChild(style);
 indicator=document.createElement('div');
 indicator.id='v48-pull-refresh';
 indicator.setAttribute('role','status');
 indicator.setAttribute('aria-live','polite');
 indicator.innerHTML='<span class="v48-refresh-icon" aria-hidden="true">↻</span><span class="v48-refresh-label">Zum Aktualisieren ziehen</span>';
 document.body.appendChild(indicator);
 return indicator;
}
function setIndicator(distance){
 const el=ensureIndicator();
 const visible=distance>=SHOW_AFTER;
 const nextReady=distance>=THRESHOLD;
 el.dataset.visible=visible?'true':'false';
 el.dataset.ready=nextReady?'true':'false';
 if(nextReady!==ready){
  ready=nextReady;
  const label=el.querySelector('.v48-refresh-label');
  if(label)label.textContent=ready?'Loslassen zum Aktualisieren':'Zum Aktualisieren ziehen';
 }
}
function reset(){
 tracking=false;scroller=null;startY=0;startX=0;ready=false;
 if(!indicator)return;
 indicator.dataset.visible='false';
 indicator.dataset.ready='false';
 indicator.dataset.refreshing='false';
 const label=indicator.querySelector('.v48-refresh-label');
 if(label)label.textContent='Zum Aktualisieren ziehen';
}
function onStart(event){
 if(event.touches?.length!==1||ignoredTarget(event.target)){reset();return;}
 const candidate=scrollParent(event.target);
 if(!atTop(candidate)){reset();return;}
 tracking=true;scroller=candidate;ready=false;
 startY=event.touches[0].clientY;startX=event.touches[0].clientX;
}
function onMove(event){
 if(!tracking||event.touches?.length!==1)return;
 if(!atTop(scroller)){reset();return;}
 const touch=event.touches[0];
 const dy=touch.clientY-startY;
 const dx=Math.abs(touch.clientX-startX);
 if(dy<=0||dx>Math.max(24,dy*.7)){setIndicator(0);return;}
 setIndicator(Math.min(110,dy*.72));
}
function onEnd(){
 if(!tracking){reset();return;}
 const shouldRefresh=ready&&atTop(scroller);
 if(!shouldRefresh){reset();return;}
 const el=ensureIndicator();
 el.dataset.visible='true';
 el.dataset.ready='false';
 el.dataset.refreshing='true';
 const label=el.querySelector('.v48-refresh-label');
 if(label)label.textContent='Aktualisieren …';
 tracking=false;
 setTimeout(()=>window.location.reload(),80);
}

function init(){
 if(!('ontouchstart' in window)&&navigator.maxTouchPoints<1)return;
 ensureIndicator();
 document.addEventListener('touchstart',onStart,{passive:true});
 document.addEventListener('touchmove',onMove,{passive:true});
 document.addEventListener('touchend',onEnd,{passive:true});
 document.addEventListener('touchcancel',reset,{passive:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
