import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Phone, Heart, MessageCircle, ShieldCheck,
  Gauge, Fuel, Settings, MapPin, Calendar, AlertCircle,
  Loader2, ChevronLeft, ChevronRight, Share2, Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { PHONE_RAW } from '../lib/config';
import { sendTelegramNotification, formatLeadMessage } from '../services/telegramService';
import SEOHead, { carSchema, breadcrumbSchema } from '../components/SEOHead';
import { useRealtimeViewers } from '../lib/useRealtimeViewers';

function TrustScore({ car }: { car: any }) {
  const score = car.trust_score || 0;
  
  const getRating = (s: number) => {
    if (s >= 80) return { color: '#16a34a', label: 'Висока довіра' };
    if (s >= 60) return { color: '#eab308', label: 'Середня довіра' };
    if (s >= 40) return { color: '#f97316', label: 'Нижче середньої' };
    return { color: '#dc2626', label: 'Низька довіра — перевірте уважно' };
  };

  const { color, label } = getRating(score);
  
  const carAge = Math.max(1, new Date().getFullYear() - (car.year || new Date().getFullYear()));
  const avgMileage = (car.mileage || 0) / carAge;

  const factors = [
    { name: 'VIN перевірка',    ok: !!car.vin_verified_at || (car.vin?.length === 17) },
    { name: 'Кількість власників', ok: (car.owners_count || 1) <= 3 },
    { name: 'Адекватний пробіг',ok: avgMileage <= 30000 },
    { name: 'Сервісна книга',   ok: !!car.service_history },
    { name: 'Без серйозних ДТП',ok: (car.accidents_count || 0) <= 1 },
    { name: 'Перевірено нами',  ok: !!car.is_checked },
    { name: 'Ринкова ціна',     ok: (car.price_diff_percent || 0) > -30 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">Індекс довіри</h3>
        <span className="text-2xl font-black" style={{ color }}>{score}<span className="text-sm text-slate-400">/100</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full mb-1 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <p className="text-xs font-semibold mb-4" style={{ color }}>{label}</p>
      <div className="space-y-2.5">
        {factors.map(f => (
          <div key={f.name} className="flex items-center gap-2.5 text-xs">
            <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors',
              f.ok ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400')}>
              {f.ok ? '✓' : '–'}
            </span>
            <span className={f.ok ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through opacity-70'}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar]           = useState<any>(null);
  const [images, setImages]     = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [liked, setLiked]       = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [canViewPhone, setCanViewPhone] = useState(true);

  useEffect(() => {
    async function checkLimit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return; // Авторизовані бачать без лімітів

      const today = new Date().toISOString().slice(0, 10);
      const storedDate = localStorage.getItem('phone_view_date');
      let count = Number(localStorage.getItem('phone_view_count') || 0);

      if (storedDate !== today) {
        localStorage.setItem('phone_view_date', today);
        localStorage.setItem('phone_view_count', '0');
        count = 0;
      }

      if (count >= 10) setCanViewPhone(false);
    }
    checkLimit();
  }, []);

  useEffect(() => {
    async function load() {
      if (!id) return;
      // Пробуємо по slug спочатку, потім по id
      let { data } = await supabase.from('cars').select('*, car_images(*)').eq('seo_slug', id).maybeSingle();
      if (!data) {
        const r = await supabase.from('cars').select('*, car_images(*)').eq('id', id).maybeSingle();
        data = r.data;
      }
      if (data) {
        setCar(data);
        // Збираємо зображення
        const imgs: string[] = data.car_images?.map((i: any) => i.url) ?? data.images ?? [];
        setImages(imgs.length ? imgs : ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800']);
        // Лічимо перегляд
        supabase.from('cars').update({ views_count: (data.views_count ?? 0) + 1 }).eq('id', data.id).then();
        // Перевіряємо чи в обраному у поточного користувача
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: fav } = await supabase.from('user_favorites')
            .select('car_id').eq('user_id', user.id).eq('car_id', data.id).maybeSingle();
          setLiked(!!fav);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const toggleLike = async () => {
    if (!car) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (liked) {
      setLiked(false);
      if (user) supabase.from('user_favorites').delete().eq('user_id', user.id).eq('car_id', car.id).then();
    } else {
      setLiked(true);
      if (user) supabase.from('user_favorites').insert([{ user_id: user.id, car_id: car.id }]).then();
    }
  };

  const viewers = useRealtimeViewers(car?.id);

  const handleCall = async () => {
    if (!car || leadSent) return;
    setLeadSent(true);
    await supabase.from('leads').insert([{
      type: 'покупка', name: 'Клік на дзвінок', phone: car.seller_phone ?? '',
      car_id: car.id, source: 'сторінка авто / дзвінок', status: 'новий', score: 'гарячий',
    }]);
    sendTelegramNotification(formatLeadMessage({
      type: 'покупка', name: 'Клік на дзвінок', phone: car.seller_phone ?? 'невідомий',
      carTitle: `${car.brand} ${car.model} ${car.year}`, source: 'сторінка авто',
    }));
  };

  const maskVin = (vin?: string) => vin ? `${vin.slice(0, 3)}...${vin.slice(-4)}` : '—';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
      <AlertCircle className="w-14 h-14 text-slate-300 mb-4" />
      <h2 className="text-xl font-black text-slate-900 mb-2">Авто не знайдено</h2>
      <p className="text-slate-400 text-sm mb-6">Можливо, оголошення видалено або продано</p>
      <Link to="/catalog" className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-blue-dark transition-colors">
        До каталогу
      </Link>
    </div>
  );

  const specs = [
    { label: 'Рік',        value: car.year },
    { label: 'Пробіг',     value: car.mileage ? `${Math.round(car.mileage / 1000)} тис. км` : '—' },
    { label: 'Двигун',     value: car.engine_volume ? `${car.engine_volume} л / ${car.engine_type ?? ''}` : '—' },
    { label: 'Потужність', value: car.power_hp ? `${car.power_hp} к.с.` : '—' },
    { label: 'Коробка',    value: car.transmission ?? '—' },
    { label: 'Привід',     value: car.drive_type ?? '—' },
    { label: 'Кузов',      value: car.body_type ?? '—' },
    { label: 'Власників',  value: car.owners_count ?? '—' },
    { label: 'VIN',        value: maskVin(car.vin), hint: 'Повний VIN — після заявки' },
    { label: 'Місто',      value: car.city ?? '—' },
  ];

  const coverImg = images[0];
  const carTitle = `${car.brand} ${car.model} ${car.engine_volume ? `${car.engine_volume}` : ''} ${car.year}`.trim();

  return (
    <>
      <SEOHead
        title={`Купити ${carTitle} в ${car.city ?? 'Києві'} — $${Number(car.price).toLocaleString()}`}
        description={`${carTitle}, ${car.mileage ? Math.round(car.mileage/1000)+' тис. км' : ''}, ${car.engine_type ?? ''}, ${car.transmission ?? ''}. ${car.is_checked ? 'Перевірено. ' : ''}${car.city ?? 'Київ'}. Ціна $${Number(car.price).toLocaleString()}.`}
        image={coverImg}
        url={`/cars/${car.seo_slug ?? car.id}`}
        type="product"
        schema={{
          '@graph': [
            carSchema(car),
            breadcrumbSchema([
              { name: 'Головна', url: '/' },
              { name: 'Каталог', url: '/catalog' },
              { name: car.brand, url: `/catalog?brand=${car.brand}` },
              { name: carTitle, url: `/cars/${car.seo_slug ?? car.id}` },
            ]),
          ],
        }}
      />
    <div className="min-h-screen bg-white pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-5 flex-wrap">
          <Link to="/" className="hover:text-brand-blue">Головна</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-brand-blue">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog?brand=${car.brand}`} className="hover:text-brand-blue">{car.brand}</Link>
          <span>/</span>
          <span className="text-slate-600">{car.brand} {car.model} {car.year}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Ліва колонка */}
          <div className="lg:col-span-7 space-y-6">

            {/* Галерея */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 group">
              <img src={images[activeIdx]} alt={`${car.brand} ${car.model}`}
                className="w-full aspect-[16/10] object-cover" />

              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Бейджі */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {car.is_checked && (
                  <span className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                    <ShieldCheck size={12} /> Перевірено нами
                  </span>
                )}
                {car.badge && (
                  <span className="bg-brand-blue text-white px-2.5 py-1 rounded-lg text-xs font-black uppercase">
                    {car.badge}
                  </span>
                )}
              </div>

              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg font-semibold">
                {activeIdx + 1} / {images.length}
              </span>
            </div>

            {/* Мініатюри */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={cn('shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all',
                      activeIdx === i ? 'border-brand-blue' : 'border-transparent opacity-60 hover:opacity-100')}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Характеристики */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-wide mb-4">Характеристики</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {specs.map(s => (
                  <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-400 font-semibold">{s.label}</span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">{s.value}</span>
                      {s.hint && <p className="text-[10px] text-slate-400">{s.hint}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Опис */}
            {car.description && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wide mb-3">Опис</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{car.description}</p>
              </div>
            )}
          </div>

          {/* Права колонка — sticky */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">

              {/* Ціна і кнопки */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-xl font-black text-slate-900 leading-snug">
                    {car.brand} {car.model} {car.engine_volume ? `${car.engine_volume}` : ''} {car.year}
                  </h1>
                  <button onClick={toggleLike}
                    className={cn('p-2 rounded-lg transition-colors', liked ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-400 hover:bg-red-50')}>
                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* FOMO — real-time глядачі */}
                {viewers > 1 && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-orange-600 font-semibold bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                    Зараз дивляться: {viewers} {viewers === 1 ? 'людина' : viewers < 5 ? 'людини' : 'людей'}
                  </div>
                )}

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-3xl font-black text-brand-blue">
                    {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
                  </span>
                  {car.views_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye size={12} /> {car.views_count} переглядів
                    </span>
                  )}
                </div>

                {/* Швидкі теги */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {car.is_checked && <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">✓ Перевірено</span>}
                  {car.service_history && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">✓ Сервісна книга</span>}
                  {car.owners_count === 1 && <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">1 власник</span>}
                </div>

                <div className="flex flex-col gap-2.5">
                  {!canViewPhone ? (
                    <Link to="/login" className="flex flex-col items-center justify-center gap-1 py-3.5 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-xl font-bold hover:bg-orange-100 transition-colors">
                      <span className="text-sm">Досягнуто ліміт переглядів (10/день)</span>
                      <span className="text-xs font-black uppercase">Авторизуйтесь, щоб бачити номери</span>
                    </Link>
                  ) : !showPhone ? (
                    <button onClick={() => {
                      setShowPhone(true);
                      const count = Number(localStorage.getItem('phone_view_count') || 0);
                      localStorage.setItem('phone_view_count', (count + 1).toString());
                    }}
                      className="flex items-center justify-center gap-2 py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20">
                      <Phone size={18} /> Показати номер телефону
                    </button>
                  ) : (
                    <a href={`tel:${car.seller_phone ?? PHONE_RAW}`} onClick={handleCall}
                      className="flex items-center justify-center gap-2 py-3.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20 animate-in fade-in zoom-in duration-300">
                      <Phone size={18} />
                      {car.seller_phone ? car.seller_phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') : 'Подзвонити'}
                    </a>
                  )}
                  
                  <a href="https://t.me/vips_cars" target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-brand-blue hover:text-brand-blue transition-colors">
                    <MessageCircle size={18} />
                    Написати в Telegram
                  </a>
                  <button onClick={() => navigator.share?.({ title: `${car.brand} ${car.model}`, url: location.href })}
                    className="flex items-center justify-center gap-2 py-2.5 text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors">
                    <Share2 size={15} /> Поділитися
                  </button>
                </div>

                {car.seller_name && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-sm font-black text-slate-500">
                      {car.seller_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{car.seller_name}</p>
                      <p className="text-xs text-slate-400">Відповідає за 5 хв</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Score */}
              {car.trust_score > 0 && <TrustScore car={car} />}

              {/* Послуги */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Потрібна допомога?</p>
                <div className="space-y-2">
                  <Link to="/avtopidbir" className="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
                    → Автопідбір під ключ
                  </Link>
                  <Link to="/perevirka" className="flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">
                    → Перевірка авто
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
