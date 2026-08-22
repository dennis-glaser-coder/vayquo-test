const fs=require('fs');
const path=require('path');
const assert=require('assert');

const read=file=>fs.readFileSync(file,'utf8');
const json=file=>JSON.parse(read(file));
const governance=json('config/vayquo-fact-governance.de.json');
const optimizer=json(governance.canonicalSources.optimizerRules);
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
function assertReviewedAfterCanonical(file,checkedAt){
  const date=modifiedDate(file);
  assert(date,`${file} must expose dateModified because it publishes dynamic facts`);
  assert(date>=checkedAt,`${file} (${date}) is older than canonical optimizer rules (${checkedAt})`);
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
  if(['guarded_dynamic','guarded_partial'].includes(entry.classification)){
    assertReviewedAfterCanonical(entry.path,optimizer.checkedAt);
  }
}

// 2) Canonical MR -> PAYBACK and PAYBACK -> Miles & More chain must match published copy.
const mrPb=directTransfer('mr_de','payback_de');
const pbMm=interTransfer('payback_de','miles_and_more');
assert(mrPb,'Canonical MR -> PAYBACK route missing');
assert(pbMm,'Canonical PAYBACK -> Miles & More route missing');
const paybackValue=optimizer.redemptionAlternatives?.paybackCashValue?.valueCentsPerPoint;
assert(Number.isFinite(paybackValue),'Canonical PAYBACK cash value missing');

const amexToMm='ratgeber/amex-punkte-zu-miles-and-more.html';
requireText(amexToMm,`${mrPb.sourceUnits} Membership Rewards → ${mrPb.targetUnits} PAYBACK Punkt → ${pbMm.targetUnits} Miles & More Meile.`);
requireText(amexToMm,`Verhältnis ${mrPb.sourceUnits}:${mrPb.targetUnits}`);
requireText(amexToMm,`${mrPb.minimumSource} Membership Rewards`);
requireText(amexToMm,`ab ${pbMm.minimumSource} Punkten im Verhältnis ${pbMm.sourceUnits}:${pbMm.targetUnits}`);

// 3) Published MR valuation pages must use the same canonical safe PAYBACK basis.
for(const file of ['ratgeber/amex-punkte-einloesen.html','ratgeber/membership-rewards-wert.html']){
  requireText(file,`${mrPb.sourceUnits}`);
  requireText(file,'PAYBACK');
  requireText(file,'1 Cent');
}
requireText('ratgeber/amex-punkte-einloesen.html',`${mrPb.sourceUnits}:${mrPb.targetUnits}`);
requireText('ratgeber/membership-rewards-wert.html',`${mrPb.sourceUnits} Membership Rewards ergeben ${mrPb.targetUnits} PAYBACK Punkt`);

// 4) Every active MR airline transfer ratio shown in the public transfer-partner guide is derived from canonical optimizer rules.
const partnerPage='ratgeber/membership-rewards-transferpartner.html';
const activeAirlineTransfers=optimizer.directTransfers.filter(x=>x.from==='mr_de'&&x.status==='active'&&x.to!=='payback_de');
for(const route of activeAirlineTransfers){
  const label=governance.transferPartnerLabels[route.to];
  assert(label,`Missing public label mapping for canonical MR transfer target: ${route.to}`);
  requireText(partnerPage,`${label} ${route.sourceUnits}:${route.targetUnits}`,`${partnerPage} must match canonical ratio for ${route.to}`);
}
assert(!read(partnerPage).includes('Etihad Guest'),'Disabled Etihad transfer must not appear as an active public transfer partner');

// 5) PAYBACK value and PAYBACK -> Miles & More ratio must stay aligned across Ratgeber and decision UI.
const paybackPage='ratgeber/payback-punkte-wert.html';
requireText(paybackPage,`1 PAYBACK Punkt = ${paybackValue} Cent.`);
requireText(paybackPage,`${pbMm.sourceUnits}:${pbMm.targetUnits}`);
requireText(paybackPage,`ab ${pbMm.minimumSource} Punkten`);

const paybackDecision='ratgeber/payback-punkte-auszahlen-oder-meilen.html';
requireText(paybackDecision,`1 PAYBACK Punkt = ${paybackValue} Cent.`);
requireText(paybackDecision,`Verhältnis ${pbMm.sourceUnits}:${pbMm.targetUnits}`);
requireText(paybackDecision,`ab ${pbMm.minimumSource} PAYBACK Punkten`);

const pointsVsCash='ratgeber/punkte-oder-geld.html';
requireText(pointsVsCash,`PAYBACK sind das zum Beispiel ${paybackValue} Cent pro Punkt.`);

const offerContext=read('v24-offer-context.js');
assert(offerContext.includes(`if(cpp>=${paybackValue})`),'Offer comparison threshold must follow canonical PAYBACK opportunity value');
assert(offerContext.includes(`Direkt sind ${de2(paybackValue)} Cent pro PAYBACK Punkt sicher.`),'Offer comparison copy must follow canonical PAYBACK opportunity value');

// 6) Platinum travel credit cannot diverge between optimizer rules, card catalog and benefit optimizer UI.
const travelCredit=optimizer.cardBenefits?.amexPlatinumOnlineTravelCreditDE?.amountEUR;
assert(Number.isFinite(travelCredit),'Canonical Amex Platinum travel credit missing');
const platinum=cards.cards.find(x=>x.id==='amex_platinum');
assert(platinum,'Amex Platinum missing from canonical card catalog');
assert(platinum.facts.some(x=>x.includes(`${travelCredit} Euro Online-Reiseguthaben jährlich`)),'Card catalog and optimizer disagree on Amex Platinum travel credit');
requireText('v24-benefit-optimizer.js',`{id:'travel',label:'Online-Reiseguthaben',max:${travelCredit}`,'Benefit optimizer and canonical travel credit must stay aligned');

// 7) Known uncentralized facts stay visible as an explicit backlog. If a literal changes, CI forces a deliberate review instead of silently drifting.
for(const item of governance.remediationBacklog){
  assert(fs.existsSync(item.file),`Backlog ${item.id} references missing file ${item.file}`);
  const content=read(item.file);
  for(const needle of item.needles){
    assert(content.includes(needle),`Backlog ${item.id} changed at ${item.file}; centralize/review the fact and update governance instead of silently changing it`);
  }
}

// 8) Existing runtime mirror gate remains mandatory; governance must never replace it with looser checks.
assert(fs.existsSync('tests/card-catalog-runtime.test.cjs'),'Existing card catalog runtime parity test must remain in place');

console.log(`VAYQUO content fact consistency gate: OK (${actualRatgeber.length} Ratgeber surfaces, ${governance.remediationBacklog.length} explicit remediation items)`);
