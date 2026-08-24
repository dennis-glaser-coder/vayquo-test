(()=>{
'use strict';
const STYLE_ID='v46-pulse-entry-style';
function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim();}
function startActive(){const nav=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;return Array.from(document.querySelectorAll('#app *')).some(el=>el.children.length===0&&text(el)==='Deine Programme');}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
#app .v46-pulse-home{display:block;margin:2px 2px 18px;box-sizing:border-box}
#app .v46-card-tools-kicker{margin:0 2px 8px;font-size:8px;letter-spacing:.15em;font-weight:900;color:#8b7047}
#app .v46-card-tools-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
#app .v46-card-tool{min-width:0;min-height:104px;padding:13px;border:1px solid rgba(92,82,65,.14);border-radius:17px;background:#f7f4ee;color:#263632;text-decoration:none;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 7px 20px rgba(36,34,29,.035)}
#app .v46-card-tool-brand{font-size:7.5px;letter-spacing:.13em;font-weight:900;color:#927748}
#app .v46-card-tool h3{margin:6px 0 5px;color:#1f2e2a;font-size:13px;line-height:1.2;letter-spacing:-.018em}
#app .v46-card-tool p{margin:0;color:#76817d;font-size:8.5px;line-height:1.42}
#app .v46-card-tool-cta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;color:#465853;font-size:8.5px;font-weight:850}
#app .v46-card-tool-cta b{font-size:15px;line-height:1}
#app .v46-card-tool:active{transform:scale(.985)}
`;document.head.appendChild(style);}
function ensurePulse(){let box=document.querySelector('.v46-pulse-home');if(!startActive()){box?.remove();return null;}ensureStyle();if(box)return box;box=document.createElement('section');box.className='v46-pulse-home';box.setAttribute('aria-label','VAYQUO Kreditkarten-Tools');box.innerHTML='<div class="v46-card-tools-kicker">RUND UM DEINE KARTE</div><div class="v46-card-tools-grid"><a class="v46-card-tool v46-moment-home" href="/moment.html" aria-label="VAYQUO MOMENT öffnen"><div><div class="v46-card-tool-brand">VAYQUO MOMENT</div><h3>Ist das Angebot gerade wirklich gut?</h3><p>Bonus und Bedingungen einordnen.</p></div><div class="v46-card-tool-cta"><span>Angebot prüfen</span><b aria-hidden="true">→</b></div></a><a class="v46-card-tool v46-pulse-link" href="/pulse.html" aria-label="VAYQUO PULSE öffnen"><div><div class="v46-card-tool-brand">VAYQUO PULSE</div><h3>Lohnt sich deine Karte noch?</h3><p>Änderungen an Gebühren und Vorteilen prüfen.</p></div><div class="v46-card-tool-cta"><span>Karte im Blick</span><b aria-hidden="true">→</b></div></a></div>';return box;}
window.VAYQUO_PULSE_ENTRY={ensureHome:ensurePulse};
})();
