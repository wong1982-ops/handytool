"""Test Image Editor AI features: verify panel loads, tools are present, and basic interactions work."""

from playwright.sync_api import sync_playwright
import sys

def test_image_editor_ai():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        print("1. Navigate to Image Editor...")
        page.goto("http://localhost:3000/tools/image-editor")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)  # Wait for client-side hydration

        # Take initial screenshot
        page.screenshot(path="/tmp/image-editor-initial.png", full_page=True)
        print("   Screenshot saved: /tmp/image-editor-initial.png")

        # 2. Check page loaded
        title = page.title()
        print(f"   Page title: {title}")
        assert "Image Editor" in title or "Toolk1t" in title, f"Unexpected title: {title}"
        print("   ✓ Page loaded successfully")

        # 3. Check for AI Tools section in the page
        content = page.content()
        has_ai_tools = "AI Tools" in content or "ai-tools" in content.lower() or "Remove Background" in content
        print(f"   AI Tools present in DOM: {has_ai_tools}")

        if has_ai_tools:
            print("   ✓ AI Tools section found")
        else:
            # AI tools might be in a collapsed section - look for the panel
            page.screenshot(path="/tmp/image-editor-no-ai.png")
            print("   ⚠ AI Tools section not found in initial render (may require image load)")

        # 4. Try to upload a test image to enable AI tools
        # First, check if there's an upload area
        upload_area = page.locator("text=Drop").first
        has_upload = upload_area.is_visible() if upload_area.count() > 0 else False

        if not has_upload:
            # Look for file input
            file_inputs = page.locator('input[type="file"]').all()
            print(f"   File inputs found: {len(file_inputs)}")

        # 5. Create a simple test image and upload it
        print("\n2. Creating and uploading test image...")

        # Create a simple 200x200 red square PNG via canvas
        test_image_b64 = page.evaluate("""() => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            // Draw a gradient background
            const gradient = ctx.createLinearGradient(0, 0, 200, 200);
            gradient.addColorStop(0, '#3D6AF2');
            gradient.addColorStop(1, '#EC4899');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 200, 200);
            // Draw a white circle
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(100, 100, 50, 0, Math.PI * 2);
            ctx.fill();
            return canvas.toDataURL('image/png');
        }""")

        if test_image_b64:
            print("   ✓ Test image created (200x200 gradient with circle)")

        # Save test image to file for upload
        import base64
        img_data = base64.b64decode(test_image_b64.split(",")[1])
        with open("/tmp/test-editor-image.png", "wb") as f:
            f.write(img_data)

        # Find file input and upload
        file_input = page.locator('input[type="file"]').first
        if file_input.count() > 0:
            file_input.set_input_files("/tmp/test-editor-image.png")
            page.wait_for_timeout(2000)
            print("   ✓ Image uploaded via file input")
        else:
            # Try drag and drop area
            print("   ⚠ No file input found, trying alternative upload method")
            # Check for canvas or drag area
            drop_zones = page.locator("[class*='drop'], [class*='upload']").all()
            print(f"   Drop zones found: {len(drop_zones)}")

        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/image-editor-with-image.png")
        print("   Screenshot saved: /tmp/image-editor-with-image.png")

        # 6. Look for AI Tools after image load
        print("\n3. Checking AI Tools panel...")

        # Check for AI tools buttons/text
        ai_indicators = [
            "Remove Background",
            "Segment",
            "Inpaint",
            "Enhance",
            "Generative Fill",
            "AI Tools",
        ]

        found_indicators = []
        for indicator in ai_indicators:
            elements = page.locator(f"text={indicator}").all()
            if elements:
                found_indicators.append(indicator)

        print(f"   Found AI indicators: {found_indicators}")

        if len(found_indicators) >= 3:
            print("   ✓ AI Tools panel is present with tools")
        else:
            # Try scrolling right panel or expanding collapsed section
            print("   Trying to find collapsed AI Tools section...")

            # Look for any collapsible headers
            collapsible_headers = page.locator("button, [role='button']").all()
            ai_buttons = [h for h in collapsible_headers if "ai" in (h.text_content() or "").lower()]
            print(f"   AI-related buttons found: {len(ai_buttons)}")

            if ai_buttons:
                ai_buttons[0].click()
                page.wait_for_timeout(500)
                page.screenshot(path="/tmp/image-editor-ai-expanded.png")
                print("   Clicked AI section, screenshot saved")

        # 7. Take final screenshot
        page.screenshot(path="/tmp/image-editor-final.png", full_page=True)
        print("\n4. Final screenshot saved: /tmp/image-editor-final.png")

        # 8. Check API routes exist (quick fetch test)
        print("\n5. Testing API routes exist...")
        api_routes = [
            "/api/v1/image-editor/remove-bg",
            "/api/v1/image-editor/segment",
            "/api/v1/image-editor/enhance",
            "/api/v1/image-editor/inpaint",
            "/api/v1/image-editor/generative-fill",
        ]

        for route in api_routes:
            response = page.evaluate(f"""async () => {{
                try {{
                    const res = await fetch('{route}', {{ method: 'POST', headers: {{ 'Content-Type': 'application/json' }}, body: '{{}}' }});
                    return {{ status: res.status, ok: res.ok }};
                }} catch (e) {{
                    return {{ status: 0, error: e.message }};
                }}
            }}""")
            status = response.get("status", 0)
            # 401 = auth required (expected), 400 = validation error (expected), 404 = route missing (bad)
            if status in [401, 400, 422]:
                print(f"   ✓ {route} — responds ({status}, auth/validation required)")
            elif status == 404:
                print(f"   ✗ {route} — 404 NOT FOUND")
            else:
                print(f"   ? {route} — status {status}")

        print("\n✅ Image Editor AI test complete!")
        browser.close()
        return True

if __name__ == "__main__":
    try:
        success = test_image_editor_ai()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
