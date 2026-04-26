-- ================================================================
-- МІГРАЦІЯ v2 — запустити в Supabase SQL Editor
-- Всі команди ідемпотентні (IF NOT EXISTS / OR REPLACE)
-- ================================================================

-- ─── 1. АНАЛІТИКА ПОШУКУ (SearchBox) ────────────────────────

CREATE TABLE IF NOT EXISTS search_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query           TEXT        NOT NULL,
  suggestion_type TEXT,
  session_id      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_events_created ON search_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_query   ON search_events(query);

CREATE OR REPLACE FUNCTION popular_searches(days int DEFAULT 7, limit_count int DEFAULT 5)
RETURNS TABLE(query text, cnt bigint)
LANGUAGE sql STABLE AS $$
  SELECT query, COUNT(*) AS cnt
  FROM search_events
  WHERE created_at > NOW() - (days || ' days')::interval
  GROUP BY query
  ORDER BY cnt DESC
  LIMIT limit_count;
$$;

ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_search_events" ON search_events;
DROP POLICY IF EXISTS "service_read_search_events" ON search_events;
CREATE POLICY "anon_insert_search_events"   ON search_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service_read_search_events"  ON search_events FOR SELECT USING (auth.role() = 'service_role');


-- ─── 2. АНАЛІТИКА СТРІЧКИ /feed (FeedPage) ──────────────────

CREATE TABLE IF NOT EXISTS feed_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  car_id          BIGINT      REFERENCES cars(id) ON DELETE SET NULL,
  session_id      TEXT,
  duration_ms     INT         NOT NULL DEFAULT 0,
  desc_read_pct   SMALLINT    NOT NULL DEFAULT 0 CHECK (desc_read_pct BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feed_events_car_id   ON feed_events(car_id);
CREATE INDEX IF NOT EXISTS idx_feed_events_created  ON feed_events(created_at DESC);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_feed_events" ON feed_events;
DROP POLICY IF EXISTS "service_read_feed_events" ON feed_events;
CREATE POLICY "anon_insert_feed_events"   ON feed_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service_read_feed_events"  ON feed_events FOR SELECT USING (auth.role() = 'service_role');


-- ─── ГОТОВО ──────────────────────────────────────────────────
-- Після виконання перевір у Table Editor що з'явились:
-- • search_events
-- • feed_events
