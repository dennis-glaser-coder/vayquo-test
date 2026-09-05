import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

assert.match(html, /import\s+\{\s*buildVerifiedGameMatches\s*\}\s+from\s+'\.\/match-results\.mjs'/);
assert.match(html, /fetch\('\.\/backend\/providers\.seed\.json'/);
assert.match(html, /result\.status==='ready'\?renderReady\(result,game\):renderCoverage\(result,game\)/);
assert.match(html, /NOCH KEIN BELASTBARER VERGLEICH/);
assert.match(html, /Clickout noch nicht freigegeben/);
assert.doesNotMatch(html, /demoProviders/);
assert.doesNotMatch(html, /DEINE MATCHES · DEMO-DATEN/);
assert.match(html, /market:'DE',product:'virtual_slots'/);

console.log('PASS: UI uses verified match engine, coverage gate and disabled clickouts');
