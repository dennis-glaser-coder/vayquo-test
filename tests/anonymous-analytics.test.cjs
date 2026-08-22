const fs=require('fs');
const assert=require('assert');

const index=fs.readFileSync('index.html','utf8');
const analytics=fs.readFileSync('v36-anonymous-analytics.js','utf8');
const legal=fs.readFileSync('rechtliches.html','utf8');

assert(index.includes('v36-anonymous-analytics.js?v=3602'),'Main app must load the reviewed anonymous analytics module');
assert(analytics.includes("const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_events'"),'Analytics must write only to the dedicated VAYQUO events endpoint');
assert(analytics.includes("const API_KEY='sb_publishable_"),'Analytics may only use a publishable Supabase key');
assert(analytics.includes('user_id:null'),'Anonymous analytics must never attach a VAYQUO user id');
assert(analytics.includes('EVENT_SCHEMAS'),'Analytics events must use an explicit allowlist');
assert(analytics.includes('sanitizeProperties'),'Analytics properties must be filtered per event');
assert(!analytics.includes('localStorage'),'Analytics must not create or read a persistent local identifier');
assert(!analytics.includes('sessionStorage'),'Analytics must not create or read a persistent session identifier');
assert(!analytics.includes('document.cookie'),'Analytics must not use cookies');
assert(!analytics.includes('email'),'Analytics must not collect email addresses');
assert(analytics.includes("path:clean(location.pathname||'/',240)||'/'"),'Analytics may store the pathname but not the full URL query string');
assert(analytics.includes('new URL(document.referrer).hostname'),'Referrer collection must be reduced to hostname only');
assert(legal.includes('cookielose Nutzungsstatistik'),'Privacy notice must disclose cookieless usage statistics');
assert(legal.includes('nicht mit deinem VAYQUO-Konto'),'Privacy notice must state analytics are not linked to the user account');
assert(legal.includes('keine dauerhafte Gerätekennung'),'Privacy notice must state that no persistent device identifier is created');

console.log('VAYQUO anonymous analytics privacy gate: OK');
