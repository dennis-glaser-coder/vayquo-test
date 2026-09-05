import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('./backend/research/fruit-party.de.virtual-slots.2026-09-05.json', import.meta.url);
const fixture = JSON.parse(await readFile(url, 'utf8'));

assert.equal(fixture.game_slug, 'fruit-party');
assert.equal(fixture.game_name, 'Fruit Party');
assert.equal(fixture.market, 'DE');
assert.equal(fixture.product, 'virtual_slots');
assert.equal(fixture.status, 'ready_for_seed_ingestion');
assert.equal(fixture.operator_evidence.length, 3);
assert.equal(new Set(fixture.operator_evidence.map((row) => row.provider_slug)).size, 3);

for (const row of fixture.operator_evidence) {
  assert.equal(row.evidence_type, 'operator_game_page');
  assert.equal(row.verified_as_of, '2026-09-05');
  assert.match(row.source_url, /^https:\/\//);
}

assert.match(fixture.variant_rule, /Fruit Party 2 is a separate game/);
console.log('Fruit Party research fixture: OK');
