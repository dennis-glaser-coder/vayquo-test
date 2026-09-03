# BACKLOG

## P0 – jetzt
- [x] Sichere Arbeitsbranch `spielmatch-bootstrap` erstellen
- [x] Projektbrief anlegen
- [x] Isolierte SPIELMATCH-MVP-Oberfläche erstellen (`spielmatch-mvp/`), ohne VAYQUO `main` anzufassen
- [x] Datenmodell für Märkte, Anbieter, Spiele, Lizenzen, Offers und Zahlarten definieren
- [ ] 10 priorisierte DE-Partner nur mit Primärquellenstatus erfassen
  - [x] NOVOLINE Primärquelle erneut verifiziert: GGL-lizenziertes Angebot; eigenes/Tradedoubler-Partnerprogramm; öffentlich bis 75 EUR CPA; Registrierung + erste Einzahlung als Qualifikation; bis 30 Tage Cookie (03.09.2026)
  - [ ] 9 weitere Anbieter mit Betreiber-/Lizenz-/Affiliate-Primärquelle
- [x] Deutsche Werbezeit-/Affiliate-Grundregeln technisch/konzeptionell abbilden
- [x] DE-CPA-Annahme korrigieren: nicht automatisch zulässig; konkrete Vergütung braucht dokumentierte Prüfung/Freigabe
- [x] Offer-Schema um `legal_review_status`, `approved_at`, `approval_evidence` erweitern; DB-Constraint verhindert 'approved' ohne Evidenz

## P1
- [x] Finder-Fragen im UI auf minimale Reibung reduzieren (erste MVP-Fassung)
- [x] Match-Score transparent definieren (`MATCHING.md`): Nutzerkriterien + Datenvertrauen, keine Affiliate-Vergütung
- [x] Match-Score v1 im MVP sichtbar berechnen und pro Ergebnis erklären
- [ ] Spielsuche mit Autocomplete
- [x] Ergebnisansicht mit 3 Demo-Matches
- [ ] Echte Ergebnisse erst nach verifizierter Datenbasis aktivieren
- [ ] SEO-URL-Struktur inkl. DE-Terminologie-Regeln
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
