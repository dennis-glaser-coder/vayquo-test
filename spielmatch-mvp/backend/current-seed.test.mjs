import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateGamesSeed } from './validate-games.mjs';
import { buildCoveragePriority, summarizeCoverage } from './coverage-priority.mjs';

const seed = JSON.parse(fs.readFileSync(new URL('./games.seed.json', import.meta.url), 'utf8'));

const validationErrors = validateGamesSeed(seed, {
  asOf: new Date('2026-09-06T12:00:00Z'),
  maxEvidenceAgeDays: 30,
});
assert.deepEqual(validationErrors, []);

const summary = summarizeCoverage(buildCoveragePriority(seed.records));
assert.deepEqual(summary, {
  verifiedRelationships: 53,
  verifiedGames: 18,
  matchReadyGames: 17,
  belowGateGames: 1,
});

const wolfGold = seed.records.filter((record) => record.game_slug === 'wolf-gold');
assert.equal(wolfGold.length, 3);
assert.deepEqual(
  wolfGold.map((record) => record.provider_slug).sort(),
  ['bingbong', 'jackpotpiraten', 'slotmagie'],
);

const fruitParty2 = seed.records.filter((record) => record.game_slug === 'fruit-party-2');
assert.equal(fruitParty2.length, 3);
assert.deepEqual(
  fruitParty2.map((record) => record.provider_slug).sort(),
  ['bingbong', 'jackpotpiraten', 'slotmagie'],
);
assert.ok(fruitParty2.every((record) => record.market === 'DE'));
assert.ok(fruitParty2.every((record) => record.product === 'virtual_slots'));
assert.ok(fruitParty2.every((record) => record.evidence_type === 'operator_game_page'));

const theDogHouse = seed.records.filter((record) => record.game_slug === 'the-dog-house');
assert.equal(theDogHouse.length, 3);
assert.deepEqual(
  theDogHouse.map((record) => record.provider_slug).sort(),
  ['bingbong', 'jackpotpiraten', 'slotmagie'],
);
assert.ok(theDogHouse.every((record) => record.market === 'DE'));
assert.ok(theDogHouse.every((record) => record.product === 'virtual_slots'));
assert.ok(theDogHouse.every((record) => record.evidence_type === 'operator_game_page'));
assert.ok(theDogHouse.every((record) => record.availability_status === 'verified'));

console.log('PASS: current seed is valid, deduplicated and coverage-consistent');
