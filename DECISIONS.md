# DECISIONS

## D-001 – Isolation
`main` bleibt VAYQUO. SPIELMATCH wird auf `spielmatch-bootstrap` aufgebaut und später in ein eigenes Repository überführt.

## D-002 – Intent-first
Primärer Einstieg ist Spiel/Hersteller/Zahlungsart statt generischer Top-10-Liste.

## D-003 – Ranking-Integrität
Affiliate-CPA ist kein Rankingfaktor. Nutzer-Match und Monetarisierung sind getrennte Systeme.

## D-004 – GEO/Legal by design
Anbieterfreigabe ist immer market-spezifisch. Ein Anbieter kann in DE blockiert und in einem anderen verifizierten Markt aktiv sein.

## D-005 – Keine aktiven Links im Bootstrap
Der frühe Prototyp enthält keine aktiven Glücksspiel-Affiliate-Links. Erst nach Markt-, Partner- und Werberegelprüfung werden Clickouts aktiviert.

## D-006 – Conversion ohne Dark Patterns
Optimierung über Relevanz, geringe Reibung, klare Vergleiche, Intent-Personalisierung und Tests; nicht über künstliche Knappheit, Verlustjagd oder irreführende Gewinnversprechen.

## D-007 – Erklärbarer Match-Score
Der Match-Score wird ausschließlich aus vom Nutzer gewählten Kriterien und Datenvertrauen berechnet. Nicht gewählte Kriterien werden aus dem Nenner entfernt. Affiliate-Vergütung bleibt vollständig außerhalb des Rankings. Vor jeder Wertung greifen harte Markt-/Lizenz-/Freigabe-Gates. Details stehen in `MATCHING.md`.

## D-008 – Anbieter-SEO nur mit vollständiger Evidenz
Eine DE-Anbieterseite darf nur indexiert und als geprüft bezeichnet werden, wenn Markt, Anbieterstatus und Lizenzstatus verifiziert sind, ein dokumentierter HTTPS-Primärquellenbeleg vorliegt und alle auf der Seite genannten Spiele eine separat verifizierte Spiel→Anbieter-Verfügbarkeit mit Prüfdatum besitzen. Fehlt eines dieser Elemente, wird die Seite automatisch `noindex,follow` und neutral formuliert. Affiliate-Konditionen sind weder SEO-Gate noch Rankingfaktor.

## D-009 – Öffentliche Affiliate-Kondition ≠ Freigabe
Ein öffentlich sichtbares Affiliate-Programm oder eine öffentlich genannte CPA-Vergütung darf in SPIELMATCH nur als recherchierte Kondition gespeichert werden. Aktivierbare Trackinglinks benötigen zusätzlich mindestens: verifizierten Markt-/Lizenzstatus, Annahme unseres konkreten Mediums durch den Partner, dokumentierte aktuelle Konditionen und `legal_review_status = approved`. Bis dahin bleibt der Offer technisch nicht aktivierbar. Jokerstar ist der erste nach diesem Muster erfasste Anbieter (Primärquellenprüfung 04.09.2026).
