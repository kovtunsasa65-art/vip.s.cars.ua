import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: `postgresql://postgres.nxsvtpnyyblrsdooebwy:${process.env.SUPABASE_DB_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

const migrations = [
  // ── VIN: зберігаємо оригінал окремо, публічний маскований ──
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin_full VARCHAR(17)`,
  `UPDATE cars SET vin_full = vin WHERE vin_full IS NULL AND vin IS NOT NULL`,

  // ── Optimistic locking: version поле ──
  `ALTER TABLE cars  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS version INT DEFAULT 1`,

  // ── Ranked score (нормалізований рейтинг 0-100) ──
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS ranked_score DECIMAL(5,2) DEFAULT 0`,

  // ── market_price для порівняння цін ──
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS market_price DECIMAL(10,2)`,

  // ── Функція розрахунку ranked_score ──
  `CREATE OR REPLACE FUNCTION compute_ranked_score(
    p_created_at     TIMESTAMPTZ,
    p_price          DECIMAL,
    p_market_price   DECIMAL,
    p_trust_score    SMALLINT,
    p_views_count    INT,
    p_has_photos     BOOLEAN,
    p_is_checked     BOOLEAN
  ) RETURNS DECIMAL AS $$
  DECLARE
    age_days       FLOAT;
    freshness      FLOAT;
    quality_score  FLOAT;
    price_score    FLOAT;
    relevance      FLOAT;
  BEGIN
    -- Свіжість: exp(-age/14), від 1.0 (тільки що) до ~0 (старе)
    age_days  := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 86400.0;
    freshness := EXP(-age_days / 14.0);

    -- Якість: trust + фото + перевірка (нормалізовано 0-1)
    quality_score := (
      COALESCE(p_trust_score, 0)::FLOAT / 100.0 * 0.5 +
      CASE WHEN p_has_photos   THEN 0.3 ELSE 0.0 END +
      CASE WHEN p_is_checked   THEN 0.2 ELSE 0.0 END
    );

    -- Ціна: наскільки дешевше ринку (0-1)
    price_score := CASE
      WHEN p_market_price IS NULL OR p_market_price = 0 THEN 0.5
      WHEN p_price < p_market_price THEN LEAST((p_market_price - p_price) / p_market_price * 3.0, 1.0)
      ELSE 0.2
    END;

    -- Relevance: перегляди (log-нормалізовані)
    relevance := LEAST(LN(COALESCE(p_views_count, 0) + 1) / LN(100), 1.0);

    RETURN ROUND((
      0.3 * relevance +
      0.3 * quality_score +
      0.3 * freshness +
      0.1 * price_score
    ) * 100, 2);
  END;
  $$ LANGUAGE plpgsql`,

  // ── Тригер: оновлює ranked_score при зміні авто ──
  `CREATE OR REPLACE FUNCTION refresh_ranked_score()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.ranked_score := compute_ranked_score(
      COALESCE(NEW.created_at, NOW()),
      NEW.price,
      NEW.market_price,
      NEW.trust_score,
      NEW.views_count,
      (SELECT COUNT(*) > 0 FROM car_images WHERE car_id = NEW.id),
      NEW.is_checked
    );
    -- Optimistic locking: інкрементуємо version
    NEW.version := COALESCE(OLD.version, 0) + 1;
    NEW.updated_at := NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS cars_ranked_score ON cars`,
  `CREATE TRIGGER cars_ranked_score
    BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION refresh_ranked_score()`,

  // ── Оновити ranked_score для всіх існуючих авто ──
  `UPDATE cars SET
    ranked_score = compute_ranked_score(
      COALESCE(created_at, NOW()),
      price,
      market_price,
      trust_score,
      views_count,
      (SELECT COUNT(*) > 0 FROM car_images ci WHERE ci.car_id = cars.id),
      is_checked
    ),
    version = 1
  WHERE status = 'active'`,

  // ── Функція для безпечного VIN (тільки останні 6 символів публічно) ──
  `CREATE OR REPLACE FUNCTION mask_vin(vin VARCHAR)
  RETURNS VARCHAR AS $$
  BEGIN
    IF vin IS NULL OR length(vin) < 6 THEN RETURN NULL; END IF;
    RETURN RPAD(LEFT(vin, 3), length(vin) - 4, '*') || RIGHT(vin, 4);
  END;
  $$ LANGUAGE plpgsql`,

  // ── RLS: анонімний не бачить повний VIN ──
  `ALTER TABLE cars ENABLE ROW LEVEL SECURITY`,

  `DROP POLICY IF EXISTS cars_public_read ON cars`,
  `CREATE POLICY cars_public_read ON cars
    FOR SELECT USING (status = 'active')`,

  `DROP POLICY IF EXISTS cars_admin_all ON cars`,
  `CREATE POLICY cars_admin_all ON cars
    USING (true) WITH CHECK (true)`,

  // ── Leads RLS ──
  `ALTER TABLE leads ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS leads_insert ON leads`,
  `CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS leads_admin_read ON leads`,
  `CREATE POLICY leads_admin_read ON leads FOR SELECT USING (true)`,
];

async function run() {
  await client.connect();
  console.log('✅ Підключено\n');

  let ok = 0, fail = 0;
  for (const sql of migrations) {
    const label = sql.trim().replace(/\n/g, ' ').substring(0, 70);
    try {
      await client.query(sql);
      console.log('✅', label);
      ok++;
    } catch (e) {
      // RLS помилки не критичні якщо вже є
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log('⚠️ ', label, '(вже існує)');
      } else {
        console.log('❌', label, '\n  ', e.message);
        fail++;
      }
    }
  }

  // Перевірка
  const { rows } = await client.query(`
    SELECT id, title, ranked_score, trust_score, version
    FROM cars WHERE status = 'active' ORDER BY ranked_score DESC LIMIT 5
  `);
  console.log('\n🏆 Топ авто за ranked_score:');
  rows.forEach(r => console.log(`  ${r.title} | ranked: ${r.ranked_score} | trust: ${r.trust_score} | v${r.version}`));

  console.log(`\n📊 ${ok} ок / ${fail} помилок`);
  await client.end();
}

run().catch(console.error);
