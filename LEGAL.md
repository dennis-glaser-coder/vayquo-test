# LEGAL – verifizierter Arbeitsstand 2026-09-03

Keine Rechtsberatung. Vor Live-Monetarisierung anwaltlich und mit dem jeweiligen Erlaubnisinhaber prüfen.

## Deutschland – Primärquellen

### Anbieterstatus
Die amtliche GGL-Whitelist ist derzeit Stand 14.08.2026 und wird mindestens monatlich bzw. anlassbezogen aktualisiert.
Quelle: https://www.gluecksspiel-behoerde.de/de/fuer-spielende/uebersicht-erlaubter-anbieter-whitelist

Technische Konsequenz: Ein Anbieter darf in DE erst auf `verified_allowed` gesetzt werden, wenn konkrete Domain/Betreiber und Glücksspielart gegen die aktuelle Whitelist geprüft wurden. Netzwerk-GEO oder ausländische Lizenz reichen nicht.

### Werbung und Affiliate-Vergütung
§ 5 Abs. 3 GlüStV: Zwischen 06:00 und 21:00 Uhr darf im Internet keine Werbung für virtuelle Automatenspiele, Online-Poker und Online-Casinospiele erfolgen.

§ 5 Abs. 6 GlüStV: Für Internetwerbung, insbesondere Affiliate-Links, darf bei Glücksspielen mit Sperrsystem keine **variable** Vergütung vereinbart oder gezahlt werden; das Gesetz nennt insbesondere umsatz-, einzahlungs- oder einsatzabhängige Vergütung.

WICHTIGE KORREKTUR: Ein nominell fixer Betrag „pro FTD/qualifizierter Aktion“ ist nicht automatisch rechtssicher, nur weil der Eurobetrag je Conversion feststeht. Die Gesamtvergütung variiert mit der Anzahl der Aktionen und eine FTD-Definition kann zudem an Einzahlung anknüpfen. SPIELMATCH darf deshalb DE-CPA nicht eigenständig als zulässig klassifizieren. Vor Aktivierung muss das konkrete Vergütungsmodell schriftlich vom lizenzierten Partner freigegeben und rechtlich geprüft sein.

§ 5 Abs. 7 GlüStV: Werbung und Sponsoring für unerlaubte Glücksspiele sind verboten.

Quelle: https://www.gesetze-bayern.de/Content/Document/StVGlueStV2021-5

### Begriff „Casino“ bei virtuellen Automatenspielen
§ 22a Abs. 11 GlüStV untersagt im Zusammenhang mit Veranstaltung/Eigenvertrieb virtueller Automatenspiele oder Werbung hierfür die Begriffe „Casino“ und „Casinospiele“.
Quelle: https://www.gesetze-bayern.de/Content/Document/StVGlueStV2021-22a

Technische Konsequenz:
- Für DE-Slot-Landingpages neutrale Terminologie wie „Anbieter“, „Spielanbieter“ oder „virtuelle Automatenspiele“ verwenden.
- Keine automatischen SEO-Titel wie „Casino für Book of Ra“ für den deutschen Markt generieren.
- Monetäre CTAs/Affiliate-Links als eigene Komponente mit Markt + Glücksspielart + lokaler Zeit steuern.
- Keine Offshore-Anbieter in DE ausspielen.
- DE-Affiliate-Offer standardmäßig `legal_review_required`; erst nach dokumentierter Freigabe aktivierbar.

### Werbezeit technisch konservativ behandeln
Eine Informationsseite und eine werbliche Affiliate-Ausspielung sind nicht automatisch dasselbe. Bis zur spezialisierten Rechtsprüfung behandelt SPIELMATCH Affiliate-CTAs, Bonus-/Aktionshinweise und werblich hervorgehobene Anbieterplatzierungen für die betroffenen DE-Produkte zwischen 06:00 und 21:00 Uhr konservativ als gesperrt. Neutrale redaktionelle Produktinformation bleibt technisch davon getrennt.

### Google Ads
Google führt Affiliate-/Aggregator-Websites grundsätzlich als mögliche Inhalte auf, die für Online-Glücksspiele werben. Für Deutschland verlangt die länderspezifische Regel jedoch eine gültige deutsche Berechtigung des Betreibers/Vermittlers; Unternehmen, die keine Betreiber/Vermittler sind, müssen vom Lizenzinhaber zum Werben in seinem Namen autorisiert sein. Zertifizierung ist erforderlich.
Quelle: https://support.google.com/adspolicy/answer/15132179?hl=de

Seit 26.08.2026 gelten verschärfte Zielseitenanforderungen. Affiliate/Aggregator-Ziele dürfen nur auf in der Zielregion vollständig lizenzierte/autorisierte Anbieter verlinken und müssen dies im Footer deutlich erklären.
Quelle: https://support.google.com/adspolicy/answer/17258294?hl=de

Ab 14.09.2026 werden die Zertifizierungs-/Policy-Health-Anforderungen weiter ausgeweitet; die Domain muss direkt dem Unternehmen gehören und kontrolliert werden, kostenlose Subdomains sind nicht qualifiziert.
Quelle: https://support.google.com/adspolicy/answer/17199930?hl=de

## Produktregel
Information, Ranking und kommerzielle Ausspielung getrennt modellieren. Der Match-Score darf niemals Affiliate-Provision als Eingabe erhalten. Kein Affiliate-Link wird nur aufgrund einer öffentlichen Programmbeschreibung live geschaltet.
