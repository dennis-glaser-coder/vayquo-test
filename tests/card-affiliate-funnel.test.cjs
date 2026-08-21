'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));

const partners=json('config/vayquo-partner-links.de.json');
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

const verified=monetization.channels.amex_cards.verifiedProgram;
assert.equal(monetization.channels.amex_cards.enabled,false);
assert.equal(verified.cardId,'amex_payback');
assert.equal(verified.commissionEUR,66);
assert.equal(verified.cookieTrackingDays,0);
assert.notEqual(verified.status,'active');
assert.equal(monetization.principles.neverRankFinancialProductsByCommission,true);

assert.match(policy,/entry\.status!==['"]active['"]/);
assert.match(policy,/getCardPartnerUrl/);
assert.match(router,/FINANCEADS_HOST=['"]www\.financeads\.net['"]/);
assert.match(router,/url\.hostname!==FINANCEADS_HOST/);
assert.match(router,/data\.vqCommercial/);
assert.match(providerCta,/www\.financeads\.net/);

for(const name of [
 'card_check_started',
 'card_result_ready',
 'card_registration_gate_shown',
 'card_registration_gate_completed',
 'card_result_shown',
 'card_external_click'
]){
 assert.ok(contract.events[name],`event contract missing ${name}`);
 assert.match(revenue,new RegExp(`${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*:`),`runtime missing ${name}`);
 assert.match(funnel,new RegExp(name),`funnel missing ${name}`);
}

assert.equal(contract.transport.externalNetworkRequestsAllowed,false);
assert.equal(contract.transport.cookiesAllowed,false);
assert.equal(contract.transport.persistence,'memory_only');
assert.equal(contract.privacy.allowEmail,false);
assert.equal(contract.privacy.allowPaymentData,false);

assert.match(loader,/v35-card-partner-router\.js/);
assert.match(loader,/v35-card-affiliate-funnel\.js/);

console.log('card affiliate funnel safety checks passed');
