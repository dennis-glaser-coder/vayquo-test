(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VAYQUOCardEcosystemPolicy=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';

 const ECOSYSTEMS={
  mr:{label:'Membership Rewards',goal:'points',feature:'mr'},
  miles_more:{label:'Miles & More',goal:'miles',feature:'miles_direct'},
  payback:{label:'PAYBACK',goal:'payback',feature:'payback'}
 };
 const PRIMARY_GOALS=new Set(['premium','points','miles','payback']);
 const GOAL_LABELS={
  premium:'mehr Komfort auf Reisen',
  points:'flexible Punkte',
  miles:'direkt Miles & More-Meilen',
  payback:'PAYBACK Punkte'
 };

 function review(catalog,answer,decision,engine){
  const a={...(answer||{})};
  const ecosystem=ECOSYSTEMS[a.ecosystem];
  if(!ecosystem||!PRIMARY_GOALS.has(a.goal)||decision?.kind!=='match')return null;
  const winner=decision.ranked?.[0]?.card||null;
  if(!winner)return null;
  const base={
   ecosystem:a.ecosystem,
   ecosystemLabel:ecosystem.label,
   primaryGoal:a.goal,
   primaryGoalLabel:GOAL_LABELS[a.goal]||'dein Hauptziel',
   winnerId:winner.id,
   winnerName:winner.name
  };
  if(winner.features?.includes(ecosystem.feature))return {...base,kind:'aligned'};

  if(!engine?.decide||!engine?.requiredFeatures)return {...base,kind:'primary_goal_wins',challenger:null,missingPrimary:[]};
  const challengeAnswer={...a,goal:ecosystem.goal};
  const challengeDecision=engine.decide(catalog,challengeAnswer);
  const challenger=challengeDecision?.kind==='match'?(challengeDecision.ranked?.[0]?.card||null):null;
  const primaryRequired=engine.requiredFeatures(a);
  const missingPrimary=challenger?primaryRequired.filter(feature=>!challenger.features?.includes(feature)):primaryRequired.slice();
  return {
   ...base,
   kind:'primary_goal_wins',
   challenger:challenger?{id:challenger.id,name:challenger.name,monthlyFeeEUR:Number(challenger.monthlyFeeEUR)||0}:null,
   missingPrimary
  };
 }

 return {ECOSYSTEMS,GOAL_LABELS,review};
});
