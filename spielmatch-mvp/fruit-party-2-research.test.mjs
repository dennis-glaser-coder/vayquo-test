import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('./backend/research/fruit-party-2.de.virtual-slots.2026-09-06.json', import.meta.url);
const fixture = JSON.parse(await readFile(url, 'utf8'));

assert.equal(fixture.game_slug, 'fruit-party-2');
assert.equal(fixture.game_name, 'Fruit Party 2');
assert.equal(fixture.market, 'DE');
assert.equal(fixture.product, 'virtual_slots');
assert.equal(fixture.status, 'ready_for_seed_ingestion');
assert.equal(fixture.operator_evidence.length, 3);
assert.equal(new Set(fixture.operator_evidence.map((row) => row.provider_slug)).size, 3);

for (const row of fixture.operator_evidence) {
  assert.equal(row.evidence_type, 'operator_game_page');
  assert.equal(row.verified_as_of, '2026-09-06');
  assert.match(row.source_url, /^https:\/\//);
}

assert.equal(fixture.market_evidence.authority, 'GGL');
assert.equal(fixture.market_evidence.whitelist_updated_as_of, '2026-09-04');
assert.deepEqual(
  [...fixture.market_evidence.providers].sort(),
  ['bingbong', 'jackpotpiraten', 'slotmagie'],
);
assert.match(fixture.variant_rule, /Fruit Party is a separate game/);
console.log('Fruit Party 2 research fixture: OK');
