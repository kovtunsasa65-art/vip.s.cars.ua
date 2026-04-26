import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CarCard from './CarCard';
import SearchBox, { type FilterPatch } from './SearchBox';
import { cn } from '../lib/utils';
import SEOHead from './SEOHead';
import { normalizeQuery } from '../lib/searchNormalize';

const FUEL_TYPES    = ['Бензин', 'Дизель', 'Електро', 'Гібрид', 'Газ'];
const TRANSMISSIONS = ['Автомат', 'Механіка', 'Варіатор', 'Робот'];
const SORT_OPTIONS  = [
  { label: 'Рекомендовані',    value: 'recommended' },
  { label: 'Спочатку нові',    value: 'new' },
  { label: 'Дешевші спочатку', value: 'price_asc' },
  { label: 'Дорожчі спочатку', value: 'price_desc' },
  { label: 'Індекс довіри',    value: 'trust' },
  { label: 'Менше пробіг',     value: 'mileage' },
];

const PAGE_SIZE = 12;

interface Filters {
  brand: string;
  fuelTypes: string[];
  transmissions: string[];
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  mileageMax: string;
  onlyChecked: boolean;
  search: string;
}

const defaultFilters: Filters = {
  brand: '', fuelTypes: [], transmissions: [],
  priceMin: '', priceMax: '', yearMin: '', yearMax: '',
  mileageMax: '', onlyChecked: false, search: '',
};

export default function Catalog() {
  const [cars, setCars]         = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [brands, setBrands]     = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [sort, setSort]         = useState('recommended');
  const [filters, setFilters]   = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { brandSlug } = useParams();
  const [seoData, setSeoData] = useState<any>(null);

  // Завантажуємо список брендів один раз
  useEffect(() => {
    supabase.from('cars').select('brand').eq('status', 'active').then(({ data }) => {
      if (data) setBrands([...new Set(data.map((r: any) => r.brand).filter(Boolean))].sort());
    });
  }, []);

  // Синхронізуємо URL (brandSlug) з фільтрами та завантажуємо SEO
  useEffect(() => {
    if (brandSlug) {
      // Завантажуємо SEO сторінку з бази (якщо є)
      supabase.from('seo_pages').select('*').eq('slug', `catalog/${brandSlug}`).maybeSingle()
        .then(({ data }) => setSeoData(data));
        
      // Шукаємо точну назву бренду в базі (незалежно від регістру)
      if (brands.length > 0) {
        const match = brands.find(b => b.toLowerCase() === brandSlug.toLowerCase());
        if (match && filters.brand !== match) {
          setFilters(prev => ({ ...prev, brand: match }));
          setPage(1);
        } else if (!match && filters.brand !== brandSlug) {
          // Fallback, якщо бренд ще не завантажився або пишеться інакше
          setFilters(prev => ({ ...prev, brand: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1) }));
        }
      }
    } else {
      setSeoData(null);
      if (filters.brand) setFilters(prev => ({ ...prev, brand: '' }));
    }
  }, [brandSlug, brands]);

  const fetchCars = useCallback(async (f: Filters, s: string, p: number) => {
    setLoading(true);
    let q = supabase.from('cars').select('*, car_images(*)', { count: 'exact' }).eq('status', 'active');

    if (f.brand)        q = q.eq('brand', f.brand);
    if (f.onlyChecked)  q = q.eq('is_checked', true);
    if (f.priceMin)     q = q.gte('price', Number(f.priceMin));
    if (f.priceMax)     q = q.lte('price', Number(f.priceMax));
    if (f.yearMin)      q = q.gte('year', Number(f.yearMin));
    if (f.yearMax)      q = q.lte('year', Number(f.yearMax));
    if (f.mileageMax)   q = q.lte('mileage', Number(f.mileageMax) * 1000);
    if (f.fuelTypes.length)     q = q.in('engine_type', f.fuelTypes.map(t => t.toLowerCase()));
    if (f.transmissions.length) q = q.in('transmission', f.transmissions.map(t => t.toLowerCase()));
    if (f.search) { const sq = normalizeQuery(f.search); q = q.or(`brand.ilike.%${sq}%,model.ilike.%${sq}%,title.ilike.%${sq}%`); }

    // Сортування
    if (s === 'price_asc')  q = q.order('price', { ascending: true });
    else if (s === 'price_desc') q = q.order('price', { ascending: false });
    else if (s === 'trust') q = q.order('trust_score', { ascending: false });
    else if (s === 'mileage') q = q.order('mileage', { ascending: true });
    else if (s === 'new') q = q.order('created_at', { ascending: false });
    else q = q.order('ranking_score', { ascending: false }).order('created_at', { ascending: false });

    q = q.range((p - 1) * PAGE_SIZE, p * PAGE_SIZE - 1);

    const { data, count } = await q;
    setCars(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCars(filters, sort, page); }, [filters, sort, page, fetchCars]);

  const setF = (key: keyof Filters, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const toggleArr = (key: 'fuelTypes' | 'transmissions', val: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
    setPage(1);
  };

  const resetFilters = () => { setFilters(defaultFilters); setPage(1); };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  const FilterPanel = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">Фільтри</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs text-brand-blue font-bold flex items-center gap-1 hover:underline">
            <RotateCcw size={11} /> Скинути
          </button>
        )}
      </div>

      {/* Марка */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Марка</label>
        <select value={filters.brand} onChange={e => setF('brand', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:border-brand-blue focus:outline-none">
          <option value="">Всі марки</option>
          {brands.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Ціна */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Ціна, $</label>
        <div className="flex gap-2">
          <input type="number" placeholder="від" value={filters.priceMin} onChange={e => setF('priceMin', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
          <input type="number" placeholder="до" value={filters.priceMax} onChange={e => setF('priceMax', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </div>
      </div>

      {/* Рік */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Рік</label>
        <div className="flex gap-2">
          <input type="number" placeholder="від" value={filters.yearMin} onChange={e => setF('yearMin', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
          <input type="number" placeholder="до" value={filters.yearMax} onChange={e => setF('yearMax', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </div>
      </div>

      {/* Пробіг */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Пробіг, тис. км (до)</label>
        <input type="number" placeholder="напр. 200" value={filters.mileageMax} onChange={e => setF('mileageMax', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
      </div>

      {/* Паливо */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Паливо</label>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map(f => (
            <button key={f} onClick={() => toggleArr('fuelTypes', f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                filters.fuelTypes.includes(f) ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-blue')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* КПП */}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Коробка</label>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map(t => (
            <button key={t} onClick={() => toggleArr('transmissions', t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                filters.transmissions.includes(t) ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-blue')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Тільки перевірені */}
      <label className="flex items-center gap-3 cursor-pointer py-2 border-t border-slate-100">
        <div onClick={() => setF('onlyChecked', !filters.onlyChecked)}
          className={cn('w-10 h-5 rounded-full transition-colors relative', filters.onlyChecked ? 'bg-brand-blue' : 'bg-slate-200')}>
          <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', filters.onlyChecked ? 'translate-x-5' : 'translate-x-0.5')} />
        </div>
        <span className="text-sm font-semibold text-slate-700">Тільки перевірені</span>
      </label>
    </div>
  );

  const brandLabel = filters.brand ? `${filters.brand} ` : '';
  const finalTitle = seoData?.seo_title || `${brandLabel}Каталог авто в Києві — ${total} оголошень`;
  const finalDesc  = seoData?.seo_desc || `Купити ${brandLabel}авто в Києві. ${total} перевірених оголошень з Індексом Довіри. Фільтри за ціною, роком, пробігом.`;
  const finalH1    = seoData?.h1 || `Каталог авто ${brandLabel}`;

  return (
    <>
      <SEOHead
        title={finalTitle}
        description={finalDesc}
        url={brandSlug ? `/catalog/${brandSlug}` : "/catalog"}
      />
    <section className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* SEO Опис (якщо є в базі) */}
        {seoData?.content_top && (
          <div className="mb-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div className="prose prose-sm text-slate-600 max-w-none" dangerouslySetInnerHTML={{ __html: seoData.content_top }} />
          </div>
        )}

        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{finalH1}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{total} оголошень</p>
          </div>
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
            <SlidersHorizontal size={16} /> Фільтри
            {hasActiveFilters && <span className="w-2 h-2 bg-brand-blue rounded-full" />}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar десктоп */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24"><FilterPanel /></div>
          </aside>

          {/* Контент */}
          <div className="flex-1 min-w-0">
            {/* Панель пошуку і сортування */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-5 flex flex-col sm:flex-row gap-3">
              <SearchBox
                value={filters.search}
                onChange={text => setF('search', text)}
                onApply={(patch: FilterPatch) => {
                  setFilters(prev => ({ ...prev, ...patch } as Filters));
                  setPage(1);
                }}
                className="flex-1"
              />
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:border-brand-blue focus:outline-none shrink-0">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Активні фільтри — теги */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.brand && <Tag label={`Марка: ${filters.brand}`} onRemove={() => setF('brand', '')} />}
                {filters.priceMin && <Tag label={`Від $${filters.priceMin}`} onRemove={() => setF('priceMin', '')} />}
                {filters.priceMax && <Tag label={`До $${filters.priceMax}`} onRemove={() => setF('priceMax', '')} />}
                {filters.yearMin && <Tag label={`Рік від ${filters.yearMin}`} onRemove={() => setF('yearMin', '')} />}
                {filters.yearMax && <Tag label={`Рік до ${filters.yearMax}`} onRemove={() => setF('yearMax', '')} />}
                {filters.mileageMax && <Tag label={`Пробіг до ${filters.mileageMax} тис.`} onRemove={() => setF('mileageMax', '')} />}
                {filters.fuelTypes.map((f: string) => <Tag key={f} label={f} onRemove={() => toggleArr('fuelTypes', f)} />)}
                {filters.transmissions.map((t: string) => <Tag key={t} label={t} onRemove={() => toggleArr('transmissions', t)} />)}
                {filters.onlyChecked && <Tag label="Перевірені" onRemove={() => setF('onlyChecked', false)} />}
              </div>
            )}

            {/* Картки */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      <div className="h-6 bg-slate-100 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-slate-400 font-semibold text-lg mb-2">Нічого не знайдено</p>
                <p className="text-slate-300 text-sm mb-6">Спробуйте змінити фільтри</p>
                <button onClick={resetFilters} className="px-6 py-2.5 bg-brand-blue text-white rounded-lg font-bold text-sm hover:bg-brand-blue-dark transition-colors">
                  Скинути фільтри
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={`${sort}-${page}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cars.map((car, i) => {
                    const C = CarCard as any;
                    return (
                      <motion.div key={car.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <C car={car} />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Пагінація */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-brand-blue transition-colors">
                  ← Назад
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={cn('w-9 h-9 rounded-lg text-sm font-bold transition-all',
                        page === p ? 'bg-brand-blue text-white shadow-md' : 'border border-slate-200 hover:border-brand-blue text-slate-600')}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-brand-blue transition-colors">
                  Далі →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобільний sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-5 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-900">Фільтри</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <FilterPanel />
              <button onClick={() => setSidebarOpen(false)}
                className="w-full mt-4 py-3 bg-brand-blue text-white rounded-xl font-bold">
                Показати {total} авто
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
    </>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void; [k: string]: any }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors"><X size={11} /></button>
    </span>
  );
}
