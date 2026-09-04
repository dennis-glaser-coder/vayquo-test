import assert from 'node:assert/strict';
import { buildVerifiedGameCatalog, autocompleteMatches } from './verified-games.mjs';

const seed = {
  records: [
    { game_slug: 'book-of-dead', game_name: 'Book of Dead', provider_slug: 'a', market: 'DE', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'operator_game_page', source_url: 'https://a.example/game' },
    { game_slug: 'book-of-dead', game_name: 'Book of Dead', provider_slug: 'b', market: 'DE', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'operator_game_page', source_url: 'https://b.example/game' },
    { game_slug: 'sweet-bonanza', game_name: 'Sweet Bonanza', provider_slug: 'c', market: 'DE', product: 'virtual_slots', availability_status: 'pending', evidence_type: 'operator_game_page', source_url: 'https://c.example/game' },
    { game_slug: 'foreign', game_name: 'Foreign Game', provider_slug: 'x', market: 'AT', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'operator_game_page', source_url: 'https://x.example/game' },
    { game_slug: 'weak', game_name: 'Weak Evidence', provider_slug: 'y', market: 'DE', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'aggregator', source_url: 'https://y.example/game' }
  ]
};

const catalog = buildVerifiedGameCatalog(seed);
assert.equal(catalog.length, 1);
assert.equal(catalog[0].name, 'Book of Dead');
assert.equal(catalog[0].providerCount, 2);
assert.deepEqual(catalog[0].providerSlugs, ['a', 'b']);
assert.equal(autocompleteMatches(catalog, 'boo')[0].slug, 'book-of-dead');
assert.equal(autocompleteMatches(catalog, 'dead')[0].slug, 'book-of-dead');
assert.equal(autocompleteMatches(catalog, 'sweet').length, 0);

assert.throws(() => buildVerifiedGameCatalog({ records: [
  { game_slug: 'same', game_name: 'Name A', provider_slug: 'a', market: 'DE', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'operator_game_page', source_url: 'https://a.example/game' },
  { game_slug: 'same', game_name: 'Name B', provider_slug: 'b', market: 'DE', product: 'virtual_slots', availability_status: 'verified', evidence_type: 'operator_game_page', source_url: 'https://b.example/game' }
] }), /Conflicting game names/);

console.log('verified-games tests passed');
