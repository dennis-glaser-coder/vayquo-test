# D-035 – Legacy of Dead als match-ready DE-Kernspiel

Datum: 05.09.2026

## Entscheidung
`Legacy of Dead` wird als exakte Spielvariante in den verifizierten DE-`virtual_slots`-Seed aufgenommen.

## Verifizierte Betreiberbelege
- NOVOLINE: `https://www.novoline.de/de/slots/legacy-of-dead`
- BingBong: `https://www.bingbong.de/slots/legacy-of-dead`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/legacy-of-dead`

Alle drei Seiten wurden am 05.09.2026 als aktuelle Betreiber-Spielseiten geprüft. Die GGL-Whitelist (Stand 14.08.2026) führt `novoline.de`, `bingbong.de` und `jackpotpiraten.de` für den deutschen Markt unter `Virtuelle Automatenspiele`.

## Produktregel
Andere Titel oder Nachfolger mit ähnlicher Benennung werden nicht als dieselbe Variante gezählt. Für Match-Coverage zählt ausschließlich der exakte Slug `legacy-of-dead`.

## Auswirkung
- Seed: 41 verifizierte DE-Spiel→Anbieter-Beziehungen
- Exakte Spiele: 14
- Match-ready (≥3 Anbieter): 13
- Unter Gate: 1 (`Ramses Book Deluxe`)

## Test
`coverage-priority.test.mjs` erwartet Legacy of Dead bei exakt drei verifizierten Providern und stellt weiterhin sicher, dass Fremdmärkte, andere Produkte und `pending`-Datensätze die DE-Coverage nicht erhöhen.
