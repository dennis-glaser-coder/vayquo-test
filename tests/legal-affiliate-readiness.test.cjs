'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const legal=fs.readFileSync('rechtliches.html','utf8');
const legalRuntime=fs.readFileSync('v24-legal.js','utf8');
const nav=fs.readFileSync('v33-navigation-state.js','utf8');
const launch=JSON.parse(fs.readFileSync('config/vayquo-commercial-launch-gates.de.json','utf8'));
const partners=JSON.parse(fs.readFileSync('config/vayquo-partner-links.de.json','utf8'));

for(const marker of [
 'id="impressum"',
 'Angaben gemäß § 5 DDG',
 'mailto:webmaster@vayquo.de',
 'id="werbung"',
 'Werbung & Affiliate-Links',
 'Die Vergütung beeinflusst die VAYQUO-Empfehlung nicht.',
 'Aktueller Status:',
 'id="datenschutz"',
 'Datenschutzerklärung',
 'Affiliate-Tracking',
 'Stand: 21. August 2026'
])assert.ok(legal.includes(marker),`legal page missing ${marker}`);

assert.ok(legal.includes('In der derzeitigen öffentlichen Konfiguration sind noch keine Affiliate-Tracking-Links aktiviert.'),'legal page must not claim inactive affiliate tracking is live');
assert.ok(legal.includes('financeAds oder ein anderer Affiliate-/Werbepartner wird erst dann Empfänger'),'future affiliate data recipient must be described conditionally');
assert.ok(legal.includes('softwaregestützte Informationen und eine unverbindliche Orientierung'),'financial orientation disclaimer must remain visible');
assert.ok(legal.includes('href="./?vqReturn=start"'),'legal page must explicitly return to the VAYQUO start view');
assert.ok(nav.includes("const RETURN_PARAM='vqReturn'"),'navigation must recognize the legal return signal');
assert.ok(nav.includes('if(!current){'),'navigation must recover even when the app currently has no active content view');
assert.ok(nav.includes('consumeReturnView()'),'legal return signal must be consumed instead of persisting in the URL');
assert.ok(nav.includes('store(wanted)'),'legal return target must replace stale session navigation state');

for(const anchor of ['#impressum','#werbung','#datenschutz'])assert.ok(legalRuntime.includes(anchor),`VAYQUO runtime missing public legal link ${anchor}`);
assert.ok(legalRuntime.includes('v24-legal-public-links'),'start surface must expose legal links');
assert.ok(legalRuntime.includes('startActive()'),'public legal links must be tied to the start surface');

assert.equal(launch.globalGate.commercialLive,false,'legal readiness must not silently activate commerce');
assert.equal(launch.globalGate.checks.imprintReviewed,false,'technical legal page work is not a legal approval');
assert.equal(launch.globalGate.checks.privacyReviewed,false,'technical privacy copy work is not a legal approval');
assert.notEqual(partners.cards.amex_payback.status,'active','publisher readiness must not activate financeAds');
assert.equal(partners.cards.amex_payback.trackingUrl,'','publisher readiness must not invent a tracking link');

console.log('legal and affiliate publisher readiness checks passed');
