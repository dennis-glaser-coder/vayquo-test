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
  - [x] Phase 2b.2a–2b.2m: Kernspiele systematisch auf echte Mehranbieter-Coverage ausgebaut; aktueller Seed 44 Beziehungen / 15 Spiele / 14 match-ready / 1 unter Gate (05.09.2026). Detailhistorie bleibt in Git/Entscheidungsdokumenten erhalten.
  - [x] Phase 2b.2n: Aktualitäts-Gate für Betreiber-Evidenz ergänzt: standardmäßig max. 30 Tage alt, keine zukünftigen/ungültigen Prüfdaten, jahresunabhängiges ISO-Datum; isolierter Node-Regressionstest bestanden. Ramses Book Deluxe bewusst nicht künstlich auf 3 Anbieter gehoben, da aktuell nur NOVOLINE + StarGames als exakte Betreiber-Spielseiten belastbar gefunden wurden; Kataloglisten zählen nicht (D-038, 05.09.2026).
  - [x] Phase 2b.2o: Lucky Lady's Charm Deluxe nach drei frischen exakten DE-`virtual_slots`-Betreiberseiten (SlotMagie, BingBong, JackpotPiraten) aufgenommen; Varianten `Deluxe 6`, `Deluxe 10` und `Bonus Spins` bleiben getrennt. Seed jetzt 47 Beziehungen / 16 Spiele / 15 match-ready / 1 unter Gate (D-039, 05.09.2026).
  - [x] Phase 2b.2p: Sweet-Bonanza-Doku/Research gegen den tatsächlichen Seed abgeglichen. Der produktive Seed enthält bereits drei exakte Beziehungen (SlotMagie, BingBong, JackpotPiraten); veraltete D-040- und Research-Aussage korrigiert. Neues Research-Coverage-Gate verhindert künftig solche stillen Widersprüche (D-040 korrigiert, 06.09.2026).
  - [x] Phase 2b.2q: `Gates of Olympus` als eigener Titel mit drei frischen exakten DE-`virtual_slots`-Betreiberseiten (SlotMagie, BingBong, JackpotPiraten) verifiziert; GGL-/Lizenzstatus gegengeprüft; Variantentrennung zu `Gates of Olympus 1000` dokumentiert; Research-Fixture + Regressionstest ergänzt (D-041, 06.09.2026).
  - [x] Phase 2b.2r: `Gates of Olympus` in `games.seed.json` und `coverage-priority.test.mjs` ingestiert; Titel und `Gates of Olympus 1000` bleiben getrennt. Coverage jetzt 50 Beziehungen / 17 Spiele / 16 match-ready / 1 unter Gate (D-042, 06.09.2026).
  - [x] Phase 2b.2s: `Wolf Gold` als nächsten Kernintent recherchiert und mit drei aktuellen exakten DE-`virtual_slots`-Betreiber-Spielseiten (SlotMagie, BingBong, JackpotPiraten) verifiziert. Amtliche GGL-Whitelist (Stand 04.09.2026) führt alle drei Domains unter `Virtuelle Automatenspiele`; Research-Fixture + Variantengate ergänzt (D-043, 06.09.2026).
  - [ ] Phase 2b.2t: `Wolf Gold` in `games.seed.json` und `coverage-priority.test.mjs` ingestieren; nur die drei verifizierten DE-Beziehungen übernehmen. Zielstand nach erfolgreicher Regression: 53 Beziehungen / 18 Spiele / 17 match-ready / 1 unter Gate. Ramses Book Deluxe weiterhin nur mit echtem drittem Exaktbeleg hochstufen.
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
- D-001 bis D-037: `DECISIONS.md` und `docs/`
- D-038: `docs/038-game-evidence-freshness-gate.md`
- D-039: `docs/039-lucky-ladys-charm-deluxe-coverage.md`
- D-040: `docs/040-sweet-bonanza-coverage-gate.md` (am 06.09.2026 gegen tatsächlichen Seed korrigiert)
- D-041: `docs/041-gates-of-olympus-coverage.md`
- D-042: `docs/042-gates-of-olympus-seed-ingestion.md`
- D-043: `docs/043-wolf-gold-coverage.md`

## Arbeitsregel
Wenn ein Schritt reversibel, kostenlos und innerhalb dieser Branch ist, ohne Rückfrage weiterarbeiten. Bei Kosten, Verträgen, externem Versand, Live-Migrationen oder rechtlich wesentlichen Freigaben stoppen und gezielt fragen.
