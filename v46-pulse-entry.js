(()=>{
'use strict';
const STYLE_ID='v46-pulse-entry-style';
function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function startActive(){const nav=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;return Array.from(document.querySelectorAll('#app *')).some(el=>el.children.length===0&&text(el)==='Deine Programme');}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
#app .v46-pulse-home{display:block;margin:2px 2px 18px;box-sizing:border-box}
#app .v46-card-tools-kicker{margin:0 2px 8px;font-size:8px;letter-spacing:.15em;font-weight:900;color:#8b7047}
#app .v46-card-tools-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
#app .v46-card-tool{position:relative;overflow:hidden;min-width:0;min-height:118px;padding:13px;border:1px solid rgba(92,82,65,.14);border-radius:17px;background:linear-gradient(145deg,#fbf9f4,#f7f4ee);color:#263632;text-decoration:none;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 7px 20px rgba(36,34,29,.035)}
#app .v46-card-tool-copy{position:relative;z-index:2;padding-right:47px}
#app .v46-card-tool-brand{font-size:7.5px;letter-spacing:.13em;font-weight:900;color:#927748}
#app .v46-card-tool h3{margin:6px 0 5px;color:#1f2e2a;font-size:13px;line-height:1.2;letter-spacing:-.018em}
#app .v46-card-tool p{margin:0;color:#76817d;font-size:8.5px;line-height:1.42}
#app .v46-card-tool-cta{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;color:#465853;font-size:8.5px;font-weight:850}
#app .v46-card-tool-cta b{font-size:15px;line-height:1}
#app .v46-card-tool:active{transform:scale(.985)}
#app .v46-card-tool-visual{position:absolute;z-index:1;top:10px;right:8px;width:52px;height:48px;pointer-events:none}
#app .v46-mini-card{position:absolute;left:2px;top:11px;width:35px;height:22px;border-radius:5px;background:linear-gradient(145deg,#19201e,#2a3430);box-shadow:0 4px 9px rgba(21,28,26,.2);transform:rotate(-7deg)}
#app .v46-mini-card i{position:absolute;left:6px;top:7px;width:6px;height:5px;border-radius:1.5px;background:#d3b778;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
#app .v46-mini-card em{position:absolute;right:5px;bottom:3px;color:#d7bc7d;font:800 7px/1 Georgia,serif;font-style:normal}
#app .v46-moment-visual svg{position:absolute;right:0;bottom:1px;width:31px;height:26px;overflow:visible}
#app .v46-moment-visual .v46-spark{position:absolute;right:2px;top:0;color:#d4b36f;font-size:12px;line-height:1}
#app .v46-pulse-visual .v46-ring{position:absolute;border:1px solid rgba(188,157,96,.34);border-radius:50%}
#app .v46-pulse-visual .v46-ring-one{width:37px;height:37px;right:0;top:3px}
#app .v46-pulse-visual .v46-ring-two{width:25px;height:25px;right:6px;top:9px;border-color:rgba(89,121,111,.25)}
#app .v46-pulse-visual svg{position:absolute;right:1px;bottom:0;width:19px;height:20px;filter:drop-shadow(0 2px 3px rgba(118,91,45,.12))}
@media(max-width:360px){#app .v46-card-tool{padding:12px;min-height:116px}#app .v46-card-tool-copy{padding-right:40px}#app .v46-card-tool-visual{right:5px;transform:scale(.88);transform-origin:top right}}
`;document.head.appendChild(style);}
function ensurePulse(){let box=document.querySelector('.v46-pulse-home');if(!startActive()){box?.remove();return null;}ensureStyle();if(box)return box;box=document.createElement('section');box.className='v46-pulse-home';box.setAttribute('aria-label','VAYQUO Kreditkarten-Tools');box.innerHTML='<div class="v46-card-tools-kicker">RUND UM DEINE KARTE</div><div class="v46-card-tools-grid"><a class="v46-card-tool v46-moment-home" href="/moment.html" aria-label="VAYQUO MOMENT öffnen"><div class="v46-card-tool-visual v46-moment-visual" aria-hidden="true"><span class="v46-mini-card"><i></i><em>V</em></span><span class="v46-spark">✦</span><svg viewBox="0 0 32 27" fill="none"><path d="M2 22l7-7 5 4 10-12" stroke="#b89450" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 7h5v5" stroke="#b89450" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="15.5" y="17.5" width="13" height="8" rx="2" stroke="#c5a464" stroke-width="1.2"/><path d="M19 16v3M25 16v3" stroke="#c5a464" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="v46-card-tool-copy"><div class="v46-card-tool-brand">VAYQUO MOMENT</div><h3>Ist das Angebot gerade wirklich gut?</h3><p>Bonus und Bedingungen einordnen.</p></div><div class="v46-card-tool-cta"><span>Angebot prüfen</span><b aria-hidden="true">→</b></div></a><a class="v46-card-tool v46-pulse-link" href="/pulse.html" aria-label="VAYQUO PULSE öffnen"><div class="v46-card-tool-visual v46-pulse-visual" aria-hidden="true"><span class="v46-ring v46-ring-one"></span><span class="v46-ring v46-ring-two"></span><span class="v46-mini-card"><i></i><em>V</em></span><svg viewBox="0 0 20 21" fill="none"><path d="M10 2.5c-2.5 0-4.2 1.9-4.2 4.5v3.2c0 1.2-.5 2.3-1.4 3.1l-.9.8h13l-.9-.8c-.9-.8-1.4-1.9-1.4-3.1V7c0-2.6-1.7-4.5-4.2-4.5Z" fill="#c5a464"/><path d="M8 16.2c.3 1.1 1 1.8 2 1.8s1.7-.7 2-1.8" stroke="#9d7b3f" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="v46-card-tool-copy"><div class="v46-card-tool-brand">VAYQUO PULSE</div><h3>Lohnt sich deine Karte noch?</h3><p>Änderungen an Gebühren und Vorteilen prüfen.</p></div><div class="v46-card-tool-cta"><span>Karte im Blick</span><b aria-hidden="true">→</b></div></a></div>';return box;}
window.VAYQUO_PULSE_ENTRY={ensureHome:ensurePulse};
})();
