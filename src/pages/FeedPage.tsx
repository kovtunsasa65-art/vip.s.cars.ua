import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Phone, MessageCircle, ChevronUp, ChevronDown, X, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SEOHead from '../components/SEOHead';
import { PHONE_RAW } from '../lib/config';

// Persistent anonymous session id
const SESSION_ID = (() => {
  const key = 'feed_session';
  let id = sessionStorage.getItem(key);
  if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem(key, id); }
  return id;
})();

function logFeedEvent(carId: number, durationMs: number, descReadPct: number) {
  supabase.from('feed_events').insert({
    car_id: carId,
    session_id: SESSION_ID,
    duration_ms: Math.round(durationMs),
    desc_read_pct: Math.round(descReadPct),
  }).then(); // fire-and-forget; table may not exist yet — silently ignored
}

export default function FeedPage() {
  const [cars, setCars]       = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [liked, setLiked]     = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const touchStartY  = useRef(0);
  const photoRef     = useRef<HTMLDivElement>(null); // desktop photo panel — wheel target
  const descRef      = useRef<HTMLDivElement>(null); // desktop info panel — scroll tracking

  // Analytics state kept in refs to avoid stale closures
  const viewStartRef  = useRef(Date.now());
  const maxDescPctRef = useRef(0);
  const currentRef    = useRef(0);
  const carsRef       = useRef<any[]>([]);

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { carsRef.current = cars; }, [cars]);

  // ─── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('cars')
      .select('*, car_images(url, is_cover, sort_order)')
      .eq('status', 'active')
      .order('ranking_score', { ascending: false })
      .order('created_at',    { ascending: false })
      .limit(50)
      .then(({ data }) => { setCars(data ?? []); setLoading(false); });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('user_favorites').select('car_id').eq('user_id', user.id)
        .then(({ data }) => data && setLiked(new Set(data.map((f: any) => String(f.car_id)))));
    });
  }, []);

  // ─── Preload next 3 images ─────────────────────────────────────────────────
  useEffect(() => {
    cars.slice(current + 1, current + 4).forEach(c => {
      const url = c.car_images?.find((i: any) => i.is_cover)?.url ?? c.car_images?.[0]?.url;
      if (url) { const el = new Image(); el.src = url; }
    });
  }, [current, cars]);

  // ─── Analytics: log on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const c = carsRef.current[currentRef.current];
      if (c) logFeedEvent(c.id, Date.now() - viewStartRef.current, maxDescPctRef.current);
    };
  }, []);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const resetAnalytics = useCallback((prevIdx: number) => {
    const prev = carsRef.current[prevIdx];
    if (prev) logFeedEvent(prev.id, Date.now() - viewStartRef.current, maxDescPctRef.current);
    viewStartRef.current  = Date.now();
    maxDescPctRef.current = 0;
    descRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const go = useCallback((dir: 1 | -1) => {
    const prev = currentRef.current;
    const next = Math.min(Math.max(prev + dir, 0), carsRef.current.length - 1);
    if (next === prev) return;
    resetAnalytics(prev);
    setCurrent(next);
  }, [resetAnalytics]);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowUp')   go(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go]);

  // Wheel — attached to desktop photo panel only so info panel scrolls freely
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    go(e.deltaY > 0 ? 1 : -1);
  }, [go]);

  useEffect(() => {
    const el = photoRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Touch swipe (mobile)
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) go(delta > 0 ? 1 : -1);
  };

  // ─── Description scroll tracking (desktop) ─────────────────────────────────
  const trackDescScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight) { maxDescPctRef.current = 100; return; }
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    if (pct > maxDescPctRef.current) maxDescPctRef.current = pct;
  };

  // ─── Favorites ─────────────────────────────────────────────────────────────
  const toggleLike = async (carId: number) => {
    const idStr = String(carId);
    const { data: { user } } = await supabase.auth.getUser();
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(idStr)) {
        next.delete(idStr);
        if (user) supabase.from('user_favorites').delete().eq('user_id', user.id).eq('car_id', carId).then();
      } else {
        next.add(idStr);
        if (user) supabase.from('user_favorites').insert([{ user_id: user.id, car_id: carId }]).then();
      }
      return next;
    });
  };

  // ─── Loading / empty states ────────────────────────────────────────────────
  if (loading) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
    </div>
  );

  if (!cars.length) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black text-white">
      <p>Авто не знайдено</p>
    </div>
  );

  const car    = cars[current];
  const images = [...(car.car_images ?? [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const img    = images.find((i: any) => i.is_cover)?.url ?? images[0]?.url;
  const slug   = car.seo_slug ?? car.id;
  const isLiked = liked.has(String(car.id));

  const progress = ((current + 1) / cars.length) * 100;

  return (
    <>
      <SEOHead title="Стрічка авто — VIP.S Cars" url="/feed" />

      <div
        className="fixed inset-0 z-[200] bg-black overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Close */}
        <Link to="/catalog"
          className="absolute top-4 left-4 z-[210] w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <X size={18} />
        </Link>

        {/* Counter — desktop: inside photo area; mobile: centered top */}
        <div className="absolute top-4 z-[210] hidden md:block left-1/2" style={{ transform: 'translateX(-120%)' }}>
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {current + 1} / {cars.length}
          </span>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[210] md:hidden">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {current + 1} / {cars.length}
          </span>
        </div>

        {/* ─── Cards ─────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={car.id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0"
          >

            {/* ══════ DESKTOP LAYOUT (md+) ══════════════════════════════════ */}
            <div className="hidden md:flex h-full">

              {/* Photo — 60% */}
              <div ref={photoRef} className="relative w-3/5 h-full flex-shrink-0 cursor-ns-resize">
                {img
                  ? <img src={img} alt={`${car.brand} ${car.model} ${car.year}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-800" />
                }

                {car.badge && (
                  <span className="absolute top-16 left-6 bg-brand-blue text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {car.badge}
                  </span>
                )}

                {car.is_checked && (
                  <div className="absolute bottom-8 left-6 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-green-700">
                    <ShieldCheck size={13} className="text-green-600" /> Перевірено
                  </div>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-8 right-6 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
                    📷 {images.length}
                  </div>
                )}

                {/* Nav arrows on photo panel */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                  <button onClick={() => go(-1)} disabled={current === 0}
                    className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-black/70 transition-colors">
                    <ChevronUp size={18} />
                  </button>
                  <button onClick={() => go(1)} disabled={current === cars.length - 1}
                    className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-black/70 transition-colors">
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Info — 40% */}
              <div className="relative flex-1 bg-white flex flex-col h-full overflow-hidden">

                {/* Scrollable content — triggers desc_read_pct tracking */}
                <div
                  ref={descRef}
                  className="flex-1 overflow-y-auto px-8 pt-16 pb-4"
                  onScroll={trackDescScroll}
                >
                  {car.badge && (
                    <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-black px-2.5 py-1 rounded-lg mb-4 uppercase tracking-wider">
                      {car.badge}
                    </span>
                  )}

                  <h2 className="text-[1.65rem] font-black text-slate-900 leading-tight mb-1">
                    {car.brand} {car.model} {car.year}
                  </h2>

                  {(car.engine_volume || car.body_type) && (
                    <p className="text-slate-400 text-sm mb-5">
                      {[car.engine_volume && `${car.engine_volume}л`, car.body_type].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-black text-brand-blue">
                      {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
                    </span>
                    {car.market_price && car.market_price > car.price && (
                      <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                        −{Math.round((1 - car.price / car.market_price) * 100)}% від ринку
                      </span>
                    )}
                  </div>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {([
                      ['Пробіг',   car.mileage     && `${Math.round(car.mileage / 1000)} тис. км`],
                      ['Паливо',   car.engine_type],
                      ['КПП',      car.transmission],
                      ['Привід',   car.drive_type],
                      ['Місто',    car.city],
                      ['Власники', car.owners_count ? String(car.owners_count) : null],
                    ] as [string, string | null | undefined][])
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{k}</div>
                          <div className="text-sm font-bold text-slate-800">{v}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Trust score */}
                  {(car.trust_score ?? 0) > 0 && (
                    <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 mb-6">
                      <Star size={18} className="text-green-600 flex-shrink-0" fill="currentColor" />
                      <div>
                        <div className="text-xs text-green-700 font-semibold uppercase tracking-wide">Індекс довіри</div>
                        <div className="text-xl font-black text-green-700">{car.trust_score}/100</div>
                      </div>
                    </div>
                  )}

                  {/* Description — the scroll of this drives desc_read_pct */}
                  {car.description && (
                    <div className="pb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Опис</h3>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{car.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions — sticky bottom */}
                <div className="flex-shrink-0 px-8 py-5 border-t border-slate-100 bg-white">
                  <div className="flex gap-3">
                    <Link to={`/cars/${slug}`}
                      className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-black text-sm text-center hover:bg-brand-blue-dark transition-colors">
                      Детальніше
                    </Link>
                    <a href={`tel:${car.seller_phone ?? PHONE_RAW}`}
                      className="w-12 h-12 flex-shrink-0 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors">
                      <Phone size={20} color="white" />
                    </a>
                    <a href="https://t.me/vips_cars" target="_blank" rel="noreferrer"
                      className="w-12 h-12 flex-shrink-0 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <MessageCircle size={20} color="white" />
                    </a>
                    <button
                      onClick={() => toggleLike(car.id)}
                      className={cn('w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-all',
                        isLiked ? 'bg-red-500' : 'bg-slate-100 hover:bg-slate-200')}>
                      <Heart size={20} color={isLiked ? 'white' : '#64748b'} fill={isLiked ? 'white' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ MOBILE LAYOUT (< md) ══════════════════════════════════ */}
            <div className="flex md:hidden absolute inset-0">

              {/* Full-screen photo */}
              <div className="absolute inset-0">
                {img
                  ? <img src={img} alt={`${car.brand} ${car.model} ${car.year}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-800" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              </div>

              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-6">
                {car.badge && (
                  <span className="inline-block bg-brand-blue text-white text-xs font-black px-2.5 py-1 rounded-lg mb-2 uppercase">
                    {car.badge}
                  </span>
                )}

                <h2 className="text-white text-xl font-black mb-1 leading-tight">
                  {car.brand} {car.model} {car.year}
                </h2>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-[#60a5fa] text-2xl font-black">
                    {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
                  </span>
                  {car.market_price && car.market_price > car.price && (
                    <span className="text-xs text-green-400 font-bold">
                      −{Math.round((1 - car.price / car.market_price) * 100)}% від ринку
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[
                    car.mileage    && `${Math.round(car.mileage / 1000)} тис. км`,
                    car.engine_type,
                    car.transmission,
                    car.city,
                  ].filter(Boolean).map((t, i) => (
                    <span key={i} className="bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                  {(car.trust_score ?? 0) > 0 && (
                    <span className="bg-green-500/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ★ {car.trust_score}/100
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <Link to={`/cars/${slug}`}
                    className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-black text-sm text-center hover:bg-slate-100 transition-colors">
                    Детальніше
                  </Link>
                  <a href={`tel:${car.seller_phone ?? PHONE_RAW}`}
                    className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors">
                    <Phone size={20} color="white" />
                  </a>
                  <a href="https://t.me/vips_cars" target="_blank" rel="noreferrer"
                    className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <MessageCircle size={20} color="white" />
                  </a>
                  <button
                    onClick={() => toggleLike(car.id)}
                    className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                      isLiked ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30')}>
                    <Heart size={20} color="white" fill={isLiked ? 'white' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Nav arrows */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                <button onClick={() => go(-1)} disabled={current === 0}
                  className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-black/60 transition-colors">
                  <ChevronUp size={18} />
                </button>
                <button onClick={() => go(1)} disabled={current === cars.length - 1}
                  className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-black/60 transition-colors">
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-white/10 z-[210]">
          <motion.div
            className="h-full bg-brand-blue"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </>
  );
}
