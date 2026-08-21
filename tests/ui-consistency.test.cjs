const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('v29-ui-consistency.js','utf8');
const ratgeber=fs.readFileSync('v24-ratgeber-entry.js','utf8');
const optimizer=fs.readFileSync('v24-optimizer-polish.js','utf8');

assert(index.includes('v29-ui-consistency.js?v=2901'),'index must load the UI consistency pass');
assert(index.indexOf('ratgeberEntryAssets')<index.lastIndexOf('uiConsistencyAssets'),'UI consistency must run after the Ratgeber entry is mounted');
assert(index.includes('v24-card-check.js?v=2404'),'card-check loader cache version must be refreshed');

assert(ui.includes('--vqp-accent:#171918!important'),'modern VAYQUO accent token must use anthracite instead of green');
assert(ui.includes('.v28ca-entry-btn,.v28ca-next,.v28ca-select'),'card-advisor primary actions must use the common dark CTA treatment');
assert(ui.includes('.v24premium-primary'),'premium-system primary actions must inherit the same dark treatment');
assert(!ui.includes('button{background'),'theme pass must not recolor every button or semantic state globally');

assert(ratgeber.includes("link.href='/ratgeber/'"),'existing Ratgeber navigation must remain functional');
assert(ui.includes("text(el)==='Deine Programme'"),'Ratgeber placement must anchor to the programs section');
assert(ui.includes("programs.insertAdjacentElement('afterend',link)"),'Ratgeber must be moved below Deine Programme');

assert(optimizer.includes("q('[data-v24os-offer]',screen)"),'the main offer intent must keep its functional target');
assert(ui.includes('.v24os-landing .v24os-offer-late{display:none!important}'),'duplicate offer card must be hidden on the optimizer landing only');
assert(ui.includes("duplicate.setAttribute('aria-hidden','true')"),'hidden duplicate must also be removed from accessibility flow');

console.log('VAYQUO UI consistency gates: OK');
