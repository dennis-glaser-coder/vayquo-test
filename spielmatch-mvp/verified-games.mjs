export function buildVerifiedGameCatalog(seed, market = 'DE') {
  const records = Array.isArray(seed?.records) ? seed.records : [];
  const bySlug = new Map();

  for (const record of records) {
    if (
      record?.market !== market ||
      record?.product !== 'virtual_slots' ||
      record?.availability_status !== 'verified' ||
      record?.evidence_type !== 'operator_game_page' ||
      typeof record?.source_url !== 'string' ||
      !record.source_url.startsWith('https://') ||
      typeof record?.game_slug !== 'string' ||
      typeof record?.game_name !== 'string' ||
      typeof record?.provider_slug !== 'string'
    ) continue;

    const existing = bySlug.get(record.game_slug) || {
      slug: record.game_slug,
      name: record.game_name,
      providerSlugs: new Set()
    };

    if (existing.name !== record.game_name) {
      throw new Error(`Conflicting game names for slug ${record.game_slug}`);
    }

    existing.providerSlugs.add(record.provider_slug);
    bySlug.set(record.game_slug, existing);
  }

  return [...bySlug.values()]
    .map(game => ({
      slug: game.slug,
      name: game.name,
      providerSlugs: [...game.providerSlugs].sort(),
      providerCount: game.providerSlugs.size
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function autocompleteMatches(catalog, query, limit = 8) {
  const normalize = value => String(value || '')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const q = normalize(query).trim();
  if (!q) return [];

  return catalog
    .map(game => {
      const name = normalize(game.name);
      const rank = name.startsWith(q)
        ? 0
        : name.includes(q)
          ? 1
          : name.split(/\s+/).some(word => word.startsWith(q))
            ? 2
            : 9;
      return { ...game, rank };
    })
    .filter(game => game.rank < 9)
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'de'))
    .slice(0, limit);
}
