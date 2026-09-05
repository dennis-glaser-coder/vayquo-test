# D-039 – Lucky Lady's Charm Deluxe: verifizierte DE-Coverage

Datum: 05.09.2026

## Entscheidung
Lucky Lady's Charm Deluxe wird als eigener exakter Spieltitel in den DE-`virtual_slots`-Seed aufgenommen.

## Evidenz
Am 05.09.2026 wurden drei exakte Betreiber-Spielseiten geprüft:

- SlotMagie: `https://www.slotmagie.de/slots/novomatic/lucky-ladys-charm-deluxe`
- BingBong: `https://www.bingbong.de/slots/lucky-ladys-charm-deluxe`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/lucky-ladys-charm-deluxe`

Alle drei Beziehungen werden ausschließlich für Markt `DE`, Produkt `virtual_slots`, Status `verified` und Evidenztyp `operator_game_page` geführt.

## Variantenregel
`Lucky Lady's Charm Deluxe 6`, `Lucky Lady's Charm Deluxe 10` und `Lucky Lady's Charm Deluxe Bonus Spins` sind eigenständige Varianten und werden nicht mit dem Basistitel zusammengeführt.

## Auswirkung
Der Seed steigt von 44 auf 47 verifizierte Beziehungen, von 15 auf 16 exakte Spiele und von 14 auf 15 match-ready Spiele. Ramses Book Deluxe bleibt als einziges Spiel unter dem Drei-Anbieter-Gate.

## Testregel
`coverage-priority.test.mjs` prüft die drei Anbieter, Match-Readiness und die Trennung von `Lucky Lady's Charm Deluxe 6`.
