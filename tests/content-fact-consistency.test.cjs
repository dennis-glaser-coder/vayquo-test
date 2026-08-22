const fs=require('fs');
const path=require('path');
const assert=require('assert');

const read=file=>fs.readFileSync(file,'utf8');
const json=file=>JSON.parse(read(file));
const governance=json('config/vayquo-fact-governance.de.json');
const optimizer=json(governance.canonicalSources.optimizerRules);
const programFacts=json(governance.canonicalSources.programFacts);
const cards=json(governance.canonicalSources.cardCatalog);

function sorted(values){return [...values].sort((a,b)=>a.localeCompare(b,'en'));}
function requireText(file,needle,message){
  const content=read(file);
  assert(content.includes(needle),message||`${file} must contain ${JSON.stringify(needle)}`);
}
function modifiedDate(file){
  const m=read(file).match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
  return m?m[1]:'';
}
function canonicalReviewDate(entry){
  const names=String(entry.canonical||'').split('+').filter(Boolean);
  const dates=[];
  if(names.includes('optimizerRules'))dates.push(optimizer.checkedAt);
  if(names.includes('programFacts'))dates.push(programFacts.checkedAt);
  if(names.includes('cardCatalog'))dates.push(cards.checkedAt);
  return dates.filter(Boolean).sort().at(-1)||'';
}
function assertReviewedAfterCanonical(entry){
  const checkedAt=canonicalReviewDate(entry);
  if(!checkedAt)return;
  const date=modifiedDate(entry.path);
  assert(date,`${entry.path} must expose dateModified because it publishes dynamic facts`);
  assert(date>=checkedAt,`${entry.path} (${date}) is older than canonical fact source (${checkedAt})`);
}
function directTransfer(from,to){
  return optimizer.directTransfers.find(x=>x.from===from&&x.to===to&&x.status==='active');
}
function interTransfer(from,to){
  return optimizer.interProgramTransfers.find(x=>x.from===from&&x.to===to&&x.status==='active');
}
function de2(value){return Number(value).toFixed(2).replace('.',',');}

// 1) Every Ratgeber page is explicitly classified. A new page cannot silently bypass fact review.
const actualRatgeber=sorted(fs.readdirSync('ratgeber').filter(name=>name.endsWith('.html')).map(name=>path.posix.join('ratgeber',name)));
const inventory=sorted(governance.ratgeberInventory.map(x=>x.path));
assert.deepStrictEqual(actualRatgeber,inventory,'Every ratgeber/*.html file must be classified in vayquo-fact-governance.de.json');

for(const entry of governance.ratgeberInventory){
  assert(fs.existsSync(entry.path),`Governance inventory references missing file: ${entry.path}`);
  if(entry.classification==='draft_noindex'){
    requireText(entry.path,'noindex','Draft Ratgeber pages must remain noindex until reviewed');
  }
  if(['guarded_dynamic','guarded_partial'].includes(entry.classification))assertReviewedAfterCanonical(entry);
}

// 2) Canonical source files must be recent, structured and tied to official providers.
assert.strictEqual(programFacts.market,'DE','Program facts must be scoped to Germany');
assert(programFacts.checkedAt,'Program facts need checkedAt');
assert(Array.isArray(programFacts.officialSources)&&programFacts.officialSources.length>=1,'Program facts need official sources');
for(const source of programFacts.officialSources){
  assert(/^https:\/\//.test(source.url),`Official source ${source.id} must use HTTPS`);
  const host=new URL(source.url).hostname;
  assert(['www.americanexpress.com','www.miles-and-more.com','www.payback.de'].includes(host),`Unexpected canonical provider host: ${host}`);
}

// 3) Canonical MR -> PAYBACK and PAYBACK -> Miles & More chain must match published copy.
const mrPb=directTransfer('mr_de','payback_de');
const pbMm=interTransfer('payback_de','miles_and_more');
assert(mrPb,'Canonical MR -> PAYBACK route missing');
assert(pbMm,'Canonical PAYBACK -> Miles & More route missing');
const paybackValue=programFacts.paybackDE?.cashValueCentsPerPoint;
assert(Number.isFinite(paybackValue),'Canonical PAYBACK cash value missing');
assert.strictEqual(optimizer.redemptionAlternatives?.paybackCashValue?.valueCentsPerPoint,paybackValue,'Optimizer and program facts disagree on PAYBACK cash value');

const amexToMm='ratgeber/amex-punkte-zu-miles-and-more.html';
requireText(amexToMm,`${mrPb.sourceUnits} Membership Rewards → ${mrPb.targetUnits} PAYBACK Punkt → ${pbMm.targetUnits} Miles & More Meile.`);
requireText(amexToMm,`Verhältnis ${mrPb.sourceUnits}:${mrPb.targetUnits}`);
requireText(amexToMm,`${mrPb.minimumSource} Membership Rewards`);
requireText(amexToMm,`ab ${pbMm.minimumSource} Punkten im Verhältnis ${pbMm.sourceUnits}:${pbMm.targetUnits}`);

// 4) Published MR valuation pages must use the same canonical safe PAYBACK basis.
for(const file of ['ratgeber/amex-punkte-einloesen.html','ratgeber/membership-rewards-wert.html']){
  requireText(file,`${mrPb.sourceUnits}`);
  requireText(file,'PAYBACK');
  requireText(file,`${paybackValue} Cent`);
}
requireText('ratgeber/amex-punkte-einloesen.html',`${mrPb.sourceUnits}:${mrPb.targetUnits}`);
requireText('ratgeber/membership-rewards-wert.html',`${mrPb.sourceUnits} Membership Rewards ergeben ${mrPb.targetUnits} PAYBACK Punkt`);

// 5) Every active MR airline transfer ratio shown publicly follows canonical optimizer rules.
const partnerPage='ratgeber/membership-rewards-transferpartner.html';
const activeAirlineTransfers=optimizer.directTransfers.filter(x=>x.from==='mr_de'&&x.status==='active'&&x.to!=='payback_de');
for(const route of activeAirlineTransfers){
  const label=governance.transferPartnerLabels[route.to];
  assert(label,`Missing public label mapping for canonical MR transfer target: ${route.to}`);
  requireText(partnerPage,`${label} ${route.sourceUnits}:${route.targetUnits}`,`${partnerPage} must match canonical ratio for ${route.to}`);
}
assert(!read(partnerPage).includes('Etihad Guest'),'Disabled Etihad transfer must not appear as an active public transfer partner');

// 6) Hotel transfer ratios and minimums come from the canonical provider-facts source.
const hotelTransfers=programFacts.membershipRewardsDE?.hotelTransfers||[];
assert.strictEqual(hotelTransfers.filter(x=>x.status==='active').length,4,'Expected four verified active MR hotel transfers');
for(const route of hotelTransfers.filter(x=>x.status==='active')){
  requireText(partnerPage,`${route.label} ${route.sourceUnits}:${route.targetUnits}`,`${partnerPage} must match canonical hotel ratio for ${route.id}`);
  assert(Number.isFinite(route.minimumSource)&&route.minimumSource>0,`Hotel transfer ${route.id} needs a verified minimum`);
  assert(programFacts.officialSources.some(x=>x.id===route.sourceId),`Hotel transfer ${route.id} needs an official source`);
}

// 7) Membership Rewards validity wording must retain the provider conditions, not just say “never expires”.
const mrExpiry=programFacts.membershipRewardsDE?.expiry;
assert(mrExpiry&&mrExpiry.duringActiveParticipation==='unlimited','Canonical Membership Rewards validity rule missing');
assert.strictEqual(mrExpiry.requiresUncancelledParticipation,true,'MR validity must require uncancelled participation');
assert.strictEqual(mrExpiry.requiresAccountInGoodStanding,true,'MR validity must require account in good standing');
assert.strictEqual(mrExpiry.ordinaryTerminationRedemptionMonths,12,'MR termination redemption period changed; review published copy');
const mrExpiryPage='ratgeber/amex-punkte-verfallen.html';
requireText(mrExpiryPage,'ungekündigten Programmteilnahme');
requireText(mrExpiryPage,'ausgeglichenem Kartenkonto');
requireText(mrExpiryPage,'zwölf Monate');
requireText(mrExpiryPage,'Zahlungsversäumnisse');

// 8) Miles & More mileage expiry must stay aligned with the official canonical rule.
const mmExpiry=programFacts.milesAndMoreDE?.mileageExpiry;
assert(mmExpiry,'Canonical Miles & More expiry rule missing');
const mmExpiryPage='ratgeber/miles-and-more-meilen-verfallen.html';
requireText(mmExpiryPage,`${mmExpiry.validityMonthsFromActivity} Monate`);
if(mmExpiry.expiresAtNextQuarterEnd)requireText(mmExpiryPage,'Quartalsende');

// 9) PAYBACK value, transfer ratio and payout minimum must stay aligned across content and decision UI.
const payoutMin=programFacts.paybackDE?.minimumRedemptionPoints;
assert(Number.isFinite(payoutMin)&&payoutMin>0,'Canonical PAYBACK minimum redemption missing');
const paybackPage='ratgeber/payback-punkte-wert.html';
requireText(paybackPage,`1 PAYBACK Punkt = ${paybackValue} Cent.`);
requireText(paybackPage,`${pbMm.sourceUnits}:${pbMm.targetUnits}`);
requireText(paybackPage,`ab ${pbMm.minimumSource} Punkten`);

const paybackDecision='ratgeber/payback-punkte-auszahlen-oder-meilen.html';
requireText(paybackDecision,`1 PAYBACK Punkt = ${paybackValue} Cent.`);
requireText(paybackDecision,`Verhältnis ${pbMm.sourceUnits}:${pbMm.targetUnits}`);
requireText(paybackDecision,`ab ${payoutMin} Punkten auf ein Bankkonto`);

const pointsVsCash='ratgeber/punkte-oder-geld.html';
requireText(pointsVsCash,`PAYBACK sind das zum Beispiel ${paybackValue} Cent pro Punkt.`);

const offerContext=read('v24-offer-context.js');
assert(offerContext.includes(`if(cpp>=${paybackValue})`),'Offer comparison threshold must follow canonical PAYBACK opportunity value');
assert(offerContext.includes(`Direkt sind ${de2(paybackValue)} Cent pro PAYBACK Punkt sicher.`),'Offer comparison copy must follow canonical PAYBACK opportunity value');

// 10) Platinum benefit maxima are canonical in program facts and mirrored consistently where runtime/UI needs literals.
const benefits=programFacts.amexPlatinumDE?.benefits;
assert(benefits,'Canonical Amex Platinum benefits missing');
const travelCredit=benefits.onlineTravelCredit?.amountEUR;
assert.strictEqual(optimizer.cardBenefits?.amexPlatinumOnlineTravelCreditDE?.amountEUR,travelCredit,'Optimizer and program facts disagree on Amex Platinum travel credit');
const platinum=cards.cards.find(x=>x.id==='amex_platinum');
assert(platinum,'Amex Platinum missing from canonical card catalog');
assert(platinum.facts.some(x=>x.includes(`${travelCredit} Euro Online-Reiseguthaben jährlich`)),'Card catalog and program facts disagree on Amex Platinum travel credit');

const benefitOptimizer=read('v24-benefit-optimizer.js');
const benefitMap=[
  ['travel','Online-Reiseguthaben',benefits.onlineTravelCredit.amountEUR],
  ['sixt','SIXT ride',benefits.sixtRideCredit.amountEUR],
  ['restaurant','Restaurantguthaben',benefits.restaurantCredit.amountEUR],
  ['loden','LODENFREY',benefits.lodenfreyCredit.amountEUR]
];
for(const [id,label,max] of benefitMap){
  assert(benefitOptimizer.includes(`{id:'${id}',label:'${label}',max:${max}`),`Benefit optimizer ${id} maximum must match canonical program facts`);
}
assert.strictEqual(benefits.sixtRideCredit.voucherCount*benefits.sixtRideCredit.voucherAmountEUR,benefits.sixtRideCredit.amountEUR,'SIXT ride voucher structure does not add up');
assert.strictEqual(benefits.lodenfreyCredit.installmentsPerYear*benefits.lodenfreyCredit.installmentAmountEUR,benefits.lodenfreyCredit.amountEUR,'LODENFREY installments do not add up');

// 11) Known uncentralized facts cannot disappear silently. Current audit should be clean after centralization.
assert(Array.isArray(governance.remediationBacklog),'Governance remediationBacklog must remain explicit');
for(const item of governance.remediationBacklog){
  assert(fs.existsSync(item.file),`Backlog ${item.id} references missing file ${item.file}`);
  const content=read(item.file);
  for(const needle of item.needles||[]){
    assert(content.includes(needle),`Backlog ${item.id} changed at ${item.file}; centralize/review the fact and update governance instead of silently changing it`);
  }
}

// 12) Existing runtime mirror gate remains mandatory; governance must never replace it with looser checks.
assert(fs.existsSync('tests/card-catalog-runtime.test.cjs'),'Existing card catalog runtime parity test must remain in place');

console.log(`VAYQUO content fact consistency gate: OK (${actualRatgeber.length} Ratgeber surfaces, ${hotelTransfers.length} hotel transfer facts, ${governance.remediationBacklog.length} remediation items)`);
