"""Test the Sketch to Art generate API to debug the 500 error."""

from playwright.sync_api import sync_playwright
import base64, sys, json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("1. Creating test sketch image...")
    # Create a simple test sketch - white background with black drawing
    sketch_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 512);
        // Draw a simple house
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        // House body
        ctx.strokeRect(150, 250, 200, 200);
        // Roof
        ctx.beginPath();
        ctx.moveTo(130, 250);
        ctx.lineTo(250, 150);
        ctx.lineTo(370, 250);
        ctx.closePath();
        ctx.stroke();
        // Door
        ctx.strokeRect(220, 350, 60, 100);
        // Windows
        ctx.strokeRect(170, 280, 50, 50);
        ctx.strokeRect(280, 280, 50, 50);
        // Sun
        ctx.beginPath();
        ctx.arc(420, 80, 40, 0, Math.PI * 2);
        ctx.stroke();
        return c.toDataURL('image/png');
    }""")
    print(f"   Sketch created: {len(sketch_b64)} chars")

    print("\n2. Testing generate API directly...")

    # First navigate to the app to get cookies/auth
    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Test the API
    result = page.evaluate("""async (sketch) => {
        try {
            const res = await fetch('/api/v1/sketch-to-art/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sketch: sketch,
                    style: 'watercolor',
                }),
            });
            const json = await res.json();
            return { status: res.status, body: json };
        } catch (e) {
            return { status: 0, error: e.message };
        }
    }""", sketch_b64)

    print(f"   Status: {result.get('status')}")
    body = result.get('body', {})

    if result.get('status') == 200:
        variations = body.get('data', {}).get('variations', [])
        print(f"   ✓ Success! Generated {len(variations)} variations")
        for i, v in enumerate(variations):
            print(f"     Variation {i+1}: {v.get('imageUrl', 'no url')[:80]}...")
    elif result.get('status') == 401:
        print("   ✗ 401 Unauthorized — need to sign in first")
        print("   Testing without auth to see the actual generation error...")

        # Try calling the Nano Banana directly via a server-side test
        print("\n3. Testing Nano Banana model directly...")

        # Create a minimal test by calling the API with a smaller image
        small_sketch = page.evaluate("""() => {
            const c = document.createElement('canvas');
            c.width = 256; c.height = 256;
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(128, 128, 60, 0, Math.PI * 2);
            ctx.stroke();
            // Just the base64 part
            return c.toDataURL('image/png');
        }""")

        print(f"   Small sketch: {len(small_sketch)} chars")
        print("   Need auth to test API — please sign in on the site first")

    else:
        print(f"   ✗ Error: {json.dumps(body, indent=2)[:500]}")

        # Check if it's a specific error
        error_msg = body.get('error', '')
        error_code = body.get('code', '')
        print(f"   Error code: {error_code}")
        print(f"   Error message: {error_msg}")

    browser.close()
    print("\n✅ Test complete")
