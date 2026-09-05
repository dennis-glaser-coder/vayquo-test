# D-032 – Wolf Gold als match-ready DE-Kernspiel

**Datum:** 2026-09-05

## Entscheidung
`Wolf Gold` wird als exakter Titel in den verifizierten DE-`virtual_slots`-Seed aufgenommen, nachdem drei Betreiber-Spielseiten am 05.09.2026 einzeln geprüft wurden:

- SlotMagie: `https://www.slotmagie.de/slots/pragmatic-play/wolf-gold`
- BingBong: `https://www.bingbong.de/slots/wolf-gold`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/wolf-gold`

Alle drei Records bleiben marktbezogen auf `DE`, produktbezogen auf `virtual_slots`, mit `evidence_type = operator_game_page` und `availability_status = verified`.

## Produktwirkung
- Seed: 32 verifizierte Spiel→Anbieter-Beziehungen
- Exakte Spiele: 11
- Match-ready bei Gate ≥3 Anbieter: 9
- Unter Gate: 2

## Schutzregeln
- Keine Vermischung mit ähnlich benannten Wolf-Gold-Varianten.
- Fremdmärkte oder andere Glücksspielprodukte zählen nicht in die Coverage.
- Affiliate-Vergütung beeinflusst weder Aufnahme noch Ranking.
- Betreiberverfügbarkeit ist zeitabhängig und muss über `verified_as_of` erneut prüfbar bleiben.

## Tests
`coverage-priority.test.mjs` wurde auf die neuen Summen aktualisiert und enthält einen expliziten Wolf-Gold-Test auf exakt drei alphabetisch deterministische Provider sowie das bestehende Fremdmarkt-/Produkt-/Pending-Poisoning-Gate.
