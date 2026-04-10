# Changelog

## [0.7.0](https://github.com/nuetzliches/qso-log/compare/v0.6.0...v0.7.0) (2026-04-10)

### Features

* **pwa:** persist install banner dismissal and add install button to settings ([f4da842](https://github.com/nuetzliches/qso-log/commit/f4da842d3bab1a16f9794adfafeb1195567993f6))

### Bug Fixes

* **locator:** clamp lat/lon inputs and guard indices in latLonToLocator ([b8d6a56](https://github.com/nuetzliches/qso-log/commit/b8d6a5683f5753ae32cae3641e0ee96d1057b540))

## [0.6.0](https://github.com/nuetzliches/qso-log/compare/v0.5.0...v0.6.0) (2026-04-10)

### Features

* **locator:** add GPS button to own locator field ([ad47392](https://github.com/nuetzliches/qso-log/commit/ad47392cb006a15075c10b8b62f2c3dba8760750))
* **statistics:** add statistics page with interactive charts ([4d1a779](https://github.com/nuetzliches/qso-log/commit/4d1a779bec539d43d2733841c767f8fe0234d019))

### Bug Fixes

* ensure PWA banners are visible above bottom navigation on mobile ([ea852ba](https://github.com/nuetzliches/qso-log/commit/ea852baa40c5cb27615fd74a0926b28aad7dd172))
* prevent line breaks between flag emoji and callsign in tables ([6fa67b3](https://github.com/nuetzliches/qso-log/commit/6fa67b30c1c71f49755301d46828c69d4423d5c5))

### Documentation

* update README with statistics page, GPS locator, and Chart.js ([b7a40c3](https://github.com/nuetzliches/qso-log/commit/b7a40c362d49e66c1d3d3ffd868cd688d0d7df09))

## [0.5.0](https://github.com/nuetzliches/qso-log/compare/v0.4.1...v0.5.0) (2026-04-07)

### Features

* add custom PWA install prompt banner ([5fafef8](https://github.com/nuetzliches/qso-log/commit/5fafef86688eaea7232d6d5849d4d30922af1a26))
* auto-detect browser language on first visit ([283f47c](https://github.com/nuetzliches/qso-log/commit/283f47ccf83342e401a5534058e8951d653876af))
* **form:** display RST and QSL fields in single row on desktop ([cf18777](https://github.com/nuetzliches/qso-log/commit/cf187774f7e2bf9bfea57f5eae4074d47353fd79))
* **form:** mobile layout improvements and UX enhancements ([ac8dbe1](https://github.com/nuetzliches/qso-log/commit/ac8dbe19e5cf8d0bd45fae70b2df75d6e7257ad1))
* persist language and appearance settings on reload ([d49e220](https://github.com/nuetzliches/qso-log/commit/d49e22036ca5ac038a4fae40b5eca639488e2ea3))
* **qso:** improve date field readability on mobile in recent entries table ([b9461d9](https://github.com/nuetzliches/qso-log/commit/b9461d90fe92aa7fdc13a4c6af4e5c47daa1d4fa))

### Bug Fixes

* **qso:** fix edit mode URL param, add updatedAt tracking, reset form on nav ([64f5049](https://github.com/nuetzliches/qso-log/commit/64f50494552948e8bb3a2e3235453beea8c01221))
* resolve TypeScript type error for locale assignment ([b8d6953](https://github.com/nuetzliches/qso-log/commit/b8d69539a9715a19cfcab75908b86852f7f02ffb))

## [0.4.1](https://github.com/nuetzliches/qso-log/compare/v0.4.0...v0.4.1) (2026-04-05)

### Bug Fixes

* add periodic service worker update checks ([a43e463](https://github.com/nuetzliches/qso-log/commit/a43e46351213397e5ab2d5ede6b2198d8cad6914))

## [0.4.0](https://github.com/nuetzliches/qso-log/compare/v0.3.0...v0.4.0) (2026-04-05)

### Features

* **mobile-nav:** add "Mehr"-button with slide-up panel for Karte, Einstellungen, Über ([f8a7b49](https://github.com/nuetzliches/qso-log/commit/f8a7b49540a2070d39cc7cb617ec5ce25bc9ef97))
* **settings:** remove language and appearance selectors from settings page ([dab1dcf](https://github.com/nuetzliches/qso-log/commit/dab1dcf66e5fc8ae0c2eb8ec695fff20faf907dc))

### Bug Fixes

* prevent data loss on SW update with persistent storage and draft auto-save ([e188699](https://github.com/nuetzliches/qso-log/commit/e188699f8cf8ff2fcdf414130d61a0122bd012f8))
* raise mobile nav z-index above Leaflet panes ([ba37c5f](https://github.com/nuetzliches/qso-log/commit/ba37c5fe09a1c633dd5cf419f397aceef63bd274))
* restore "Mehr" menu functionality on mobile map view ([fcf333c](https://github.com/nuetzliches/qso-log/commit/fcf333c2aec5cccc8da130a699cd186e5921ccba))
* **settings:** align input widths consistently ([7a92804](https://github.com/nuetzliches/qso-log/commit/7a92804622874fa428863f99d59f4f19f498feea))

## [0.3.0](https://github.com/nuetzliches/qso-log/compare/v0.2.0...v0.3.0) (2026-04-05)

### Features

* **about:** create dedicated About page with legal notices and AI disclosure ([1251219](https://github.com/nuetzliches/qso-log/commit/1251219f356565e9d4b26b474a16856c2c025b6c))
* **history:** reorder remarks column and add distance column ([7e803f9](https://github.com/nuetzliches/qso-log/commit/7e803f90b3a23832adeae5095db3600107bd2fd7))
* **locator:** add Maidenhead locator support for station and contact ([c58f24b](https://github.com/nuetzliches/qso-log/commit/c58f24bccfff1e0f42ed17b6f2f1f5476cb98074))
* **map:** add QSO map view with Leaflet, clustering and dark mode ([13b12bf](https://github.com/nuetzliches/qso-log/commit/13b12bf79e5dc23ecc4a40b44b7175358556c5bc))
* **pdf:** improve PDF export layout and footer ([a09d2b2](https://github.com/nuetzliches/qso-log/commit/a09d2b26a2531c361c2cc0400af423e4bc5fb126))
* **settings:** remove optional first name field and refactor layout ([2f54015](https://github.com/nuetzliches/qso-log/commit/2f54015234b3d4d0226b258ce9ead44ad3069d8f))

## [0.2.0](https://github.com/nuetzliches/qso-log/compare/v0.1.0...v0.2.0) (2026-04-05)

### Features

* **form:** move operator select to top, add UTC "Now" button ([fa0280f](https://github.com/nuetzliches/qso-log/commit/fa0280f7713055d6a8485c93ee4bf5e46a58de77))
* **pwa:** replace placeholder icons with QSO branding ([a8d96a6](https://github.com/nuetzliches/qso-log/commit/a8d96a6b6f58a239b5c75559793cdf00a7618eec))
* **table:** show operator column when multiple operators are configured ([aa72f86](https://github.com/nuetzliches/qso-log/commit/aa72f8608df70b062362da7a5693664fbac42f70))
* **ui:** replace theme/locale toggles with dropdowns, fix sidebar footer ([0f590f8](https://github.com/nuetzliches/qso-log/commit/0f590f8f8dbff4fd874a7ad6bc380b83b63fc8de))
* **ui:** show app version with dev badge in settings and sidebar ([7c6bc62](https://github.com/nuetzliches/qso-log/commit/7c6bc62dd9dca21dc4ecfe2238f148ac13188d75))

### Documentation

* add Releasing section to README ([e8de26e](https://github.com/nuetzliches/qso-log/commit/e8de26e3ffaaba6e216852b14a08b826d6fd4575))
