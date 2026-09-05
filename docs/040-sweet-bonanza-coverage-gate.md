# D-040 – Sweet Bonanza bleibt bis zum dritten exakten Betreiberbeleg außerhalb des Seeds

Datum: 05.09.2026

## Entscheidung
Sweet Bonanza wird trotz hoher Relevanz nicht in `games.seed.json` aufgenommen, solange weniger als drei frische, exakte DE-`virtual_slots`-Betreiber-Spielseiten verifiziert sind.

## Aktueller Belegstand
- BingBong: exakte Betreiber-Spielseite verifiziert.
- JackpotPiraten: exakte Betreiber-Spielseite verifiziert.
- SlotMagie: aktuelle Betreiber-/Katalogreferenz auf Sweet Bonanza gefunden, aber in diesem Prüflauf keine frische exakte Betreiber-Spielseite verifiziert. Diese Referenz zählt daher nicht für das Match-Gate.

## Produktlogik
Das bestehende Mindest-Gate von drei unterschiedlichen verifizierten Betreibern bleibt unverändert. Katalog-, Hersteller- oder redaktionelle Erwähnungen dürfen eine fehlende `operator_game_page` nicht ersetzen. Varianten von Sweet Bonanza werden als eigene Titel behandelt.

## Folge
Seed und Match-Coverage bleiben unverändert bei 47 Beziehungen / 16 Spielen / 15 match-ready / 1 unter Gate. Sweet Bonanza wird erneut geprüft, sobald ein dritter exakter Betreiberbeleg verfügbar ist.
