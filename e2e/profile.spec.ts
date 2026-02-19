import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  test('redirects to home when not authenticated', async ({ page }) => {
    await page.goto('/profile')
    // Should redirect to home since user is not logged in
    await page.waitForURL('/', { timeout: 10000 })
    expect(page.url()).toContain('/')
  })

  test('profile page is accessible via direct URL', async ({ page }) => {
    const response = await page.goto('/profile')
    // Should return 200 even if it redirects client-side
    expect(response?.status()).toBe(200)
  })
})

test.describe('Profile Prompt', () => {
  test('profile prompt does not show for anonymous users', async ({ page }) => {
    // Visit several tools
    await page.goto('/tools/ipcheck')
    await page.waitForTimeout(500)
    await page.goto('/tools/json-converter')
    await page.waitForTimeout(500)
    await page.goto('/tools/image-editor')
    await page.waitForTimeout(500)

    // Prompt should NOT appear for anonymous users
    const prompt = page.getByRole('alert')
    await expect(prompt).not.toBeVisible({ timeout: 3000 })
  })
})
