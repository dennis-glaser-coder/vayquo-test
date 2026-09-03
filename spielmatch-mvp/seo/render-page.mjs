const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const isoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

export function canIndexGamePage(game) {
  if (!game || game.verification_status !== 'verified' || !isoDate(game.verified_at)) return false;
  if (!Array.isArray(game.providers) || game.providers.length === 0) return false;
  return game.providers.every(provider =>
    provider.market === 'DE' &&
    provider.provider_status === 'verified' &&
    isoDate(provider.provider_verified_at) &&
    provider.availability_status === 'verified' &&
    isoDate(provider.availability_verified_at)
  );
}

export function renderGamePage(game, { origin = 'https://spielmatch.de' } = {}) {
  if (!game?.slug || !game?.name) throw new Error('game.slug and game.name are required');

  const indexable = canIndexGamePage(game);
  const canonical = `${origin}/de/spiele/${encodeURIComponent(game.slug)}/`;
  const verifiedProviders = Array.isArray(game.providers)
    ? game.providers.filter(p => p.market === 'DE' && p.provider_status === 'verified' && p.availability_status === 'verified')
    : [];

  const title = indexable
    ? `${game.name}: legal verfügbare Anbieter in Deutschland | SPIELMATCH`
    : `${game.name}: Anbieter und Verfügbarkeit prüfen | SPIELMATCH`;
  const description = indexable
    ? `Geprüfte Anbieter für ${game.name} in Deutschland. Mit Quellen und Prüfdatum.`
    : `Informationen zu ${game.name}. Verfügbarkeit wird erst nach vollständiger Prüfung als bestätigt ausgewiesen.`;
  const newestVerification = indexable
    ? [game.verified_at, ...verifiedProviders.flatMap(p => [p.provider_verified_at, p.availability_verified_at])].sort().at(-1)
    : null;

  const providerItems = indexable
    ? verifiedProviders.map(p => `<li><strong>${esc(p.name)}</strong><span>Verfügbarkeit geprüft: ${esc(p.availability_verified_at)}</span></li>`).join('')
    : '<li>Verfügbarkeit wird derzeit geprüft. Es werden keine ungeprüften Anbieter empfohlen.</li>';

  const jsonLd = indexable ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    dateModified: newestVerification,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'SPIELMATCH', item: `${origin}/de/` },
        { '@type': 'ListItem', position: 2, name: 'Spiele', item: `${origin}/de/spiele/` },
        { '@type': 'ListItem', position: 3, name: game.name, item: canonical }
      ]
    }
  })}</script>` : '';

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
<link rel="canonical" href="${esc(canonical)}">
${jsonLd}
</head>
<body>
<main>
<nav aria-label="Breadcrumb"><a href="/de/">SPIELMATCH</a> / <a href="/de/spiele/">Spiele</a> / ${esc(game.name)}</nav>
<h1>${indexable ? `${esc(game.name)}: legal verfügbare Anbieter in Deutschland` : `${esc(game.name)}: Anbieter und Verfügbarkeit prüfen`}</h1>
${game.studio ? `<p>Hersteller: ${esc(game.studio)}</p>` : ''}
${indexable ? `<p><strong>Zuletzt geprüft:</strong> ${esc(newestVerification)}</p>` : '<p><strong>Status:</strong> Verfügbarkeit noch nicht vollständig verifiziert.</p>'}
<section aria-labelledby="providers"><h2 id="providers">Anbieter</h2><ul>${providerItems}</ul></section>
<section aria-labelledby="method"><h2 id="method">Warum diese Anbieter?</h2><p>SPIELMATCH zeigt hier nur Anbieter, deren deutscher Anbieterstatus und die konkrete Spielverfügbarkeit separat dokumentiert und verifiziert wurden. Affiliate-Vergütung beeinflusst die Reihenfolge nicht.</p></section>
<section aria-labelledby="responsible"><h2 id="responsible">Spielerschutz</h2><p>Glücksspiel ist erst ab 18 Jahren. Spiele verantwortungsvoll und nutze bei Bedarf die vorgesehenen Schutz- und Sperrangebote.</p></section>
</main>
</body>
</html>`;
}
