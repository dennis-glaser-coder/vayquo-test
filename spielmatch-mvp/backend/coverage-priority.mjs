const REQUIRED_MARKET = 'DE';
const REQUIRED_PRODUCT = 'virtual_slots';
const REQUIRED_EVIDENCE = 'operator_game_page';

export function buildCoveragePriority(records, { minimumProviders = 3 } = {}) {
  const grouped = new Map();

  for (const row of records ?? []) {
    if (
      row.market !== REQUIRED_MARKET ||
      row.product !== REQUIRED_PRODUCT ||
      row.availability_status !== 'verified' ||
      row.evidence_type !== REQUIRED_EVIDENCE ||
      !row.game_slug || !row.game_name || !row.provider_slug ||
      typeof row.source_url !== 'string' || !row.source_url.startsWith('https://') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.verified_as_of ?? '')
    ) continue;

    const item = grouped.get(row.game_slug) ?? {
      gameSlug: row.game_slug,
      gameName: row.game_name,
      market: REQUIRED_MARKET,
      product: REQUIRED_PRODUCT,
      providers: new Set(),
      newestVerification: row.verified_as_of
    };
    item.providers.add(row.provider_slug);
    if (row.verified_as_of > item.newestVerification) item.newestVerification = row.verified_as_of;
    grouped.set(row.game_slug, item);
  }

  return [...grouped.values()]
    .map(item => ({
      gameSlug: item.gameSlug,
      gameName: item.gameName,
      market: item.market,
      product: item.product,
      providerCount: item.providers.size,
      providers: [...item.providers].sort(),
      newestVerification: item.newestVerification,
      readyForMatch: item.providers.size >= minimumProviders,
      providersNeeded: Math.max(0, minimumProviders - item.providers.size)
    }))
    .sort((a, b) =>
      Number(b.readyForMatch) - Number(a.readyForMatch) ||
      b.providerCount - a.providerCount ||
      a.gameName.localeCompare(b.gameName, 'de')
    );
}

export function summarizeCoverage(priority) {
  const rows = priority ?? [];
  return {
    verifiedGames: rows.length,
    matchReadyGames: rows.filter(row => row.readyForMatch).length,
    belowGateGames: rows.filter(row => !row.readyForMatch).length,
    verifiedRelationships: rows.reduce((sum, row) => sum + row.providerCount, 0)
  };
}
