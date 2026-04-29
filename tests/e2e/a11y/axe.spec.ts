/**
 * Automated accessibility scan with axe-core across all main routes.
 *
 * Requires: `npm install --save-dev @axe-core/playwright`
 *
 * Once installed, switch the import below to the real package. The current
 * setup is written so that the test suite is skipped (with a clear message)
 * when the dependency is missing — this keeps CI green until the dep is
 * added in a follow-up PR.
 */
import { test, expect } from '@playwright/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AxeBuilder: any
try {
  // @ts-expect-error optional dependency, not yet declared in package.json
  AxeBuilder = (await import('@axe-core/playwright')).default
} catch {
  AxeBuilder = null
}

const ROUTES = [
  '/',
  '/new',
  '/history',
  '/statistics',
  '/map',
  '/operators',
  '/settings',
  '/about',
] as const

test.describe('a11y: axe-core scan (WCAG 2.1 AA)', () => {
  test.skip(!AxeBuilder, '@axe-core/playwright not installed; run `npm i -D @axe-core/playwright`')

  for (const path of ROUTES) {
    test(`route ${path} has no AA violations`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})

test('a11y: <html lang> reflects the active locale', async ({ page }) => {
  await page.goto('/')
  const lang = await page.evaluate(() => document.documentElement.lang)
  expect(lang).toMatch(/^(de|en)$/)
})
