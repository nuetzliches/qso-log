# QSOlog

Offline-first PWA logbook for amateur radio operators.

**Live app:** https://nuetzliches.github.io/qso-log/

[![GitHub Release](https://img.shields.io/github/v/release/nuetzliches/qso-log)](https://github.com/nuetzliches/qso-log/releases) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

## Features

- **Offline-first** - works entirely without internet after the first load. All data is stored locally in the browser (IndexedDB).
- **QSO logging** - log contacts with auto-incrementing sequence numbers, UTC timestamps, mode-aware RST defaults, and automatic band detection from frequency. Form drafts are auto-saved so nothing is lost on accidental page reloads.
- **Map view** - visualize QSO locations on an interactive Leaflet map with marker clustering and dark-mode support.
- **Maidenhead locator** - enter grid squares for your station and contacts. Distance and bearing are calculated automatically.
- **QSL tracking** - track QSL sent/received status per QSO (yes / no / requested).
- **Import & Export** - ADIF 3.1.4, CSV, and JSON. Import includes validation, duplicate detection, and preview before committing.
- **PDF reports** - generate printable QSO reports (A4 landscape) with summary statistics.
- **Callsign lookup** - optional online lookup via [QRZ.com](https://www.qrz.com/) or [HamQTH](https://www.hamqth.com/) to auto-fill name, QTH, country, and grid square.
- **Multi-operator** - manage multiple operator profiles and switch between them.
- **Internationalization** - German and English UI with automatic browser-language detection on first visit.
- **Dark mode** - light, dark, or system-preference theme.
- **PWA** - installable on desktop and mobile with home screen shortcuts and a custom install prompt.
- **Mobile-optimized** - responsive navigation 
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

QSOlog has six main views:

| View | Description |
|------|-------------|
| **New QSO** | Log a new contact. Select mode, enter frequency (band auto-detects), callsign, RST, locator, and remarks. Common FT8/SSB/FM frequencies are available as presets. |
| **History** | Browse, filter, and search your logged QSOs. Export to ADIF/CSV/JSON, import from files (drag & drop supported), and generate PDF reports. |
| **Map** | Interactive map showing QSO locations based on Maidenhead locators, with marker clustering. |
| **Operators** | Manage operator profiles with callsign, name, and QTH. |
| **Settings** | Configure language, theme, your station callsign (used in PDF headers), and optional QRZ.com / HamQTH API credentials for callsign lookups. |
| **About** | Version info, licenses, and AI disclosure. |

## Supported Bands

IARU Region 1: 160m, 80m, 60m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m, 2m, 70cm, 23cm

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) (state management)
- [Dexie.js](https://dexie.org/) (IndexedDB)
- [Tailwind CSS](https://tailwindcss.com/) + [Headless UI](https://headlessui.com/)
- [Leaflet](https://leafletjs.com/) + [leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) (map & clustering)
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (PDF generation)
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

## Releasing

This project uses [release-it](https://github.com/release-it/release-it) for semi-automatic releases. A single command bumps the version, generates the changelog, creates a git tag, and publishes a GitHub Release.

### Commit conventions

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) so the changelog is generated correctly:

| Prefix | Example | Changelog section | Version bump |
|--------|---------|-------------------|--------------|
| `feat:` | `feat(qso): add SOTA field` | Features | minor |
| `fix:` | `fix: correct RST default` | Bug Fixes | patch |
| `docs:` | `docs: update README` | Documentation | patch |
| `perf:` | `perf: speed up import` | Performance | patch |
| `refactor:` | `refactor: extract utils` | Refactoring | patch |
| `test:` | `test: add export tests` | Tests | patch |
| `BREAKING CHANGE` | footer in any commit | — | **major** |

Commits prefixed with `chore:`, `style:`, `ci:`, or `build:` are hidden from the changelog.

### Prerequisites

Authenticate with GitHub so release-it can create GitHub Releases:

```bash
gh auth login
```

Alternatively, set a `GITHUB_TOKEN` environment variable with `contents: write` permission.

### Creating a release

```bash
# Interactive -- prompts for patch / minor / major
npm run release

# Directly bump a specific level
npm run release -- patch
npm run release -- minor

# Preview without making any changes
npm run release -- --dry-run
```

### What happens automatically

1. Unit tests and production build run as a safety gate
2. Version in `package.json` is bumped
3. `CHANGELOG.md` is updated from commits since the last tag
4. A git commit (`chore: release vX.Y.Z`) and annotated tag (`vX.Y.Z`) are created
5. Commit and tag are pushed to `origin/main`
6. A GitHub Release with auto-generated notes is published
7. The existing GitHub Pages workflow deploys the new build

## License

[MIT](LICENSE)

## AI Usage
Parts of this codebase were developed with the assistance of AI coding tools 
(e.g. Claude, GitHub Copilot). All code has been reviewed and is maintained 
by human contributors.