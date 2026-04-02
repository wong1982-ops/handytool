"""Test Sketch to Art with real file upload AND drawing canvas, then generate."""

from playwright.sync_api import sync_playwright
import json, time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("=" * 60)
    print("TEST 1: Upload ~/Downloads/test.jpeg")
    print("=" * 60)

    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Upload test.jpeg via hidden file input
    print("\n1. Uploading test.jpeg...")
    file_input = page.locator('input[type="file"]').first
    file_input.set_input_files("/Users/mercury/Downloads/test.jpeg")
    page.wait_for_timeout(3000)
    page.screenshot(path="/tmp/sta-upload-01-preview.png")

    # Check if preview appeared
    preview_imgs = page.locator("img").all()
    print(f"   Images on page: {len(preview_imgs)}")

    # Look for "Use this sketch" button
    use_btn = page.locator("text=Use this sketch").first
    if use_btn.count() > 0 and use_btn.is_visible():
        print("   ✓ Preview shown, 'Use this sketch' button visible")
        use_btn.click()
        page.wait_for_timeout(1000)
        print("   ✓ Clicked 'Use this sketch'")
    else:
        # Maybe it auto-advances or has different text
        use_btns = page.locator("button").all()
        visible_btns = [b for b in use_btns if b.is_visible() and b.text_content()]
        btn_texts = [b.text_content().strip() for b in visible_btns if b.text_content()]
        print(f"   Visible buttons: {btn_texts[:10]}")

        # Try clicking any button that looks like "use" or "next"
        for b in visible_btns:
            t = (b.text_content() or "").lower()
            if "use" in t or "next" in t or "sketch" in t:
                b.click()
                page.wait_for_timeout(1000)
                print(f"   ✓ Clicked: '{b.text_content().strip()}'")
                break

    page.screenshot(path="/tmp/sta-upload-02-step2.png")

    # Step 2: Pick a style
    print("\n2. Picking style...")
    style_btn = page.locator("text=Watercolor").first
    if style_btn.count() > 0:
        style_btn.click()
        page.wait_for_timeout(500)
        print("   ✓ Selected 'Watercolor'")
    else:
        print("   ✗ Style picker not visible (might not be on step 2)")
        page.screenshot(path="/tmp/sta-upload-02-debug.png")

    # Find and click generate button
    gen_btns = page.locator("button").all()
    for b in gen_btns:
        t = (b.text_content() or "").lower()
        if "magic" in t or "generate" in t:
            if b.is_visible() and b.is_enabled():
                print(f"   ✓ Found generate button: '{b.text_content().strip()}'")
                b.click()
                break

    # Wait for generation (up to 120s)
    print("\n3. Waiting for generation...")
    start = time.time()
    for i in range(24):
        page.wait_for_timeout(5000)
        elapsed = time.time() - start

        # Check for result images or error
        content = page.content()
        if "r2.dev" in content or "variation" in content.lower():
            print(f"   ✓ Results appeared after {elapsed:.0f}s")
            break
        if "error" in content.lower() and "failed" in content.lower():
            print(f"   ✗ Error after {elapsed:.0f}s")
            break
        if i % 4 == 3:
            print(f"   ... still generating ({elapsed:.0f}s)")

    page.screenshot(path="/tmp/sta-upload-03-results.png")
    print(f"   Screenshot: /tmp/sta-upload-03-results.png")

    print("\n" + "=" * 60)
    print("TEST 2: Draw on canvas and generate")
    print("=" * 60)

    # Navigate fresh
    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Click Draw tab
    print("\n1. Switching to Draw tab...")
    draw_tab = page.locator("text=Draw").first
    if draw_tab.count() > 0:
        draw_tab.click()
        page.wait_for_timeout(1000)
        print("   ✓ Draw tab clicked")

    page.screenshot(path="/tmp/sta-draw-01-canvas.png")

    # Find canvas and draw on it
    canvas = page.locator("canvas").first
    if canvas.count() > 0 and canvas.is_visible():
        print("\n2. Drawing on canvas...")
        box = canvas.bounding_box()
        if box:
            cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2

            # Draw a simple face
            import math

            # Circle (head)
            for i in range(36):
                angle = (i / 36) * 2 * math.pi
                x = cx + 80 * math.cos(angle)
                y = cy + 80 * math.sin(angle)
                if i == 0:
                    page.mouse.move(x, y)
                    page.mouse.down()
                else:
                    page.mouse.move(x, y)
            page.mouse.up()

            # Left eye
            page.mouse.click(cx - 30, cy - 20)
            page.mouse.move(cx - 30, cy - 25)
            page.mouse.down()
            for i in range(12):
                angle = (i / 12) * 2 * math.pi
                page.mouse.move(cx - 30 + 10 * math.cos(angle), cy - 20 + 10 * math.sin(angle))
            page.mouse.up()

            # Right eye
            page.mouse.move(cx + 30, cy - 25)
            page.mouse.down()
            for i in range(12):
                angle = (i / 12) * 2 * math.pi
                page.mouse.move(cx + 30 + 10 * math.cos(angle), cy - 20 + 10 * math.sin(angle))
            page.mouse.up()

            # Smile
            page.mouse.move(cx - 40, cy + 20)
            page.mouse.down()
            for i in range(20):
                t = i / 19
                x = cx - 40 + 80 * t
                y = cy + 20 + 30 * math.sin(t * math.pi)
                page.mouse.move(x, y)
            page.mouse.up()

            print("   ✓ Drew a smiley face")
            page.wait_for_timeout(500)
            page.screenshot(path="/tmp/sta-draw-02-drawn.png")

            # Click "Done Drawing" or export button
            done_btns = page.locator("button").all()
            for b in done_btns:
                t = (b.text_content() or "").lower()
                if "done" in t or "export" in t or "next" in t:
                    if b.is_visible():
                        b.click()
                        page.wait_for_timeout(1000)
                        print(f"   ✓ Clicked: '{b.text_content().strip()}'")
                        break

            page.screenshot(path="/tmp/sta-draw-03-preview.png")

            # Click "Use this sketch"
            use_btn2 = page.locator("text=Use this sketch").first
            if use_btn2.count() > 0 and use_btn2.is_visible():
                use_btn2.click()
                page.wait_for_timeout(1000)
                print("   ✓ Used sketch")

            # Pick style
            print("\n3. Picking style 'Anime'...")
            anime_btn = page.locator("text=Anime").first
            if anime_btn.count() > 0:
                anime_btn.click()
                page.wait_for_timeout(500)
                print("   ✓ Selected Anime")

            # Generate
            for b in page.locator("button").all():
                t = (b.text_content() or "").lower()
                if ("magic" in t or "generate" in t) and b.is_visible() and b.is_enabled():
                    print(f"   ✓ Clicking: '{b.text_content().strip()}'")
                    b.click()
                    break

            # Wait for results
            print("\n4. Waiting for generation...")
            start2 = time.time()
            for i in range(24):
                page.wait_for_timeout(5000)
                elapsed2 = time.time() - start2
                content2 = page.content()
                if "r2.dev" in content2:
                    print(f"   ✓ Results appeared after {elapsed2:.0f}s")
                    break
                if i % 4 == 3:
                    print(f"   ... still generating ({elapsed2:.0f}s)")

            page.screenshot(path="/tmp/sta-draw-04-results.png")
            print(f"   Screenshot: /tmp/sta-draw-04-results.png")
    else:
        print("   ✗ Canvas not found")

    browser.close()
    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETE")
    print("Screenshots: /tmp/sta-upload-*.png, /tmp/sta-draw-*.png")
    print("=" * 60)
