import express from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID      = process.env.TELEGRAM_CHAT_ID!;
const GOOGLE_KEY   = process.env.GOOGLE_API_KEY ?? '';
const genAI        = GOOGLE_KEY ? new GoogleGenAI({ apiKey: GOOGLE_KEY }) : null;

async function tgRequest(method: string, body: any) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Supabase client (server-side) ─────────────────────────────
import { createClient } from "@supabase/supabase-js";
const sb = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Щоденний звіт ─────────────────────────────────────────────
async function sendDailyReport() {
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: todayLeads }, { count: totalCars }, { data: hotLeads }] = await Promise.all([
    sb.from("leads").select("*", { count: "exact", head: true }).gte("created_at", today),
    sb.from("cars").select("*", { count: "exact", head: true }).eq("status", "active"),
    sb.from("leads").select("name,phone,type,score").eq("score", "гарячий").eq("status", "новий").limit(5),
  ]);

  const { data: topCars } = await sb
    .from("cars").select("title,views_count,clicks_call")
    .eq("status", "active").order("views_count", { ascending: false }).limit(3);

  const date = new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "long", weekday: "long" });

  let text = `📊 <b>Звіт VIP.S CARS за ${date}</b>\n`;
  text += `───────────────────\n`;
  text += `🚗 Авто в каталозі: <b>${totalCars ?? 0}</b>\n`;
  text += `📋 Заявок сьогодні: <b>${todayLeads ?? 0}</b>\n`;

  if (hotLeads && hotLeads.length > 0) {
    text += `\n🔥 <b>Гарячі ліди (${hotLeads.length}):</b>\n`;
    hotLeads.forEach((l: any) => {
      text += `  • ${l.name} — ${l.phone} (${l.type})\n`;
    });
  }

  if (topCars && topCars.length > 0) {
    text += `\n👁 <b>Топ авто за переглядами:</b>\n`;
    topCars.forEach((c: any) => {
      text += `  • ${c.title} — ${c.views_count ?? 0} переглядів\n`;
    });
  }

  text += `───────────────────\n<i>VIP.S CARS · ${new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</i>`;

  await tgRequest("sendMessage", { chat_id: CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true });
  console.log("📊 Daily report sent");
}

// ── Cron: 08:00 звіт + аналіз підписок з негативними сигналами ─
function scheduleDailyReport() {
  let lastSentDate = "";
  setInterval(async () => {
    const now     = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const hour    = now.getHours();
    const min     = now.getMinutes();

    if (hour === 8 && min === 0 && dateKey !== lastSentDate) {
      lastSentDate = dateKey;
      await sendDailyReport().catch(console.error);
      await analyzeSubscriptions().catch(console.error);
    }
  }, 60_000);
}

// ── Підбір авто для підписок ──────────────────────────────────
async function notifyNewCarSubscribers(car: any) {
  try {
    // Шукаємо активні підписки, що відповідають параметрам авто
    const { data: subs } = await sb
      .from("subscriptions")
      .select("*, profiles(telegram_chat)")
      .eq("is_active", true)
      .or(`brand.eq.${car.brand},brand.is.null`)
      // спрощений матчинг для початку
      .lte("price_min", car.price || 999999)
      .gte("price_max", car.price || 0);

    if (!subs || subs.length === 0) return;

    for (const sub of subs) {
      const chat_id = sub.profiles?.telegram_chat;
      if (!chat_id) continue;

      // Перевіряємо, чи не надсилали вже це авто цій підписці
      const { data: exists } = await sb
        .from("subscription_matches")
        .select("id")
        .eq("subscription_id", sub.id)
        .eq("car_id", car.id)
        .maybeSingle();

      if (exists) continue;

      const message = `✨ <b>Знайдено авто за вашою підпискою!</b>\n` +
        `───────────────────\n` +
        `🚗 <b>${car.title}</b>\n` +
        `💰 Ціна: <b>$${Number(car.price).toLocaleString()}</b>\n` +
        `📍 Місто: ${car.city || 'Київ'}\n` +
        `🛣 Пробіг: ${Math.round((car.mileage || 0) / 1000)} тис. км\n` +
        `───────────────────\n` +
        `<a href="https://vip-s-cars.com/cars/${car.slug || car.id}">Переглянути на сайті →</a>`;

      await tgRequest("sendMessage", {
        chat_id: chat_id,
        text: message,
        parse_mode: "HTML"
      });

      // Фіксуємо матч
      await sb.from("subscription_matches").insert([{
        subscription_id: sub.id,
        car_id: car.id,
        channel: "telegram"
      }]);
    }
  } catch (err) {
    console.error("Subscription matching error:", err);
  }
}

// ── Cron: кожну годину перевіряємо нові авто для підписок ─────
function scheduleSubscriptionCheck() {
  setInterval(async () => {
    const { data: newCars } = await sb
      .from("cars")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    if (newCars) {
      for (const car of newCars) {
        await notifyNewCarSubscribers(car);
      }
    }
  }, 3600_000); // Раз на годину
}

// ── Негативні сигнали підписок ────────────────────────────────
// Якщо профіль отримав 3+ повідомлення і жодного кліку — знижуємо частоту
async function analyzeSubscriptions() {
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, subscriptions, telegram_chat")
    .not("telegram_chat", "is", null);

  if (!profiles?.length) return;

  for (const profile of profiles) {
    const subs: any[] = profile.subscriptions ?? [];
    let updated = false;

    const newSubs = subs.map((s: any) => {
      const sent   = s.sent_count   ?? 0;
      const clicks = s.click_count  ?? 0;

      // Якщо надіслали 3+ і жодного кліку — подвоюємо інтервал (знижуємо частоту)
      if (sent >= 3 && clicks === 0) {
        const currentInterval = s.interval_days ?? 1;
        const newInterval     = Math.min(currentInterval * 2, 7); // max 7 днів
        if (newInterval !== currentInterval) {
          updated = true;
          return { ...s, interval_days: newInterval };
        }
      }
      return s;
    });

    if (updated) {
      await sb.from("profiles").update({ subscriptions: newSubs }).eq("id", profile.id);
      console.log(`📉 Знижено частоту підписок для профілю ${profile.id}`);
    }
  }
}

// ── Cron: 00:00 скидання денних лічильників (views_today) ─────
function scheduleMidnightReset() {
  let lastResetDate = "";
  setInterval(async () => {
    const now     = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const hour    = now.getHours();
    const min     = now.getMinutes();

    if (hour === 0 && min === 0 && dateKey !== lastResetDate) {
      lastResetDate = dateKey;
      await sb.from("cars").update({ views_today: 0 }).neq("views_today", 0);
      console.log("🕛 Денні перегляди (views_today) скинуто.");
    }
  }, 60_000);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // ── Rate Limiting (30 запитів на 1 хв) ─────────────────────
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 хвилина
    max: 30, // макс 30 запитів
    message: { error: "Занадто багато запитів. Спробуйте через хвилину." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Застосовуємо до всіх API маршрутів
  app.use("/api/", apiLimiter);

  // ── /api/notify — звичайне текстове повідомлення ──────────
  app.post("/api/notify", async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (message.length > 4096) {
      return res.status(400).json({ error: "message exceeds Telegram limit of 4096 characters" });
    }
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Telegram not configured" });
    }
    try {
      const result = await tgRequest("sendMessage", {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
      if (!result.ok) throw new Error(result.description);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Telegram error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── /api/notify-buyback — повідомлення + фото ─────────────
  // Приймає: { message, photos: ["data:image/jpeg;base64,...", ...] }
  app.post("/api/notify-buyback", async (req, res) => {
    const { message, photos } = req.body as { message: string; photos?: string[] };
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (message.length > 4096) {
      return res.status(400).json({ error: "message exceeds Telegram limit of 4096 characters" });
    }
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Telegram not configured" });
    }

    try {
      // 1. Відправляємо текстове повідомлення
      await tgRequest("sendMessage", {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });

      // 2. Якщо є фото — відправляємо через FormData (multipart)
      if (photos && photos.length > 0) {
        const photosToSend = photos.slice(0, 10); // Telegram ліміт

        if (photosToSend.length === 1) {
          // Одне фото — sendPhoto
          const base64 = photosToSend[0].split(",")[1];
          const buffer = Buffer.from(base64, "base64");

          const form = new FormData();
          form.append("chat_id", CHAT_ID);
          form.append(
            "photo",
            new Blob([buffer], { type: "image/jpeg" }),
            "photo.jpg"
          );
          form.append("caption", "📷 Фото авто на викуп");

          const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: form,
          });
          const result = await r.json();
          if (!result.ok) console.warn("Photo send warn:", result.description);

        } else {
          // Кілька фото — sendMediaGroup
          const mediaGroup: any[] = [];
          const form = new FormData();

          photosToSend.forEach((dataUrl, i) => {
            const base64 = dataUrl.split(",")[1];
            const buffer = Buffer.from(base64, "base64");
            const key = `photo${i}`;
            form.append(key, new Blob([buffer], { type: "image/jpeg" }), `${key}.jpg`);
            mediaGroup.push({
              type: "photo",
              media: `attach://${key}`,
              ...(i === 0 ? { caption: "📷 Фото авто на викуп" } : {}),
            });
          });

          form.append("chat_id", CHAT_ID);
          form.append("media", JSON.stringify(mediaGroup));

          const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, {
            method: "POST",
            body: form,
          });
          const result = await r.json();
          if (!result.ok) console.warn("MediaGroup warn:", result.description);
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("Buyback notify error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── /sitemap.xml ─────────────────────────────────────────
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { data: cars } = await sb
        .from("cars")
        .select("seo_slug, updated_at")
        .eq("status", "active");

      const staticPages = [
        { url: "/",           priority: "1.0", changefreq: "daily" },
        { url: "/catalog",    priority: "0.9", changefreq: "daily" },
        { url: "/avtopidbir", priority: "0.8", changefreq: "weekly" },
        { url: "/vykup",      priority: "0.8", changefreq: "weekly" },
        { url: "/perevirka",  priority: "0.7", changefreq: "weekly" },
      ];

      const SITE = "https://vip-s-cars.com";
      const today = new Date().toISOString().slice(0, 10);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      staticPages.forEach(p => {
        xml += `\n  <url><loc>${SITE}${p.url}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`;
      });

      (cars ?? []).forEach((c: any) => {
        const slug = c.seo_slug;
        if (!slug) return;
        const mod = c.updated_at ? c.updated_at.slice(0, 10) : today;
        xml += `\n  <url><loc>${SITE}/cars/${slug}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      });

      xml += "\n</urlset>";
      res.header("Content-Type", "application/xml").send(xml);
    } catch (err: any) {
      res.status(500).send("Sitemap error: " + err.message);
    }
  });

  // ── /robots.txt ───────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /dashboard\n\nSitemap: https://vip-s-cars.com/sitemap.xml`
    );
  });

  // ── /api/daily-report — щоденний звіт (ручний запуск) ────
  app.post("/api/daily-report", async (req, res) => {
    try {
      await sendDailyReport();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── AI: покращити описи ───────────────────────────────────
  app.post("/api/ai/improve-description", async (req, res) => {
    const { cars: carList } = req.body as { cars: { id: number; brand: string; model: string; year: number; description?: string }[] };
    if (!Array.isArray(carList) || carList.length === 0)
      return res.status(400).json({ error: "cars[] required" });
    if (carList.length > 20)
      return res.status(400).json({ error: "Max 20 cars per request" });
    if (!genAI)
      return res.status(503).json({ error: "AI not configured — set GOOGLE_API_KEY in .env.local" });

    const results: { id: number; description: string }[] = [];
    for (const car of carList) {
      const prompt = `Напиши продажний опис автомобіля для українського автосайту (100-150 слів, без зайвих символів, без заголовків, тільки текст):
Авто: ${car.brand} ${car.model} ${car.year}
Поточний опис: ${car.description ?? 'відсутній'}
Вимоги: привабливо, конкретно, підкресли переваги, не вигадуй характеристики.`;
      try {
        const r = await genAI.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
        results.push({ id: car.id, description: (r.text ?? '').trim() });
      } catch {
        results.push({ id: car.id, description: car.description ?? '' });
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    for (const { id, description } of results) {
      if (description) await sb.from("cars").update({ description }).eq("id", id);
    }
    res.json({ success: true, updated: results.length });
  });

  // ── AI: згенерувати SEO ───────────────────────────────────
  app.post("/api/ai/generate-seo", async (req, res) => {
    const { cars: carList, save = true } = req.body as { cars: { id: number; brand: string; model: string; year: number; city?: string; price?: number; engine_volume?: number; mileage?: number }[]; save?: boolean };
    if (!Array.isArray(carList) || carList.length === 0)
      return res.status(400).json({ error: "cars[] required" });
    if (carList.length > 20)
      return res.status(400).json({ error: "Max 20 cars per request" });
    if (!genAI)
      return res.status(503).json({ error: "AI not configured — set GOOGLE_API_KEY in .env.local" });

    const results: { id: number; seo_title: string; seo_description: string }[] = [];
    for (const car of carList) {
      const km = car.mileage ? `${Math.round(car.mileage / 1000)} тис. км` : '';
      const prompt = `Для автосайту vip-s-cars.com згенеруй SEO title і meta description українською:
Авто: ${car.brand} ${car.model} ${car.year}${car.engine_volume ? ` ${car.engine_volume}л` : ''}${km ? `, ${km}` : ''}${car.city ? `, ${car.city}` : ''}${car.price ? `, $${car.price.toLocaleString()}` : ''}
Відповідь СТРОГО в форматі JSON:
{"seo_title":"...(до 60 символів)","seo_description":"...(до 155 символів)"}`;
      try {
        const r = await genAI.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
        const text = (r.text ?? '').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(text);
        results.push({ id: car.id, seo_title: parsed.seo_title ?? '', seo_description: parsed.seo_description ?? '' });
      } catch {
        results.push({ id: car.id, seo_title: `Купити ${car.brand} ${car.model} ${car.year}`, seo_description: `${car.brand} ${car.model} ${car.year} в наявності. VIP.S Cars — перевірені авто.` });
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (save) {
      for (const { id, seo_title, seo_description } of results) {
        if (id) await sb.from("cars").update({ seo_title, seo_description }).eq("id", id);
      }
    }
    res.json({ success: true, updated: save ? results.length : 0, results });
  });

  // ── Cron ──────────────────────────────────────────────────
  scheduleDailyReport();
  scheduleSubscriptionCheck();
  scheduleMidnightReset();

  // ── Vite ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
