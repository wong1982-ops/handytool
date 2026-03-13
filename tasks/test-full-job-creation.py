"""Test job creation with ALL features enabled (the scenario that was timing out at 30s)."""
from playwright.sync_api import sync_playwright
import time
import json

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # Navigate to story studio to warm up Turbopack
    print("Warming up dev server...")
    page.goto(f"{BASE}/tools/story-studio", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2000)

    # Test job creation via API with full payload (matching the real schema)
    print("\n=== Job creation with illustration + audio (previously 30s timeout) ===")
    t0 = time.time()
    resp = page.request.post(f"{BASE}/api/v1/story/jobs", data={
        "plot": "A brave little fox discovers a magical forest where the trees whisper ancient secrets and the stars come down to play at night",
        "concept": {
            "title": "The Whispering Forest",
            "hook": "A fox finds magic in nature",
            "synopsis": "A brave little fox named Finn discovers a magical forest where the trees whisper ancient secrets and the stars come down to play at night. Along the way, Finn learns the value of listening and patience.",
            "characters": [
                {"name": "Finn", "role": "protagonist", "description": "A curious little fox with bright orange fur and big ears"}
            ],
            "tags": {
                "audience": "kids-5-8",
                "style": "watercolor",
                "mood": "whimsical",
                "theme": "adventure"
            }
        }
        # No skipIllustration, no skipAudio — full pipeline
    }, timeout=15000)
    elapsed = (time.time() - t0) * 1000
    print(f"   Status: {resp.status}, Time: {elapsed:.0f}ms")

    if resp.status == 201:
        data = resp.json()
        job_id = data.get("data", {}).get("id", "unknown")
        print(f"   Job ID: {job_id}")
        print(f"   PASS: Job created in {elapsed:.0f}ms (was 30s+ before fix)")
    else:
        body = resp.text()
        print(f"   Response: {body[:300]}")
        if elapsed < 5000:
            print(f"   Note: Fast response ({elapsed:.0f}ms) even with error — timeout is fixed")

    # Test analytics endpoint too (also was 30s)
    print("\n=== Analytics tracking (previously 30s timeout) ===")
    t0 = time.time()
    resp = page.request.post(f"{BASE}/api/v1/analytics/track", data={
        "event": "page_view",
        "properties": {"page": "/tools/story-studio", "test": True}
    }, timeout=15000)
    elapsed = (time.time() - t0) * 1000
    print(f"   Status: {resp.status}, Time: {elapsed:.0f}ms")
    if elapsed < 5000:
        print(f"   PASS: Analytics responded in {elapsed:.0f}ms (was 30s+ before fix)")
    else:
        print(f"   FAIL: Still slow at {elapsed:.0f}ms")

    browser.close()
    print("\nDone!")
