"""Test with the real 10MB test.jpeg — verify resize + generate works."""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("Testing with ~/Downloads/test.jpeg (10MB, 3024x4032)...")
    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Upload the real file
    print("\n1. Uploading 10MB test.jpeg...")
    file_input = page.locator('input[type="file"]').first
    file_input.set_input_files("/Users/mercury/Downloads/test.jpeg")
    page.wait_for_timeout(3000)

    # Check preview
    use_btn = page.locator("text=Use this sketch").first
    if use_btn.count() > 0 and use_btn.is_visible():
        print("   ✓ Preview shown")

        # Check the resized data URL size
        size_info = page.evaluate("""() => {
            // Find the preview image src
            const imgs = document.querySelectorAll('img');
            for (const img of imgs) {
                if (img.src && img.src.startsWith('data:image')) {
                    return {
                        length: img.src.length,
                        sizeKB: Math.round(img.src.length / 1024),
                        mime: img.src.substring(5, img.src.indexOf(';')),
                    };
                }
            }
            return null;
        }""")
        if size_info:
            print(f"   Preview data URL: {size_info['sizeKB']}KB ({size_info['mime']})")

        use_btn.click()
        page.wait_for_timeout(1000)
        print("   ✓ Clicked 'Use this sketch'")

        # Check what state.sketchDataUrl looks like (the resized version)
        sketch_size = page.evaluate("""() => {
            // The sketch is stored in React state, we can check via the form data
            // For now, let's check the actual payload that would be sent
            const imgs = document.querySelectorAll('img');
            let dataUrl = null;
            for (const img of imgs) {
                if (img.src && img.src.startsWith('data:image')) {
                    dataUrl = img.src;
                    break;
                }
            }
            if (!dataUrl) return { error: 'no data url found' };
            return {
                totalLength: dataUrl.length,
                sizeKB: Math.round(dataUrl.length / 1024),
                sizeMB: (dataUrl.length / (1024 * 1024)).toFixed(2),
                mime: dataUrl.substring(5, dataUrl.indexOf(';')),
                underLimit: dataUrl.length < 3 * 1024 * 1024,
            };
        }""")
        print(f"   Resized sketch: {sketch_size}")

    # Pick style
    style_btn = page.locator("text=Cartoon").first
    if style_btn.count() > 0:
        style_btn.click()
        page.wait_for_timeout(500)
        print("   ✓ Selected Cartoon")

    # Generate
    print("\n2. Generating...")
    for b in page.locator("button").all():
        t = (b.text_content() or "").lower()
        if ("magic" in t or "generate" in t) and b.is_visible() and b.is_enabled():
            b.click()
            print(f"   Clicked: {b.text_content().strip()}")
            break

    start = time.time()
    success = False
    for i in range(30):  # up to 150s
        page.wait_for_timeout(5000)
        elapsed = time.time() - start
        content = page.content()

        if "r2.dev" in content:
            print(f"\n   ✓ SUCCESS! Results after {elapsed:.0f}s")
            success = True
            break
        if "error" in content.lower() and ("failed" in content.lower() or "insufficient" in content.lower()):
            page.screenshot(path="/tmp/sta-jpeg-error.png")
            # Extract error text
            error_els = page.locator("[class*='red'], [class*='error']").all()
            for el in error_els:
                if el.is_visible() and el.text_content():
                    print(f"   ✗ Error: {el.text_content().strip()}")
            break
        if i % 4 == 3:
            print(f"   ... generating ({elapsed:.0f}s)")

    page.screenshot(path="/tmp/sta-jpeg-result.png")

    if success:
        print("   ✅ 10MB JPEG upload → resize → generate WORKS!")
    else:
        print(f"   Timed out or errored after {time.time() - start:.0f}s")
        print("   Screenshot: /tmp/sta-jpeg-result.png")

    browser.close()
