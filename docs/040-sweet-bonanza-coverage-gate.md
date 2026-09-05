# D-040 – Sweet-Bonanza-Research mit produktivem Seed abgeglichen

Datum: 06.09.2026

## Korrektur
Die frühere D-040-Fassung war nicht mehr konsistent mit `games.seed.json`: Sweet Bonanza war dort bereits mit drei exakten DE-`virtual_slots`-Betreiber-Spielseiten enthalten. Die Research-Fixture wurde deshalb korrigiert statt den produktiven Seed zurückzudrehen.

## Aktueller Belegstand
- BingBong: `https://www.bingbong.de/slots/sweet-bonanza`
- JackpotPiraten: `https://www.jackpotpiraten.de/slots/sweet-bonanza`
- SlotMagie: `https://www.slotmagie.de/slots/pragmatic-play/sweet-bonanza`

Alle drei Beziehungen werden als `operator_game_page`, exakte Variante und DE-`virtual_slots` geführt. Varianten von Sweet Bonanza bleiben eigene Titel.

## Produktlogik
Bei Konflikten zwischen Research-Fixture, Entscheidungstext und produktivem Seed darf keine Quelle stillschweigend bevorzugt werden. Der Ist-Stand wird gegengeprüft, die Evidenz neu verifiziert und die veraltete Dokumentation korrigiert. Das Drei-Anbieter-Gate bleibt unverändert.

## Folge
Sweet Bonanza bleibt match-ready im bestehenden Seed. Die korrigierte Research-Fixture ist Bestandteil des neuen Research-Coverage-Regressionstests.
