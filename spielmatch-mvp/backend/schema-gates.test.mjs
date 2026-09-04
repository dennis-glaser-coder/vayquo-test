import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const requiredFragments = [
  "market_code text not null",
  "product_type text not null",
  "availability_status text not null default 'pending'",
  "evidence_type text not null",
  "primary key (provider_id,game_id,market_code,product_type)",
  "market_code = 'DE'",
  "product_type = 'virtual_slots'",
  "availability_status = 'verified'",
  "evidence_type in ('operator_game_page','regulator_source')",
  "verified_at is not null",
  "p.is_active = true",
  "p.ggl_status = 'verified'"
];

for (const fragment of requiredFragments) {
  assert.ok(schema.includes(fragment), `schema gate missing: ${fragment}`);
}

assert.match(schema, /source_url text not null check \(source_url ~ '\^https:\/\/'\)/);
assert.match(schema, /verified_provider_game_requires_date/);
assert.match(schema, /verified_provider_game_requires_strong_evidence/);

// Regression guard: the public policy must never fall back to the old status-only rule.
assert.ok(
  !schema.includes("for select to anon, authenticated using (availability_status = 'verified');"),
  'unsafe status-only provider-game policy must not return'
);

console.log('schema-gates.test.mjs: PASS');
