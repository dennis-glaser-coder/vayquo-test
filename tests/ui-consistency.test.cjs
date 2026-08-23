const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('v29-ui-consistency.js','utf8');
const ratgeber=fs.readFileSync('v24-ratgeber-entry.js','utf8');
const pulse=fs.readFileSync('v46-pulse-entry.js','utf8');
const optimizer=fs.readFileSync('v24-optimizer-polish.js','utf8');

// Syntax gates for the three modules that now share one home lifecycle.
new Function(ui);
new Function(ratgeber);
new Function(pulse);

assert(index.includes('v29-ui-consistency.js?v=2903'),'index must load the centralized home-layout pass');
assert(index.includes('v24-ratgeber-entry.js?v=2411'),'Ratgeber entry must be cache-busted after lifecycle repair');
assert(index.includes('v46-pulse-entry.js?v=4603'),'PULSE entry must be cache-busted after lifecycle repair');
assert(index.includes("const integratedRatgeberAssets=''"),'obsolete v38 Ratgeber integration must stay disabled');
assert(/v24-card-check\.js\?v=\d+/.test(index),'card-check loader must remain explicitly cache-versioned');
assert(index.indexOf('ratgeberEntryAssets')<index.lastIndexOf('uiConsistencyAssets'),'central UI pass must run after the Ratgeber provider');
assert(index.indexOf('pulseAssets')<index.lastIndexOf('uiConsistencyAssets'),'central UI pass must run after the PULSE provider');
assert(index.includes('vq-home-layout-ready'),'initial reveal must wait for the finalized home order');

assert(ui.includes('--vqp-accent:#171918!important'),'modern VAYQUO accent token must use anthracite instead of green');
assert(ui.includes('.v28ca-entry-btn,.v28ca-next,.v28ca-select'),'card-advisor primary actions must use the common dark CTA treatment');
assert(ui.includes('.v24premium-primary'),'premium-system primary actions must inherit the same dark treatment');
assert(!ui.includes('button{background'),'theme pass must not recolor every button or semantic state globally');

// One owner controls home ordering. Providers create elements but must not reposition themselves.
assert(ratgeber.includes("link.href='/ratgeber/'"),'Ratgeber must remain a native link');
assert(ratgeber.includes('window.VAYQUO_RATGEBER_ENTRY={ensureHome:ensureStartRatgeber,ensureLegal:mountRatgeberLink}'),'Ratgeber must expose a passive provider API');
assert(!ratgeber.includes('new MutationObserver(()=>setTimeout(()=>{mountRatgeberLink();mountStartRatgeber();}'),'Ratgeber must not globally fight for Start-page position');
assert(!ratgeber.includes('openStartRatgeber'),'native Ratgeber navigation must not be intercepted by a capture fallback');
assert(pulse.includes('window.VAYQUO_PULSE_ENTRY={ensureHome:ensurePulse}'),'PULSE must expose a passive provider API');
assert(!pulse.includes('new MutationObserver'),'PULSE must not run a competing global layout observer');
assert(!pulse.includes('reorderTopChoices'),'PULSE must not own top-card ordering');
assert(!pulse.includes('insertAdjacentElement'),'PULSE must not reposition itself');

assert(ui.includes('window.VAYQUO_RATGEBER_ENTRY?.ensureHome?.()'),'central UI owner must obtain the Ratgeber element');
assert(ui.includes('window.VAYQUO_PULSE_ENTRY?.ensureHome?.()'),'central UI owner must obtain the PULSE element');
assert(ui.includes("programs.insertAdjacentElement('afterend',pulse)"),'PULSE must be placed directly below Deine Programme');
assert(ui.includes("pulse.insertAdjacentElement('afterend',ratgeber)"),'Ratgeber must be placed directly below PULSE');
assert(ui.includes('grid.append(card,points,travel)'),'top choices must be centrally ordered card, points, travel');
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

console.log('VAYQUO UI consistency gates: OK (single home-layout owner; Safari return lifecycle; native Ratgeber link)');
