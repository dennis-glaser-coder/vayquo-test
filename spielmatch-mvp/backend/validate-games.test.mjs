import assert from 'node:assert/strict';
import { validateGamesSeed } from './validate-games.mjs';

const validationClock = { asOf: new Date('2026-09-05T12:00:00Z'), maxEvidenceAgeDays: 30 };
const validate = (seed) => validateGamesSeed(seed, validationClock);

const valid = {
  market: 'DE',
  records: [{
    game_slug: 'book-of-dead', game_name: 'Book of Dead', provider_slug: 'novoline',
    market: 'DE', product: 'virtual_slots', availability_status: 'verified',
    evidence_type: 'operator_game_page', source_url: 'https://www.novoline.de/de/slots/book-of-dead',
    verified_as_of: '2026-09-04'
  }]
};

assert.deepEqual(validate(valid), []);

const pending = structuredClone(valid);
pending.records[0].availability_status = 'pending';
assert.ok(validate(pending).some((x) => x.includes('only verified availability')));

const wrongMarket = structuredClone(valid);
wrongMarket.records[0].market = 'AT';
assert.ok(validate(wrongMarket).some((x) => x.includes('market must be DE')));

const weakEvidence = structuredClone(valid);
weakEvidence.records[0].evidence_type = 'affiliate_blog';
assert.ok(validate(weakEvidence).some((x) => x.includes('operator_game_page')));

const duplicate = structuredClone(valid);
duplicate.records.push(structuredClone(duplicate.records[0]));
assert.ok(validate(duplicate).some((x) => x.includes('duplicate')));

const stale = structuredClone(valid);
stale.records[0].verified_as_of = '2026-07-01';
assert.ok(validate(stale).some((x) => x.includes('operator evidence is stale')));

const future = structuredClone(valid);
future.records[0].verified_as_of = '2026-09-06';
assert.ok(validate(future).some((x) => x.includes('must not be in the future')));

const invalidCalendarDate = structuredClone(valid);
invalidCalendarDate.records[0].verified_as_of = '2026-02-30';
assert.ok(validate(invalidCalendarDate).some((x) => x.includes('valid ISO date')));

const futureYearValid = structuredClone(valid);
futureYearValid.records[0].verified_as_of = '2027-01-04';
assert.deepEqual(validateGamesSeed(futureYearValid, { asOf: new Date('2027-01-05T12:00:00Z'), maxEvidenceAgeDays: 30 }), []);

console.log('validate-games tests passed');
