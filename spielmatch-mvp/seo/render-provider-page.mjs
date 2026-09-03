const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const isoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

export function canIndexProviderPage(provider) {
  if (!provider || provider.market !== 'DE') return false;
  if (provider.provider_status !== 'verified' || !isoDate(provider.provider_verified_at)) return false;
  if (!provider.license || provider.license.status !== 'verified' || !isoDate(provider.license.verified_at)) return false;
  if (!provider.license.evidence_url || !/^https:\/\//.test(provider.license.evidence_url)) return false;
  if (!Array.isArray(provider.games) || provider.games.length === 0) return false;

  return provider.games.every(game =>
    game.availability_status === 'verified' &&
    isoDate(game.availability_verified_at)
  );
}

export function renderProviderPage(provider, { origin = 'https://spielmatch.de' } = {}) {
  if (!provider?.slug || !provider?.name) throw new Error('provider.slug and provider.name are required');

  const indexable = canIndexProviderPage(provider);
  const canonical = `${origin}/de/anbieter/${encodeURIComponent(provider.slug)}/`;
  const verifiedGames = Array.isArray(provider.games)
    ? provider.games.filter(game => game.availability_status === 'verified' && isoDate(game.availability_verified_at))
    : [];

  const newestVerification = indexable
    ? [provider.provider_verified_at, provider.license.verified_at, ...verifiedGames.map(game => game.availability_verified_at)].sort().at(-1)
    : null;

  const title = indexable
    ? `${provider.name}: geprüfter Anbieter in Deutschland | SPIELMATCH`
    : `${provider.name}: Status und Spiele prüfen | SPIELMATCH`;

  const description = indexable
    ? `Geprüfter Status von ${provider.name} für Deutschland, inklusive Quellen, Prüfdatum und verifizierter Spielverfügbarkeit.`
    : `Informationen zu ${provider.name}. Rechtlicher Status und Spielverfügbarkeit werden erst nach vollständiger Prüfung als bestätigt ausgewiesen.`;

  const gameItems = indexable
    ? verifiedGames.map(game => `<li><strong>${esc(game.name)}</strong><span>Verfügbarkeit geprüft: ${esc(game.availability_verified_at)}</span></li>`).join('')
    : '<li>Spielverfügbarkeit wird derzeit geprüft. Ungeprüfte Spiele werden nicht als verfügbar empfohlen.</li>';

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
        { '@type': 'ListItem', position: 2, name: 'Anbieter', item: `${origin}/de/anbieter/` },
        { '@type': 'ListItem', position: 3, name: provider.name, item: canonical }
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
<nav aria-label="Breadcrumb"><a href="/de/">SPIELMATCH</a> / <a href="/de/anbieter/">Anbieter</a> / ${esc(provider.name)}</nav>
<h1>${indexable ? `${esc(provider.name)}: geprüfter Anbieter in Deutschland` : `${esc(provider.name)}: Status und Spiele prüfen`}</h1>
${indexable ? `<p><strong>Zuletzt geprüft:</strong> ${esc(newestVerification)}</p>` : '<p><strong>Status:</strong> Anbieterstatus noch nicht vollständig verifiziert.</p>'}
<section aria-labelledby="license"><h2 id="license">Status in Deutschland</h2>${indexable ? `<p>Status und Lizenznachweis wurden geprüft. <a href="${esc(provider.license.evidence_url)}" rel="nofollow noopener" target="_blank">Primärquelle ansehen</a>.</p>` : '<p>Eine rechtliche Freigabe wird erst nach dokumentierter Prüfung angezeigt.</p>'}</section>
<section aria-labelledby="games"><h2 id="games">Verifizierte Spiele</h2><ul>${gameItems}</ul></section>
<section aria-labelledby="method"><h2 id="method">Wie SPIELMATCH prüft</h2><p>Anbieterstatus, Lizenzbeleg und konkrete Spielverfügbarkeit werden getrennt dokumentiert. Affiliate-Vergütung beeinflusst weder Indexierung noch Reihenfolge oder Bewertung.</p></section>
<section aria-labelledby="responsible"><h2 id="responsible">Spielerschutz</h2><p>Glücksspiel ist erst ab 18 Jahren. Spiele verantwortungsvoll und nutze bei Bedarf die vorgesehenen Schutz- und Sperrangebote.</p></section>
</main>
</body>
</html>`;
}
