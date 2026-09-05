import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./spielerschutz.html',import.meta.url),'utf8');
assert.match(html,/<title>Spielerschutz & Hilfe – SPIELMATCH<\/title>/);
assert.match(html,/18\+ · Deutschland/);
assert.match(html,/0800 1 37 27 00/);
assert.match(html,/check-dein-spiel\.de\/hilfe-fuer-spieler\//);
assert.match(html,/check-dein-spiel\.de\/check-out\/das-programm\//);
assert.match(html,/gluecksspiel-behoerde\.de\/de\//);
assert.match(html,/nicht provisions- oder conversion-optimiert/i);
assert.match(html,/nicht als Affiliate-Links/i);
assert.doesNotMatch(html,/casino.{0,30}(bonus|angebot)/i);
assert.doesNotMatch(html,/jetzt spielen/i);
console.log('PASS: Spielerschutz page has 18+, independent help, official-source links and no conversion CTA');
