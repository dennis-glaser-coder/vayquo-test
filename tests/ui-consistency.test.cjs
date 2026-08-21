const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('v29-ui-consistency.js','utf8');
const ratgeber=fs.readFileSync('v24-ratgeber-entry.js','utf8');
const optimizer=fs.readFileSync('v24-optimizer-polish.js','utf8');

assert(index.includes('v29-ui-consistency.js?v=2902'),'index must load the refreshed UI consistency pass');
assert(index.indexOf('ratgeberEntryAssets')<index.lastIndexOf('uiConsistencyAssets'),'UI consistency must run after the Ratgeber entry is mounted');
assert(index.includes('v24-card-check.js?v=2404'),'card-check loader cache version must remain current');

assert(ui.includes('--vqp-accent:#171918!important'),'modern VAYQUO accent token must use anthracite instead of green');
assert(ui.includes('.v28ca-entry-btn,.v28ca-next,.v28ca-select'),'card-advisor primary actions must use the common dark CTA treatment');
assert(ui.includes('.v24premium-primary'),'premium-system primary actions must inherit the same dark treatment');
assert(!ui.includes('button{background'),'theme pass must not recolor every button or semantic state globally');

assert(ratgeber.includes("link.href='/ratgeber/'"),'existing Ratgeber navigation must remain functional');
assert(ui.includes("text(el)==='Deine Programme'"),'Ratgeber placement must anchor to the programs section');
assert(ui.includes("programs.insertAdjacentElement('afterend',link)"),'Ratgeber must be moved below Deine Programme');

assert(ui.includes("text(el)==='Beste Nutzung finden'"),'stable card placement must anchor to the visible optimizer CTA');
assert(ui.includes("q('#v28-card-advisor-entry')"),'stable ordering must reuse the existing card-check entry instead of creating a duplicate');
assert(ui.includes("optimizer.insertAdjacentElement('beforebegin',entry)"),'card check must be moved directly before the optimizer hero');
assert(ui.includes("if(optimizer.previousElementSibling===entry)return"),'ordering guard must be idempotent and avoid render loops');
assert(ui.indexOf('moveCardCheckBeforeOptimizer()')<ui.indexOf('moveRatgeberBelowPrograms()'),'card placement must be resolved before the Ratgeber reorder in each consistency pass');

assert(optimizer.includes("q('[data-v24os-offer]',screen)"),'the main offer intent must keep its functional target');
assert(ui.includes('.v24os-landing .v24os-offer-late{display:none!important}'),'duplicate offer card must be hidden on the optimizer landing only');
assert(ui.includes("duplicate.setAttribute('aria-hidden','true')"),'hidden duplicate must also be removed from accessibility flow');

console.log('VAYQUO UI consistency gates: OK');
