import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const links=(html.match(/href="\.\/spielerschutz\.html"/g)||[]).length;
assert.ok(links>=2,'Spielerschutz muss im Header und Footer dauerhaft erreichbar sein');
assert.match(html,/18\+ · Deutschland/,'18+- und Marktkennzeichnung fehlt');
assert.match(html,/Glücksspiel kann süchtig machen\./,'dauerhafter Risikohinweis fehlt');
assert.match(html,/Spielerschutz, Beratung & Sperrhilfe/,'Footer-Hilfehinweis fehlt');
assert.doesNotMatch(html,/href="[^\"]*(affiliate|tracking)[^\"]*"/i,'Spielerschutz-Navigation darf kein Affiliate-/Trackingziel sein');
console.log('PASS: Spielerschutz dauerhaft im Finder sichtbar und ohne Affiliate-/Trackingziel');
