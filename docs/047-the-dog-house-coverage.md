# D-047 — The Dog House: DE-Multanbieter-Coverage

**Datum:** 06.09.2026  
**Status:** beschlossen  
**Scope:** `spielmatch-bootstrap` / Deutschland / `virtual_slots`

## Entscheidung

`The Dog House` wird als eigener Spielintent für die nächste Seed-Ingestion freigegeben, weil am 06.09.2026 drei unterschiedliche exakte Betreiber-Spielseiten verifiziert wurden:

- SlotMagie: `https://www.slotmagie.de/slots/pragmatic-play/the-dog-house`
- BingBong: `https://www.bingbong.de/slots/the-dog-house`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/the-dog-house`

Für alle drei Domains ist der deutsche Marktstatus getrennt gegen die amtliche GGL-Whitelist geprüft. Die Whitelist trägt Stand 04.09.2026 und führt `slotmagie.de`, `bingbong.de` und `jackpotpiraten.de` unter `Virtuelle Automatenspiele`.

## Variantengrenze

Nur der exakte Titel `The Dog House` zählt für diesen Intent. Folgende Varianten werden nicht zusammengeführt und benötigen bei einer späteren Aufnahme eigene Evidenz:

- `The Dog House Megaways`
- `The Dog House Multihold`
- `The Dog House - Dog or Alive`

## Konsequenz

Die Research-Fixture steht auf `ready_for_seed_ingestion`. Der produktive `games.seed.json` bleibt in diesem Schritt unverändert; die Ingestion ist der nächste Backlog-Schritt und muss Coverage-/Current-Seed-Tests gemeinsam aktualisieren.
