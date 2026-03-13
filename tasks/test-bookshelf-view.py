"""Screenshot the bookshelf page to see what the user sees."""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto(f"{BASE}/tools/story-studio/bookshelf", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)

    page.screenshot(path="/tmp/bookshelf-current.png", full_page=True)
    print("Screenshot: /tmp/bookshelf-current.png")

    # Also check the API response directly
    resp = page.request.get(f"{BASE}/api/v1/story/books", timeout=15000)
    data = resp.json()
    books = data.get("data", [])
    print(f"\nAPI returned {len(books)} books:")
    for b in books:
        print(f"  - {b.get('title')} (slug: {b.get('slug')}, cover: {b.get('coverImageUrl', 'none')[:50]})")

    # Check active jobs too
    resp2 = page.request.get(f"{BASE}/api/v1/story/jobs", timeout=15000)
    jobs_data = resp2.json()
    jobs = jobs_data.get("data", [])
    print(f"\nActive jobs: {len(jobs)}")
    for j in jobs:
        print(f"  - {j.get('id')[:8]}... status={j.get('status')} step={j.get('currentStep')}")

    browser.close()
