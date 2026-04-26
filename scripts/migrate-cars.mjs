import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: `postgresql://postgres.nxsvtpnyyblrsdooebwy:${process.env.SUPABASE_DB_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});

// Додаємо колонки яких не вистачає в існуючій таблиці cars
const migrations = [
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS owners_count    SMALLINT`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS service_history BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS trust_score     SMALLINT DEFAULT 0`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS generation      VARCHAR(100)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS body_type       VARCHAR(50)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_volume   DECIMAL(3,1)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_type     VARCHAR(20)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS power_hp        SMALLINT`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS transmission    VARCHAR(20)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS drive_type      VARCHAR(20)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS fuel_consumption DECIMAL(4,1)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS condition       VARCHAR(30)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin             VARCHAR(17)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS region          VARCHAR(100)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS country         VARCHAR(100) DEFAULT 'Україна'`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS description_raw TEXT`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_exchange     BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_credit       BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS badge           VARCHAR(20)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seller_name     VARCHAR(100)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seller_phone    VARCHAR(20)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seller_telegram VARCHAR(100)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS views_count     INT DEFAULT 0`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS clicks_call     INT DEFAULT 0`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS clicks_message  INT DEFAULT 0`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seo_title       VARCHAR(200)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seo_description VARCHAR(400)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS seo_slug        VARCHAR(200)`,
  `ALTER TABLE cars ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW()`,
  // FK через Supabase-сумісний спосіб (без REFERENCES у pooler)
  `COMMENT ON COLUMN car_images.car_id IS 'FK -> cars.id'`,
  `COMMENT ON COLUMN car_price_history.car_id IS 'FK -> cars.id'`,
  // Тестові авто
  `INSERT INTO cars (title,price,currency,brand,model,year,body_type,engine_volume,engine_type,power_hp,transmission,drive_type,mileage,owners_count,service_history,vin,city,description,seller_name,seller_phone,is_checked,trust_score,status,badge,seo_slug)
   VALUES
   ('BMW X5 2.0d 2012',12500,'USD','BMW','X5',2012,'кросовер',2.0,'дизель',190,'автомат','повний',185000,1,true,'WBAFR9100CDX12345','Київ','Відмінний стан, один власник, повна сервісна історія.','Олег','+380930820122',true,87,'active','вигідно','bmw-x5-2012-dyzel-kyiv'),
   ('Toyota Camry 2.5 2019',22000,'USD','Toyota','Camry',2019,'седан',2.5,'бензин',181,'автомат','передній',95000,1,true,'JTDBE40K093012345','Київ','Ідеальний стан. Один власник.','Максим','+380930820122',true,92,'active','нове','toyota-camry-2019-benzyn-kyiv'),
   ('Volkswagen Golf 1.6 TDI 2017',11800,'USD','Volkswagen','Golf',2017,'хетчбек',1.6,'дизель',115,'механіка','передній',142000,2,false,null,'Київ','Економний дизель, гарний стан.','Андрій','+380930820122',false,55,'active',null,'volkswagen-golf-2017-dyzel-kyiv'),
   ('Mercedes-Benz C 200 2015',18500,'USD','Mercedes-Benz','C 200',2015,'седан',2.0,'бензин',184,'автомат','задній',110000,2,true,'WDDWF4KB0FR123456','Київ','Преміум, AMG Line.','Сергій','+380930820122',true,78,'active','ексклюзив','mercedes-c200-2015-benzyn-kyiv')
   ON CONFLICT (seo_slug) DO NOTHING`,
  `INSERT INTO car_images (car_id,url,is_cover,sort_order,alt)
   SELECT id,'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',true,0,'BMW X5 2012'
   FROM cars WHERE seo_slug='bmw-x5-2012-dyzel-kyiv'
   ON CONFLICT DO NOTHING`,
  `INSERT INTO car_images (car_id,url,is_cover,sort_order,alt)
   SELECT id,'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',true,0,'Toyota Camry 2019'
   FROM cars WHERE seo_slug='toyota-camry-2019-benzyn-kyiv'
   ON CONFLICT DO NOTHING`,
  `INSERT INTO car_images (car_id,url,is_cover,sort_order,alt)
   SELECT id,'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',true,0,'VW Golf 2017'
   FROM cars WHERE seo_slug='volkswagen-golf-2017-dyzel-kyiv'
   ON CONFLICT DO NOTHING`,
  `INSERT INTO car_images (car_id,url,is_cover,sort_order,alt)
   SELECT id,'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',true,0,'Mercedes C200 2015'
   FROM cars WHERE seo_slug='mercedes-c200-2015-benzyn-kyiv'
   ON CONFLICT DO NOTHING`,
];

async function run() {
  await client.connect();
  console.log('✅ Підключено!\n');

  let ok = 0, fail = 0;
  for (const sql of migrations) {
    const label = sql.trim().substring(0, 70).replace(/\n/g, ' ');
    try {
      await client.query(sql);
      console.log(`✅ ${label}`);
      ok++;
    } catch (e) {
      console.log(`❌ ${label}`);
      console.log(`   ${e.message}\n`);
      fail++;
    }
  }

  // Підсумок
  const { rows: cols } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'cars' AND table_schema = 'public'
    ORDER BY ordinal_position
  `);
  console.log(`\n📊 ${ok} ок / ${fail} помилок`);
  console.log(`\n🚗 Колонки в таблиці cars (${cols.length}):`);
  console.log('   ' + cols.map(c => c.column_name).join(', '));

  const { rows: carRows } = await client.query(`SELECT id, title, trust_score, status FROM cars LIMIT 5`);
  console.log(`\n🚘 Авто в БД:`);
  carRows.forEach(r => console.log(`   #${r.id} ${r.title} | trust: ${r.trust_score} | ${r.status}`));

  await client.end();
}
run().catch(console.error);
