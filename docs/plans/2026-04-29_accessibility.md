# Plan: Barrierefreiheit (WCAG 2.1 AA / BITV / EN 301 549)

## Context

QSOlog ist eine Vue 3 PWA, die offline läuft und vollständig im Browser arbeitet. Das Audit vom 2026-04-29 hat ergeben, dass die App eine solide semantische Grundlage hat (Skip-Link, Landmarks, Form-Labels, Headlessui), aber für eine WCAG 2.1 AA / BITV-konforme Auslieferung mehrere kritische und schwerwiegende Lücken zu schließen sind. Geschätzte aktuelle AA-Konformität: **~70 %**.

**Datum:** 2026-04-29
**Status:** Phasen 1–3 implementiert (Befunde A1–A16 abgeschlossen). Offen: Lighthouse-CI-Integration, manueller Screenreader-Smoke-Test, Release v0.11.0.
**Speicherort:** `docs/plans/2026-04-29_accessibility.md`
**Zielkonformität:** WCAG 2.1 Level AA (Pflicht für BITV/EN 301 549)

### Status pro Befund (Stand 2026-04-29)

| # | Status | Commit |
|---|--------|--------|
| A1 | abgeschlossen | Phase 1 (`useDocumentLang`) |
| A2 | abgeschlossen | Phase 1 (icon-only buttons aria-label) |
| A3 | abgeschlossen | Phase 1 (`ChartDataTable`) |
| A4 | abgeschlossen | Phase 1 (`useReducedMotion` + globales CSS) |
| A5 | abgeschlossen | Phase 2 (`bb04af6`) — weitere Folge-Fixes in Phase 3 |
| A6 | abgeschlossen | Phase 2 (`bb04af6`) |
| A7 | abgeschlossen | Phase 2 (`bb04af6`) |
| A8 | abgeschlossen | Phase 2 (`bb04af6`) |
| A9 | abgeschlossen | Phase 3 (`48a00b8`) |
| A10 | abgeschlossen | Phase 3 (`48a00b8`) — Mobile-Tab-Bar bereits OK, GPS/Now-Button erweitert |
| A11 | abgeschlossen | Phase 3 (`48a00b8`) |
| A12 | abgeschlossen | Phase 3 (`48a00b8`) — Inputs bewusst weiter mit `focus:` |
| A13 | abgeschlossen | Phase 3 (`48a00b8`) |
| A14 | abgeschlossen | Phase 3 (`48a00b8`) |
| A15 | abgeschlossen | Phase 3 (`48a00b8`) |
| A16 | abgeschlossen | Phase 3 (`48a00b8`) — Tooltips als SR-Brücke; Karte bleibt Zusatzmedium |

---

## 1. Befundübersicht

| # | Befund | WCAG | Schweregrad | Phase |
|---|--------|------|-------------|-------|
| A1 | `<html lang>` wird beim Sprachwechsel nicht synchronisiert | 3.1.1, 3.1.2 | kritisch | 1 |
| A2 | Icon-only Buttons ohne `aria-label` (nur `title`) | 4.1.2 | kritisch | 1 |
| A3 | Charts ohne Textalternative (Line/Bar/Pie) | 1.1.1 | kritisch | 1 |
| A4 | `prefers-reduced-motion` wird ignoriert | 2.3.3 | hoch | 1 |
| A5 | Farbkontrast `text-gray-500/400` auf grauen Flächen unter 4.5:1 | 1.4.3 | hoch | 2 |
| A6 | Form-Validierung ohne `aria-invalid`, `aria-describedby` | 3.3.1, 4.1.2 | hoch | 2 |
| A7 | SVG-Icons inkonsistent als dekorativ markiert | 1.1.1 | hoch | 2 |
| A8 | Tabellen ohne `<caption>`/`aria-label`, ohne `scope="col"` | 1.3.1 | mittel | 2 |
| A9 | Pflichtfelder nicht visuell/textuell gekennzeichnet | 3.3.2 | mittel | 3 |
| A10 | Touch-Targets in Mobile-Tab-Bar < 44 × 44 px | 2.5.5 (AAA), best practice | mittel | 3 |
| A11 | Toggle-Buttons signalisieren Zustand nur per Farbe (kein `aria-pressed`) | 1.4.1, 4.1.2 | mittel | 3 |
| A12 | `focus:` statt `focus-visible:` (Ring auch bei Mausklick) | 2.4.7 | niedrig | 3 |
| A13 | App-Install-Banner mit `role="complementary"` statt `aria-live` | 4.1.3 | niedrig | 3 |
| A14 | Loading-Spinner ohne eigenes `aria-label` | 4.1.2 | niedrig | 3 |
| A15 | Statistik-Tabs ohne `role="tablist"`/`role="tab"`/`aria-controls` | 4.1.2 | mittel | 3 |
| A16 | Map-Popups & Marker ohne aria-Beschriftung | 1.1.1 | niedrig | 3 |

---

## 2. Architektur & Querschnittsdateien

### Neue Dateien

```
src/
  composables/
    useDocumentLang.ts          # Watcher: i18n locale → document.documentElement.lang
    useReducedMotion.ts         # Reaktiver Zugriff auf prefers-reduced-motion
  components/common/
    VisuallyHidden.vue          # sr-only Wrapper mit Slot
    ChartDataTable.vue          # Tabellarische Alternative für Charts
    RequiredMarker.vue          # Visueller + sr-only Marker für Pflichtfelder
tests/unit/a11y/
  documentLang.test.ts
  chartDataTable.test.ts
tests/e2e/a11y/
  axe.spec.ts                   # axe-core Scan über alle Routen
  keyboard.spec.ts              # Tab-Reihenfolge, ESC, Enter/Space
  reduced-motion.spec.ts        # Verhalten bei prefers-reduced-motion: reduce
```

### Geänderte Dateien (Auszug — vollständig in Phasen)

| Datei | Änderung |
|-------|----------|
| `index.html` | `<html lang="de">` (statt `en`) |
| `src/App.vue` | `useDocumentLang()` mounten |
| `src/i18n/index.ts` | Locale-Detection beim Start, Mapping `de/en` → `lang`-Code |
| `tailwind.config.*` | Custom Plugin oder Layer für `motion-reduce:` Utilities sicherstellen (Tailwind 4 hat das nativ) |
| `src/components/qso/QsoForm.vue` | aria-Attribute, aria-label auf Icon-Buttons, Pflichtfeld-Marker |
| `src/components/common/LocatorInput.vue` | aria-invalid, aria-describedby, aria-label auf GPS-Button |
| `src/components/qso/QsoTable.vue` | `<caption>`, `scope="col"`, aria-hidden auf Sort-Icons |
| `src/components/statistics/charts/*.vue` | role/aria-label + ChartDataTable als Alternative |
| `src/views/MapView.vue` | aria-label auf Toolbar-Buttons, aria-pressed für Toggle |
| `src/views/StatisticsView.vue` | tablist/tab/tabpanel-Rollen |
| `src/components/common/AppLayout.vue` | Touch-Target padding, aria-current="page", konsistent aria-hidden auf Icons |
| `playwright.config.ts` | neuer Projektscope `a11y` |
| `package.json` | Devdeps: `@axe-core/playwright`, optional `axe-core` für Vitest |

---

## 3. Phase 1 — Kritische Mängel (Sprint 1)

### 3.1 A1 — HTML-Sprache synchronisieren

**Akzeptanzkriterium:** Beim Sprachwechsel via `LocaleSwitch` wird `document.documentElement.lang` sofort auf den ISO-Code (z.B. `de`, `en`) gesetzt; beim ersten Mount wird das Attribut aus dem aktiven i18n-Locale initialisiert. `index.html` startet mit `lang="de"`.

**Dateien:**
- `index.html:2` → `<html lang="de">`
- `src/composables/useDocumentLang.ts` (neu) — Watcher, der bei jeder Locale-Änderung das `lang`-Attribut setzt
- `src/App.vue` — `useDocumentLang()` im `<script setup>` aufrufen

**Beispielimplementierung (Skizze):**
```ts
// src/composables/useDocumentLang.ts
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDocumentLang() {
  const { locale } = useI18n()
  const apply = (l: string) => {
    document.documentElement.lang = l
  }
  apply(locale.value)
  watch(locale, apply, { immediate: false })
}
```

**Test:** `tests/unit/a11y/documentLang.test.ts` — mountet Komponente mit i18n, ändert `locale`, prüft `document.documentElement.lang`.

---

### 3.2 A2 — aria-label auf alle Icon-only Buttons

**Akzeptanzkriterium:** Jeder Button, der visuell nur ein SVG enthält, hat ein `aria-label` mit i18n-Schlüssel. `title` darf zusätzlich vorhanden bleiben (Tooltip), ist aber nicht Ersatz für `aria-label`.

**Mindestliste der zu fixenden Stellen:**
- `src/components/qso/QsoForm.vue:342-350` — "Now"-Button (Zeit auf jetzt)
- `src/components/common/LocatorInput.vue:75-91` — GPS-Button
- `src/views/MapView.vue:102-127` — Center/Connections-Toolbar
- `src/components/qso/QsoTable.vue` — Edit/Delete-Aktionsicons (falls vorhanden)
- `src/components/common/AppLayout.vue:180-191` — Mobile "Mehr"-Button (`aria-expanded` ergänzen, `aria-controls` auf Panel-ID)
- alle in Phase 2 nochmals geprüft via grep

**i18n-Keys (Vorschlag, neu):** `a11y.setNow`, `a11y.detectLocation`, `a11y.centerMap`, `a11y.toggleConnections`, `a11y.openMore`, `a11y.closeMore`, `a11y.editQso`, `a11y.deleteQso`.

**Akzeptanztest (E2E):** axe-Scan meldet 0 `button-name`-Verstöße auf allen Routen.

---

### 3.3 A3 — Textalternative für Charts

**Akzeptanzkriterium:** Jeder Chart wird zusätzlich von einer textuellen Datentabelle begleitet, die für sehende Nutzer per Default visuell versteckt (`sr-only`) ist, sich aber per Toggle ("Tabelle anzeigen") sichtbar machen lässt. Der Chart-Canvas erhält `role="img"` und ein zusammenfassendes `aria-label` (z.B. *"Liniendiagramm: QSOs pro Monat, höchster Wert 87 im März 2026"*).

**Dateien:**
- `src/components/common/ChartDataTable.vue` (neu) — generische Komponente mit `headers`/`rows`-Props
- `src/components/statistics/charts/LineChart.vue`, `BarChart.vue`, `PieChart.vue` — Slot/Prop für Daten, ChartDataTable einbinden
- aufrufende Tabs (`DxccTab`, `DistanceTab`, `BandsTab` etc.) — Daten an ChartDataTable durchreichen

**Optional (best practice):** `aria-label` aus Chart-Daten generieren (Min/Max/Trend), nicht statisch.

**Test:** `tests/unit/a11y/chartDataTable.test.ts` — rendert mit Daten, prüft `<table>`/`<th scope>`/`<caption>` und `role="img"` am Canvas.

---

### 3.4 A4 — `prefers-reduced-motion` respektieren

**Akzeptanzkriterium:** Bei aktiviertem System-Setting werden keine Bewegungsanimationen (`animate-spin`, `transition-transform`, Map-Pan-Animationen) ausgeführt. Statische Fallbacks sind weiterhin sichtbar (z.B. Spinner als statisches Symbol oder Punkte-Sequenz).

**Vorgehen:**
1. Globales CSS in `src/style.css` (oder vergleichbar):
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
2. Spezifische Stellen mit `motion-reduce:` Tailwind-Variants prüfen (`AppLayout.vue:89`, `StatisticsView.vue:61`, `LocatorInput.vue:83`, `MapView.vue:139`).
3. Leaflet: `map.options.fadeAnimation`, `zoomAnimation`, `markerZoomAnimation` abhängig von `useReducedMotion()` deaktivieren.

**Composable:**
```ts
// src/composables/useReducedMotion.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useReducedMotion() {
  const prefers = ref(false)
  let mq: MediaQueryList | null = null
  const update = () => { prefers.value = !!mq?.matches }
  onMounted(() => {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    mq.addEventListener('change', update)
  })
  onBeforeUnmount(() => mq?.removeEventListener('change', update))
  return prefers
}
```

**Test:** `tests/e2e/a11y/reduced-motion.spec.ts` — Playwright `emulateMedia({ reducedMotion: 'reduce' })`, navigiert auf Map und Statistics, prüft, dass `animation-duration` ≈ 0.

---

## 4. Phase 2 — Schwerwiegende Mängel (Sprint 2)

### 4.1 A5 — Farbkontrast

**Akzeptanzkriterium:** Alle Texte erfüllen WCAG AA (4.5:1 für Normaltext, 3:1 für ≥18 pt / 14 pt fett) sowohl im Light- als auch im Dark-Mode.

**Konkrete Anpassungen (initial, weitere via Tool-Scan):**
- `text-gray-500 dark:text-gray-400` → `text-gray-600 dark:text-gray-300` an allen Hint-/Sekundärtext-Stellen:
  - `src/views/SettingsView.vue:35,47,55,114`
  - `src/components/qso/QsoTable.vue:52-53`
  - `src/components/statistics/tabs/DxccTab.vue:6`, `DistanceTab.vue:6`, weitere Tabs-Header
  - `src/views/DashboardView.vue:112-117`
- Tabellen-Zebrastreifen (falls vorhanden) gegen Text-Kontrast prüfen.

**Tooling-Pflicht:**
- Automatischer Kontrast-Check via `axe-core` in der E2E-Suite
- Manuelle Stichprobe mit Chrome DevTools "Contrast Ratio" pro Tab

**Tailwind-Hinweis:** Falls die Primary-Palette in Buttons (`bg-primary-500 text-white`) gegen Hintergrund nicht 4.5:1 erreicht, Palette in `tailwind.config` anpassen oder `text-primary-700`/`text-primary-100` verwenden.

---

### 4.2 A6 — Formularvalidierung mit ARIA

**Akzeptanzkriterium:** Bei ungültiger Eingabe (z.B. ungültiger Maidenhead-Locator) erhält das Input-Element `aria-invalid="true"`, die Fehlermeldung hat eine eindeutige `id` und ist über `aria-describedby` mit dem Input verknüpft. Die Fehlermeldung-Region hat `aria-live="polite"`.

**Dateien:**
- `src/components/common/LocatorInput.vue:93-109` — Input + Fehler-Span
- `src/components/qso/QsoForm.vue` — bei zukünftigen Validierungen analog
- `src/views/QsoHistoryView.vue:199-201` — Import-Validierungsfehler (Liste mit `role="alert"` oder `aria-live="polite"`)

**Pattern (Skizze):**
```vue
<input
  id="locator"
  :aria-invalid="!isValid || undefined"
  :aria-describedby="!isValid ? 'locator-error' : undefined"
/>
<p v-if="!isValid" id="locator-error" role="alert">
  {{ t('qso.errors.invalidLocator') }}
</p>
```

**Test:** Vitest-Test, der ungültige Eingabe simuliert und die ARIA-Attribute prüft.

---

### 4.3 A7 — SVG-Icons konsistent dekorativ markieren

**Akzeptanzkriterium:** Jedes SVG, das ausschließlich dekorativ ist (Icon neben Text-Label), erhält `aria-hidden="true"` und `focusable="false"`. SVGs, die alleinige Träger einer Information sind, erhalten stattdessen `role="img"` + `<title>` oder werden in einen Button mit `aria-label` verpackt (siehe A2).

**Vorgehen:**
1. Repo-weiten Grep nach `<svg` ausführen.
2. Jede Fundstelle einer der drei Kategorien zuordnen:
   - **Dekorativ neben Text:** `aria-hidden="true" focusable="false"` ergänzen
   - **Allein in interaktivem Element:** Eltern-Button bekommt `aria-label` (siehe A2), SVG bleibt `aria-hidden="true"`
   - **Bedeutungstragend:** `role="img"` + `<title>` mit i18n-Text
3. Optional: Konvention in `AGENTS.md` ergänzen ("Alle dekorativen SVGs müssen `aria-hidden="true"` tragen").

**Schwerpunktdateien:**
- `src/components/common/AppLayout.vue:74-105`
- `src/views/DashboardView.vue:72-103`
- `src/components/qso/QsoTable.vue:76-82` (Sort-Icons)
- `src/components/qso/QsoFilters.vue` (Such-Icon)

---

### 4.4 A8 — Tabellen-Semantik

**Akzeptanzkriterium:** Jede Tabelle hat eine `<caption>` (oder `aria-label`), alle Spalten-Header tragen `scope="col"`, Zeilen-Header (falls vorhanden) `scope="row"`.

**Dateien:**
- `src/components/qso/QsoTable.vue:58-84`
- `src/components/qso/RecentQsosTable.vue:18-...`
- alle Tabellen in `src/components/statistics/tabs/*.vue`

**Beispiel:**
```vue
<table aria-label="QSO-Verlauf">
  <thead>
    <tr>
      <th scope="col">{{ t('qso.callsign') }}</th>
      <th scope="col">{{ t('qso.band') }}</th>
      …
    </tr>
  </thead>
</table>
```

---

## 5. Phase 3 — Mittlere & niedrige Mängel (Sprint 3)

### 5.1 A9 — Pflichtfeld-Kennzeichnung

**Akzeptanzkriterium:** Pflichtfelder werden zusätzlich zum `required`-Attribut visuell mit `*` und für Sprachausgabe mit `<span class="sr-only">{{ t('a11y.required') }}</span>` markiert. Ein Hinweis "* = Pflichtfeld" steht oberhalb des Formulars.

**Dateien:** `RequiredMarker.vue` neu, eingebunden in `QsoForm.vue` (Datum, Zeit, Callsign, Band, Mode, RST), `OperatorManagementView.vue:67-90`, `SettingsView.vue` (falls Pflichtfelder).

---

### 5.2 A10 — Touch-Target-Größen

**Akzeptanzkriterium:** Alle interaktiven Elemente haben min. 44 × 44 CSS-Pixel Klickfläche (WCAG 2.2 SC 2.5.8 AA, bzw. AAA in 2.1).

**Konkret:**
- `src/components/common/AppLayout.vue:146` (Mobile-Tab-Buttons): `py-2` → `py-3` oder zusätzliches `min-h-[44px]`
- Map-Toolbar-Buttons (`MapView.vue:102-127`): Größe prüfen
- Sort-Header in Tabellen: Padding ggf. erhöhen

---

### 5.3 A11 — Toggle-Buttons mit `aria-pressed`

**Akzeptanzkriterium:** Buttons, die einen Ein/Aus-Zustand abbilden (z.B. Map-"Connections"-Toggle), tragen `aria-pressed="true|false"`. Zustand wird zusätzlich textuell oder ikonografisch (nicht nur Farbe) erkennbar sein.

**Dateien:** `src/views/MapView.vue:115-121`, ggf. weitere View-Filter.

---

### 5.4 A12 — `focus-visible` statt `focus`

**Akzeptanzkriterium:** Focus-Ring erscheint nur bei Tastaturfokussierung, nicht bei Mausklicks. Repo-weite Migration: `focus:` → `focus-visible:` (Tailwind 4 unterstützt `focus-visible:` nativ).

**Vorgehen:** Grep auf `focus:ring`, `focus:border`, `focus:outline` und systematisch in `focus-visible:`-Variants ändern. Für ältere Browser ggf. `:focus:not(:focus-visible) { outline: none }`-Fallback.

---

### 5.5 A13 — Banner & Live-Regions

- `src/App.vue:47-70` (Install-Banner): `role="complementary"` → entfernen, stattdessen `role="status"` oder `aria-live="polite"`.
- Toast-/Notification-Komponente (falls vorhanden) prüfen: `role="status"` für nicht-kritische, `role="alert"` für Fehler.

---

### 5.6 A14 — Loading-Spinner mit `aria-label`

`<div class="animate-spin" role="status" aria-label="…wird geladen">` an allen Stellen, an denen kein begleitender Text steht. Falls Text daneben steht, Spinner `aria-hidden="true"`.

---

### 5.7 A15 — Tab-Pattern für Statistics

**Akzeptanzkriterium:** `src/views/StatisticsView.vue:32-71` setzt das WAI-ARIA Tab-Pattern um:
- Container: `role="tablist"` mit `aria-label="Statistik-Bereiche"`
- Tab: `role="tab"` mit `aria-selected`, `aria-controls`, `tabindex="0"` (aktiv) bzw. `-1` (inaktiv)
- Panel: `role="tabpanel"` mit `aria-labelledby`, `tabindex="0"`
- Pfeiltasten links/rechts wechseln Tabs (ggf. Headlessui `<TabGroup>` einsetzen statt manuell)

---

### 5.8 A16 — Map-Marker & Popups

- Eigene Station: `marker.bindTooltip(t('map.ownStation'), { permanent: false })` mit Screen-Reader-freundlichem Tooltip
- QSO-Marker: aria-label aus Callsign + Locator generieren
- Hinweis: Leaflet ist nur eingeschränkt SR-tauglich; ergänzend zur Karte gibt es bereits Tabellen — Karte als zusätzliches, nicht als alleiniges Medium positionieren.

---

## 6. Test- und Tooling-Strategie

### 6.1 Devdeps (neu)

```json
// package.json (devDependencies)
"@axe-core/playwright": "^4.x",
"axe-core": "^4.x"
```

### 6.2 Unit-Tests (Vitest)

- `tests/unit/a11y/documentLang.test.ts` — i18n locale ↔ `document.documentElement.lang`
- `tests/unit/a11y/chartDataTable.test.ts` — ChartDataTable rendert `<caption>`, `<th scope>`
- `tests/unit/a11y/locatorInput.test.ts` — `aria-invalid`/`aria-describedby` schalten korrekt um
- `tests/unit/a11y/requiredMarker.test.ts` — visueller `*` + `sr-only`-Text
- `tests/unit/a11y/useReducedMotion.test.ts` — `matchMedia`-Mock

### 6.3 E2E-Tests (Playwright + axe-core)

`tests/e2e/a11y/axe.spec.ts`:
```ts
import AxeBuilder from '@axe-core/playwright'
const ROUTES = ['/', '/new', '/history', '/statistics', '/map', '/operators', '/settings', '/about']

for (const path of ROUTES) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
```

`tests/e2e/a11y/keyboard.spec.ts`:
- Skip-Link funktioniert (`Tab` → Skip-Link sichtbar → `Enter` springt zu `#main-content`)
- Modal: ESC schließt, Fokus kehrt zum auslösenden Element zurück
- Statistics-Tabs: Pfeil-links/rechts wechselt
- QsoForm: Tab-Reihenfolge ist logisch (Datum → Zeit → Callsign → …)

`tests/e2e/a11y/reduced-motion.spec.ts`:
- `page.emulateMedia({ reducedMotion: 'reduce' })`
- Spinner darf laufen, aber `animation-duration` nahe 0 sein
- Map: keine Pan/Zoom-Animation

### 6.4 Lighthouse-CI

Optional: GitHub Action, die nach `npm run build` Lighthouse a11y gegen `vite preview` laufen lässt und PR-Kommentar mit Score erzeugt. Schwelle z.B. ≥ 95.

### 6.5 Manuelle Prüfung

Vor Release jeder Phase:
- Screenreader-Smoke-Test mit NVDA (Windows) oder Orca (Linux) auf Dashboard, NewQSO, History, Settings
- Tastatur-only Durchlauf eines kompletten QSO-Logs
- DevTools: Forced Colors (High Contrast), 200 % Zoom, Mobile-Viewport-Touch-Simulation

---

## 7. i18n-Schlüssel (neu)

Neue Keys unter `a11y.*` in `src/i18n/locales/{de,en}.json`:

```jsonc
{
  "a11y": {
    "required": "Pflichtfeld",
    "requiredHint": "* = Pflichtfeld",
    "skipToContent": "Zum Inhalt springen",
    "loading": "Wird geladen",
    "showDataTable": "Datentabelle anzeigen",
    "hideDataTable": "Datentabelle ausblenden",
    "setNow": "Aktuelle Zeit übernehmen",
    "detectLocation": "Standort per GPS bestimmen",
    "centerMap": "Karte auf eigene Station zentrieren",
    "toggleConnections": "Verbindungslinien ein-/ausblenden",
    "openMore": "Weitere Optionen öffnen",
    "closeMore": "Weitere Optionen schließen",
    "editQso": "QSO bearbeiten",
    "deleteQso": "QSO löschen",
    "chartLineSummary": "Liniendiagramm: {label}",
    "chartBarSummary": "Balkendiagramm: {label}",
    "chartPieSummary": "Kreisdiagramm: {label}"
  }
}
```

---

## 8. Auslieferung & Migration

### Reihenfolge der Releases

| Release | Inhalt | Ziel-WCAG-Konformität |
|---------|--------|------------------------|
| v0.9.0 (Phase 1) | A1, A2, A3, A4 + axe-Suite Setup | ~82 % |
| v0.10.0 (Phase 2) | A5, A6, A7, A8 | ~92 % |
| v0.11.0 (Phase 3) | A9–A16 + Lighthouse-CI | ≥ 98 % |

Jede Phase wird über Conventional Commits versioniert (z.B. `feat(a11y): add aria-label to icon-only buttons`, `fix(a11y): synchronize html lang with i18n locale`).

### Breaking Changes

Keine — alle Änderungen sind additiv für Endnutzer. Tests werden strenger (CI bricht bei axe-Violations); das ist eine interne Qualitäts-Verschärfung.

---

## 9. Definition of Done

Eine Phase ist abgeschlossen, wenn:

1. Alle Akzeptanzkriterien der Phase erfüllt sind.
2. `npm run build` (inkl. `vue-tsc`) fehlerfrei durchläuft.
3. `npm test` und `npm run test:e2e` (inkl. `tests/e2e/a11y/*`) grün sind.
4. axe-core meldet 0 Violations für `wcag2aa` + `wcag21aa` auf allen Routen.
5. Manueller Screenreader-Smoke-Test erfolgreich durchlaufen ist.
6. CHANGELOG-Eintrag (auto via release-it) vorhanden.
7. `docs/plans/2026-04-29_accessibility.md` mit Status-Update der Phase versehen ist.

---

## 10. Offene Fragen / Risiken

- **Leaflet-Tastaturbedienung:** Vollständige WCAG-Konformität für interaktive Karten ist nur eingeschränkt erreichbar. Strategie: Karte als Zusatz, alle Daten zusätzlich tabellarisch zugänglich.
- **Chart.js-Canvas:** Kein nativer A11y-Pfad; `ChartDataTable`-Pattern als Standardlösung übernehmen.
- **Tailwind 4 `motion-reduce:`-Variant:** Verhalten in der aktuellen Tailwind-Version verifizieren; falls eingeschränkt, globaler CSS-Fallback (siehe 3.4).
- **PWA-Update-Banner Modal-Charakter:** Soll der Banner Tastaturfokus erzwingen (modal) oder nicht (passiv)? Vorschlag: passiv mit `aria-live="polite"`, nicht fokus-stehlend.
- **Farbpalette `primary-500`:** Falls Kontrast in Phase 2 nicht ausreicht, Anpassung der Palette nötig — kann visuelles Branding ändern. Vor Umsetzung mit Stakeholder abstimmen.
