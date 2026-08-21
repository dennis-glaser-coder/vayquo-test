const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const cleanup=fs.readFileSync('v30-points-page-cleanup.js','utf8');
const balances=fs.readFileSync('v24-points-balance.js','utf8');

assert(index.includes('v30-points-page-cleanup.js?v=3001'),'index must load points-page cleanup');
assert(index.indexOf('pointsBalanceAssets')<index.indexOf('pointsPageCleanupAssets'),'cleanup must load after the existing balance panel');
assert(index.indexOf('uiConsistencyAssets')<index.indexOf('pointsPageCleanupAssets'),'points cleanup must run after the global UI consistency pass');

assert(balances.includes('id="v24pb-panel"'),'existing balance editor must remain intact');
assert(balances.includes('data-v24pb-edit'),'per-program balance editing must remain intact');
assert(balances.includes("q('#v24pb-all')"),'bulk balance update must remain intact');

assert(cleanup.includes("/^Punkte\\s*&\\s*Meilen$/i"),'cleanup must anchor to the real Punkte & Meilen page title');
assert(cleanup.includes("anchor.insertAdjacentElement('afterend',panel)"),'balance panel must be moved below the page title');
assert(cleanup.includes("title.textContent='Deine Bestände'"),'balance panel must use the simplified heading');
assert(cleanup.includes("copy.textContent='Diese Stände nutzt VAYQUO für deine Auswertungen.'"),'balance panel must explain its purpose once');

assert(cleanup.includes("manage.textContent='Programme verwalten'"),'program management must move into the balance area');
assert(cleanup.includes("exactControl('Programme ändern')"),'new program-management action must delegate to the existing working control');
assert(cleanup.includes("wanted=['Amex','PAYBACK','Alle']"),'program filter choices must be preserved');
assert(cleanup.includes("label.textContent='Anzeigen'"),'remaining program selector must be presented as a compact filter');
assert(cleanup.includes("if(t==='Deine Programme'||t==='Antippen und direkt filtern')"),'duplicate lower program heading/subtitle must be hidden');

assert(cleanup.includes("if(txt(el)!=='Bestand ändern')return"),'only the duplicate balance-change action may be hidden');
assert(cleanup.includes("txt(x)==='Punkte sinnvoll einsetzen'"),'primary points-use action must remain and expand after deduplication');
assert(!cleanup.includes("txt(el)==='Punkte sinnvoll einsetzen')el.dataset.v30DuplicateBalance"),'cleanup must never hide the primary points-use action');

console.log('VAYQUO points page cleanup gates: OK');
