# D-028 – Spielerschutz als unabhängige Hilfefläche

Datum: 05.09.2026
Status: beschlossen für SPIELMATCH-MVP
Markt: DE

## Entscheidung
SPIELMATCH erhält eine eigenständige Spielerschutz-/Hilfeseite. Sie ist bewusst vom Anbieter-Ranking und von Affiliate-Monetarisierung getrennt.

## Regeln
- Sichtbare Kennzeichnung 18+ und Deutschland.
- Keine Anbieter-Rankings, Boni, Promotions oder Conversion-CTAs auf der Hilfeseite.
- Hilfslinks sind niemals Affiliate-Links.
- Primäre Hilfsquelle ist Check dein Spiel / Bundesinstitut für Öffentliche Gesundheit; für regulatorische Einordnung wird die GGL verlinkt.
- Telefonangaben und externe Hilfsangebote müssen mit Datum verifiziert werden.
- Keine Aussage, dass SPIELMATCH selbst Beratung, Sperre oder Rechtsberatung anbietet.
- Bei Internationalisierung wird diese Seite nicht ungeprüft übersetzt: Hilfsangebote, Altersgrenzen und Aufsicht werden je Markt separat freigegeben.

## Verifikation 05.09.2026
Check dein Spiel führt das BIÖG-Beratungstelefon 0800 1 37 27 00 sowie Online-/E-Mail-/Vor-Ort-Hilfen und Informationen zum Sperren lassen. Die GGL ist die staatliche Aufsicht für länderübergreifende Glücksspielangebote im Internet in Deutschland.

## Technische Umsetzung
`spielmatch-mvp/spielerschutz.html` ist statisch, noindex/nofollow und enthält keine Tracking- oder Affiliate-Integration. `spielmatch-mvp/spielerschutz.test.mjs` sichert zentrale Schutzmerkmale gegen Regressionen ab.

## Noch offen
Die globale, dauerhaft sichtbare Verlinkung aus Finder/Footer wird in einem separaten UI-Schritt ergänzt. Vor Livegang ist eine rechtliche Gesamtprüfung der konkreten Live-Oberfläche erforderlich.
