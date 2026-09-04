# Verifizierte Spielsuche

Stand: 04.09.2026

## Entscheidung
Die sichtbare Spielsuche darf keine separat gepflegte Demo-Titelliste mehr als Wahrheitsquelle verwenden. `spielmatch-mvp/index.html` lädt deshalb `backend/games.seed.json` und baut daraus ausschließlich einen DE-Katalog für `virtual_slots` auf.

Ein Datensatz erscheint nur, wenn alle folgenden Bedingungen erfüllt sind:
- `market = DE`
- `product = virtual_slots`
- `availability_status = verified`
- `evidence_type = operator_game_page`
- `source_url` ist HTTPS

Mehrere Anbieter desselben exakten `game_slug` werden aggregiert. Abweichende Varianten bleiben getrennte Titel. Das Absenden eines frei eingetippten, nicht exakt verifizierten Titels aktiviert das Spielkriterium nicht.

## Sicherheitsgrenze
Die Spielsuche darf bereits echte verifizierte Daten verwenden, während die Match-Karten weiterhin ausdrücklich Demo-Daten bleiben. Echte Anbieterergebnisse und Clickouts werden erst aktiviert, wenn die jeweils notwendigen Markt-, Lizenz-, Verfügbarkeits-, Zahlungs- und Werbefreigaben vollständig vorliegen. Affiliate-Vergütung beeinflusst die Spielsuche und das Ranking nicht.

## Testnotiz
Die Filter-/Aggregationslogik wurde gegen Positiv- und Negativfälle geprüft: zwei verifizierte DE-Beziehungen desselben Spiels werden zu einem Katalogeintrag aggregiert; AT-Daten und `pending`-Verfügbarkeiten werden ausgeschlossen. Ergebnis: PASS am 04.09.2026.
