const fs=require('fs');
const assert=require('assert');
const engine=require('../v28-card-advisor-engine.js');

const ui=fs.readFileSync('v28-card-advisor.js','utf8');
const loader=fs.readFileSync('v24-card-check.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(loader.includes('v28-card-advisor-engine.js?v=2801'),'loader must load V28 decision engine');
assert(loader.includes('v28-card-advisor.js?v=2801'),'loader must load V28 advisor UI');
assert(loader.includes('[data-view="start"]'),'loader must recognize the real start nav directly');
assert(loader.includes('v28-card-advisor-start-marker'),'loader must maintain a start marker');
assert(ui.includes('const STEP_COUNT=5'),'advisor must stay short and simple');
assert(ui.includes('Wie viel zahlst du ungefähr pro Monat mit Karte?'),'spend question must state monthly timeframe');
assert(ui.includes('Kartenzahlungen insgesamt pro Monat'),'spend helper must explain timeframe');
assert(ui.includes("key:'freePriority'"),'zero-fee discriminator must use its own state key');
assert(ui.includes('Keine Provision beeinflusst die Empfehlung.'),'ranking independence disclosure must remain visible');
assert(!ui.includes('planningReference'),'commission planning data must not enter recommendation logic');
assert.strictEqual(catalog.checkedAt,'2026-08-21');
assert.strictEqual(catalog.principles.commissionMayNotAffectRanking,true);

const byId=id=>catalog.cards.find(card=>card.id===id);
const answer=(overrides={})=>({goal:'points',travel:'low',spend:'mid',fee:'small',ecosystem:'none',freePriority:'',...overrides});

let d=engine.decide(catalog,answer({goal:'premium',travel:'high',fee:'medium'}));
assert.strictEqual(d.kind,'no_match','premium lounge goal must not fall back to Gold when Platinum is over budget');
assert.strictEqual(d.reason,'budget');
assert.strictEqual(d.nearest?.id,'amex_platinum');

d=engine.decide(catalog,answer({goal:'premium',travel:'rare',fee:'value'}));
assert.strictEqual(d.kind,'conflict','rare travelers must not receive an expensive premium recommendation just for selecting lounge');

d=engine.decide(catalog,answer({goal:'points',fee:'zero'}));
assert.strictEqual(d.kind,'no_match','flexible-points goal with 0 EUR budget needs a relevant budget no-match, not a Visa fallback');
assert.strictEqual(d.nearest?.id,'amex_green');

d=engine.decide(catalog,answer({goal:'points',fee:'small'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'amex_green');

d=engine.decide(catalog,answer({goal:'miles',fee:'zero'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'mm_myflex');

d=engine.decide(catalog,answer({goal:'payback',fee:'zero'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'amex_payback');

d=engine.decide(catalog,answer({goal:'save_fees',fee:'zero',freePriority:'payback'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'amex_payback');

d=engine.decide(catalog,answer({goal:'save_fees',fee:'zero',freePriority:'miles_more'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'mm_myflex');

d=engine.decide(catalog,answer({goal:'save_fees',fee:'zero',freePriority:'acceptance'}));
assert.strictEqual(d.kind,'scope');

d=engine.decide(catalog,answer({goal:'abroad',fee:'zero'}));
assert.strictEqual(d.kind,'scope');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'none',fee:'value'}));
assert.strictEqual(d.kind,'needs_preference','unclear users without an ecosystem must not get an arbitrary expensive card');

const goals=['premium','points','miles','payback','save_fees','abroad','unsure'];
const travel=['rare','low','mid','high'];
const spend=['low','mid','high','very_high'];
const fees=['zero','small','medium','value'];
const ecosystems=['none','mr','miles_more','payback'];
const freePriorities=['payback','miles_more','acceptance'];
let checked=0;
for(const goal of goals){
 for(const t of travel){
  for(const s of spend){
   for(const fee of fees){
    const priorities=goal==='save_fees'?freePriorities:[''];
    for(const eco of ecosystems){
     for(const freePriority of priorities){
      const a={goal,travel:t,spend:s,fee,ecosystem:eco,freePriority};
      const result=engine.decide(catalog,a);checked++;
      if(result.kind==='match'){
       assert(result.ranked.length>0,'a match must contain at least one ranked card');
       const required=engine.requiredFeatures(a);
       const cap=engine.FEE_CAP[fee];
       for(const item of result.ranked){
        assert(Number(item.card.monthlyFeeEUR)<=cap,`${item.card.id} exceeds selected fee cap`);
        for(const feature of required)assert(item.card.features.includes(feature),`${item.card.id} misses hard feature ${feature} for goal ${goal}`);
       }
      }
      if(result.kind==='scope')assert(goal==='abroad'||(goal==='save_fees'&&freePriority==='acceptance'),'scope exit only allowed for actual acceptance/abroad paths');
     }
    }
   }
  }
 }
}
assert(checked>2500,'exhaustive decision matrix should cover thousands of answer combinations');

for(const id of ['amex_payback','amex_green','amex_gold','amex_platinum','mm_myflex','mm_blue','mm_gold'])assert(byId(id),`missing checked card ${id}`);
for(const card of catalog.cards){assert(/^https:\/\//.test(card.officialUrl),`${card.id} needs official https URL`);assert(Number.isFinite(Number(card.monthlyFeeEUR)),`${card.id} needs numeric monthly fee`);}

console.log(`VAYQUO card advisor gates: OK (${checked} decision combinations checked)`);
