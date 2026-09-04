import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProvidersSeed } from './validate-providers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(here, 'providers.seed.json'), 'utf8'));

assert.deepEqual(validateProvidersSeed(seed), []);

const activeBeforeApproval = structuredClone(seed);
activeBeforeApproval.providers.find((p) => p.slug === 'jokerstar').affiliate.active = true;
assert.ok(validateProvidersSeed(activeBeforeApproval).some((e) => e.includes('cannot be active')));

const approvedWithoutEvidence = structuredClone(seed);
approvedWithoutEvidence.providers.find((p) => p.slug === 'jokerstar').affiliate.legal_review_status = 'approved';
assert.ok(validateProvidersSeed(approvedWithoutEvidence).some((e) => e.includes('approval_evidence')));

const wrongMarket = structuredClone(seed);
wrongMarket.providers[0].market = 'AT';
assert.ok(validateProvidersSeed(wrongMarket).some((e) => e.includes('market must be DE')));

const invalidTierAmount = structuredClone(seed);
invalidTierAmount.providers.find((p) => p.slug === 'bet-at-home').affiliate.public_cpa_tiers[0].amount_eur = 0;
assert.ok(validateProvidersSeed(invalidTierAmount).some((e) => e.includes('amount_eur must be a positive number')));

const invalidTierDuration = structuredClone(seed);
invalidTierDuration.providers.find((p) => p.slug === 'bet-at-home').affiliate.public_cpa_tiers[0].duration_months = -6;
assert.ok(validateProvidersSeed(invalidTierDuration).some((e) => e.includes('duration_months must be a positive integer or null')));

const invalidRange = structuredClone(seed);
invalidRange.providers.find((p) => p.slug === 'bingbong').affiliate.public_cpa_range_eur = { min: 80, max: 75 };
assert.ok(validateProvidersSeed(invalidRange).some((e) => e.includes('min cannot exceed max')));

const invalidRangeMin = structuredClone(seed);
invalidRangeMin.providers.find((p) => p.slug === 'bingbong').affiliate.public_cpa_range_eur.min = 0;
assert.ok(validateProvidersSeed(invalidRangeMin).some((e) => e.includes('range_eur.min must be a positive number')));

const staleContractApproved = structuredClone(seed);
const slotmagie = staleContractApproved.providers.find((p) => p.slug === 'slotmagie');
slotmagie.affiliate.legal_review_status = 'approved';
slotmagie.affiliate.approval_evidence = 'test-evidence';
assert.ok(validateProvidersSeed(staleContractApproved).some((e) => e.includes('contract_status requires refresh')));

console.log('OK: provider seed validation tests passed.');
