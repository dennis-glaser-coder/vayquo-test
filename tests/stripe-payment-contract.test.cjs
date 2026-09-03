const fs=require('fs');const assert=require('assert');
const portal=fs.readFileSync('partner-portal.html','utf8');
const pay=fs.readFileSync('assets/vayquo-payments.js','utf8');
assert(portal.includes('assets/vayquo-payments.js?v=1'),'payment gate script missing');
assert(portal.includes('49 € Pilotpreis einmalig je freigegebenem Kontakt'),'partner pricing copy missing');
for(const token of ['buy.stripe.com','client_reference_id','vq_pending_paid_match','vayquo_my_leads','vayquo_partner_unlock_contact',"['paid','waived']"])assert(pay.includes(token),`payment contract missing ${token}`);
assert(!pay.includes('sk_live_')&&!pay.includes('sk_test_')&&!pay.includes('whsec_'),'secret Stripe credential leaked into public JavaScript');
console.log('VAYQUO Stripe partner payment gate: OK');