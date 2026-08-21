const fs=require('fs');
const assert=require('assert');
const engine=require('../v28-card-advisor-engine.js');

const ui=fs.readFileSync('v28-card-advisor.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

for(const label of ['unter 500 €','500–749 €','750–1.499 €','1.500–3.000 €','über 3.000 €']){
 assert(ui.includes(label),`missing refined monthly spend option ${label}`);
}
assert(!ui.includes("mid:'500–1.500 €'"),'legacy broad 500–1.500 EUR bucket must be removed');
assert(ui.includes('mapHas(SPEND,saved.spend)?saved.spend'), 'legacy/unknown saved spend values must force a fresh valid selection');
assert(ui.includes('tatsächlicher Jahresumsatz über 9.000 €'),'Amex Green fee-waiver explanation must remain conditional on actual annual spend');

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
    for(const eco of ecosystems){
     for(const freePriority of priorities){
      const answer={goal,travel:t,spend:s,fee,ecosystem:eco,freePriority};
      const result=engine.decide(catalog,answer);checked++;
      assert.notStrictEqual(result.kind,'scope','all currently supported paths must stay inside the audited card market');
      if(result.kind==='match'){
       assert(result.ranked.length>0,'match must contain at least one card');
       const required=engine.requiredFeatures(answer);
       const cap=engine.FEE_CAP[fee];
       for(const item of result.ranked){
        assert(Number(item.card.monthlyFeeEUR)<=cap,`${item.card.id} exceeds selected fee cap`);
        for(const feature of required)assert(item.card.features.includes(feature),`${item.card.id} misses hard feature ${feature}`);
       }
      }
     }
    }
   }
  }
 }
}
assert.strictEqual(checked,2880,'refined answer matrix size changed unexpectedly');

const pointsMidHigh=engine.decide(catalog,{goal:'points',travel:'low',spend:'mid_high',fee:'small',ecosystem:'none',freePriority:''});
assert.strictEqual(pointsMidHigh.kind,'match');
assert.strictEqual(pointsMidHigh.ranked[0].card.id,'amex_green');

console.log(`VAYQUO card advisor V29 gates: OK (${checked} refined decision combinations checked)`);
