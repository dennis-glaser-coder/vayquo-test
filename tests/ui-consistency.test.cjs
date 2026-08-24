const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('v29-ui-consistency.js','utf8');
const ratgeber=fs.readFileSync('v24-ratgeber-entry.js','utf8');
const pulse=fs.readFileSync('v46-pulse-entry.js','utf8');
const optimizer=fs.readFileSync('v24-optimizer-polish.js','utf8');
const homeUsp=fs.readFileSync('v34-home-usp.js','utf8');
const visual=fs.readFileSync('v44-home-visual-trust.js','utf8');
const tabbar=fs.readFileSync('v39-native-tabbar.css','utf8');

// Syntax gates for the modules that share the home lifecycle.
new Function(ui);
new Function(ratgeber);
new Function(pulse);
new Function(homeUsp);
new Function(visual);

assert(index.includes('v29-ui-consistency.js?v=2903'),'index must load the centralized home-layout pass');
assert(index.includes('v24-ratgeber-entry.js?v=2411'),'Ratgeber entry must be cache-busted after lifecycle repair');
assert(index.includes('v46-pulse-entry.js?v=4604'),'compact card-tools entry must remain explicitly cache-versioned');
assert(index.includes('v34-home-usp.js?v=3415'),'home USP loader must be cache-busted for the clarified home hierarchy');
assert(index.includes("const integratedRatgeberAssets=''"),'obsolete v38 Ratgeber integration must stay disabled');
assert(/v24-card-check\.js\?v=\d+/.test(index),'card loader must remain explicitly cache-versioned');
assert(index.indexOf('ratgeberEntryAssets')<index.lastIndexOf('uiConsistencyAssets'),'central UI pass must run after the Ratgeber provider');
assert(index.indexOf('pulseAssets')<index.lastIndexOf('uiConsistencyAssets'),'central UI pass must run after the card-tools provider');
assert(index.includes('vq-home-layout-ready'),'initial reveal must wait for the finalized home order');
assert(index.includes('Math.max(0,850-(Date.now()-introStarted))'),'fast intro must remove the old artificial 1.45s minimum wait');
assert(index.includes('setTimeout(resolve,160)'),'intro fade must stay short while still allowing a clean transition');
assert(index.includes('setTimeout(reveal,1800)'),'stable paint fallback must remain unchanged while intro timing is optimized');

assert(ui.includes('--vqp-accent:#171918!important'),'modern VAYQUO accent token must use anthracite instead of green');
assert(ui.includes('.v28ca-entry-btn,.v28ca-next,.v28ca-select'),'card-advisor primary actions must use the common dark CTA treatment');
assert(ui.includes('.v24premium-primary'),'premium-system primary actions must inherit the same dark treatment');
assert(!ui.includes('button{background'),'theme pass must not recolor every button or semantic state globally');

// Mobile main-tab motion must stay purely visual and layout-safe.
assert(tabbar.includes('@media (max-width:679px) and (prefers-reduced-motion:no-preference)'),'tab motion must respect reduced-motion preferences');
for(const view of ['today','wallet','card']){
  assert(tabbar.includes(`[data-view="${view}"]`),`tab motion missing existing main view ${view}`);
  assert(tabbar.includes(`@keyframes v39-enter-${view}{from{opacity:.965}to{opacity:1}}`),`tab motion for ${view} must be opacity-only`);
}
assert(!tabbar.includes('v39-enter-optimize'),'Optimieren must stay free of the added tab fade to avoid visual jank during its own content update');
assert(tabbar.includes('animation:v39-enter-today .15s cubic-bezier(.2,.8,.2,1)'),'tab motion must stay short and restrained');
assert(!tabbar.includes('pointer-events'),'tab motion must never block or reroute input');

// Guest USP must stay at the top of Start instead of following the card advisor lower down.
assert(homeUsp.includes("const visual=q('#v44-home-visual-trust',app)"),'guest USP must recognize the visual home section as its primary anchor');
assert(homeUsp.includes('if(visual&&visible(visual))return visual'),'guest USP must anchor above the visible home section when it is ready');
assert(homeUsp.indexOf("q('#v44-home-visual-trust',app)")<homeUsp.indexOf("q('#v28-card-advisor-entry',app)"),'visual home section must be preferred before the lower card-advisor fallback');
assert(homeUsp.includes("anchor.insertAdjacentElement('beforebegin',line)"),'USP placement must remain a simple sibling insertion without replacing home content');
assert(homeUsp.includes("v44-home-visual-trust.js?v=4410"),'home hierarchy asset must have an explicit fresh cache version');
assert(!homeUsp.includes('stopPropagation'),'USP placement must not interfere with existing clicks');
assert(!homeUsp.includes('stopImmediatePropagation'),'USP placement must not block existing click handlers');

// The visible upper home hierarchy must be instantly understandable without changing lifecycle ownership.
assert(visual.includes('Welche Karte passt wirklich zu dir?'),'large home hero must clearly own the credit-card decision');
assert(visual.includes('PUNKTE, MEILEN & VORTEILE'),'secondary home area must clearly name the other core VAYQUO worlds');
assert(visual.includes("makeCard(IMAGES.points,'Punkte & Meilen'"),'points and miles must be a visible first-class home area');
assert(visual.includes("makeCard(IMAGES.travel,'Vorteile'"),'benefits must be a visible first-class home area');
assert(visual.includes('.v44-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))'),'visible secondary choices must use two equal columns');
assert(visual.includes('.v44-card[data-v44-kind="card"]{display:none!important}'),'duplicate credit-card choice must stay visually hidden while preserving lifecycle compatibility');
assert(visual.includes('FÜR DICH JETZT'),'personalized next-best-action area must be introduced before the existing optimizer block');
assert(visual.includes('Was lohnt sich bei deinem Setup?'),'personalized area must explain why the following optimizer block matters');
assert(visual.includes("clickExistingView(['points','wallet'])"),'points area must keep the existing points navigation path');
assert(visual.includes("clickExistingView(['benefits','card'])"),'benefits area must keep the existing benefits navigation path');

// One owner controls home ordering. Providers create elements but must not reposition themselves.
assert(ratgeber.includes("link.href='/ratgeber/'"),'Ratgeber must remain a native link');
assert(ratgeber.includes('window.VAYQUO_RATGEBER_ENTRY={ensureHome:ensureStartRatgeber,ensureLegal:mountRatgeberLink}'),'Ratgeber must expose a passive provider API');
assert(!ratgeber.includes('new MutationObserver(()=>setTimeout(()=>{mountRatgeberLink();mountStartRatgeber();}'),'Ratgeber must not globally fight for Start-page position');
assert(!ratgeber.includes('openStartRatgeber'),'native Ratgeber navigation must not be intercepted by a capture fallback');
assert(pulse.includes('window.VAYQUO_PULSE_ENTRY={ensureHome:ensurePulse}'),'card tools must preserve the passive provider API expected by central layout');
assert(pulse.includes('href="/moment.html"'),'MOMENT must be a normal home link');
assert(pulse.includes('href="/pulse.html"'),'PULSE must remain a normal home link');
assert(pulse.includes('Ist das Angebot gerade wirklich gut?'),'MOMENT must lead with the user question rather than a sales CTA');
assert(pulse.includes('Lohnt sich deine Karte noch?'),'PULSE must lead with the user question');
assert(pulse.includes('v46-moment-visual'),'MOMENT must have its lightweight contextual visual');
assert(pulse.includes('v46-pulse-visual'),'PULSE must have its lightweight monitoring visual');
assert(pulse.includes('v46-mini-card'),'both visuals must use the shared generic card motif');
assert(pulse.includes('aria-hidden="true"'),'decorative visuals must stay outside the accessibility meaning of the links');
assert(!pulse.includes('<img'),'home card visuals must not depend on external raster image assets');
assert(!pulse.includes('preventDefault'),'card tools must not intercept native links');
assert(!pulse.includes('stopPropagation'),'card tools must not block click propagation');
assert(!pulse.includes('stopImmediatePropagation'),'card tools must not block existing click behavior');
assert(!pulse.includes('new MutationObserver'),'card tools must not run a competing global layout observer');
assert(!pulse.includes('reorderTopChoices'),'card tools must not own top-card ordering');
assert(!pulse.includes('insertAdjacentElement'),'card tools must not reposition themselves');

assert(ui.includes('window.VAYQUO_RATGEBER_ENTRY?.ensureHome?.()'),'central UI owner must obtain the Ratgeber element');
assert(ui.includes('window.VAYQUO_PULSE_ENTRY?.ensureHome?.()'),'central UI owner must obtain the card-tools element');
assert(ui.includes("programs.insertAdjacentElement('afterend',pulse)"),'card tools must be placed directly below Deine Programme');
assert(ui.includes("pulse.insertAdjacentElement('afterend',ratgeber)"),'Ratgeber must be placed directly below card tools');
assert(ui.includes('grid.append(card,points,travel)'),'central lifecycle must remain unchanged and continue to recognize its three compatibility nodes');
assert(ui.includes("window.addEventListener('pageshow',schedule)"),'Safari page restore must rerun the same central layout pass');
assert(ui.includes("window.addEventListener('popstate',schedule)"),'browser Back must rerun the same central layout pass');
assert(ui.includes("HOME_READY_CLASS='vq-home-layout-ready'"),'central owner must publish a final-layout readiness signal');

assert(ui.includes("text(el)==='Beste Nutzung finden'"),'stable card placement must anchor to the visible optimizer CTA');
assert(ui.includes("q('#v28-card-advisor-entry')"),'stable ordering must reuse the existing card-check entry instead of creating a duplicate');
assert(ui.includes("optimizer.insertAdjacentElement('beforebegin',entry)"),'card check must be moved directly before the optimizer hero');
assert(ui.includes("if(optimizer.previousElementSibling===entry)return"),'ordering guard must be idempotent and avoid render loops');

assert(optimizer.includes("q('[data-v24os-offer]',screen)"),'the main offer intent must keep its functional target');
assert(ui.includes('.v24os-landing .v24os-offer-late{display:none!important}'),'duplicate offer card must be hidden on the optimizer landing only');
assert(ui.includes("duplicate.setAttribute('aria-hidden','true')"),'hidden duplicate must also be removed from accessibility flow');

console.log('VAYQUO UI consistency gates: OK (clear home hierarchy; central lifecycle unchanged; fast intro; subtle mobile tab motion excluding Optimieren; guest USP top anchor; native MOMENT/PULSE links; Safari return lifecycle)');
