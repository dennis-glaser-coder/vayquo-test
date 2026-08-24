const fs=require('fs');
const zlib=require('zlib');
const assert=require('assert');

function decodeCore(){
 const parts=[];
 for(let i=1;i<=7;i++)parts.push(fs.readFileSync(`assets/data-${String(i).padStart(2,'0')}.txt`,'utf8').trim());
 return zlib.gunzipSync(Buffer.from(parts.join(''),'base64')).toString('utf8');
}

const core=decodeCore();
const pulse=fs.readFileSync('pulse.html','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

// The bridge must consume the existing persisted VAYQUO state instead of creating a second card profile.
assert(core.includes("const KEY='vayquo-v1-state'"),'core app-state key changed; review PULSE bridge before shipping');
assert(core.includes("localStorage.setItem(KEY,JSON.stringify(state))"),'core must keep central persistence');
for(const id of ['platinum','gold','goldrose','green','blue','payback','dmpayback','bmwpremium','bmw','none']){
 assert(core.includes(`{id:'${id}',name:`),`core card option ${id} is missing or changed`);
}
assert(pulse.includes("APP_STATE_KEY='vayquo-v1-state'"),'PULSE must read the same central app state');
assert(pulse.includes('localStorage.getItem(APP_STATE_KEY)'),'PULSE must read the persisted VAYQUO card selection');
assert(!pulse.includes('localStorage.setItem(APP_STATE_KEY'),'PULSE must never write or replace the main VAYQUO app state');

// Only exact, separately audited card equivalents may be auto-recognized.
const mappingMatch=pulse.match(/const APP_TO_CATALOG=\{([^}]*)\}/);
assert(mappingMatch,'PULSE audited app-to-catalog mapping missing');
const mapping=mappingMatch[1];
const supported={platinum:'amex_platinum',gold:'amex_gold',green:'amex_green',payback:'amex_payback'};
for(const [appId,catalogId] of Object.entries(supported)){
 assert(mapping.includes(`${appId}:'${catalogId}'`),`safe PULSE mapping missing ${appId} -> ${catalogId}`);
 assert(catalog.cards.some(card=>card.id===catalogId),`mapped PULSE card ${catalogId} is absent from audited catalog`);
}
for(const appId of ['goldrose','blue','dmpayback','bmwpremium','bmw','none']){
 assert(!new RegExp(`(?:^|,)${appId}:`).test(mapping),`${appId} must not be silently equated to a different audited card`);
}
assert(pulse.includes('PULSE unterstützt diese Variante noch nicht mit einer separat geprüften Kartenbasis'),'unsupported owned cards must be explained instead of guessed');

// Recognition is passive: preselecting is allowed, activating/replacing a watch always needs an explicit PULSE action.
assert(pulse.includes("if(!saved){select.value=card.id"),'a supported owned card should be preselected when no watch exists');
assert(pulse.includes('Nichts wird automatisch überschrieben.'),'different existing PULSE watch must be preserved visibly');
const setupHandler=pulse.slice(pulse.indexOf("setupCard.addEventListener('click'"),pulse.indexOf("select.addEventListener('change'"));
assert(setupHandler.includes('select.value=card.id'),'setup suggestion may change only the visible PULSE selection');
assert(!setupHandler.includes('setSaved('),'setup suggestion must not silently activate or replace a PULSE watch');
assert.strictEqual((pulse.match(/setSaved\(\{cardId:/g)||[]).length,1,'PULSE watch persistence must have one explicit activation path');
assert(pulse.includes("watchButton.addEventListener('click'"),'PULSE activation must remain an explicit button action');
assert(!pulse.includes('MutationObserver'),'standalone PULSE bridge must not add a global DOM observer');

// Compile executable inline scripts to catch syntax regressions before merge.
for(const match of pulse.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 const attrs=match[1]||'';
 if(/type=["']application\/ld\+json["']/i.test(attrs)||/\bsrc=/i.test(attrs))continue;
 new Function(match[2]);
}

console.log('VAYQUO PULSE owned-card bridge gates: OK (central state read-only; exact audited mappings; explicit watch activation)');
