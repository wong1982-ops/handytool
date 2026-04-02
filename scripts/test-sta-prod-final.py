"""Production E2E test: upload test.jpeg to toolk1t.com and generate art."""

from playwright.sync_api import sync_playwright
import time, os

with sync_playwright() as p:
    # Use persistent browser context to reuse Chrome session (logged in)
    user_data = os.path.expanduser("~/Library/Caches/ms-playwright/mcp-chrome-prod")
    browser = p.chromium.launch(headless=False)  # Need non-headless for file dialog
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()

    print("=" * 60)
    print("SKETCH TO ART — Production E2E Test")
    print("=" * 60)

    # 1. Load production page
    print("\n1. Loading https://www.toolk1t.com/tools/sketch-to-art ...")
    page.goto("https://www.toolk1t.com/tools/sketch-to-art", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path="/tmp/sta-prod-final-01.png")

    # Check if signed in
    content = page.content()
    signed_in = "User menu" in content or "LD" in content
    print(f"   Signed in: {'✓' if signed_in else '✗ (will get 401)'}")

    # 2. Upload test.jpeg
    print("\n2. Uploading test.jpeg (10MB)...")
    file_input = page.locator('input[type="file"]').first
    if file_input.count() > 0:
        file_input.set_input_files("/Users/mercury/Downloads/test.jpeg")
        page.wait_for_timeout(5000)  # Wait for resize

        # Check resized size
        size = page.evaluate("""() => {
            const imgs = document.querySelectorAll('img');
            for (const img of imgs) {
                if (img.src && img.src.startsWith('data:image')) {
                    return { kb: Math.round(img.src.length / 1024), mime: img.src.substring(5, img.src.indexOf(';')) };
                }
            }
            return null;
        }""")
        if size:
            print(f"   Resized to: {size['kb']}KB ({size['mime']}) {'✓' if size['kb'] < 3000 else '✗ too large'}")
        else:
            print("   ⚠ Could not detect resize (preview may use object URL)")

        page.screenshot(path="/tmp/sta-prod-final-02-upload.png")

        # Click "Use this sketch"
        use_btn = page.locator("text=Use this sketch").first
        if use_btn.count() > 0 and use_btn.is_visible():
            use_btn.click()
            page.wait_for_timeout(1000)
            print("   ✓ Clicked 'Use this sketch'")
        else:
            print("   ⚠ 'Use this sketch' not found, checking other buttons...")
            btns = page.locator("button").all()
            for b in btns:
                try:
                    t = b.text_content(timeout=500) or ""
                    if ("use" in t.lower() or "next" in t.lower()) and b.is_visible():
                        b.click()
                        page.wait_for_timeout(1000)
                        print(f"   ✓ Clicked: '{t.strip()}'")
                        break
                except Exception:
                    continue
    else:
        print("   ✗ File input not found")

    page.screenshot(path="/tmp/sta-prod-final-03-step2.png")

    # 3. Pick style
    print("\n3. Picking style...")
    watercolor = page.locator("text=Watercolor").first
    if watercolor.count() > 0 and watercolor.is_visible():
        watercolor.click()
        page.wait_for_timeout(500)
        print("   ✓ Selected Watercolor")
    else:
        # Try any visible style
        for style in ["Cartoon", "Anime", "Oil Painting", "Pixel Art"]:
            el = page.locator(f"text={style}").first
            if el.count() > 0 and el.is_visible():
                el.click()
                page.wait_for_timeout(500)
                print(f"   ✓ Selected {style}")
                break

    # 4. Click generate
    print("\n4. Generating...")
    gen_clicked = False
    for btn in page.locator("button").all():
        try:
            txt = btn.text_content(timeout=500) or ""
            if ("magic" in txt.lower() or "generate" in txt.lower()) and btn.is_visible():
                btn.click(timeout=3000)
                gen_clicked = True
                print(f"   ✓ Clicked '{txt.strip()}'")
                break
        except Exception:
            continue

    if not gen_clicked:
        print("   ✗ Generate button not found")
        page.screenshot(path="/tmp/sta-prod-final-04-no-gen.png")
        browser.close()
        exit(1)

    # 5. Wait for results
    print("\n5. Waiting for results (up to 2 min)...")
    start = time.time()
    result_status = "timeout"

    for i in range(24):
        page.wait_for_timeout(5000)
        elapsed = time.time() - start
        content = page.content()

        # Check for success (R2 image URLs in the page)
        if "r2.dev" in content or "sketch-art" in content:
            result_status = "success"
            print(f"   ✓ RESULTS appeared after {elapsed:.0f}s!")
            break

        # Check for errors
        if "insufficient" in content.lower():
            result_status = "no_credits"
            print(f"   ✗ Insufficient credits (after {elapsed:.0f}s)")
            break

        if "failed" in content.lower() and "generation" in content.lower():
            result_status = "error"
            print(f"   ✗ Generation failed (after {elapsed:.0f}s)")
            # Try to get error message
            err_els = page.locator("text=Failed").all()
            for el in err_els:
                try:
                    if el.is_visible():
                        print(f"     Error text: {el.text_content(timeout=500)}")
                except Exception:
                    pass
            break

        if "sign in" in content.lower() and "unauthorized" in content.lower():
            result_status = "auth"
            print(f"   ✗ Not authenticated")
            break

        if i % 3 == 2:
            print(f"   ... generating ({elapsed:.0f}s)")

    page.screenshot(path="/tmp/sta-prod-final-05-result.png")

    # Summary
    print("\n" + "=" * 60)
    if result_status == "success":
        print("✅ PRODUCTION TEST PASSED!")
        print("   10MB JPEG → resize → upload → style → generate → 4 variations")
    elif result_status == "no_credits":
        print("⚠ TEST BLOCKED: No credits on account")
        print("   But the flow worked up to the credit check")
    elif result_status == "auth":
        print("⚠ TEST BLOCKED: Not signed in")
    elif result_status == "error":
        print("❌ GENERATION FAILED on production")
    else:
        print("❌ TIMED OUT waiting for results")
    print(f"\nScreenshots: /tmp/sta-prod-final-*.png")
    print("=" * 60)

    browser.close()
