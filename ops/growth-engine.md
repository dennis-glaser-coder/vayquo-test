# VAYQUO Growth Engine

Stand: 02.09.2026

## Kernmodell

Kunde: Suchintention/Ad -> VAYQUO Nutzwert-Seite -> Projektfunnel -> Angebotsvorschau -> ausdrückliche Freigabe -> Lead.

Anbieter: Partnerseite -> Pilotinteresse -> manuelle Abstimmung von Region/Kriterien/Preis -> Aktivierung als Partner -> private Match-Kandidaten -> Lead-Auslieferung -> Umsatz.

Wachstum: Quelle/Kampagne -> Leads -> valide Leads -> Umsatz -> CPL/Deckungsbeitrag -> nur profitable Quellen skalieren.

## Kunde

USP: Einmal anfragen. Passende Angebote bekommen. Fertig.

Funnel: Projektfragen -> PLZ -> Angebotsvorschau -> Kontakt -> Einwilligung -> `vayquo_project_requests`.

SEO-Einstiege starten direkt den passenden Funnel über `?project=pv&source=...`.

## SEO Phase 1: Photovoltaik

Indexierbar:
- `/photovoltaik/`
- `/photovoltaik/kosten.html`
- `/photovoltaik/speicher.html`
- `/photovoltaik/einspeiseverguetung.html`
- `/photovoltaik/paderborn.html`

Strategie: Kaufnahe Suchintentionen zuerst. Keine massenhafte Erzeugung nahezu identischer Stadtseiten. Neue lokale Seiten nur mit eigenem lokalen Nutzwert, z. B. Netzbetreiber, Solarkataster, Förderung oder echte Partnerabdeckung.

Alle Seiten verlinken direkt in denselben PV-Funnel. Die Sitemap enthält nur die fokussierte Wachstumsarchitektur; alte Affiliate-Setup-Seiten sind dort nicht mehr enthalten.

## Attribution

Jeder qualifizierte Lead speichert zusätzlich `marketing_attribution` mit:
- source / medium / campaign
- term / content
- gclid / gbraid / wbraid
- msclkid / fbclid
- landing_path
- referrer

Damit kann später pro Kampagne statt nur nach Gesamttraffic entschieden werden.

## Anbieter

Pilot: 49 EUR pro übermittelter PV-Anfrage, keine Grundgebühr, keine Mindestabnahme, max. 3 Empfänger. Vor erster kostenpflichtiger Weitergabe ausdrückliche Abstimmung.

Interessenten landen in `vayquo_partner_interest`.

Nach echter Zusage wird der Interessent privat in `vayquo_partners` aktiviert. Strukturierte `postcode_prefixes` und `categories` steuern das Matching.

Die Partnerseite zeigt vor Anmeldung ein anonymisiertes Beispielprojekt, damit der Betrieb konkret sieht, welche Qualifikation eine VAYQUO-Anfrage enthält.

## Privates Matching

`vayquo_lead_matches`: Kandidaten zwischen Projektanfrage und aktivem Partner.

Ein Trigger auf `vayquo_project_requests` erstellt automatisch nur Match-Kandidaten. Es werden dadurch keine Kundendaten automatisch öffentlich oder an Partner ausgeliefert.

`vayquo_lead_pipeline`: interne, nicht öffentliche Pipeline-View ohne Kontaktfelder.

`vayquo_partner_pipeline`: interne Partnerpipeline.

`vayquo_activate_partner_from_interest(...)`: private Operator-Funktion zur Aktivierung eines vereinbarten Pilotpartners und Rückwärts-Matching bereits vorhandener Leads.

## Unit Economics

`vayquo_campaign_spend`: private Tabelle für tatsächliche Werbeausgaben pro Quelle/Kampagne.

`vayquo_growth_metrics`: private aggregierte Leads/Umsatz-Sicht nach Quelle, Medium und Kampagne.

`vayquo_unit_economics`: private Sicht für Spend, Leads, valide Leads, Umsatz, CPL, Kosten pro validem Lead, Deckungsbeitrag vor operativen Kosten und Revenue/Spend-Ratio.

Das ist die Skalierungsregel: Nicht Traffic maximieren, sondern positiven Deckungsbeitrag pro Akquise-Euro.

## Aktueller Beweisstand

Noch keine echten Projektanfragen, keine aktiven Partner und kein Umsatz im System. Das ist keine Schwäche, die mit mehr Features versteckt werden soll, sondern der nächste zu beweisende Schritt.

## Umsatzbeweis

Aktuell zählt nur:
1. echter Partner sagt Preis/Kriterien verbindlich zu,
2. echter Lead passt,
3. Lead wird mit Einwilligung geliefert,
4. Zahlung wird in `revenue_cents` dokumentiert,
5. tatsächliche Akquisekosten werden zugeordnet,
6. erst dann profitable Quellen/Regionen skalieren.

Keine Millionenbehauptung. Ziel ist ein wiederholbarer positiver Deckungsbeitrag pro Lead; daraus kann erst ein großes Unternehmen entstehen.
