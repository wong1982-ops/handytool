"""
Test: Speed mode — skipIllustration + skipAudio + skipValidation.
Should complete very quickly (no AI validation, no images, no audio).
"""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # Step 1: Generate a concept
    print("1. Generating concept...")
    concept_resp = page.request.post(f"{BASE}/api/v1/story/concepts", data={
        "plot": "A tiny robot learns to paint by watching sunsets over the ocean"
    })
    assert concept_resp.ok, f"Concept API failed: {concept_resp.status}"
    concept = concept_resp.json()["data"]
    print(f"   Concept: {concept['title']} ({concept['tags']['pageCount']} pages)")

    # Step 2: Create job in SPEED mode (all skips)
    print("2. Creating job in SPEED mode (skipValidation + skipIllustration + skipAudio)...")
    job_resp = page.request.post(f"{BASE}/api/v1/story/jobs", data={
        "plot": "A tiny robot learns to paint by watching sunsets over the ocean",
        "concept": concept,
        "skipIllustration": True,
        "skipAudio": True,
        "skipValidation": True,
    }, timeout=600000)

    print(f"   Response: {job_resp.status}")
    assert job_resp.ok, f"Job creation failed: {job_resp.status} - {job_resp.text()}"
    job_id = job_resp.json()["jobId"]
    print(f"   Job: {job_id}")

    # Step 3: Poll — should complete very fast
    print("3. Polling (expecting fast completion)...")
    for i in range(18):
        page.wait_for_timeout(5000)
        status_resp = page.request.get(f"{BASE}/api/v1/story/jobs")
        if status_resp.ok:
            jobs = status_resp.json().get("jobs", [])
            our_job = next((j for j in jobs if j.get("id") == job_id), None)
            if our_job:
                status = our_job.get("status", "?")
                step = our_job.get("current_step", "?")
                print(f"   [{(i+1)*5}s] {status} @ {step}")
                if status == "completed":
                    print("   PASS: Job completed!")
                    break
                if status == "failed":
                    print(f"   FAIL: {our_job.get('error_message', '?')}")
                    break
            else:
                print(f"   [{(i+1)*5}s] Job gone from active list (completed)")
                break
    else:
        print("   TIMEOUT")

    # Step 4: Verify book in API
    print("4. Checking bookshelf API...")
    books_resp = page.request.get(f"{BASE}/api/v1/story/books")
    assert books_resp.ok
    books = books_resp.json().get("data", [])
    latest = books[0] if books else None
    if latest:
        print(f"   Latest: {latest['title']} (cover: {'yes' if latest.get('coverImageUrl') else 'no'})")
        print("   PASS: Book found")
    else:
        print("   FAIL: No books")

    browser.close()
    print("\nDone!")
