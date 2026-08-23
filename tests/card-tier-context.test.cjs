const fs=require('fs');
const assert=require('assert');
const engine=require('../v28-card-advisor-engine.js');
const policy=require('../v43-card-tier-policy.js');

const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));
const ui=fs.readFileSync('v43-card-tier-context.js','utf8');
const loader=fs.readFileSync('v24-card-check.js','utf8');

assert(loader.includes('v43-card-tier-policy.js?v=4301'),'loader must load higher-tier policy');
assert(loader.includes('v43-card-tier-context.js?v=4301'),'loader must load higher-tier explanation');
assert(ui.includes('WARUM NICHT TEURER?'),'result must explain why the fee ceiling was not exhausted');
assert(ui.includes('Das ist ein Maximum, kein Ziel.'),'result must explain that the selected fee is a ceiling, not a target');
assert(!ui.includes('MutationObserver'),'higher-tier explanation must not add another mutation observer');

const answer={goal:'points',travel:'low',spend:'mid_high',fee:'value',ecosystem:'miles_more',freePriority:''};
let d=engine.decide(catalog,answer);
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'amex_green');
let review=policy.review(catalog,answer,d,engine);
assert(review,'60 EUR flexible-points profile should get a higher-tier explanation');
assert.strictEqual(review.winnerId,'amex_green');
assert.strictEqual(review.feeCap,60);
assert.deepStrictEqual(review.alternatives.map(x=>x.id),['amex_gold','amex_platinum']);

const smallBudget={...answer,fee:'small'};
d=engine.decide(catalog,smallBudget);
review=policy.review(catalog,smallBudget,d,engine);
assert.strictEqual(review,null,'no higher-tier explanation should appear when no more expensive matching card fits the chosen fee ceiling');

const zeroBudget={goal:'payback',travel:'low',spend:'mid_low',fee:'zero',ecosystem:'payback',freePriority:''};
d=engine.decide(catalog,zeroBudget);
review=policy.review(catalog,zeroBudget,d,engine);
assert.strictEqual(review,null,'zero-fee recommendations must not invent higher-tier comparisons outside the fee ceiling');

const goals=['premium','points','miles','payback','save_fees','abroad','unsure'];
const travel=['rare','low','mid','high'];
const spend=['low','mid_low','mid_high','high','very_high'];
const fees=['zero','small','medium','value'];
const ecosystems=['none','mr','miles_more','payback'];
const freePriorities=['payback','miles_more','acceptance'];
let checked=0;
for(const goal of goals){
 for(const t of travel){
  for(const s of spend){
   for(const fee of fees){
    const priorities=goal==='save_fees'?freePriorities:[''];
    for(const ecosystem of ecosystems){
     for(const freePriority of priorities){
      const a={goal,travel:t,spend:s,fee,ecosystem,freePriority};
      const result=engine.decide(catalog,a);
      const before=result.kind==='match'?result.ranked[0]?.card?.id:null;
      const r=policy.review(catalog,a,result,engine);
      const after=result.kind==='match'?result.ranked[0]?.card?.id:null;
      assert.strictEqual(after,before,'higher-tier explanation must never mutate the recommendation');
      if(r){
       assert(r.alternatives.length>0,'a higher-tier review needs at least one actual affordable alternative');
       assert(r.alternatives.every(x=>x.monthlyFeeEUR>r.winnerFee&&x.monthlyFeeEUR<=r.feeCap),'higher-tier alternatives must stay above the winner and inside the selected fee ceiling');
      }
      checked++;
     }
    }
   }
  }
 }
}
assert.strictEqual(checked,2880,'higher-tier explanation must be exercised across the complete decision matrix');

console.log(`VAYQUO higher-tier context gates: OK (${checked} decisions checked; recommendation remains unchanged)`);
