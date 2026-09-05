# D-041 – Gates of Olympus erfüllt das DE-Coverage-Gate

Datum: 06.09.2026

## Entscheidung
`Gates of Olympus` wird als eigener Kernintent behandelt und nicht mit `Gates of Olympus 1000` oder anderen Olympus-Varianten zusammengeführt.

## Verifizierte exakte Betreiber-Spielseiten
- SlotMagie: `https://www.slotmagie.de/slots/pragmatic-play/gates-of-olympus`
- BingBong: `https://www.bingbong.de/slots/gates-of-olympus`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/gates-of-olympus`

Alle drei Seiten wurden am 06.09.2026 geprüft und erfüllen das Evidenz-Gate `DE / virtual_slots / operator_game_page / exact_variant`.

## Marktstatus
BingBong und JackpotPiraten werden in der aktuellen GGL-Whitelist unter `Virtuelle Automatenspiele` geführt. SlotMagie nennt auf der exakten Spielseite die deutschlandweite Erlaubnis für virtuelles Automatenspiel und verlinkt die GGL-Whitelist.

## Testregel
Die neue Research-Fixture wird durch `research-coverage.test.mjs` auf mindestens drei exakte Betreiber-Spielseiten, eindeutige Betreiber, HTTPS-Quellen, DE-Markt und Variantentrennung geprüft.

## Folge
Gates of Olympus ist für die nächste Seed-Ingestion freigegeben. Vor Produktivaufnahme müssen `games.seed.json` und `coverage-priority.test.mjs` gemeinsam aktualisiert werden, damit `Gates of Olympus 1000` weiterhin separat bleibt.
