# D-045 – Fruit Party 2 als eigener DE-Kernintent

**Datum:** 06.09.2026

## Entscheidung
`Fruit Party 2` wird als eigener Spieltitel für `DE / virtual_slots` für die nächste Seed-Ingestion freigegeben. `Fruit Party` und `Fruit Party 2` dürfen weder im Katalog noch im Matching zusammengeführt werden.

## Evidenz-Gate
Drei unterschiedliche exakte Betreiber-Spielseiten wurden am 06.09.2026 geprüft:

- SlotMagie: `https://www.slotmagie.de/slots/pragmatic-play/fruit-party-2`
- BingBong: `https://www.bingbong.de/slots/fruit-party-2`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/fruit-party-2`

Alle drei Beziehungen werden ausschließlich als `operator_game_page` für `market=DE` und `product=virtual_slots` behandelt.

## Marktstatus
Die GGL-Whitelist mit Aktualisierungsstand 04.09.2026 führt die für diese Evidenz verwendeten Domains im deutschen Markt für virtuelle Automatenspiele. Betreibertexte ersetzen die amtliche Marktprüfung nicht.

## Variantentrennung
`Fruit Party` bleibt ein eigenständiger Datensatz. Ein Treffer auf `Fruit Party 2` darf nicht durch Evidenz für `Fruit Party` erfüllt werden und umgekehrt.

## Umsetzung in diesem Schritt
- Research-Fixture `fruit-party-2.de.virtual-slots.2026-09-06.json` angelegt.
- Regressionstest `fruit-party-2-research.test.mjs` ergänzt.
- Produktiver Seed bleibt bis zur separaten Ingestion unverändert bei 50 Beziehungen / 17 Spielen / 16 match-ready / 1 unter Gate.

## Nächster Schritt
Die drei verifizierten Beziehungen in `games.seed.json` ingestieren und Coverage-/Current-Seed-Tests auf 53 Beziehungen / 18 Spiele / 17 match-ready / 1 unter Gate anheben.
