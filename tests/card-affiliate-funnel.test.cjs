'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));

const partners=json('config/vayquo-partner-links.de.json');
const launchGates=json('config/vayquo-commercial-launch-gates.de.json');
const monetization=json('config/vayquo-monetization.de.json');
const contract=json('config/vayquo-revenue-event-contract.de.json');
const policy=read('v24-commercial-policy.js');
const router=read('v35-card-partner-router.js');
const funnel=read('v35-card-affiliate-funnel.js');
const revenue=read('v24-revenue-runtime-prep.js');
const loader=read('v24-card-check.js');
const providerCta=read('v28-card-advisor-provider-cta.js');

const payback=partners.cards.amex_payback;
assert.equal(partners.mode,'preparation_only');
assert.equal(partners.rules.recommendationRankingMayUseCommission,false);
assert.notEqual(payback.status,'active');
assert.equal(payback.trackingUrl,'');
assert.equal(payback.network,'financeads');
assert.equal(payback.publicCommission.amount,66);
assert.equal(payback.cookieTrackingDays,0);

assert.equal(launchGates.mode,'preparation_only');
assert.equal(launchGates.globalGate.commercialLive,false);
assert.ok(Object.values(launchGates.globalGate.checks).some(value=>value===false));
assert.ok(Object.values(launchGates.channelGates.amex_cards).some(value=>value===false));

const verified=monetization.channels.amex_cards.verifiedProgram;
assert.equal(monetization.channels.amex_cards.enabled,false);
assert.equal(verified.cardId,'amex_payback');
assert.equal(verified.commissionEUR,66);
assert.equal(verified.cookieTrackingDays,0);
assert.notEqual(verified.status,'active');
assert.equal(monetization.principles.neverRankFinancialProductsByCommission,true);

assert.match(policy,/vayquo-commercial-launch-gates\.de\.json/);
assert.match(policy,/global\?\.commercialLive!==true/);
assert.match(policy,/partnerMode==='live'/);
assert.match(policy,/entry\.status==='active'/);
assert.match(policy,/getCardPartnerUrl/);
assert.match(router,/FINANCEADS_HOST=['"]www\.financeads\.net['"]/);
assert.match(router,/url\.hostname!==FINANCEADS_HOST/);
assert.match(router,/link\.dataset\.vqCommercial/);
assert.match(router,/stopImmediatePropagation/);
assert.match(router,/window\.location\.assign\(safe\)/);
assert.doesNotMatch(providerCta,/www\.financeads\.net/,'official provider guard must remain separate from affiliate destinations');

const funnelEvents=[
 'card_check_started',
 'card_result_ready',
 'card_registration_gate_shown',
 'card_registration_gate_completed',
 'card_result_shown'
];
for(const name of [...funnelEvents,'card_external_click']){
 assert.ok(contract.events[name],`event contract missing ${name}`);
 assert.match(revenue,new RegExp(`${name}\\s*:`),`runtime missing ${name}`);
}
for(const name of funnelEvents){
 assert.match(funnel,new RegExp(name),`funnel missing ${name}`);
}
assert.match(router,/card_external_click/);
assert.match(router,/commercial_offer_clicked/);

assert.equal(contract.transport.externalNetworkRequestsAllowed,false);
assert.equal(contract.transport.cookiesAllowed,false);
assert.equal(contract.transport.persistence,'memory_only');
assert.equal(contract.privacy.allowEmail,false);
assert.equal(contract.privacy.allowPaymentData,false);

assert.match(loader,/v28-card-advisor-provider-cta\.js\?v=2803/);
assert.match(loader,/v35-card-partner-router\.js/);
assert.match(loader,/v35-card-affiliate-funnel\.js/);

console.log('card affiliate funnel safety checks passed');
