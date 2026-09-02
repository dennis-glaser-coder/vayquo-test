# VAYQUO Growth Engine

Stand: 02.09.2026

## Kernmodell

Kunde: Suchintention/Ad -> VAYQUO Nutzwert-Seite -> Projektfunnel -> Angebotsvorschau -> ausdrückliche Freigabe -> Lead.

Anbieter: Partnerseite -> Pilotinteresse -> manuelle Abstimmung von Region/Kriterien/Preis -> Aktivierung als Partner -> private Match-Kandidaten -> Lead-Auslieferung -> Umsatz.

## Kunde

USP: Einmal anfragen. Passende Angebote bekommen. Fertig.

Funnel: Projektfragen -> PLZ -> Angebotsvorschau -> Kontakt -> Einwilligung -> `vayquo_project_requests`.

SEO-Einstiege starten direkt den passenden Funnel über `?project=pv&source=...`.

## SEO Phase 1: Photovoltaik

Indexierbar:
- `/photovoltaik/`
- `/photovoltaik/kosten.html`
- `/photovoltaik/paderborn.html`

Nicht massenhaft nahezu identische Stadtseiten erzeugen. Neue lokale Seiten nur mit eigenem lokalen Nutzwert (z. B. Netzbetreiber, Solarkataster, Förderung, echte Partnerabdeckung, lokale Preis-/Marktdaten).

## Anbieter

Pilot: 49 EUR pro übermittelter PV-Anfrage, keine Grundgebühr, keine Mindestabnahme, max. 3 Empfänger. Vor erster kostenpflichtiger Weitergabe ausdrückliche Abstimmung.

Interessenten landen in `vayquo_partner_interest`.

Nach echter Zusage wird der Interessent privat in `vayquo_partners` aktiviert. Strukturierte `postcode_prefixes` und `categories` steuern das Matching.

## Privates Matching

`vayquo_lead_matches`: Kandidaten zwischen Projektanfrage und aktivem Partner.

Ein Trigger auf `vayquo_project_requests` erstellt automatisch nur Match-Kandidaten. Es werden dadurch keine Kundendaten automatisch öffentlich oder an Partner ausgeliefert.

`vayquo_lead_pipeline`: interne, nicht öffentliche Pipeline-View ohne Kontaktfelder.

`vayquo_partner_pipeline`: interne Partnerpipeline.

`vayquo_activate_partner_from_interest(...)`: private Operator-Funktion zur Aktivierung eines vereinbarten Pilotpartners und Rückwärts-Matching bereits vorhandener Leads.

## Umsatzbeweis

Aktuell zählt nur:
1. echter Partner sagt Preis/Kriterien verbindlich zu,
2. echter Lead passt,
3. Lead wird mit Einwilligung geliefert,
4. Zahlung wird in `revenue_cents` dokumentiert,
5. erst dann Paid Traffic skalieren.

Keine Millionenbehauptung. Ziel ist ein wiederholbarer positiver Deckungsbeitrag pro Lead.