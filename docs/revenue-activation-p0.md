# VAYQUO — P0 Revenue Activation

Stand: 2026-09-02

## Ziel

Aus qualifizierten VAYQUO-Projekten verifizierbaren Umsatz erzeugen. Keine weitere Feature-Priorität vor einem aktiven Revenue-Pfad, außer sie behebt einen Conversion-Blocker.

## P0-A — High-Ticket Fachprojekte

Partnerziel: Aroundhome Affiliate-Programm

Öffentliche Fakten, geprüft am 2026-09-02:
- Affiliate-Leads werden per Revenue Share vergütet.
- Aroundhome nennt 30–50 % Beteiligung an dem Umsatz, den Aroundhome mit dem Lead erzielt; im Awin-Profil wird im Regelfall 30 % genannt.
- Eigener Fragebogen / Leadlieferung per API ist grundsätzlich möglich.
- Relevante Bereiche: Küche, Heizung, Photovoltaik und weitere Hausprojekte.

Activation Gate:
1. Publisher-/Affiliate-Vertrag aktiv.
2. API-/Tracking-Spezifikation erhalten.
3. Datenschutz- und Einwilligungstext auf konkrete Partnerdatenverarbeitung anpassen.
4. Erst danach Name, Telefon oder E-Mail erheben/übermitteln.
5. Testlead nur nach Partnerfreigabe; niemals echte Nutzer als Test verwenden.

URLs:
- https://www.aroundhome.de/affiliateprogramm/
- https://ui.awin.com/merchant-profile/68536

## P0-B — Werkstatt / DIY Commerce

Partnerziel 1: Contorion

Öffentliche Fakten, geprüft am 2026-09-02:
- bis zu 5 % Kommission pro Verkauf
- 30 Tage Cookie
- CSV-Produktliste / Produktdaten
- >500.000 Produkte

URL:
- https://www.contorion.de/partnerprogramm-affiliate

Partnerziel 2: ManoMano DE über Awin

Öffentliche Fakten, geprüft am 2026-09-02:
- bis zu 7 % Provision abhängig von Partnerschaftsbedingungen
- Partnerprogramm über Awin
- Tracking-Links erforderlich

URLs:
- https://www.manomano.de/lp/affiliation-program-de-6309
- https://ui.awin.com/merchant-profile/17961

## Bereits technisch umgesetzt

- Neutraler VAYQUO-Einstieg statt Nischen-Default.
- Intent-Erkennung für Commerce vs. High-Ticket Lead.
- Anonyme Revenue-Events: revenue_intent, revenue_flow_start, revenue_result, revenue_primary_click.
- Serverseitige tägliche Funnel-View in Supabase: public.vayquo_revenue_funnel_daily.
- View ist für anon/authenticated gesperrt.
- Keine personenbezogene Lead-Übertragung aktiv.

## Kill Rule

Solange kein Partnerpfad aktiviert ist, haben neue Kategorien, zusätzliche Designvarianten und nicht messbare Features keine P0-Priorität.
