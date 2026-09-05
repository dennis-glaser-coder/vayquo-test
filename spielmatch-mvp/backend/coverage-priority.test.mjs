import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCoveragePriority, summarizeCoverage } from './coverage-priority.mjs';

const seed = JSON.parse(fs.readFileSync(new URL('./games.seed.json', import.meta.url), 'utf8'));
const priority = buildCoveragePriority(seed.records);
const summary = summarizeCoverage(priority);

assert.equal(summary.verifiedRelationships, 29);
assert.equal(summary.verifiedGames, 10);
assert.equal(summary.matchReadyGames, 8);
assert.equal(summary.belowGateGames, 2);

const bookOfRa = priority.find(row => row.gameSlug === 'book-of-ra');
assert.equal(bookOfRa.providerCount, 4);
assert.equal(bookOfRa.readyForMatch, true);

const ramses = priority.find(row => row.gameSlug === 'ramses-book-deluxe');
assert.equal(ramses.providerCount, 1);
assert.equal(ramses.providersNeeded, 2);
assert.equal(ramses.readyForMatch, false);

const poisoned = buildCoveragePriority([
  ...seed.records,
  {...seed.records[0], market: 'AT', provider_slug: 'foreign-market'},
  {...seed.records[0], product: 'sportsbook', provider_slug: 'wrong-product'},
  {...seed.records[0], availability_status: 'pending', provider_slug: 'pending'},
]);
assert.equal(summarizeCoverage(poisoned).verifiedRelationships, 29);

console.log('PASS: coverage priority is deterministic and market/product gated');
