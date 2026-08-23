(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VAYQUOCardTierPolicy=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';

 function review(catalog,answer,decision,engine){
  if(decision?.kind!=='match'||!engine?.FEE_CAP)return null;
  const winner=decision.ranked?.[0]?.card||null;
  if(!winner)return null;
  const cap=Number(engine.FEE_CAP[answer?.fee]);
  const winnerFee=Number(winner.monthlyFeeEUR||0);
  if(!Number.isFinite(cap)||cap<=winnerFee)return null;
  const alternatives=(decision.ranked||[])
   .map(item=>item?.card)
   .filter(card=>card&&Number(card.monthlyFeeEUR)>winnerFee&&Number(card.monthlyFeeEUR)<=cap)
   .slice(0,2)
   .map(card=>({id:card.id,name:card.name,monthlyFeeEUR:Number(card.monthlyFeeEUR)||0}));
  if(!alternatives.length)return null;
  return {
   winnerId:winner.id,
   winnerName:winner.name,
   winnerFee,
   feeCap:cap,
   goal:answer?.goal||'',
   travel:answer?.travel||'',
   alternatives
  };
 }

 return {review};
});
