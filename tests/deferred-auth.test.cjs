const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const auth=fs.readFileSync('v24-auth.js','utf8');

assert(index.includes('if(localStorage.getItem("vayquo:authSession"))document.documentElement.classList.add("vq-auth-pending")'),'initial app hiding must only apply when a stored session needs hydration');
assert(!index.includes('<script>document.documentElement.classList.add("vq-auth-pending")'),'guests must never be blocked by the old unconditional auth gate');
assert(index.includes('v24-auth.js?v=2403'),'deferred auth bundle version must be refreshed');

assert(auth.includes('root.hidden=true'),'auth overlay must mount hidden so guests do not see a login flash');
assert(auth.includes("else{hideGate();patchSettings();}"),'missing/invalid session must enter guest mode instead of showing the login gate');
assert(auth.includes("window.addEventListener('vayquo:card-advisor-result'"),'card recommendation must trigger deferred auth only after a real result exists');
assert(auth.includes("#v24os-result [data-v24oc-done=\"1\"]"),'offer-check result must also be recognized as a completed decision');
assert(auth.includes("mode:'register'"),'decision gate should default new traffic to account creation while keeping the login tab available');
assert(auth.includes('Deine Karten-Empfehlung ist fertig.'),'card gate must explain that value has already been created');
assert(auth.includes('Danach öffnet sich genau deine fertige Empfehlung'),'auth copy must frame registration as preserving/opening the completed decision');
assert(auth.includes("document.documentElement.classList.remove('vq-auth-pending')"),'decision overlay must not hide the already-built app state behind it');

assert(auth.includes("localStorage.removeItem(LAST_USER_KEY)"),'logout must detach the previous account before entering guest mode');
assert(auth.includes('writeBalanceMeta({})'),'logout must remove account-specific balance metadata');
assert(auth.includes('replaceState(neutralState())'),'logout must neutralize account data before showing the guest app');
assert(auth.includes('hideGate();patchSettings();'),'logout must return to guest mode instead of forcing an immediate login');
assert(auth.includes('Gastmodus · Entscheidungen bleiben nur auf diesem Gerät'),'settings must make guest persistence understandable');
assert(auth.includes("show:context=>showGate(context||{})"),'existing users must still be able to open login manually from account UI');

console.log('VAYQUO deferred auth gates: OK');
