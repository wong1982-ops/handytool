"""Screenshot the interactive generation table — all on vs text only vs custom."""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto(f"{BASE}/tools/story-studio", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)

    page.locator("textarea").first.fill("A brave little cat discovers a hidden garden behind the old library where flowers sing")
    page.wait_for_timeout(500)
    page.locator("button:has-text('Generate Story Paths')").click()
    print("Generating concepts...")
    page.wait_for_timeout(25000)

    # Scroll to bottom for screenshots
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/test-table-allon.png", full_page=False)
    print("All On: /tmp/test-table-allon.png")

    # Click "Text Only"
    text_only = page.locator("button:has-text('Text Only')").first
    if text_only.is_visible():
        text_only.click()
        page.wait_for_timeout(500)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(300)
        page.screenshot(path="/tmp/test-table-textonly.png", full_page=False)
        print("Text Only: /tmp/test-table-textonly.png")

    # Custom: turn illustrations back on but keep narration off
    page.locator("button:has-text('All On')").first.click()
    page.wait_for_timeout(300)
    # Uncheck narration (3rd checkbox from toggleable rows)
    narration_row = page.locator("tr:has-text('Narration')")
    narration_row.click()
    page.wait_for_timeout(300)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/test-table-custom.png", full_page=False)
    print("Custom (no narration): /tmp/test-table-custom.png")

    browser.close()
    print("Done!")
