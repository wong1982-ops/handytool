"""Profile bookshelf API response time with longer timeout."""
from playwright.sync_api import sync_playwright
import time

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Warm up (Turbopack compile)
    print("Warm-up call...")
    t0 = time.time()
    resp = page.request.get(f"{BASE}/api/v1/story/books", timeout=120000)
    elapsed = (time.time() - t0) * 1000
    data = resp.json()
    count = len(data.get("data", []))
    print(f"   Warm-up: {elapsed:.0f}ms ({count} books)")

    # Subsequent calls (should be faster — route already compiled)
    times = []
    for i in range(3):
        t0 = time.time()
        resp = page.request.get(f"{BASE}/api/v1/story/books", timeout=120000)
        elapsed = (time.time() - t0) * 1000
        times.append(elapsed)
        print(f"   Call {i+1}: {elapsed:.0f}ms")

    print(f"   Average (post-warmup): {sum(times)/len(times):.0f}ms")

    # Page navigation test
    print("\nPage load test...")
    t0 = time.time()
    page.goto(f"{BASE}/tools/story-studio/bookshelf", wait_until="networkidle", timeout=120000)
    nav_time = (time.time() - t0) * 1000
    print(f"   Navigation: {nav_time:.0f}ms")

    loading = page.locator("text=Loading...")
    if loading.is_visible():
        t0 = time.time()
        loading.wait_for(state="hidden", timeout=60000)
        load_time = (time.time() - t0) * 1000
        print(f"   Loading visible for: {load_time:.0f}ms")
    else:
        print("   No loading spinner (already loaded)")

    browser.close()
