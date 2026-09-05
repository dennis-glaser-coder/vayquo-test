# BACKLOG

## P0 – jetzt
- [x] Sichere Arbeitsbranch `spielmatch-bootstrap` erstellen
- [x] Projektbrief anlegen
- [x] Isolierte SPIELMATCH-MVP-Oberfläche erstellen (`spielmatch-mvp/`), ohne VAYQUO `main` anzufassen
- [x] Datenmodell für Märkte, Anbieter, Spiele, Lizenzen, Offers und Zahlarten definieren
- [x] 10 priorisierte DE-Partner nur mit Primärquellenstatus erfassen; Detailstände bleiben in `AFFILIATES.md`, Research-Fixtures und Git-Historie dokumentiert
- [x] Deutsche Werbezeit-/Affiliate-Grundregeln technisch/konzeptionell abbilden
- [x] DE-CPA-Annahme korrigieren: nicht automatisch zulässig; konkrete Vergütung braucht dokumentierte Prüfung/Freigabe
- [x] Offer-Schema um `legal_review_status`, `approved_at`, `approval_evidence` erweitern; DB-Constraint verhindert `approved` ohne Evidenz
- [x] Provider-Seed um marktbezogene Affiliate-Metadaten erweitern
- [x] Provider-Validator + Negativtests für Markt-, Rechts-, Vertrags- und Affiliate-Aktivierungsgates ergänzen
- [x] Öffentliche CPA-Spannen/-Staffeln strukturiert statt als erfundener Einzelwert abbilden
- [x] Vertragsaktualitäts- und Partnerverfügbarkeits-Gates ergänzen
- [x] Produkt-/Markttrennung für Anbieter-Research explizit machen
- [x] **Provider-Game-Datenbankschema markt- und produktspezifisch härten**: `market_code`, `product_type`, `evidence_type`, sichere `pending`-Voreinstellung, verifizierte Evidenz-/Datums-Constraints und DE-`virtual_slots`-RLS mit aktivem GGL-Provider; Regressionstest `schema-gates.test.mjs` ergänzt (04.09.2026)

## P1
- [x] Finder-Fragen im UI auf minimale Reibung reduzieren
- [x] Match-Score transparent definieren (`MATCHING.md`): Nutzerkriterien + Datenvertrauen, keine Affiliate-Vergütung
- [x] Match-Score v1 im MVP sichtbar berechnen und pro Ergebnis erklären
- [x] Spielsuche mit Autocomplete auf verifizierten Spielkatalog umstellen
- [ ] Verifizierte Spiel→Anbieter-Datenbasis weiter ausbauen
  - [x] Phase 1: erstes `games.seed.json` mit Betreiber-Spielseiten-Evidenz
  - [x] Verification-Gate `validate-games.mjs` + Negativtests
  - [x] Phase 2a/2b.1: verifizierte DE-Beziehungen u. a. für Book of Dead, Ramses Book Deluxe, Big Bass Bonanza, Big Bass Splash, Sweet Bonanza, Gates of Olympus 1000, Book of Ra und Book of Ra Deluxe; exakte Varianten bleiben getrennt
  - [x] Phase 2b.2a: erste echte Mehranbieter-Überschneidungen hergestellt: Book of Dead, Big Bass Bonanza und Big Bass Splash bei je mindestens 3 priorisierten DE-Anbietern (05.09.2026)
  - [x] Phase 2b.2b: weitere Kernspiele über das 3-Anbieter-Gate gebracht: Book of Ra jetzt bei 4 verifizierten DE-Anbietern (SlotMagie, NOVOLINE, BingBong, JackpotPiraten), Book of Ra Deluxe bei 3 (SlotMagie, BingBong, JackpotPiraten). Seed 19 verifizierte Beziehungen (05.09.2026)
  - [x] Phase 2b.2c: Gates of Olympus 1000 über das 3-Anbieter-Gate gebracht (SlotMagie, BingBong, JackpotPiraten); Sweet Bonanza auf 2 verifizierte Anbieter erweitert (SlotMagie, BingBong). Seed 22 verifizierte Beziehungen (05.09.2026)
  - [x] Phase 2b.2d: Sweet Bonanza über das 3-Anbieter-Gate gebracht (SlotMagie, BingBong, JackpotPiraten); Seed 23 verifizierte Beziehungen. JackpotPiraten-Betreiberseite am 05.09.2026 aktuell geprüft.
  - [ ] Phase 2b.2e: nächsten starken Suchintent anhand echter Betreiberüberschneidung priorisieren und auf mindestens 3 verifizierte DE-Anbieter bringen
  - [x] Phase 2c: verifizierten UI-Katalog technisch vorbereiten (`verified-games.mjs`) und testen
- [x] Autocomplete lädt `backend/games.seed.json` und akzeptiert nur exakt verifizierte DE-Slot-Titel
- [x] Ergebnisansicht mit 3 klar als Demo behandelten Matches
- [x] **Echte Match-Ergebnislogik als isoliertes Modul bauen**: `match-results.mjs` filtert strikt DE + `virtual_slots` + aktuelle Betreiber-Evidenz, verlangt ≥3 verifizierte Anbieter und berechnet den erklärbaren Score ohne Affiliate-Vergütung; Clickouts bleiben technisch deaktiviert (05.09.2026)
- [x] **Echte Matchkarten im UI an `match-results.mjs` anbinden**: `status = ready` rendert reale verifizierte Anbieter; darunter neutraler Coverage-Hinweis, bei Ladefehlern keine Demo-Ersatzdaten; konkrete Zahlungsart-Auswahl, 5-EUR-Einzahlungsgrenze transparent benannt; Clickouts deaktiviert; Regressionstest `match-ui.test.mjs` ergänzt (05.09.2026)
- [x] SEO-URL-Struktur inkl. DE-Terminologie- und Verifikationsregeln definieren
- [x] SEO-Spieltemplate mit Index-Gate vorbereiten und testen
- [x] Anbieter-SEO-Template mit identischem Verification-Gate vorbereiten und testen
- [ ] Funnel-Events
  - [x] Privacy-sicheren Event-Core mit fester Event-/Payload-Allowlist bauen; keine Netzwerkübertragung, keine Rohsuche/PII; Regressionstest `funnel-events.test.mjs` ergänzt (05.09.2026)
  - [x] Event-Core in Finder-/Match-UI verdrahten: Katalogstatus, verifizierte Spielauswahl, Filter, Match-Anfrage, Ready/Coverage/Data-Error; weiterhin ohne externen Sink; Regressionstest `funnel-ui.test.mjs` ergänzt (05.09.2026)
  - [ ] Externen Analytics-Sink erst nach separater Datenschutz-/Consent-Prüfung auswählen und aktivieren
- [x] 18+/Spielerschutz-/Hilfebereich für Live-Konzept definieren
  - [x] Unabhängige DE-Hilfeseite mit 18+, BIÖG/Check-dein-Spiel-Hilfe, Sperrhinweis und GGL-Link erstellen; ohne Ranking, Conversion-CTA, Tracking oder Affiliate-Links; Regressionstest ergänzt (05.09.2026)
  - [x] Hilfeseite dauerhaft sichtbar aus Finder/Footer verlinken; eigener Regressionstest `spielerschutz-link.test.mjs` (05.09.2026)
  - [ ] Konkrete Live-Oberfläche vor Veröffentlichung rechtlich gesamthaft prüfen/freigeben

## P2
- [ ] Eigenes Supabase-Projekt nach Freigabe anlegen
- [ ] Admin-Datenpflege
- [ ] Internationales GEO-Modell: Policies nicht hart auf DE lassen, sondern nach separat freigegebenem Markt konfigurieren
- [ ] Partner-/Affiliate-CRM
- [ ] A/B-Test-Framework

## Dokumentierte Entscheidungen
- D-001 bis D-024: `DECISIONS.md`
- D-021: `docs/021-market-product-availability-gate.md`
- D-025: `docs/025-real-match-ui-binding.md`
- D-026: `docs/026-privacy-safe-funnel-events.md`
- D-027: `docs/027-local-funnel-ui-wiring.md`
- D-028: `docs/028-responsible-gambling-help-surface.md`

## Arbeitsregel
Wenn ein Schritt reversibel, kostenlos und innerhalb dieser Branch ist, ohne Rückfrage weiterarbeiten. Bei Kosten, Verträgen, externem Versand, Live-Migrationen oder rechtlich wesentlichen Freigaben stoppen und gezielt fragen.
