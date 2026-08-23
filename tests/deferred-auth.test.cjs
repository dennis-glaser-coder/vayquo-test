const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const auth=fs.readFileSync('v24-auth.js','utf8');

assert(index.includes('if(localStorage.getItem("vayquo:authSession"))document.documentElement.classList.add("vq-auth-pending")'),'initial app hiding must only apply when a stored session needs hydration');
assert(!index.includes('<script>document.documentElement.classList.add("vq-auth-pending")'),'guests must never be blocked by the old unconditional auth gate');
assert(index.includes('v24-auth.js?v=2404'),'deferred auth bundle version must stay explicit and cache-busted');
assert(!index.includes('v40-card-result-open.js'),'legacy guest card-result override must not be loaded');

assert(auth.includes('root.hidden=true'),'auth overlay must mount hidden so guests do not see a login flash');
assert(auth.includes("else{hideGate();patchSettings();}"),'missing/invalid session must enter guest mode instead of showing the login gate');
assert(auth.includes("#v24os-result [data-v24oc-done=\"1\"]"),'offer-check result must still be recognized as a completed decision');
assert(auth.includes("mode:'register'"),'manual/other decision account prompts should still support account creation');
assert(auth.includes("localStorage.removeItem(LAST_USER_KEY)"),'logout must detach the previous account before entering guest mode');
assert(auth.includes('writeBalanceMeta({})'),'logout must remove account-specific balance metadata');
assert(auth.includes('replaceState(neutralState())'),'logout must neutralize account data before showing the guest app');
assert(auth.includes('hideGate();patchSettings();'),'logout must return to guest mode instead of forcing an immediate login');
assert(auth.includes('Gastmodus · Entscheidungen bleiben nur auf diesem Gerät'),'settings must make guest persistence understandable');
assert(auth.includes("show:context=>showGate(context||{})"),'users must still be able to open account login manually');
assert(!auth.includes("window.addEventListener('vayquo:card-advisor-result',()=>decisionGate('card'))"),'finished card recommendations must never open the auth gate');
assert(auth.includes("window.addEventListener('vayquo:decision-ready'"),'other explicit decision/account gates must remain intact');
assert(auth.includes("decisionGate('offer')"),'offer-check account gate must remain intact');

console.log('VAYQUO deferred auth + public card results: OK');