"""Test Sketch to Art on production with authentication via Playwright MCP browser."""

from playwright.sync_api import sync_playwright
import json, time

with sync_playwright() as p:
    # Use persistent context to reuse login state
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("=" * 60)
    print("SKETCH TO ART — Production Auth Test")
    print("=" * 60)

    # Navigate to production
    print("\n1. Loading production page...")
    page.goto("https://www.toolk1t.com/tools/sketch-to-art", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    # Take screenshot
    page.screenshot(path="/tmp/sta-prod-auth-01.png")
    print("   ✓ Page loaded")
    print(f"   Screenshot: /tmp/sta-prod-auth-01.png")

    # Create sketch
    print("\n2. Creating test sketch...")
    sketch_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        // Simple house
        ctx.strokeRect(60, 130, 140, 100);
        ctx.beginPath();
        ctx.moveTo(40, 130); ctx.lineTo(130, 50); ctx.lineTo(220, 130);
        ctx.closePath(); ctx.stroke();
        ctx.strokeRect(105, 180, 50, 50);
        return c.toDataURL('image/png');
    }""")
    print(f"   ✓ Sketch: {len(sketch_b64)} chars")

    # Test generate API
    print("\n3. Testing generate API...")
    start = time.time()
    result = page.evaluate("""async (sketch) => {
        try {
            const res = await fetch('/api/v1/sketch-to-art/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sketch, style: 'watercolor' }),
            });
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                return { status: res.status, body: json };
            } catch {
                return { status: res.status, raw: text.substring(0, 1000) };
            }
        } catch (e) {
            return { status: 0, error: e.message };
        }
    }""", sketch_b64)
    elapsed = time.time() - start

    status = result.get("status")
    body = result.get("body", {})

    print(f"   Status: {status} ({elapsed:.1f}s)")

    if status == 200:
        variations = body.get("data", {}).get("variations", [])
        print(f"   ✓ SUCCESS! {len(variations)} variations")
        for i, v in enumerate(variations):
            print(f"     #{i+1}: {v.get('imageUrl', '')[:80]}...")
        print("\n   ✅ PRODUCTION GENERATE API WORKS!")

    elif status == 401:
        print("   401 — Not authenticated")
        print("   Testing without auth — checking if the error is still the header issue...")

        # Try a direct curl-style test to see the actual error
        print("\n4. Testing API error details...")
        error_test = page.evaluate("""async (sketch) => {
            try {
                const res = await fetch('/api/v1/sketch-to-art/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sketch, style: 'cartoon' }),
                });
                return {
                    status: res.status,
                    statusText: res.statusText,
                    headers: Object.fromEntries(res.headers.entries()),
                    body: await res.text(),
                };
            } catch (e) {
                return { error: e.message, stack: e.stack };
            }
        }""", sketch_b64)

        print(f"   Full response:")
        print(f"   Status: {error_test.get('status')} {error_test.get('statusText', '')}")
        body_text = error_test.get('body', '')
        print(f"   Body: {body_text[:300]}")

    elif status == 500:
        error_msg = body.get("error", "")
        error_code = body.get("code", "")
        raw = result.get("raw", "")
        print(f"   ✗ 500 ERROR")
        print(f"   Code: {error_code}")
        print(f"   Message: {error_msg}")
        if raw:
            print(f"   Raw: {raw[:300]}")
        print("\n   ❌ PRODUCTION STILL FAILING")

    else:
        print(f"   Unexpected status: {status}")
        print(f"   Body: {json.dumps(body, indent=2)[:300]}")
        if result.get("raw"):
            print(f"   Raw: {result['raw'][:300]}")

    browser.close()
    print("\n" + "=" * 60)
