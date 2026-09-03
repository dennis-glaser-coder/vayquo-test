# SPIELMATCH SEO v1

## Ziel
Suchintention zuerst, Affiliate erst danach. Indexierbare Seiten entstehen nur aus verifizierten Daten und dürfen keine Demo-/unbestätigten Anbieterbehauptungen veröffentlichen.

## DE URL-Struktur
- `/de/spiele/` – verifizierter Spieleindex
- `/de/spiele/{spiel-slug}/` – Spielprofil + verifizierte legale Verfügbarkeit
- `/de/anbieter/` – Anbieterindex, nur Anbieter mit aktuell verifiziertem DE-Status
- `/de/anbieter/{anbieter-slug}/` – Anbieterprofil mit Quellen-/Prüfdatum
- `/de/hersteller/{provider-slug}/` – Spiele eines Herstellers
- `/de/finden/` – Finder, primär UX-Seite
- `/de/spielerschutz/` – 18+, Hilfen, Limits, Sperrsysteme

## Harte Indexierungsregeln
1. Keine indexierbare Anbieter- oder Spielseite ohne `verification_status=verified` und `verified_at`.
2. Spielseiten nennen einen Anbieter nur, wenn die konkrete Spiel→Anbieter-Zuordnung verifiziert ist.
3. Abgelaufene/ungeklärte Daten werden aus Empfehlungen entfernt; Seite kann als Informationsseite bestehen bleiben, aber ohne Verfügbarkeitsclaim.
4. Affiliate-Vergütung beeinflusst weder Rank noch SEO-Reihenfolge.
5. Filter-/Parameterkombinationen (`?payment=`, `?deposit=`, Finder-State) erhalten canonical auf die stabile Basisseite und werden nicht als eigene SEO-Landingpages erzeugt.
6. Keine massenhaft generierten Thin-Pages für Kombinationen ohne eigenständigen Nutzwert.

## DE Terminologie-Gate
Die deutsche Oberfläche verwendet neutrale Begriffe wie `Anbieter`, `Spielanbieter`, `virtuelle Automatenspiele`, `Spiel`, `Spiel finden` und `Anbieter vergleichen`. Markt-/produktbezogene Werbeterminologie wird nicht global aus anderen Ländern übernommen. Begriffe, die regulatorisch für konkrete Glücksspielarten eingeschränkt sein können, werden erst nach dokumentierter Rechtsprüfung in kommerziellen DE-Templates freigegeben.

## Seitentemplate Spiel
- H1: `{Spielname}: legal verfügbare Anbieter in Deutschland`
- Hersteller
- Spieltyp / technische Merkmale nur wenn belegt
- `Zuletzt geprüft: DD.MM.YYYY`
- verifizierte Anbieter-Matches
- Erklärung, warum Anbieter erscheinen
- Quellen/Methodik
- 18+ / Spielerschutz

Wichtig: `legal verfügbar` darf nur gerendert werden, wenn sowohl Anbieterstatus als auch Spiel→Anbieter-Verfügbarkeit aktuell verifiziert sind. Sonst neutrale H1 `{Spielname}: Anbieter und Verfügbarkeit prüfen`.

## Seitentemplate Anbieter
- H1: `{Anbietername}: Spiele & geprüfte Informationen`
- DE-Status + Prüfdatum
- verifizierte Spieleauswahl
- Zahlarten/Mindesteinzahlung nur mit Quelle und Prüfdatum
- Match-Kriterien
- Affiliate-Hinweis, falls kommerzieller Link vorhanden
- Quellen/Methodik
- 18+ / Spielerschutz

## Technische Metadaten
- eindeutiger `<title>` und `description`
- self-canonical für stabile Detailseiten
- BreadcrumbList auf Detailseiten
- ItemList nur für tatsächlich gerenderte, verifizierte Listen
- `dateModified` = letztes inhaltliches Verifikationsdatum, nicht bloß Deployment-Zeitpunkt
- keine Review-/Rating-Schema-Werte ohne belastbare eigene Datenbasis

## Internationalisierung
Jeder Markt erhält eigene Pfade (`/de/`, später z. B. `/at/`) und eigene Legal-/Terminologie-/Verfügbarkeitsregeln. Keine automatische Übernahme eines Anbieterstatus zwischen Ländern. `hreflang` erst aktivieren, wenn echte lokalisierte Marktseiten existieren.
