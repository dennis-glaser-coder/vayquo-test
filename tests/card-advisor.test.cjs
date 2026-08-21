const fs=require('fs');
const assert=require('assert');

const advisor=fs.readFileSync('v26-card-advisor.js','utf8');
const legacy=fs.readFileSync('v24-card-check.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(legacy.includes('v26-card-advisor.js?v=2601'),'legacy card check must route to V26 advisor');
assert(legacy.includes('[data-view="start"]'),'legacy loader must recognize the real start nav directly');
assert(legacy.includes('v26-card-advisor-start-marker'),'legacy loader must maintain a start marker for robust advisor placement');
assert(advisor.includes('const STEP_COUNT=5'),'advisor must stay short and simple');
assert(advisor.includes('Keine Provision beeinflusst die Empfehlung.'),'advisor must disclose ranking independence');
assert(advisor.includes("target.insertAdjacentElement('beforebegin',box)"),'start entry must be inserted before optimizer block when found');
assert(advisor.includes("if(a.goal==='abroad')return {outside:"),'abroad-first users must not be forced into the limited card set');
assert(advisor.includes("if(a.goal==='save_fees'&&a.ecosystem==='none')return {outside:"),'fee-only users must not be forced into a monetizable card');
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
