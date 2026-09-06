# D-043 – Wolf Gold als nächsten DE-Coverage-Kandidaten verifizieren

**Datum:** 06.09.2026

## Entscheidung

`Wolf Gold` erfüllt das Research-Gate für einen neuen SPIELMATCH-Kernintent im Markt `DE` und Produkt `virtual_slots`.

Es liegen drei am 06.09.2026 geprüfte, exakte Betreiber-Spielseiten vor:

- `slotmagie` – `https://www.slotmagie.de/slots/pragmatic-play/wolf-gold`
- `bingbong` – `https://www.bingbong.de/slots/wolf-gold`
- `jackpotpiraten` – `https://www.jackpotpiraten.de/slots/wolf-gold`

Alle drei Evidenzen werden ausschließlich als `operator_game_page` und `exact_variant = true` akzeptiert.

## Marktprüfung

Die amtliche GGL-Whitelist wurde am 04.09.2026 aktualisiert und am 06.09.2026 erneut geprüft. Sie führt:

- `slotmagie.de` unter Solis Ortus Service Limited als `Virtuelle Automatenspiele`, Vertriebsgebiet länderübergreifend;
- `bingbong.de` und `jackpotpiraten.de` unter DGGS Deutsche Gesellschaft für Glücksspiel mbH als `Virtuelle Automatenspiele`, Vertriebsgebiet länderübergreifend.

Damit wird keine AT-/CH-/sonstige Marktbeziehung in die DE-Coverage übernommen.

## Variantenregel

`Wolf Gold` wird als exakter Titel behandelt. Ähnlich benannte Wolf-, Gold-, Megaways-, Jackpot- oder Fortsetzungsvarianten dürfen keine Provider-Coverage für `wolf-gold` liefern, solange nicht die exakte Betreiber-Spielseite `Wolf Gold` belegt ist.

## Technische Folge

Die strukturierte Research-Fixture `wolf-gold.de.virtual-slots.2026-09-06.json` wurde angelegt und in `research-coverage.test.mjs` aufgenommen. Der Test verlangt weiterhin mindestens drei unterschiedliche exakte DE-Betreiber-Spielseiten und prüft zusätzlich die Variantenregel sowie den GGL-Prüfstand.

## Seed-Entscheidung

`Wolf Gold` ist jetzt **eligible for seed ingestion**, wird in diesem Research-Schritt aber noch nicht stillschweigend mit dem produktiven Seed vermischt. Der nächste Schritt ist die gemeinsame Ingestion der drei Beziehungen in `games.seed.json` plus Aktualisierung der Coverage-Regression.

Bei erfolgreicher Ingestion sollte die Coverage von 50/17/16/1 auf **53 Beziehungen / 18 Spiele / 17 match-ready / 1 unter Gate** steigen.

## Teststatus

Der Testcode und die Fixtures wurden strukturell gegengeprüft. Ein vollständiger lokaler Node-Lauf konnte in dieser Ausführung erneut nicht gestartet werden, weil die Container-Umgebung `github.com` nicht per DNS auflösen konnte. Dieser Infrastrukturfehler wird nicht als bestandener Test ausgegeben.
