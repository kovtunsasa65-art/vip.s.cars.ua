import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, TrendingUp, Tag, MapPin, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { normalizeQuery } from '../lib/searchNormalize';
import { searchProvider } from '../lib/searchProvider';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FilterPatch {
  brand?: string;
  search?: string;
  fuelTypes?: string[];
  transmissions?: string[];
  priceMax?: string;
  yearMin?: string;
}

type SuggestionKind = 'brand' | 'model' | 'phrase' | 'city';

interface Suggestion {
  id: string;
  kind: SuggestionKind;
  label: string;
  sublabel?: string;
  patch: FilterPatch;
}

interface SearchBoxProps {
  value: string;
  onChange: (text: string) => void;
  onApply: (patch: FilterPatch) => void;
  placeholder?: string;
  className?: string;
}

// ─── Static data ────────────────────────────────────────────────────────────────

const KIND_META: Record<SuggestionKind, { icon: React.FC<any>; groupLabel: string }> = {
  brand:  { icon: Tag,       groupLabel: 'Марки'    },
  model:  { icon: Tag,       groupLabel: 'Моделі'   },
  phrase: { icon: Lightbulb, groupLabel: 'Саджести' },
  city:   { icon: MapPin,    groupLabel: 'Міста'    },
};

const POPULAR_STATIC = ['BMW X5', 'Toyota Camry', 'Volkswagen Golf', 'Mercedes-Benz GLE', 'Дизельні кросовери'];

const KEYWORD_PHRASES: Array<{ test: (q: string) => boolean; items: Suggestion[] }> = [
  {
    test: q => /дизел|diesel/i.test(q),
    items: [
      { id: 'kp-diesel-cross', kind: 'phrase', label: 'Дизельні кросовери 2018+',     patch: { fuelTypes: ['Дизель'], yearMin: '2018' } },
      { id: 'kp-diesel',       kind: 'phrase', label: 'Дизельні авто',                patch: { fuelTypes: ['Дизель'] } },
    ],
  },
  {
    test: q => /електр|electr|ev\b/i.test(q),
    items: [
      { id: 'kp-ev', kind: 'phrase', label: 'Електромобілі', patch: { fuelTypes: ['Електро'] } },
    ],
  },
  {
    test: q => /гібрид|hybrid/i.test(q),
    items: [
      { id: 'kp-hybrid', kind: 'phrase', label: 'Гібриди до $25 000', patch: { fuelTypes: ['Гібрид'], priceMax: '25000' } },
    ],
  },
  {
    test: q => /автомат|automat/i.test(q),
    items: [
      { id: 'kp-auto', kind: 'phrase', label: 'Авто з автоматом', patch: { transmissions: ['Автомат'] } },
    ],
  },
];

function brandPhrases(brand: string): Suggestion[] {
  return [
    { id: `ph-${brand}-15k`,  kind: 'phrase', label: `${brand} до $15 000`, patch: { brand, priceMax: '15000', search: '' } },
    { id: `ph-${brand}-auto`, kind: 'phrase', label: `${brand} автомат`,    patch: { brand, transmissions: ['Автомат'], search: '' } },
    { id: `ph-${brand}-2020`, kind: 'phrase', label: `${brand} 2020+`,      patch: { brand, yearMin: '2020', search: '' } },
  ];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SearchBox({ value, onChange, onApply, placeholder = 'Марка, модель, місто...', className }: SearchBoxProps) {
  const [open, setOpen]             = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [popular, setPopular]       = useState<string[]>([]);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [fetching, setFetching]     = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Popular searches (last 7 days) ─────────────────────────────────────────
  useEffect(() => {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    supabase.from('search_events')
      .select('query')
      .gte('created_at', since)
      .limit(500)
      .then(({ data, error }) => {
        if (error || !data?.length) { setPopular(POPULAR_STATIC); return; }
        const counts = new Map<string, number>();
        data.forEach((r: any) => counts.set(r.query, (counts.get(r.query) ?? 0) + 1));
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([q]) => q);
        setPopular(top.length >= 3 ? top : POPULAR_STATIC);
      });
  }, []);

  // ─── Click outside ────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ─── Unmount Cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const abortRef = useRef<AbortController | null>(null);

  // ─── Fetch suggestions ────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (raw: string) => {
    if (raw.length < 2) { setSuggestions([]); return; }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetching(true);

    try {
      const { brands, models, cities } = await searchProvider.search(raw, controller.signal);

      if (controller.signal.aborted) return;

      const items: Suggestion[] = [];

      brands.forEach(b => items.push({ id: `b-${b}`, kind: 'brand', label: b, patch: { brand: b, search: '' } }));
      models.forEach((r: any) => items.push({ id: `m-${r.brand}-${r.model}`, kind: 'model', label: r.model, sublabel: r.brand, patch: { brand: r.brand, search: r.model } }));

      // Smart phrases from matched brand
      if (brands.length > 0) brandPhrases(brands[0]).forEach(p => items.push(p));
      // Keyword-driven phrases
      KEYWORD_PHRASES.forEach(kp => { if (kp.test(raw)) kp.items.forEach(p => items.push(p)); });

      cities.forEach(c => items.push({ id: `c-${c}`, kind: 'city', label: c, patch: { search: c } }));

      setSuggestions(items);
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Fetch suggestions error:', e);
    } finally {
      if (!controller.signal.aborted) {
        setFetching(false);
      }
    }
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setActiveIdx(-1);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const applySuggestion = useCallback((s: Suggestion) => {
    supabase.from('search_events').insert({ query: s.label, suggestion_type: s.kind }).then();
    onApply(s.patch);
    onChange(s.patch.search ?? '');
    setOpen(false);
    setActiveIdx(-1);
    setSuggestions([]);
  }, [onApply, onChange]);

  const applyFreeText = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    const normalized = normalizeQuery(t);
    supabase.from('search_events').insert({ query: normalized, suggestion_type: 'freetext' }).then();
    onApply({ search: normalized });
    setOpen(false);
  }, [onApply]);

  const applyPopular = (q: string) => {
    onChange(q);
    onApply({ search: q });
    supabase.from('search_events').insert({ query: q, suggestion_type: 'popular' }).then();
    setOpen(false);
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    onApply({ search: '', brand: '' });
    inputRef.current?.focus();
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isPopular = open && value.length < 2 && popular.length > 0 && !fetching;
    const listLen = isPopular ? popular.length : suggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, listLen - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        if (isPopular && popular[activeIdx]) {
          applyPopular(popular[activeIdx]);
        } else if (!isPopular && suggestions[activeIdx]) {
          applySuggestion(suggestions[activeIdx]);
        } else {
          applyFreeText(value);
        }
      } else {
        applyFreeText(value);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const ORDER: SuggestionKind[] = ['brand', 'model', 'phrase', 'city'];
  const groups = ORDER
    .map(kind => ({ kind, items: suggestions.filter(s => s.kind === kind) }))
    .filter(g => g.items.length > 0);

  const showPopular    = open && value.length < 2 && popular.length > 0 && !fetching;
  const showSuggestions = open && value.length >= 2;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-brand-blue focus:outline-none focus:bg-white transition-colors"
        />
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-0.5"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {(showPopular || showSuggestions) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/80 z-[300] overflow-hidden"
          >

            {/* Spinner */}
            {fetching && (
              <div className="flex items-center gap-2.5 px-4 py-3 text-xs text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 border-t-brand-blue animate-spin" />
                Шукаємо...
              </div>
            )}

            {/* Popular queries */}
            {showPopular && (
              <div>
                <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                  <TrendingUp size={11} className="text-brand-blue" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Популярні зараз</span>
                </div>
                {popular.map((q, i) => (
                  <button
                    key={q}
                    onMouseDown={e => { e.preventDefault(); applyPopular(q); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50',
                      i === activeIdx && 'bg-slate-50'
                    )}
                  >
                    <TrendingUp size={13} className="text-slate-300 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">{q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Grouped suggestions */}
            {showSuggestions && !fetching && groups.map((group, gi) => {
              const { icon: Icon, groupLabel } = KIND_META[group.kind];
              return (
                <div key={group.kind} className={gi > 0 ? 'border-t border-slate-100' : ''}>
                  <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                    <Icon size={11} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{groupLabel}</span>
                  </div>
                  {group.items.map(s => {
                    const idx = suggestions.findIndex(x => x.id === s.id);
                    const isActive = idx === activeIdx;
                    const I = KIND_META[s.kind].icon;
                    return (
                      <button
                        key={s.id}
                        onMouseDown={e => { e.preventDefault(); applySuggestion(s); }}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                          isActive ? 'bg-brand-blue/5' : 'hover:bg-slate-50'
                        )}
                      >
                        <I size={13} className={cn('flex-shrink-0', isActive ? 'text-brand-blue' : 'text-slate-300')} />
                        <span className={cn('font-semibold', isActive ? 'text-brand-blue' : 'text-slate-700')}>
                          {s.label}
                        </span>
                        {s.sublabel && (
                          <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">{s.sublabel}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Empty state */}
            {showSuggestions && !fetching && groups.length === 0 && (
              <div className="px-4 py-5 text-center">
                <p className="text-sm text-slate-400 font-semibold">Нічого не знайдено</p>
                <p className="text-xs text-slate-300 mt-0.5">Спробуйте інший запит або натисніть Enter</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
