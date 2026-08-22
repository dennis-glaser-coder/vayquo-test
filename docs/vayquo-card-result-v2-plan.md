# VAYQUO Karten-Ergebnis V2 – geprüfter Plan

Stand: 22.08.2026
Status: **Nur Konzept / nicht live**

## Ziel

Das bestehende Karten-Ergebnis soll später klarer, vertrauenswürdiger und conversionstärker werden, **ohne** die bestehende Entscheidungslogik, Ranking-Reihenfolge, No-Match-Logik, Gebührenlogik, Datenschutzlogik oder die Trennung von Empfehlung und Monetarisierung zu verändern.

Die Umsetzung wird erst freigegeben, wenn echte Funnel-Daten zeigen, dass das Ergebnis bzw. der Schritt Ergebnis → Anbieter tatsächlich ein relevanter Abbruchpunkt ist.

## Nicht verhandelbare Schutzregeln

1. **Keine Änderung am Ranking-Algorithmus.** `v28-card-advisor-engine.js` bleibt die fachliche Entscheidungsquelle.
2. **Keine Provision darf Ranking oder Empfehlung beeinflussen.** Die bestehende Commercial Policy bleibt vorgelagert und unverändert in ihrer Logik.
3. **Keine erfundenen Scores.** Kein „94 % passend“, solange es dafür keine fachlich begründete, getestete und für Nutzer verständliche Berechnung gibt.
4. **Kein pauschaler First-Year-Value.** Ein Euro-Vorteil wird erst gezeigt, wenn VAYQUO die tatsächliche Nutzung relevanter Guthaben/Leistungen belastbar kennt.
5. **Keine ungeprüften Bonusangebote.** Welcome-Boni, zeitlich begrenzte Aktionen und Fristen brauchen eine eigene kanonische, datierte Angebotsquelle und dürfen nicht aus statischem Copy-Text kommen.
6. **Keine Kartenbilder ohne geklärte Nutzungsrechte/Partnerfreigabe.** Das Ergebnis V2 funktioniert auch ohne Produktbild.
7. **Nur verifizierte Kartenfakten.** Gebühren, Sammelraten, Leistungen und Warnhinweise kommen aus `config/vayquo-card-advisor.de.json` bzw. den zentralen Faktenquellen.
8. **Provider Terms Win.** Anbieterbedingungen und verifizierte Quellen stehen über Marketing-Copy.
9. **No-Match bleibt möglich.** VAYQUO darf weiterhin bewusst keine Karte empfehlen, wenn Budget und Anforderungen nicht zusammenpassen.
10. **Alle 2.880 geprüften Antwortkombinationen bleiben fachlich identisch.** Eine spätere UI-Änderung darf nur die Darstellung betreffen.

## Bestehende Mechanik, die erhalten bleibt

Der Kartencheck bleibt bei fünf Fragen. Der Nutzer wählt Ziel, Reisehäufigkeit, Kartenausgaben, Gebührenbereitschaft und das relevante Punkte-/Nutzungsumfeld. Die Engine filtert zuerst harte Anforderungen und Gebührenrahmen und rankt erst danach passende Karten.

Besonders wichtig: bestehende Konfliktlogik bleibt erhalten. Beispiel: Premium-Wunsch bei praktisch keiner Reisetätigkeit darf weiterhin zu **keiner teuren Premium-Empfehlung** führen.

Die bestehende Auslandslogik bleibt ebenfalls erhalten: dort werden kostenlose Karten anhand konkreter Merkmale wie Fremdwährungsgebühr, Akzeptanz, Bargeld und Versicherung differenziert.

## Ergebnis V2 – vorgeschlagene Hierarchie

### 1. Entscheidung zuerst

Oberhalb aller Details steht nur:

**DEINE EMPFEHLUNG**

`[Kartenname]`

`[Monats-/Jahresgebühr aus der kanonischen Kartenquelle]`

Kurzer Satz, der die Entscheidung mit den Antworten des Nutzers verbindet, z. B.:

> „Passt am besten zu deinem Ziel, flexibel Punkte zu sammeln, und bleibt in deinem gewählten Gebührenrahmen.“

Keine Prozentzahl. Kein künstlicher Badge wie „Testsieger“, sofern er nicht aus einer belegbaren Marktprüfung stammt.

### 2. Warum genau diese Karte?

Maximal drei bis vier Gründe. Nur Gründe, die aus der Entscheidung oder verifizierten Features/Facts folgen.

Beispiele:
- Membership Rewards inklusive.
- Innerhalb deines gewählten Gebührenrahmens.
- Lounge-/Premium-Vorteile, wenn genau das als Ziel gewählt wurde.
- Keine Fremdwährungsgebühr, wenn Ausland der relevante Pfad war.

**Nicht zulässig:** generische Superlative wie „beste Karte Deutschlands“, wenn nicht separat belegt.

### 3. Die wichtigsten echten Konditionen

Ein kompakter Block mit maximal drei für den Nutzer relevanten Fakten aus dem kanonischen Kartenkatalog.

Priorisierung abhängig vom Pfad:
- Punkte: Sammelmechanik + Gebühr + relevanter Programmpunkt.
- Meilen: Meilensammeln + Gebühr + Verfalls-/Versicherungsmerkmal, falls verifiziert.
- Premium: Gebühr + Lounge + verifiziertes Reiseguthaben.
- Ausland: Jahresgebühr + FX-Gebühr + Bargeld-/Versicherungsregel.
- Gebühren sparen: Kosten zuerst.

Zusätzlich klein:

`Konditionen zuletzt geprüft: [checkedAt/sourceNote]`

Das Datum wird **nicht als neuer freier Text gepflegt**, sondern aus der Kartenquelle abgeleitet.

### 4. Was du beachten solltest

Bestehende `warnings` bleiben sichtbar, wenn vorhanden. Sie dürfen nicht wegen Conversion versteckt oder abgeschwächt werden.

Beispiele: Teilzahlungszinsen, ATM-Betreibergebühren, Auslandseinsatzbedingungen.

### 5. Warum nicht die Alternative?

Diese Mechanik ist sinnvoll, aber nur wenn sie **deterministisch und belegbar** ist.

Zulässige Gründe:
- Alternative liegt über dem gewählten Gebührenrahmen.
- Alternative erfüllt ein hartes gewünschtes Merkmal nicht.
- Alternative passt weniger zum konkreten Ziel, weil ihr ein verifiziertes Feature fehlt.
- Bei gleichem Ziel ist die empfohlene Karte günstiger.

Nicht zulässig:
- Unterschied aus einem internen Score als scheinbar objektive Wahrheit ausgeben.
- „Karte A ist 8 % besser“.
- Vermutungen über persönliche Nutzung, die nicht abgefragt wurde.

Darstellung:

**WARUM NICHT DIE ALTERNATIVE?**

`[Alternative Karte]`

Ein kurzer Satz mit **einem** Hauptgrund. Kein zweiter großer Vergleichsblock, damit das Ergebnis nicht wieder zur klassischen Vergleichstabelle wird.

### 6. Nächster Schritt

Die bestehende Logik „erst Entscheidung, dann Anbieter“ bleibt.

Primärer Button:

**Aktuelle Konditionen beim Anbieter prüfen →**

Sekundär:

**Alle Details & Bedingungen ansehen**

Wenn ein freigegebener Affiliate-Link verfügbar und für genau diese Entscheidung zulässig ist, darf er an dieser Stelle verwendet werden. Fehlt ein Affiliate-Link, bleibt die Empfehlung trotzdem bestehen und führt zur verifizierten offiziellen Anbieter-Seite.

Bei kommerziellem Link bleibt der bestehende Hinweis sichtbar:

> VAYQUO kann bei einem Abschluss eine Vergütung erhalten; die Empfehlung bleibt davon unabhängig.

## Was V2 ausdrücklich NICHT enthält

- keinen großen Deal-der-Woche-Block
- keinen Countdown
- keinen Welcome-Bonus ohne eigene verifizierte Angebotsquelle
- keinen Prozent-Passungswert
- keinen pauschalen Jahreswert in Euro
- keine „beliebteste Karte“-Behauptung ohne Datenbasis
- keine fünf Alternativen nebeneinander
- keine neue Frage im Kartencheck nur für bessere Monetarisierung
- keine Änderung der Startseite
- keine Änderung an Punkten/Optimierer/Vorteile-Navigation

## Abhängigkeitsprüfung vor einer späteren Umsetzung

### Dateien/Mechaniken, die zwingend gegengeprüft werden müssen

- `v28-card-advisor-engine.js` – Ranking und harte Regeln dürfen nicht verändert werden.
- `config/vayquo-card-advisor.de.json` – einzige Quelle für Kartenfakten/Warnings/Provider-URLs.
- `v34-card-catalog-runtime.js` – Runtime-Parität muss bestehen bleiben.
- `v28-card-advisor.js` – nur Result-Rendering, nicht Entscheidungslogik ändern.
- `v28-card-advisor-abroad-ux.js` – Auslandsgründe dürfen nicht doppelt oder widersprüchlich werden.
- `v28-card-advisor-provider-cta.js` – CTA-Logik und erlaubte Provider-Hosts erhalten.
- `v24-commercial-policy.js` – Affiliate-Verfügbarkeit darf Empfehlung nicht beeinflussen.
- `v36-anonymous-analytics.js` – bestehende Funnel-Events müssen nach UI-Änderung weiterhin korrekt feuern.
- `tests/card-advisor.test.cjs`
- `tests/card-advisor-v29.test.cjs`
- `tests/card-catalog-runtime.test.cjs`
- `tests/anonymous-analytics.test.cjs`
- `tests/content-fact-consistency.test.cjs`

### Zusätzliche Tests, falls V2 später umgesetzt wird

1. Für alle 2.880 bestehenden Antwortkombinationen bleibt die empfohlene Karte bzw. No-Match-Entscheidung exakt gleich.
2. „Warum nicht die Alternative?“ darf nur Gründe aus Hard-Features, Gebührenrahmen oder verifizierten Features erzeugen.
3. Kein Alternativtext darf einen internen Score oder eine nicht erhobene Nutzerannahme als Tatsache darstellen.
4. Jede sichtbare Zahl muss aus einer kanonischen Quelle kommen.
5. Affiliate-Link vorhanden vs. nicht vorhanden darf das Resultat und die Reihenfolge nicht verändern.
6. Karten ohne Affiliate-Möglichkeit müssen weiterhin einen funktionierenden offiziellen Provider-Weg haben.
7. Warnings bleiben sichtbar.
8. Mobile Ergebnisansicht muss ohne horizontales Scrollen und ohne verdeckten CTA funktionieren.
9. Analytics müssen weiterhin `card_check_complete`, `card_check_provider_click`, `card_check_restart` und Abbruch korrekt erfassen.

## Go/No-Go anhand echter Funnel-Daten

### V2 bauen, wenn

- genügend echte Kartencheck-Abschlüsse vorliegen **und**
- der relevante Drop-off nach dem Ergebnis liegt, z. B. viele `card_check_complete`, aber deutlich zu wenige `card_check_provider_click`.

### V2 nicht bauen, wenn

- bereits zu wenige Besucher den Kartencheck starten → Einstieg/Traffic prüfen.
- viele Nutzer den Check beginnen, aber vor dem Ergebnis abbrechen → Fragen/Flow prüfen.
- Provider-Klickrate bereits gut ist → Ergebnis nicht unnötig umbauen.

## Priorität innerhalb von V2

Falls Daten die Umsetzung rechtfertigen:

1. Ergebnis-Hierarchie und Copy klarer machen.
2. Verifizierte Konditionen + Prüfdatum sichtbar machen.
3. „Warum nicht die Alternative?“ als einen belegbaren Satz ergänzen.
4. CTA nur sprachlich/visuell optimieren, Commercial Guard unverändert lassen.
5. Erst danach prüfen, ob eine separate dynamische Angebots-/Bonusquelle wirtschaftlich sinnvoll ist.

## Entscheidungsfazit

Das Karten-Ergebnis braucht **keinen Neubau**. Die vorhandene Mechanik ist fachlich wertvoll. V2 soll lediglich die bereits getroffene Entscheidung verständlicher machen und den nächsten Schritt klarer gestalten.

Der wichtigste Schutzsatz lautet:

> **Wir optimieren die Darstellung der Entscheidung – nicht die Entscheidung für die Monetarisierung.**
