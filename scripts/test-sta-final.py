"""Final test: 10MB JPEG upload → resize → style → generate."""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Upload
    print("1. Upload test.jpeg (10MB)...")
    page.locator('input[type="file"]').first.set_input_files("/Users/mercury/Downloads/test.jpeg")
    page.wait_for_timeout(3000)

    # Check resize worked
    size = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img');
        for (const img of imgs) {
            if (img.src && img.src.startsWith('data:image')) {
                return Math.round(img.src.length / 1024);
            }
        }
        return -1;
    }""")
    print(f"   Resized: {size}KB ({'✓ under limit' if size < 3000 else '✗ too large'})")

    # Use sketch
    page.locator("text=Use this sketch").first.click()
    page.wait_for_timeout(1000)
    print("2. ✓ Used sketch (step 2)")

    # Pick style
    page.locator("text=Cartoon").first.click()
    page.wait_for_timeout(500)
    print("3. ✓ Selected Cartoon")

    # Click generate - find by partial text match
    page.wait_for_timeout(500)
    gen_clicked = False
    for btn in page.locator("button").all():
        try:
            txt = btn.text_content(timeout=1000) or ""
            if ("magic" in txt.lower() or "generate" in txt.lower()) and btn.is_visible():
                btn.click(timeout=5000)
                gen_clicked = True
                print(f"4. ✓ Clicked '{txt.strip()}'")
                break
        except Exception:
            continue

    if not gen_clicked:
        print("4. ✗ Could not find generate button")
        page.screenshot(path="/tmp/sta-final-debug.png")
        browser.close()
        exit(1)

    # Wait for results
    print("5. Waiting for results...")
    start = time.time()
    for i in range(30):
        page.wait_for_timeout(5000)
        elapsed = time.time() - start
        if "r2.dev" in page.content():
            print(f"   ✓ RESULTS after {elapsed:.0f}s!")
            page.screenshot(path="/tmp/sta-final-results.png")
            print(f"   Screenshot: /tmp/sta-final-results.png")
            break
        err_els = page.locator("[class*='text-red']").all()
        for el in err_els:
            try:
                if el.is_visible() and el.text_content(timeout=500):
                    print(f"   ✗ Error: {el.text_content(timeout=500)}")
                    page.screenshot(path="/tmp/sta-final-error.png")
                    browser.close()
                    exit(1)
            except Exception:
                continue
        if i % 4 == 3:
            print(f"   ... ({elapsed:.0f}s)")
    else:
        print(f"   Timed out after {time.time()-start:.0f}s")
        page.screenshot(path="/tmp/sta-final-timeout.png")

    browser.close()
    print("\n✅ Done")
