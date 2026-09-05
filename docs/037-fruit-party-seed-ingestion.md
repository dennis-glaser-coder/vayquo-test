# D-037 – Fruit Party in den verifizierten DE-Seed übernehmen

**Datum:** 05.09.2026

## Entscheidung

`Fruit Party` wird aus der geprüften Research-Fixture in `spielmatch-mvp/backend/games.seed.json` übernommen.

Aufgenommen werden ausschließlich die drei am 05.09.2026 erneut geprüften Betreiber-Spielseiten für den Markt `DE` und das Produkt `virtual_slots`:

- `slotmagie` – `https://www.slotmagie.de/slots/pragmatic-play/fruit-party`
- `bingbong` – `https://www.bingbong.de/slots/fruit-party`
- `jackpotpiraten` – `https://www.jackpotpiraten.de/slots/fruit-party`

Alle drei Beziehungen verwenden `availability_status = verified` und `evidence_type = operator_game_page`.

## Variantenregel

`Fruit Party 2` ist ein eigenständiger Titel und darf weder beim Autocomplete noch bei Coverage oder Match-Ergebnissen mit `Fruit Party` zusammengeführt werden.

## Coverage-Folge

Nach der Ingestion gilt für den DE-`virtual_slots`-Seed:

- 44 verifizierte Spiel→Anbieter-Beziehungen
- 15 exakte Spiele
- 14 Spiele mit mindestens 3 verifizierten Anbietern (`match-ready`)
- 1 Spiel unter dem Gate (`Ramses Book Deluxe`)

## Guardrails

- Keine AT-/CH-/sonstigen Marktbeziehungen in die DE-Coverage zählen.
- Keine anderen Glücksspielprodukte in `virtual_slots` einmischen.
- `pending` oder schwächere Evidenz zählt nicht als verifizierte Coverage.
- Affiliate-Vergütung beeinflusst weder Aufnahme noch Match-Score.
- Clickouts bleiben bis zur separaten rechtlichen/vertraglichen Freigabe deaktiviert.

## Testentscheidung

`coverage-priority.test.mjs` wird auf 44/15/14/1 aktualisiert und enthält einen expliziten Fruit-Party-Check sowie einen Negativcheck gegen `fruit-party-2`.

Ein vollständiger lokaler Repo-Checkout war in dieser Ausführung wegen DNS-Auflösung zu `github.com` nicht möglich. Die GitHub-Dateien und die Änderung wurden deshalb über die verbundene GitHub-Quelle geprüft; ein vollständiger lokaler Node-Regressionslauf bleibt nach Wiederherstellung des Netzwerkzugriffs erneut auszuführen.