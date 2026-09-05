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
- Match-ready bei Gate ≥3 Anbieter: 10
- Unter Gate: 1 (`Ramses Book Deluxe`)

## Korrektur eines Altstands
Der vorherige Coverage-Test erwartete für den 29er-Seed 8 match-ready / 2 unter Gate. Ein deterministischer Gegencheck der vorhandenen Records zeigt jedoch 9 / 1. Die Regressionserwartungen wurden deshalb zusammen mit Wolf Gold auf 10 / 1 korrigiert.

## Schutzregeln
- Keine Vermischung mit ähnlich benannten Wolf-Gold-Varianten.
- Fremdmärkte oder andere Glücksspielprodukte zählen nicht in die Coverage.
- Affiliate-Vergütung beeinflusst weder Aufnahme noch Ranking.
- Betreiberverfügbarkeit ist zeitabhängig und muss über `verified_as_of` erneut prüfbar bleiben.

## Tests
`coverage-priority.test.mjs` enthält einen expliziten Wolf-Gold-Test auf exakt drei alphabetisch deterministische Provider sowie das bestehende Fremdmarkt-/Produkt-/Pending-Poisoning-Gate. Der lokale GitHub-Clone war in dieser Laufzeitumgebung wegen DNS-Auflösung nicht ausführbar; die Summen wurden separat deterministisch aus den 32 Seed-Beziehungen gegengeprüft.
