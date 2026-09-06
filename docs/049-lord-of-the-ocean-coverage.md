# D-049 – Lord of the Ocean als eigener DE-Kernintent

**Datum:** 06.09.2026

## Entscheidung
`Lord of the Ocean` wird als eigener Spieltitel für `DE / virtual_slots` für die nächste Seed-Ingestion freigegeben. Vor der Recherche wurde der tatsächliche produktive Seed geprüft; `lord-of-the-ocean` ist dort noch nicht enthalten.

## Evidenz-Gate
Drei unterschiedliche exakte Betreiber-Spielseiten wurden am 06.09.2026 geprüft:

- SlotMagie: `https://www.slotmagie.de/slots/novomatic/lord-of-the-ocean`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/lord-of-the-ocean`
- NOVOLINE: `https://www.novoline.de/de/slots/lord-of-the-ocean`

Zusätzlich wurde eine aktuelle exakte Seite bei StarGames gefunden (`https://www.stargames.de/de/slots/lord-of-the-ocean`), sie wird in diesem Schritt jedoch nicht als Seed-Beziehung verwendet, da StarGames derzeit nicht im kuratierten Provider-Seed geführt wird. Dadurch bleibt die Research-Ingestion referenziell sauber.

Alle drei freigegebenen Beziehungen werden ausschließlich als `operator_game_page` für `market=DE` und `product=virtual_slots` behandelt.

## Marktstatus
Die amtliche GGL-Whitelist mit Aktualisierungsstand 04.09.2026 führt `slotmagie.de`, `jackpotpiraten.de` und `novoline.de` unter `Virtuelle Automatenspiele` mit länderübergreifendem Vertriebsgebiet. Der separate Schleswig-Holstein-Eintrag `casino.novoline.de` für Online-Casinospiele wird ausdrücklich nicht als Beleg für den deutschlandweiten Slot-Markt verwendet.

## Variantentrennung
`Lord of the Ocean` bleibt getrennt von `Lord of the Ocean Magic`, `Lord of the Ocean Bonus Spins`, `Lord of the Ocean 10 Win Ways` sowie Top-Spin-/Max-RTP-Varianten. Evidenz einer Variante darf den Basis-Titel nicht erfüllen.

## Umsetzung in diesem Schritt
- Research-Fixture `lord-of-the-ocean.de.virtual-slots.2026-09-06.json` angelegt.
- Regressionstest `lord-of-the-ocean-research.test.mjs` ergänzt.
- Fixture/Test lokal isoliert mit Node ausgeführt: PASS; zusätzlich JS-Syntax und JSON-Parsing geprüft.
- Produktiver Seed bleibt unverändert bei 53 Beziehungen / 18 Spielen / 17 match-ready / 1 unter Gate.

## Nächster Schritt
Die drei kuratierten Beziehungen in `games.seed.json` ingestieren und Coverage-/Current-Seed-Tests auf 56 Beziehungen / 19 Spiele / 18 match-ready / 1 unter Gate anheben. Vor der Ingestion erneut Duplicate- und Variantengate prüfen.
