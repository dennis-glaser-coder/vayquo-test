# D-021 – Markt- und Produkt-Gate bis in die Datenbank

Stand: 04.09.2026

Spielverfügbarkeit ist nicht nur eine Beziehung zwischen Spiel und Anbieter. Sie ist eine Beziehung zwischen **Spiel + Anbieter + Markt + Produktvertikale + Evidenzstand**.

Für `spielmatch_provider_games` gilt deshalb ab jetzt im vorbereiteten Backend-Schema:

- `market_code` ist Pflicht und Bestandteil des Primärschlüssels.
- `product_type` ist Pflicht und Bestandteil des Primärschlüssels.
- `availability_status` startet sicher auf `pending`, nicht auf `verified`.
- `evidence_type`, `verified_at` und HTTPS-`source_url` bleiben an der exakten Beziehung hängen.
- Ein `verified`-Mapping benötigt Prüfdatum und starke Evidenz.
- Öffentliche Reads sind im aktuellen DE-MVP hart auf `DE + virtual_slots + verified` begrenzt und verlangen zusätzlich einen aktiven, GGL-verifizierten Provider.
- Ein Mapping aus AT/NL oder einer anderen Glücksspielvertikale kann dadurch nicht versehentlich als deutsches Slot-Angebot sichtbar werden.

Die öffentliche Policy darf nicht wieder auf die frühere Regel `availability_status = 'verified'` allein zurückfallen. Dafür existiert `schema-gates.test.mjs` als Regressionstest.

Diese Änderung betrifft ausschließlich das vorbereitete SPIELMATCH-Schema auf `spielmatch-bootstrap`. Es wurde kein Supabase-Projekt migriert und VAYQUO `main` bleibt unberührt.
