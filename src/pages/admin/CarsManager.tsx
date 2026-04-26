import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Edit3, Trash2, ExternalLink, RefreshCw, X,
  Download, Users, Tag, Sparkles, CheckSquare, Square,
  Clock, ImageOff, ShieldAlert, Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import CarForm from './CarForm';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CarsManager() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    status: [] as string[],
    noClicks3Days: false,
    noPhotos: false,
    lowTrust: false,
    viewMode: 'all' // 'all' | 'mine'
  });

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCars();
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'n' && document.activeElement?.tagName !== 'INPUT') {
        setIsAdding(true);
      }
      if (e.key === 'Escape') {
        setIsAdding(false);
        setEditingId(null);
      }
      if (e.key === 'e' && selectedIds.length === 1 && document.activeElement?.tagName !== 'INPUT') {
        setEditingId(selectedIds[0]);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [selectedIds]);

  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error) setCars(data || []);
    setLoading(false);
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(f => ({
      ...f,
      status: f.status.includes(status) ? f.status.filter(s => s !== status) : [...f.status, status]
    }));
  };

  const exportCSV = () => {
    const headers = ['ID', 'Make', 'Model', 'Price', 'Status', 'Views', 'Clicks'];
    const rows = filteredCars.map(c => [c.id, c.make, c.model, c.price, c.status, c.views || 0, c.clicks || 0]);
    const content = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cars_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('Експорт завершено');
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedIds.length) return;
    toast.loading(`Виконується: ${action}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Оновлено ${selectedIds.length} авто`);
      setSelectedIds([]);
      fetchCars();
    }, 1000);
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filters.status.length && !filters.status.includes(car.status)) return false;
    if (filters.noPhotos && car.images?.length > 0) return false;
    if (filters.lowTrust && car.trust_score >= 70) return false;
    if (filters.viewMode === 'mine' && car.manager_id !== 'MY_ID') return false; // Mock ID
    
    if (filters.noClicks3Days) {
      const lastClick = car.last_click_at ? new Date(car.last_click_at) : new Date(car.created_at);
      const diffDays = (Date.now() - lastClick.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 3) return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCars.length) setSelectedIds([]);
    else setSelectedIds(filteredCars.map(c => c.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (isAdding || editingId) {
    return (
      <CarForm 
        initialData={editingId ? cars.find(c => c.id === editingId) : null}
        onSave={async (d: any) => {
          await supabase.from('cars').upsert(d);
          setIsAdding(false);
          setEditingId(null);
          fetchCars();
        }} 
        onCancel={() => { setIsAdding(false); setEditingId(null); }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Каталог Авто</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setFilters(f => ({...f, viewMode: 'all'}))} className={cn("px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all", filters.viewMode === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>Всі</button>
              <button onClick={() => setFilters(f => ({...f, viewMode: 'mine'}))} className={cn("px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all", filters.viewMode === 'mine' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>Мої</button>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredCars.length} авто показано</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Download size={14} /> Експорт CSV
          </button>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
            <Plus size={16} /> Нове Авто <span className="opacity-40 ml-1 text-[10px]">(N)</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
            className="bg-brand-blue p-3 rounded-2xl flex items-center justify-between shadow-xl shadow-brand-blue/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-[10px] font-black uppercase tracking-widest px-3 border-r border-white/20">{selectedIds.length} вибрано</span>
              <div className="flex gap-1.5 ml-2">
                <button onClick={() => handleBulkAction('status')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5"><RefreshCw size={12}/> Статус</button>
                <button onClick={() => handleBulkAction('manager')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5"><Users size={12}/> Менеджер</button>
                <button onClick={() => handleBulkAction('badge')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5"><Tag size={12}/> Бейдж</button>
                <button onClick={() => handleBulkAction('ai_improve')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5"><Sparkles size={12}/> AI Опис</button>
                <button onClick={() => handleBulkAction('ai_seo')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5"><Globe size={12}/> AI SEO</button>
              </div>
            </div>
            <button onClick={() => setSelectedIds([])} className="p-2 text-white/60 hover:text-white transition-colors"><X size={18}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={searchInputRef} type="text" placeholder="Швидкий пошук за маркою, моделлю або VIN (/) ..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black focus:bg-white focus:border-brand-blue outline-none transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">Статус:</span>
            {['available', 'moderation', 'sold', 'revision'].map(s => (
              <button key={s} onClick={() => toggleStatusFilter(s)}
                className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all",
                  filters.status.includes(s) ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-slate-500 border-slate-200")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-50 pt-6">
          <button onClick={() => setFilters(f => ({ ...f, noClicks3Days: !f.noClicks3Days }))}
            className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-2",
              filters.noClicks3Days ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-400 border-slate-100")}>
            <Clock size={14}/> Без кліків 3д+
          </button>
          <button onClick={() => setFilters(f => ({ ...f, noPhotos: !f.noPhotos }))}
            className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-2",
              filters.noPhotos ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-white text-slate-400 border-slate-100")}>
            <ImageOff size={14}/> Без фото
          </button>
          <button onClick={() => setFilters(f => ({ ...f, lowTrust: !f.lowTrust }))}
            className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-2",
              filters.lowTrust ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-400 border-slate-100")}>
            <ShieldAlert size={14}/> Low Trust Score
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="pl-8 py-5 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-brand-blue">
                    {selectedIds.length === filteredCars.length && filteredCars.length > 0 ? <CheckSquare size={20}/> : <Square size={20}/>}
                  </button>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Автомобіль</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ціна</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Статус</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Аналітика</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trust</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Оновлено</th>
                <th className="pr-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCars.map((car) => (
                <tr key={car.id} className={cn("hover:bg-slate-50/80 transition-all group relative", selectedIds.includes(car.id) && "bg-brand-blue/5")}>
                  <td className="pl-8 py-4">
                    <button onClick={() => toggleSelect(car.id)} className={cn(selectedIds.includes(car.id) ? "text-brand-blue" : "text-slate-200 hover:text-slate-400")}>
                      {selectedIds.includes(car.id) ? <CheckSquare size={20}/> : <Square size={20}/>}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                        <img src={car.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm group-hover:text-brand-blue transition-colors tracking-tight">{car.make} {car.model}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{car.year} · VIN: {car.vin || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-sm font-black text-slate-900">${car.price?.toLocaleString()}</div>
                    <div className="text-[9px] text-green-500 font-black uppercase tracking-tighter mt-0.5">Медіана: $12k</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm",
                      car.status === 'available' ? "bg-green-50 text-green-600 border-green-100" :
                      car.status === 'moderation' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-100 text-slate-500 border-slate-200")}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-900">{car.views || 0}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase">👁️</div>
                      </div>
                      <div className="w-px h-6 bg-slate-100" />
                      <div className="text-center">
                        <div className="text-[10px] font-black text-brand-blue">{car.clicks || 0}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase">📞</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", car.trust_score >= 80 ? "bg-green-500" : car.trust_score >= 50 ? "bg-amber-500" : "bg-red-500")} />
                       <span className="text-[10px] font-black text-slate-900">{car.trust_score || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{car.updated_at ? format(new Date(car.updated_at), 'dd.MM.yy') : '-'}</div>
                    <div className="text-[9px] text-slate-400 font-bold">{car.updated_at ? format(new Date(car.updated_at), 'HH:mm') : '-'}</div>
                  </td>
                  <td className="pr-8 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => setEditingId(car.id)} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 text-slate-400 hover:text-brand-blue hover:shadow-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 text-slate-400 hover:text-red-500 hover:shadow-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
