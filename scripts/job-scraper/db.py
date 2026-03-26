"""
Supabase database integration — pushes scraped data directly to the DB.
"""

import os
from datetime import datetime, timezone
from supabase import create_client, Client


def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


def upsert_ai_news(items: list[dict]) -> int:
    """Insert AI news items into the database. Returns count of new items."""
    if not items:
        return 0

    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0

    # Batch dedup: check existing titles
    titles = [item["titleNormalised"] for item in items]
    existing = set()

    for i in range(0, len(titles), 100):
        chunk = titles[i:i + 100]
        result = supabase.table("ai_news") \
            .select("title_normalised") \
            .in_("title_normalised", chunk) \
            .eq("is_active", True) \
            .execute()
        for row in result.data:
            existing.add(row["title_normalised"])

    # Insert new items
    new_items = [item for item in items if item["titleNormalised"] not in existing]

    for item in new_items:
        try:
            supabase.table("ai_news").upsert({
                "source": item["source"],
                "source_id": item["sourceId"],
                "source_url": item["sourceUrl"],
                "title": item["title"],
                "title_normalised": item["titleNormalised"],
                "summary": item.get("summary", ""),
                "category": item.get("category", "llms"),
                "model_name": item.get("modelName"),
                "provider": None,
                "tags": [],
                "image_url": item.get("imageUrl"),
                "posted_at": item.get("postedAt", now),
                "scraped_at": now,
                "is_active": True,
            }, on_conflict="source,source_id").execute()
            inserted += 1
        except Exception as e:
            print(f"[db] AI news insert error: {e}")

    print(f"[db] AI news: {inserted} new items inserted (skipped {len(existing)} existing)")
    return inserted


def upsert_jobs(jobs: list[dict], source: str) -> int:
    """Insert job listings into the database. Returns count of new items."""
    if not jobs:
        return 0

    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0

    # Batch dedup: check existing by title_normalised
    import re
    def normalise(text):
        return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()

    titles = list(set(normalise(j.get("title", "")) for j in jobs))
    existing_keys = set()

    for i in range(0, len(titles), 100):
        chunk = titles[i:i + 100]
        result = supabase.table("jobs") \
            .select("title_normalised, company_normalised, location_normalised, category") \
            .in_("title_normalised", chunk) \
            .eq("is_active", True) \
            .execute()
        for row in result.data:
            key = f"{row['title_normalised']}||{row['company_normalised']}||{row['location_normalised']}||{row['category']}"
            existing_keys.add(key)

    for job in jobs:
        title_norm = normalise(job.get("title", ""))
        company_norm = normalise(job.get("company", ""))
        location_norm = normalise(job.get("location", ""))

        # Categorise: check if IT or French
        text = (job.get("title", "") + " " + job.get("description", "")).lower()
        categories = []
        if any(kw in text for kw in ["software", "developer", "engineer", "devops", "cloud", "data", "react", "python", "java"]):
            categories.append("it")
        if any(kw in text for kw in ["french", "francophone", "français", "bilingual"]):
            categories.append("french")
        if not categories:
            categories = ["it"]  # default

        for category in categories:
            key = f"{title_norm}||{company_norm}||{location_norm}||{category}"
            if key in existing_keys:
                continue

            try:
                supabase.table("jobs").upsert({
                    "source": source,
                    "source_id": job.get("sourceId", ""),
                    "source_url": job.get("sourceUrl", ""),
                    "title": job.get("title", ""),
                    "title_normalised": title_norm,
                    "company": job.get("company", ""),
                    "company_normalised": company_norm,
                    "location": job.get("location", ""),
                    "location_normalised": location_norm,
                    "category": category,
                    "country": job.get("country", "AU"),
                    "employment_type": job.get("employmentType"),
                    "work_mode": job.get("workMode"),
                    "salary_min": job.get("salaryMin"),
                    "salary_max": job.get("salaryMax"),
                    "hourly_rate_min": job.get("hourlyRateMin"),
                    "hourly_rate_max": job.get("hourlyRateMax"),
                    "salary_currency": job.get("salaryCurrency"),
                    "description": job.get("description", ""),
                    "tags": job.get("tags", []),
                    "posted_at": job.get("postedAt", now),
                    "scraped_at": now,
                    "is_active": True,
                }, on_conflict="source,source_id,category").execute()
                inserted += 1
                existing_keys.add(key)
            except Exception as e:
                print(f"[db] Job insert error: {e}")

    print(f"[db] Jobs ({source}): {inserted} new items inserted")
    return inserted
