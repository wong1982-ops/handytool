"""
Job Scraper Microservice — powered by Scrapling.
Scrapes job listings from Seek (AU/NZ), Trade Me (NZ), Indeed (AU/NZ), LinkedIn.
Called by the Node.js cron worker via HTTP.

Usage:
  cd scripts/job-scraper
  pip install -r requirements.txt
  python app.py                    # dev mode, port 4001
  gunicorn app:app -b 0.0.0.0:4001  # production
"""

import os
import json
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify

app = Flask(__name__)
API_SECRET = os.environ.get("JOB_SCRAPER_SECRET", "dev-secret")


def require_auth(f):
    """Simple Bearer token auth."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if auth != f"Bearer {API_SECRET}":
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def strip_html(text):
    """Remove HTML tags from a string."""
    import re
    return re.sub(r"<[^>]*>", "", text or "").strip()


def url_to_id(url):
    """Generate a stable short ID from a URL."""
    return hashlib.md5(url.encode()).hexdigest()[:16]


def scrape_seek_au(keywords, max_pages=2):
    """Scrape Seek Australia for job listings."""
    from scrapling import Fetcher

    fetcher = Fetcher(auto_match=True)
    jobs = []
    seen_ids = set()

    for keyword in keywords[:10]:  # limit keywords to avoid rate limiting
        for page in range(1, max_pages + 1):
            try:
                url = f"https://www.seek.com.au/{keyword.replace(' ', '-')}-jobs?page={page}"
                response = fetcher.get(url, timeout=15)

                if response.status != 200:
                    print(f"[seek-au] {keyword} page {page}: status {response.status}")
                    break

                # Seek uses article[data-testid] for job cards
                cards = response.css('article[data-testid^="job-card"]')
                if not cards:
                    # Fallback: try common job listing patterns
                    cards = response.css('[data-job-id], .job-card, ._1wkzzau0')

                for card in cards:
                    title_el = card.css_first('a[data-automation="jobTitle"], h3 a, [data-testid="job-card-title"] a')
                    company_el = card.css_first('a[data-automation="jobCompany"], [data-testid="job-card-company"]')
                    location_el = card.css_first('a[data-automation="jobLocation"], [data-testid="job-card-location"]')
                    link_el = title_el

                    if not title_el:
                        continue

                    title = strip_html(title_el.text or "")
                    company = strip_html(company_el.text if company_el else "")
                    location = strip_html(location_el.text if location_el else "")
                    href = link_el.attrib.get("href", "") if link_el else ""

                    if href and not href.startswith("http"):
                        href = f"https://www.seek.com.au{href}"

                    source_id = url_to_id(href or f"{title}-{company}")
                    if source_id in seen_ids:
                        continue
                    seen_ids.add(source_id)

                    # Try to extract salary
                    salary_el = card.css_first('[data-automation="jobSalary"], [data-testid="job-card-salary"]')
                    salary_text = strip_html(salary_el.text if salary_el else "")

                    # Try description snippet
                    desc_el = card.css_first('[data-automation="jobShortDescription"], .job-card__description, [data-testid="job-card-teaser"]')
                    description = strip_html(desc_el.text if desc_el else "")

                    jobs.append({
                        "sourceId": f"seek-{source_id}",
                        "sourceUrl": href,
                        "title": title,
                        "company": company,
                        "location": location,
                        "country": "AU",
                        "description": description,
                        "postedAt": datetime.utcnow().isoformat(),
                    })

            except Exception as e:
                print(f"[seek-au] Error scraping '{keyword}' page {page}: {e}")
                continue

    return jobs


def scrape_seek_nz(keywords, max_pages=2):
    """Scrape Seek New Zealand for job listings."""
    from scrapling import Fetcher

    fetcher = Fetcher(auto_match=True)
    jobs = []
    seen_ids = set()

    for keyword in keywords[:10]:
        for page in range(1, max_pages + 1):
            try:
                url = f"https://www.seek.co.nz/{keyword.replace(' ', '-')}-jobs?page={page}"
                response = fetcher.get(url, timeout=15)

                if response.status != 200:
                    break

                cards = response.css('article[data-testid^="job-card"]')
                if not cards:
                    cards = response.css('[data-job-id], .job-card')

                for card in cards:
                    title_el = card.css_first('a[data-automation="jobTitle"], h3 a, [data-testid="job-card-title"] a')
                    company_el = card.css_first('a[data-automation="jobCompany"], [data-testid="job-card-company"]')
                    location_el = card.css_first('a[data-automation="jobLocation"], [data-testid="job-card-location"]')

                    if not title_el:
                        continue

                    title = strip_html(title_el.text or "")
                    company = strip_html(company_el.text if company_el else "")
                    location = strip_html(location_el.text if location_el else "")
                    href = title_el.attrib.get("href", "")

                    if href and not href.startswith("http"):
                        href = f"https://www.seek.co.nz{href}"

                    source_id = url_to_id(href or f"{title}-{company}")
                    if source_id in seen_ids:
                        continue
                    seen_ids.add(source_id)

                    jobs.append({
                        "sourceId": f"seek-nz-{source_id}",
                        "sourceUrl": href,
                        "title": title,
                        "company": company,
                        "location": location,
                        "country": "NZ",
                        "description": strip_html((card.css_first('[data-automation="jobShortDescription"]') or card).text or ""),
                        "postedAt": datetime.utcnow().isoformat(),
                    })

            except Exception as e:
                print(f"[seek-nz] Error scraping '{keyword}' page {page}: {e}")
                continue

    return jobs


def scrape_trademe(keywords, max_pages=2):
    """Scrape Trade Me Jobs (NZ)."""
    from scrapling import Fetcher

    fetcher = Fetcher(auto_match=True)
    jobs = []
    seen_ids = set()

    for keyword in keywords[:8]:
        for page in range(1, max_pages + 1):
            try:
                url = f"https://www.trademe.co.nz/a/jobs/search?search_string={keyword.replace(' ', '+')}&page={page}"
                response = fetcher.get(url, timeout=15)

                if response.status != 200:
                    break

                # Trade Me job cards
                cards = response.css('[class*="ListingCard"], .tm-jobs-search-card, [data-testid="listing"]')
                if not cards:
                    cards = response.css('.o-card, .supergrid-listing')

                for card in cards:
                    title_el = card.css_first('h3 a, .tm-jobs-search-card__title a, [class*="title"] a')
                    company_el = card.css_first('[class*="company"], .tm-jobs-search-card__company')
                    location_el = card.css_first('[class*="location"], .tm-jobs-search-card__location')

                    if not title_el:
                        continue

                    title = strip_html(title_el.text or "")
                    company = strip_html(company_el.text if company_el else "")
                    location = strip_html(location_el.text if location_el else "")
                    href = title_el.attrib.get("href", "")

                    if href and not href.startswith("http"):
                        href = f"https://www.trademe.co.nz{href}"

                    source_id = url_to_id(href or f"{title}-{company}")
                    if source_id in seen_ids:
                        continue
                    seen_ids.add(source_id)

                    jobs.append({
                        "sourceId": f"trademe-{source_id}",
                        "sourceUrl": href,
                        "title": title,
                        "company": company,
                        "location": location,
                        "country": "NZ",
                        "description": "",
                        "postedAt": datetime.utcnow().isoformat(),
                    })

            except Exception as e:
                print(f"[trademe] Error scraping '{keyword}' page {page}: {e}")
                continue

    return jobs


def scrape_indeed(keywords, country="au", max_pages=2):
    """Scrape Indeed AU/NZ."""
    from scrapling import StealthyFetcher

    fetcher = StealthyFetcher(auto_match=True)
    domain = "au.indeed.com" if country == "au" else "nz.indeed.com"
    jobs = []
    seen_ids = set()

    for keyword in keywords[:8]:
        for page in range(max_pages):
            try:
                start = page * 10
                url = f"https://{domain}/jobs?q={keyword.replace(' ', '+')}&start={start}&fromage=3"
                response = fetcher.get(url, timeout=20)

                if response.status != 200:
                    break

                cards = response.css('.job_seen_beacon, .jobsearch-ResultsList .result, [data-testid="job-card"]')
                if not cards:
                    cards = response.css('.tapItem, .job-card')

                for card in cards:
                    title_el = card.css_first('h2 a, .jobTitle a, [data-testid="job-title"] a')
                    company_el = card.css_first('[data-testid="company-name"], .companyName, .company')
                    location_el = card.css_first('[data-testid="text-location"], .companyLocation, .location')

                    if not title_el:
                        continue

                    title = strip_html(title_el.text or "")
                    company = strip_html(company_el.text if company_el else "")
                    location = strip_html(location_el.text if location_el else "")
                    href = title_el.attrib.get("href", "")

                    if href and not href.startswith("http"):
                        href = f"https://{domain}{href}"

                    source_id = url_to_id(href or f"{title}-{company}")
                    if source_id in seen_ids:
                        continue
                    seen_ids.add(source_id)

                    desc_el = card.css_first('.job-snippet, [data-testid="job-snippet"]')

                    jobs.append({
                        "sourceId": f"indeed-{source_id}",
                        "sourceUrl": href,
                        "title": title,
                        "company": company,
                        "location": location,
                        "country": country.upper(),
                        "description": strip_html(desc_el.text if desc_el else ""),
                        "postedAt": datetime.utcnow().isoformat(),
                    })

            except Exception as e:
                print(f"[indeed-{country}] Error scraping '{keyword}' page {page}: {e}")
                continue

    return jobs


# ── Flask Routes ──────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"ok": True, "service": "job-scraper", "engine": "scrapling"})


@app.route("/scrape", methods=["POST"])
@require_auth
def scrape():
    """
    Scrape jobs from specified sources.
    Body: { "source": "seek"|"indeed"|"linkedin"|"trademe", "keywords": [...], "country": "au"|"nz" }
    Returns: { "jobs": [...] }
    """
    body = request.get_json(force=True)
    source = body.get("source", "seek")
    keywords = body.get("keywords", [])
    country = body.get("country", "au")

    if not keywords:
        return jsonify({"error": "keywords required"}), 400

    try:
        if source == "seek" and country == "au":
            jobs = scrape_seek_au(keywords)
        elif source == "seek" and country == "nz":
            jobs = scrape_seek_nz(keywords)
        elif source == "trademe":
            jobs = scrape_trademe(keywords)
        elif source == "indeed":
            jobs = scrape_indeed(keywords, country)
        else:
            return jsonify({"error": f"Unknown source: {source}"}), 400

        print(f"[job-scraper] {source} ({country}): found {len(jobs)} jobs")
        return jsonify({"jobs": jobs, "count": len(jobs), "source": source, "country": country})

    except Exception as e:
        print(f"[job-scraper] Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/scrape/all", methods=["POST"])
@require_auth
def scrape_all():
    """
    Scrape all sources for a country.
    Body: { "keywords": { "it": [...], "french": [...] }, "country": "au"|"nz" }
    Returns: { "jobs": [...], "counts": { "seek": N, "indeed": N, ... } }
    """
    body = request.get_json(force=True)
    kw = body.get("keywords", {})
    country = body.get("country", "au")
    all_keywords = kw.get("it", []) + kw.get("french", [])

    if not all_keywords:
        return jsonify({"error": "keywords required"}), 400

    all_jobs = []
    counts = {}

    # Seek
    try:
        if country == "au":
            seek_jobs = scrape_seek_au(all_keywords)
        else:
            seek_jobs = scrape_seek_nz(all_keywords)
        all_jobs.extend(seek_jobs)
        counts["seek"] = len(seek_jobs)
    except Exception as e:
        counts["seek"] = f"error: {e}"

    # Indeed
    try:
        indeed_jobs = scrape_indeed(all_keywords, country)
        all_jobs.extend(indeed_jobs)
        counts["indeed"] = len(indeed_jobs)
    except Exception as e:
        counts["indeed"] = f"error: {e}"

    # Trade Me (NZ only)
    if country == "nz":
        try:
            trademe_jobs = scrape_trademe(all_keywords)
            all_jobs.extend(trademe_jobs)
            counts["trademe"] = len(trademe_jobs)
        except Exception as e:
            counts["trademe"] = f"error: {e}"

    # Deduplicate by sourceId
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        if job["sourceId"] not in seen:
            seen.add(job["sourceId"])
            unique_jobs.append(job)

    print(f"[job-scraper] All ({country}): {len(unique_jobs)} unique jobs from {counts}")
    return jsonify({"jobs": unique_jobs, "count": len(unique_jobs), "counts": counts})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4001))
    print(f"[job-scraper] Starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
