"""Scroll right panel to verify AI Tools section is visible and interactive."""

from playwright.sync_api import sync_playwright
import base64, sys

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto("http://localhost:3000/tools/image-editor")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Upload test image
    img_b64 = page.evaluate("""() => {
        const c = document.createElement('canvas'); c.width=200; c.height=200;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0,0,200,200);
        g.addColorStop(0,'#3D6AF2'); g.addColorStop(1,'#EC4899');
        ctx.fillStyle=g; ctx.fillRect(0,0,200,200);
        ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(100,100,50,0,Math.PI*2); ctx.fill();
        return c.toDataURL('image/png');
    }""")
    with open("/tmp/test-img.png","wb") as f:
        f.write(base64.b64decode(img_b64.split(",")[1]))

    fi = page.locator('input[type="file"]').first
    if fi.count() > 0:
        fi.set_input_files("/tmp/test-img.png")
        page.wait_for_timeout(2000)

    # Scroll right panel to bottom to find AI Tools
    right_panel = page.locator("[class*='overflow-y']").last
    if right_panel.count() > 0:
        right_panel.evaluate("el => el.scrollTop = el.scrollHeight")
        page.wait_for_timeout(500)
    else:
        # Try scrolling the whole page
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500)

    page.screenshot(path="/tmp/image-editor-ai-scrolled.png")
    print("Screenshot saved: /tmp/image-editor-ai-scrolled.png")

    # Check AI tools visibility
    ai_tools_text = page.locator("text=AI Tools").first
    if ai_tools_text.count() > 0 and ai_tools_text.is_visible():
        print("✓ AI Tools section header is VISIBLE")
    else:
        print("⚠ AI Tools header not visible after scroll — trying to find it")
        # Find all scrollable containers
        scrollables = page.evaluate("""() => {
            const els = document.querySelectorAll('*');
            const result = [];
            for (const el of els) {
                if (el.scrollHeight > el.clientHeight && el.clientHeight > 100) {
                    result.push({
                        tag: el.tagName,
                        class: el.className.substring(0, 80),
                        scrollH: el.scrollHeight,
                        clientH: el.clientHeight,
                    });
                }
            }
            return result;
        }""")
        print(f"  Scrollable containers: {len(scrollables)}")
        for s in scrollables[:5]:
            print(f"    {s['tag']}.{s['class'][:40]}... scrollH={s['scrollH']} clientH={s['clientH']}")

        # Scroll each one
        for i, s in enumerate(scrollables[:5]):
            page.evaluate(f"""() => {{
                const els = document.querySelectorAll('*');
                let count = 0;
                for (const el of els) {{
                    if (el.scrollHeight > el.clientHeight && el.clientHeight > 100) {{
                        if (count === {i}) {{ el.scrollTop = el.scrollHeight; break; }}
                        count++;
                    }}
                }}
            }}""")

        page.wait_for_timeout(500)
        page.screenshot(path="/tmp/image-editor-ai-scrolled2.png")
        print("  Second scroll attempt screenshot: /tmp/image-editor-ai-scrolled2.png")

    # Check all 5 tools are present
    tools = ["Remove Background", "Segment Object", "Inpaint", "Enhance", "Generative Fill"]
    for tool in tools:
        el = page.locator(f"text={tool}").first
        visible = el.is_visible() if el.count() > 0 else False
        status = "✓ visible" if visible else "present (not scrolled into view)" if el.count() > 0 else "✗ NOT FOUND"
        print(f"  {tool}: {status}")

    browser.close()
    print("\n✅ Done")
