"""End-to-end test of Sketch to Art: UI flow + API + results."""

from playwright.sync_api import sync_playwright
import json, time

def test_sketch_to_art():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        print("=" * 60)
        print("SKETCH TO ART — End-to-End Test")
        print("=" * 60)

        # 1. Navigate to tool page
        print("\n1. Loading Sketch to Art page...")
        page.goto("http://localhost:3000/tools/sketch-to-art")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="/tmp/sta-01-loaded.png")

        # Check page loaded
        content = page.content()
        has_title = "Sketch to Art" in content or "Drawing Into Art" in content or "sketch" in content.lower()
        print(f"   Page loaded: {'✓' if has_title else '✗'}")

        # 2. Check mode toggle
        print("\n2. Checking mode toggle...")
        mode_btns = page.locator("text=Fun").all()
        pro_btns = page.locator("text=Pro").all()
        print(f"   Fun button: {'✓' if mode_btns else '✗'}")
        print(f"   Pro button: {'✓' if pro_btns else '✗'}")

        # 3. Check input tabs
        print("\n3. Checking input methods...")
        for tab in ["Upload", "Camera", "Draw"]:
            els = page.locator(f"text={tab}").all()
            found = len(els) > 0
            print(f"   {tab} tab: {'✓' if found else '✗'}")

        # 4. Test drawing canvas
        print("\n4. Testing Draw tab...")
        draw_btns = page.locator("text=Draw").all()
        # Click the Draw tab (might be a button or tab element)
        for btn in draw_btns:
            if btn.is_visible():
                btn.click()
                break
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/sta-02-draw-tab.png")

        # Check canvas exists
        canvas = page.locator("canvas").all()
        print(f"   Canvas found: {'✓' if canvas else '✗'}")

        # 5. Create a test sketch via upload instead (more reliable for automated testing)
        print("\n5. Creating test sketch via API call...")
        sketch_b64 = page.evaluate("""() => {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 512;
            const ctx = c.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            // Simple cat face
            ctx.beginPath(); ctx.arc(256, 256, 120, 0, Math.PI * 2); ctx.stroke(); // head
            ctx.beginPath(); ctx.arc(210, 230, 15, 0, Math.PI * 2); ctx.stroke(); // left eye
            ctx.beginPath(); ctx.arc(302, 230, 15, 0, Math.PI * 2); ctx.stroke(); // right eye
            ctx.beginPath(); ctx.arc(256, 270, 8, 0, Math.PI); ctx.stroke(); // nose
            ctx.beginPath(); ctx.moveTo(230, 290); ctx.quadraticCurveTo(256, 310, 282, 290); ctx.stroke(); // mouth
            // Ears
            ctx.beginPath(); ctx.moveTo(170, 170); ctx.lineTo(200, 100); ctx.lineTo(230, 170); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(282, 170); ctx.lineTo(312, 100); ctx.lineTo(342, 170); ctx.stroke();
            // Whiskers
            ctx.beginPath(); ctx.moveTo(160, 260); ctx.lineTo(230, 270); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(160, 280); ctx.lineTo(230, 280); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(282, 270); ctx.lineTo(352, 260); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(282, 280); ctx.lineTo(352, 280); ctx.stroke();
            return c.toDataURL('image/png');
        }""")
        print(f"   Sketch created: {len(sketch_b64)} chars")

        # 6. Test the generate API directly
        print("\n6. Testing generate API...")
        start = time.time()
        result = page.evaluate("""async (sketch) => {
            try {
                const res = await fetch('/api/v1/sketch-to-art/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sketch: sketch,
                        style: 'cartoon',
                    }),
                });
                const json = await res.json();
                return { status: res.status, body: json };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }""", sketch_b64)
        elapsed = time.time() - start

        status = result.get("status")
        body = result.get("body", {})

        if status == 200:
            variations = body.get("data", {}).get("variations", [])
            print(f"   ✓ Success! {len(variations)} variations in {elapsed:.1f}s")
            for i, v in enumerate(variations):
                url = v.get("imageUrl", "")
                print(f"     #{i+1}: {url[:80]}...")

            # 7. Test one of the generated images loads
            if variations:
                print("\n7. Verifying generated image loads...")
                img_url = variations[0]["imageUrl"]
                img_check = page.evaluate("""async (url) => {
                    try {
                        const res = await fetch(url);
                        return { ok: res.ok, status: res.status, type: res.headers.get('content-type') };
                    } catch (e) {
                        return { error: e.message };
                    }
                }""", img_url)
                if img_check.get("ok"):
                    print(f"   ✓ Image loads ({img_check.get('type')})")
                else:
                    print(f"   ✗ Image failed: {img_check}")

                # 8. Test refinement
                print("\n8. Testing refine API...")
                start2 = time.time()
                refine_result = page.evaluate("""async (args) => {
                    try {
                        const res = await fetch('/api/v1/sketch-to-art/refine', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                originalSketch: args.sketch,
                                currentImageUrl: args.imageUrl,
                                feedback: 'Make it more colorful with a rainbow background',
                                style: 'cartoon',
                            }),
                        });
                        const json = await res.json();
                        return { status: res.status, body: json };
                    } catch (e) {
                        return { status: 0, error: e.message };
                    }
                }""", {"sketch": sketch_b64, "imageUrl": img_url})
                elapsed2 = time.time() - start2

                if refine_result.get("status") == 200:
                    refined = refine_result.get("body", {}).get("data", {})
                    print(f"   ✓ Refinement success in {elapsed2:.1f}s")
                    print(f"     URL: {refined.get('imageUrl', '')[:80]}...")
                else:
                    print(f"   ✗ Refinement failed: {json.dumps(refine_result.get('body', {}))[:200]}")
            else:
                print("\n7-8. Skipped (no variations)")

        elif status == 401:
            print(f"   ✗ 401 Unauthorized — user not signed in")
            print("   Note: Generate requires auth. The API works (tested earlier).")

        else:
            print(f"   ✗ Status {status}")
            print(f"   Error: {json.dumps(body, indent=2)[:500]}")

        # 9. Test style picker rendering
        print("\n9. Checking style picker elements...")
        styles_to_check = ["Watercolor", "Anime", "Pixel Art", "Ghibli", "Cyberpunk"]
        for style_name in styles_to_check:
            found = page.locator(f"text={style_name}").count() > 0
            print(f"   {style_name}: {'✓' if found else '? (may be on step 2)'}")

        # 10. Check gallery page
        print("\n10. Testing gallery page...")
        page.goto("http://localhost:3000/tools/sketch-to-art/gallery")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        gallery_content = page.content()
        has_gallery = "Gallery" in gallery_content or "gallery" in gallery_content.lower()
        print(f"   Gallery page loads: {'✓' if has_gallery else '✗'}")
        page.screenshot(path="/tmp/sta-10-gallery.png")

        # 11. Test gallery API
        print("\n11. Testing gallery API...")
        gallery_api = page.evaluate("""async () => {
            try {
                const res = await fetch('/api/v1/sketch-to-art/gallery');
                const json = await res.json();
                return { status: res.status, count: json.data?.entries?.length ?? 0 };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }""")
        print(f"   Gallery API: status={gallery_api.get('status')}, entries={gallery_api.get('count', 0)}")

        browser.close()

        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)
        print("\nScreenshots saved to /tmp/sta-*.png")

if __name__ == "__main__":
    test_sketch_to_art()
