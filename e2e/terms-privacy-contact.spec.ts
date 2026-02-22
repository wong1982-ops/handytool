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

test.describe('Privacy Policy', () => {
  test('renders Privacy Policy page with all sections', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeVisible()
    await expect(page.getByText('Last updated')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Information We Collect/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your Rights/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Contact/i })).toBeVisible()
  })

  test('footer link navigates to Privacy page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Privacy Policy' }).click()
    await expect(page).toHaveURL('/privacy')
    await expect(page.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeVisible()
  })
})

test.describe('Contact Support', () => {
  test('renders contact form with all fields', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { level: 1, name: /Contact Support/i })).toBeVisible()
    await expect(page.getByLabel(/Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Subject/i)).toBeVisible()
    await expect(page.getByLabel(/Message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send Message/i })).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: /Send Message/i }).click()
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('footer link navigates to Contact page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Contact Support' }).click()
    await expect(page).toHaveURL('/contact')
    await expect(page.getByRole('heading', { level: 1, name: /Contact Support/i })).toBeVisible()
  })
})
