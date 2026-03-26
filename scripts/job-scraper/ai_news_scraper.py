"""
AI News scraper — collects from RSS feeds + Hacker News + Reddit.
Uses feedparser for reliable RSS/Atom parsing.
"""

import hashlib
import re
import time
from datetime import datetime, timezone, timedelta

import feedparser
import requests

# ── RSS Sources ──────────────────────────────────────────

RSS_SOURCES = [
    {"source": "techcrunch", "name": "TechCrunch", "url": "https://techcrunch.com/category/artificial-intelligence/feed/"},
    {"source": "theverge", "name": "The Verge", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"},
    {"source": "venturebeat", "name": "VentureBeat", "url": "https://venturebeat.com/category/ai/feed/"},
    {"source": "arstechnica", "name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/technology-lab"},
    {"source": "arxiv", "name": "arXiv CS.AI", "url": "https://rss.arxiv.org/rss/cs.AI"},
    {"source": "huggingface", "name": "Hugging Face", "url": "https://huggingface.co/blog/feed.xml"},
    {"source": "openai_blog", "name": "OpenAI Blog", "url": "https://openai.com/blog/rss.xml"},
    {"source": "anthropic_blog", "name": "Anthropic Blog", "url": "https://www.anthropic.com/research/rss.xml"},
    {"source": "google_blog", "name": "Google AI Blog", "url": "https://blog.google/technology/ai/rss/"},
    {"source": "meta_blog", "name": "Meta AI Blog", "url": "https://ai.meta.com/blog/rss/"},
]

# ── AI Relevance Keywords ──────────────────────────────────

AI_KEYWORDS = [
    "model", "release", "llm", "gpt", "claude", "gemini", "llama", "mistral",
    "ai ", "artificial intelligence", "machine learning", "deep learning",
    "neural", "transformer", "diffusion", "multimodal", "embedding",
    "benchmark", "open source", "open-source", "fine-tune", "training",
    "inference", "reasoning", "agent", "copilot", "chatbot",
]

# ── Model Name Patterns ──────────────────────────────────

MODEL_PATTERNS = [
    r"GPT[-‑]?\d", r"Claude\s*\d", r"Gemini\s*[\d.]", r"Llama\s*[\d.]",
    r"Mistral\s*[\d.]", r"Mixtral", r"Phi[-‑]?\d", r"Qwen\s*[\d.]",
    r"Command\s*R", r"DALL[-‑]?E", r"Midjourney", r"Stable\s*Diffusion",
    r"Whisper", r"Sora", r"Flux", r"DeepSeek",
]


def strip_html(text):
    return re.sub(r"<[^>]*>", "", text or "").strip()


def url_to_id(url):
    return hashlib.md5(url.encode()).hexdigest()[:16]


def is_ai_relevant(title, summary=""):
    text = (title + " " + summary).lower()
    return any(kw in text for kw in AI_KEYWORDS)


def extract_model_name(title):
    for pattern in MODEL_PATTERNS:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return None


def categorise(title, summary=""):
    text = (title + " " + summary).lower()
    if any(w in text for w in ["code", "codex", "copilot", "programming", "developer tool"]):
        return "code-models"
    if any(w in text for w in ["speech", "audio", "voice", "whisper", "tts", "music"]):
        return "audio-speech"
    if any(w in text for w in ["image", "video", "diffusion", "dall-e", "midjourney", "sora", "flux"]):
        return "image-video"
    if any(w in text for w in ["multimodal", "vision", "multi-modal"]):
        return "multimodal"
    if any(w in text for w in ["embedding", "search", "retrieval", "rag", "vector"]):
        return "embedding-search"
    if any(w in text for w in ["robot", "agent", "autonomous", "planning"]):
        return "robotics-agents"
    return "llms"


def normalise_title(title):
    return re.sub(r"[^a-z0-9\s]", "", title.lower()).strip()


def collect_rss():
    """Collect news from all RSS feeds using feedparser."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
    all_items = []

    for src in RSS_SOURCES:
        try:
            feed = feedparser.parse(src["url"])
            count = 0

            for entry in feed.entries[:30]:  # limit per feed
                title = strip_html(entry.get("title", ""))
                if not title:
                    continue

                link = entry.get("link", "")
                if not link:
                    continue

                summary = strip_html(entry.get("summary", entry.get("description", "")))[:500]

                # Parse date
                posted_at = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    posted_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    posted_at = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)

                # 48-hour filter
                if posted_at and posted_at < cutoff:
                    continue

                # Image extraction
                image_url = None
                if hasattr(entry, "media_content") and entry.media_content:
                    image_url = entry.media_content[0].get("url")
                elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                    image_url = entry.media_thumbnail[0].get("url")

                all_items.append({
                    "source": src["source"],
                    "sourceId": url_to_id(link),
                    "sourceUrl": link,
                    "title": title,
                    "titleNormalised": normalise_title(title),
                    "summary": summary,
                    "category": categorise(title, summary),
                    "modelName": extract_model_name(title),
                    "imageUrl": image_url,
                    "postedAt": posted_at.isoformat() if posted_at else datetime.now(timezone.utc).isoformat(),
                })
                count += 1

            print(f"[ai-news] {src['name']}: {count} items")

        except Exception as e:
            print(f"[ai-news] Error fetching {src['name']}: {e}")
            continue

    return all_items


def collect_hackernews():
    """Collect AI news from Hacker News Algolia API."""
    cutoff_ts = int(time.time()) - 48 * 3600
    items = []
    queries = ["AI model release", "LLM launch", "new AI model"]

    for query in queries:
        try:
            url = f"https://hn.algolia.com/api/v1/search_by_date?query={query}&tags=story&numericFilters=created_at_i>{cutoff_ts}&hitsPerPage=20"
            resp = requests.get(url, timeout=15)
            if resp.status_code != 200:
                continue

            for hit in resp.json().get("hits", []):
                title = hit.get("title", "")
                source_url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}"

                if not title or not is_ai_relevant(title):
                    continue

                items.append({
                    "source": "hackernews",
                    "sourceId": f"hn-{hit['objectID']}",
                    "sourceUrl": source_url,
                    "title": title,
                    "titleNormalised": normalise_title(title),
                    "summary": "",
                    "category": categorise(title),
                    "modelName": extract_model_name(title),
                    "imageUrl": None,
                    "postedAt": hit.get("created_at", datetime.now(timezone.utc).isoformat()),
                })

        except Exception as e:
            print(f"[ai-news] HN query '{query}' error: {e}")

    print(f"[ai-news] Hacker News: {len(items)} items")
    return items


def collect_reddit():
    """Collect AI news from Reddit r/MachineLearning."""
    items = []

    try:
        url = "https://www.reddit.com/r/MachineLearning/search.json?q=flair:Research+OR+flair:News&sort=new&t=day&limit=25"
        headers = {"User-Agent": "Toolk1t-AI-Radar/1.0"}
        resp = requests.get(url, headers=headers, timeout=15)

        if resp.status_code != 200:
            print(f"[ai-news] Reddit: status {resp.status_code}")
            return items

        for post in resp.json().get("data", {}).get("children", []):
            data = post.get("data", {})
            title = data.get("title", "")
            source_url = f"https://reddit.com{data.get('permalink', '')}"

            if not title or not is_ai_relevant(title):
                continue

            items.append({
                "source": "reddit",
                "sourceId": f"reddit-{data.get('id', '')}",
                "sourceUrl": data.get("url", source_url),
                "title": title,
                "titleNormalised": normalise_title(title),
                "summary": (data.get("selftext", "") or "")[:500],
                "category": categorise(title, data.get("selftext", "")),
                "modelName": extract_model_name(title),
                "imageUrl": data.get("thumbnail") if data.get("thumbnail", "").startswith("http") else None,
                "postedAt": datetime.fromtimestamp(data.get("created_utc", 0), tz=timezone.utc).isoformat(),
            })

    except Exception as e:
        print(f"[ai-news] Reddit error: {e}")

    print(f"[ai-news] Reddit: {len(items)} items")
    return items


def collect_all_ai_news():
    """Collect from all AI news sources."""
    items = []
    items.extend(collect_rss())
    items.extend(collect_hackernews())
    items.extend(collect_reddit())

    # Deduplicate by titleNormalised
    seen = set()
    unique = []
    for item in items:
        key = item["titleNormalised"]
        if key not in seen:
            seen.add(key)
            unique.append(item)

    print(f"[ai-news] Total: {len(unique)} unique items (from {len(items)} raw)")
    return unique
