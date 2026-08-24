(()=>{
'use strict';

// iOS Home-Screen web apps do not expose Safari's normal pull-to-refresh.
// Keep this layer iOS-standalone only and observe Safari's native bounce
// through negative window.scrollY. No touch/pointer handlers are installed.
if(navigator.standalone!==true)return;

const THRESHOLD=68;
const SHOW_AFTER=12;
let armed=false,refreshing=false,indicator=null;

function ensureIndicator(){
 if(indicator?.isConnected)return indicator;
 const style=document.createElement('style');
 style.id='v48-ios-pull-refresh-style';
 style.textContent=`
 #v48-ios-pull-refresh{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 9px);z-index:2147483000;display:flex;align-items:center;gap:7px;min-height:30px;padding:0 11px;border:1px solid rgba(45,42,36,.12);border-radius:999px;background:rgba(255,253,248,.96);box-shadow:0 8px 24px rgba(23,25,24,.12);color:#5f6764;font:750 10px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;opacity:0;transform:translate(-50%,-145%);transition:opacity .13s ease,transform .13s ease;pointer-events:none;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
 #v48-ios-pull-refresh[data-visible="true"]{opacity:1;transform:translate(-50%,0)}
 #v48-ios-pull-refresh .v48-refresh-icon{font-size:14px;line-height:1;transition:transform .12s ease}
 #v48-ios-pull-refresh[data-ready="true"] .v48-refresh-icon{transform:rotate(135deg)}
 #v48-ios-pull-refresh[data-refreshing="true"] .v48-refresh-icon{animation:v48-ios-spin .65s linear infinite}
 @keyframes v48-ios-spin{to{transform:rotate(360deg)}}
 @media(prefers-reduced-motion:reduce){#v48-ios-pull-refresh,#v48-ios-pull-refresh .v48-refresh-icon{transition:none!important;animation:none!important}}
 `;
 document.head.appendChild(style);
 indicator=document.createElement('div');
 indicator.id='v48-ios-pull-refresh';
 indicator.setAttribute('role','status');
 indicator.setAttribute('aria-live','polite');
 indicator.innerHTML='<span class="v48-refresh-icon" aria-hidden="true">↻</span><span class="v48-refresh-label">Zum Aktualisieren ziehen</span>';
 document.body.appendChild(indicator);
 return indicator;
}

function render(distance){
 const el=ensureIndicator();
 const visible=distance>=SHOW_AFTER;
 const ready=distance>=THRESHOLD;
 el.dataset.visible=visible?'true':'false';
 el.dataset.ready=ready?'true':'false';
 const label=el.querySelector('.v48-refresh-label');
 if(label&&!refreshing)label.textContent=ready?'Loslassen zum Aktualisieren':'Zum Aktualisieren ziehen';
}

function hide(){
 if(!indicator||refreshing)return;
 indicator.dataset.visible='false';
 indicator.dataset.ready='false';
}

function refresh(){
 if(refreshing)return;
 refreshing=true;
 const el=ensureIndicator();
 el.dataset.visible='true';
 el.dataset.ready='false';
 el.dataset.refreshing='true';
 const label=el.querySelector('.v48-refresh-label');
 if(label)label.textContent='Aktualisieren …';
 setTimeout(()=>window.location.reload(),90);
}

function onScroll(){
 if(refreshing)return;
 const y=Number(window.scrollY||0);
 if(y<0){
  const distance=Math.min(110,-y);
  render(distance);
  if(distance>=THRESHOLD)armed=true;
  return;
 }
 if(armed){refresh();return;}
 hide();
}

function reset(){
 if(refreshing)return;
 armed=false;
 hide();
}

window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('pageshow',reset);
document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
