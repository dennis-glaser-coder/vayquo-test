const fs=require('fs');
const assert=require('assert');
const engine=require('../v28-card-advisor-engine.js');

const ui=fs.readFileSync('v28-card-advisor.js','utf8');
const unsureUx=fs.readFileSync('v31-card-advisor-unsure-ux.js','utf8');
const abroadUx=fs.readFileSync('v28-card-advisor-abroad-ux.js','utf8');
const providerCta=fs.readFileSync('v28-card-advisor-provider-cta.js','utf8');
const loader=fs.readFileSync('v24-card-check.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(loader.includes('v28-card-advisor-engine.js?v=2803'),'loader must load guided V28 decision engine');
assert(loader.includes('v28-card-advisor.js?v=2803'),'loader must load refreshed V28 advisor UI');
assert(loader.includes('v31-card-advisor-unsure-ux.js?v=3101'),'loader must load guided unsure UX after advisor UI');
assert(loader.indexOf('v31-card-advisor-unsure-ux.js?v=3101')<loader.indexOf('v28-card-advisor-abroad-ux.js?v=2802'),'unsure UX must initialize before abroad UX');
assert(loader.includes('v28-card-advisor-abroad-ux.js?v=2802'),'loader must load abroad UX after advisor UI');
assert(loader.includes('v28-card-advisor-provider-cta.js?v=2802'),'loader must load audited provider CTA after abroad UX');
assert(loader.includes('[data-view="start"]'),'loader must recognize the real start nav directly');
assert(loader.includes('v28-card-advisor-start-marker'),'loader must maintain a start marker');
assert(ui.includes('const STEP_COUNT=5'),'advisor must stay short and simple');
assert(ui.includes('Wie viel zahlst du ungefähr pro Monat mit Karte?'),'spend question must state monthly timeframe');
assert(ui.includes('Für einzelne Gebührenvorteile zählt später dein tatsächlicher Jahresumsatz.'),'spend helper must explain annual-spend caveat');
assert(ui.includes("key:'freePriority'"),'zero-fee discriminator must use its own state key');
assert(ui.includes('Keine Provision beeinflusst die Empfehlung.'),'ranking independence disclosure must remain visible');
assert(ui.includes('href="${esc(best.officialUrl)}"'),'provider detail link must use the recommended card official URL');
assert(unsureUx.includes('Was klingt spontan am ehesten nach dir?'),'unsure path must ask a simple preference instead of giving up');
for(const phrase of ['gute Karte ohne laufende Gebühr','Punkte & Prämien holen','komfortabler werden','häufig im Ausland'])assert(unsureUx.includes(phrase),`unsure UX missing plain-language option ${phrase}`);
assert(unsureUx.includes("next.disabled=true"),'unsure final step must force a fresh choice instead of reusing stale ecosystem state');
assert(unsureUx.includes('DEIN SCHWERPUNKT'),'unsure result must explain the inferred focus instead of repeating that the user is unsure');
assert(abroadUx.includes('Was ist dir im Ausland am wichtigsten?'),'abroad final question must ask about actual travel needs');
assert(abroadUx.includes('Auch Bargeld im Ausland möglichst günstig abheben'),'abroad UX must offer a cash priority');
assert(abroadUx.includes('Eine Reiseversicherung ist mir wichtig'),'abroad UX must offer an insurance priority');
assert(abroadUx.includes("next.disabled=true"),'abroad UX must force a fresh final choice instead of reusing a stale ecosystem answer');
assert(abroadUx.includes("fetch('config/vayquo-card-advisor.de.json?v=2802'"),'abroad result reasons must come from the audited catalog');
assert(providerCta.includes("closest?.('.v28ca-select')"),'primary card CTA must be captured');
assert(providerCta.includes("closest?.('.v28ca-provider[href]')"),'secondary provider detail link must also be captured');
assert(providerCta.includes('ev.preventDefault()'),'secondary provider link must not bypass the provider guard');
assert(providerCta.includes("querySelector('.v28ca-provider[href]')"),'primary CTA must reuse the exact provider URL rendered for the winner');
assert(providerCta.includes("url.protocol!=='https:'"),'provider redirect must reject non-HTTPS destinations');
assert(providerCta.includes('ALLOWED_PROVIDER_HOSTS'),'provider redirect must be limited to audited provider domains');
assert(providerCta.includes('goToProvider(detailLink.getAttribute(\'href\'))'),'secondary link must pass through the same allowlist function');
for(const host of ['www.americanexpress.com','www.miles-and-more-kreditkarte.com','www.banknorwegian.de','www.hanseaticbank.de','tfbank.de'])assert(providerCta.includes(host),`provider CTA allowlist missing ${host}`);
assert(providerCta.includes('window.location.assign(safe)'),'guarded provider CTA must continue only to the validated provider page');
assert(!ui.includes('planningReference'),'commission planning data must not enter recommendation logic');
assert.strictEqual(catalog.checkedAt,'2026-08-21');
assert.strictEqual(catalog.principles.commissionMayNotAffectRanking,true);
assert.strictEqual(catalog.principles.providerTermsWin,true);

const byId=id=>catalog.cards.find(card=>card.id===id);
const paybackAmex=byId('amex_payback');
assert(paybackAmex,'PAYBACK American Express must remain in the checked catalog');
assert.strictEqual(paybackAmex.officialUrl,'https://www.americanexpress.com/de-de/kreditkarte/payback-karte/','PAYBACK Amex must point to the checked official product page');
const amexGreen=byId('amex_green');
assert(amexGreen.facts.some(x=>x.includes('9.000 Euro Jahresumsatz')),'Amex Green conditional fee waiver must be documented');
const answer=(overrides={})=>({goal:'points',travel:'low',spend:'mid_low',fee:'small',ecosystem:'none',freePriority:'',...overrides});

let d=engine.decide(catalog,answer({goal:'premium',travel:'high',fee:'medium'}));
assert.strictEqual(d.kind,'no_match','premium lounge goal must not fall back to Gold when Platinum is over budget');
assert.strictEqual(d.reason,'budget');
assert.strictEqual(d.nearest?.id,'amex_platinum');

d=engine.decide(catalog,answer({goal:'premium',travel:'rare',fee:'value'}));
assert.strictEqual(d.kind,'conflict','rare travelers must not receive an expensive premium recommendation just for selecting lounge');

d=engine.decide(catalog,answer({goal:'points',fee:'zero'}));
assert.strictEqual(d.kind,'no_match','flexible-points goal with 0 EUR budget needs a relevant budget no-match');
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
assert.strictEqual(d.kind,'match','high-acceptance zero-fee path must now use verified Visa/Mastercard products');
assert.strictEqual(d.ranked[0].card.id,'bank_norwegian_visa');
assert(engine.requiredFeatures(answer({goal:'save_fees',freePriority:'acceptance'})).includes('no_fx'));

for(const ecosystem of ['none','mr','miles_more','payback']){
 d=engine.decide(catalog,answer({goal:'abroad',fee:'zero',ecosystem}));
 assert.strictEqual(d.kind,'match',`abroad path ${ecosystem} must return a verified market result`);
 assert.strictEqual(d.ranked[0].card.id,'bank_norwegian_visa',`audited overall abroad winner changed for priority mapping ${ecosystem}`);
 assert(d.ranked.every(item=>item.card.features.includes('high_acceptance')&&item.card.features.includes('no_fx')),'every abroad result must meet hard acceptance and FX requirements');
}
assert(engine.requiredFeatures(answer({goal:'abroad'})).includes('high_acceptance'));
assert(engine.requiredFeatures(answer({goal:'abroad'})).includes('no_fx'));

// „Ich weiß es noch nicht“ must become a guided recommendation path.
d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'',fee:'value'}));
assert.strictEqual(d.kind,'needs_preference','unsure must only stop before the user has answered the guided final question');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'none',fee:'zero'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.effectiveAnswer.goal,'save_fees');
assert.strictEqual(d.ranked[0].card.id,'bank_norwegian_visa');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'mr',fee:'zero'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.effectiveAnswer.goal,'payback');
assert.strictEqual(d.ranked[0].card.id,'amex_payback');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'mr',fee:'small'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.effectiveAnswer.goal,'points');
assert.strictEqual(d.ranked[0].card.id,'amex_green');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'miles_more',travel:'high',fee:'value'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.effectiveAnswer.goal,'premium');
assert.strictEqual(d.ranked[0].card.id,'amex_platinum');

d=engine.decide(catalog,answer({goal:'unsure',ecosystem:'payback',fee:'zero'}));
assert.strictEqual(d.kind,'match');
assert.strictEqual(d.effectiveAnswer.goal,'abroad');
assert.strictEqual(d.ranked[0].card.id,'bank_norwegian_visa');

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
      const a={goal,travel:t,spend:s,fee,ecosystem:eco,freePriority};
      const result=engine.decide(catalog,a);checked++;
      assert.notStrictEqual(result.kind,'scope','verified current catalog should not route supported user goals to an unverified market scope');
      if(result.kind==='match'){
       assert(result.ranked.length>0,'a match must contain at least one ranked card');
       const required=engine.requiredFeatures(a);
       const cap=engine.FEE_CAP[fee];
       for(const item of result.ranked){
        assert(Number(item.card.monthlyFeeEUR)<=cap,`${item.card.id} exceeds selected fee cap`);
        for(const feature of required)assert(item.card.features.includes(feature),`${item.card.id} misses hard feature ${feature} for goal ${goal}`);
       }
      }
     }
    }
   }
  }
 }
}
assert.strictEqual(checked,2880,'decision matrix size changed unexpectedly; update the expected count intentionally if answer dimensions change');

const allowedProviderHosts=new Set(['www.americanexpress.com','www.miles-and-more-kreditkarte.com','www.banknorwegian.de','www.hanseaticbank.de','tfbank.de']);
for(const id of ['amex_payback','amex_green','amex_gold','amex_platinum','mm_myflex','mm_blue','mm_gold','bank_norwegian_visa','hanseatic_genialcard','tf_mastercard_gold'])assert(byId(id),`missing checked card ${id}`);
for(const card of catalog.cards){
 assert(/^https:\/\//.test(card.officialUrl),`${card.id} needs official https URL`);
 const official=new URL(card.officialUrl);
 assert(allowedProviderHosts.has(official.hostname),`${card.id} official URL points outside audited provider hosts`);
 assert(Number.isFinite(Number(card.monthlyFeeEUR)),`${card.id} needs numeric monthly fee`);
 assert(Array.isArray(card.sourceUrls)&&card.sourceUrls.length>0,`${card.id} needs at least one audit source URL`);
 for(const url of card.sourceUrls)assert(/^https:\/\//.test(url),`${card.id} audit source must be https`);
}

console.log(`VAYQUO card advisor gates: OK (${checked} decision combinations checked; guided unsure path; ${catalog.cards.length} audited cards; both provider CTAs guarded)`);
