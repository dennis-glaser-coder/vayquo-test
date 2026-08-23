const fs=require('fs');
const assert=require('assert');
const engine=require('../v28-card-advisor-engine.js');
const policy=require('../v42-card-ecosystem-policy.js');

const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));
const ui=fs.readFileSync('v42-card-ecosystem-context.js','utf8');
const loader=fs.readFileSync('v24-card-check.js','utf8');

assert(loader.includes('v42-card-ecosystem-policy.js?v=4201'),'loader must load ecosystem policy before advisor UI');
assert(loader.includes('v42-card-ecosystem-context.js?v=4201'),'loader must load ecosystem result explanation');
assert(loader.includes("policy.addEventListener('load',loadTierPolicy,{once:true})"),'ecosystem policy must hand off to tier policy before advisor UI');
assert(loader.includes("tierPolicy.addEventListener('load',loadUi,{once:true})"),'advisor UI must start only after the policy chain has loaded');
assert(loader.includes("ecosystem.addEventListener('load',loadTierContext,{once:true})"),'ecosystem result explanation must hand off to tier context');
assert(loader.includes("tier.addEventListener('load',loadCta,{once:true})"),'provider CTA must start only after ecosystem/tier context');
assert(ui.includes('DEIN BESTEHENDES PROGRAMM'),'result must make the ecosystem check visible');
assert(ui.includes('wurde mitgeprüft'),'result must explicitly say when another ecosystem was checked');
assert(!ui.includes('MutationObserver'),'ecosystem explanation must not introduce another global mutation loop');

const answer=(overrides={})=>({goal:'points',travel:'low',spend:'mid_high',fee:'small',ecosystem:'none',freePriority:'',...overrides});

let d=engine.decide(catalog,answer({ecosystem:'miles_more'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.ranked[0].card.id,'amex_green','explicit flexible-points goal must remain primary');
let review=policy.review(catalog,answer({ecosystem:'miles_more'}),d,engine);
assert(review,'Miles & More must be explicitly reviewed for a flexible-points user who already collects there');
assert.strictEqual(review.kind,'primary_goal_wins');
assert.strictEqual(review.winnerId,'amex_green');
assert.strictEqual(review.challenger?.id,'mm_blue','best affordable direct Miles & More challenger should be identified');
assert(review.missingPrimary.includes('mr'),'Miles & More challenger must be rejected transparently because it misses flexible-MR fit');

d=engine.decide(catalog,answer({ecosystem:'mr'}));
review=policy.review(catalog,answer({ecosystem:'mr'}),d,engine);
assert.strictEqual(review?.kind,'aligned','existing Membership Rewards should align with an MR winner');
assert.strictEqual(review?.winnerId,'amex_green');

d=engine.decide(catalog,answer({goal:'miles',ecosystem:'miles_more'}));
review=policy.review(catalog,answer({goal:'miles',ecosystem:'miles_more'}),d,engine);
assert.strictEqual(review?.kind,'aligned','direct Miles & More goal plus existing Miles & More must be recognized as aligned');

d=engine.decide(catalog,answer({goal:'points',ecosystem:'payback'}));
review=policy.review(catalog,answer({goal:'points',ecosystem:'payback'}),d,engine);
assert.strictEqual(review?.kind,'primary_goal_wins');
assert.strictEqual(review?.challenger?.id,'amex_payback');

for(const goal of ['save_fees','abroad','unsure']){
 d=engine.decide(catalog,answer({goal,ecosystem:'miles_more',fee:goal==='save_fees'?'zero':'value',freePriority:goal==='save_fees'?'miles_more':''}));
 review=policy.review(catalog,answer({goal,ecosystem:'miles_more'}),d,engine);
 assert.strictEqual(review,null,`${goal} repurposes the final question and must not pretend it represents an existing ecosystem`);
}

const goals=['premium','points','miles','payback','save_fees','abroad','unsure'];
const travel=['rare','low','mid','high'];
const spend=['low','mid_low','mid_high','high','very_high'];
const fees=['zero','small','medium','value'];
const ecosystems=['none','mr','miles_more','payback'];
const freePriorities=['payback','miles_more','acceptance'];
let checked=0,reviewed=0;
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
      assert.strictEqual(after,before,'ecosystem explanation must never mutate the recommendation decision');
      if(r)reviewed++;
      checked++;
     }
    }
   }
  }
 }
}
assert.strictEqual(checked,2880,'ecosystem review must be exercised across the complete existing decision matrix');
assert(reviewed>0,'ecosystem review should be active for eligible matched decisions');

console.log(`VAYQUO ecosystem context gates: OK (${checked} decisions reviewed; ${reviewed} ecosystem explanations; primary goal remains authoritative)`);
