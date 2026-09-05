# D-038 – Freshness-Gate für Spiel→Anbieter-Evidenz

Datum: 05.09.2026
Status: umgesetzt auf `spielmatch-bootstrap`

## Entscheidung
Produktive Spiel→Anbieter-Beziehungen gelten nicht unbegrenzt als aktuell. `validate-games.mjs` akzeptiert Betreiber-Spielseiten-Evidenz standardmäßig nur bis zu einem Alter von 30 Tagen.

Zusätzlich werden zukünftige Prüfdaten und ungültige Kalenderdaten abgewiesen. Das Datumsformat ist nicht mehr auf das Jahr 2026 fest verdrahtet, damit der Validator auch 2027+ korrekt weiterläuft.

## Begründung
SPIELMATCH darf Anbieter-Verfügbarkeit nur aus aktuell verifizierten Informationen ableiten. Betreiber können Spiele entfernen oder Markt-/Produktverfügbarkeit ändern. Ein reines ISO-Datum ohne Altersgrenze verhindert keine veralteten Matchdaten.

## Test
Regressionen decken frische Evidenz, >30 Tage alte Evidenz, zukünftige Daten, ungültige Kalenderdaten und ein gültiges Datum im Folgejahr ab. Ein isolierter Node-Test des Freshness-Gates wurde am 05.09.2026 erfolgreich ausgeführt.

## Research-Folge
`Ramses Book Deluxe` bleibt vorerst unter dem 3-Anbieter-Gate. Aktuell wurden exakte Betreiberbelege bei NOVOLINE und StarGames gefunden; weitere Treffer wie LuckyMe/Lapalingo/LordLucky sind Katalog-/Herstellerlisten und erfüllen das bestehende `operator_game_page`-Evidenz-Gate nicht. Deshalb keine künstliche Seed-Ingestion.
