const fs=require('fs');const assert=require('assert');const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html'),js=read('assets/vayquo-machine.js'),css=read('assets/vayquo-machine.css');
const smartJs=read('assets/vayquo-smart-result.js'),smartCss=read('assets/vayquo-smart-result.css'),analytics=read('v36-anonymous-analytics.js');
const legal=read('rechtliches.html'),partner=read('partner.html'),partnerJs=read('assets/vayquo-partner.js');
const portal=read('partner-portal.html'),portalJs=read('assets/vayquo-portal.js'),customer=read('kunde.html'),customerJs=read('assets/vayquo-customer.js'),customerCss=read('assets/vayquo-customer.css');
const pv=read('photovoltaik/index.html'),pvCost=read('photovoltaik/kosten.html'),pvStorage=read('photovoltaik/speicher.html'),pvEeg=read('photovoltaik/einspeiseverguetung.html'),pvLocal=read('photovoltaik/paderborn.html');
const heating=read('heizung/index.html'),kitchen=read('kueche/index.html'),bath=read('bad/index.html'),about=read('ueber-vayquo.html'),sitemap=read('sitemap.xml'),robots=read('robots.txt'),readme=read('README.md');

for(const id of ['vqStart','vqWizard','vqQuestionScreen','vqPostcodeScreen','vqResultScreen','vqProfileSummary','vqCheckProviders','vqContactScreen','vqContactForm','vqConsent','vqSubmit','vqSuccess'])assert(html.includes(`id="${id}"`),`missing #${id}`);
for(const project of ['pv','heating','kitchen','bath'])assert(html.includes(`data-project="${project}"`),`missing project ${project}`);
assert(html.includes('Erst wissen, was realistisch ist.<br>Dann Angebote holen.'),'USP missing');
for(const p of ['Sofortergebnis','Keine Registrierung','Angebote optional','Anonym passende Rückmeldungen starten.','Keine E-Mail. Keine Telefonnummer.'])assert(html.includes(p),`main copy missing ${p}`);
assert(!html.includes('id="vqEmail"')&&!html.includes('id="vqPhone"')&&!html.includes('id="vqFirstName"'),'main funnel captures PII too early');
assert(html.includes('bis zu 3 passenden Fachbetrieben'),'3-provider consent cap missing');
assert((html.match(/images\.unsplash\.com/g)||[]).length>=4,'project photography missing');
assert(css.includes('.vq-offer-preview')&&smartCss.includes('.vq-smart-panel'),'result styling missing');

for(const p of ['pv:{label:','heating:{label:','kitchen:{label:','bath:{label:','function pvResult()','function heatingResult()','function kitchenResult()','function bathResult()'])assert(js.includes(p),`engine missing ${p}`);
for(const p of ["price='6,5–20 Tsd. €'","b:'29–62 Tsd. €*'","a:'Ø 12.404 €'","'1,2–3,5 Tsd. €/m²'",'first_name:null,email:null,phone:null',"CONSENT_VERSION='2026-09-02-v5'",'marketing_attribution:marketingAttribution()','function referrerHost()','referrer:referrerHost()'])assert(js.includes(p),`engine contract missing ${p}`);
assert(!js.includes('referrer:(document.referrer'),'full referrer URL must not be persisted');
assert(!js.includes('localStorage'),'private project token must not be persisted in browser localStorage');
assert(js.includes('kann den Link deshalb nicht wiederherstellen'),'customer must be warned that the private link cannot be recovered');
for(const p of ['verbraucherzentrale','1kuechen.de','aroundhome.de'])assert(js.includes(p),`source disclosure missing ${p}`);
for(const p of ['MUSS DRINSTEHEN','OFT VERGESSEN','SPÄTER VERGLEICHEN'])assert(smartJs.includes(p),`deal-check missing ${p}`);
for(const e of ['revenue_intent','revenue_flow_start','revenue_result','revenue_primary_click','revenue_request_success'])assert(analytics.includes(e),`analytics missing ${e}`);

for(const p of ['Vorname, E-Mail-Adresse und Telefonnummer werden in diesem Schritt nicht abgefragt','Erst wenn der Nutzer später eine konkrete Anbieter-Rückmeldung aktiv auswählt','höchstens drei','EU-Region','nicht zusätzlich im Browser-Speicher'])assert(legal.includes(p),`privacy contract missing ${p}`);
for(const p of ['PV · HEIZUNG · KÜCHE · BAD','49 € Pilotpreis je freigegebenem Kontakt'])assert(partner.includes(p),`partner page missing ${p}`);
for(const c of ['Photovoltaik','Heizung','Küche','Bad'])assert(partner.includes(`>${c}</label>`),`partner category missing ${c}`);
assert(partnerJs.includes("source:'partner_page_multi_category_pilot'"),'partner attribution missing');

for(const p of ['noindex,nofollow','STRUKTURIERTE RÜCKMELDUNGEN','Ein Konto allein gibt keinen Zugriff','Partnerkonto anlegen'])assert(portal.includes(p),`portal copy missing ${p}`);
for(const p of ["client.rpc('vayquo_my_leads'",'RESPONSE_LABELS','data-primary','data-secondary','data-included','data-availability','Bitte mindestens eine Preisgrenze angeben.','Bitte Kernleistung, enthaltene Arbeiten und Verfügbarkeit ausfüllen.','p_details:details','client.auth.signUp'])assert(portalJs.includes(p),`portal behavior missing ${p}`);
assert(!portalJs.includes('vayquo_partner_signup_eligible'),'public partner-email enumeration returned');

for(const p of ['noindex,nofollow','Nicht nur Preise.<br>Leistung vergleichen.','Kontakt erst bei Auswahl'])assert(customer.includes(p),`customer portal copy missing ${p}`);
for(const p of ["client.rpc('vayquo_customer_matches'",'provider_details','DETAIL_LABELS','primary_spec','secondary_spec','included','availability','data-contact-email','data-contact-phone','data-contact-name','data-contact-consent',"client.rpc('vayquo_customer_select_partner'",'p_email:email','p_phone:phone','p_first_name:firstName||null'])assert(customerJs.includes(p),`customer behavior missing ${p}`);
assert(customerCss.includes('.vc-details')&&customerCss.includes('.vc-contact-gate'),'customer comparison styling missing');

assert(pv.includes('?project=pv&source=')&&pv.includes('ohne Name, E-Mail oder Telefonnummer'),'PV anonymous flow missing');
assert(pvCost.includes('6.500–14.000 €')&&pvCost.includes('10.000–20.000 €'),'PV cost bands missing');
assert(pvStorage.includes('300–700 €/kWh'),'storage benchmark missing');
for(const v of ['8,10 ct/kWh','12,62 ct/kWh','7,06 ct/kWh','10,64 ct/kWh','5,84 ct/kWh'])assert(pvEeg.includes(v),`EEG value missing ${v}`);
assert(pvEeg.includes('stufenweise')&&pvEeg.includes('Leistungsanteile'),'EEG tier calculation explanation missing');
assert(pvLocal.includes('Solarkataster'),'local PV context missing');
assert(heating.includes('?project=heating&source=seo-heizung')&&heating.includes('Sofortergebnis'),'heating flow missing');
assert(kitchen.includes('?project=kitchen&source=seo-kueche')&&kitchen.includes('12.404 €'),'kitchen flow/benchmark missing');
assert(bath.includes('?project=bath&source=seo-bad')&&bath.includes('aroundhome.de'),'bath flow/source missing');
for(const v of ['1.200 €/m²','2.000 €/m²','3.500 €/m²'])assert(bath.includes(v),`bath level missing ${v}`);

for(const p of ['Photovoltaik','Heizung','Küche','Bad'])assert(about.includes(p),`about page missing ${p}`);
assert(!about.includes('Membership Rewards')&&!about.includes('PAYBACK'),'old points product still on about page');
assert(readme.includes('Photovoltaik, Heizung, Küche und Bad')&&!readme.includes('Home Gym')&&!readme.includes('Schrauber-Garage'),'README still describes legacy product');
for(const u of ['https://vayquo.de/','https://vayquo.de/photovoltaik/','https://vayquo.de/heizung/','https://vayquo.de/kueche/','https://vayquo.de/bad/','https://vayquo.de/partner.html','https://vayquo.de/ueber-vayquo.html'])assert(sitemap.includes(u),`sitemap missing ${u}`);
for(const legacy of ['/ratgeber/','/setups/','moment.html','pulse.html','beta.html','beta2.html','beta3.html'])assert(!sitemap.includes(legacy),`legacy URL in sitemap: ${legacy}`);
assert(!sitemap.includes('partner-portal.html')&&!sitemap.includes('kunde.html'),'private portals indexed');
assert(robots.includes('Disallow: /tests/')&&!robots.includes('beta.html'),'robots stale');
for(const f of ['beta.html','beta2.html','beta3.html','moment.html','pulse.html','ratgeber/index.html','setups/index.html'])assert(!fs.existsSync(f),`legacy public page exists: ${f}`);
console.log('VAYQUO current house-project product contract: OK');