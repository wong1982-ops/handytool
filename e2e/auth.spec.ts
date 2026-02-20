import { test, expect } from '@playwright/test'

test.describe('Auth UI', () => {
  test('shows Sign In button in header when not authenticated', async ({ page }) => {
    await page.goto('/')
    // Wait for auth loading to complete
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
  })

  test('opens sign-in modal when clicking Sign In', async ({ page }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.click()

    // Modal should appear
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Should have heading
    await expect(page.getByText('Sign in to Toolk1t')).toBeVisible()

    // Should have Google and Facebook buttons
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue with Facebook/i })).toBeVisible()
  })

  test('closes sign-in modal on Escape key', async ({ page }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('closes sign-in modal on backdrop click', async ({ page }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Click on the backdrop (the overlay outside the modal)
    await page.mouse.click(10, 10)
    await expect(dialog).not.toBeVisible()
  })

  test('closes sign-in modal on close button', async ({ page }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.getByRole('button', { name: /Close/i }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('sign-in modal has proper accessibility attributes', async ({ page }) => {
    await page.goto('/')
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAttribute('aria-labelledby')
  })
})
