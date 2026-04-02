"""Production test v2: Upload test.jpeg, check API response directly."""

from playwright.sync_api import sync_playwright
import json, time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("=" * 60)
    print("PRODUCTION TEST — Sketch to Art API")
    print("=" * 60)

    page.goto("https://www.toolk1t.com/tools/sketch-to-art", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    # Create a small test sketch (not the 10MB file — just test the API works)
    print("\n1. Creating test sketch...")
    sketch_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(128, 128, 80, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(100, 110, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(156, 110, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(128, 145, 35, 0.2, 2.9); ctx.stroke();
        return c.toDataURL('image/jpeg', 0.7);
    }""")
    print(f"   ✓ Sketch: {len(sketch_b64)} bytes")

    # Call API directly
    print("\n2. Calling /api/v1/sketch-to-art/generate ...")
    start = time.time()
    result = page.evaluate("""async (sketch) => {
        try {
            const res = await fetch('/api/v1/sketch-to-art/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sketch, style: 'cartoon' }),
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
        print(f"   ✅ SUCCESS! {len(variations)} variations generated!")
        for i, v in enumerate(variations):
            print(f"     #{i+1}: {v.get('imageUrl', '')[:70]}...")
    elif status == 401:
        print("   ⚠ 401 Unauthorized (headless browser not signed in)")
        print("   The API route is responding — auth is the only blocker")
    elif status == 402:
        print("   ⚠ 402 Insufficient credits")
        print("   The API route works — just needs credits")
    elif status == 500:
        error_code = body.get("code", "")
        error_msg = body.get("error", "")
        print(f"   ❌ 500 ERROR")
        print(f"   Code: {error_code}")
        print(f"   Message: {error_msg}")
        raw = result.get("raw", "")
        if raw:
            print(f"   Raw: {raw[:300]}")
    else:
        print(f"   Response: {json.dumps(body, indent=2)[:300]}")

    browser.close()
    print("\n" + "=" * 60)
