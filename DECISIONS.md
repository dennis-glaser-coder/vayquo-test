# DECISIONS

## D-001 – Isolation
`main` bleibt VAYQUO. SPIELMATCH wird auf `spielmatch-bootstrap` aufgebaut und später in ein eigenes Repository überführt.

## D-002 – Intent-first
Primärer Einstieg ist Spiel/Hersteller/Zahlungsart statt generischer Top-10-Liste.

## D-003 – Ranking-Integrität
Affiliate-CPA ist kein Rankingfaktor. Nutzer-Match und Monetarisierung sind getrennte Systeme.

## D-004 – GEO/Legal by design
Anbieterfreigabe ist immer market-spezifisch. Ein Anbieter kann in DE blockiert und in einem anderen verifizierten Markt aktiv sein.

## D-005 – Keine aktiven Links im Bootstrap
Der frühe Prototyp enthält keine aktiven Glücksspiel-Affiliate-Links. Erst nach Markt-, Partner- und Werberegelprüfung werden Clickouts aktiviert.

## D-006 – Conversion ohne Dark Patterns
Optimierung über Relevanz, geringe Reibung, klare Vergleiche, Intent-Personalisierung und Tests; nicht über künstliche Knappheit, Verlustjagd oder irreführende Gewinnversprechen.

## D-007 – Erklärbarer Match-Score
Der Match-Score wird ausschließlich aus vom Nutzer gewählten Kriterien und Datenvertrauen berechnet. Nicht gewählte Kriterien werden aus dem Nenner entfernt. Affiliate-Vergütung bleibt vollständig außerhalb des Rankings. Vor jeder Wertung greifen harte Markt-/Lizenz-/Freigabe-Gates. Details stehen in `MATCHING.md`.

## D-008 – Anbieter-SEO nur mit vollständiger Evidenz
Eine DE-Anbieterseite darf nur indexiert und als geprüft bezeichnet werden, wenn Markt, Anbieterstatus und Lizenzstatus verifiziert sind, ein dokumentierter HTTPS-Primärquellenbeleg vorliegt und alle auf der Seite genannten Spiele eine separat verifizierte Spiel→Anbieter-Verfügbarkeit mit Prüfdatum besitzen. Fehlt eines dieser Elemente, wird die Seite automatisch `noindex,follow` und neutral formuliert. Affiliate-Konditionen sind weder SEO-Gate noch Rankingfaktor.

## D-009 – Öffentliche Affiliate-Kondition ≠ Freigabe
Ein öffentlich sichtbares Affiliate-Programm oder eine öffentlich genannte CPA-Vergütung darf in SPIELMATCH nur als recherchierte Kondition gespeichert werden. Aktivierbare Trackinglinks benötigen zusätzlich mindestens: verifizierten Markt-/Lizenzstatus, Annahme unseres konkreten Mediums durch den Partner, dokumentierte aktuelle Konditionen und `legal_review_status = approved`. Bis dahin bleibt der Offer technisch nicht aktivierbar. Jokerstar ist der erste nach diesem Muster erfasste Anbieter (Primärquellenprüfung 04.09.2026).

## D-010 – CPA-Staffeln nicht auf einen Einzelwert reduzieren
Wenn ein Partner öffentlich mehrere CPA-Staffeln oder parallel CPA- und Revenue-Share-Modelle nennt, speichert SPIELMATCH diese Struktur vollständig statt einen vermeintlichen Standard-CPA zu erfinden. bet-at-home ist der erste Seed-Datensatz mit `public_cpa_tiers`; die aktive Vergütung bleibt bis zur konkreten Partner- und Rechtsfreigabe `pending`.

## D-011 – Öffentliche CPA-Spannen strukturiert speichern
Wenn Primärquellen nur eine Unter-/Obergrenze statt eines festen CPA belegen, speichert SPIELMATCH die Werte als `public_cpa_range_eur` und nicht als vermeintlichen Standardbetrag. BingBong ist der erste Datensatz nach diesem Muster (`min: 50`, `max: 75`). Der Validator prüft positive Werte sowie `min <= max`; die Spanne ist reine Research-Metadaten und keine Freigabe oder Rankingvariable.

## D-012 – Veraltete Vertragsquelle blockiert Freigabe
Wenn eine öffentlich verlinkte Affiliate-Vertragsquelle erkennbar nicht mehr zur aktuellen Betreiberlage passt, bleibt sie als Research-Evidenz gespeichert, darf aber keine Aktivierung tragen. `contract_status = needs_refresh...` blockiert deshalb technisch `legal_review_status = approved`, selbst wenn sonstige Approval-Evidenz vorhanden wäre. SlotMagie ist der erste Anwendungsfall: aktuelle GGL-/Markenquellen nennen Solis Ortus Service Limited, während die öffentlich verlinkten SolisPartner-AGB in der Markenliste noch The Mill Adventure Ltd. nennen. Für Deutschland dokumentieren diese AGB zugleich CPA als mögliches Modell und schließen Revenue Share aus; die konkrete CPA-Höhe bleibt individuell und wird nicht erfunden.

## D-013 – Partnerverfügbarkeit ist ein eigenes Gate
Lizenzstatus, rechtliche Freigabe und kommerzielle Partnerverfügbarkeit sind getrennte Zustände. Ein in DE erlaubter Anbieter darf nicht als akquirierbarer oder live ausgespielter Affiliate-Partner erscheinen, wenn `acquisition_status` nicht `open` ist. Der Validator akzeptiert die Zustände `open`, `invite_only`, `registrations_suspended`, `closed` und `unknown`; ein aktives Offer benötigt zusätzlich `legal_review_status = approved`, Approval-Evidenz und einen aktuellen Vertrag. Tipico Games ist der erste Anwendungsfall: GGL-erlaubtes DE-Angebot, während Tipico Affiliates am 04.09.2026 weiterhin keine Neuregistrierungen annimmt.

## D-014 – Kommerzieller Status gehört in den Provider-Seed
Ein recherchierter Affiliate-Status darf nicht nur in Doku oder Backlog stehen, wenn er die technische Live-Fähigkeit beeinflusst. Verifizierte Zustände wie `registrations_suspended` werden deshalb direkt im marktbezogenen Provider-Seed gespeichert und mit der Primärquelle verknüpft. Für Tipico Games ist zusätzlich `active = false` gesetzt; das Eligibility-Gate muss dadurch unabhängig von UI- oder Rankinglogik `false` liefern.

## D-015 – Marke, Produktvertikale und lizenzierte Domain getrennt modellieren
Eine Marke darf nicht allein über ihren Marketingnamen oder eine einzelne Domain einer Glücksspielart zugeordnet werden. SPIELMATCH speichert Recherche daher markt- und produktbezogen und kann mehrere `licensed_domains` derselben Vertikale führen. MERKUR ist der erste konkrete Anwendungsfall: Die GGL führt unter Merkur Bets Malta Limited `merkurslots.de` und `merkurbets.de` für länderübergreifende virtuelle Automatenspiele, daneben aber auch Sportwetten-Domains bzw. eine separate Online-Casino-Erlaubnis für Schleswig-Holstein. Das MERKUR-SLOTS-DE-Research-Fixture setzt deshalb `market = DE`, `product = virtual_slots` und darf weder mit MERKUR BETS Sportwetten noch mit Schleswig-Holstein-Online-Casinospielen zusammengeführt werden.

## D-016 – Fehlende öffentliche Kondition bleibt explizit unbekannt
Wenn Betreiber- und Affiliate-Primärquellen die Zusammenarbeit belegen, aber keinen aktuellen marktbezogenen CPA, Cookie-Zeitraum oder andere monetäre Konditionen veröffentlichen, speichert SPIELMATCH diese Werte als `null` statt Drittanbieterwerte zu übernehmen. DrückGlück ist der erste Anwendungsfall nach dieser Regel: Betreiber/Lizenz und EGO-Affiliateprogramm sind aktuell verifiziert, die konkrete DE-Vergütung bleibt jedoch unbekannt. Der Research-Datensatz bleibt deshalb `active = false` und `legal_review_status = pending`.

## D-017 – Anbietermeilenstein abgeschlossen, Fokus wechselt auf Verfügbarkeit
Nach zehn DE-Anbietern mit aktuellem Betreiber-/Lizenz-/Affiliate-Primärquellenstatus ist zusätzlicher Anbieter-Research nicht mehr der Engpass des MVP. Nächster Schwerpunkt ist die verifizierte Spiel→Anbieter-Verfügbarkeit. Löwen Play Online schließt den ersten 10er-Satz ab: GGL-Whitelist und eigenes Affiliate-Programm sind verifiziert, CPA-Höhe und Cookie-Dauer bleiben mangels öffentlicher Primärquelle `null`, `active = false`, `legal_review_status = pending`. Neue Anbieter kommen erst hinzu, wenn sie für Nutzerabdeckung oder konkrete Affiliate-Akquise einen messbaren Mehrwert liefern.

## D-018 – Spielverfügbarkeit braucht Primärquellen-Evidenz pro Anbieter und Markt
Ein Spielname in einem Provider-Katalog reicht nicht mehr als verifizierte Verfügbarkeit. Für Autocomplete, Match-Ergebnisse und indexierbare SEO-Seiten wird jede Spiel→Anbieter→Markt-Beziehung separat mit `availability_status = verified`, Prüfdatum und HTTPS-Primärquelle gespeichert. Der erste Seed verwendet ausschließlich aktuelle Betreiber-Spielseiten: Book of Dead und Ramses Book Deluxe bei NOVOLINE sowie Big Bass Bonanza und Big Bass Splash bei DrückGlück. Pending-, Drittanbieter- oder marktübergreifend übertragene Evidenz darf das Verification-Gate nicht passieren.

## D-019 – Autocomplete darf nur den verifizierten Spielkatalog sehen
Die sichtbare Spielsuche soll nicht länger eine manuell gepflegte Demo-Liste als Wahrheitsquelle verwenden. Dafür wird aus `games.seed.json` ein deduplizierter Katalog erzeugt, der ausschließlich Datensätze mit `market = DE`, `product = virtual_slots`, `availability_status = verified`, `evidence_type = operator_game_page` und HTTPS-Primärquelle akzeptiert. Mehrere verifizierte Anbieter desselben exakten Spiel-Slugs werden aggregiert; unterschiedliche Varianten bleiben unterschiedliche Slugs. Pending-, Fremdmarkt- und Aggregator-Evidenz wird bereits vor der UI ausgeschlossen. Die Catalog- und Suchlogik ist in `spielmatch-mvp/verified-games.mjs` isoliert und automatisiert getestet (04.09.2026).

## D-020 – Katalogbreite vor UI-Umschaltung gezielt erhöhen
Die sichtbare Demo-Liste wird nicht durch einen zu kleinen verifizierten Katalog ersetzt, wenn dadurch die Produkterfahrung künstlich schlechter würde. Vor der Verdrahtung des Autocomplete werden deshalb zuerst die wichtigsten bereits sichtbaren Suchintents mit echten DE-Betreiberbelegen abgedeckt. Book of Ra und Book of Ra Deluxe wurden am 04.09.2026 über eigene aktuelle SlotMagie-Spielseiten ergänzt; beide bleiben als getrennte exakte Varianten im Seed. Der Seed umfasst damit 10 verifizierte DE-Spiel→Anbieter-Beziehungen und passiert `validate-games.mjs` ohne Fehler. Diese Zwischenstufe ändert keine Ranking-, Affiliate- oder Rechtsfreigaben.
