import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url = new URL('./backend/research/lord-of-the-ocean.de.virtual-slots.2026-09-06.json', import.meta.url);
const fixture = JSON.parse(await readFile(url, 'utf8'));

assert.equal(fixture.game_slug, 'lord-of-the-ocean');
assert.equal(fixture.game_name, 'Lord of the Ocean');
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
assert.deepEqual([...fixture.market_evidence.providers].sort(), ['jackpotpiraten', 'novoline', 'slotmagie']);
assert.match(fixture.variant_rule, /Lord of the Ocean Magic/);
assert.match(fixture.variant_rule, /10 Win Ways/);
assert.match(fixture.variant_rule, /Top Spin/);
console.log('Lord of the Ocean research fixture: OK');
