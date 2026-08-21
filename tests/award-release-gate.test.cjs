'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const index=fs.readFileSync('index.html','utf8');
const gate=fs.readFileSync('v26-award-coming-soon.js','utf8');
const release=JSON.parse(fs.readFileSync('config/vayquo-award-release.de.json','utf8'));

assert.equal(release.publicMode,'coming_soon','Public award mode must stay coming_soon until a licensed live provider is ready.');
assert.equal(release.publicLiveSearchEnabled,false,'Public live award search must remain disabled.');
assert.equal(release.publicSyntheticDataEnabled,false,'Synthetic award data must never be public.');
assert.ok(index.includes('v26-award-coming-soon.js'),'Public index must load the coming-soon award gate.');
assert.ok(!index.includes('src="v24-flight-optimizer.js'), 'Public index must not load the prepared test optimizer.');
assert.ok(!gate.includes('vayquo-award-search'),'Public coming-soon gate must not call the award-search endpoint.');
assert.ok(gate.includes('KOMMT BALD · KEINE TESTDATEN'),'Public gate must visibly identify the unavailable live-award state.');
assert.ok(gate.includes('keine simulierten Verfügbarkeiten'),'Public gate must explicitly reject simulated availability.');
assert.ok(release.launchRequirements.includes('commercial_usage_rights_confirmed'),'Live release must require commercial usage rights.');
assert.ok(release.launchRequirements.includes('no_transfer_recommendation_without_live_award_data'),'Live release must prohibit transfer recommendations without live award data.');

console.log('award release gate: OK');
