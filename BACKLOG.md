# BACKLOG

## P0 – jetzt
- [x] Sichere Arbeitsbranch `spielmatch-bootstrap` erstellen
- [x] Projektbrief anlegen
- [x] Isolierte SPIELMATCH-MVP-Oberfläche erstellen (`spielmatch-mvp/`), ohne VAYQUO `main` anzufassen
- [x] Datenmodell für Märkte, Anbieter, Spiele, Lizenzen, Offers und Zahlarten definieren
- [x] 10 priorisierte DE-Partner nur mit Primärquellenstatus erfassen
  - [x] NOVOLINE Primärquelle erneut verifiziert: GGL-lizenziertes Angebot; eigenes/Tradedoubler-Partnerprogramm; öffentlich bis 75 EUR CPA; Registrierung + erste Einzahlung als Qualifikation; bis 30 Tage Cookie (03.09.2026)
  - [x] Jokerstar Primärquellenstatus aktualisiert: GGL-Whitelist `jokerstar.de` / Jokerstar GmbH verifiziert; Affiliate-AGB 75 EUR pro definierter Aktion, Cookie i. d. R. 30 Tage, Medium-Freigabe erforderlich; `legal_review_status = pending` (04.09.2026)
  - [x] JackpotPiraten Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 + Betreiber DGGS; eigenes Partnerprogramm bestätigt CPA-Modell, Tracking/Statistiken und Publisher-Programm; öffentlich keine konkrete CPA-Höhe/Cookie-Dauer belegt, daher keine Zahl erfunden und `legal_review_status = pending` (04.09.2026)
  - [x] bet-at-home Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 führt `bet-at-home.de` für virtuelle Automatenspiele (Bet-at-home.com Internet Limited); eigenes Affiliate-Programm nennt DE-Willkommens-CPA 120 EUR/6 Monate, 75 EUR/12 Monate bzw. 50 EUR sowie Revenue-Share-Modelle; konkrete SPIELMATCH-Medienfreigabe fehlt, daher `legal_review_status = pending` (04.09.2026)
  - [x] BingBong Primärquellenstatus aktualisiert: Betreiber DGGS; eigenes Partnerprogramm + DGGS-Inhouse-Netzwerk verifiziert; öffentlich mindestens 50 EUR und bis zu 75 EUR CPA pro Ersteinzahler, 30 Tage Tracking; konkrete Partnerkonditionen individuell und SPIELMATCH-Medienfreigabe fehlt, daher `legal_review_status = pending` (04.09.2026)
  - [x] SlotMagie Primärquellenstatus aktualisiert: aktuelle GGL-Whitelist + aktuelle SlotMagie-Seite nennen Solis Ortus Service Limited; eigenes SolisPartner-Programm öffentlich registrierbar. Öffentliche Affiliate-AGB (Version 10/2022) erlauben für DE CPA, schließen Revenue Share für DE aus und nennen 1 EUR kumulierte Mindesteinzahlung als Real-Money-Player-Kriterium; CPA-Höhe wird individuell vereinbart. Die verlinkten AGB nennen auf der Markenliste noch The Mill Adventure Ltd. als SlotMagie-Betreiber und sind damit gegenüber der aktuellen Betreiberlage veraltet/inkonsistent; `contract_status = needs_refresh_due_operator_mismatch`, `legal_review_status = pending` (04.09.2026)
  - [x] Tipico Games Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 führt `games.tipico.de` als länderübergreifend erlaubtes virtuelles Automatenspiel-Angebot. Tipico Affiliates meldet aktuell ausdrücklich, dass das Affiliate-Programm bis auf Weiteres ausgesetzt ist und keine Neuregistrierungen möglich sind; `acquisition_status = registrations_suspended`, `active = false`, Affiliate-Primärquelle und AGB sind jetzt direkt im Provider-Seed gespeichert (04.09.2026)
  - [x] MERKUR SLOTS Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 führt `merkurslots.de` und `merkurbets.de` unter Merkur Bets Malta Limited für virtuelle Automatenspiele länderübergreifend. MERKUR PARTNERS wirbt aktuell öffentlich um Affiliates und nennt MERKUR SLOTS Deutschland ausdrücklich sowie CPA- und Hybrid-Deals; kein aktueller fixer CPA oder Cookie-Zeitraum auf den Primärseiten belegt. Research-Fixture mit strikt getrenntem Produkt-/Marktstatus angelegt, `active = false`, `legal_review_status = pending` (04.09.2026)
  - [x] DrückGlück Primärquellenstatus aktualisiert: `drueckglueck.de` nennt Skill On Net Limited als Betreiber, bundesweite GGL-Erlaubnis für virtuelle Automatenspiele seit 29.12.2022 und verlinkt Affiliates. Das aktuelle EGO-Programm wirbt öffentlich um Affiliate-Partner und nennt DrückGlück als deutsche Marke; kein aktueller DE-spezifischer CPA oder Cookie-Zeitraum aus Primärquellen belegt. DE-Research-Fixture angelegt, `acquisition_status = open`, `active = false`, `legal_review_status = pending` (04.09.2026)
  - [x] Löwen Play Online Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 führt Löwen Play digital GmbH mit `loewen-play.de` für länderübergreifende virtuelle Automatenspiele; Erst-Erlaubnis 15.12.2022. Eigenes Affiliate-Programm nimmt Bewerbungen via NetRefer an und nennt CPA pro vermitteltem Kunden mit Einzahlung; aktuelle öffentliche CPA-Höhe und Cookie-Dauer sind nicht belegt. DE-Research-Fixture angelegt, `acquisition_status = open`, `active = false`, `legal_review_status = pending` (04.09.2026)
- [x] Deutsche Werbezeit-/Affiliate-Grundregeln technisch/konzeptionell abbilden
- [x] DE-CPA-Annahme korrigieren: nicht automatisch zulässig; konkrete Vergütung braucht dokumentierte Prüfung/Freigabe
- [x] Offer-Schema um `legal_review_status`, `approved_at`, `approval_evidence` erweitern; DB-Constraint verhindert 'approved' ohne Evidenz
- [x] Provider-Seed um marktbezogene Affiliate-Metadaten + `legal_review_status` für Jokerstar erweitern
- [x] Seed-Validator ergänzt (`validate-providers.mjs`): DE-Markt, GGL-Primärquelle, Datumsfelder und Affiliate-Aktivierungsgates werden geprüft
- [x] Seed-Validator-Test ergänzt (`validate-providers.test.mjs`): aktive Affiliate-Nutzung vor Freigabe, Approval ohne Evidenz und falscher Markt schlagen fehl; Testlauf bestanden (04.09.2026)
- [x] Öffentliche CPA-Spannen strukturiert abbilden und validieren (`public_cpa_range_eur`); BingBong 50–75 EUR als Spanne statt irreführendem Einzelwert erfasst (04.09.2026)
- [x] Vertragsaktualitäts-Gate ergänzt: Provider mit `contract_status = needs_refresh...` können nicht auf `legal_review_status = approved` gesetzt werden; SlotMagie nutzt das Gate wegen Betreiberinkonsistenz in öffentlich verlinkten SolisPartner-AGB (04.09.2026)
- [x] Affiliate-Status-Gate ergänzt: Live-Eligibility verlangt DE + `active = true` + `legal_review_status = approved` + Approval-Evidenz + `acquisition_status = open` + aktuellen Vertrag. `registrations_suspended`/`closed`/`invite_only`/`unknown` sind nicht live-fähig; Positiv-/Negativtests ergänzt und Gate-Logik lokal ausgeführt (04.09.2026)
- [x] Tipico-Games-Seed um `acquisition_status = registrations_suspended`, `active = false` und Affiliate-Primärquelle ergänzt; Gate-Check bestätigt `eligible = false` (04.09.2026)
- [x] Produkt-/Markttrennung für MERKUR research-seitig explizit gemacht: virtuelle Automatenspiele DE werden nicht mit MERKUR BETS Sportwetten oder der Schleswig-Holstein-Online-Casino-Erlaubnis vermischt; `licensed_domains` hält mehrere GGL-Domains derselben DE-Slot-Vertikale fest (04.09.2026)
- [x] DrückGlück als separates DE-Research-Fixture angelegt; Schleswig-Holstein-Online-Casino-Kontext wird nicht in den bundesweiten `virtual_slots`-Status eingemischt (04.09.2026)

## P1
- [x] Finder-Fragen im UI auf minimale Reibung reduzieren (erste MVP-Fassung)
- [x] Match-Score transparent definieren (`MATCHING.md`): Nutzerkriterien + Datenvertrauen, keine Affiliate-Vergütung
- [x] Match-Score v1 im MVP sichtbar berechnen und pro Ergebnis erklären
- [x] Spielsuche mit Autocomplete (MVP: 15 Titel, Prefix/Substring/Wortanfang, Tastatursteuerung, max. 8 Vorschläge)
- [ ] Verifizierte Spiel→Anbieter-Datenbasis aufbauen (nächster P0/P1-Schwerpunkt)
  - [x] Phase 1: separates `games.seed.json` mit vier aktuell über Betreiber-Spielseiten belegten DE-Beziehungen (NOVOLINE: Book of Dead, Ramses Book Deluxe; DrückGlück: Big Bass Bonanza, Big Bass Splash) angelegt (04.09.2026)
  - [x] Verification-Gate `validate-games.mjs` + Negativtests für pending, falschen Markt, schwache Evidenz und Duplikate ergänzt; Testlauf bestanden (04.09.2026)
  - [ ] Phase 2: Abdeckung der wichtigsten Such-/Autocomplete-Titel auf mehrere der priorisierten DE-Anbieter erweitern
- [ ] Autocomplete auf verifizierte Spiele-Datenbank statt Demo-Titel umstellen
- [x] Ergebnisansicht mit 3 Demo-Matches
- [ ] Echte Ergebnisse erst nach verifizierter Datenbasis aktivieren
- [x] SEO-URL-Struktur inkl. DE-Terminologie- und Verifikationsregeln in `SEO.md` definieren
- [x] SEO-Spieltemplate technisch vorbereiten (`spielmatch-mvp/seo/render-page.mjs`): Index nur bei verifiziertem DE-Anbieterstatus + verifizierter Spiel→Anbieter-Verfügbarkeit; sonst `noindex,follow` und neutrale Claims
- [x] SEO-Gate automatisiert testen (`render-page.test.mjs`): verified/pending/falscher Markt/fehlende Pflichtfelder; Testlauf bestanden (03.09.2026)
- [x] Anbieter-SEO-Template mit identischem Verification-Gate ergänzt (`render-provider-page.mjs`): DE-Markt + verifizierter Anbieterstatus + verifizierter Lizenzbeleg mit Primärquellen-URL + vollständig verifizierte Spielverfügbarkeit; sonst `noindex,follow`
- [x] Anbieter-SEO-Gate getestet: verified/pending license/falscher Markt/fehlende Evidenz/pending game; Logiktest bestanden (03.09.2026)
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
