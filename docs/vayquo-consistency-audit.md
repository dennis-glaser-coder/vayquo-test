# VAYQUO Consistency Audit

Stand: 22.08.2026

## Ziel

Vor sichtbaren Produktänderungen wird geprüft, ob dieselbe fachliche Information an mehreren Stellen verwendet wird und ob eine Änderung bestehende Entscheidungs-, Navigations- oder Monetarisierungslogik beschädigen kann.

Die CI-Prüfung `tests/content-fact-consistency.test.cjs` ist absichtlich **kein UI-Umbau**. Sie schützt den vorhandenen Stand und zwingt künftige Änderungen dazu, abhängige Inhalte mitzudenken.

## Kanonische Quellen

- Kreditkartenkonditionen: `config/vayquo-card-advisor.de.json`
- Optimierer- und Entscheidungsregeln: `config/vayquo-optimizer-rules.de.json`
- Veränderliche Programm- und Benefit-Fakten: `config/vayquo-program-facts.de.json`
- Governance/Abhängigkeitsregister: `config/vayquo-fact-governance.de.json`

`config/vayquo-program-facts.de.json` enthält nur gegengeprüfte Provider-Fakten und dokumentiert die jeweils offizielle Quelle. Wenn sich ein Anbieter nach dem `checkedAt`-Stand ändert, gewinnt immer die aktuelle Anbieterbedingung.

## Jetzt zentral abgesichert

1. Jede `ratgeber/*.html`-Seite muss im Governance-Register klassifiziert sein. Neue Ratgeber können nicht unbemerkt ohne Faktenprüfung live gehen.
2. MR → PAYBACK → Miles & More muss in Ratgebertexten mit den kanonischen Optimierer-Regeln übereinstimmen.
3. Alle veröffentlichten MR-Airline-Transferverhältnisse müssen den aktiven Optimierer-Regeln entsprechen.
4. Die vier aktuell verifizierten Hotel-Transferverhältnisse ALL Accor, Hilton Honors, Marriott Bonvoy und Radisson Rewards sind jetzt zentrale Programm-Fakten und werden gegen den öffentlichen Transferpartner-Ratgeber geprüft.
5. Die Membership-Rewards-Gültigkeitsregel ist zentral erfasst: unbeschränkte Gültigkeit während ungekündigter Teilnahme bei ausgeglichenem Kartenkonto; Sonderregeln bei Zahlungsversäumnis und Beendigung bleiben zu beachten.
6. Die Miles-&-More-Regel mit 36 Monaten und Verfall zum nächsten Quartalsende ist zentral erfasst und gegen den Ratgeber abgesichert.
7. PAYBACK-Direktwert, Mindestpunkteguthaben für Einlösung/Auszahlung und PAYBACK → Miles & More werden zwischen Programm-Fakten, Optimierer, Ratgebern und Angebotsvergleich abgeglichen.
8. Die Platinum-Guthaben Online-Reiseguthaben, Restaurantguthaben, SIXT ride und LODENFREY sind mit ihren aktuell verifizierten Maximalwerten zentral erfasst. Der Test verhindert, dass die Vorteils-UI davon unbemerkt abweicht.
9. Das Online-Reiseguthaben wird zusätzlich weiterhin gegen Kartenkatalog und Optimierer-Regeln abgeglichen.
10. Dynamische Ratgeber müssen einen `dateModified`-Stand besitzen, der nicht älter ist als ihre kanonische Faktenquelle.

## Quellenprüfung 22.08.2026

Für die neu zentralisierten Fakten wurden aktuelle offizielle Quellen von American Express Deutschland, Miles & More und PAYBACK geprüft. Die genauen Provider-URLs stehen in `config/vayquo-program-facts.de.json`.

Besonders wichtig: Der Membership-Rewards-Verfallsratgeber wurde inhaltlich präzisiert. Die Aussage ist nicht mehr verkürzt als „verfällt nie“ formuliert, sondern nennt die Bedingungen der laufenden Teilnahme und des ausgeglichenen Kartenkontos sowie die Besonderheiten bei Zahlungsversäumnis und Kündigung.

## Ergebnis des ersten Risiko-Backlogs

Die fünf im ersten Audit gefundenen Lücken sind jetzt zentralisiert:

- Hotel-Transferverhältnisse: erledigt
- Membership-Rewards-Gültigkeitsregel: erledigt
- Miles-&-More-36-Monats-/Quartalsregel: erledigt
- Platinum-Vorteilsmaxima für SIXT ride, Restaurant und LODENFREY: erledigt
- PAYBACK-Auszahlungs-/Einlösungsminimum: erledigt

Der aktuelle `remediationBacklog` ist deshalb leer. Neue ungesicherte Fakten dürfen aber nicht stillschweigend entstehen: Sie müssen entweder sofort zentralisiert oder wieder explizit als Backlog eingetragen werden.

## Regel für jede künftige Änderung

Eine Änderung gilt erst als fertig, wenn diese Reihenfolge abgearbeitet ist:

1. Fachlichen Fakt oder Mechanik identifizieren.
2. Kanonische Quelle bestimmen.
3. Alle abhängigen Seiten/Module suchen.
4. Entscheidungsauswirkung prüfen.
5. Gast-/Login-/Programm-/Karten-Zustände prüfen.
6. Regressionstests ausführen.
7. Erst danach sichtbare UI freigeben.

## Was bewusst nicht umgebaut wurde

- Startseite
- Kartencheck-Layout
- Navigation
- Optimierer-UI
- Vorteile-Layout
- Affiliate-Darstellung
- Analytics-Aktivierung in der Haupt-App

Damit bleibt die aktuell funktionierende Oberfläche unangetastet. Geändert wurden nur die fachliche Sicherheitsbasis und eine inhaltliche Präzisierung des Membership-Rewards-Verfallsratgebers.
