# BACKLOG

## P0 – jetzt
- [x] Sichere Arbeitsbranch `spielmatch-bootstrap` erstellen
- [x] Projektbrief anlegen
- [x] Isolierte SPIELMATCH-MVP-Oberfläche erstellen (`spielmatch-mvp/`), ohne VAYQUO `main` anzufassen
- [x] Datenmodell für Märkte, Anbieter, Spiele, Lizenzen, Offers und Zahlarten definieren
- [x] 10 priorisierte DE-Partner nur mit Primärquellenstatus erfassen
- [x] Deutsche Werbezeit-/Affiliate-Grundregeln technisch/konzeptionell abbilden
- [x] DE-CPA-Annahme korrigieren: nicht automatisch zulässig; konkrete Vergütung braucht dokumentierte Prüfung/Freigabe
- [x] Offer-Schema um `legal_review_status`, `approved_at`, `approval_evidence` erweitern; DB-Constraint verhindert 'approved' ohne Evidenz
- [x] Seed-Validator ergänzt (`validate-providers.mjs`) und getestet
- [x] Affiliate-Status-/Vertragsaktualitäts-Gates ergänzt und getestet
- [x] Produkt-/Markttrennung für DE-virtuelle Automatenspiele gegenüber Sportwetten und Schleswig-Holstein-Online-Casino-Kontext festgeschrieben

## P1
- [x] Finder-Fragen im UI auf minimale Reibung reduzieren (erste MVP-Fassung)
- [x] Match-Score transparent definieren (`MATCHING.md`): Nutzerkriterien + Datenvertrauen, keine Affiliate-Vergütung
- [x] Match-Score v1 im MVP sichtbar berechnen und pro Ergebnis erklären
- [x] Spielsuche mit Autocomplete (MVP: 15 Titel, Prefix/Substring/Wortanfang, Tastatursteuerung, max. 8 Vorschläge)
- [ ] Verifizierte Spiel→Anbieter-Datenbasis aufbauen (aktueller Schwerpunkt)
  - [x] Phase 1: `games.seed.json` mit vier über Betreiber-Spielseiten belegten DE-Beziehungen (NOVOLINE: Book of Dead, Ramses Book Deluxe; DrückGlück: Big Bass Bonanza, Big Bass Splash) (04.09.2026)
  - [x] Verification-Gate `validate-games.mjs` + Negativtests für pending, falschen Markt, schwache Evidenz und Duplikate; Testlauf bestanden (04.09.2026)
  - [x] Phase 2a: SlotMagie um vier direkt über aktuelle Betreiber-Spielseiten belegte DE-Beziehungen erweitert: Book of Dead, Big Bass Bonanza, Sweet Bonanza, Gates of Olympus 1000. Damit enthält der Seed 8 verifizierte DE-Spiel/Anbieter-Beziehungen (04.09.2026)
  - [ ] Phase 2b: weitere wichtige Autocomplete-Titel gegen mehrere priorisierte DE-Anbieter verifizieren; exakte Spielvarianten getrennt halten (z. B. Gates of Olympus != Gates of Olympus 1000)
- [ ] Autocomplete auf verifizierte Spiele-Datenbank statt Demo-Titel umstellen
- [x] Ergebnisansicht mit 3 Demo-Matches
- [ ] Echte Ergebnisse erst nach verifizierter Datenbasis aktivieren
- [x] SEO-URL-Struktur inkl. DE-Terminologie- und Verifikationsregeln in `SEO.md` definieren
- [x] SEO-Spieltemplate technisch vorbereiten (`spielmatch-mvp/seo/render-page.mjs`): Index nur bei verifiziertem DE-Anbieterstatus + verifizierter Spiel→Anbieter-Verfügbarkeit; sonst `noindex,follow`
- [x] SEO-Gate automatisiert testen (`render-page.test.mjs`)
- [x] Anbieter-SEO-Template mit identischem Verification-Gate ergänzt und getestet
- [ ] Funnel-Events
- [ ] 18+/Spielerschutz-/Hilfebereich für Live-Konzept definieren

## P2
- [ ] Eigenes Supabase-Projekt nach Freigabe anlegen
- [ ] Admin-Datenpflege
- [ ] Internationales GEO-Modell
- [ ] Partner-/Affiliate-CRM
- [ ] A/B-Test-Framework

## Arbeitsregel
Wenn ein Schritt reversibel, kostenlos und innerhalb dieser Branch ist, ohne Rückfrage weiterarbeiten. Bei Kosten, Verträgen, externem Versand oder rechtlich wesentlichen Freigaben stoppen und gezielt fragen.
