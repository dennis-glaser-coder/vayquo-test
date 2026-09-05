import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildVerifiedGameMatches } from './match-results.mjs';

const gameSeed = JSON.parse(fs.readFileSync(new URL('./backend/games.seed.json', import.meta.url), 'utf8'));
const providerSeed = JSON.parse(fs.readFileSync(new URL('./backend/providers.seed.json', import.meta.url), 'utf8'));
const now = new Date('2026-09-05T12:00:00Z');

const result = buildVerifiedGameMatches({
  gameSlug: 'book-of-ra',
  gameSeed,
  providerSeed,
  now,
  preferences: { payment: 'paypal', maxMinDepositEur: 5, requireVerifiedCatalog: true },
});
assert.equal(result.status, 'ready');
assert.ok(result.matches.length >= 3);
assert.ok(result.matches.every((match) => match.affiliate.enabled === false));
assert.ok(result.matches.every((match) => match.evidence.game.startsWith('https://')));
assert.ok(result.matches.every((match) => match.components.some((component) => component.key === 'game' && component.matched)));

const thinCoverage = buildVerifiedGameMatches({
  gameSlug: 'sweet-bonanza',
  gameSeed,
  providerSeed,
  now,
});
assert.equal(thinCoverage.status, 'insufficient_verified_coverage');
assert.deepEqual(thinCoverage.matches, []);

const wrongMarket = buildVerifiedGameMatches({
  gameSlug: 'book-of-ra',
  market: 'AT',
  gameSeed,
  providerSeed,
  now,
});
assert.equal(wrongMarket.status, 'unsupported_market_product');
assert.deepEqual(wrongMarket.matches, []);

const staleGameSeed = structuredClone(gameSeed);
for (const record of staleGameSeed.records) {
  if (record.game_slug === 'book-of-ra') record.verified_as_of = '2026-01-01';
}
const stale = buildVerifiedGameMatches({
  gameSlug: 'book-of-ra',
  gameSeed: staleGameSeed,
  providerSeed,
  now,
});
assert.equal(stale.status, 'insufficient_verified_coverage');

const manipulatedProviderSeed = structuredClone(providerSeed);
for (const provider of manipulatedProviderSeed.providers) {
  if (provider.slug === 'slotmagie') provider.market = 'AT';
}
const providerMarketMismatch = buildVerifiedGameMatches({
  gameSlug: 'book-of-ra-deluxe',
  gameSeed,
  providerSeed: manipulatedProviderSeed,
  now,
});
assert.equal(providerMarketMismatch.status, 'insufficient_eligible_providers');
assert.ok(providerMarketMismatch.matches.length < 3);

console.log('match-results.test.mjs PASS');
