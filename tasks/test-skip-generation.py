"""
Test: Create a job with skipIllustration + skipAudio via API,
wait for completion, verify the book appears on the bookshelf API.
"""
from playwright.sync_api import sync_playwright
import json

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # Step 1: Generate a concept first
    print("1. Generating concept via API...")
    concept_resp = page.request.post(f"{BASE}/api/v1/story/concepts", data={
        "plot": "A brave little cat discovers a hidden garden behind the old library where flowers sing"
    })
    assert concept_resp.ok, f"Concept API failed: {concept_resp.status}"
    concept_data = concept_resp.json()
    concept = concept_data["data"]
    print(f"   Concept: {concept['title']} ({concept['tags']['pageCount']} pages)")

    # Step 2: Create job with both skips
    print("2. Creating job with skipIllustration=true, skipAudio=true...")
    job_resp = page.request.post(f"{BASE}/api/v1/story/jobs", data={
        "plot": "A brave little cat discovers a hidden garden behind the old library where flowers sing",
        "concept": concept,
        "skipIllustration": True,
        "skipAudio": True,
    }, timeout=600000)

    print(f"   Response status: {job_resp.status}")
    if not job_resp.ok:
        print(f"   Response body: {job_resp.text()}")
        print(f"   FAIL: Job creation returned {job_resp.status}")
        browser.close()
        exit(1)

    job_data = job_resp.json()
    job_id = job_data["jobId"]
    print(f"   Job created: {job_id}")

    # Step 3: Poll job status until complete (up to 6 min)
    print("3. Polling job status...")
    final_status = "unknown"
    for i in range(36):
        page.wait_for_timeout(10000)
        status_resp = page.request.get(f"{BASE}/api/v1/story/jobs")
        if status_resp.ok:
            jobs_data = status_resp.json()
            jobs = jobs_data.get("jobs", [])
            our_job = next((j for j in jobs if j.get("id") == job_id), None)
            if our_job:
                status = our_job.get("status", "unknown")
                step = our_job.get("current_step", "unknown")
                print(f"   [{(i+1)*10}s] Status: {status}, Step: {step}")
                if status == "completed":
                    final_status = "completed"
                    print("   Job completed!")
                    break
                if status == "failed":
                    final_status = "failed"
                    print(f"   Job FAILED: {our_job.get('error_message', 'unknown')}")
                    break
            else:
                print(f"   [{(i+1)*10}s] Job not found in active jobs (completed)")
                final_status = "completed"
                break
    else:
        print("   TIMEOUT: Job did not complete within 6 min")

    # Step 4: Check bookshelf API
    print("4. Checking bookshelf API...")
    books_resp = page.request.get(f"{BASE}/api/v1/story/books")
    assert books_resp.ok, f"Books API failed: {books_resp.status}"
    books_data = books_resp.json()
    books = books_data.get("data", [])
    print(f"   Found {len(books)} books")
    for b in books[:5]:
        has_cover = "yes" if b.get("coverImageUrl") else "no"
        print(f"   - {b.get('title', 'Untitled')} (cover: {has_cover})")
    if len(books) == 0:
        print("   FAIL: No books in bookshelf")
    else:
        print("   PASS: Books found in bookshelf API")

    # Step 5: Verify bookshelf UI
    print("5. Checking bookshelf UI...")
    page.goto(f"{BASE}/tools/story-studio/bookshelf", wait_until="networkidle", timeout=60000)

    # Wait for loading to finish (up to 15s)
    loading = page.locator("text=Loading...")
    try:
        loading.wait_for(state="hidden", timeout=15000)
        print("   Page loaded successfully")
    except Exception:
        print("   WARNING: Page still loading after 15s")

    page.screenshot(path="/tmp/test-skip-bookshelf.png", full_page=True)
    print("   Screenshot: /tmp/test-skip-bookshelf.png")

    no_books = page.locator("text=No books yet")
    if no_books.is_visible():
        print("   FAIL: UI shows 'No books yet'")
    else:
        book_titles = page.locator("h3").all()
        visible_titles = [t for t in book_titles if t.is_visible()]
        print(f"   UI shows {len(visible_titles)} book titles")
        for t in visible_titles[:5]:
            txt = t.text_content()
            if txt:
                print(f"   - {txt.strip()}")
        if len(visible_titles) > 0:
            print("   PASS: Bookshelf UI shows books")
        else:
            print("   FAIL: No visible book titles in UI")

    browser.close()
    print("\nDone!")
