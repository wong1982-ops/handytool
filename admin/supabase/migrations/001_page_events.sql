-- Page Events table for analytics tracking
CREATE TABLE IF NOT EXISTS page_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text NOT NULL,
  page_path     text NOT NULL,
  tool_slug     text,
  referrer      text,
  duration_ms   integer,
  device_type   text,
  browser       text,
  os            text,
  country       text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_events_created_at ON page_events (created_at);
CREATE INDEX IF NOT EXISTS idx_page_events_tool_slug ON page_events (tool_slug);
CREATE INDEX IF NOT EXISTS idx_page_events_session_id ON page_events (session_id);

-- Enable RLS
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

-- RPC: tool_popularity
CREATE OR REPLACE FUNCTION tool_popularity(time_range_days int DEFAULT 30)
RETURNS TABLE (
  tool_slug text,
  tool_name text,
  view_count bigint,
  unique_visitors bigint,
  avg_duration_seconds numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    pe.tool_slug,
    INITCAP(REPLACE(pe.tool_slug, '-', ' ')) AS tool_name,
    COUNT(*) AS view_count,
    COUNT(DISTINCT pe.session_id) AS unique_visitors,
    ROUND(AVG(pe.duration_ms) / 1000.0, 1) AS avg_duration_seconds
  FROM page_events pe
  WHERE pe.tool_slug IS NOT NULL
    AND pe.created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY pe.tool_slug
  ORDER BY view_count DESC;
$$;

-- RPC: daily_traffic
CREATE OR REPLACE FUNCTION daily_traffic(time_range_days int DEFAULT 30)
RETURNS TABLE (
  day date,
  view_count bigint,
  unique_visitors bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    DATE(created_at) AS day,
    COUNT(*) AS view_count,
    COUNT(DISTINCT session_id) AS unique_visitors
  FROM page_events
  WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY day;
$$;

-- RPC: device_breakdown
CREATE OR REPLACE FUNCTION device_breakdown(time_range_days int DEFAULT 30)
RETURNS TABLE (
  dimension text,
  label text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 'device_type' AS dimension, COALESCE(device_type, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY device_type
  UNION ALL
  SELECT 'browser' AS dimension, COALESCE(browser, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY browser
  UNION ALL
  SELECT 'os' AS dimension, COALESCE(os, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY os;
$$;

-- RPC: top_referrers
CREATE OR REPLACE FUNCTION top_referrers(time_range_days int DEFAULT 30)
RETURNS TABLE (
  referrer_domain text,
  visit_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(
      REGEXP_REPLACE(referrer, '^https?://([^/]+).*$', '\1'),
      'Direct'
    ) AS referrer_domain,
    COUNT(*) AS visit_count
  FROM page_events
  WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY referrer_domain
  ORDER BY visit_count DESC
  LIMIT 20;
$$;

-- RPC: dashboard_summary
CREATE OR REPLACE FUNCTION dashboard_summary()
RETURNS TABLE (
  total_views_30d bigint,
  unique_visitors_30d bigint,
  avg_duration_30d numeric,
  total_views_7d bigint,
  unique_visitors_7d bigint,
  avg_duration_7d numeric,
  active_today bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM page_events WHERE created_at >= now() - interval '30 days'),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '30 days'),
    (SELECT ROUND(AVG(duration_ms) / 1000.0, 1) FROM page_events WHERE created_at >= now() - interval '30 days' AND duration_ms IS NOT NULL),
    (SELECT COUNT(*) FROM page_events WHERE created_at >= now() - interval '7 days'),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '7 days'),
    (SELECT ROUND(AVG(duration_ms) / 1000.0, 1) FROM page_events WHERE created_at >= now() - interval '7 days' AND duration_ms IS NOT NULL),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '1 day');
$$;
