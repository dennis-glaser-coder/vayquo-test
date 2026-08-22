const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const auth=fs.readFileSync('v24-auth.js','utf8');
const cardOpen=fs.readFileSync('v40-card-result-open.js','utf8');

assert(index.includes('if(localStorage.getItem("vayquo:authSession"))document.documentElement.classList.add("vq-auth-pending")'),'initial app hiding must only apply when a stored session needs hydration');
assert(!index.includes('<script>document.documentElement.classList.add("vq-auth-pending")'),'guests must never be blocked by the old unconditional auth gate');
assert(index.includes('v24-auth.js?v=2403'),'deferred auth bundle version must stay explicit');
assert(index.includes('v40-card-result-open.js?v=4001'),'guest card-result override must be loaded');
assert(index.indexOf('authPolishAssets+cardResultOpenAssets')>0,'guest card-result override must load after auth/auth-polish');

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

assert(cardOpen.includes("window.addEventListener('vayquo:card-advisor-result'"),'finished card recommendations must explicitly keep guest access open');
assert(cardOpen.includes('window.VAYQUO_AUTH'),'override must respect the existing auth API');
assert(cardOpen.includes('getUser'),'signed-in users must not have their auth state disturbed');
assert(cardOpen.includes("gate.setAttribute('hidden','')"),'guest card result must hide the legacy registration gate');
assert(cardOpen.includes("classList.remove('vq-auth-pending')"),'guest card result must never leave the app hidden');
assert(!cardOpen.includes('vayquo:decision-ready'),'generic decision/account gates must remain untouched');
assert(!cardOpen.includes('v24os-result'),'offer-check auth behavior must remain untouched');
assert(!cardOpen.includes('preventDefault'),'card result override must not block other result listeners');
assert(!cardOpen.includes('stopPropagation'),'card result override must not block analytics or conversion listeners');
assert(!cardOpen.includes('stopImmediatePropagation'),'card result override must not block analytics or conversion listeners');

console.log('VAYQUO deferred auth + open card result gates: OK');
