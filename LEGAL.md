# LEGAL – verifizierter Arbeitsstand 2026-09-03

Keine Rechtsberatung. Vor Live-Monetarisierung anwaltlich prüfen.

## Deutschland – Primärquellen

### Anbieterstatus
Die amtliche GGL-Whitelist ist derzeit Stand 14.08.2026 und wird mindestens monatlich bzw. anlassbezogen aktualisiert.
Quelle: https://www.gluecksspiel-behoerde.de/de/fuer-spielende/uebersicht-erlaubter-anbieter-whitelist

Technische Konsequenz: Ein Anbieter darf in DE erst auf `verified_allowed` gesetzt werden, wenn Domain/Betreiber gegen die aktuelle Whitelist geprüft wurden. Netzwerk-GEO oder ausländische Lizenz reichen nicht.

### Werbung
§ 5 Abs. 3 GlüStV: Zwischen 06:00 und 21:00 Uhr darf im Internet keine Werbung für virtuelle Automatenspiele, Online-Poker und Online-Casinospiele erfolgen.

§ 5 Abs. 6 GlüStV: Bei Internetwerbung, insbesondere Affiliate-Links, darf keine variable, insbesondere umsatz-, einzahlungs- oder einsatzabhängige Vergütung vereinbart oder gezahlt werden.

§ 5 Abs. 7 GlüStV: Werbung und Sponsoring für unerlaubte Glücksspiele sind verboten.

Quelle: https://www.gesetze-bayern.de/Content/Document/StVGlueStV2021-5

Technische Konsequenz:
- Monetäre CTAs/Affiliate-Links als eigene Komponente mit Markt + Glücksspielart + lokaler Zeit steuern.
- DE-Offers bevorzugt/für relevante Produkte ausschließlich als fixes zulässiges CPA-Modell speichern.
- Keine Offshore-Anbieter in DE ausspielen.

### Google Ads
Google führt Affiliate-/Aggregator-Websites grundsätzlich als mögliche Inhalte auf, die für Online-Glücksspiele werben. Für Deutschland verlangt die länderspezifische Regel jedoch eine gültige deutsche Berechtigung des Betreibers/Vermittlers; Unternehmen, die keine Betreiber/Vermittler sind, müssen vom Lizenzinhaber zum Werben in seinem Namen autorisiert sein. Zertifizierung ist erforderlich.
Quelle: https://support.google.com/adspolicy/answer/15132179?hl=de

Seit 26.08.2026 gelten verschärfte Zielseitenanforderungen. Affiliate/Aggregator-Ziele dürfen nur auf in der Zielregion vollständig lizenzierte/autorisierten Anbieter verlinken und müssen dies im Footer deutlich erklären.
Quelle: https://support.google.com/adspolicy/answer/17258294?hl=de

Ab 14.09.2026 werden die Zertifizierungs-/Policy-Health-Anforderungen weiter ausgeweitet; die Domain muss direkt dem Unternehmen gehören und kontrolliert werden, kostenlose Subdomains sind nicht qualifiziert.
Quelle: https://support.google.com/adspolicy/answer/17199930?hl=de

## Produktregel
Information, Ranking und kommerzielle Ausspielung getrennt modellieren. Der Match-Score darf niemals Affiliate-Provision als Eingabe erhalten.
