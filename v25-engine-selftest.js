(function(root){
'use strict';
function approx(a,b,eps=.00001){return Math.abs(Number(a)-Number(b))<=eps;}
function run(rules){
 const E=root.VayquoEngine;
 const results=[];
 const test=(name,fn)=>{try{const ok=!!fn();results.push({name,ok});}catch(error){results.push({name,ok:false,error:String(error?.message||error)});}};
 if(!E)return {ok:false,results:[{name:'engine loaded',ok:false}]};
 test('PAYBACK cash value is 1 cent',()=>approx(E.pbCashValue(rules),.01));
 test('MR floor follows MR to PAYBACK rule',()=>approx(E.mrFloorPerPoint(rules),1/300));
 test('PAYBACK to M&M respects 200 minimum',()=>{
   const r=E.evaluate({target:'miles_and_more',cash:500,award:1000,copay:50,balances:{mm:900,pb:200,mr:0},comparable:true},rules);
   const x=r.details.find(d=>d.label==='pb_needed');
   return r.code==='MM_TOPUP_PB'&&x&&Number(x.value)===200;
 });
 test('MR to Qatar chooses cheaper allowed Avios path',()=>{
   const p=E.bestMrPath(rules,'qatar_privilege',40000);
   return p&&p.path.join('>')==='mr_de>ba_club>qatar_privilege'&&Number(p.source)===50000;
 });
 test('Unverified MR-PAYBACK-M&M chain stays blocked',()=>E.bestMrPath(rules,'miles_and_more',1000)===null);
 return {ok:results.every(x=>x.ok),results};
}
root.VayquoSelfTest={run};
})(typeof globalThis!=='undefined'?globalThis:this);