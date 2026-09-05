# D-031 – Coverage-Priorisierung systematisieren

Datum: 05.09.2026
Status: angenommen

## Entscheidung
Neue Spielintents werden nicht mehr ad hoc in den produktiven Seed übernommen. `spielmatch-mvp/backend/coverage-priority.mjs` erzeugt aus dem verifizierten Seed eine deterministische Coverage-Sicht und zählt ausschließlich Datensätze mit Markt `DE`, Produkt `virtual_slots`, Status `verified`, Evidenztyp `operator_game_page`, HTTPS-Quelle und Prüfdatum.

Das Match-Gate bleibt bei mindestens drei unterschiedlichen verifizierten Betreibern pro exakter Spielvariante. Andere Länder, Produkte, Pending-Daten und ähnliche Spielvarianten dürfen die Coverage nicht erhöhen.

## Aktueller Stand
Der Seed enthält 29 verifizierte Beziehungen über 10 exakte Spiele. Acht Spiele erfüllen das 3-Anbieter-Gate; zwei liegen darunter. `Book of Ra` liegt mit vier Betreibern über dem Gate. `Ramses Book Deluxe` liegt mit einem Betreiber darunter.

## Research-Regel für neue Kernintents
Ein neuer Kernintent wird erst in `games.seed.json` übernommen, wenn mindestens drei aktuelle Betreiber-Spielseiten für exakt denselben Titel im selben Markt/Produkt vorliegen. Kategorie-/Herstellerseiten dürfen zur Kandidatensuche dienen, ersetzen aber nicht die drei Betreiber-Spielseiten als produktive Evidenz.

## Kandidat nach aktueller Recherche
`Wolf Gold` ist der nächste starke Coverage-Kandidat: aktuelle bzw. erreichbare Betreiber-Evidenz wurde bei SlotMagie, BingBong und JackpotPiraten gefunden. Vor Seed-Aufnahme werden die drei exakten URLs nochmals als einzelne Betreiber-Spielseiten geprüft und anschließend durch den bestehenden Games-Validator geschickt.

## Warum
Damit bleibt die sichtbare Match-Funktion belastbar: keine erfundene Popularität, keine Vermischung von Märkten/Produkten und keine scheinbare Auswahl auf Basis einzelner Anbieter.
