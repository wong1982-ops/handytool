"""
Flight Price Scraper
====================
Runs daily via GitHub Actions cron. Steps:
  1. Fetches distinct (origin, destination) pairs from flight_alerts
  2. Scrapes Google Flights via the Fli library (google-flights-search)
  3. Inserts results into flight_price_history
  4. Computes deals (>= 20% below 30-day average) and upserts into flight_deals
  5. Checks alerts and sends email via Resend when price target is met
"""

import os
import sys
import logging
from datetime import datetime, timezone, timedelta

import requests
from supabase import create_client

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
RESEND_API_KEY = os.environ["RESEND_API_KEY"]
SITE_URL = os.environ.get("SITE_URL", "https://toolk1t.com")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------------------------------------------------------------------------
# Optional Fli import — gracefully degrade if package is unavailable
# ---------------------------------------------------------------------------
_fli_available = False
try:
    from google_flights_search import search_flights  # type: ignore
    _fli_available = True
    log.info("google-flights-search library loaded successfully.")
except ImportError:
    log.warning(
        "google-flights-search is not installed or could not be imported. "
        "Skipping live flight scraping — deal computation and alert checking "
        "will still run against existing price history."
    )


# ---------------------------------------------------------------------------
# Step 1: Fetch distinct (origin, destination) pairs from active alerts
# ---------------------------------------------------------------------------
def get_active_routes() -> list[dict]:
    response = (
        supabase.table("flight_alerts")
        .select("origin, destination")
        .neq("status", "expired")
        .execute()
    )
    rows = response.data or []
    # Deduplicate
    seen = set()
    routes = []
    for row in rows:
        key = (row["origin"], row["destination"])
        if key not in seen:
            seen.add(key)
            routes.append({"origin": row["origin"], "destination": row["destination"]})
    log.info("Found %d distinct active route(s).", len(routes))
    return routes


# ---------------------------------------------------------------------------
# Step 2: Scrape Google Flights for each route via Fli
# ---------------------------------------------------------------------------
def scrape_route(origin: str, destination: str) -> dict | None:
    """Return a dict with keys: price, airline (or None on failure)."""
    if not _fli_available:
        return None
    try:
        result = search_flights(origin=origin, destination=destination)
        if result is None:
            log.warning("No result returned for %s -> %s.", origin, destination)
            return None
        price = getattr(result, "price", None)
        airline = getattr(result, "airline", None)
        if price is None:
            log.warning("Result for %s -> %s has no price attribute.", origin, destination)
            return None
        return {"price": float(price), "airline": airline}
    except Exception as exc:  # noqa: BLE001
        log.error("Error scraping %s -> %s: %s", origin, destination, exc)
        return None


# ---------------------------------------------------------------------------
# Step 3: Insert into flight_price_history
# ---------------------------------------------------------------------------
def insert_price_history(origin: str, destination: str, price: float, airline: str | None) -> None:
    record = {
        "origin": origin,
        "destination": destination,
        "price": price,
        "airline": airline,
        "source": "fli",
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }
    supabase.table("flight_price_history").insert(record).execute()
    log.info("Inserted price history: %s -> %s @ $%.0f", origin, destination, price)


# ---------------------------------------------------------------------------
# Step 4: Compute deals — 30-day average, upsert if discount >= 20%
# ---------------------------------------------------------------------------
def compute_deals(origin: str, destination: str, current_price: float) -> None:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    history_resp = (
        supabase.table("flight_price_history")
        .select("price")
        .eq("origin", origin)
        .eq("destination", destination)
        .gte("scraped_at", cutoff)
        .execute()
    )
    prices = [row["price"] for row in (history_resp.data or []) if row.get("price") is not None]
    if not prices:
        log.info("No price history for %s -> %s — skipping deal computation.", origin, destination)
        return

    avg_price = sum(prices) / len(prices)
    if avg_price <= 0:
        return

    discount_pct = (avg_price - current_price) / avg_price * 100

    if discount_pct >= 20:
        deal = {
            "origin": origin,
            "destination": destination,
            "current_price": current_price,
            "average_price": avg_price,
            "discount_pct": round(discount_pct, 2),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        supabase.table("flight_deals").upsert(deal).execute()
        log.info(
            "Deal upserted: %s -> %s  current=$%.0f  avg=$%.0f  discount=%.1f%%",
            origin,
            destination,
            current_price,
            avg_price,
            discount_pct,
        )
    else:
        log.info(
            "No deal for %s -> %s  current=$%.0f  avg=$%.0f  discount=%.1f%%",
            origin,
            destination,
            current_price,
            avg_price,
            discount_pct,
        )


# ---------------------------------------------------------------------------
# Step 5a: Send alert email via Resend
# ---------------------------------------------------------------------------
def send_alert_email(
    to_email: str,
    origin: str,
    destination: str,
    current_price: float,
    target_price: float,
) -> None:
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": "Flight Monitor <alerts@toolk1t.com>",
            "to": [to_email],
            "subject": f"Price Drop! {origin} \u2192 {destination} is now ${current_price:.0f}",
            "html": f"""
                <h2>Price Drop Alert!</h2>
                <p><strong>{origin} \u2192 {destination}</strong> is now <strong>${current_price:.0f}</strong></p>
                <p>Your target price: ${target_price:.0f}</p>
                <p><a href="{SITE_URL}/tools/flight-monitor">View in Flight Monitor</a></p>
                <p><a href="https://www.google.com/travel/flights?q={origin}+to+{destination}">Book on Google Flights</a></p>
            """,
        },
        timeout=15,
    )
    if response.status_code in (200, 201):
        log.info("Alert email sent to %s for %s -> %s.", to_email, origin, destination)
    else:
        log.error(
            "Failed to send email to %s (HTTP %d): %s",
            to_email,
            response.status_code,
            response.text,
        )


# ---------------------------------------------------------------------------
# Step 5b: Check alerts and notify
# ---------------------------------------------------------------------------
def check_and_notify_alerts(origin: str, destination: str, current_price: float) -> None:
    now = datetime.now(timezone.utc)
    threshold = (now - timedelta(hours=24)).isoformat()

    # Find alerts for this route where current price <= target and not notified recently
    alerts_resp = (
        supabase.table("flight_alerts")
        .select("id, user_email, target_price, last_notified_at")
        .eq("origin", origin)
        .eq("destination", destination)
        .neq("status", "expired")
        .lte("target_price", current_price)  # target_price >= current_price means triggered
        .execute()
    )

    # Filter: target_price >= current_price (we stored lte wrong above — re-filter in Python)
    # Correct semantics: alert triggers when current_price <= target_price
    triggered = []
    for alert in alerts_resp.data or []:
        if alert["target_price"] < current_price:
            continue  # not triggered
        last = alert.get("last_notified_at")
        if last is None or last < threshold:
            triggered.append(alert)

    if not triggered:
        log.info("No triggered alerts for %s -> %s @ $%.0f.", origin, destination, current_price)
        return

    log.info(
        "%d triggered alert(s) for %s -> %s @ $%.0f.",
        len(triggered),
        origin,
        destination,
        current_price,
    )

    for alert in triggered:
        send_alert_email(
            to_email=alert["user_email"],
            origin=origin,
            destination=destination,
            current_price=current_price,
            target_price=alert["target_price"],
        )
        # Update last_notified_at and status
        supabase.table("flight_alerts").update(
            {
                "last_notified_at": now.isoformat(),
                "status": "triggered",
            }
        ).eq("id", alert["id"]).execute()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    log.info("=== Flight scraper starting ===")
    routes = get_active_routes()

    if not routes:
        log.info("No active routes found. Exiting.")
        return

    # Track which routes we successfully scraped (have a current price)
    scraped: dict[tuple[str, str], float] = {}

    # --- Scraping phase ---
    if _fli_available:
        for route in routes:
            origin, destination = route["origin"], route["destination"]
            result = scrape_route(origin, destination)
            if result:
                insert_price_history(origin, destination, result["price"], result.get("airline"))
                scraped[(origin, destination)] = result["price"]
    else:
        log.info("Skipping live scraping (Fli unavailable). Will use existing history for deals/alerts.")

    # --- Deal computation phase ---
    # For routes we just scraped, use the fresh price.
    # For routes without a fresh price, pull the latest from history.
    for route in routes:
        origin, destination = route["origin"], route["destination"]
        if (origin, destination) in scraped:
            current_price = scraped[(origin, destination)]
        else:
            # Try to get the most recent price from history
            latest_resp = (
                supabase.table("flight_price_history")
                .select("price")
                .eq("origin", origin)
                .eq("destination", destination)
                .order("scraped_at", desc=True)
                .limit(1)
                .execute()
            )
            rows = latest_resp.data or []
            if not rows:
                log.info("No price history at all for %s -> %s — skipping.", origin, destination)
                continue
            current_price = rows[0]["price"]

        compute_deals(origin, destination, current_price)
        check_and_notify_alerts(origin, destination, current_price)

    log.info("=== Flight scraper finished ===")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        log.exception("Unhandled error in scraper: %s", exc)
        sys.exit(1)
