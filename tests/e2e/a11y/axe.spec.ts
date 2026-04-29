/**
 * Automated accessibility scan with axe-core across all main routes.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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
