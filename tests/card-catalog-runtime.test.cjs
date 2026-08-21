const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const runtime=fs.readFileSync('v34-card-catalog-runtime.js','utf8');
const canonical=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

const match=runtime.match(/const CATALOG=JSON\.parse\(String\.raw`([\s\S]*?)`\);/);
assert(match,'runtime card catalog must embed a parseable audited catalog');
const bundled=JSON.parse(match[1]);
assert.deepStrictEqual(bundled,canonical,'runtime card catalog must stay byte-for-data equivalent to canonical audited JSON');

assert(index.includes('v34-card-catalog-runtime.js?v=3401'),'index must load bundled card catalog runtime');
assert(index.indexOf('cardCatalogRuntimeAssets')<index.indexOf('cardCheckAssets'),'bundled catalog must load before the card advisor');
assert(runtime.includes("endsWith('/config/vayquo-card-advisor.de.json')"),'runtime interception must be scoped only to the card catalog endpoint');
assert(runtime.includes('return nativeFetch(input,init);'),'all unrelated fetches must continue through the native browser fetch');
assert(runtime.includes('Promise.resolve(new Response(JSON.stringify(CATALOG)'),'card catalog response must be immediate and not wait for a second network request');
assert.strictEqual(bundled.cards.length,10,'all 10 audited cards must be available to the instant runtime catalog');

console.log('VAYQUO instant card catalog runtime gates: OK');
