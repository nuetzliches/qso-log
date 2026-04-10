# Plan: Statistiken für QSOlog

## Context

Die QSOlog PWA hat derzeit keine Statistik-/Analyse-Funktionen. QSO-Daten (Band, Mode, Land, Locator, Datum) werden bereits erfasst, aber nicht aggregiert dargestellt. Ziel: Eine neue Statistik-Seite mit vier Bereichen, interaktiven Charts, Operator-Filter und Dark-Mode-Support.

**Wird zusätzlich gespeichert unter:** `docs/plans/2026-04-09_statistiken.md`

---

## 1. Chart-Bibliothek: Chart.js + vue-chartjs (Empfehlung)

| Option | Bundle (gzip) | Interaktivität | Aufwand |
|--------|---------------|----------------|---------|
| **A: Chart.js + vue-chartjs** | ~65 KB | Tooltips, Hover, Zoom (Plugin) | Gering |
| B: ApexCharts | ~130 KB | Alles nativ eingebaut | Gering |
| C: Pure CSS/SVG | ~0 KB | Alles selbst bauen | Sehr hoch |

**Entscheidung: Chart.js** — Bestes Verhältnis aus Größe, Features und Vue-3-Support. Tree-Shaking in v4 möglich. Zoom-Plugin optional für Timeline.

```bash
npm install chart.js vue-chartjs
```

---

## 2. Architektur: Dediziertes Statistik-Modul mit Tabs

### Neue Dateien

```
src/
  views/StatisticsView.vue              # Hauptseite mit Tabs + Filter
  components/statistics/
    StatisticsFilter.vue                # Operator- und Zeitraumfilter
    StatCard.vue                        # Wiederverwendbare Kennzahl-Karte
    charts/
      BarChart.vue                      # Generischer Bar-Chart-Wrapper
      PieChart.vue                      # Generischer Doughnut-Wrapper
      LineChart.vue                     # Generischer Line-Chart-Wrapper
    tabs/
      BandModeTab.vue                   # Band/Mode-Verteilung
      ActivityTab.vue                   # Aktivitäts-Timeline + Streaks
      DxccTab.vue                       # Länder & DXCC
      DistanceTab.vue                   # Distanz & Locator
  composables/
    useStatistics.ts                    # QSO-Daten laden + filtern
    useStatisticsAggregation.ts         # Reine Aggregationsfunktionen
```

### Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/router/index.ts` | Route `/statistics` → `StatisticsView` |
| `src/components/common/AppLayout.vue` | Nav-Item + Icon, Mobile-Nav anpassen |
| `src/i18n/locales/de.json` | `nav.statistics` + `statistics.*` Keys |
| `src/i18n/locales/en.json` | Englische Übersetzungen |

---

## 3. Statistik-Bereiche

### 3.1 Band/Mode (BandModeTab)
- **StatCards:** Gesamt-QSOs, häufigster Mode, häufigstes Band
- **Stacked-Bar-Chart:** QSOs pro Band (sortiert nach Frequenz), segmentiert nach Mode
- **Doughnut-Chart:** Mode-Verteilung mit Prozenten
- **Reuse:** Band-Sortierung aus `src/utils/frequency.ts`

### 3.2 Aktivität (ActivityTab)
- **StatCards:** QSOs diese Woche/Monat/Jahr, aktueller Streak, längster Streak, aktivster Tag
- **Line-Chart:** QSOs über Zeit (umschaltbar: Tag/Woche/Monat)
- Tagesgruppierung über `date.slice(0, 10)`

### 3.3 DXCC/Länder (DxccTab)
- **StatCards:** Unique DXCC-Entities, Top-Land, QSOs ohne Land
- **Bar-Chart:** Top 20 Länder mit Flaggen-Emoji
- **Tabelle:** Alle Länder sortierbar (Flagge, Land, Anzahl, erstes/letztes QSO)
- **Reuse:** `lookupDxcc()` und `toFlagEmoji()` aus `src/utils/dxcc.ts`

### 3.4 Distanz/Locator (DistanceTab)
- **StatCards:** Entferntestes QSO, Ø-Distanz, Gesamtdistanz, Unique Grid-Squares
- **Bar-Chart:** Distanz-Verteilung in Buckets (0-100km, 100-500km, ...)
- **Top-10-Liste:** Weiteste QSOs mit Callsign, Locator, Distanz, Richtung
- **Reuse:** `calculateDistanceKm()`, `calculateBearing()` aus `src/utils/locator.ts`

---

## 4. Datenstrategie: On-the-fly mit leichtem Caching

QSOs einmal beim Mount der StatisticsView laden (via `qsoRepository.getAll()`), als `shallowRef` im Composable halten. Jeder Tab berechnet Aggregationen als `computed()`. Bei Filterwechsel: QSOs neu laden.

**Performance:** Bis ~5000 QSOs < 100ms — für typische Amateurlog-Größen ausreichend. Bei Bedarf später Pinia-Store nachrüstbar.

---

## 5. Navigation

- Statistik als **4. Item in der Mobile-Bottom-Nav** (nach QSO, History, Operators)
- Map, Settings, About bleiben im "Mehr..."-Panel
- Desktop-Sidebar: nach History einordnen
- Icon: Heroicons `chart-bar` (konsistent mit bestehenden Icons)
- `isMoreActive`-Computed in AppLayout.vue muss **nicht** angepasst werden (Statistik ist in Bottom-Nav)

---

## 6. Dark-Mode

Chart.js-Wrapper liest Theme aus `settingsStore`. Chart-Optionen (Grid-Farben, Text-Farben, Legend) werden reaktiv an Dark/Light angepasst. Tailwind-Farbwerte als Hex übergeben (Chart.js kann keine CSS-Variablen).

---

## 7. Tabs

Headless UI `TabGroup` (bereits als Dependency vorhanden: `@headlessui/vue`).

---

## 8. Umsetzungsreihenfolge

| Phase | Inhalt | ~Stunden |
|-------|--------|----------|
| 1 | Chart.js Setup, Route, Navigation, i18n, generische Chart-Wrapper, StatCard | 4-5 |
| 2 | `useStatisticsAggregation.ts` + Unit-Tests | 6 |
| 3 | BandModeTab (Stacked-Bar + Doughnut) | 3 |
| 4 | ActivityTab (Line-Chart + Streaks) | 5 |
| 5 | DxccTab (Bar-Chart + Länderliste) | 4 |
| 6 | DistanceTab (Buckets + Top-10) | 4 |
| 7 | Polish: Dark-Mode, Responsive, Component-Tests | 4 |
| **Gesamt** | | **~32** |

---

## 9. Testing

- **Unit-Tests:** Aggregationsfunktionen in `useStatisticsAggregation.ts` — rein funktional, kein DOM
  - Testdaten-Factory: `createTestQso(overrides)`
  - Testfälle: leeres Array, Einzelwerte, Gruppierung, Streaks, Distanzberechnung
- **Component-Tests:** StatCard-Rendering, Loading-States, leere Daten → "Keine Daten"-Hinweis
- **Kein E2E:** Chart-Canvas ist schwer testbar; Aggregations-Unit-Tests bieten den größten Wert

---

## 10. Verifikation

1. `npm run dev` → `/statistics` öffnen → alle 4 Tabs prüfen
2. Operator-Filter testen (verschiedene Operatoren auswählen)
3. Dark-Mode umschalten → Charts müssen Farben anpassen
4. Mobile-Ansicht: Bottom-Nav-Item sichtbar, Tabs scrollbar
5. `npm run test` → alle neuen Unit-Tests grün
6. `npm run build` → keine TypeScript-Fehler
