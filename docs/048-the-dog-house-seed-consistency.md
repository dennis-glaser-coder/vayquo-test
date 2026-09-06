# D-048 – The Dog House: Seed-Konsistenz statt Doppel-Ingestion

**Datum:** 06.09.2026

## Ausgangslage

Der BACKLOG führte Phase 2b.2x noch als offene Ingestion von `The Dog House` mit drei DE-Beziehungen. Der tatsächliche produktive Seed auf `spielmatch-bootstrap` enthielt `the-dog-house` jedoch bereits vollständig mit genau drei verifizierten Beziehungen:

- `slotmagie` – DE / `virtual_slots` / `operator_game_page`
- `bingbong` – DE / `virtual_slots` / `operator_game_page`
- `jackpotpiraten` – DE / `virtual_slots` / `operator_game_page`

Eine erneute Ingestion hätte Duplikate erzeugt und den Coverage-Zielstand fälschlich von 53 auf 56 Beziehungen erhöht.

## Entscheidung

Phase 2b.2x wird als Konsistenzkorrektur abgeschlossen. Es werden **keine zusätzlichen `The Dog House`-Datensätze** angelegt.

Stattdessen werden die bestehenden drei Beziehungen in beiden produktionsnahen Tests explizit verriegelt:

- `backend/coverage-priority.test.mjs`: genau drei Anbieter, `readyForMatch = true`
- `backend/current-seed.test.mjs`: genau drei Datensätze; Anbieter-Set SlotMagie/BingBong/JackpotPiraten; ausschließlich Markt `DE`, Produkt `virtual_slots`, Evidenztyp `operator_game_page`, Status `verified`

Der korrekte Coverage-Sollstand bleibt damit:

- 53 verifizierte Spiel→Anbieter-Beziehungen
- 18 Spiele
- 17 match-ready
- 1 Spiel unter dem Drei-Anbieter-Gate

## Markt- und Evidenzregel

Die Korrektur ändert keine Marktfreigabe und aktiviert keine Affiliate-Weiterleitung. DE bleibt separat modelliert. Andere Länder oder andere Glücksspielprodukte dürfen den DE-`virtual_slots`-Coverage-Score nicht erhöhen.

Für zukünftige Spiele gilt weiterhin: Aufnahme als match-ready erst nach mindestens drei aktuellen, exakten Betreiber-Spielseiten mit getrennt bestätigtem zulässigem Markt-/Produktstatus.

## Folge

Der nächste Ausbau-Schritt recherchiert einen neuen Kernintent. Vor jeder Seed-Ingestion wird zuerst gegen den tatsächlichen Seed geprüft, ob Titel und Beziehungen bereits vorhanden sind.
