import assert from 'node:assert/strict';
import { validateGamesSeed } from './validate-games.mjs';

const valid = {
  market: 'DE',
  records: [{
    game_slug: 'book-of-dead', game_name: 'Book of Dead', provider_slug: 'novoline',
    market: 'DE', product: 'virtual_slots', availability_status: 'verified',
    evidence_type: 'operator_game_page', source_url: 'https://www.novoline.de/de/slots/book-of-dead',
    verified_as_of: '2026-09-04'
  }]
};

assert.deepEqual(validateGamesSeed(valid), []);

const pending = structuredClone(valid);
pending.records[0].availability_status = 'pending';
assert.ok(validateGamesSeed(pending).some((x) => x.includes('only verified availability')));

const wrongMarket = structuredClone(valid);
wrongMarket.records[0].market = 'AT';
assert.ok(validateGamesSeed(wrongMarket).some((x) => x.includes('market must be DE')));

const weakEvidence = structuredClone(valid);
weakEvidence.records[0].evidence_type = 'affiliate_blog';
assert.ok(validateGamesSeed(weakEvidence).some((x) => x.includes('operator_game_page')));

const duplicate = structuredClone(valid);
duplicate.records.push(structuredClone(duplicate.records[0]));
assert.ok(validateGamesSeed(duplicate).some((x) => x.includes('duplicate')));

console.log('validate-games tests passed');
