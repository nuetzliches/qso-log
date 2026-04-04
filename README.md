# QSOlog

Offline-first PWA logbook for amateur radio operators.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

## Features

- **Offline-first** -- works entirely without internet after the first load. All data is stored locally in the browser (IndexedDB).
- **QSO logging** -- log contacts with auto-incrementing sequence numbers, UTC timestamps, mode-aware RST defaults, and automatic band detection from frequency.
- **Import & Export** -- ADIF 3.1.4, CSV, and JSON. Import includes validation, duplicate detection, and preview before committing.
- **PDF reports** -- generate printable QSO reports (A4 landscape) with summary statistics.
- **Callsign lookup** -- optional online lookup via [QRZ.com](https://www.qrz.com/) or [HamQTH](https://www.hamqth.com/) to auto-fill name, QTH, country, and grid square.
- **Multi-operator** -- manage multiple operator profiles and switch between them.
- **Internationalization** -- German and English UI.
- **Dark mode** -- light, dark, or system-preference theme.
- **PWA** -- installable on desktop and mobile with home screen shortcuts.
- **Accessible** -- semantic HTML, ARIA roles, keyboard navigable.

## Quick Start

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

QSOlog has four main views:

| View | Description |
|------|-------------|
| **New QSO** | Log a new contact. Select mode, enter frequency (band auto-detects), callsign, RST, and remarks. Common FT8/SSB/FM frequencies are available as presets. |
| **History** | Browse, filter, and search your logged QSOs. Export to ADIF/CSV/JSON, import from files (drag & drop supported), and generate PDF reports. |
| **Operators** | Manage operator profiles with callsign, name, and QTH. |
| **Settings** | Configure language, theme, your station callsign (used in PDF headers), and optional QRZ.com / HamQTH API credentials for callsign lookups. |

## Supported Bands

IARU Region 1: 160m, 80m, 60m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m, 2m, 70cm, 23cm

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) (state management)
- [Dexie.js](https://dexie.org/) (IndexedDB)
- [Tailwind CSS](https://tailwindcss.com/) + [Headless UI](https://headlessui.com/)
- [jsPDF](https://github.com/parallax/jsPDF) (PDF generation)
- [adif-parser-ts](https://github.com/tcort/adif-parser-ts) (ADIF parsing)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (service worker & manifest)

## Testing

```bash
# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# E2E tests (requires Playwright browsers)
npx playwright install
npm run test:e2e
```

## License

[MIT](LICENSE)
