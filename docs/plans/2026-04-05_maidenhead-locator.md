# Maidenhead Locator Support

## Context
QSO-Einträge und Stationseinstellungen haben derzeit keine Locator-Felder. Callsign-Lookups (QRZ/HamQTH) liefern bereits einen `locator`-Wert, der aber weder angezeigt noch gespeichert wird. Ziel: Beide Seiten (eigene Station + Kontakt) sollen Maidenhead-Locator nutzen, Entfernung live anzeigen, und alles persistieren.

## Annahmen
- 4-stellige (JN47) und 6-stellige (JN47ao) Locator werden akzeptiert
- MY_GRIDSQUARE im ADIF-Export nutzt den eigenen Locator aus den Settings (nicht pro QSO)
- Entfernung/Bearing werden live berechnet, nicht in der DB gespeichert
- Keine Kartenansicht in dieser Iteration
- Dexie v4 braucht kein explizites Upgrade für nicht-indizierte Felder

## Option A — Minimal/Schnell (S, ~2–3h)

**Ziel**: Schnellster Weg zu funktionierenden Locator-Feldern mit Entfernungsanzeige.

**Vorgehen**:
1. `src/utils/locator.ts` — Eigene pure Functions: Validierung, Maidenhead→LatLon, Haversine-Distanz
2. `src/types/qso.ts` — `locator?: string` zum QSO-Interface
3. `src/types/settings.ts` + `src/stores/settingsStore.ts` — `ownLocator` Setting
4. `src/stores/formDraftStore.ts` — `locator` zum Draft
5. `src/db/database.ts` — Version-Bump (Doku-Zweck)
6. `src/components/qso/QsoForm.vue` — Inline `<input>` für Locator, computed Distance-Text, Auto-Fill aus Callsign-Lookup
7. `src/views/SettingsView.vue` — Eigenen Locator eingeben
8. Export/Import: ADIF (`GRIDSQUARE`/`MY_GRIDSQUARE`), CSV-Header erweitern
9. i18n: `de.json`/`en.json` Schlüssel ergänzen
10. `tests/unit/utils/locator.test.ts`

**Vorteile**: Wenige Änderungen, kein neues Component, schnell fertig
**Nachteile**: Validierungs-/Formatierungslogik inline in QsoForm (nicht wiederverwendbar), kein Bearing, schlichte Darstellung

## Option B — Vollständig/Skalierbar (M, ~4–5h) ← Gewählt

**Ziel**: Wiederverwendbare LocatorInput-Komponente mit Validierung, Entfernungs-Badge und Bearing-Anzeige.

**Vorgehen**:
1. `src/utils/locator.ts` — Wie Option A, zusätzlich `calculateBearing()` und `bearingToCompass()`
2. Types/Stores/DB — Identisch zu Option A (Schritte 2–5)
3. **Neu: `src/components/common/LocatorInput.vue`** — Wiederverwendbare Komponente:
   - Props: `modelValue`, `ownLocator`, `showDistance`, `label`, `id`
   - Auto-Uppercase, maxlength=6, Echtzeit-Validierung (grün/rot Border)
   - Distance+Bearing Badge: `"1 234 km · 42° NE"`
4. `src/components/qso/QsoForm.vue` — Nutzt `<LocatorInput>` mit `showDistance=true`, Auto-Fill aus Lookup
5. `src/views/SettingsView.vue` — Nutzt `<LocatorInput>` mit `showDistance=false`
6. Export/Import + i18n — Wie Option A
7. Optional: `src/components/qso/QsoTable.vue` — Locator-Spalte in History
8. Tests: `locator.test.ts` + Komponenten-Test für LocatorInput

**Vorteile**: Wiederverwendbar, polierte UX, Bearing nützlich für Richtantennen, saubere Trennung
**Nachteile**: Ein zusätzliches Component-File, etwas mehr Code

## Kritische Dateien

| Aktion | Datei |
|--------|-------|
| Neu | `src/utils/locator.ts` |
| Neu | `src/components/common/LocatorInput.vue` |
| Neu | `tests/unit/utils/locator.test.ts` |
| Ändern | `src/types/qso.ts` — `locator?: string` |
| Ändern | `src/types/settings.ts` — `ownLocator` in AppSettings |
| Ändern | `src/stores/settingsStore.ts` — ownLocator ref + load/set |
| Ändern | `src/stores/formDraftStore.ts` — locator im Draft |
| Ändern | `src/db/database.ts` — Version 2 |
| Ändern | `src/components/qso/QsoForm.vue` — Locator-Feld + Auto-Fill |
| Ändern | `src/views/SettingsView.vue` — Eigener Locator |
| Ändern | `src/services/export/adifStrategy.ts` — GRIDSQUARE |
| Ändern | `src/services/export/csvStrategy.ts` — Header |
| Ändern | `src/services/import/adifImporter.ts` — gridsquare Mapping |
| Ändern | `src/services/import/csvImporter.ts` — locator Mapping |
| Ändern | `src/i18n/locales/de.json`, `en.json` |

## Verifikation
1. `npm run test` — Alle bestehenden + neue Unit-Tests grün
2. Dev-Server starten, Settings öffnen → eigenen Locator eingeben (z.B. JN47ao)
3. Neues QSO anlegen → Callsign mit bekanntem Locator eingeben → Auto-Fill prüfen
4. Locator manuell eingeben → Entfernung wird live angezeigt
5. QSO speichern → in History prüfen, dass Locator gespeichert ist
6. ADIF-Export → GRIDSQUARE und MY_GRIDSQUARE Felder vorhanden
7. ADIF-Import mit GRIDSQUARE → Locator wird korrekt importiert
