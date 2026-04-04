import { test, expect } from '@playwright/test'

test.describe('QSO History', () => {
  test('shows history page with filters', async ({ page }) => {
    await page.goto('/history')
    await expect(page.locator('h1')).toContainText(/QSO-Historie|QSO History/)
    await expect(page.locator('#filter-callsign')).toBeVisible()
  })

  test('shows export and import buttons', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(/Exportieren|Export/)).toBeVisible()
    await expect(page.getByText(/Importieren|Import/)).toBeVisible()
  })

  test('shows empty state when no QSOs', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(/Keine Funkkontakte|No contacts/)).toBeVisible()
  })
})
