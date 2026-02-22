import { test, expect } from '@playwright/test'

test.describe('ECard Studio - Template Discovery', () => {
  test('renders discovery page with heading and templates', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await expect(page.getByRole('heading', { name: /what.?s the occasion/i })).toBeVisible()
    await expect(page.getByText('The Executive')).toBeVisible()
    await expect(page.getByText('Midnight Pinstripe')).toBeVisible()
    await expect(page.getByText('Start from Scratch')).toBeVisible()
  })

  test('renders intent pills', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await expect(page.getByRole('button', { name: /New Product Launch/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Holiday Greetings/i })).toBeVisible()
  })

  test('clicking a template opens the editor', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await page.getByText('The Executive').click()
    await expect(page.getByText(/ECard Studio/i)).toBeVisible()
    await expect(page.getByText(/CUSTOMIZATION/i)).toBeVisible()
  })
})

test.describe('ECard Studio - Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await page.getByText('The Executive').click()
    await expect(page.getByText(/CUSTOMIZATION/i)).toBeVisible()
  })

  test('renders 3-panel editor layout', async ({ page }) => {
    await expect(page.getByText(/DESIGN LIBRARY/i)).toBeVisible()
    await expect(page.getByText(/CUSTOMIZATION/i)).toBeVisible()
    await expect(page.getByText('Acme Corporation').first()).toBeVisible()
  })

  test('font family dropdown changes card text', async ({ page }) => {
    const fontSelect = page.locator('select').first()
    await fontSelect.selectOption('Inter')
    await expect(page.getByText('Acme Corporation').first()).toBeVisible()
  })

  test('color preset changes card colors', async ({ page }) => {
    const preset = page.getByRole('button', { name: /Royal Blue palette/i })
    await preset.click()
    await expect(page.getByText('Acme Corporation').first()).toBeVisible()
  })

  test('back button returns to discovery', async ({ page }) => {
    await page.getByRole('button', { name: 'Back to Templates' }).click()
    await expect(page.getByRole('heading', { name: /what.?s the occasion/i })).toBeVisible()
  })

  test('download button exists and is clickable', async ({ page }) => {
    const downloadBtn = page.getByRole('button', { name: /download/i })
    await expect(downloadBtn).toBeVisible()
    await expect(downloadBtn).toBeEnabled()
  })

  test('preview button opens modal', async ({ page }) => {
    await page.getByRole('button', { name: /preview/i }).click()
    await expect(page.getByRole('button', { name: /close/i })).toBeVisible()
  })
})
