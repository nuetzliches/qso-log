# funk-log: PWA Amateurfunk-Logbuch -- Design Spec

## Context

Amateurfunker brauchen ein digitales Logbuch, um ihre Funkkontakte (QSOs) zu erfassen und zu verwalten. Bestehende Lösungen sind oft Desktop-only, proprietär oder erfordern permanente Internetverbindung. funk-log ist eine offline-first PWA, die nach einmaliger Installation vollständig ohne Internet funktioniert, leicht bedienbar und barrierefrei ist, und optional über eine self-hosted API synchronisiert werden kann.

**Lizenz:** MIT (Open Source)

---

## Tech Stack

| Komponente | Technologie |
|---|---|
| Framework | Vue 3 + TypeScript |
| Build | Vite 5+ |
| CSS | Tailwind CSS 4 + HeadlessUI |
| State Management | Pinia |
| Lokale DB | Dexie.js v4 (IndexedDB) |
| PDF | jsPDF + jspdf-autotable |
| ADIF Import | adif-parser-ts |
| i18n | vue-i18n v10+ (DE/EN) |
| PWA | vite-plugin-pwa (Workbox generateSW) |
| Routing | vue-router v4 |
| Tests | Vitest + Vue Testing Library + Playwright |

---

## Architektur

```
Vue-Komponenten
      |
      v
Pinia Stores (reaktiver State, Business-Logik)
      |
      v
Repositories (Query/Mutation-API, Sync-Metadaten via Dexie-Hooks)
      |
      v
Dexie DB (IndexedDB)
```

**Warum diese Schichtung:**
- Pinia Stores: reaktiver Cache, DevTools, Business-Logik (Auto-Increment, Defaults)
- Repositories: Datenbank-Zugriff, automatische Sync-Metadaten, Compound-Queries
- Dexie-Hooks: setzen `uuid`, `_lastModified`, `_syncStatus` automatisch bei jedem Schreibvorgang

---

## Datenmodell

### QSO

```ts
interface QSO {
  id?: number;                              // Dexie auto-increment (lokal)
  uuid: string;                             // Sync-Identifier (crypto.randomUUID)
  sequenceNumber: number;                   // Fortlaufende Nummer (sichtbar)
  date: string;                             // ISO 8601 UTC
  callsign: string;
  mode: string;
  power: string;
  frequency: string;
  band: string;                             // Abgeleitet aus Frequenz oder manuell
  rstSent: string;
  rstReceived: string;
  remarks: string;
  qslSent: 'yes' | 'no' | 'requested';
  qslReceived: 'yes' | 'no' | 'requested';
  operatorId: number;
  _lastModified: number;
  _syncStatus: 'synced' | 'pending' | 'conflict';
}
```

### Operator

```ts
interface Operator {
  id?: number;
  uuid: string;
  callsign: string;
  name: string;
}
```

### Settings

```ts
interface Setting {
  key: string;       // z.B. 'locale', 'theme', 'ownCallsign', 'qrzApiKey'
  value: unknown;
}
```

### Dexie-Schema

```ts
qsos: '++id, uuid, sequenceNumber, date, callsign, mode, band, operatorId, _syncStatus, [date+operatorId], [band+mode]'
operators: '++id, uuid, callsign'
settings: 'key'
```

---

## Seitenstruktur

### 4 Routen

| Route | Seite | Beschreibung |
|---|---|---|
| `/` | QSO-Eingabe | Hauptformular zur Erfassung neuer Funkkontakte |
| `/history` | QSO-Historie | Tabellenansicht mit Filtern, Sortierung, Paginierung |
| `/settings` | Einstellungen | Sprache, Theme, API-Keys, eigenes Rufzeichen |
| `/operators` | Operator-Verwaltung | Operatoren-Liste anlegen, bearbeiten, löschen |

### Navigation

- **Mobile:** Untere Tab-Bar mit 4 Icons
- **Desktop:** Sidebar-Navigation

---

## QSO-Eingabe (Hauptseite)

### Formularfelder

| Feld | Typ | Verhalten |
|---|---|---|
| Nummer | Auto-generiert | Nächste fortlaufende Nummer, read-only angezeigt |
| Datum/Uhrzeit | DateTime-Picker | Automatisch UTC-Jetzt befüllt, editierbar |
| Rufzeichen | Text-Input | Uppercase-Erzwingung, Callsign-Lookup-Trigger |
| Mode | Combobox (HeadlessUI) | Vordefiniert: CW, SSB, FM, AM, FT8, FT4, RTTY, PSK31, DSTAR, DMR, C4FM + Freitext |
| Power | Text-Input | z.B. "100W" |
| Frequenz | Combobox (HeadlessUI) | Vordefiniert nach Bändern (z.B. 14.200, 7.100) + Freitext, Band wird automatisch abgeleitet |
| RST gesendet | Text-Input | Standard-Vorauswahl: "59" (Phone) / "599" (CW) je nach Mode |
| RST empfangen | Text-Input | Standard-Vorauswahl wie gesendet |
| Bemerkung | Textarea | Optional |
| QSL gesendet | Select | Ja / Nein / Angefordert |
| QSL empfangen | Select | Ja / Nein / Angefordert |
| Operator | Dropdown | Nur sichtbar wenn >1 Operator hinterlegt, merkt sich letzte Auswahl |

### Smart-Defaults

Nach dem Speichern eines QSOs:
- Formular bleibt offen (kein Seitenwechsel)
- Datum/Uhrzeit wird aktualisiert auf "jetzt"
- Mode, Power, Frequenz behalten den letzten Wert
- Rufzeichen und Bemerkung werden geleert
- Operator behält die letzte Auswahl

### Callsign-Lookup

Wenn online und API-Key konfiguriert: Bei Eingabe/Verlassen des Rufzeichen-Felds wird automatisch ein Lookup gestartet (QRZ.com oder HamQTH). Ergebnis wird als Info-Banner unter dem Feld angezeigt (Name, QTH, Locator). Kein Lookup wenn offline -- kein Fehler, einfach kein Banner.

---

## QSO-Historie

### Tabellenansicht

Alle QSO-Felder als Spalten. Sortierbar per Klick auf Spaltenköpfe (Standard: Datum absteigend). Virtualisierung oder Paginierung für Performance bei vielen Einträgen.

### Filter-Leiste

| Filter | Typ |
|---|---|
| Rufzeichen | Textsuche (enthält) |
| Datumsbereich | Von-Bis Datumspicker |
| Mode | Dropdown (Multi-Select) |
| Band | Dropdown (Multi-Select) |
| Operator | Dropdown |

Filter werden als Dexie-Compound-Query ausgeführt. URL-Parameter speichern den Filterzustand für Bookmarkbarkeit.

### Aktionen

- **Export:** Button öffnet Dialog mit Formatauswahl (CSV, JSON, ADIF) -- exportiert aktuelle gefilterte Auswahl
- **Import:** Button + Drag-and-Drop-Zone, Vorschau mit Validierung vor Import
- **PDF-Report:** Button öffnet Zeitraum-Auswahl, generiert PDF mit den gefilterten QSOs
- **QSO bearbeiten:** Klick auf Zeile öffnet Bearbeitungsmodus
- **QSO löschen:** Mit Bestätigungsdialog

---

## Operator-Verwaltung

- Liste aller Operatoren (Rufzeichen + Name)
- Hinzufügen, Bearbeiten, Löschen (mit Bestätigung)
- Wenn nur 1 Operator existiert: Operator-Dropdown im QSO-Formular wird ausgeblendet
- Wenn >1 Operator: Dropdown erscheint, letzte Auswahl wird persistiert

---

## Einstellungen

| Einstellung | Beschreibung |
|---|---|
| Sprache | Deutsch / English |
| Theme | Hell / Dunkel / System |
| Eigenes Rufzeichen | Wird im PDF-Header und als Station-Callsign verwendet |
| QRZ.com API-Key | Optional, für Callsign-Lookup |
| HamQTH Credentials | Optional, für Callsign-Lookup |

---

## Export/Import

### Strategy-Pattern

```ts
interface ExportStrategy {
  export(qsos: QSO[], options: ExportOptions): string | Blob;
  mimeType: string;
  fileExtension: string;
}

interface ImportStrategy {
  parse(content: string): QSO[];
  validate(qsos: QSO[]): ValidationResult;
}
```

### Formate

| Format | Import | Export | Details |
|---|---|---|---|
| CSV | Ja | Ja | Standard-CSV mit Header-Zeile |
| JSON | Ja | Ja | Array von QSO-Objekten |
| ADIF | Ja | Ja | Import via `adif-parser-ts`, Export handgeschrieben (~100 Zeilen) |

### Import-Flow

1. Datei auswählen oder per Drag-and-Drop
2. Format wird automatisch erkannt (Endung + Inhalt)
3. Vorschau: Tabelle mit erkannten QSOs, Validierungsstatus pro Zeile
4. Bestätigung: "X QSOs importieren"
5. Import mit Duplikat-Erkennung (basierend auf Datum + Rufzeichen + Band)

---

## PDF-Reports

- Zeitraum wählbar (Von-Bis)
- Zusätzlich aktive Filter der Historie anwendbar
- Layout: Station-Header (eigenes Rufzeichen, Zeitraum), QSO-Tabelle, Zusammenfassung im Footer (Anzahl QSOs, Bänder, Modi)
- Generiert via jsPDF + jspdf-autotable
- Vollständig offline-fähig

---

## Callsign-Lookup

### Provider-Pattern

```ts
interface CallsignLookupProvider {
  name: string;
  lookup(callsign: string): Promise<CallsignInfo | null>;
  isConfigured(): boolean;
}
```

Provider: QRZ.com, HamQTH. Facade probiert konfigurierte Provider der Reihe nach, gibt `null` zurück wenn offline oder nicht konfiguriert.

---

## PWA & Offline

- `vite-plugin-pwa` mit `generateSW` für automatisches Precaching
- Alle statischen Assets werden vom Service Worker gecached
- Alle Daten in IndexedDB -- kein Netzwerk nötig nach Installation
- Online-Status wird per `navigator.onLine` / `useOnlineStatus` composable getrackt
- Features die Netzwerk brauchen (Callsign-Lookup) degradieren graceful

---

## Dark/Light Mode

- Tailwind `class`-Strategie (`.dark` Klasse auf `<html>`)
- Default: System-Präferenz (via `prefers-color-scheme`)
- Manueller Toggle überschreibt und wird in IndexedDB (Settings) persistiert
- Drei Optionen: Hell / Dunkel / System

---

## Internationalisierung (i18n)

- `vue-i18n` v10+ mit Composition API
- Startsprachen: Deutsch (DE), Englisch (EN)
- Locale-Dateien in `src/i18n/locales/de.json` und `en.json`
- Lazy-loading der Locale-Dateien
- Sprachumschaltung in Einstellungen, Auswahl wird persistiert

---

## Accessibility (WCAG 2.1 AA)

- HeadlessUI liefert ARIA-Attribute für Comboboxen, Dialoge, Selects
- Vollständige Keyboard-Navigation (Tab, Enter, Escape, Pfeiltasten)
- Sichtbare Focus-Indikatoren (Focus-Ring)
- Ausreichende Farbkontraste in beiden Themes (min. 4.5:1)
- Screen-Reader-Labels für alle Formularfelder (`aria-label`, `aria-describedby`)
- Skip-Links zur Hauptnavigation
- Statusmeldungen für Screen-Reader (z.B. "QSO gespeichert") via `aria-live`

---

## Sync-Vorbereitung (nicht implementiert)

Die Architektur bereitet Synchronisation vor, ohne sie zu implementieren:

1. **UUID auf jedem Record** -- kanonischer Identifier für Sync
2. **`_syncStatus` Index** -- effiziente "alle ausstehenden Records" Query
3. **`_lastModified` Timestamp** -- ermöglicht Last-Write-Wins Konfliktauflösung
4. **Dexie-Hooks** -- Sync-Metadaten werden automatisch gesetzt, können nicht umgangen werden
5. **`sync/syncTypes.ts`** -- nur Interface-Definitionen: `SyncService`, `SyncResult`, `ConflictResolutionStrategy`

Bei späterer Implementierung ändern sich nur Repositories und ein neuer SyncService. Stores und Komponenten bleiben unberührt.

---

## Projektstruktur

```
funk-log/
  public/
    icons/                          -- PWA-Icons
  src/
    App.vue
    main.ts
    router/
      index.ts                      -- 4 Routen
    stores/
      qsoStore.ts
      operatorStore.ts
      settingsStore.ts
    db/
      database.ts                   -- Dexie DB mit Hooks und Schema
      repositories/
        qsoRepository.ts
        operatorRepository.ts
    views/
      QsoEntryView.vue
      QsoHistoryView.vue
      SettingsView.vue
      OperatorManagementView.vue
    components/
      qso/
        QsoForm.vue
        QsoTable.vue
        QsoFilters.vue
        ModeSelect.vue              -- HeadlessUI Combobox: vordefiniert + Freitext
        BandSelect.vue              -- HeadlessUI Combobox: vordefiniert + Freitext
      operators/
        OperatorSelect.vue          -- Nur sichtbar wenn >1 Operator
        OperatorList.vue
      common/
        AppLayout.vue
        ThemeToggle.vue
        LocaleSwitch.vue
        ConfirmDialog.vue
        FileDropZone.vue            -- Drag-and-Drop Import
    composables/
      useCallsignLookup.ts
      useExportImport.ts
      usePdfReport.ts
      useOnlineStatus.ts
      useNextSequenceNumber.ts
    services/
      export/
        exportService.ts            -- Strategy-Facade
        csvStrategy.ts
        jsonStrategy.ts
        adifStrategy.ts
      import/
        importService.ts
        csvImporter.ts
        jsonImporter.ts
        adifImporter.ts             -- Wraps adif-parser-ts
      pdf/
        reportGenerator.ts          -- jsPDF + autotable
      callsign/
        lookupService.ts            -- Provider-Facade
        qrzProvider.ts
        hamqthProvider.ts
      sync/
        syncTypes.ts                -- Nur Interfaces (Zukunft)
    types/
      qso.ts
      operator.ts
      settings.ts
      adif.ts
      export.ts
    i18n/
      index.ts
      locales/
        de.json
        en.json
    utils/
      frequency.ts                  -- Frequenz-zu-Band Mapping
      rst.ts                        -- RST-Validierung
      dateTime.ts                   -- UTC-Formatierung
    assets/
      styles/
        main.css                    -- Tailwind-Direktiven
  tests/
    unit/
      stores/
      services/
      composables/
    e2e/
      qsoEntry.spec.ts
      history.spec.ts
      exportImport.spec.ts
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

---

## Verifikation

### Manuelle Tests
1. QSO erfassen, Browser schließen, wieder öffnen -- QSO muss in Historie sichtbar sein
2. PWA installieren, Netzwerk trennen -- App muss vollständig funktionieren
3. 100 QSOs importieren (ADIF), nach verschiedenen Kriterien filtern
4. PDF-Report für Zeitraum generieren, prüfen ob alle gefilterten QSOs enthalten
5. Export als ADIF, Import in anderes Logbuch-Programm (z.B. WSJT-X Log)
6. Operator hinzufügen -- Dropdown erscheint im QSO-Formular
7. Theme wechseln, Sprache wechseln -- persistiert nach Reload
8. Tab/Enter-Navigation durch das gesamte QSO-Formular ohne Maus

### Automatisierte Tests
- **Unit:** Dexie-Repository Queries, Export/Import-Strategien, Frequenz-zu-Band Mapping, RST-Validierung
- **E2E (Playwright):** QSO-Erfassung, Historie-Filter, Export/Import Roundtrip, PDF-Download
