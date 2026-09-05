import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCoveragePriority, summarizeCoverage } from './coverage-priority.mjs';

const seed = JSON.parse(fs.readFileSync(new URL('./games.seed.json', import.meta.url), 'utf8'));
const priority = buildCoveragePriority(seed.records);
const summary = summarizeCoverage(priority);

assert.equal(summary.verifiedRelationships, 44);
assert.equal(summary.verifiedGames, 15);
assert.equal(summary.matchReadyGames, 14);
assert.equal(summary.belowGateGames, 1);

const bookOfRa = priority.find(row => row.gameSlug === 'book-of-ra');
assert.equal(bookOfRa.providerCount, 4);
assert.equal(bookOfRa.readyForMatch, true);

const wolfGold = priority.find(row => row.gameSlug === 'wolf-gold');
assert.equal(wolfGold.providerCount, 3);
assert.deepEqual(wolfGold.providers, ['bingbong', 'jackpotpiraten', 'slotmagie']);
assert.equal(wolfGold.readyForMatch, true);

const reactoonz = priority.find(row => row.gameSlug === 'reactoonz');
assert.equal(reactoonz.providerCount, 3);
assert.deepEqual(reactoonz.providers, ['bingbong', 'jackpotpiraten', 'novoline']);
assert.equal(reactoonz.readyForMatch, true);

const fireJoker = priority.find(row => row.gameSlug === 'fire-joker');
assert.equal(fireJoker.providerCount, 3);
assert.deepEqual(fireJoker.providers, ['bingbong', 'jackpotpiraten', 'slotmagie']);
assert.equal(fireJoker.readyForMatch, true);

const legacyOfDead = priority.find(row => row.gameSlug === 'legacy-of-dead');
assert.equal(legacyOfDead.providerCount, 3);
assert.deepEqual(legacyOfDead.providers, ['bingbong', 'jackpotpiraten', 'novoline']);
assert.equal(legacyOfDead.readyForMatch, true);

const fruitParty = priority.find(row => row.gameSlug === 'fruit-party');
assert.equal(fruitParty.providerCount, 3);
assert.deepEqual(fruitParty.providers, ['bingbong', 'jackpotpiraten', 'slotmagie']);
assert.equal(fruitParty.readyForMatch, true);

const fruitParty2 = priority.find(row => row.gameSlug === 'fruit-party-2');
assert.equal(fruitParty2, undefined);

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
assert.equal(summarizeCoverage(poisoned).verifiedRelationships, 44);
assert.equal(summarizeCoverage(poisoned).matchReadyGames, 14);

console.log('PASS: coverage priority is deterministic and market/product gated');
