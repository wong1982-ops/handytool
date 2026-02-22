import { test, expect } from '@playwright/test'

test.describe('Terms of Service', () => {
  test('renders Terms of Service page with all sections', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeVisible()
    await expect(page.getByText('Last updated')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Agreement to Terms/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Limitation of Liability/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Contact/i })).toBeVisible()
  })

  test('footer link navigates to Terms page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Terms of Service' }).click()
    await expect(page).toHaveURL('/terms')
    await expect(page.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeVisible()
  })
})
