const fs=require('fs');
const assert=require('assert');

const facts=JSON.parse(fs.readFileSync('config/vayquo-card-moment.de.json','utf8'));
const page=fs.readFileSync('moment.html','utf8');
const enhancer=fs.readFileSync('v49-card-moment-entry.js','utf8');
const loader=fs.readFileSync('v24-card-check.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const guide=fs.readFileSync('ratgeber/kreditkarte-lohnt-sich.html','utf8');
const governance=JSON.parse(fs.readFileSync('config/vayquo-fact-governance.de.json','utf8'));

new Function(enhancer);
const inline=page.match(/<script>\s*(\(\(\)=>\{[\s\S]*?\}\)\(\);)\s*<\/script>/);
assert(inline,'MOMENT page must contain its isolated runtime');
new Function(inline[1]);

assert.strictEqual(facts.market,'DE');
assert.strictEqual(facts.checkedAt,'2026-08-24');
assert.strictEqual(facts.principles.currentOfferNeedsOfficialProviderSource,true);
assert.strictEqual(facts.principles.historicalReferenceIsObservedNotExhaustive,true);
assert.strictEqual(facts.principles.noAllTimeClaimWithoutCompleteHistory,true);
assert.strictEqual(facts.principles.doNotEncourageExtraSpendingToReachBonus,true);
assert.strictEqual(facts.cards.length,2,'MOMENT v1 must stay deliberately narrow');

const byId=id=>facts.cards.find(x=>x.id===id);
const platinum=byId('amex_platinum'),gold=byId('amex_gold');
assert(platinum&&gold,'MOMENT must ship only with verified Platinum and Gold v1 facts');
assert.deepStrictEqual([platinum.current.bonusPoints,platinum.current.spendRequirementEUR,platinum.current.periodMonths],[85000,10000,6]);
assert.deepStrictEqual([platinum.reference.bonusPoints,platinum.reference.spendRequirementEUR,platinum.reference.periodMonths],[75000,13000,6]);
assert(platinum.current.bonusPoints>platinum.reference.bonusPoints,'Platinum current bonus must beat the observed comparison reference');
assert(platinum.current.spendRequirementEUR<platinum.reference.spendRequirementEUR,'Platinum current max-bonus hurdle must be lower than the observed reference');
assert.deepStrictEqual([gold.current.bonusPoints,gold.current.spendRequirementEUR,gold.current.periodMonths],[50000,5000,6]);
assert.deepStrictEqual([gold.reference.bonusPoints,gold.reference.spendRequirementEUR,gold.reference.periodMonths],[40000,6000,6]);
assert(gold.current.bonusPoints>gold.reference.bonusPoints,'Gold current bonus must beat the observed comparison reference');
assert(gold.current.spendRequirementEUR<gold.reference.spendRequirementEUR,'Gold current max-bonus hurdle must be lower than the observed reference');
for(const card of facts.cards){
 assert(/^https:\/\/www\.amex-kreditkarten\.de\//.test(card.current.sourceUrl),`${card.id} current offer needs the checked provider source`);
 assert(/^https:\/\//.test(card.reference.sourceUrl),`${card.id} historical reference needs a public source`);
 assert.strictEqual(card.current.audience,'new_customer');
}

assert(page.includes('VAYQUO MOMENT'));
assert(page.includes('/config/vayquo-card-moment.de.json?v=4901'));
assert(page.includes("APP_STATE_KEY='vayquo-v1-state'"),'MOMENT may read the existing VAYQUO card state for context');
assert(!page.includes("localStorage.setItem(APP_STATE_KEY"),'MOMENT must never overwrite the main VAYQUO app state');
assert(!page.includes("localStorage.removeItem(APP_STATE_KEY"),'MOMENT must never remove the main VAYQUO app state');
assert(page.includes("WATCH_KEY='vayquo:moment:v1'"),'MOMENT comparison memory needs its own isolated key');
assert(page.includes('Keine Push- oder E-Mail-Benachrichtigung'),'local comparison memory must not pretend to be a background notification');
assert(page.includes('Zusätzliche Ausgaben nur für den Bonus wären kein sinnvoller Grund abzuschließen.'),'MOMENT must reject spend-for-bonus pressure');
assert(!/allzeit[- ]?rekord|rekordhöhe|nie[^<]{0,30}größer|höchster[^<]{0,30}aller zeiten/i.test(page),'visible MOMENT copy must not claim a complete all-time record');

assert(enhancer.includes("return 'amex_platinum'"));
assert(enhancer.includes("return 'amex_gold'"));
assert(enhancer.includes('/moment.html?card='));
assert(!enhancer.includes('MutationObserver'),'MOMENT result link must not add another DOM observer');
assert(!enhancer.includes('preventDefault'),'MOMENT result link must not intercept existing card-advisor clicks');
assert(!enhancer.includes('stopPropagation'),'MOMENT result link must not block existing card-advisor clicks');
assert(!enhancer.includes('stopImmediatePropagation'),'MOMENT result link must not block existing card-advisor clicks');
assert(loader.includes("moment.src='v49-card-moment-entry.js?v=4901'"),'card loader must load MOMENT enhancer explicitly');
assert(loader.includes('document.head.appendChild(cta);\n      loadMoment();'),'existing provider CTA must remain mounted before MOMENT enhancer is requested');
assert(index.includes('v24-card-check.js?v=2411'),'card loader cache version must expose the MOMENT integration');
assert(sitemap.includes('<loc>https://vayquo.de/moment.html</loc>'),'MOMENT must be crawlable from the sitemap');
assert(guide.includes('href="/moment.html"'),'static credit-card guide must link contextually to MOMENT');
assert.strictEqual(governance.canonicalSources.cardMoment,'config/vayquo-card-moment.de.json');
assert(governance.guardedClaims.some(x=>x.id==='card_moment_offer_timing'&&x.canonical==='cardMoment'),'MOMENT mutable offer claims must be governed centrally');

console.log('VAYQUO MOMENT gates: OK (verified v1 facts; no click interception; isolated local state; contextual SEO link)');
