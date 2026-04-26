import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const PROJECT_REF = 'nxsvtpnyyblrsdooebwy';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const client = new Client({
  connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const statements = [

// ── 1. cars ──────────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS cars (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(200) NOT NULL,
  price             DECIMAL(10,2) NOT NULL,
  currency          VARCHAR(3) DEFAULT 'USD',
  brand             VARCHAR(100),
  model             VARCHAR(100),
  generation        VARCHAR(100),
  year              SMALLINT,
  body_type         VARCHAR(50),
  engine_volume     DECIMAL(3,1),
  engine_type       VARCHAR(20),
  power_hp          SMALLINT,
  transmission      VARCHAR(20),
  drive_type        VARCHAR(20),
  fuel_consumption  DECIMAL(4,1),
  mileage           INT,
  condition         VARCHAR(30),
  vin               VARCHAR(17),
  owners_count      SMALLINT,
  service_history   BOOLEAN DEFAULT FALSE,
  trust_score       SMALLINT DEFAULT 0,
  city              VARCHAR(100),
  region            VARCHAR(100),
  country           VARCHAR(100) DEFAULT 'Україна',
  description       TEXT,
  description_raw   TEXT,
  is_checked        BOOLEAN DEFAULT FALSE,
  is_top            BOOLEAN DEFAULT FALSE,
  is_urgent         BOOLEAN DEFAULT FALSE,
  is_exchange       BOOLEAN DEFAULT FALSE,
  is_credit         BOOLEAN DEFAULT FALSE,
  badge             VARCHAR(20),
  seller_name       VARCHAR(100),
  seller_phone      VARCHAR(20),
  seller_telegram   VARCHAR(100),
  views_count       INT DEFAULT 0,
  clicks_call       INT DEFAULT 0,
  clicks_message    INT DEFAULT 0,
  seo_title         VARCHAR(200),
  seo_description   VARCHAR(400),
  seo_slug          VARCHAR(200),
  status            VARCHAR(20) DEFAULT 'moderation',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
)`,

`CREATE UNIQUE INDEX IF NOT EXISTS cars_vin_key ON cars(vin) WHERE vin IS NOT NULL`,
`CREATE UNIQUE INDEX IF NOT EXISTS cars_seo_slug_key ON cars(seo_slug) WHERE seo_slug IS NOT NULL`,
`CREATE INDEX IF NOT EXISTS idx_cars_brand   ON cars(brand)`,
`CREATE INDEX IF NOT EXISTS idx_cars_model   ON cars(model)`,
`CREATE INDEX IF NOT EXISTS idx_cars_year    ON cars(year)`,
`CREATE INDEX IF NOT EXISTS idx_cars_price   ON cars(price)`,
`CREATE INDEX IF NOT EXISTS idx_cars_mileage ON cars(mileage)`,
`CREATE INDEX IF NOT EXISTS idx_cars_city    ON cars(city)`,
`CREATE INDEX IF NOT EXISTS idx_cars_status  ON cars(status)`,

// ── 2. car_images ─────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS car_images (
  id         SERIAL PRIMARY KEY,
  car_id     INT NOT NULL,
  url        VARCHAR(500) NOT NULL,
  url_webp   VARCHAR(500),
  alt        VARCHAR(200),
  is_cover   BOOLEAN DEFAULT FALSE,
  sort_order SMALLINT DEFAULT 0
)`,
`ALTER TABLE car_images DROP CONSTRAINT IF EXISTS car_images_car_id_fkey`,
`ALTER TABLE car_images ADD CONSTRAINT car_images_car_id_fkey
   FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE`,
`CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id)`,

// ── 3. car_price_history ──────────────────────────────────────
`CREATE TABLE IF NOT EXISTS car_price_history (
  id       SERIAL PRIMARY KEY,
  car_id   INT NOT NULL,
  price    DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  date     DATE DEFAULT CURRENT_DATE
)`,
`ALTER TABLE car_price_history DROP CONSTRAINT IF EXISTS car_price_history_car_id_fkey`,
`ALTER TABLE car_price_history ADD CONSTRAINT car_price_history_car_id_fkey
   FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE`,
`CREATE INDEX IF NOT EXISTS idx_price_history_car_id ON car_price_history(car_id)`,

// ── 4. leads ──────────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS leads (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(30) NOT NULL,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  budget     VARCHAR(100),
  car_id     INT,
  message    TEXT,
  source     VARCHAR(100),
  score      VARCHAR(20) DEFAULT 'холодний',
  status     VARCHAR(20) DEFAULT 'новий',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`,
`CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status)`,
`CREATE INDEX IF NOT EXISTS idx_leads_score   ON leads(score)`,
`CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)`,

// ── 5. profiles ───────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone          VARCHAR(20) UNIQUE,
  name           VARCHAR(100),
  telegram_chat  VARCHAR(100),
  favorites      JSONB DEFAULT '[]',
  viewed         JSONB DEFAULT '[]',
  subscriptions  JSONB DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT NOW()
)`,

// ── 6. seo_pages ──────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS seo_pages (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(200) UNIQUE NOT NULL,
  h1         VARCHAR(200),
  seo_title  VARCHAR(200),
  seo_desc   VARCHAR(400),
  content    TEXT,
  params     JSONB,
  is_indexed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`,

// ── 7. redirects ──────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS redirects (
  id       SERIAL PRIMARY KEY,
  from_url VARCHAR(500) NOT NULL,
  to_url   VARCHAR(500) NOT NULL,
  code     SMALLINT DEFAULT 301
)`,

// ── 8. ai_logs ────────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS ai_logs (
  id         SERIAL PRIMARY KEY,
  action     VARCHAR(100),
  entity     VARCHAR(50),
  entity_id  INT,
  before     TEXT,
  after      TEXT,
  mode       VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
)`,

// ── Trigger updated_at ────────────────────────────────────────
`CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql`,

`DROP TRIGGER IF EXISTS cars_updated_at ON cars`,
`CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at()`,

// ── Trust Score функція ───────────────────────────────────────
`CREATE OR REPLACE FUNCTION calculate_trust_score(
  p_vin             VARCHAR,
  p_owners_count    SMALLINT,
  p_mileage         INT,
  p_service_history BOOLEAN,
  p_is_checked      BOOLEAN
) RETURNS SMALLINT AS $$
DECLARE score SMALLINT := 0;
BEGIN
  IF p_vin IS NOT NULL AND length(p_vin) = 17 THEN score := score + 25; END IF;
  IF p_owners_count = 1 THEN score := score + 25;
  ELSIF p_owners_count = 2 THEN score := score + 15;
  ELSIF p_owners_count <= 3 THEN score := score + 5; END IF;
  IF p_mileage < 100000 THEN score := score + 20;
  ELSIF p_mileage < 200000 THEN score := score + 10;
  ELSIF p_mileage < 300000 THEN score := score + 5; END IF;
  IF p_service_history THEN score := score + 20; END IF;
  IF p_is_checked THEN score := score + 10; END IF;
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql`,

// ── Тестові авто ──────────────────────────────────────────────
`INSERT INTO cars (title,price,currency,brand,model,year,body_type,engine_volume,engine_type,power_hp,transmission,drive_type,mileage,owners_count,service_history,vin,city,description,seller_name,seller_phone,is_checked,trust_score,status,badge,seo_slug)
VALUES
('BMW X5 2.0d 2012',12500,'USD','BMW','X5',2012,'кросовер',2.0,'дизель',190,'автомат','повний',185000,1,true,'WBAFR9100CDX12345','Київ','Відмінний стан, один власник, повна сервісна історія.','Олег','+380930820122',true,87,'active','вигідно','bmw-x5-2012-dyzel-kyiv'),
('Toyota Camry 2.5 2019',22000,'USD','Toyota','Camry',2019,'седан',2.5,'бензин',181,'автомат','передній',95000,1,true,'JTDBE40K093012345','Київ','Ідеальний стан. Один власник, куплена в офіційного дилера.','Максим','+380930820122',true,92,'active','нове','toyota-camry-2019-benzyn-kyiv'),
('Volkswagen Golf 1.6 TDI 2017',11800,'USD','Volkswagen','Golf',2017,'хетчбек',1.6,'дизель',115,'механіка','передній',142000,2,false,null,'Київ','Економний дизель, в гарному стані. Нова гума.','Андрій','+380930820122',false,55,'active',null,'volkswagen-golf-2017-dyzel-kyiv'),
('Mercedes-Benz C 200 2015',18500,'USD','Mercedes-Benz','C 200',2015,'седан',2.0,'бензин',184,'автомат','задній',110000,2,true,'WDDWF4KB0FR123456','Київ','Преміум клас, повна комплектація AMG Line.','Сергій','+380930820122',true,78,'active','ексклюзив','mercedes-c200-2015-benzyn-kyiv')
ON CONFLICT DO NOTHING`,

`INSERT INTO car_images (car_id,url,is_cover,sort_order,alt) VALUES
(1,'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',true,0,'BMW X5 2012 Київ'),
(1,'https://images.unsplash.com/photo-1617654112368-307921291f42?w=800',false,1,'BMW X5 2012 салон'),
(2,'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',true,0,'Toyota Camry 2019 Київ'),
(3,'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',true,0,'VW Golf 2017 Київ'),
(4,'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',true,0,'Mercedes C200 2015 Київ')
ON CONFLICT DO NOTHING`,

`INSERT INTO leads (type,name,phone,budget,message,score,status) VALUES
('підбір','Іван Петренко','+380501234567','$15000-$20000','Шукаю BMW або Mercedes, бажано дизель','гарячий','новий'),
('викуп','Олена Коваль','+380671234567',null,'Хочу продати Toyota Corolla 2016','теплий','в роботі'),
('підбір','Дмитро Сидоренко','+380631234567','$10000-$13000','Потрібен сімейний кросовер','холодний','новий')
ON CONFLICT DO NOTHING`,

];

async function run() {
  console.log('🔌 Підключення до Supabase...');
  await client.connect();
  console.log('✅ Підключено!\n');

  let ok = 0, fail = 0;
  for (const sql of statements) {
    const name = sql.trim().split('\n')[0].substring(0, 60);
    try {
      await client.query(sql);
      console.log(`  ✅ ${name}`);
      ok++;
    } catch (e) {
      console.log(`  ❌ ${name}`);
      console.log(`     ${e.message}\n`);
      fail++;
    }
  }

  console.log(`\n📊 Результат: ${ok} успішно, ${fail} помилок`);

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log('\n📋 Таблиці в БД:');
  rows.forEach(r => console.log(`   • ${r.table_name}`));

  await client.end();
}

run().catch(console.error);
