import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('navigates to all pages', async ({ page }) => {
    await page.goto('/')

    // Navigate to history
    await page.click('a[href="/history"]')
    await expect(page.locator('h1')).toContainText(/QSO-Historie|QSO History/)

    // Navigate to operators
    await page.click('a[href="/operators"]')
    await expect(page.locator('h1')).toContainText(/Operator|Operator/)

    // Navigate to settings
    await page.click('a[href="/settings"]')
    await expect(page.locator('h1')).toContainText(/Einstellungen|Settings/)

    // Navigate to QSO entry
    await page.click('a[href="/new"]')
    await expect(page.locator('h1')).toContainText(/Neuer Funkkontakt|New Contact/)

    // Navigate back to dashboard
    await page.click('a[href="/"]')
    await expect(page.locator('h1')).toContainText(/Dashboard/)
  })

  test('has skip-to-content link', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByText(/Zum Inhalt springen|Skip to content/)
    await expect(skipLink).toBeAttached()
  })
})
