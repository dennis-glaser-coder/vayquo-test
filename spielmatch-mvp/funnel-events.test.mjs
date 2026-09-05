import assert from 'node:assert/strict';
import { ALLOWED_EVENTS, createFunnelTracker, sanitizeFunnelPayload } from './funnel-events.mjs';

assert.ok(ALLOWED_EVENTS.has('match_ready'));
assert.ok(ALLOWED_EVENTS.has('match_insufficient_coverage'));

const sanitized = sanitizeFunnelPayload({
  game_slug: 'book-of-ra',
  provider_count: 4,
  raw_query: 'Book of Ra Dennis@example.com',
  email: 'dennis@example.com',
  filter_enabled: true
});
assert.deepEqual(sanitized, { game_slug: 'book-of-ra', provider_count: 4, filter_enabled: true });

const emitted = [];
const tracker = createFunnelTracker({
  sink: event => emitted.push(event),
  now: () => '2026-09-05T02:12:15.000Z'
});

tracker.track('game_selected', { game_slug: 'book-of-ra', selection_source: 'autocomplete', raw_query: 'secret' });
tracker.track('filter_toggled', { filter_key: 'payment', filter_enabled: true });
tracker.track('match_ready', { game_slug: 'book-of-ra', provider_count: 4, selected_filter_count: 2 });

assert.equal(emitted.length, 3);
assert.equal(emitted[0].payload.raw_query, undefined);
assert.equal(emitted[2].payload.provider_count, 4);
assert.equal(tracker.snapshot().length, 3);
assert.throws(() => tracker.track('email_captured', { email: 'x@y.z' }), /Unknown funnel event/);

console.log('PASS: allowlisted funnel events, privacy sanitization, no raw query/PII fields, deterministic sink');
