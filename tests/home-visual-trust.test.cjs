const fs=require('fs');
const assert=require('assert');

const homeUsp=fs.readFileSync('v34-home-usp.js','utf8');
const moduleSource=fs.readFileSync('v44-home-visual-trust.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(homeUsp.includes('v44-home-visual-trust.js?v=4402'),'existing home USP module must load the isolated visual trust module');
assert(homeUsp.includes("script.addEventListener('error'"),'V44 loader must fail softly without changing the existing home flow');
assert(!moduleSource.includes('MutationObserver'),'homepage visual module must not use a global MutationObserver');
assert(moduleSource.includes("#v28-card-advisor-entry .v28ca-entry-btn"),'card visual CTA must reuse the existing card-check entry');
assert(moduleSource.includes("['benefits','card']"),'travel visual card must reuse the existing benefits/card navigation');
assert(moduleSource.includes("['points','wallet']"),'points visual card must reuse the existing points/wallet navigation');

for(const claim of ['Unabhängig gerechnet','Konditionen geprüft','Empfehlung unabhängig von Provision','Nur offizielle Anbieterquellen']){
 assert(moduleSource.includes(claim),`missing honest trust claim: ${claim}`);
}
for(const forbidden of ['80.000','Trustpilot','4.7 von 5','4,7 von 5','100 % unabhängig']){
 assert(!moduleSource.includes(forbidden),`homepage must not contain invented social proof: ${forbidden}`);
}

assert(moduleSource.includes('checkedAt'),'trust date must come from the canonical audited card catalog');
assert.strictEqual(catalog.checkedAt,'2026-08-21','expected current audited card-catalog check date changed; update test intentionally after a real recheck');
assert(moduleSource.includes('#171918'),'new homepage visual layer must use VAYQUO black rather than a new green primary color');
assert(!moduleSource.includes('#183b35'),'new homepage visual layer must not introduce the old green as its primary surface');

for(const url of [
 'https://images.unsplash.com/photo-1663030083159-5a58ca80c4ef',
 'https://images.unsplash.com/photo-1549897411-b06572cdf806',
 'https://images.unsplash.com/photo-1703355684811-609896031caa',
 'https://images.unsplash.com/photo-1561501900-3701fa6a0864'
]) assert(moduleSource.includes(url),`missing expected HTTPS visual asset ${url}`);
assert(!/american\s*express/i.test(moduleSource),'visual image layer must not depend on branded American Express imagery');

for(const dangerous of ['.v28ca-next','renderResult','VAYQUO_AUTH','decisionGate','commissionScore']){
 assert(!moduleSource.includes(dangerous),`isolated homepage module must not touch core flow internals: ${dangerous}`);
}
assert(moduleSource.includes("img.addEventListener('error'"),'image failures must fail softly without blocking the module');
assert(!moduleSource.includes('await safeImage'),'images must never gate homepage mounting');

console.log('VAYQUO home visual trust gates: OK (isolated start-page module; honest trust; existing navigation only; no core-flow hooks)');
