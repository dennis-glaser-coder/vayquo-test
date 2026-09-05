import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixtures = [
  './research/sweet-bonanza.de.virtual-slots.2026-09-05.json',
  './research/gates-of-olympus.de.virtual-slots.2026-09-06.json'
];

for (const relativePath of fixtures) {
  const fixture = JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
  assert.equal(fixture.market_code, 'DE');
  assert.equal(fixture.product_type, 'virtual_slots');
  assert.equal(fixture.status, 'sufficient_exact_coverage');
  assert.ok(fixture.verified_exact_operator_pages >= fixture.required_exact_operator_pages);

  const accepted = fixture.evidence.filter(row =>
    row.evidence_type === 'operator_game_page' && row.exact_variant === true
  );
  assert.ok(accepted.length >= 3);
  assert.equal(new Set(accepted.map(row => row.provider ?? row.provider_slug)).size, accepted.length);
  assert.ok(accepted.every(row => /^https:\/\//.test(row.url)));
  assert.ok(accepted.every(row => /^2026-09-0[56]$/.test(row.verified_at)));
}

const olympus = JSON.parse(fs.readFileSync(new URL('./research/gates-of-olympus.de.virtual-slots.2026-09-06.json', import.meta.url), 'utf8'));
assert.equal(olympus.game_slug, 'gates-of-olympus');
assert.match(olympus.variant_rule, /distinct title from Gates of Olympus 1000/);

console.log('PASS: research coverage fixtures require three exact DE operator game pages and preserve variants');
