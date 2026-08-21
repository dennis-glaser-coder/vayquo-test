const fs=require('fs');
const path=require('path');
const assert=require('assert');
const vm=require('vm');
const E=require('../v25-engine-v2.js');
const rules=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/vayquo-optimizer-rules.de.json'),'utf8'));
const approx=(a,b,eps=1e-8)=>Math.abs(a-b)<=eps;

assert(approx(E.pbCashValue(rules),0.01),'PAYBACK cash value must be 1 cent');
assert(approx(E.mrFloorPerPoint(rules),1/300),'MR floor must follow MR→PAYBACK 3:1');

let r=E.evaluate({target:'payback_de',cash:300,award:10000,copay:0,balances:{pb:5000,mr:0,mm:0},comparable:true},rules);
assert.strictEqual(r.code,'PB_SHORTFALL','PAYBACK insufficient balance must block redemption');

r=E.evaluate({target:'mr_de',cash:500,award:80000,copay:0,balances:{mr:40000,pb:0,mm:0},comparable:true},rules);
assert.strictEqual(r.code,'MR_DIRECT_SHORTFALL','MR insufficient balance must block direct redemption');

r=E.evaluate({target:'miles_and_more',cash:500,award:1000,copay:50,balances:{mm:900,pb:200,mr:0},comparable:true},rules);
assert.strictEqual(r.code,'MM_TOPUP_PB','PAYBACK top-up should be possible');
assert.strictEqual(r.details.find(d=>d.label==='pb_needed').value,200,'PAYBACK→M&M minimum transfer must be 200');

const qatar=E.bestMrPath(rules,'qatar_privilege',40000);
assert(qatar,'Qatar path should exist');
assert.strictEqual(qatar.path.join('>'),'mr_de>ba_club>qatar_privilege','Qatar should use cheaper BA Avios path');
assert.strictEqual(qatar.source,50000,'40k Qatar Avios should require 50k MR through BA path');

assert.strictEqual(E.bestMrPath(rules,'miles_and_more',1000),null,'Unverified MR→PAYBACK→M&M chain must stay blocked');

r=E.evaluate({target:'payback_de',cash:150,award:10000,copay:0,balances:{pb:10000,mr:0,mm:0},comparable:true},rules);
assert.strictEqual(r.code,'PB_BEATS_CASH','1.5 cent PAYBACK redemption should beat 1 cent cash floor');

r=E.evaluate({target:'payback_de',cash:80,award:10000,copay:0,balances:{pb:10000,mr:0,mm:0},comparable:true},rules);
assert.strictEqual(r.code,'PB_CASH_BETTER','0.8 cent PAYBACK redemption should lose to cash floor');

r=E.evaluate({target:'qatar_privilege',cash:1200,award:40000,copay:150,existing:0,balances:{mr:50000,pb:0,mm:0},comparable:true},rules);
assert.strictEqual(r.code,'AWARD_BEATS_FLOOR','Strong Qatar award should beat MR cash floor');

const bridge=fs.readFileSync(path.join(__dirname,'../v25-classic-engine-bridge.js'),'utf8');
assert.doesNotThrow(()=>new vm.Script(bridge),'Classic bridge must parse as valid JavaScript');
const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const asset of ['v25-engine-v2.js','v25-engine-selftest-v2.js','v25-classic-engine-bridge.js']){
  assert(index.includes(asset),`Classic index must load ${asset}`);
}

console.log('VAYQUO engine and classic bridge tests passed');