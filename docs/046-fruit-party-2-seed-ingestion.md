# D-046 – Fruit Party 2 produktiv in den DE-Seed ingestieren

**Datum:** 06.09.2026

## Entscheidung
`Fruit Party 2` wird als eigenständiger Titel mit genau drei verifizierten Beziehungen in den produktiven DE-`virtual_slots`-Seed aufgenommen: `slotmagie`, `bingbong`, `jackpotpiraten`.

## Evidenz
- SlotMagie: exakte Betreiber-Spielseite `https://www.slotmagie.de/slots/pragmatic-play/fruit-party-2`
- BingBong: exakte Betreiber-Spielseite `https://www.bingbong.de/slots/fruit-party-2`
- JackpotPiraten: exakte Betreiber-Spielseite `https://www.jackpotpiraten.de/slots/fruit-party-2`
- GGL-Whitelist, geprüft 06.09.2026: `slotmagie.de`, `bingbong.de` und `jackpotpiraten.de` sind unter `Virtuelle Automatenspiele` für den deutschen Markt geführt.

## Produkt- und Variantengate
`Fruit Party` und `Fruit Party 2` bleiben unterschiedliche `game_slug`-Werte. Keine Alias-Zusammenführung und keine Übernahme von Evidenz zwischen den Varianten.

## Auswirkung
Der Sollstand steigt von 50 auf 53 verifizierte Beziehungen, von 17 auf 18 Spiele und von 16 auf 17 match-ready Spiele. `Ramses Book Deluxe` bleibt als einziges Spiel unter dem Drei-Anbieter-Gate.

## Tests
`coverage-priority.test.mjs` und `current-seed.test.mjs` wurden auf 53 / 18 / 17 / 1 sowie die explizite Variantentrennung aktualisiert. Der vollständige lokale Node-Lauf konnte in dieser Ausführung wegen nicht auflösbarem `github.com` beim Clone nicht durchgeführt werden; die Änderungen selbst wurden direkt auf dem isolierten Branch vorgenommen.
