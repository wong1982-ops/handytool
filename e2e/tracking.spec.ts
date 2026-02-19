import { test, expect } from '@playwright/test'

test.describe('Page Tracking', () => {
  test('tool pages load successfully', async ({ page }) => {
    const tools = [
      '/tools/ipcheck',
      '/tools/myip',
      '/tools/speedtest',
      '/tools/json-converter',
      '/tools/image-editor',
      '/tools/pdf-converter',
      '/tools/currency-exchange',
    ]

    for (const toolPath of tools) {
      const response = await page.goto(toolPath)
      expect(response?.status()).toBe(200)
    }
  })

  test('session ID is created in sessionStorage on tool visit', async ({ page }) => {
    await page.goto('/tools/ipcheck')
    // Wait for the page to load and tracking to initialize
    await page.waitForTimeout(2000)

    const sessionId = await page.evaluate(() => sessionStorage.getItem('ht-session-id'))
    expect(sessionId).toBeTruthy()
    // Should be a valid UUID
    expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  test('session ID persists across tool page navigations', async ({ page }) => {
    await page.goto('/tools/ipcheck')
    await page.waitForTimeout(1000)
    const sessionId1 = await page.evaluate(() => sessionStorage.getItem('ht-session-id'))

    await page.goto('/tools/json-converter')
    await page.waitForTimeout(1000)
    const sessionId2 = await page.evaluate(() => sessionStorage.getItem('ht-session-id'))

    expect(sessionId1).toBe(sessionId2)
  })
})
