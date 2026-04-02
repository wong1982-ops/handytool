"""Test with a larger image to simulate real camera/upload input."""

from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    print("1. Creating larger test image (1024x1024 with details)...")
    sketch_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 1024;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        // Draw complex scene
        // Ground
        ctx.beginPath();
        ctx.moveTo(0, 700);
        ctx.lineTo(1024, 700);
        ctx.stroke();
        // House
        ctx.strokeRect(200, 400, 300, 300);
        ctx.beginPath();
        ctx.moveTo(180, 400);
        ctx.lineTo(350, 250);
        ctx.lineTo(520, 400);
        ctx.closePath();
        ctx.stroke();
        // Tree
        ctx.strokeRect(650, 500, 30, 200);
        ctx.beginPath();
        ctx.arc(665, 430, 80, 0, Math.PI * 2);
        ctx.stroke();
        // Sun
        ctx.beginPath();
        ctx.arc(850, 120, 60, 0, Math.PI * 2);
        ctx.stroke();
        // Clouds
        for (let x of [200, 500]) {
            ctx.beginPath();
            ctx.arc(x, 120, 40, 0, Math.PI * 2);
            ctx.arc(x + 50, 100, 35, 0, Math.PI * 2);
            ctx.arc(x + 90, 120, 40, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Person
        ctx.beginPath();
        ctx.arc(550, 580, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(550, 600);
        ctx.lineTo(550, 670);
        ctx.moveTo(550, 630);
        ctx.lineTo(520, 660);
        ctx.moveTo(550, 630);
        ctx.lineTo(580, 660);
        ctx.moveTo(550, 670);
        ctx.lineTo(520, 700);
        ctx.moveTo(550, 670);
        ctx.lineTo(580, 700);
        ctx.stroke();
        return c.toDataURL('image/png');
    }""")

    size_kb = len(sketch_b64) / 1024
    print(f"   Image size: {size_kb:.0f} KB ({len(sketch_b64)} chars)")

    page.goto("http://localhost:3000/tools/sketch-to-art")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    print("\n2. Testing generate API with large image...")
    result = page.evaluate("""async (sketch) => {
        try {
            const res = await fetch('/api/v1/sketch-to-art/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sketch, style: 'anime' }),
            });
            const json = await res.json();
            return { status: res.status, body: json };
        } catch (e) {
            return { status: 0, error: e.message };
        }
    }""", sketch_b64)

    status = result.get('status')
    body = result.get('body', {})

    if status == 200:
        variations = body.get('data', {}).get('variations', [])
        print(f"   ✓ Success! {len(variations)} variations")
        for i, v in enumerate(variations):
            print(f"     #{i+1}: {v.get('imageUrl', '')[:80]}...")
    else:
        print(f"   ✗ Status {status}: {json.dumps(body, indent=2)[:300]}")

    print("\n3. Testing with custom style...")
    result2 = page.evaluate("""async (sketch) => {
        try {
            const res = await fetch('/api/v1/sketch-to-art/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sketch, style: '', customStyle: 'like a Disney movie poster with vibrant colors' }),
            });
            const json = await res.json();
            return { status: res.status, body: json };
        } catch (e) {
            return { status: 0, error: e.message };
        }
    }""", sketch_b64)

    status2 = result2.get('status')
    body2 = result2.get('body', {})

    if status2 == 200:
        variations2 = body2.get('data', {}).get('variations', [])
        print(f"   ✓ Custom style success! {len(variations2)} variations")
    else:
        print(f"   ✗ Status {status2}: {json.dumps(body2, indent=2)[:300]}")

    print("\n4. Testing refinement...")
    if status == 200 and variations:
        result3 = page.evaluate("""async (args) => {
            try {
                const res = await fetch('/api/v1/sketch-to-art/refine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        originalSketch: args.sketch,
                        currentImageUrl: args.imageUrl,
                        feedback: 'Make it more colorful with a sunset background',
                        style: 'anime',
                    }),
                });
                const json = await res.json();
                return { status: res.status, body: json };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }""", {"sketch": sketch_b64, "imageUrl": variations[0].get('imageUrl', '')})

        status3 = result3.get('status')
        body3 = result3.get('body', {})

        if status3 == 200:
            refined = body3.get('data', {})
            print(f"   ✓ Refinement success! {refined.get('imageUrl', '')[:80]}...")
        else:
            print(f"   ✗ Status {status3}: {json.dumps(body3, indent=2)[:300]}")
    else:
        print("   Skipped (no initial variations to refine)")

    browser.close()
    print("\n✅ All tests complete")
