import assert from 'node:assert/strict';
import { canIndexGamePage, renderGamePage } from './render-page.mjs';

const verifiedGame = {
  slug: 'book-of-ra',
  name: 'Book of Ra',
  studio: 'NOVOMATIC',
  verification_status: 'verified',
  verified_at: '2026-09-03',
  providers: [{
    name: 'Beispielanbieter',
    market: 'DE',
    provider_status: 'verified',
    provider_verified_at: '2026-09-03',
    availability_status: 'verified',
    availability_verified_at: '2026-09-03'
  }]
};

assert.equal(canIndexGamePage(verifiedGame), true);
let html = renderGamePage(verifiedGame);
assert.match(html, /index,follow/);
assert.match(html, /legal verfügbare Anbieter in Deutschland/);
assert.match(html, /BreadcrumbList/);
assert.doesNotMatch(html, /noindex/);

const pendingGame = structuredClone(verifiedGame);
pendingGame.providers[0].availability_status = 'pending';
assert.equal(canIndexGamePage(pendingGame), false);
html = renderGamePage(pendingGame);
assert.match(html, /noindex,follow/);
assert.match(html, /Verfügbarkeit noch nicht vollständig verifiziert/);
assert.doesNotMatch(html, /legal verfügbare Anbieter in Deutschland/);
assert.doesNotMatch(html, /BreadcrumbList/);

const wrongMarket = structuredClone(verifiedGame);
wrongMarket.providers[0].market = 'AT';
assert.equal(canIndexGamePage(wrongMarket), false);

assert.throws(() => renderGamePage({ name: 'Fehlt Slug' }), /slug and game.name/);

console.log('SEO gate tests passed');
