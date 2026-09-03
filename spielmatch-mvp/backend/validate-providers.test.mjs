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

console.log('OK: provider seed validation tests passed.');
