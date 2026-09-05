import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

assert.match(html, /import\s+\{\s*createFunnelTracker\s*\}\s+from\s+'\.\/funnel-events\.mjs'/);
assert.match(html, /const funnel=createFunnelTracker\(\)/);
for (const event of [
  'catalog_loaded',
  'catalog_load_failed',
  'game_selected',
  'filter_toggled',
  'match_requested',
  'match_ready',
  'match_insufficient_coverage',
  'match_data_error'
]) {
  assert.match(html, new RegExp(`funnel\\.track\\('${event}'`), `missing UI event ${event}`);
}
assert.doesNotMatch(html, /createFunnelTracker\(\{\s*sink:/);
assert.doesNotMatch(html, /gtag\(|google-analytics|googletagmanager|plausible|posthog|mixpanel|segment/i);
assert.doesNotMatch(html, /funnel\.track\([^\n]*(input\.value|query|email)/i);

console.log('PASS: finder and match UI emit only local allowlisted funnel events');
