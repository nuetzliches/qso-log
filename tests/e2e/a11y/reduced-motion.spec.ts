import { test, expect } from '@playwright/test'

test.describe('a11y: prefers-reduced-motion', () => {
  test('disables CSS animations on the dashboard', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Inject a probe element with an explicit transition; under
    // prefers-reduced-motion the global stylesheet flattens it to ~0.
    const computed = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.transition = 'opacity 1s ease'
      document.body.appendChild(probe)
      const style = getComputedStyle(probe)
      const result = style.transitionDuration
      probe.remove()
      return result
    })

    // Browsers normalise 0.01ms to either "0.01ms" or "0s".
    expect(computed === '0.01ms' || computed === '0s' || computed === '0ms').toBeTruthy()
  })
})
