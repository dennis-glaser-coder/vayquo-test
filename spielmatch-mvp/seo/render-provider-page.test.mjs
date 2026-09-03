import assert from 'node:assert/strict';
import { canIndexProviderPage, renderProviderPage } from './render-provider-page.mjs';

const verifiedProvider = {
  slug: 'novoline',
  name: 'NOVOLINE',
  market: 'DE',
  provider_status: 'verified',
  provider_verified_at: '2026-09-03',
  license: {
    status: 'verified',
    verified_at: '2026-09-03',
    evidence_url: 'https://example.org/primary-source'
  },
  games: [
    { name: 'Book of Ra', availability_status: 'verified', availability_verified_at: '2026-09-03' },
    { name: 'Sizzling Hot', availability_status: 'verified', availability_verified_at: '2026-09-02' }
  ]
};

assert.equal(canIndexProviderPage(verifiedProvider), true);
let html = renderProviderPage(verifiedProvider);
assert.match(html, /index,follow/);
assert.match(html, /geprüfter Anbieter in Deutschland/);
assert.match(html, /Primärquelle ansehen/);
assert.match(html, /BreadcrumbList/);
assert.doesNotMatch(html, /noindex/);

const pendingLicense = structuredClone(verifiedProvider);
pendingLicense.license.status = 'pending';
assert.equal(canIndexProviderPage(pendingLicense), false);
html = renderProviderPage(pendingLicense);
assert.match(html, /noindex,follow/);
assert.match(html, /Anbieterstatus noch nicht vollständig verifiziert/);
assert.doesNotMatch(html, /geprüfter Anbieter in Deutschland/);
assert.doesNotMatch(html, /BreadcrumbList/);

const missingEvidence = structuredClone(verifiedProvider);
missingEvidence.license.evidence_url = '';
assert.equal(canIndexProviderPage(missingEvidence), false);

const wrongMarket = structuredClone(verifiedProvider);
wrongMarket.market = 'AT';
assert.equal(canIndexProviderPage(wrongMarket), false);

const pendingGame = structuredClone(verifiedProvider);
pendingGame.games[0].availability_status = 'pending';
assert.equal(canIndexProviderPage(pendingGame), false);

assert.throws(() => renderProviderPage({ name: 'Fehlt Slug' }), /slug and provider.name/);

console.log('Provider SEO gate tests passed');
