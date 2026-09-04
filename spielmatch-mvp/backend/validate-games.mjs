import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function validateGamesSeed(seed) {
  const errors = [];
  if (!seed || seed.market !== 'DE') errors.push('seed.market must be DE');
  if (!Array.isArray(seed?.records) || seed.records.length === 0) errors.push('records must be a non-empty array');

  const seen = new Set();
  for (const [index, record] of (seed?.records || []).entries()) {
    const p = `records[${index}]`;
    if (!record.game_slug || !record.game_name || !record.provider_slug) errors.push(`${p}: game/provider identity missing`);
    if (record.market !== 'DE') errors.push(`${p}: market must be DE`);
    if (record.product !== 'virtual_slots') errors.push(`${p}: product must be virtual_slots`);
    if (record.availability_status !== 'verified') errors.push(`${p}: only verified availability may enter seed`);
    if (record.evidence_type !== 'operator_game_page') errors.push(`${p}: evidence_type must be operator_game_page`);
    if (!/^https:\/\//.test(record.source_url || '')) errors.push(`${p}: HTTPS primary source required`);
    if (!/^2026-\d{2}-\d{2}$/.test(record.verified_as_of || '')) errors.push(`${p}: verified_as_of must be ISO date`);

    const key = `${record.market}:${record.game_slug}:${record.provider_slug}`;
    if (seen.has(key)) errors.push(`${p}: duplicate game-provider-market record`);
    seen.add(key);
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const seedPath = path.join(__dirname, 'games.seed.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const errors = validateGamesSeed(seed);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`games seed valid: ${seed.records.length} verified DE records`);
}
