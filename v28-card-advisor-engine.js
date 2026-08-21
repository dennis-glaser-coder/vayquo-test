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
    save_fees:['free'],
    abroad:['high_acceptance','no_fx']
  };

  function feeCap(answer){return FEE_CAP[answer]??0;}
  function hasAll(card,features){return features.every(feature=>card.features?.includes(feature));}
  function requiredFeatures(a){
    const base=[...(GOAL_REQUIRED[a.goal]||[])];
    if(a.goal==='save_fees'&&a.freePriority==='payback')base.push('payback');
    if(a.goal==='save_fees'&&a.freePriority==='miles_more')base.push('miles_direct');
    if(a.goal==='save_fees'&&a.freePriority==='acceptance')base.push('high_acceptance','no_fx');
    return [...new Set(base)];
  }
  function scopeExit(){return null;}
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
      if(has('mr'))s+=14;if(has('insurance')&&(a.travel==='mid'||a.travel==='high'))s+=2;if(has('insurance_basic')&&(a.travel==='mid'||a.travel==='high'))s+=0.8;
    }else if(a.goal==='miles'){
      if(has('miles_direct'))s+=14;if(has('miles_expiry_protection')&&a.ecosystem==='miles_more')s+=4;if(has('insurance')&&(a.travel==='mid'||a.travel==='high'))s+=3;
    }else if(a.goal==='payback'){
      if(has('payback'))s+=16;if(has('free'))s+=4;
    }else if(a.goal==='save_fees'){
      if(has('free'))s+=16;
      if(a.freePriority==='payback'&&has('payback'))s+=10;
      if(a.freePriority==='miles_more'&&has('miles_direct'))s+=10;
      if(a.freePriority==='acceptance'){
        if(has('high_acceptance'))s+=10;
        if(has('no_fx'))s+=10;
        if(has('free_cash_abroad'))s+=3;
        if(has('free_cash_domestic'))s+=1;
        if(has('cash_interest_free_if_full_payment'))s+=2;
        if(has('insurance_included'))s+=1;
      }
    }else if(a.goal==='abroad'){
      if(has('high_acceptance'))s+=14;
      if(has('no_fx'))s+=12;
      if(has('free'))s+=3;
      if(a.ecosystem==='none'){
        if(has('no_fx'))s+=3;
        if(has('high_acceptance'))s+=2;
      }else if(a.ecosystem==='mr'){
        if(has('free_cash_abroad'))s+=7;
        if(has('free_cash_domestic'))s+=2;
        if(has('cash_interest_free_if_full_payment'))s+=5;
      }else if(a.ecosystem==='miles_more'){
        if(has('insurance_included'))s+=8;
      }else if(a.ecosystem==='payback'){
        if(has('free_cash_abroad'))s+=3;
        if(has('insurance_included'))s+=4;
        if(has('cash_interest_free_if_full_payment'))s+=3;
      }
      if(has('free_cash_abroad'))s+=2;
      if(has('insurance_included'))s+=1;
    }else if(a.goal==='unsure'){
      if(Number(card.monthlyFeeEUR)===0)s+=5;
      if(a.ecosystem==='mr'&&has('mr'))s+=7;
      if(a.ecosystem==='miles_more'&&has('miles_direct'))s+=7;
      if(a.ecosystem==='payback'&&has('payback'))s+=7;
      if((a.travel==='mid'||a.travel==='high')&&has('insurance'))s+=2;
      if((a.travel==='mid'||a.travel==='high')&&has('insurance_basic'))s+=0.5;
      if(a.travel==='high'&&has('lounge'))s+=1;
      if(Number(card.monthlyFeeEUR)>=40)s-=5;
    }

    if(a.travel==='high'){
      if(has('insurance'))s+=2;
      if(has('insurance_basic'))s+=0.5;
      if(has('lounge')&&a.goal==='premium')s+=2;
    }else if(a.travel==='mid'){
      if(has('insurance'))s+=1;
      if(has('insurance_basic'))s+=0.3;
    }

    if(a.spend==='high'||a.spend==='very_high'){
      if(a.ecosystem==='mr'&&reward('mr'))s+=2;
      if(a.ecosystem==='miles_more'&&reward('miles_more'))s+=2;
      if(a.ecosystem==='payback'&&reward('payback'))s+=2;
      if(card.id==='amex_green')s+=1;
    }

    if(card.id==='tf_mastercard_gold'&&(a.goal==='abroad'||a.freePriority==='acceptance'))s-=2;
    if(card.id==='hanseatic_genialcard'&&a.goal==='abroad'&&!has('free_cash_domestic'))s-=0.5;

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
