# D-042 – Gates of Olympus in den verifizierten DE-Seed übernehmen

**Datum:** 06.09.2026

## Entscheidung

`Gates of Olympus` wird nach der in D-041 dokumentierten Coverage-Prüfung in `spielmatch-mvp/backend/games.seed.json` übernommen.

Aufgenommen werden ausschließlich die drei am 06.09.2026 geprüften Beziehungen für den Markt `DE` und das Produkt `virtual_slots`:

- `slotmagie` – `https://www.slotmagie.de/slots/pragmatic-play/gates-of-olympus`
- `bingbong` – `https://www.bingbong.de/slots/gates-of-olympus`
- `jackpotpiraten` – `https://www.jackpotpiraten.de/slots/gates-of-olympus`

Alle drei Datensätze verwenden `availability_status = verified` und `evidence_type = operator_game_page`.

## Markt- und Evidenzregel

Die Aufnahme gilt ausschließlich für Deutschland und virtuelle Automatenspiele. Andere Länder und andere Glücksspielprodukte dürfen nicht in diese Coverage einfließen. Der GGL-/Erlaubnisstatus wurde im Research-Schritt D-041 marktbezogen gegengeprüft; Betreiber-Evidenz bleibt zusätzlich dem 30-Tage-Aktualitäts-Gate unterworfen.

## Variantenregel

`Gates of Olympus` und `Gates of Olympus 1000` sind eigenständige Titel. Provider-Coverage darf nicht zwischen beiden Varianten zusammengeführt werden. Der Regressionstest prüft beide Slugs separat.

## Coverage-Folge

Nach der Ingestion gilt für den DE-`virtual_slots`-Seed:

- 50 verifizierte Spiel→Anbieter-Beziehungen
- 17 exakte Spiele
- 16 Spiele mit mindestens 3 verifizierten Anbietern (`match-ready`)
- 1 Spiel unter dem Gate (`Ramses Book Deluxe`)

## Guardrails

- Keine AT-/CH-/sonstigen Marktbeziehungen in die DE-Coverage zählen.
- Keine anderen Glücksspielprodukte in `virtual_slots` einmischen.
- `pending` oder schwächere Evidenz zählt nicht als verifizierte Coverage.
- Varianten werden über exakte Slugs getrennt.
- Affiliate-Vergütung beeinflusst weder Aufnahme noch Match-Score.
- Clickouts bleiben bis zur separaten rechtlichen/vertraglichen Freigabe deaktiviert.

## Testentscheidung

`coverage-priority.test.mjs` erwartet jetzt 50/17/16/1, prüft `Gates of Olympus` mit drei Anbietern und hält `Gates of Olympus 1000` explizit als separaten Titel fest. Poison-Datensätze aus fremdem Markt, falschem Produkt oder mit `pending`-Status dürfen die Kennzahlen weiterhin nicht verändern.

Der vollständige lokale Node-Regressionslauf konnte in dieser Ausführung wegen einer temporären DNS-Auflösung zu `github.com` nicht ausgeführt werden. Seed, Coverage-Algorithmus und aktualisierter Test wurden über die verbundene GitHub-Quelle gegengeprüft; ein vollständiger lokaler Lauf wird nicht als bestanden behauptet.