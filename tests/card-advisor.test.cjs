const fs=require('fs');
const assert=require('assert');

const advisor=fs.readFileSync('v27-card-advisor.js','utf8');
const legacy=fs.readFileSync('v24-card-check.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(legacy.includes('v27-card-advisor.js?v=2701'),'legacy card check must route to V27 advisor');
assert(legacy.includes('[data-view="start"]'),'loader must recognize the real start nav directly');
assert(legacy.includes('v27-card-advisor-start-marker'),'loader must maintain a start marker for robust advisor placement');
assert(advisor.includes('const STEP_COUNT=5'),'advisor must stay short and simple');
assert(advisor.includes('Wie viel zahlst du ungefähr pro Monat mit Karte?'),'spend question must state its monthly timeframe');
assert(advisor.includes('Kartenzahlungen insgesamt pro Monat'),'spend helper copy must explain the timeframe');
assert(advisor.includes('Was wäre dir bei 0 € Kartenentgelt wichtiger?'),'fee-first users need a final discriminator instead of a fake no-result');
assert(advisor.includes('Keine Provision beeinflusst die Empfehlung.'),'advisor must disclose ranking independence');
assert(advisor.includes("target.insertAdjacentElement('beforebegin',box)"),'start entry must be inserted before optimizer block when found');
assert(advisor.includes("if(a.goal==='abroad'||(a.goal==='save_fees'&&a.ecosystem==='acceptance'))"),'only abroad/acceptance-first users may route to the unexpanded Visa/Mastercard scope');
assert(!advisor.includes("if(a.goal==='save_fees'&&a.ecosystem==='none')return {outside:"),'fee-only users must receive a concrete checked-card result instead of being forced to no-result');
assert(!advisor.includes('planningReference'),'commission planning data must not enter recommendation logic');
assert.strictEqual(catalog.checkedAt,'2026-08-21');
assert.strictEqual(catalog.principles.commissionMayNotAffectRanking,true);
assert.strictEqual(catalog.principles.showNoMatchWhenAppropriate,true);

const ids=new Set(catalog.cards.map(x=>x.id));
for(const id of ['amex_payback','amex_green','amex_gold','amex_platinum','mm_myflex','mm_blue','mm_gold'])assert(ids.has(id),`missing checked card ${id}`);
for(const card of catalog.cards){
  assert(/^https:\/\//.test(card.officialUrl),`${card.id} needs official https URL`);
  assert(Number.isFinite(Number(card.monthlyFeeEUR)),`${card.id} needs numeric monthly fee`);
}

console.log('VAYQUO card advisor gates: OK');
