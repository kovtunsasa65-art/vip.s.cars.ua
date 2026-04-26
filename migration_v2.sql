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


-- ─── 3. ВІДГУКИ КОРИСТУВАЧІВ (Reviews) ──────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name       VARCHAR(100) NOT NULL,
  user_avatar     VARCHAR(500),
  rating          SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT        NOT NULL CHECK (char_length(review_text) >= 20),
  category        VARCHAR(50),            -- напр. 'avtopidbir', 'vykup', 'perevirka', 'obmin'
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_verified     BOOLEAN     NOT NULL DEFAULT false,
  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Якщо таблиця вже існує — додаємо колонку category (безпечно)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS category VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Кулдаун 14 днів — тригер
CREATE OR REPLACE FUNCTION check_review_cooldown()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '14 days'
  ) THEN
    RAISE EXCEPTION '14 days cooldown not elapsed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_cooldown ON reviews;
CREATE TRIGGER trg_review_cooldown
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_cooldown();

-- Автооновлення updated_at
CREATE OR REPLACE FUNCTION set_reviews_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_reviews_updated_at();

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved"  ON reviews;
DROP POLICY IF EXISTS "auth_insert_review"    ON reviews;
DROP POLICY IF EXISTS "admin_all_reviews"     ON reviews;
CREATE POLICY "public_read_approved"  ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "auth_insert_review"    ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_reviews"     ON reviews FOR ALL USING (auth.role() = 'service_role');


-- ─── 4. CRM: нові статуси лідів (5 колонок Kanban) ─────────
-- Якщо leads.status має обмеження enum — розширюємо або переходимо на TEXT
ALTER TABLE leads ALTER COLUMN status TYPE TEXT;
-- Тепер статуси: 'новий' | 'в роботі' | "зв'язались" | 'закрито (виграш)' | 'закрито (програш)'
-- Існуючі ліди зі статусом 'закрито' лишаються без змін (до ручної міграції).

-- Індекс для швидкої фільтрації по статусу
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score  ON leads(score);

-- ─── ГОТОВО ──────────────────────────────────────────────────
-- Після виконання перевір у Table Editor що з'явились:
-- • search_events
-- • feed_events
-- • reviews  (з тригерами cooldown + updated_at)
