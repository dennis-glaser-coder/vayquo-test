# D-027 – Funnel-Events werden vorerst nur lokal emittiert

Stand: 05.09.2026

## Entscheidung
Der bereits allowlist-basierte Funnel-Core wird in Finder und Match-UI verdrahtet, ohne einen externen Analytics-Sink zu konfigurieren.

Erfasst werden ausschließlich:
- Katalog erfolgreich geladen / Ladefehler
- Auswahl eines verifizierten Spiels mit Quelle der Auswahl
- Aktivieren/Deaktivieren eines Finder-Filters
- Match-Anfrage
- Match bereit
- zu geringe verifizierte Abdeckung
- lokaler Datenfehler

## Datenschutz-/Produkt-Gate
Es werden keine Rohsuche, E-Mail-Adresse, Freitextfelder, IP-bezogene Informationen oder sonstige frei definierte personenbezogene Payloads an den Tracker übergeben. `funnel-events.mjs` akzeptiert weiterhin nur fest definierte Events und Payload-Keys. Ohne expliziten `sink` werden Events lediglich als lokales `spielmatch:funnel`-Browser-Event emittiert.

Ein externer Analytics-Dienst, Cookies, Local-Storage-Tracking oder serverseitige Übertragung werden mit dieser Entscheidung ausdrücklich **nicht** aktiviert. Die Auswahl/Aktivierung eines externen Sinks bleibt bis zu einer separaten Datenschutz-/Consent-Prüfung offen.

## Folge
Damit kann der Funnel technisch und semantisch getestet werden, ohne eine rechtlich wesentliche Tracking-Entscheidung vorwegzunehmen. Die Match-Rangfolge, Anbieterfreigaben und Affiliate-Gates bleiben unverändert.
