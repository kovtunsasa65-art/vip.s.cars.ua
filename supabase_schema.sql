-- ============================================================
-- VIP CARS — ПОВНА СХЕМА БД (Версія 2.0 — Чисте встановлення)
-- Увага: цей скрипт видалить старі таблиці та створить нові!
-- ============================================================

-- Видаляємо старі об'єкти (якщо вони є)
DROP VIEW IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_price_history CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_views CASCADE;
DROP TABLE IF EXISTS subscription_matches CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS seo_pages CASCADE;
DROP TABLE IF EXISTS redirects CASCADE;
DROP TABLE IF EXISTS ai_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS cars CASCADE;

-- ─── ТИПИ ДАНИХ (ENUMS) ─────────────────────────────────────
DROP TYPE IF EXISTS currency_enum CASCADE;
CREATE TYPE currency_enum AS ENUM ('USD', 'UAH', 'EUR');

DROP TYPE IF EXISTS body_enum CASCADE;
CREATE TYPE body_enum AS ENUM ('Седан', 'Позашляховик / Кросовер', 'Хетчбек', 'Універсал', 'Купе', 'Мінівен', 'Пікап', 'Кабріолет', 'Фургон');

DROP TYPE IF EXISTS engine_enum CASCADE;
CREATE TYPE engine_enum AS ENUM ('Бензин', 'Дизель', 'Електро', 'Гібрид', 'Газ', 'Газ / Бензин');

DROP TYPE IF EXISTS trans_enum CASCADE;
CREATE TYPE trans_enum AS ENUM ('Автомат', 'Механіка', 'Варіатор', 'Робот');

DROP TYPE IF EXISTS drive_enum CASCADE;
CREATE TYPE drive_enum AS ENUM ('Передній', 'Задній', 'Повний');

DROP TYPE IF EXISTS cond_enum CASCADE;
CREATE TYPE cond_enum AS ENUM ('Ідеальний', 'Гарний', 'Задовільний', 'Потребує ремонту', 'Після ДТП');

DROP TYPE IF EXISTS source_enum CASCADE;
CREATE TYPE source_enum AS ENUM ('seller', 'ai_improved', 'ai_generated');

DROP TYPE IF EXISTS badge_enum CASCADE;
CREATE TYPE badge_enum AS ENUM ('нове', 'вигідно', 'терміново', 'ексклюзив');

DROP TYPE IF EXISTS list_enum CASCADE;
CREATE TYPE list_enum AS ENUM ('company', 'private', 'verified');

DROP TYPE IF EXISTS status_enum CASCADE;
CREATE TYPE status_enum AS ENUM ('draft', 'moderation', 'active', 'paused', 'sold', 'hidden', 'archived', 'rejected');

DROP TYPE IF EXISTS role_enum CASCADE;
CREATE TYPE role_enum AS ENUM ('user', 'seller', 'manager', 'editor', 'admin');

DROP TYPE IF EXISTS user_status_enum CASCADE;
CREATE TYPE user_status_enum AS ENUM ('active', 'blocked', 'pending_verification');

DROP TYPE IF EXISTS lead_type_enum CASCADE;
CREATE TYPE lead_type_enum AS ENUM ('підбір', 'викуп', 'покупка', 'консультація');

DROP TYPE IF EXISTS lead_score_enum CASCADE;
CREATE TYPE lead_score_enum AS ENUM ('гарячий', 'теплий', 'холодний');

DROP TYPE IF EXISTS lead_status_enum CASCADE;
CREATE TYPE lead_status_enum AS ENUM ('new', 'in_progress', 'closed_won', 'closed_lost', 'spam', 'duplicate');

-- ─── ТАБЛИЦЯ: cars ──────────────────────────────────────────
CREATE TABLE cars (
  id                    BIGSERIAL PRIMARY KEY,
  title                 VARCHAR(200) NOT NULL,
  slug                  VARCHAR(200) UNIQUE NOT NULL,

  -- Ціна
  price                 DECIMAL(12,2) NOT NULL,
  currency              currency_enum DEFAULT 'USD',
  price_uah_cached      DECIMAL(12,2),
  is_negotiable         BOOLEAN DEFAULT FALSE,

  -- Ідентифікація
  brand                 VARCHAR(100) NOT NULL,
  model                 VARCHAR(100) NOT NULL,
  generation            VARCHAR(100),
  year                  SMALLINT NOT NULL,
  body_type             body_enum,

  -- Технічні
  engine_volume         DECIMAL(3,1),
  engine_type           engine_enum,
  power_hp              SMALLINT,
  transmission          trans_enum,
  drive_type            drive_enum,
  fuel_consumption      DECIMAL(4,1),
  color                 VARCHAR(50),

  -- Стан
  mileage               INT NOT NULL,
  mileage_verified      BOOLEAN DEFAULT FALSE,
  condition             cond_enum,
  vin                   VARCHAR(17) UNIQUE,
  vin_verified_at       TIMESTAMPTZ,
  vin_report            JSONB,
  owners_count          SMALLINT,
  service_history       BOOLEAN DEFAULT FALSE,
  accidents_count       SMALLINT DEFAULT 0,
  trust_score           SMALLINT DEFAULT 0,

  -- Локація
  city                  VARCHAR(100),
  region                VARCHAR(100),
  country               VARCHAR(100) DEFAULT 'Україна',
  lat                   DECIMAL(10,7),
  lng                   DECIMAL(10,7),

  -- Контент
  description           TEXT,
  description_raw       TEXT,
  description_source    source_enum DEFAULT 'seller',
  description_ai_edited_at TIMESTAMPTZ,

  -- Атрибути
  is_checked            BOOLEAN DEFAULT FALSE,
  is_top                BOOLEAN DEFAULT FALSE,
  is_urgent             BOOLEAN DEFAULT FALSE,
  is_exchange           BOOLEAN DEFAULT FALSE,
  is_credit             BOOLEAN DEFAULT FALSE,
  badge                 badge_enum,

  -- Ринкова ціна
  market_price_median   DECIMAL(12,2),
  market_price_updated  TIMESTAMPTZ,
  price_diff_percent    DECIMAL(5,2),

  -- Приналежність
  listing_type          list_enum DEFAULT 'company',
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_id            UUID REFERENCES auth.users(id),
  seller_name_public    VARCHAR(100),
  seller_phone_public   VARCHAR(20),

  -- Статистика
  views_count           INT DEFAULT 0,
  views_today           INT DEFAULT 0,
  clicks_call           INT DEFAULT 0,
  clicks_phone_reveal   INT DEFAULT 0,
  clicks_message        INT DEFAULT 0,
  favorites_count       INT DEFAULT 0,

  -- Ранжування та SEO
  ranking_score         DECIMAL(8,2) DEFAULT 0,
  last_boosted_at       TIMESTAMPTZ,
  seo_title             VARCHAR(200),
  seo_description       VARCHAR(400),
  seo_h1                VARCHAR(200),
  noindex               BOOLEAN DEFAULT FALSE,

  -- Системне
  status                status_enum DEFAULT 'moderation',
  rejection_reason      TEXT,
  sold_price            DECIMAL(12,2),
  sold_at               TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_cars_status_ranking ON cars(status, is_top, ranking_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_cars_status         ON cars(status);
CREATE INDEX idx_cars_ranking        ON cars(ranking_score DESC);
CREATE INDEX idx_cars_filter         ON cars(brand, model, year);
CREATE INDEX idx_cars_brand          ON cars(brand);
CREATE INDEX idx_cars_model          ON cars(model);
CREATE INDEX idx_cars_year           ON cars(year);
CREATE INDEX idx_cars_body_type      ON cars(body_type);
CREATE INDEX idx_cars_engine_type    ON cars(engine_type);
CREATE INDEX idx_cars_transmission   ON cars(transmission);
CREATE INDEX idx_cars_drive_type     ON cars(drive_type);
CREATE INDEX idx_cars_mileage        ON cars(mileage);
CREATE INDEX idx_cars_city           ON cars(city);
CREATE INDEX idx_cars_price_cached   ON cars(price_uah_cached);
CREATE INDEX idx_cars_newest         ON cars(status, created_at DESC);
CREATE INDEX idx_cars_deleted        ON cars(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_cars_listing_type   ON cars(listing_type);
CREATE INDEX idx_cars_is_checked     ON cars(is_checked);
CREATE INDEX idx_cars_is_top         ON cars(is_top);
CREATE INDEX idx_cars_user_id        ON cars(user_id);


-- ─── ТАБЛИЦЯ: car_images ────────────────────────────────────
CREATE TABLE car_images (
  id            BIGSERIAL PRIMARY KEY,
  car_id        BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url           VARCHAR(500) NOT NULL,
  url_webp      VARCHAR(500) NOT NULL,
  url_thumb     VARCHAR(500),
  url_blur      VARCHAR(500),
  width         SMALLINT,
  height        SMALLINT,
  alt           VARCHAR(200),
  is_cover      BOOLEAN DEFAULT FALSE,
  sort_order    SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_car_images_car_order ON car_images(car_id, sort_order);


-- ─── ТАБЛИЦЯ: car_price_history ─────────────────────────────
CREATE TABLE car_price_history (
  id            BIGSERIAL PRIMARY KEY,
  car_id        BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  price         DECIMAL(12,2) NOT NULL,
  price_uah     DECIMAL(12,2),
  currency      VARCHAR(3),
  changed_by    UUID REFERENCES auth.users(id),
  reason        VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_price_history_car ON car_price_history(car_id, created_at DESC);


-- ─── ТАБЛИЦЯ: profiles (кабінети) ───────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  phone_verified  BOOLEAN DEFAULT FALSE,
  name            VARCHAR(100),
  email           VARCHAR(200) UNIQUE,
  telegram_chat   VARCHAR(100),
  telegram_username VARCHAR(100),
  telegram_linked_at TIMESTAMPTZ,
  role            role_enum DEFAULT 'user',
  avatar_url      VARCHAR(500),
  city            VARCHAR(100),
  language        VARCHAR(5) DEFAULT 'uk',
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{"telegram_daily": true, "telegram_price_drop": true}',
  last_login_at   TIMESTAMPTZ,
  login_count     INT DEFAULT 0,
  listings_count  SMALLINT DEFAULT 0,
  status          user_status_enum DEFAULT 'active',
  blocked_reason  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_profiles_phone         ON profiles(phone);
CREATE INDEX idx_profiles_telegram_chat ON profiles(telegram_chat);
CREATE INDEX idx_profiles_role          ON profiles(role);


-- ─── ТАБЛИЦЯ: auth_codes (SMS-коди) ─────────────────────────
CREATE TABLE auth_codes (
  id          BIGSERIAL PRIMARY KEY,
  phone       VARCHAR(20) NOT NULL,
  code_hash   VARCHAR(100) NOT NULL,
  attempts    SMALLINT DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_auth_codes_phone_date ON auth_codes(phone, created_at DESC);


-- ─── ТАБЛИЦЯ: sessions (Активні сесії) ──────────────────────
CREATE TABLE sessions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(100) UNIQUE NOT NULL,
  device          VARCHAR(200),
  ip_address      VARCHAR(45),
  expires_at      TIMESTAMPTZ NOT NULL,
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_sessions_user       ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);


-- ─── ТАБЛИЦЯ: user_favorites ────────────────────────────────
CREATE TABLE user_favorites (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id      BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, car_id)
);
CREATE INDEX idx_fav_user ON user_favorites(user_id);
CREATE INDEX idx_fav_car  ON user_favorites(car_id);


-- ─── ТАБЛИЦЯ: user_views ────────────────────────────────────
-- Примітка: для зберігання 6 місяців рекомендується налаштувати pg_partman 
-- для партиціонування по діапазону (RANGE) поля viewed_at.
CREATE TABLE user_views (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  VARCHAR(100),
  car_id      BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_sec SMALLINT
);
CREATE INDEX idx_views_user ON user_views(user_id, viewed_at DESC);
CREATE INDEX idx_views_car  ON user_views(car_id, viewed_at DESC);


-- ─── ТАБЛИЦЯ: subscriptions (Підписки Telegram) ────────────
CREATE TABLE subscriptions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            VARCHAR(100),
  brand           VARCHAR(100),
  model           VARCHAR(100),
  year_min        SMALLINT,
  year_max        SMALLINT,
  price_min       DECIMAL(12,2),
  price_max       DECIMAL(12,2),
  currency        VARCHAR(3),
  fuel_types      TEXT[],
  transmission    TEXT[],
  body_types      TEXT[],
  city            VARCHAR(100),
  mileage_max     INT,
  channel         VARCHAR(20) DEFAULT 'telegram',
  is_active       BOOLEAN DEFAULT TRUE,
  last_sent_at    TIMESTAMPTZ,
  sent_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_subs_user_active   ON subscriptions(user_id, is_active);
CREATE INDEX idx_subs_active_brand  ON subscriptions(is_active, brand, model);


-- ─── ТАБЛИЦЯ: subscription_matches ──────────────────────────
CREATE TABLE subscription_matches (
  id              BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  car_id          BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  match_score     DECIMAL(4,2),
  sent_at         TIMESTAMPTZ,
  channel         VARCHAR(20),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (subscription_id, car_id)
);


-- ─── ТАБЛИЦЯ: leads (CRM) ───────────────────────────────────
CREATE TABLE leads (
  id            BIGSERIAL PRIMARY KEY,
  type          lead_type_enum NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  email         VARCHAR(200),
  budget        VARCHAR(100),
  budget_min    DECIMAL(12,2),
  budget_max    DECIMAL(12,2),
  car_id        BIGINT REFERENCES cars(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message       TEXT,
  source_page   VARCHAR(500),
  utm_source    VARCHAR(100),
  utm_medium    VARCHAR(100),
  utm_campaign  VARCHAR(100),
  utm_content   VARCHAR(100),
  referrer      VARCHAR(500),
  ip_address    VARCHAR(45),
  user_agent    VARCHAR(500),
  
  -- CRM
  score         lead_score_enum,
  score_auto    BOOLEAN DEFAULT TRUE,
  assigned_to   UUID REFERENCES auth.users(id),
  status        lead_status_enum DEFAULT 'new',
  status_changed_at TIMESTAMPTZ,
  notes         TEXT,
  contacted_at  TIMESTAMPTZ,
  response_time_sec INT,
  
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_leads_status_date ON leads(status, created_at DESC);
CREATE INDEX idx_leads_assign_stat ON leads(assigned_to, status);
CREATE INDEX idx_leads_phone       ON leads(phone);
CREATE INDEX idx_leads_deleted     ON leads(deleted_at) WHERE deleted_at IS NULL;


-- ─── ТАБЛИЦЯ: lead_history ──────────────────────────────────
CREATE TABLE lead_history (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  action      VARCHAR(50),
  from_value  TEXT,
  to_value    TEXT,
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_lead_history_lead ON lead_history(lead_id, created_at DESC);


-- ─── ТАБЛИЦЯ: calls (Call Tracking) ─────────────────────────
CREATE TABLE calls (
  id            BIGSERIAL PRIMARY KEY,
  car_id        BIGINT REFERENCES cars(id) ON DELETE SET NULL,
  lead_id       BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  phone_from    VARCHAR(20),
  phone_to      VARCHAR(20),
  duration_sec  INT,
  recording_url VARCHAR(500),
  source_page   VARCHAR(500),
  utm_source    VARCHAR(100),
  called_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_calls_car  ON calls(car_id);
CREATE INDEX idx_calls_date ON calls(called_at DESC);


-- ─── ТАБЛИЦЯ: daily_stats (Аналітика) ───────────────────────
CREATE TABLE daily_stats (
  date             DATE PRIMARY KEY,
  visitors         INT DEFAULT 0,
  leads_total      INT DEFAULT 0,
  calls_count      INT DEFAULT 0,
  cars_added       INT DEFAULT 0,
  cars_sold        INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ─── ТАБЛИЦЯ: seo_pages ─────────────────────────────────────
CREATE TABLE seo_pages (
  id            BIGSERIAL PRIMARY KEY,
  slug          VARCHAR(200) UNIQUE NOT NULL,
  url_pattern   VARCHAR(100),
  h1            VARCHAR(200),
  seo_title     VARCHAR(200),
  seo_desc      VARCHAR(400),
  content_top   TEXT,
  content_bottom TEXT,
  params        JSONB,
  faq           JSONB,
  is_indexed    BOOLEAN DEFAULT TRUE,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  priority      DECIMAL(2,1) DEFAULT 0.5,
  views_count   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_seo_pages_slug       ON seo_pages(slug);
CREATE INDEX idx_seo_pages_is_indexed ON seo_pages(is_indexed);


-- ─── ТАБЛИЦЯ: redirects ─────────────────────────────────────
CREATE TABLE redirects (
  id          BIGSERIAL PRIMARY KEY,
  from_url    VARCHAR(500) UNIQUE NOT NULL,
  to_url      VARCHAR(500) NOT NULL,
  code        SMALLINT DEFAULT 301,
  hits_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_redirects_from_url ON redirects(from_url);


-- ─── ТАБЛИЦЯ: reviews (Відгуки користувачів) ───────────────
CREATE TABLE reviews (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name       VARCHAR(100) NOT NULL,
  user_avatar     VARCHAR(500),
  rating          SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT        NOT NULL CHECK (char_length(review_text) >= 20),
  category        VARCHAR(50),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_verified     BOOLEAN     NOT NULL DEFAULT false,
  admin_note      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Один відгук на 14 днів на користувача
CREATE UNIQUE INDEX idx_reviews_user_14d
  ON reviews (user_id, (date_trunc('day', created_at)))
  WHERE status != 'rejected';

-- Щоб обійти обмеження і все ж ввести кулдаун через функцію:
CREATE OR REPLACE FUNCTION check_review_cooldown()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '14 days'
      AND id != COALESCE(NEW.id, 0)
  ) THEN
    RAISE EXCEPTION '14 days cooldown not elapsed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_review_cooldown
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_cooldown();

-- Автооновлення updated_at
CREATE OR REPLACE FUNCTION set_reviews_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_reviews_updated_at();

CREATE INDEX idx_reviews_status     ON reviews(status, created_at DESC);
CREATE INDEX idx_reviews_user_id    ON reviews(user_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_approved"   ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "auth_insert_review"     ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_all_reviews"      ON reviews FOR ALL USING (auth.role() = 'service_role');


-- ─── ТАБЛИЦЯ: ai_rules ──────────────────────────────────────
CREATE TABLE ai_rules (
  id                BIGSERIAL PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  trigger_type      VARCHAR(50),
  trigger_value     VARCHAR(200),
  action            VARCHAR(100),
  action_params     JSONB,
  mode              VARCHAR(20) DEFAULT 'SAFE',
  is_active         BOOLEAN DEFAULT TRUE,
  last_run_at       TIMESTAMPTZ,
  last_run_status   VARCHAR(20),
  runs_count        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─── ТАБЛИЦЯ: ai_logs ───────────────────────────────────────
CREATE TABLE ai_logs (
  id          BIGSERIAL PRIMARY KEY,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50),
  entity_id   BIGINT,
  before_data JSONB,
  after_data  JSONB,
  mode        VARCHAR(20),
  status      VARCHAR(20),
  error       TEXT,
  user_id     UUID REFERENCES auth.users(id),
  rule_id     BIGINT REFERENCES ai_rules(id) ON DELETE SET NULL,
  tokens_used INT,
  cost_usd    DECIMAL(8,4),
  duration_ms INT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_ai_logs_entity ON ai_logs(entity, entity_id);
CREATE INDEX idx_ai_logs_date   ON ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_status ON ai_logs(status);


-- ─── ТАБЛИЦЯ: notifications ─────────────────────────────────
CREATE TABLE notifications (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          VARCHAR(50),
  channel       VARCHAR(20),
  payload       JSONB,
  status        VARCHAR(20) DEFAULT 'pending',
  attempts      SMALLINT DEFAULT 0,
  error         TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_notifications_queue ON notifications(status, scheduled_for);


-- ─── ФУНКЦІЇ ТА ТРИГЕРИ ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Автоматичне встановлення expires_at для приватних оголошень
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_type = 'private' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cars_expires_at
  BEFORE INSERT ON cars
  FOR EACH ROW EXECUTE FUNCTION set_expires_at();

-- Автоматичний перерахунок Trust Score
CREATE OR REPLACE FUNCTION trigger_calculate_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trust_score := calculate_trust_score(
    NEW.vin,
    NEW.vin_verified_at IS NOT NULL,
    NEW.owners_count,
    NEW.mileage,
    NEW.mileage_verified,
    NEW.service_history,
    NEW.is_checked,
    NEW.accidents_count,
    NEW.year,
    NEW.price_diff_percent,
    NEW.listing_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cars_trust_score
  BEFORE INSERT OR UPDATE OF vin, mileage, owners_count, service_history, is_checked, year, price, accidents_count, listing_type
  ON cars
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_trust_score();

-- Розрахунок Trust Score
CREATE OR REPLACE FUNCTION calculate_trust_score(
  p_vin            VARCHAR,
  p_vin_verified   BOOLEAN,
  p_owners_count   SMALLINT,
  p_mileage        INT,
  p_mileage_verified BOOLEAN,
  p_service_history BOOLEAN,
  p_is_checked     BOOLEAN,
  p_accidents_count SMALLINT,
  p_year           SMALLINT,
  p_price_diff_pct DECIMAL,
  p_listing_type   VARCHAR
) RETURNS SMALLINT AS $$
DECLARE
  score SMALLINT := 0;
  car_age SMALLINT;
BEGIN
  -- 1. VIN
  IF p_vin IS NOT NULL AND length(p_vin) = 17 THEN
    IF p_vin_verified THEN score := score + 25;
    ELSE score := score - 10; END IF;
  END IF;

  -- 2. Власники
  IF p_owners_count = 1 THEN score := score + 15;
  ELSIF p_owners_count = 2 THEN score := score + 10;
  ELSIF p_owners_count = 3 THEN score := score + 5; END IF;

  -- 3. Сервісна книга
  IF p_service_history THEN score := score + 15; END IF;

  -- 4. Пробіг
  IF p_mileage_verified THEN score := score + 10; END IF;
  
  car_age := EXTRACT(YEAR FROM CURRENT_DATE) - p_year;
  IF car_age <= 0 THEN car_age := 1; END IF;
  
  IF p_mileage / car_age < 20000 THEN score := score + 5;
  ELSIF p_mileage / car_age > 30000 THEN score := score - 5; END IF;

  -- 5. ДТП
  IF p_accidents_count = 0 THEN score := score + 15;
  ELSIF p_accidents_count = 1 THEN score := score + 5; END IF;

  -- 6. Вік авто
  IF car_age < 3 THEN score := score + 10;
  ELSIF car_age < 7 THEN score := score + 7;
  ELSIF car_age < 12 THEN score := score + 4; END IF;

  -- 7. Перевірено центром
  IF p_is_checked THEN score := score + 15; END IF;

  -- 8. Штраф за ціну
  IF p_price_diff_pct <= -30 THEN score := score - 10; END IF;

  -- 9. Обмеження для приватників (cap 60)
  IF p_listing_type = 'private' AND NOT p_is_checked THEN
    score := LEAST(score, 60);
  END IF;

  IF score < 0 THEN score := 0; END IF;
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- View для медіанних цін
CREATE OR REPLACE VIEW market_prices AS
SELECT brand, model, year,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
       COUNT(*) AS samples
FROM cars
WHERE status = 'active'
GROUP BY brand, model, year
HAVING COUNT(*) >= 1;

-- ─── АНАЛІТИКА ПОШУКУ ───────────────────────────────────────
-- Потрібна для «популярних зараз» в SearchBox.
-- Якщо таблиця search_events ще не існує, виконати цей блок.

CREATE TABLE IF NOT EXISTS search_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query           TEXT        NOT NULL,
  suggestion_type TEXT,       -- 'brand' | 'model' | 'phrase' | 'city' | 'popular' | 'freetext'
  session_id      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_events_created ON search_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_query   ON search_events(query);

-- RPC: топ-5 запитів за останні N днів
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

-- RLS: анонімні INSERT дозволені, читати може тільки сервіс-роль
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_search_events" ON search_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service_read_search_events" ON search_events FOR SELECT USING (auth.role() = 'service_role');

-- ─── АНАЛІТИКА СТРІЧКИ (FeedPage) ───────────────────────────
-- feed_events: кожен перегляд картки в режимі /feed

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

-- RLS: анонімні INSERT дозволені
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_feed_events" ON feed_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service_read_feed_events" ON feed_events FOR SELECT USING (auth.role() = 'service_role');

-- ─── ТЕСТОВІ ДАНІ (Опціонально) ─────────────────────────────
-- Можна додати пізніше або через адмінку.
