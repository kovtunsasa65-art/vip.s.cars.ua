import { useState } from 'react';
import { motion } from 'motion/react';
import { Gauge, Settings, Heart, ShieldCheck, Eye, Fuel, GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { PHONE_RAW } from '../lib/config';
import { useCompare } from '../lib/useCompare';

type CarCardProps = { car: any };

function TrustBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626';
  const label = score >= 80 ? 'Надійне' : score >= 55 ? 'Прийнятне' : 'Ризик';
  return (
    <div className="flex items-center gap-1.5">
      <div style={{
        width: 48, height: 5, borderRadius: 3,
        background: '#e2e8f0', overflow: 'hidden',
      }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}/100</span>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
    </div>
  );
}

export default function CarCard({ car }: CarCardProps) {
  const [liked, setLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const { ids: compareIds, toggle: toggleCompare, maxReached } = useCompare();
  const inCompare = compareIds.includes(car.id);

  // Отримуємо зображення — нова схема (car_images) або стара (images[])
  const images: string[] = car.car_images?.map((i: any) => i.url)
    ?? car.images
    ?? [];
  const coverImg = images[imgIdx]
    ?? 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop';

  const trust = car.trust_score ?? 0;
  const views = car.views_count ?? 0;

  // Бейдж
  const badge = car.badge ?? (car.is_top ? 'нове' : car.is_urgent ? 'терміново' : null);
  const badgeColors: Record<string, string> = {
    нове: '#2563eb', вигідно: '#ea580c', терміново: '#dc2626', ексклюзив: '#7c3aed',
  };

  const slug = car.seo_slug ?? car.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="card-light group flex flex-col h-full bg-white relative"
    >
      {/* Обране */}
      <button
        onClick={e => { e.preventDefault(); setLiked(!liked); }}
        className={cn(
          'absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm',
          liked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'
        )}
      >
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
      </button>

      {/* Фото */}
      <div
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
        onMouseEnter={() => images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        <img
          src={coverImg}
          alt={`${car.brand} ${car.model} ${car.year}`}
          className="w-full h-full object-cover transition-all duration-500"
          style={{ transform: imgIdx === 1 ? 'scale(1.04)' : 'scale(1)' }}
          referrerPolicy="no-referrer"
        />

        {/* Бейдж */}
        {badge && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span style={{
              background: badgeColors[badge] ?? '#2563eb',
              color: '#fff', padding: '3px 8px',
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              borderRadius: 4, letterSpacing: '0.05em',
            }}>{badge}</span>
          </div>
        )}

        {/* Перевірено */}
        {car.is_checked && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-green-700">
            <ShieldCheck size={11} className="text-green-600" />
            Перевірено
          </div>
        )}

        {/* Переглядів */}
        {views > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-slate-500">
            <Eye size={10} />
            {views} зараз
          </div>
        )}

        {/* Індикатор фото */}
        {images.length > 1 && (
          <div className="absolute top-3 right-12 flex gap-1">
            {images.slice(0, 4).map((_, i) => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: '50%',
                background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Заголовок */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors truncate">
          {car.brand} {car.model} {car.engine_volume ? `${car.engine_volume}` : ''} {car.year}
        </h3>

        {/* Ціна */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-brand-blue">
            {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
          </span>
          {car.market_price && car.market_price > car.price && (
            <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
              −{Math.round((1 - car.price / car.market_price) * 100)}% від ринку
            </span>
          )}
        </div>

        {/* Характеристики */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Gauge size={12} className="text-slate-300" />
            {Math.round((car.mileage ?? 0) / 1000)} тис. км
          </span>
          {car.transmission && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <Settings size={12} className="text-slate-300" />
              {car.transmission}
            </span>
          )}
          {car.engine_type && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <Fuel size={12} className="text-slate-300" />
              {car.engine_type}
            </span>
          )}
        </div>

        {/* Trust Score */}
        {trust > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Індекс довіри</div>
            <TrustBadge score={trust} />
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-2 mt-1">
          <Link
            to={`/cars/${slug}`}
            className="flex-1 text-center py-2 rounded-lg bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors"
          >
            Детальніше
          </Link>
          <a
            href={`tel:${PHONE_RAW}`}
            onClick={e => e.stopPropagation()}
            className="w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </a>
          <button
            onClick={e => { e.preventDefault(); toggleCompare(car.id); }}
            disabled={!inCompare && maxReached}
            title={inCompare ? 'Прибрати з порівняння' : maxReached ? 'Максимум 3 авто' : 'Додати до порівняння'}
            className={cn(
              'w-10 flex items-center justify-center rounded-lg border transition-colors',
              inCompare
                ? 'border-brand-blue text-brand-blue bg-brand-blue/5'
                : 'border-slate-200 text-slate-400 hover:border-brand-blue hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <GitCompareArrows size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
