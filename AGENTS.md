# AGENTS.md

This file provides guidance to AI coding assistants (Claude Code, GitHub Copilot, etc.) when working with code in this repository.

## Project Overview

QSOlog is a Vue 3 PWA for amateur radio operators to log QSO (radio contact) records. It runs entirely offline using IndexedDB (via Dexie.js) with no backend server. Deployed to GitHub Pages at `/qso-log/`.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (`vue-tsc -b`) then build
- `npm test` — Run Vitest unit tests
- `npm test -- tests/unit/utils/frequency.test.ts` — Run a single test file
- `npm run test:watch` — Vitest in watch mode
- `npm run test:e2e` — Playwright E2E tests (needs `npx playwright install` first; runs against `vite preview` on port 4173)
- `npm run release` — Bump version, generate changelog, create GitHub Release (uses release-it with conventional commits)

## Architecture

**Data flow:** Views → Pinia stores → Repositories → Dexie (IndexedDB)

- **`src/views/`** — 7 page-level components, lazy-loaded by Vue Router
- **`src/stores/`** — Pinia stores: `qsoStore` (CRUD + filtering/sorting/pagination), `operatorStore`, `settingsStore`, `formDraftStore` (auto-saves to localStorage)
- **`src/db/`** — `database.ts` defines the Dexie schema (4 versions). `repositories/` contains `qsoRepository.ts` and `operatorRepository.ts` as the data access layer
- **`src/composables/`** — Feature-scoped reusable logic (statistics, leaflet map, PWA install, export/import, callsign lookup)
- **`src/services/`** — Business logic organized by domain: `export/` and `import/` (ADIF/CSV/JSON strategies), `callsign/` (QRZ.com + HamQTH providers), `pdf/`, `sync/`
- **`src/utils/`** — Pure functions: frequency↔band mapping, RST defaults by mode, Maidenhead locator math, DXCC country lookup by callsign prefix, UTC date formatting
- **`src/types/`** — TypeScript interfaces (`qso.ts`, `operator.ts`, `settings.ts`, etc.)
- **`src/i18n/locales/`** — German (`de.json`) and English (`en.json`)

## Key Patterns

- Vue 3 Composition API with `<script setup>` exclusively
- Tailwind CSS 4 with dark mode (`dark:` classes) and a custom primary color palette
- Strict TypeScript: `strict`, `noUnusedLocals`, `noUnusedParameters` enforced
- No ESLint/Prettier — type-checking is the primary code quality gate
- Conventional Commits required (feat→minor, fix→patch, BREAKING CHANGE→major)

## Testing

- **Unit tests:** `tests/unit/**/*.test.ts` using Vitest + jsdom + Vue Test Utils
- **E2E tests:** `tests/e2e/**/*.spec.ts` using Playwright (Chromium only)
- Test directory structure mirrors `src/`

## Domain Concepts

- **QSO:** A logged radio contact (callsign, frequency, band, mode, RST, date/time, locator, notes, QSL status)
- **Band detection:** Frequency is auto-mapped to one of 14 IARU Region 1 bands
- **RST:** Signal report format varies by mode (e.g., 599 for CW/digital, 59 for phone)
- **Maidenhead locator:** Grid square system for geographic positions; used for distance/bearing calculations
- **DXCC:** Country identification from callsign prefix (data embedded in `utils/dxcc.ts`)
- **Operator:** Multi-operator support; all views and statistics can be filtered per operator
