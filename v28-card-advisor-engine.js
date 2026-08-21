(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.VAYQUOCardAdvisorEngine=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const FEE_CAP={zero:0,small:6,medium:20,value:60};
  const GOAL_REQUIRED={
    premium:['lounge','premium_travel'],
    points:['mr'],
    miles:['miles_direct'],
    payback:['payback'],
    save_fees:['free']
  };

  function feeCap(answer){return FEE_CAP[answer]??0;}
  function hasAll(card,features){return features.every(feature=>card.features?.includes(feature));}
  function requiredFeatures(a){
    const base=[...(GOAL_REQUIRED[a.goal]||[])];
    if(a.goal==='save_fees'&&a.freePriority==='payback')base.push('payback');
    if(a.goal==='save_fees'&&a.freePriority==='miles_more')base.push('miles_direct');
    return [...new Set(base)];
  }
  function scopeExit(a){
    if(a.goal==='abroad')return 'acceptance_market';
    if(a.goal==='save_fees'&&a.freePriority==='acceptance')return 'acceptance_market';
    return null;
  }
  function usageConflict(a){
    if(a.goal==='premium'&&a.travel==='rare')return {
      code:'premium_rare_travel',
      title:'Premium-Wunsch und Nutzung passen noch nicht zusammen.',
      copy:'Du hast Lounge- und Premium-Reisevorteile gewählt, reist aber fast nie. Auf dieser Basis empfiehlt VAYQUO keine teure Premiumkarte.'
    };
    return null;
  }
  function score(card,a){
    let s=0;
    const has=f=>card.features?.includes(f);
    const reward=r=>card.rewards?.includes(r);

    if(a.goal==='premium'){
      if(has('lounge'))s+=12;if(has('premium_travel'))s+=10;if(has('travel_credit'))s+=4;if(has('insurance'))s+=3;if(has('mr'))s+=2;
    }else if(a.goal==='points'){
      if(has('mr'))s+=14;if(has('insurance')&&(a.travel==='mid'||a.travel==='high'))s+=2;
    }else if(a.goal==='miles'){
      if(has('miles_direct'))s+=14;if(has('miles_expiry_protection')&&a.ecosystem==='miles_more')s+=4;if(has('insurance')&&(a.travel==='mid'||a.travel==='high'))s+=3;
    }else if(a.goal==='payback'){
      if(has('payback'))s+=16;if(has('free'))s+=4;
    }else if(a.goal==='save_fees'){
      if(has('free'))s+=16;if(a.freePriority==='payback'&&has('payback'))s+=10;if(a.freePriority==='miles_more'&&has('miles_direct'))s+=10;
    }else if(a.goal==='unsure'){
      if(Number(card.monthlyFeeEUR)===0)s+=5;
      if(a.ecosystem==='mr'&&has('mr'))s+=7;
      if(a.ecosystem==='miles_more'&&has('miles_direct'))s+=7;
      if(a.ecosystem==='payback'&&has('payback'))s+=7;
      if((a.travel==='mid'||a.travel==='high')&&has('insurance'))s+=2;
      if(a.travel==='high'&&has('lounge'))s+=1;
      if(Number(card.monthlyFeeEUR)>=40)s-=5;
    }

    if(a.travel==='high'){
      if(has('insurance'))s+=2;if(has('lounge')&&a.goal==='premium')s+=2;
    }else if(a.travel==='mid'&&has('insurance'))s+=1;

    if(a.spend==='high'||a.spend==='very_high'){
      if(a.ecosystem==='mr'&&reward('mr'))s+=2;
      if(a.ecosystem==='miles_more'&&reward('miles_more'))s+=2;
      if(a.ecosystem==='payback'&&reward('payback'))s+=2;
    }

    s-=Number(card.monthlyFeeEUR||0)*0.08;
    return s;
  }
  function cheapestMatching(cards,required){
    return cards.filter(card=>hasAll(card,required)).sort((a,b)=>Number(a.monthlyFeeEUR)-Number(b.monthlyFeeEUR))[0]||null;
  }
  function decide(catalog,a){
    const scope=scopeExit(a);
    if(scope)return {kind:'scope',scope,required:[],ranked:[]};

    const conflict=usageConflict(a);
    if(conflict)return {kind:'conflict',conflict,required:requiredFeatures(a),ranked:[]};

    if(a.goal==='unsure'&&(!a.ecosystem||a.ecosystem==='none')){
      return {kind:'needs_preference',required:[],ranked:[]};
    }

    const cards=Array.isArray(catalog?.cards)?catalog.cards:[];
    const required=requiredFeatures(a);
    const matching=required.length?cards.filter(card=>hasAll(card,required)):cards.slice();
    const cap=feeCap(a.fee);
    const affordable=matching.filter(card=>Number(card.monthlyFeeEUR)<=cap);

    if(!affordable.length){
      const nearest=cheapestMatching(cards,required);
      return {kind:'no_match',reason:nearest?'budget':'feature',required,nearest,ranked:[]};
    }

    const ranked=affordable.map(card=>({card,score:score(card,a)})).sort((x,y)=>y.score-x.score||Number(x.card.monthlyFeeEUR)-Number(y.card.monthlyFeeEUR)||String(x.card.name).localeCompare(String(y.card.name),'de'));
    return {kind:'match',required,ranked};
  }

  return {FEE_CAP,requiredFeatures,scopeExit,usageConflict,score,decide};
});
