# Plan: Propagations-Korrelation (NOAA SWPC)

## Context

QSOlog erfasst QSOs mit Zeitstempel, Frequenz, Band und Distanz, aber ohne Information zu den Ausbreitungsbedingungen (HF-Propagation). Ziel: Jeder QSO bekommt einen Snapshot der Sonnen- und Geomagnetik-Indizes (SFI, SSN, K, A) zum Kontaktzeitpunkt. Damit lassen sich Muster wie *"meine 10-m-DX-QSOs liegen bei SFI > 150"* oder *"bei K ≥ 5 bricht 80 m ein"* sichtbar machen.

**Datum:** 2026-04-28
**Status:** Entwurf — noch nicht implementiert
**Speicherort:** `docs/plans/2026-04-28_propagation-korrelation.md`

> **DSGVO-Hinweis:** NOAA ist eine US-Bundesbehörde. Beim Abruf wird die IP-Adresse des Nutzers in die USA übertragen. Es gibt **keinen Angemessenheitsbeschluss** und **keine SCCs** für US-Behörden. Rechtsgrundlage = ausdrückliche Einwilligung nach Art. 6 Abs. 1 lit. a + Art. 49 Abs. 1 lit. a DSGVO. **Default = aus.** Siehe Phase 0 und Abschnitt 13.

---

## 1. Datenquellen

Alle Endpunkte sind kostenlos, ohne API-Key, mit CORS für Browser-Zugriff (NOAA Space Weather Prediction Center).

| Wert | Endpunkt | Auflösung |
|------|----------|-----------|
| Solar Flux (SFI) | `https://services.swpc.noaa.gov/json/f107_cm_flux.json` | täglich |
| Sunspot Number (SSN) | `https://services.swpc.noaa.gov/json/sunspot_report.json` | täglich |
| Planetary K-Index | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | 3 h |
| Dst (geomagnetisch) | `https://services.swpc.noaa.gov/json/geospace/geospace_dst_1_hour.json` | 1 h |
| Historische DGD-Reports | `https://services.swpc.noaa.gov/text/daily-geomagnetic-indices.txt` | täglich, mehrere Jahre |

A-Index wird aus den 3-h-K-Werten berechnet (Standardformel: `a = round(8 * 2^((k-1)/2))` aggregiert über 24 h).

---

## 2. Architektur

### Datenfluss
```
NOAA API ──► noaaProvider ──► propagationService ──► propagationCache (Dexie)
                                       │
                                       ▼
                               qsoStore.create()  ──► Qso.propagation
                                       │
                                       ▼
                                  Statistik / Badge
```

### Neue Dateien

```
src/
  services/propagation/
    noaaProvider.ts                # Fetch + Parser pro Endpunkt
    propagationService.ts          # Orchestrierung, Cache, Backfill
    types.ts                       # Propagation-Interfaces
  composables/
    usePropagation.ts              # Reaktiver Zugriff (aktuelle Werte)
  components/
    PropagationBadge.vue           # Inline-Anzeige im Logformular und in Listen
  components/statistics/tabs/
    PropagationTab.vue             # Neuer Statistik-Tab
tests/unit/services/propagation/
  noaaProvider.test.ts
  propagationService.test.ts
```

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/types/qso.ts` | optionales Feld `propagation?: Propagation` |
| `src/db/database.ts` | Schema-Version 5: neue Tabelle `propagationCache` |
| `src/stores/qsoStore.ts` | bei `addQso()` automatisch anreichern (fire-and-forget) |
| `src/views/StatisticsView.vue` | neuer Tab "Propagation" |
| `src/views/SettingsView.vue` | Toggle "Propagationsdaten erfassen" + Backfill-Button |
| `src/i18n/locales/{de,en}.json` | neue Übersetzungen |

---

## 3. Datenmodell

```ts
// src/services/propagation/types.ts
export interface Propagation {
  sfi?: number;       // Solar Flux Index 10.7 cm
  ssn?: number;       // Sunspot Number
  kIndex?: number;    // 0..9, Wert der zugehörigen 3-h-Periode
  aIndex?: number;    // Tagesmittel
  dst?: number;       // nT, optional
  source: 'live' | 'cached' | 'historical';
  fetchedAt: string;  // ISO timestamp
}

// src/types/qso.ts (Erweiterung)
export interface Qso {
  // ... bestehende Felder
  propagation?: Propagation;
}
```

### Dexie-Schema v5

```ts
this.version(5).stores({
  qsos: '++id, callsign, band, mode, datetime, operatorId',
  operators: '++id, &callsign',
  propagationCache: 'utcHour'   // 'YYYY-MM-DDTHH' als Key
});
```

`propagationCache` speichert pro UTC-Stunde einen `Propagation`-Record. TTL für `live`-Werte: 3 h; `historical` ist permanent.

---

## 4. Ablauf

### A) Beim Anlegen eines neuen QSO
1. `qsoStore.addQso(qso)` schreibt zuerst in Dexie.
2. **Consent-Check:** `settingsStore.propagationConsent.granted === true`? Wenn nein → Ende, QSO bleibt ohne `propagation`.
3. Async: `propagationService.enrich(qso.id, qso.datetime)`.
4. Service prüft Cache für `utcHour(qso.datetime)`.
5. Cache-Hit → QSO wird mit Werten aktualisiert (kein NOAA-Request).
6. Cache-Miss → NOAA-Endpunkte parallel abfragen mit `referrerPolicy: 'no-referrer'`, Cache füllen, QSO aktualisieren.
7. Fehler/Offline → kein Update; QSO bleibt ohne `propagation`. Service-Worker-Hook holt das nach (Background Sync), aber nur solange Consent gilt.

### B) Backfill für Alt-QSOs
- Settings-Button "Propagationsdaten ergänzen".
- Liest alle QSOs ohne `propagation`, gruppiert nach Tag.
- Holt `daily-geomagnetic-indices.txt` (kompletter Tagesblock) → `historical`.
- Für aktuelle Tage zusätzlich K-Index-JSON.
- Fortschrittsanzeige + Abbrechen-Button (`AbortController`).
- Rate-Limit: max. 1 Request/200 ms.

### C) Anzeige im Logformular
- Beim Setzen von Datum/Uhrzeit → `usePropagation.fetchFor(datetime)` zeigt Live-Badge:
  ```
  SFI 142 · SSN 89 · K 3
  ```
- Tooltip mit Interpretation (Mapping-Tabelle, s. Abschnitt 6).

---

## 5. Statistik-Tab `PropagationTab.vue`

| Visualisierung | Bibliothek | Zweck |
|----------------|------------|-------|
| Scatter SFI vs. QSO-Distanz | Chart.js (vorhanden) | Korrelation Sonnenflux ↔ Reichweite |
| Heatmap Band × K-Index | Chart.js Matrix-Plugin | Welche Bänder bei welchen Bedingungen |
| Timeline QSO-Anzahl + SFI | Chart.js Mixed | Aktivität vs. Sonnenzyklus |
| Pearson-r-Tabelle pro Band | reine HTML-Tabelle | quantitative Korrelation |
| Filter "nur K ≤ 2" / "nur SFI ≥ X" | bestehende Filterleiste | Dead-Band-Analyse |

Aggregationslogik in `composables/useStatisticsAggregation.ts` ergänzen (Pearson-Korrelation als Pure Function, einheitstestbar).

---

## 6. Interpretations-Mapping (Tooltip-Texte)

| Bereich | Bewertung | i18n-Key |
|---------|-----------|----------|
| SFI < 70 | sehr schwach | `propagation.sfi.veryLow` |
| SFI 70–100 | schwach | `propagation.sfi.low` |
| SFI 100–150 | gut | `propagation.sfi.good` |
| SFI > 150 | sehr gut, 10/12/15 m offen | `propagation.sfi.excellent` |
| K ≤ 2 | ruhig | `propagation.k.quiet` |
| K = 3–4 | unruhig | `propagation.k.unsettled` |
| K = 5 | Sturm beginnt | `propagation.k.minor` |
| K ≥ 6 | starker Sturm, LF/MF betroffen | `propagation.k.major` |

---

## 7. Offline & PWA

- `noaaProvider` wirft `PropagationOfflineError`, wenn `navigator.onLine === false`.
- Service-Worker (`vite-plugin-pwa`): Runtime-Caching der NOAA-Endpunkte mit `NetworkFirst`, Cache-TTL 1 h.
- `propagationService.retryPending()` läuft beim `online`-Event und füllt fehlende QSOs nach.

---

## 8. Tests

### Unit
- `noaaProvider.test.ts`: Parser für jedes JSON-Format inkl. Edge Cases (leerer Array, NaN-Wert, Truncated Response).
- `propagationService.test.ts`: Cache-TTL, UTC-Stunden-Zuordnung, Backfill mit Abort.
- `useStatisticsAggregation.test.ts`: Pearson-Korrelation gegen bekannte Werte.

### E2E (Playwright)
- Neuer QSO im Online-Modus → Badge sichtbar mit numerischen Werten.
- Offline-Szenario (`page.context().setOffline(true)`) → QSO speichert ohne Badge, kein Fehler.
- Backfill-Lauf in Settings: Button löst Lauf aus, Fortschritt steigt, abschließend haben Test-QSOs `propagation`.

---

## 9. i18n-Keys (Auszug)

```json
{
  "propagation": {
    "title": "Ausbreitungsbedingungen",
    "sfi": "Solar Flux",
    "ssn": "Sonnenflecken",
    "kIndex": "K-Index",
    "aIndex": "A-Index",
    "fetchFailed": "Propagationsdaten konnten nicht geladen werden",
    "backfill": {
      "button": "Propagationsdaten ergänzen",
      "running": "Lädt … {done} / {total}",
      "done": "Fertig: {count} QSOs aktualisiert"
    }
  }
}
```

---

## 10. Migration

Dexie v4 → v5: nur additiv (neue Tabelle, neues optionales Feld). Kein Datenverlust, keine Transformation nötig. Alte ADIF-Exporte bleiben kompatibel; neue Exporte können `APP_PROPAGATION_*`-Felder optional als ADIF-User-Defined-Fields ergänzen (Phase 2).

---

## 11. Schrittweise Umsetzung

| Phase | Inhalt | Abhängigkeiten |
|-------|--------|----------------|
| **0** | **Consent-Flow, Datenschutzhinweis, Settings-Toggle (default aus)** | **—** |
| 1 | Typen, Dexie v5, `noaaProvider` mit Tests | Phase 0 |
| 2 | `propagationService` + Cache + Auto-Anreicherung beim Logging (mit Consent-Check) | Phase 1 |
| 3 | `PropagationBadge` im Logformular und in QSO-Listen | Phase 2 |
| 4 | Backfill in Settings (UI + historischer Endpunkt) | Phase 2 |
| 5 | `PropagationTab` mit Charts und Korrelations-Werten | Phase 3 |
| 6 | E2E-Tests, Doku in `AGENTS.md`, ADIF-Export | Phase 5 |

Jede Phase ist eigenständig mergebar (Conventional Commits: `feat(propagation): ...`).

**Phase 0 ist blockierend** — keine NOAA-Anfrage darf vor abgeschlossenem Consent-Flow möglich sein.

---

## 12. Offene Fragen

1. ~~Soll Propagation per Default aktiv sein oder Opt-in in Settings?~~ → **entschieden: Opt-in mit explizitem Consent (DSGVO).**
2. NOAA hat manchmal mehrtägige Datenausfälle — Sekundär-Provider (`hamqsl.com`, US-Privatdienst) als Fallback? **DSGVO-Risiko ähnlich**: Drittland USA, separater Consent-Punkt nötig. Entscheidung offen.
3. ADIF-Export: User-Defined-Fields (`APP_QSOLOG_SFI` etc.) jetzt mitnehmen oder separat? Lokaler Export ist DSGVO-neutral.
4. Soll der Backfill auch QSOs anfassen, die *vor* dem ältesten verfügbaren NOAA-Datensatz liegen (Werte = `undefined` markieren)?

---

## 13. DSGVO-Konformität (Phase 0)

### 13.1 Rechtliche Bewertung

| Punkt | Bewertung |
|-------|-----------|
| Art. 4 Nr. 1 — Personenbezug | IP-Adresse ist personenbezogen (EuGH, Breyer). User-Agent + Zeitpunkt verstärken die Personenbeziehbarkeit. |
| Art. 6 — Rechtsgrundlage | **Art. 6 Abs. 1 lit. a (Einwilligung).** Berechtigtes Interesse (lit. f) wäre wackelig wegen US-Behörden-Übermittlung. |
| Art. 13 — Information | Datenschutzhinweis muss Empfänger, Zweck, Drittlandsübermittlung, Rechte nennen. |
| Art. 44 ff. — Drittlandsübermittlung | Kein Angemessenheitsbeschluss für US-Behörden. EU-US-DPF gilt nur für zertifizierte Privatunternehmen. |
| Art. 49 Abs. 1 lit. a | **Ausdrückliche Einwilligung** ist die tragende Ausnahme. Nutzer muss über Risiken informiert sein. |
| Art. 7 Abs. 1 | Nachweis der Einwilligung: Zeitstempel im `settingsStore`. |
| Art. 7 Abs. 3 | Widerruf jederzeit gleich einfach wie Erteilung — Toggle in Settings. |
| Art. 5 Abs. 1 lit. c | Datenminimierung: Cache aggressiv, Bündelung, `referrerPolicy: 'no-referrer'`. |

### 13.2 Settings-Datenmodell

```ts
// src/types/settings.ts (Erweiterung)
interface AppSettings {
  // ...
  propagation: {
    enabled: boolean;             // Master-Toggle, default false
    consent: {
      granted: boolean;           // default false
      grantedAt?: string;         // ISO timestamp (Nachweis Art. 7)
      revokedAt?: string;         // ISO timestamp (Nachweis Art. 7 Abs. 3)
      version: number;            // Consent-Text-Version, für Re-Consent bei Änderungen
    };
  };
}
```

### 13.3 Consent-Dialog beim Aktivieren

Komponente: `components/propagation/PropagationConsentDialog.vue`. Auslöser: Klick auf Toggle in Settings. Inhalt:

- Klarer Hinweis auf NOAA als US-Behörde
- Was wird übertragen (IP, User-Agent, Zeitstempel)
- Was wird **nicht** übertragen (QSO-Inhalte, Rufzeichen, Locator)
- Rechtsgrundlage und Widerrufsmöglichkeit
- Zwei Buttons: "Aktivieren" / "Abbrechen"
- Verweis auf Datenschutzhinweis in `AboutView`

Bei Klick auf "Aktivieren" → `consent.granted = true`, `grantedAt = new Date().toISOString()`, `enabled = true`.

### 13.4 Widerruf

Toggle in Settings → Klick auf "Deaktivieren":
- `enabled = false`, `consent.granted = false`, `revokedAt = new Date().toISOString()`
- Optionaler zweiter Dialog: "Auch zwischengespeicherte Propagationsdaten löschen?"
  - Ja → `propagationCache` leeren + alle `qso.propagation`-Felder entfernen
  - Nein → Cache bleibt (Daten sind bereits abgerufen, keine neuen Übertragungen)

### 13.5 Aktualisierung des Datenschutzhinweises

**Geänderte Datei:** `src/views/AboutView.vue` — neuer Absatz in der `Datenschutz`-Sektion zwischen `privacyLookup` und `privacyGitHub`:

```vue
<p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.privacyPropagation') }}</p>
```

**Geänderte i18n-Keys:**

`src/i18n/locales/de.json`:
```json
{
  "about": {
    "privacyPropagation": "Wenn Sie die optionale Anzeige der Ausbreitungsbedingungen aktivieren, werden Sonnen- und Geomagnetik-Daten direkt von Ihrem Browser bei der US-Behörde NOAA (services.swpc.noaa.gov) abgerufen. Dabei wird Ihre IP-Adresse in die USA übertragen. Für die USA besteht kein Angemessenheitsbeschluss der EU-Kommission; US-Behörden können auf Daten zugreifen. Es werden keine QSO-Daten übermittelt. Rechtsgrundlage ist Ihre ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a, Art. 49 Abs. 1 lit. a DSGVO). Sie können die Einwilligung jederzeit in den Einstellungen widerrufen."
  },
  "settings": {
    "propagation": {
      "heading": "Ausbreitungsbedingungen",
      "toggleLabel": "Propagationsdaten von NOAA abrufen",
      "toggleHint": "Sendet beim Speichern eines QSOs Anfragen an services.swpc.noaa.gov (USA). Default: aus.",
      "consentTitle": "Einwilligung erforderlich",
      "consentBody": "Zur Anzeige der Ausbreitungsbedingungen werden Sonnen- und Geomagnetik-Daten von der US-Behörde NOAA abgerufen. Dabei wird Ihre IP-Adresse in die USA übertragen. Ein angemessenes Datenschutzniveau im Sinne der DSGVO ist dort nicht garantiert; US-Behörden können auf Daten zugreifen. Es werden keine QSO-Daten übertragen. Sie können die Funktion jederzeit in den Einstellungen deaktivieren.",
      "consentAccept": "Aktivieren",
      "consentCancel": "Abbrechen",
      "revokeClearCache": "Auch zwischengespeicherte Propagationsdaten löschen?",
      "revokeClearYes": "Ja, löschen",
      "revokeClearNo": "Nein, behalten"
    }
  }
}
```

`src/i18n/locales/en.json`:
```json
{
  "about": {
    "privacyPropagation": "If you enable the optional propagation display, solar and geomagnetic data is fetched directly from your browser from the US agency NOAA (services.swpc.noaa.gov). Your IP address is transmitted to the United States in this process. The EU Commission has not issued an adequacy decision for US authorities; US authorities may access this data. No QSO data is transmitted. Legal basis is your explicit consent (Art. 6(1)(a), Art. 49(1)(a) GDPR). You can withdraw consent at any time in the settings."
  },
  "settings": {
    "propagation": {
      "heading": "Propagation conditions",
      "toggleLabel": "Fetch propagation data from NOAA",
      "toggleHint": "Sends requests to services.swpc.noaa.gov (USA) when saving a QSO. Default: off.",
      "consentTitle": "Consent required",
      "consentBody": "To display propagation conditions, solar and geomagnetic data is fetched from the US agency NOAA. Your IP address is transmitted to the United States. The level of data protection is not equivalent to GDPR standards; US authorities may access the data. No QSO data is transmitted. You can disable this feature at any time in the settings.",
      "consentAccept": "Enable",
      "consentCancel": "Cancel",
      "revokeClearCache": "Also delete cached propagation data?",
      "revokeClearYes": "Yes, delete",
      "revokeClearNo": "No, keep"
    }
  }
}
```

### 13.6 Versionierung der Einwilligung

`consent.version` startet bei `1`. Bei jeder relevanten Änderung des Consent-Texts oder der Datenverarbeitung (z. B. zusätzlicher Empfänger wie hamqsl.com) wird die Versionsnummer im Code erhöht. Beim Laden prüft die App: gespeicherte Version < aktuelle Version → Re-Consent erforderlich, `enabled` wird zurückgesetzt.

### 13.7 Technische Schutzmaßnahmen

- `fetch(url, { referrerPolicy: 'no-referrer', credentials: 'omit', mode: 'cors' })`
- Service-Worker-Caching mit 1 h TTL → reduziert Anzahl Requests
- Anfragebündelung: ein Request pro Tag für Backfill statt pro QSO
- Kein Telemetrie-Sammler, kein Logging der NOAA-Antworten an Dritte
- `propagationCache` wird beim "Daten löschen"-Knopf in Settings ebenfalls geleert

### 13.8 Tests für Compliance

- Unit: ohne Consent → `propagationService.enrich()` macht **keinen** Request (mit `vi.spyOn(global, 'fetch')` verifizieren).
- Unit: nach Widerruf → kein neuer Request, alte Daten optional löschbar.
- E2E: Toggle in Settings öffnet Consent-Dialog; Abbruch hinterlässt `enabled = false`.
- E2E: Datenschutzhinweis in `AboutView` enthält den Propagations-Absatz.
