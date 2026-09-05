# D-036 — Fruit Party als nächster Coverage-Kandidat

Datum: 2026-09-05

## Entscheidung
`Fruit Party` wird als nächster DE-`virtual_slots`-Kernintent für die Seed-Erweiterung vorbereitet.

## Evidenz
Am 05.09.2026 wurden drei exakte Betreiber-Spielseiten geprüft:
- SlotMagie: https://www.slotmagie.de/slots/pragmatic-play/fruit-party
- BingBong: https://www.bingbong.de/slots/fruit-party
- JackpotPiraten: https://www.jackpotpiraten.de/slots/fruit-party

Damit erfüllt der Titel das projektinterne Coverage-Gate von mindestens drei aktuellen Betreiber-Spielseiten im selben Markt/Produkt.

## Variantenregel
`Fruit Party 2` ist ein eigener Titel und darf weder für Coverage noch Autocomplete/Matching mit `Fruit Party` zusammengeführt werden.

## Umsetzung
Die geprüfte Evidenz liegt als Research-Fixture unter `spielmatch-mvp/backend/research/fruit-party.de.virtual-slots.2026-09-05.json`. Die produktive Seed-Ingestion bleibt ein separater, testbarer Schritt; bis dahin ändert sich die öffentliche Match-Coverage nicht.

## Warum so
Keine erfundenen Suchvolumina und keine Serien-/Variantenaggregation. Priorisiert wird reale, aktuell belegte Betreiberüberschneidung.
