# VAYQUO

VAYQUO ist eine browserbasierte Plattform für große Hausprojekte wie **Photovoltaik, Heizung, Küche und Bad**.

**Live:** https://vayquo.de/

## Produkt

Der aktuelle Kundenflow ist bewusst wertorientiert:

1. Projekt in wenigen Fragen einordnen.
2. Sofort eine Markt-, Budget- oder Eignungseinordnung sehen.
3. Optional ein anonymisiertes Projekt für passende Fachbetriebe freigeben.
4. Bis zu drei passende Betriebe können strukturierte Rückmeldungen abgeben.
5. Persönliche Kontaktdaten werden erst abgefragt, wenn der Kunde einen konkreten Betrieb aktiv auswählt.

Die erste Einordnung ist **kein verbindliches Fachangebot**. Verbindliche Preise und Leistungen entstehen erst durch den jeweiligen Anbieter.

## Anbieter-Modell

VAYQUO zeigt freigeschalteten Partnerbetrieben zunächst nur anonymisierte Projektdaten und eine grobe Region. Anbieter antworten strukturiert mit Preisindikation, Kernleistung, enthaltenen Arbeiten und Verfügbarkeit. Ein Kontakt wird erst nach aktiver Kundenauswahl freigegeben.

Der aktuelle Pilot sieht **49 € je freigegebenem Kontakt** vor, ohne Grundgebühr. Vor einem kostenpflichtigen Start werden Gebiet, Kriterien und Konditionen mit dem Partner ausdrücklich abgestimmt.

## Technik

- statisches Frontend auf GitHub Pages
- Supabase für Projektanfragen, Matching, Partnerzugänge, Kundenlinks und cookielose Funnel-Events
- Row Level Security und begrenzte RPC-Funktionen für öffentliche bzw. authentifizierte Zugriffe
- private Kunden- und Partnerseiten sind `noindex`

## Aktueller Fokus

Nicht weitere Feature-Breite, sondern der Beweis des Geschäftsmodells:

**erste reale Projektanfrage → passender aktiver Fachbetrieb → Kundenfreigabe → erster bezahlter Kontakt → wiederholbare Unit Economics.**

Historische VAYQUO-Versionen sind nicht Teil des aktuellen Produkts und bleiben nur über Sicherungsstände/Branches nachvollziehbar.