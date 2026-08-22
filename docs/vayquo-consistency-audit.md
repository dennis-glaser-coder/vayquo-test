# VAYQUO Consistency Audit

Stand: 22.08.2026

## Ziel

Vor sichtbaren Produktänderungen wird geprüft, ob dieselbe fachliche Information an mehreren Stellen verwendet wird und ob eine Änderung bestehende Entscheidungs-, Navigations- oder Monetarisierungslogik beschädigen kann.

Die neue CI-Prüfung `tests/content-fact-consistency.test.cjs` ist absichtlich **kein UI-Umbau**. Sie schützt den vorhandenen Stand und zwingt künftige Änderungen dazu, abhängige Inhalte mitzudenken.

## Bereits gut abgesichert

- Kreditkartenkonditionen: `config/vayquo-card-advisor.de.json` ist die geprüfte Quelle. `tests/card-catalog-runtime.test.cjs` verhindert bereits, dass die schnelle Runtime-Kopie davon abweicht.
- Optimierer-/Transferregeln: `config/vayquo-optimizer-rules.de.json` enthält die zentrale Entscheidungslogik für Transferverhältnisse, Mindestmengen, PAYBACK-Opportunitätswert und das Amex-Platinum-Reiseguthaben.
- Award-/Live-Daten: bestehende Release-Gates verhindern, dass Test- oder nicht belastbare Awarddaten als echte Empfehlung ausgegeben werden.
- Monetarisierung: bestehende Regeln trennen Empfehlung und Provision; Partnerverfügbarkeit darf die Empfehlung nicht verändern.

## Neu abgesichert

Das Fact-Gate prüft jetzt unter anderem:

1. Jede `ratgeber/*.html`-Seite muss im Governance-Register klassifiziert sein. Neue Ratgeber können damit nicht unbemerkt ohne Faktenprüfung live gehen.
2. MR → PAYBACK → Miles & More muss in Ratgebertexten mit den kanonischen Optimierer-Regeln übereinstimmen.
3. Alle veröffentlichten MR-Airline-Transferverhältnisse im Transferpartner-Ratgeber müssen den aktiven kanonischen Routen entsprechen.
4. PAYBACK-Direktwert und PAYBACK → Miles & More müssen zwischen Ratgeber und Angebotsvergleich konsistent bleiben.
5. Das Amex-Platinum-Online-Reiseguthaben muss zwischen Optimierer-Regeln, Kartenkatalog und Vorteils-UI identisch bleiben.
6. Veröffentlichte dynamische Ratgeber müssen einen `dateModified`-Stand haben, der nicht älter ist als die zugrunde liegende Optimierer-Regelquelle.
7. Bekannte, noch nicht zentralisierte Fakten bleiben als expliziter Backlog im Governance-Register. Ändert jemand einen solchen Wert, schlägt CI fehl und zwingt zur bewussten Prüfung.

## Gefundene offene Risiken

### Hoch: Hotel-Transferverhältnisse

`ratgeber/membership-rewards-transferpartner.html` veröffentlicht aktuell ALL Accor, Hilton Honors, Marriott Bonvoy und Radisson Rewards mit konkreten Transferverhältnissen. Diese Werte sind noch nicht in der kanonischen Optimierer-Regelquelle modelliert.

**Nächster Schritt:** offizielle Quelle verifizieren und in eine zentrale Programm-Faktenquelle überführen.

### Hoch: Amex Membership Rewards Verfallsregel

`ratgeber/amex-punkte-verfallen.html` veröffentlicht die Aussage „ohne Verfallsdatum“. Die Seite ist aktuell geprüft, die Regel selbst ist aber noch nicht zentral modelliert.

**Nächster Schritt:** offizielle Programmbedingung als kanonischen Fakt erfassen.

### Hoch: Miles & More 36-Monats-/Quartalsregel

`ratgeber/miles-and-more-meilen-verfallen.html` enthält die konkrete 36-Monats- und Quartalsende-Regel. Diese gehört in eine zentrale Programmregelquelle statt nur in den Ratgeber.

### Hoch: Platinum-Vorteilsmaxima

`v24-benefit-optimizer.js` enthält neben dem bereits kanonisch abgesicherten Reiseguthaben weitere harte Maximalwerte für SIXT ride, Restaurantguthaben und LODENFREY. Sie sind aktuell noch nicht mit einer zentralen, verifizierten Benefit-Quelle verbunden.

### Mittel: PAYBACK Auszahlungsminimum

Der Ratgeber nennt die Auszahlung ab 200 Punkten. Das ist eine andere Provider-Regel als das bereits kanonisch hinterlegte Transferminimum zu Miles & More und muss separat zentralisiert werden.

## Regel für jede künftige Änderung

Eine Änderung gilt erst als fertig, wenn diese Reihenfolge abgearbeitet ist:

1. Fachlichen Fakt oder Mechanik identifizieren.
2. Kanonische Quelle bestimmen.
3. Alle abhängigen Seiten/Module suchen.
4. Entscheidungsauswirkung prüfen.
5. Gast-/Login-/Programm-/Karten-Zustände prüfen.
6. Regressionstests ausführen.
7. Erst danach sichtbare UI freigeben.

## Was bewusst noch nicht geändert wurde

- Startseite
- Kartencheck-Layout
- Navigation
- Optimierer-UI
- Vorteile-UI
- Affiliate-Darstellung
- Analytics-Aktivierung in der Haupt-App

Damit bleibt die aktuell funktionierende Oberfläche unangetastet, während die technische Sicherheitsbasis für die nächsten Verbesserungen entsteht.
