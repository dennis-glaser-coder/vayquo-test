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
  verifiedRelationships: 50,
  verifiedGames: 17,
  matchReadyGames: 16,
  belowGateGames: 1,
});

const wolfGold = seed.records.filter((record) => record.game_slug === 'wolf-gold');
assert.equal(wolfGold.length, 3);
assert.deepEqual(
  wolfGold.map((record) => record.provider_slug).sort(),
  ['bingbong', 'jackpotpiraten', 'slotmagie'],
);

console.log('PASS: current seed is valid, deduplicated and coverage-consistent');
