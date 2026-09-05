# D-034 – Fire Joker als nächster 3-Anbieter-Kernintent

Datum: 05.09.2026
Markt: DE
Produkt: `virtual_slots`

## Entscheidung

`Fire Joker` wird als eigener exakter Spiel-Slug in den verifizierten SPIELMATCH-Katalog aufgenommen. Die Aufnahme erfolgt erst nach drei separat geprüften aktuellen Betreiber-Spielseiten im selben Markt und Produkt:

- SlotMagie: `https://www.slotmagie.de/slots/playngo/fire-joker`
- BingBong: `https://www.bingbong.de/slots/fire-joker`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/fire-joker`

Alle drei Quellen führen den exakten Titel `Fire Joker`. Varianten wie `Fire Joker Freeze`, `Fire Joker 100` oder andere Joker-Titel werden nicht zusammengeführt.

## Auswirkung

Der Seed steigt von 35 auf 38 verifizierte DE-Spiel→Anbieter-Beziehungen, von 12 auf 13 exakte Spiele und von 11 auf 12 match-ready Spiele. `Ramses Book Deluxe` bleibt als einziges vorhandenes Spiel unter dem ≥3-Anbieter-Gate.

Die Änderung aktiviert keine Affiliate-Links und verändert keine Ranking- oder Rechtsfreigabe. Sie erweitert ausschließlich die verifizierte Vergleichsabdeckung.

## Test-Gate

`coverage-priority.test.mjs` erwartet jetzt 38 Beziehungen / 13 Spiele / 12 match-ready / 1 unter Gate und prüft Fire Joker explizit auf die Provider `bingbong`, `jackpotpiraten`, `slotmagie`. Fremdmärkte, falsche Produkte und `pending` bleiben ausgeschlossen.
