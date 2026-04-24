import { test, expect } from '@playwright/test'

test.describe('QSO Entry', () => {
  test('shows the QSO entry form', async ({ page }) => {
    await page.goto('/new')
    await expect(page.locator('h1')).toContainText(/Neuer Funkkontakt|New Contact/)
    await expect(page.locator('#qso-callsign')).toBeVisible()
    await expect(page.locator('#qso-date')).toBeVisible()
    await expect(page.locator('#qso-time')).toBeVisible()
  })

  test('can fill in and submit a QSO', async ({ page }) => {
    await page.goto('/new')

    await page.fill('#qso-callsign', 'DL1ABC')
    await page.fill('#qso-date', '2024-03-15')
    await page.fill('#qso-time', '14:30')

    // Submit
    await page.click('button[type="submit"]')

    // Should show success message
    await expect(page.getByText(/QSO gespeichert|QSO saved/)).toBeVisible()

    // Callsign should be cleared after save
    await expect(page.locator('#qso-callsign')).toHaveValue('')
  })

  test('shows sequence number', async ({ page }) => {
    await page.goto('/new')
    await expect(page.getByText(/Nr\.|No\./)).toBeVisible()
  })
})
