import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, Phone, CheckCircle2, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import SEOHead from '../components/SEOHead';
import { PHONE_RAW } from '../lib/config';

const SPEC_ROWS = [
  { key: 'price',          label: 'Ціна',           fmt: (v: any, c: any) => `${c.currency === 'USD' ? '$' : '₴'}${Number(v).toLocaleString()}` },
  { key: 'year',           label: 'Рік' },
  { key: 'mileage',        label: 'Пробіг',         fmt: (v: any) => v ? `${Math.round(v/1000)} тис. км` : '—' },
  { key: 'engine_volume',  label: "Об'єм двигуна",  fmt: (v: any) => v ? `${v} л` : '—' },
  { key: 'engine_type',    label: 'Паливо' },
  { key: 'power_hp',       label: 'Потужність',     fmt: (v: any) => v ? `${v} к.с.` : '—' },
  { key: 'transmission',   label: 'Коробка' },
  { key: 'drive_type',     label: 'Привід' },
  { key: 'body_type',      label: 'Кузов' },
  { key: 'owners_count',   label: 'Власників' },
  { key: 'trust_score',    label: 'Індекс довіри',  fmt: (v: any) => v ? `${v}/100` : '—' },
  { key: 'city',           label: 'Місто' },
  { key: 'is_checked',     label: 'Перевірено',     fmt: (v: any) => v ? '✓ Так' : '—' },
  { key: 'service_history',label: 'Сервісна книга', fmt: (v: any) => v ? '✓ Є' : '—' },
];

function getBest(cars: any[], key: string): any {
  if (key === 'price') return Math.min(...cars.map(c => Number(c[key]) || Infinity));
  if (key === 'mileage') return Math.min(...cars.map(c => Number(c[key]) || Infinity));
  if (key === 'trust_score') return Math.max(...cars.map(c => Number(c[key]) || 0));
  if (key === 'year') return Math.max(...cars.map(c => Number(c[key]) || 0));
  return null;
}

export default function ComparePage() {
  const [params] = useSearchParams();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = (params.get('ids') ?? '').split(',').filter(Boolean).slice(0, 3);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    supabase.from('cars').select('*').in('id', ids)
      .then(({ data }) => { setCars(data ?? []); setLoading(false); });
  }, [params.get('ids')]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"/></div>;

  if (!cars.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <p className="text-slate-500 font-semibold mb-4">Оберіть авто для порівняння</p>
      <Link to="/catalog" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors">До каталогу</Link>
    </div>
  );

  return (
    <>
      <SEOHead title="Порівняння авто" url="/compare" />
      <div className="min-h-screen bg-slate-50 py-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-slate-900">Порівняння авто</h1>
            <Link to="/catalog" className="text-sm text-brand-blue font-bold hover:underline">+ Додати авто</Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Шапка з фото */}
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="w-36 p-4 text-left text-xs font-black text-slate-400 uppercase tracking-wide">Характеристика</th>
                    {cars.map(car => {
                      const img = car.images?.[0];
                      return (
                        <th key={car.id} className="p-4 text-left min-w-[200px]">
                          <div className="relative">
                            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                              {img && <img src={img} className="w-full h-full object-cover" alt={car.title}/>}
                            </div>
                            <p className="font-black text-slate-900 text-sm leading-tight mb-1">
                              {car.brand} {car.model} {car.year}
                            </p>
                            <p className="text-lg font-black text-brand-blue">
                              {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Link to={`/cars/${car.seo_slug ?? car.id}`}
                                className="flex-1 text-center py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue-dark transition-colors">
                                Детальніше
                              </Link>
                              <a href={`tel:${car.seller_phone ?? PHONE_RAW}`}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-colors">
                                <Phone size={13}/>
                              </a>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                {/* Рядки характеристик */}
                <tbody>
                  {SPEC_ROWS.map((row, ri) => {
                    const best = getBest(cars, row.key);
                    return (
                      <tr key={row.key} className={cn('border-b border-slate-50', ri % 2 === 0 ? 'bg-slate-50/40' : 'bg-white')}>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-400">{row.label}</td>
                        {cars.map(car => {
                          const raw = car[row.key];
                          const display = raw != null ? (row.fmt ? row.fmt(raw, car) : String(raw)) : '—';
                          const isBest = best != null && raw != null && Number(raw) === best;
                          return (
                            <td key={car.id} className="px-4 py-3">
                              <span className={cn('text-sm font-semibold', isBest ? 'text-green-600 font-black' : 'text-slate-700', display === '—' && 'text-slate-300')}>
                                {isBest && <span className="mr-1">★</span>}
                                {display}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
