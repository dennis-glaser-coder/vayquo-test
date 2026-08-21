(()=>{
'use strict';

const CATALOG=JSON.parse(String.raw`{
  "schemaVersion": 2,
  "market": "DE",
  "checkedAt": "2026-08-21",
  "principles": {
    "userFitFirst": true,
    "commissionMayNotAffectRanking": true,
    "showNoMatchWhenAppropriate": true,
    "doNotInventBenefits": true,
    "providerTermsWin": true
  },
  "cards": [
    {
      "id": "amex_payback",
      "name": "PAYBACK American Express",
      "family": "amex",
      "network": "amex",
      "monthlyFeeEUR": 0,
      "rewards": ["payback"],
      "features": ["free", "payback", "amex_offers"],
      "bestFor": ["payback", "save_fees"],
      "notFor": ["lounge", "premium_travel", "miles_direct"],
      "officialUrl": "https://www.americanexpress.com/de-de/kreditkarte/payback-karte/",
      "facts": ["Dauerhaft kein Jahresentgelt", "1 PAYBACK Punkt je 3 Euro Kartenumsatz außerhalb der PAYBACK Partner; Tankstellenumsätze ausgenommen"],
      "sourceUrls": ["https://www.americanexpress.com/de-de/kreditkarte/payback-karte/"],
      "sourceNote": "American Express DE, geprüft 21.08.2026"
    },
    {
      "id": "amex_green",
      "name": "American Express Card",
      "family": "amex",
      "network": "amex",
      "monthlyFeeEUR": 5,
      "rewards": ["mr"],
      "features": ["mr", "basic_travel", "insurance_basic"],
      "bestFor": ["points", "low_fee_rewards"],
      "notFor": ["lounge", "premium_travel"],
      "officialUrl": "https://www.americanexpress.com/de-de/kreditkarte/american-express-card/",
      "facts": ["5 Euro pro Monat", "Membership Rewards inklusive", "Ab dem 2. Jahr entfällt das Kartenentgelt im Folgejahr bei mehr als 9.000 Euro Jahresumsatz"],
      "sourceUrls": ["https://www.americanexpress.com/de-de/kreditkarte/american-express-card/"],
      "sourceNote": "American Express DE, geprüft 21.08.2026"
    },
    {
      "id": "amex_gold",
      "name": "American Express Gold Card",
      "family": "amex",
      "network": "amex",
      "monthlyFeeEUR": 20,
      "rewards": ["mr"],
      "features": ["mr", "insurance", "mobility", "shopping"],
      "bestFor": ["points", "travel", "insurance", "mobility"],
      "notFor": ["included_lounge_access"],
      "officialUrl": "https://www.americanexpress.com/de-de/kreditkarte/goldcard/",
      "facts": ["20 Euro Monatsentgelt", "Membership Rewards inklusive", "Umfangreicher Versicherungsschutz", "Mobilitätsguthaben laut Anbieterbedingungen"],
      "sourceUrls": ["https://www.americanexpress.com/de-de/kreditkarte/goldcard/"],
      "sourceNote": "American Express DE, geprüft 21.08.2026"
    },
    {
      "id": "amex_platinum",
      "name": "American Express Platinum Card",
      "family": "amex",
      "network": "amex",
      "monthlyFeeEUR": 60,
      "rewards": ["mr"],
      "features": ["mr", "insurance", "lounge", "travel_credit", "mobility", "premium_travel"],
      "bestFor": ["premium_travel", "lounge", "travel", "points"],
      "notFor": ["save_fees"],
      "officialUrl": "https://www.americanexpress.com/de-de/kreditkarte/platinum-card/",
      "facts": ["60 Euro Monatsentgelt", "200 Euro Online-Reiseguthaben jährlich", "Zugang zur American Express Global Lounge Collection"],
      "sourceUrls": ["https://www.americanexpress.com/de-de/kreditkarte/platinum-card/"],
      "sourceNote": "American Express DE, geprüft 21.08.2026"
    },
    {
      "id": "mm_myflex",
      "name": "Miles & More MyFlex Credit Card",
      "family": "miles_more",
      "network": "mastercard",
      "monthlyFeeEUR": 0,
      "rewards": ["miles_more"],
      "features": ["free", "miles_direct", "high_acceptance"],
      "bestFor": ["miles", "save_fees"],
      "notFor": ["lounge", "premium_travel", "no_fx"],
      "officialUrl": "https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-myflex-credit-card.html",
      "facts": ["0 Euro monatlicher Kartenpreis", "1 Meile je 2 Euro Kartenumsatz"],
      "warnings": ["Bei Nutzung der Teilzahlungsfunktion fallen Zinsen an.", "Für Verfügungen außerhalb des Euro-Zahlungsraums kann laut Preis- und Leistungsverzeichnis ein Auslandseinsatzentgelt anfallen."],
      "sourceUrls": ["https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-myflex-credit-card.html", "https://www.miles-and-more-kreditkarte.com/dam/milesandmore/dokumente/pdf/legal/preis-und-leistungsverzeichnis-myflex.pdf"],
      "sourceNote": "Miles & More Kreditkarte / Deutsche Bank, geprüft 21.08.2026"
    },
    {
      "id": "mm_blue",
      "name": "Miles & More Blue Credit Card",
      "family": "miles_more",
      "network": "mastercard",
      "monthlyFeeEUR": 5.5,
      "rewards": ["miles_more"],
      "features": ["miles_direct", "miles_expiry_protection", "high_acceptance"],
      "bestFor": ["miles", "protect_miles"],
      "notFor": ["lounge", "premium_travel", "no_fx"],
      "officialUrl": "https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-blue-credit-card.html",
      "facts": ["5,50 Euro monatlicher Kartenpreis", "1 Meile je 2 Euro Kartenumsatz", "Meilen bleiben während der Karteninhaberschaft nach Anbieterbedingungen vor Verfall geschützt"],
      "sourceUrls": ["https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-blue-credit-card.html", "https://www.miles-and-more-kreditkarte.com/dam/milesandmore/dokumente/pdf/legal/preis-und-leistungsverzeichnis.pdf"],
      "sourceNote": "Miles & More Kreditkarte / Deutsche Bank, geprüft 21.08.2026"
    },
    {
      "id": "mm_gold",
      "name": "Miles & More Gold Credit Card",
      "family": "miles_more",
      "network": "mastercard",
      "monthlyFeeEUR": 11.5,
      "rewards": ["miles_more"],
      "features": ["miles_direct", "miles_expiry_protection", "insurance", "high_acceptance"],
      "bestFor": ["miles", "protect_miles", "insurance", "travel"],
      "notFor": ["included_lounge_access", "no_fx"],
      "officialUrl": "https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-gold-credit-card.html",
      "facts": ["11,50 Euro monatlicher Kartenpreis", "1 Meile je 2 Euro Kartenumsatz", "Premium-Versicherungspaket und Reiseservices"],
      "sourceUrls": ["https://www.miles-and-more-kreditkarte.com/de/privatkunden/kreditkarten/miles-and-more-gold-credit-card.html", "https://www.miles-and-more-kreditkarte.com/dam/milesandmore/dokumente/pdf/legal/preis-und-leistungsverzeichnis.pdf"],
      "sourceNote": "Miles & More Kreditkarte / Deutsche Bank, geprüft 21.08.2026"
    },
    {
      "id": "bank_norwegian_visa",
      "name": "Bank Norwegian Visa",
      "family": "bank_norwegian",
      "network": "visa",
      "monthlyFeeEUR": 0,
      "rewards": [],
      "features": ["free", "high_acceptance", "no_fx", "free_cash_abroad", "free_cash_domestic", "insurance_included", "cash_interest_free_if_full_payment"],
      "bestFor": ["abroad", "save_fees", "cash_abroad", "travel_insurance"],
      "notFor": ["points", "miles_direct", "lounge"],
      "officialUrl": "https://www.banknorwegian.de/kreditkarte/",
      "facts": ["0 Euro Jahresgebühr", "0 Prozent Fremdwährungsgebühr", "Bargeldabhebungen am Geldautomaten im In- und Ausland ohne Gebühr des Kartenanbieters", "Reise- und Reiserücktrittsversicherung unter den Anbieterbedingungen inklusive"],
      "warnings": ["Teilzahlung oder verspätete Zahlung verursacht Zinsen.", "Überweisungen aus dem Kreditrahmen auf das Referenzkonto werden ab Transaktionsdatum verzinst.", "Geldautomatenbetreiber können eigene Gebühren erheben."],
      "sourceUrls": ["https://www.banknorwegian.de/kreditkarte/", "https://www.banknorwegian.de/preise-und-produkte/", "https://www.banknorwegian.de/versicherungen/reiseversicherung/"],
      "sourceNote": "Bank Norwegian DE, geprüft 21.08.2026"
    },
    {
      "id": "hanseatic_genialcard",
      "name": "Hanseatic Bank GenialCard",
      "family": "hanseatic",
      "network": "visa",
      "monthlyFeeEUR": 0,
      "rewards": [],
      "features": ["free", "high_acceptance", "no_fx", "free_cash_abroad"],
      "bestFor": ["abroad", "save_fees", "high_acceptance"],
      "notFor": ["points", "miles_direct", "included_travel_insurance"],
      "officialUrl": "https://www.hanseaticbank.de/kreditkarte/genialcard",
      "facts": ["0 Euro Jahresgebühr ohne Mindestumsatz", "Keine Fremdwährungsgebühr", "Bargeldabhebungen im Ausland ohne Gebühr der Hanseatic Bank"],
      "warnings": ["Bargeldabhebungen am Geldautomaten innerhalb Deutschlands kosten laut aktuellem Konditionsblatt 3,95 Euro.", "Bei Teilzahlung fallen nach den jeweils geltenden Konditionen Zinsen an.", "Geldautomatenbetreiber können eigene Gebühren erheben."],
      "sourceUrls": ["https://www.hanseaticbank.de/kreditkarte/genialcard", "https://www.hanseaticbank.de/content/download/8870/file/GenialCard_PLV.pdf"],
      "sourceNote": "Hanseatic Bank, geprüft 21.08.2026"
    },
    {
      "id": "tf_mastercard_gold",
      "name": "TF Mastercard Gold",
      "family": "tf_bank",
      "network": "mastercard",
      "monthlyFeeEUR": 0,
      "rewards": [],
      "features": ["free", "high_acceptance", "no_fx", "free_cash_abroad", "free_cash_domestic", "insurance_included"],
      "bestFor": ["abroad", "save_fees", "travel_insurance"],
      "notFor": ["points", "miles_direct", "lounge"],
      "officialUrl": "https://tfbank.de/mastercard-gold",
      "facts": ["0 Euro Jahresgebühr", "0 Euro Auslandseinsatz- und Währungsumrechnungsgebühr", "Bargeldabhebungen ohne Abhebegebühr des Kartenanbieters", "Reiseversicherung unter den Anbieterbedingungen inklusive"],
      "warnings": ["Bargeldabhebungen und bestimmte Überweisungen werden laut Anbieter ab Buchungstag verzinst.", "Bei Teilzahlung fallen Zinsen an.", "Geldautomatenbetreiber können eigene Gebühren erheben."],
      "sourceUrls": ["https://tfbank.de/mastercard-gold", "https://tfbank.de/media/metjnv0f/preis-und-leistungsverzeichnis_tf-bank-de_20260409.pdf"],
      "sourceNote": "TF Bank DE, geprüft 21.08.2026"
    }
  ],
  "outsideScope": {
    "unverified_market": {
      "title": "Noch kein belastbarer Marktsieger",
      "copy": "VAYQUO nennt nur Karten, deren wesentliche Konditionen und offizielle Produktseite aktuell gegengeprüft wurden.",
      "status": "verification-required"
    }
  }
}`);

window.VAYQUO_CARD_CATALOG_RUNTIME=CATALOG;
const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
 let raw='';
 try{raw=typeof input==='string'?input:(input&&typeof input.url==='string'?input.url:'');}catch{}
 let isCardCatalog=false;
 try{isCardCatalog=new URL(raw,window.location.href).pathname.endsWith('/config/vayquo-card-advisor.de.json');}catch{}
 if(isCardCatalog){
  return Promise.resolve(new Response(JSON.stringify(CATALOG),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}));
 }
 return nativeFetch(input,init);
};
})();
