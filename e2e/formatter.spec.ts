import { test, expect } from '@playwright/test'

test.describe('Formatter Tool', () => {
  test('formats valid JSON', async ({ page }) => {
    await page.goto('/tools/formatter')
    await page.waitForLoadState('networkidle')

    await page.locator('#formatter-input').fill('{"name":"test","items":[1,2,3]}')

    // Click the Run button (last "Format" button on page — the run button on the right)
    await page.getByRole('button', { name: /^Format$/ }).last().click()

    const output = await page.locator('#formatter-output').inputValue()
    expect(output).toContain('"name": "test"')
    expect(output).toContain('"items"')
  })

  test('shows validation error for invalid JSON', async ({ page }) => {
    await page.goto('/tools/formatter')
    await page.waitForLoadState('networkidle')

    await page.locator('#formatter-input').fill('{"invalid": }')
    await page.getByRole('button', { name: /^Format$/ }).last().click()

    await expect(page.locator('text=/Invalid/i').first()).toBeVisible()
  })

  test('switches to Chinese language', async ({ page }) => {
    await page.goto('/tools/formatter')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: '中文' }).click()
    await expect(page.locator('h1').first()).toContainText('格式化工具')
  })

  test('diff mode shows side-by-side inputs', async ({ page }) => {
    await page.goto('/tools/formatter')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Diff' }).first().click()

    await expect(page.locator('#diff-input-a')).toBeVisible()
    await expect(page.locator('#diff-input-b')).toBeVisible()

    await page.locator('#diff-input-a').fill('hello\nworld')
    await page.locator('#diff-input-b').fill('hello\nthere')

    await expect(page.locator('text=/world/').first()).toBeVisible()
    await expect(page.locator('text=/there/').first()).toBeVisible()
  })

  test('auto-detects JSON format', async ({ page }) => {
    await page.goto('/tools/formatter')
    await page.waitForLoadState('networkidle')

    await page.locator('#formatter-input').fill('{"detected": true}')

    // The format dropdown should show "Detected: JSON" in the auto option
    const selectValue = page.locator('select#format-select')
    await expect(selectValue.locator('option[value="auto"]')).toContainText('JSON')
  })
})
