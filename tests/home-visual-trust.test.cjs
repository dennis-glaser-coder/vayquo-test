const fs=require('fs');
const assert=require('assert');

const homeUsp=fs.readFileSync('v34-home-usp.js','utf8');
const moduleSource=fs.readFileSync('v44-home-visual-trust.js','utf8');
const catalog=JSON.parse(fs.readFileSync('config/vayquo-card-advisor.de.json','utf8'));

assert(homeUsp.includes('v44-home-visual-trust.js?v=4412'),'existing home USP module must load the header-safe personalized visual module');
assert(homeUsp.includes('v44-card-entry-pending'),'legacy card-check entry must be paint-gated before the visual home module resolves the route');
assert(homeUsp.includes("script.addEventListener('error'"),'V44 loader must fail softly without changing the existing home flow');
assert(!moduleSource.includes('MutationObserver'),'homepage visual module must not use a global MutationObserver');
assert(moduleSource.includes("#v28-card-advisor-entry .v28ca-entry-btn"),'card visual CTA must reuse the existing card-check entry');
assert(moduleSource.includes("['benefits','card']"),'benefits visual card must reuse the existing benefits/card navigation');
assert(moduleSource.includes("['points','wallet']"),'points visual card must reuse the existing points/wallet navigation');
assert(moduleSource.includes('v44-home-entry-proxy'),'duplicate card-check promo must be presentation-collapsed on the home view');
assert(moduleSource.includes('setHomeEntryCollapsed(true)'),'home view must collapse the duplicate promo without deleting it');
assert(moduleSource.includes('setHomeEntryCollapsed(false)'),'leaving the home view must restore the original card-check entry');
assert(moduleSource.includes('releaseCardEntryPaintGate()'),'paint gate must release only after the card entry exists and the route is resolved');
assert(!moduleSource.includes("q('#v28-card-advisor-entry')?.remove"),'home cleanup must never delete the underlying card-check entry');
assert(moduleSource.includes('button.click()'),'visible homepage CTAs must continue opening existing product flows');
for(const removed of ['Unabhängig gerechnet','Konditionen geprüft','Empfehlung unabhängig von Provision','Nur offizielle Anbieterquellen','v44-trust-grid','v44-trust-item'])assert(!moduleSource.includes(removed),`redundant homepage trust block must be removed: ${removed}`);
for(const forbidden of ['80.000','Trustpilot','4.7 von 5','4,7 von 5','100 % unabhängig'])assert(!moduleSource.includes(forbidden),`homepage must not contain invented social proof: ${forbidden}`);
assert.strictEqual(catalog.checkedAt,'2026-08-21','canonical audited card-catalog date changed; update test intentionally after a real recheck');
assert(!moduleSource.includes('Kartenkonditionen zuletzt geprüft:'),'homepage must not show a maintenance date that looks stale between audits');
assert(moduleSource.includes('#171918'),'new homepage visual layer must use VAYQUO black rather than a new green primary color');
assert(!moduleSource.includes('#183b35'),'new homepage visual layer must not introduce the old green as its primary surface');
for(const url of ['https://images.unsplash.com/photo-1758192838598-a1de4da5dcaf','https://images.unsplash.com/photo-1772064901543-fb4a5d9f4736','https://images.unsplash.com/photo-1762280251209-f4c2cddeb53f'])assert(moduleSource.includes(url),`missing expected premium travel visual ${url}`);
assert(moduleSource.includes("card:'assets/vayquo-card-wallet.webp?v=1'"),'credit-card hero and compatibility tile must use the approved real wallet asset');
assert(!moduleSource.includes('data:image/webp;base64'),'card imagery must not carry a huge embedded data URL');
assert(!moduleSource.includes('v44-card-art-card'),'synthetic overlay card must be removed once the real card image is used');
assert(moduleSource.includes('Premium-Kreditkarte in einem eleganten Wallet'),'credit-card hero must describe the approved natural card image');
assert(moduleSource.includes('Welche Karte passt wirklich zu dir?'),'credit-card hero must be immediately understandable');
assert(moduleSource.includes("makeCard(IMAGES.points,'Punkte & Meilen'"),'points and miles must be a visible first-class home area');
assert(moduleSource.includes("makeCard(IMAGES.travel,'Vorteile'"),'benefits must be a visible first-class home area');
assert(moduleSource.includes('.v44-card[data-v44-kind="card"]{display:none!important}'),'duplicate card choice must stay hidden without deleting the compatibility node');

// Personalized next action must be honest, read-only and reversible.
assert(moduleSource.includes('function personalAction()'),'home must derive one next action from existing setup state');
assert(moduleSource.includes("CORE_STATE_KEY='vayquo-v1-state'"),'home must read the canonical local state');
assert(moduleSource.includes("BALANCE_META_KEY='vayquo:balanceMeta'"),'home must read existing balance-known metadata');
assert(moduleSource.includes('Noch kein persönliches Setup'),'new users must get a setup action rather than a fabricated recommendation');
assert(moduleSource.includes('Stand fehlt noch.'),'single missing balance must be stated explicitly');
assert(moduleSource.includes('Deine Auswertung ist bereit.'),'complete multi-program setup must lead to the existing evaluation');
assert(moduleSource.includes('FÜR DICH JETZT'),'personal action must be visibly labelled');
assert(moduleSource.includes('v44-personal-status'),'real progress/status must be shown without a fake completion percentage');
assert(!moduleSource.includes('% vollständig'),'personal action must not fabricate progress percentages');
assert(moduleSource.includes("desired=action.hasSetup?[hero,card,head,grid]:[hero,head,grid,card]"),'known users must get the personal action before secondary browsing while new users keep orientation first');
assert(moduleSource.includes("if(action.kind==='setup')return clickProgramsChange()"),'setup action must reuse the existing Programme Ändern control');
assert(moduleSource.includes("if(action.kind==='points')return clickExistingView(['points','wallet'])"),'zero-balance action must reuse the existing points view');
assert(moduleSource.includes('return clickExistingPersonal()'),'evaluation action must reuse the existing Beste Nutzung flow');
assert(moduleSource.includes('v44-personal-proxy'),'old generic personal hero must stay in DOM as a reversible presentation proxy');
assert(moduleSource.includes('setPersonalHeroCollapsed(true)'),'home must collapse the old generic personal hero once the personalized card is present');
assert(moduleSource.includes('setPersonalHeroCollapsed(false)'),'leaving home must restore the original personal hero');

// Collapse targeting must never swallow the greeting/USP/header container.
assert(moduleSource.includes("text(el)==='Nicht einfach Punkte haben. Das Maximum daraus machen.'"),'legacy hero lookup must anchor on its exact title');
assert(moduleSource.includes('node.contains(primary)&&node.contains(why)'),'legacy hero lookup must choose the smallest ancestor containing its own controls');
assert(moduleSource.includes("/^Hallo\\b/i.test(text(el))"),'collapse guard must detect a greeting inside an over-broad candidate');
assert(moduleSource.includes("node.querySelector('.v34usp-headerline')"),'collapse guard must protect the homepage USP');
assert(moduleSource.includes('node.querySelector(`#${ROOT_ID}`)'),'collapse guard must never hide the new visual home area');
assert(moduleSource.includes('if(containsGreeting||node.querySelector'), 'unsafe broad candidates must fail closed instead of being hidden');
assert(moduleSource.includes("!el.closest(`#${ROOT_ID}`)&&text(el)==='Beste Nutzung finden'"),'existing evaluation CTA lookup must stay outside the new personal card');

assert(!moduleSource.includes('localStorage.setItem'),'visual personalization must never write user state');
assert(!moduleSource.includes('localStorage.removeItem'),'visual personalization must never delete user state');
assert(!moduleSource.includes('preventDefault'),'visual personalization must not intercept native navigation events');
assert(!moduleSource.includes('stopImmediatePropagation'),'visual personalization must not block existing product handlers');

assert(!/american\s*express/i.test(moduleSource),'visual image layer must not depend on branded American Express imagery');
for(const dangerous of ['.v28ca-next','renderResult','VAYQUO_AUTH','decisionGate','commissionScore'])assert(!moduleSource.includes(dangerous),`isolated homepage module must not touch core flow internals: ${dangerous}`);
assert(moduleSource.includes("img.addEventListener('error'"),'image failures must fail softly without blocking the module');
assert(!moduleSource.includes('await safeImage'),'images must never gate homepage mounting');
console.log('VAYQUO home visual gates: OK (personal next action; header-safe legacy collapse; read-only setup state; existing product flows preserved)');
