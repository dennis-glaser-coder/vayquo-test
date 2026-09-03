import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_LEGAL = new Set(['pending', 'approved', 'rejected']);

export function validateProvidersSeed(seed) {
  const errors = [];

  if (!seed || !Array.isArray(seed.providers)) {
    return ['providers must be an array'];
  }

  for (const provider of seed.providers) {
    const prefix = provider?.slug || provider?.name || 'unknown-provider';

    if (provider.market !== 'DE') errors.push(`${prefix}: market must be DE in providers.seed.json`);
    if (!ISO_DATE.test(provider.ggl_verified_as_of || '')) errors.push(`${prefix}: ggl_verified_as_of must be YYYY-MM-DD`);
    if (!provider.sources?.license?.startsWith('https://www.gluecksspiel-behoerde.de/')) {
      errors.push(`${prefix}: license source must be the GGL primary domain`);
    }

    if (provider.affiliate) {
      const a = provider.affiliate;
      if (!ALLOWED_LEGAL.has(a.legal_review_status)) {
        errors.push(`${prefix}: affiliate legal_review_status must be pending, approved or rejected`);
      }
      if (!ISO_DATE.test(a.verified_as_of || '')) errors.push(`${prefix}: affiliate verified_as_of must be YYYY-MM-DD`);
      if (!provider.sources?.affiliate?.startsWith('https://')) errors.push(`${prefix}: affiliate primary source is required`);
      if (a.public_compensation_eur != null && !Number.isFinite(a.public_compensation_eur)) {
        errors.push(`${prefix}: public_compensation_eur must be numeric when present`);
      }
      if (a.active === true && a.legal_review_status !== 'approved') {
        errors.push(`${prefix}: affiliate cannot be active before legal_review_status=approved`);
      }
      if (a.legal_review_status === 'approved' && !a.approval_evidence) {
        errors.push(`${prefix}: approved affiliate requires approval_evidence`);
      }
    }
  }

  return errors;
}

function runCli() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const seedPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(here, 'providers.seed.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const errors = validateProvidersSeed(seed);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(`OK: ${seed.providers.length} provider records passed seed validation.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
