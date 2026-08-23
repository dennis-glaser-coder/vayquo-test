const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const onboarding=fs.readFileSync('v24-onboarding.js','utf8');
const nav=fs.readFileSync('v33-navigation-state.js','utf8');
const card=fs.readFileSync('v33-card-flow-stability.js','utf8');
const cardLoader=fs.readFileSync('v24-card-check.js','utf8');
const contextual=fs.readFileSync('v33-contextual-setup.js','utf8');
const advisor=fs.readFileSync('v28-card-advisor.js','utf8');
const optimizer=fs.readFileSync('v24-optimizer-polish.js','utf8');
const points=fs.readFileSync('v24-points-balance.js','utf8');
const legal=fs.readFileSync('rechtliches.html','utf8');

// A fresh Instagram/Google visitor must reach the product before point setup or login.
assert(index.includes('v24-onboarding.js?v=2402'), 'contextual onboarding version must be loaded explicitly');
assert(index.includes('data-v24ob-loader="1"'), 'optimizer must not dynamically load the old blocking onboarding');
assert(onboarding.includes('return explicitOpen&&!mounted'), 'points onboarding must be contextual, never an automatic guest wall');
assert(onboarding.includes('function unlockGuestStart()'), 'fresh users must be moved from legacy onboarding into guest Start');
assert(onboarding.includes("s.onboarded=true"), 'legacy core onboarding must be bypassed for guest discovery');
assert(onboarding.includes('Für den Kreditkarten-Check brauchst du dieses Setup nicht.'), 'points setup must explain that the card check works without points');
assert(onboarding.includes('window.VAYQUO_ONBOARDING={open:openSetup'), 'points setup must remain explicitly available when it is actually needed');
assert(index.includes('v24-points-balance.js?v=2404'), 'fresh points-page setup link must not be hidden by an old cache');
assert(points.includes('Punkte & Meilen einrichten'), 'fresh points page must offer a direct setup action');
assert(points.includes('window.VAYQUO_ONBOARDING?.open?.()'), 'points-page setup action must open contextual onboarding directly');
assert(index.includes('v33-contextual-setup.js?v=3301'), 'optimizer contextual setup helper must be loaded');
assert(contextual.includes("document.querySelector('.v24os-empty-decision')"), 'empty optimizer state must receive the direct setup action');
assert(contextual.includes('Punkte & Meilen einrichten →'), 'empty optimizer state must tell the user exactly what to do next');
assert(contextual.includes('window.VAYQUO_ONBOARDING?.open?.()'), 'optimizer setup CTA must open the same contextual points flow');

// Main sections need Safari Back and reload continuity.
assert(index.includes('v33-navigation-state.js?v=3301'), 'navigation stability layer must be loaded');
for(const view of ['today','wallet','optimize','card'])assert(nav.includes(`'${view}'`), `missing supported view ${view}`);
assert(nav.includes("sessionStorage.setItem(KEY,view)"), 'current main view must survive reload in the current browser tab');
assert(nav.includes('history.pushState'), 'main-view changes must create browser history entries');
assert(nav.includes("window.addEventListener('popstate'"), 'Safari/browser Back must restore prior VAYQUO view');
assert(nav.includes('suppress=true'), 'history replay must avoid creating a navigation loop');
assert(legal.includes('href="./?vqReturn=start"'), 'legal page must return explicitly to VAYQUO Start');
assert(nav.includes("const RETURN_PARAM='vqReturn'"), 'navigation must recognize the legal return signal');
assert(nav.includes('if(!current){'), 'navigation must recover from a blank/no-active-view shell');
assert(nav.includes('consumeReturnView()'), 'return signal must be consumed after navigation');

// Card advisor: restore the simple known flow. Q5 only selects; the normal Next action advances to renderResult through render().
assert(advisor.includes('session.step=Math.max(0,session.step-1);render();'), 'internal Back must keep the existing session answers');
assert(index.includes('v24-card-check.js?v=2407'), 'restored card loader must be cache-busted');
assert(cardLoader.includes("v28-card-advisor.js?v=2806"), 'restored core advisor must be cache-busted');
assert(index.includes("const cardFlowStabilityAssets=''"), 'legacy card-flow compatibility layer must not be loaded');
assert(!card.includes('MutationObserver'), 'disabled compatibility layer must not observe or rewrite the advisor');
assert(advisor.includes("qa('[data-v28ca-choice]',root).forEach(btn=>btn.addEventListener('click',()=>{session.answers[meta.key]=btn.dataset.v28caChoice||'';qa('[data-v28ca-choice]',root).forEach(x=>x.classList.toggle('active',x===btn));q('.v28ca-next',root).disabled=false;}));"), 'Q5 selection must only store the answer and enable the normal next button');
assert(advisor.includes("q('.v28ca-next',root)?.addEventListener('click',()=>{const value=session.answers[meta.key];if(!mapHas(meta.map,value))return;session.step++;render();});"), 'the normal next handler must own final progression');
assert(advisor.includes('if(session.step>=STEP_COUNT){void renderResult();return;}'), 'render must route the completed fifth step into the existing result renderer');
assert(!advisor.includes('const expectedStep=session.step;setTimeout'), 'Q5 must not auto-open the result on selection');
assert(!advisor.includes("const active=q('[data-v28ca-choice].active',root)"), 'final progression must not use the later DOM-state recovery workaround');
assert(!advisor.includes("if(session.step===STEP_COUNT-1){session.step=STEP_COUNT;void renderResult();return;}"), 'final button must not bypass the normal render progression');
assert(advisor.includes("q('.v28ca-close',root)?.addEventListener('click',close)"), 'core advisor must keep the close action wired');

// 3-second clarity checks on the central user areas.
assert(advisor.includes('Welche Kreditkarte lohnt sich für mich?'), 'card entry must say directly what it does');
assert(advisor.includes('5 einfache Fragen. Kein Fachwissen.'), 'card entry must remove knowledge anxiety');
assert(optimizer.includes('Was möchtest du gerade machen?'), 'optimizer must open with an intent question');
for(const phrase of ['Flug mit Punkten oder Meilen prüfen','Ich habe schon ein Angebot','Ich weiß noch nicht, was sinnvoll ist','Meine Vorteile nutzen'])assert(optimizer.includes(phrase), `optimizer missing plain-language intent ${phrase}`);
assert(points.includes('<h2>Deine Bestände</h2>'), 'points page must name its first job directly');
assert(points.includes('Diese Stände nutzt VAYQUO für deine Auswertungen.'), 'configured points page must explain why balances matter');
assert(points.includes('Du hast noch kein Punkte- oder Meilenprogramm eingerichtet.'), 'fresh points page must explain its empty state in plain language');

console.log('VAYQUO full-flow stability and restored simple final-result gates: OK');
