"""Test Sketch to Art on production: https://www.toolk1t.com"""

from playwright.sync_api import sync_playwright
import json, time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("=" * 60)
    print("SKETCH TO ART — Production Test (toolk1t.com)")
    print("=" * 60)

    # 1. Load page
    print("\n1. Loading https://www.toolk1t.com/tools/sketch-to-art ...")
    page.goto("https://www.toolk1t.com/tools/sketch-to-art", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    page.screenshot(path="/tmp/sta-prod-01-loaded.png")
    print("   ✓ Page loaded")

    # 2. Check UI elements
    print("\n2. Checking UI elements...")
    content = page.content()

    checks = {
        "Title present": "sketch" in content.lower() or "art" in content.lower(),
        "Upload tab": "Upload" in content or "upload" in content.lower(),
        "Draw tab": "Draw" in content or "draw" in content.lower(),
        "Mode toggle": "Fun" in content or "Pro" in content,
    }
    for label, ok in checks.items():
        print(f"   {label}: {'✓' if ok else '✗'}")

    # 3. Create test sketch
    print("\n3. Creating test sketch...")
    sketch_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        // Simple star
        const cx = 128, cy = 128, r = 80;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        return c.toDataURL('image/png');
    }""")
    print(f"   ✓ Sketch: {len(sketch_b64)} chars")

    # 4. Test generate API on production
    print("\n4. Testing generate API on production...")
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
                return { status: res.status, body: JSON.parse(text) };
            } catch {
                return { status: res.status, raw: text.substring(0, 500) };
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
        print(f"   ✓ SUCCESS! {len(variations)} variations generated")
        for i, v in enumerate(variations):
            print(f"     #{i+1}: {v.get('imageUrl', '')[:80]}...")

        # Verify image loads
        if variations:
            img_check = page.evaluate("""async (url) => {
                try {
                    const res = await fetch(url, { method: 'HEAD' });
                    return { ok: res.ok, status: res.status };
                } catch (e) {
                    return { error: e.message };
                }
            }""", variations[0]["imageUrl"])
            print(f"   Image accessible: {'✓' if img_check.get('ok') else '✗'}")

    elif status == 401:
        print("   ✗ 401 — Not authenticated (expected without sign-in)")
        print("   The API route works but requires auth.")

    elif status == 402:
        print("   ✗ 402 — Insufficient credits")

    elif status == 500:
        error_msg = body.get("error", "")
        error_code = body.get("code", "")
        print(f"   ✗ 500 ERROR")
        print(f"   Code: {error_code}")
        print(f"   Message: {error_msg}")
        if result.get("raw"):
            print(f"   Raw response: {result['raw'][:300]}")

    else:
        print(f"   Response: {json.dumps(body, indent=2)[:300]}")

    # 5. Check gallery
    print("\n5. Testing gallery page...")
    page.goto("https://www.toolk1t.com/tools/sketch-to-art/gallery", timeout=15000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    has_gallery = "Gallery" in page.content() or "gallery" in page.content().lower()
    print(f"   Gallery loads: {'✓' if has_gallery else '✗'}")
    page.screenshot(path="/tmp/sta-prod-05-gallery.png")

    browser.close()
    print("\n" + "=" * 60)
    print("PRODUCTION TEST COMPLETE")
    print("=" * 60)
