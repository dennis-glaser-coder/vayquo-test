# D-044 – Wolf Gold Seed-Konsistenz statt Doppel-Ingestion

**Datum:** 06.09.2026

## Ausgangslage

Der BACKLOG führte `Wolf Gold` in Phase 2b.2t noch als ausstehende Ingestion mit einem Zielstand von 53 Beziehungen. Die Prüfung des tatsächlichen Branch-Stands zeigte jedoch, dass `games.seed.json` `wolf-gold` bereits mit genau drei verifizierten DE-`virtual_slots`-Beziehungen enthält: `slotmagie`, `bingbong` und `jackpotpiraten`. Auch `coverage-priority.test.mjs` prüft diese drei Beziehungen bereits.

Der tatsächliche, deterministische Coverage-Sollstand bleibt damit **50 Beziehungen / 17 Spiele / 16 match-ready / 1 unter Gate**. Eine erneute Ingestion derselben drei Beziehungen wäre fachlich falsch und würde vom bestehenden Duplicate-Gate in `validate-games.mjs` abgewiesen.

## Entscheidung

1. Keine erneute Wolf-Gold-Ingestion durchführen.
2. Den offenen Backlog-Punkt als Konsistenzkorrektur abschließen und den falschen Zielstand 53 entfernen.
3. Einen Integrationstest `current-seed.test.mjs` ergänzen, der den realen produktiven Seed als Ganzes gegen `validateGamesSeed` und die erwartete Coverage prüft.
4. Der Test sichert zusätzlich ab, dass `wolf-gold` genau drei Beziehungen zu `bingbong`, `jackpotpiraten` und `slotmagie` enthält.
5. Ramses Book Deluxe bleibt unverändert unter dem Drei-Anbieter-Gate; keine Katalog- oder schwache Evidenz wird zur Hochstufung verwendet.

## Teststatus

Der neue Test ist syntaktisch auf die vorhandenen Module und deren öffentliche Exporte abgestimmt. Ein vollständiger lokaler Node-Lauf konnte in dieser Runde nicht ausgeführt werden, weil der Container `github.com` weiterhin nicht per DNS auflösen konnte. Der Connector-Zugriff auf denselben Branch funktionierte normal. Daher wird kein lokaler PASS behauptet, bis der Clone/Testlauf wieder möglich ist.

## Folge

Nächster Ausbaupunkt ist Phase 2b.2u: einen weiteren Kernintent nur dann aufnehmen, wenn mindestens drei aktuelle, exakte DE-`operator_game_page`-Belege für `virtual_slots` vorliegen und der jeweilige Betreiber für Deutschland belastbar verifiziert ist.
