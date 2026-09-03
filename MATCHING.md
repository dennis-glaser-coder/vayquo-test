# MATCHING

## Ziel
Der Match-Score beantwortet ausschließlich: **Wie gut erfüllt ein in diesem Markt zulässiger Anbieter die vom Nutzer gewählten Kriterien?**

Er ist ausdrücklich **kein Qualitätsurteil über Gewinnchancen** und **kein Affiliate-Ranking**.

## Harte Gates vor dem Ranking
Ein Anbieter darf überhaupt erst gerankt werden, wenn für den aktuellen Markt alle Pflichtbedingungen erfüllt sind:

1. `market_status = active`
2. Anbieter-/Lizenzstatus für den Markt aktuell verifiziert
3. erforderliche Werbe-/Affiliate-Freigabe dokumentiert
4. keine abgelaufene oder ungeklärte Evidenz

Schlägt ein Gate fehl, ist das Ergebnis `ineligible` und erhält keinen Score.

## Score v1
Der Score wird auf die tatsächlich gewählten Nutzerkriterien normalisiert. Nicht gewählte Kriterien beeinflussen den Score nicht.

| Kriterium | Gewicht |
|---|---:|
| gesuchtes Spiel verfügbar | 45 |
| gewünschte Zahlungsart verfügbar | 20 |
| gewünschte Maximal-/Mindesteinzahlung erfüllt | 15 |
| gewünschte Breite der Spieleauswahl erfüllt | 10 |
| verifizierte Datenfrische innerhalb definierter Frist | 10 |

Berechnung:

`score = round(100 * erfüllte_gewichtspunkte / relevante_gewichtspunkte)`

Die Datenfrische zählt als Vertrauens-/Datenkriterium immer mit, sobald echte Ergebnisse live gehen. Im Bootstrap mit Demo-Daten wird sie nur als Demo-Komponente angezeigt.

## Ranking-Regeln
- CPA, Revenue Share, Hybridvergütung oder EPC sind **niemals** Score-Faktoren.
- Bei gleichem Score entscheidet zuerst höhere Datenfrische, danach alphabetische Reihenfolge; keine Provision.
- Ein nicht erfülltes vom Nutzer gewähltes Muss-Kriterium kann später als Hard-Fail konfiguriert werden. In v1 sind die Kriterien noch Präferenzen.
- Jeder Score muss in der UI als Komponentenliste erklärbar sein.
- Keine Formulierungen wie „beste Gewinnchance“, „sicherster Gewinn“ oder andere Aussagen über individuelle Gewinnerwartung.

## Nächster Schritt
Nach verifizierter Anbieterbasis werden Demo-Provider durch Datensätze aus dem eigenen Backend ersetzt. Dann werden Match-Komponenten aus Spielverfügbarkeit, Zahlungsarten, Einzahlungslimits und Datenfrische berechnet.