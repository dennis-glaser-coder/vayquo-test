# BACKLOG

## P0 – jetzt
- [x] Sichere Arbeitsbranch `spielmatch-bootstrap` erstellen
- [x] Projektbrief anlegen
- [x] Isolierte SPIELMATCH-MVP-Oberfläche erstellen (`spielmatch-mvp/`), ohne VAYQUO `main` anzufassen
- [x] Datenmodell für Märkte, Anbieter, Spiele, Lizenzen, Offers und Zahlarten definieren
- [ ] 10 priorisierte DE-Partner nur mit Primärquellenstatus erfassen
  - [x] NOVOLINE Primärquelle erneut verifiziert: GGL-lizenziertes Angebot; eigenes/Tradedoubler-Partnerprogramm; öffentlich bis 75 EUR CPA; Registrierung + erste Einzahlung als Qualifikation; bis 30 Tage Cookie (03.09.2026)
  - [x] Jokerstar Primärquellenstatus aktualisiert: GGL-Whitelist `jokerstar.de` / Jokerstar GmbH verifiziert; Affiliate-AGB 75 EUR pro definierter Aktion, Cookie i. d. R. 30 Tage, Medium-Freigabe erforderlich; `legal_review_status = pending` (04.09.2026)
  - [x] JackpotPiraten Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 + Betreiber DGGS; eigenes Partnerprogramm bestätigt CPA-Modell, Tracking/Statistiken und Publisher-Programm; öffentlich keine konkrete CPA-Höhe/Cookie-Dauer belegt, daher keine Zahl erfunden und `legal_review_status = pending` (04.09.2026)
  - [x] bet-at-home Primärquellenstatus aktualisiert: GGL-Whitelist Stand 14.08.2026 führt `bet-at-home.de` für virtuelle Automatenspiele (Bet-at-home.com Internet Limited); eigenes Affiliate-Programm nennt DE-Willkommens-CPA 120 EUR/6 Monate, 75 EUR/12 Monate bzw. 50 EUR sowie Revenue-Share-Modelle; konkrete SPIELMATCH-Medienfreigabe fehlt, daher `legal_review_status = pending` (04.09.2026)
  - [x] BingBong Primärquellenstatus aktualisiert: Betreiber DGGS; eigenes Partnerprogramm + DGGS-Inhouse-Netzwerk verifiziert; öffentlich mindestens 50 EUR und bis zu 75 EUR CPA pro Ersteinzahler, 30 Tage Tracking; konkrete Partnerkonditionen individuell und SPIELMATCH-Medienfreigabe fehlt, daher `legal_review_status = pending` (04.09.2026)
  - [x] SlotMagie Primärquellenstatus aktualisiert: aktuelle GGL-Whitelist + aktuelle SlotMagie-Seite nennen Solis Ortus Service Limited; eigenes SolisPartner-Programm öffentlich registrierbar. Öffentliche Affiliate-AGB (Version 10/2022) erlauben für DE CPA, schließen Revenue Share für DE aus und nennen 1 EUR kumulierte Mindesteinzahlung als Real-Money-Player-Kriterium; CPA-Höhe wird individuell vereinbart. Die verlinkten AGB nennen auf der Markenliste noch The Mill Adventure Ltd. als SlotMagie-Betreiber und sind damit gegenüber der aktuellen Betreiberlage veraltet/inkonsistent; `contract_status = needs_refresh_due_operator_mismatch`, `legal_review_status = pending` (04.09.2026)
  - [ ] 4 weitere Anbieter mit Betreiber-/Lizenz-/Affiliate-Primärquelle
- [x] Deutsche Werbezeit-/Affiliate-Grundregeln technisch/konzeptionell abbilden
- [x] DE-CPA-Annahme korrigieren: nicht automatisch zulässig; konkrete Vergütung braucht dokumentierte Prüfung/Freigabe
- [x] Offer-Schema um `legal_review_status`, `approved_at`, `approval_evidence` erweitern; DB-Constraint verhindert 'approved' ohne Evidenz
- [x] Provider-Seed um marktbezogene Affiliate-Metadaten + `legal_review_status` für Jokerstar erweitern
- [x] Seed-Validator ergänzt (`validate-providers.mjs`): DE-Markt, GGL-Primärquelle, Datumsfelder und Affiliate-Aktivierungsgates werden geprüft
- [x] Seed-Validator-Test ergänzt (`validate-providers.test.mjs`): aktive Affiliate-Nutzung vor Freigabe, Approval ohne Evidenz und falscher Markt schlagen fehl; Testlauf bestanden (04.09.2026)
- [x] Öffentliche CPA-Spannen strukturiert abbilden und validieren (`public_cpa_range_eur`); BingBong 50–75 EUR als Spanne statt irreführendem Einzelwert erfasst (04.09.2026)
- [x] Vertragsaktualitäts-Gate ergänzt: Provider mit `contract_status = needs_refresh...` können nicht auf `legal_review_status = approved` gesetzt werden; SlotMagie nutzt das Gate wegen Betreiberinkonsistenz in öffentlich verlinkten SolisPartner-AGB (04.09.2026)

## P1
- [x] Finder-Fragen im UI auf minimale Reibung reduzieren (erste MVP-Fassung)
- [x] Match-Score transparent definieren (`MATCHING.md`): Nutzerkriterien + Datenvertrauen, keine Affiliate-Vergütung
- [x] Match-Score v1 im MVP sichtbar berechnen und pro Ergebnis erklären
- [x] Spielsuche mit Autocomplete (MVP: 15 Titel, Prefix/Substring/Wortanfang, Tastatursteuerung, max. 8 Vorschläge)
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
