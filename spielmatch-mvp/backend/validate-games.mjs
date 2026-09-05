import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAY_MS = 86_400_000;

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function validateGamesSeed(seed, { asOf = new Date(), maxEvidenceAgeDays = 30 } = {}) {
  const errors = [];
  const asOfDate = new Date(asOf);
  if (Number.isNaN(asOfDate.getTime())) throw new TypeError('asOf must be a valid date');
  if (!Number.isInteger(maxEvidenceAgeDays) || maxEvidenceAgeDays < 0) throw new TypeError('maxEvidenceAgeDays must be a non-negative integer');

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

    const verifiedDate = parseIsoDate(record.verified_as_of);
    if (!verifiedDate) {
      errors.push(`${p}: verified_as_of must be a valid ISO date`);
    } else {
      const ageDays = Math.floor((asOfDate.getTime() - verifiedDate.getTime()) / DAY_MS);
      if (ageDays < 0) errors.push(`${p}: verified_as_of must not be in the future`);
      if (ageDays > maxEvidenceAgeDays) errors.push(`${p}: operator evidence is stale (${ageDays} days; max ${maxEvidenceAgeDays})`);
    }

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
  console.log(`games seed valid: ${seed.records.length} fresh verified DE records`);
}
