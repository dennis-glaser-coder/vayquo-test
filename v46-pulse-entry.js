(()=>{
'use strict';
const STYLE_ID='v46-pulse-entry-style';
function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function startActive(){const nav=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;return Array.from(document.querySelectorAll('#app *')).some(el=>el.children.length===0&&text(el)==='Deine Programme');}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
#app .v46-pulse-home{display:block;margin:0 2px 18px;padding:16px;border:1px solid rgba(138,112,71,.22);border-radius:18px;background:linear-gradient(145deg,#17201e,#202a27);box-shadow:0 12px 30px rgba(19,28,26,.12);color:#fff;text-decoration:none;box-sizing:border-box}
#app .v46-pulse-kicker{font-size:8px;letter-spacing:.16em;font-weight:900;color:#c8b27f}
#app .v46-pulse-home h3{margin:7px 0 6px;color:#fff;font-size:19px;line-height:1.15;letter-spacing:-.03em}
#app .v46-pulse-home p{margin:0;color:#c6cfcc;font-size:10.5px;line-height:1.5}
#app .v46-pulse-cta{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:11px;border-top:1px solid rgba(255,255,255,.09);font-size:10.5px;font-weight:850;color:#f7f4ed}
#app .v46-pulse-cta b{font-size:18px}
`;document.head.appendChild(style);}
function ensurePulse(){let box=document.querySelector('.v46-pulse-home');if(!startActive()){box?.remove();return null;}ensureStyle();if(box)return box;box=document.createElement('a');box.className='v46-pulse-home';box.href='/pulse.html';box.setAttribute('aria-label','VAYQUO PULSE öffnen');box.innerHTML='<div class="v46-pulse-kicker">VAYQUO PULSE</div><h3>Behält deine Kreditkarte für dich im Blick.</h3><p>Ändern sich Gebühren oder geprüfte Vorteile, zeigt dir VAYQUO, was sich geändert hat und ob du deine Karte neu prüfen solltest.</p><div class="v46-pulse-cta"><span>Karte beobachten</span><b aria-hidden="true">→</b></div>';return box;}
window.VAYQUO_PULSE_ENTRY={ensureHome:ensurePulse};
})();
