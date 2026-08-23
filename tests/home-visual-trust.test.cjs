const fs=require('fs');
const assert=require('assert');

const homeUsp=fs.readFileSync('v34-home-usp.js','utf8');
const moduleSource=fs.readFileSync('v44-home-visual-trust.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(homeUsp.includes('v44-home-visual-trust.js?v=4407'),'existing home USP module must load the isolated visual module');
assert(homeUsp.includes('v44-card-entry-pending'),'legacy card-check entry must be paint-gated before the visual home module resolves the route');
assert(homeUsp.includes("script.addEventListener('error'"),'V44 loader must fail softly without changing the existing home flow');
assert(!moduleSource.includes('MutationObserver'),'homepage visual module must not use a global MutationObserver');
assert(moduleSource.includes("#v28-card-advisor-entry .v28ca-entry-btn"),'card visual CTA must reuse the existing card-check entry');
assert(moduleSource.includes("['benefits','card']"),'travel visual card must reuse the existing benefits/card navigation');
assert(moduleSource.includes("['points','wallet']"),'points visual card must reuse the existing points/wallet navigation');

assert(moduleSource.includes('v44-home-entry-proxy'),'duplicate card-check promo must be presentation-collapsed on the home view');
assert(moduleSource.includes('setHomeEntryCollapsed(true)'),'home view must collapse the duplicate promo without deleting it');
assert(moduleSource.includes('setHomeEntryCollapsed(false)'),'leaving the home view must restore the original card-check entry');
assert(moduleSource.includes('releaseCardEntryPaintGate()'),'paint gate must release only after the card entry exists and the route is resolved');
assert(!moduleSource.includes("q('#v28-card-advisor-entry')?.remove"),'home cleanup must never delete the underlying card-check entry');
assert(moduleSource.includes('button.click()'),'visible homepage CTAs must continue opening the existing card-check flow');

for(const removed of ['Unabhängig gerechnet','Konditionen geprüft','Empfehlung unabhängig von Provision','Nur offizielle Anbieterquellen','v44-trust-grid','v44-trust-item']){
 assert(!moduleSource.includes(removed),`redundant homepage trust block must be removed: ${removed}`);
}
for(const forbidden of ['80.000','Trustpilot','4.7 von 5','4,7 von 5','100 % unabhängig']){
 assert(!moduleSource.includes(forbidden),`homepage must not contain invented social proof: ${forbidden}`);
}

assert.strictEqual(catalog.checkedAt,'2026-08-21','canonical audited card-catalog date changed; update test intentionally after a real recheck');
assert(!moduleSource.includes('Kartenkonditionen zuletzt geprüft:'),'homepage must not show a maintenance date that looks stale between audits');
assert(moduleSource.includes('#171918'),'new homepage visual layer must use VAYQUO black rather than a new green primary color');
assert(!moduleSource.includes('#183b35'),'new homepage visual layer must not introduce the old green as its primary surface');

for(const url of [
 'https://images.unsplash.com/photo-1758192838598-a1de4da5dcaf',
 'https://images.unsplash.com/photo-1772064901543-fb4a5d9f4736',
 'https://images.unsplash.com/photo-1762280251209-f4c2cddeb53f'
]) assert(moduleSource.includes(url),`missing expected premium travel visual ${url}`);
assert(moduleSource.includes("const CARD_IMAGE='data:image/webp;base64,"),'card tile must use the approved embedded premium wallet image');
assert(!moduleSource.includes('v44-card-art-card'),'synthetic overlay card must be removed once the real card image is used');
assert(moduleSource.includes('Elegantes Wallet mit Premium-Karte im luxuriösen Urlaubsambiente'),'card tile must describe the approved natural card image');
assert(!/american\s*express/i.test(moduleSource),'visual image layer must not depend on branded American Express imagery');

for(const dangerous of ['.v28ca-next','renderResult','VAYQUO_AUTH','decisionGate','commissionScore']){
 assert(!moduleSource.includes(dangerous),`isolated homepage module must not touch core flow internals: ${dangerous}`);
}
assert(moduleSource.includes("img.addEventListener('error'"),'image failures must fail softly without blocking the module');
assert(!moduleSource.includes('await safeImage'),'images must never gate homepage mounting');

console.log('VAYQUO home visual gates: OK (approved wallet image; no synthetic card overlay; legacy entry paint-gated; card-check flow preserved)');
