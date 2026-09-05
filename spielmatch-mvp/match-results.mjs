const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(dateString, now) {
  const date = parseDate(dateString);
  if (!date) return Infinity;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS));
}

function providerFreshnessDate(provider) {
  const dates = [provider.ggl_verified_as_of, provider.verified_as_of]
    .map(parseDate)
    .filter(Boolean)
    .sort((a, b) => b - a);
  return dates[0] || null;
}

export function buildVerifiedGameMatches({
  gameSlug,
  market = 'DE',
  product = 'virtual_slots',
  gameSeed,
  providerSeed,
  preferences = {},
  now = new Date(),
  maxEvidenceAgeDays = 45,
  minimumProviders = 3,
}) {
  if (!gameSlug) throw new Error('gameSlug is required');
  if (market !== 'DE' || product !== 'virtual_slots') {
    return { status: 'unsupported_market_product', matches: [] };
  }

  const gameRecords = (gameSeed?.records || []).filter((record) =>
    record.game_slug === gameSlug &&
    record.market === market &&
    record.product === product &&
    record.availability_status === 'verified' &&
    record.evidence_type === 'operator_game_page' &&
    typeof record.source_url === 'string' &&
    record.source_url.startsWith('https://') &&
    daysSince(record.verified_as_of, now) <= maxEvidenceAgeDays
  );

  const providersBySlug = new Map((providerSeed?.providers || []).map((provider) => [provider.slug, provider]));
  const uniqueProviderSlugs = [...new Set(gameRecords.map((record) => record.provider_slug))];

  if (uniqueProviderSlugs.length < minimumProviders) {
    return {
      status: 'insufficient_verified_coverage',
      providerCount: uniqueProviderSlugs.length,
      minimumProviders,
      matches: [],
    };
  }

  const relevantWeights = {
    game: 45,
    freshness: 10,
  };
  if (preferences.payment) relevantWeights.payment = 20;
  if (Number.isFinite(preferences.maxMinDepositEur)) relevantWeights.deposit = 15;
  if (preferences.requireVerifiedCatalog) relevantWeights.catalog = 10;
  const denominator = Object.values(relevantWeights).reduce((sum, value) => sum + value, 0);

  const matches = [];
  for (const providerSlug of uniqueProviderSlugs) {
    const provider = providersBySlug.get(providerSlug);
    const gameRecord = gameRecords.find((record) => record.provider_slug === providerSlug);
    if (!provider || provider.market !== market || !provider.ggl_verified_as_of) continue;

    const providerFresh = providerFreshnessDate(provider);
    const providerFreshnessDays = providerFresh ? Math.max(0, Math.floor((now - providerFresh) / DAY_MS)) : Infinity;
    if (providerFreshnessDays > maxEvidenceAgeDays) continue;

    const components = [
      { key: 'game', label: 'Gesuchtes Spiel verifiziert verfügbar', weight: 45, matched: true },
      { key: 'freshness', label: 'Daten aktuell verifiziert', weight: 10, matched: true },
    ];

    if (preferences.payment) {
      components.push({
        key: 'payment',
        label: `Zahlungsart ${preferences.payment}`,
        weight: 20,
        matched: (provider.payments || []).includes(preferences.payment),
      });
    }

    if (Number.isFinite(preferences.maxMinDepositEur)) {
      components.push({
        key: 'deposit',
        label: `Mindesteinzahlung höchstens ${preferences.maxMinDepositEur} €`,
        weight: 15,
        matched: Number.isFinite(provider.min_deposit_eur) && provider.min_deposit_eur <= preferences.maxMinDepositEur,
      });
    }

    if (preferences.requireVerifiedCatalog) {
      components.push({
        key: 'catalog',
        label: 'Kataloggröße verifiziert',
        weight: 10,
        matched: provider.catalog_verified === true,
      });
    }

    const earned = components.filter((component) => component.matched).reduce((sum, component) => sum + component.weight, 0);
    const score = Math.round((100 * earned) / denominator);

    matches.push({
      providerSlug,
      providerName: provider.name,
      score,
      components,
      evidence: {
        game: gameRecord.source_url,
        gameVerifiedAsOf: gameRecord.verified_as_of,
        licenseVerifiedAsOf: provider.ggl_verified_as_of,
      },
      affiliate: {
        enabled: false,
        reason: 'Affiliate-Clickouts bleiben bis separater Vertrags- und Rechtsfreigabe deaktiviert.',
      },
    });
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const freshnessA = Math.min(daysSince(a.evidence.gameVerifiedAsOf, now), daysSince(a.evidence.licenseVerifiedAsOf, now));
    const freshnessB = Math.min(daysSince(b.evidence.gameVerifiedAsOf, now), daysSince(b.evidence.licenseVerifiedAsOf, now));
    if (freshnessA !== freshnessB) return freshnessA - freshnessB;
    return a.providerName.localeCompare(b.providerName, 'de');
  });

  return {
    status: matches.length >= minimumProviders ? 'ready' : 'insufficient_eligible_providers',
    providerCount: matches.length,
    minimumProviders,
    matches,
  };
}
