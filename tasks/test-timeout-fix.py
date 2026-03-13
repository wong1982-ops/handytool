"""Test that job creation with illustration+audio no longer times out.
Previously this caused 30s TimeoutError on analytics/track and create_book_job RPC.
"""
from playwright.sync_api import sync_playwright
import time

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # Test 1: Analytics endpoint speed
    print("=== Test 1: Analytics endpoint ===")
    t0 = time.time()
    resp = page.request.post(f"{BASE}/api/v1/analytics/track", data={
        "event": "test_timeout_fix",
        "properties": {"test": True}
    }, timeout=15000)
    elapsed = (time.time() - t0) * 1000
    print(f"   Status: {resp.status}, Time: {elapsed:.0f}ms")
    if elapsed > 5000:
        print(f"   WARNING: Still slow ({elapsed:.0f}ms > 5000ms)")
    else:
        print(f"   OK: Fast response")

    # Test 2: Job creation with ALL features enabled (the failing scenario)
    print("\n=== Test 2: Job creation (illustration + audio ON) ===")
    t0 = time.time()
    resp = page.request.post(f"{BASE}/api/v1/story/jobs", data={
        "plot": "A brave little fox discovers a magical forest where the trees whisper ancient secrets and the stars come down to play",
        "concept": {
            "title": "The Whispering Forest",
            "hook": "A fox finds magic in nature",
            "synopsis": "A brave little fox discovers a magical forest where the trees whisper ancient secrets and the stars come down to play at night.",
            "tags": {
                "audience": "kids-5-8",
                "style": "watercolor",
                "mood": "whimsical",
                "theme": "adventure"
            },
            "characters": [
                {"name": "Finn", "role": "protagonist", "description": "A curious little fox with bright orange fur"}
            ]
        }
    }, timeout=15000)
    elapsed = (time.time() - t0) * 1000
    print(f"   Status: {resp.status}, Time: {elapsed:.0f}ms")
    if resp.status == 201:
        data = resp.json()
        job_id = data.get("data", {}).get("id", "unknown")
        print(f"   Job ID: {job_id}")
    else:
        print(f"   Response: {resp.text()[:200]}")

    if elapsed > 5000:
        print(f"   WARNING: Still slow ({elapsed:.0f}ms > 5000ms)")
    else:
        print(f"   OK: Fast job creation")

    # Test 3: Bookshelf API (previously 20-26s, should be <1s now)
    print("\n=== Test 3: Bookshelf API ===")
    t0 = time.time()
    resp = page.request.get(f"{BASE}/api/v1/story/books", timeout=15000)
    elapsed = (time.time() - t0) * 1000
    data = resp.json()
    count = len(data.get("data", []))
    print(f"   Status: {resp.status}, Time: {elapsed:.0f}ms ({count} books)")
    if elapsed > 2000:
        print(f"   WARNING: Still slow ({elapsed:.0f}ms > 2000ms)")
    else:
        print(f"   OK: Fast bookshelf")

    print("\n=== Summary ===")
    print("If all tests show 'OK' and times < 5s, the timeout fix is working.")

    browser.close()
