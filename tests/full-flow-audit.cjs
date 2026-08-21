const fs=require('fs');
const zlib=require('zlib');
const assert=require('assert');

function decodeCore(){
 const parts=[];
 for(let i=1;i<=7;i++)parts.push(fs.readFileSync(`assets/data-${String(i).padStart(2,'0')}.txt`,'utf8').trim());
 return zlib.gunzipSync(Buffer.from(parts.join(''),'base64')).toString('utf8');
}
const core=decodeCore();

assert(core.length>200000,'compressed VAYQUO core unexpectedly small or unreadable');
for(const view of ['today','wallet','optimize','card'])assert(core.includes(`data-view="${view}"`),`core missing main view ${view}`);
assert(core.includes('function load()'),'core must load persistent app state');
assert(core.includes('localStorage.getItem(KEY)'),'core must restore saved user state after refresh');
assert(core.includes('function save()'),'core must expose central persistence');
assert(core.includes('localStorage.setItem(KEY,JSON.stringify(state))'),'core must persist saved user state');
assert(core.includes('function render()'),'core must expose central renderer');
assert(core.includes("if(view==='today')renderToday()"),'core must render Start/Today');
assert(core.includes("if(view==='optimize')renderOptimize()"),'core must render Optimieren');
assert(core.includes("if(view==='wallet')renderWallet()"),'core must render Punkte');
assert(core.includes("if(view==='card')renderCard()"),'core must render Vorteile');
assert(core.includes('function go(v,t=null)'),'core must support programmatic main navigation');
assert(core.includes('function openModal(')&&core.includes('function closeModal()'),'core modal open/close contract must remain available');

// The legacy compressed core has no browser-history contract of its own.
// v33-navigation-state.js intentionally supplies that layer without rewriting the core bundle.
assert(!core.includes('history.pushState'),'legacy core unexpectedly gained its own History API; review v33 integration before changing this gate');
assert(!core.includes("addEventListener('popstate'"),'legacy core unexpectedly gained popstate handling; review v33 integration before changing this gate');

console.log('VAYQUO compressed core flow contract: OK');
