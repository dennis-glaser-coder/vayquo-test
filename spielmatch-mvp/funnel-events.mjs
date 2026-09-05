const ALLOWED_EVENTS = new Set([
  'catalog_loaded',
  'catalog_load_failed',
  'game_selected',
  'filter_toggled',
  'match_requested',
  'match_ready',
  'match_insufficient_coverage',
  'match_data_error'
]);

const SAFE_KEYS = new Set([
  'game_slug',
  'selection_source',
  'filter_key',
  'filter_enabled',
  'provider_count',
  'minimum_providers',
  'selected_filter_count',
  'catalog_size',
  'status'
]);

function sanitizeValue(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  return value.slice(0, 80).replace(/[^a-zA-Z0-9_.:-]/g, '-');
}

export function sanitizeFunnelPayload(payload = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!SAFE_KEYS.has(key)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) clean[key] = sanitized;
  }
  return clean;
}

export function createFunnelTracker({ sink, now = () => new Date().toISOString() } = {}) {
  const history = [];
  const emit = typeof sink === 'function'
    ? sink
    : event => {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('spielmatch:funnel', { detail: event }));
        }
      };

  function track(name, payload = {}) {
    if (!ALLOWED_EVENTS.has(name)) throw new Error(`Unknown funnel event: ${name}`);
    const event = Object.freeze({
      name,
      occurred_at: now(),
      payload: Object.freeze(sanitizeFunnelPayload(payload))
    });
    history.push(event);
    emit(event);
    return event;
  }

  return {
    track,
    snapshot: () => history.slice()
  };
}

export { ALLOWED_EVENTS };
