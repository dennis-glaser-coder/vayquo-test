# D-025 – Echte Matchkarten nur hinter demselben Verification-Gate wie die Engine

Datum: 05.09.2026

## Entscheidung
Die sichtbare Ergebnisansicht des SPIELMATCH-MVP wird an `match-results.mjs` angebunden. Das UI darf reale Anbieter nur dann rendern, wenn die Engine `status = ready` liefert. Für den aktuellen MVP bedeutet das weiterhin strikt `market = DE`, `product = virtual_slots`, aktuelle Betreiber-Spielseiten-Evidenz und mindestens drei eligible/verifizierte Anbieter.

## UX-Regeln
- Demo-Anbieter werden vollständig aus der Ergebnisansicht entfernt.
- Bei zu geringer Abdeckung wird keine Rangliste simuliert, sondern ein neutraler Coverage-Hinweis mit aktuellem Anbieterzähler angezeigt.
- Bei Seed-/Ladefehlern werden keine Ersatzanbieter gezeigt.
- Gewählte Zahlungsart wird als konkrete Auswahl erfasst; "geringe Einzahlung" ist im UI explizit als höchstens 5 EUR definiert, damit das Kriterium technisch und sprachlich eindeutig ist.
- Katalogbreite zählt nur, wenn der Nutzer dieses Kriterium auswählt.
- Prüfdatum von Spiel- und Lizenzstatus wird im Ergebnis nachvollziehbar gezeigt.

## Monetarisierung / Recht
Affiliate-Vergütung bleibt außerhalb des Scores. Alle Clickouts bleiben technisch deaktiviert und werden als nicht freigegeben dargestellt, bis eine separate Vertrags- und Rechtsfreigabe dokumentiert ist.

## Test
`spielmatch-mvp/match-ui.test.mjs` stellt sicher, dass die UI die echte Match-Engine und den Provider-Seed verwendet, das Coverage-Gate vorhanden ist, keine `demoProviders` mehr existieren und Clickouts deaktiviert bleiben.
