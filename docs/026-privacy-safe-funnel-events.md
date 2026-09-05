# D-026 – Privacy-sichere Funnel-Events vor Analytics-Anbieter

Stand: 05.09.2026

## Entscheidung
SPIELMATCH definiert Funnel-Tracking zuerst als internes, allowlist-basiertes Ereignismodell und bindet in dieser Phase keinen externen Analytics-Dienst ein.

## Warum
Der MVP soll messen können, wo Nutzer im Finder aussteigen, ohne vorschnell Cookies, Drittanbieter-Skripte oder personenbezogene Rohdaten einzuführen. Die Messlogik bleibt damit reversibel und von einer späteren Consent-/Datenschutzentscheidung getrennt.

## Erlaubte Events
- `catalog_loaded`
- `catalog_load_failed`
- `game_selected`
- `filter_toggled`
- `match_requested`
- `match_ready`
- `match_insufficient_coverage`
- `match_data_error`

## Erlaubte Payload-Felder
Nur technische Produktfelder aus einer festen Allowlist: Spiel-Slug, Auswahlquelle, Filter-Key/-Status, Provider-Anzahl, Mindestabdeckung, Anzahl gewählter Filter, Kataloggröße und Status.

Nicht erlaubt sind insbesondere rohe Sucheingaben, Namen, E-Mail-Adressen, IP-Adressen, Geräte-Fingerprints oder frei definierbare Payload-Felder.

## Technische Umsetzung
`spielmatch-mvp/funnel-events.mjs` validiert Eventnamen, verwirft nicht erlaubte Felder und besitzt standardmäßig keinen Netzwerk-Sink. Im Browser kann es ausschließlich ein lokales `spielmatch:funnel`-CustomEvent auslösen. Ein externer Sink muss später ausdrücklich angebunden werden.

`spielmatch-mvp/funnel-events.test.mjs` prüft Event-Allowlist, Payload-Sanitizing, PII-/Rohquery-Verwerfung und deterministische Event-Ausgabe.

## Noch offen
Die UI-Verdrahtung der Events in `index.html` bleibt als separater, reversibler Schritt offen. Ebenso bleibt die Auswahl bzw. Aktivierung eines externen Analytics-Anbieters ausdrücklich offen, bis Datenschutz-/Consent-Anforderungen dafür geprüft und freigegeben sind.
