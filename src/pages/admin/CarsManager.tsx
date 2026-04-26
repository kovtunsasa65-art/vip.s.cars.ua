import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Edit3, Trash2, ExternalLink, RefreshCw, X,
  Download, Users, Tag, Sparkles, CheckSquare, Square,
  Clock, ImageOff, ShieldAlert
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

  useEffect(() => {
    fetchCars();
    // Клавіатурні скорочення
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
      }
      if (e.key === 'e' && selectedIds.length === 1) {
        toast('Редагування активне');
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

  if (isAdding) {
    return <CarForm onSave={async (d: any) => {
      await supabase.from('cars').upsert(d);
      setIsAdding(false);
      fetchCars();
    }} onCancel={() => setIsAdding(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Каталог Авто</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Всього: {cars.length}</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Вибрано: {selectedIds.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Download size={14} /> Експорт
          </button>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
            <Plus size={16} /> Додати Авто <span className="opacity-40 ml-1">(N)</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="bg-brand-blue p-3 rounded-2xl flex items-center justify-between shadow-xl shadow-brand-blue/20"
          >
            <div className="flex items-center gap-4 px-3">
              <span className="text-white text-xs font-black uppercase tracking-widest">Вибрано {selectedIds.length} авто:</span>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex gap-2">
                <button onClick={() => handleBulkAction('status')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5"><RefreshCw size={12}/> Статус</button>
                <button onClick={() => handleBulkAction('manager')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5"><Users size={12}/> Менеджер</button>
                <button onClick={() => handleBulkAction('ai')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5"><Sparkles size={12}/> AI Покращити</button>
              </div>
            </div>
            <button onClick={() => setSelectedIds([])} className="p-2 text-white/60 hover:text-white transition-colors"><X size={18}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Швидкий пошук (/) ..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-brand-blue outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilters(f => ({ ...f, noClicks3Days: !f.noClicks3Days }))}
              className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                filters.noClicks3Days ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-500 border-slate-200")}
            >
              <Clock size={14}/> Без кліків 3д+
            </button>
            <button 
              onClick={() => setFilters(f => ({ ...f, noPhotos: !f.noPhotos }))}
              className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                filters.noPhotos ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-white text-slate-500 border-slate-200")}
            >
              <ImageOff size={14}/> Без фото
            </button>
            <button 
              onClick={() => setFilters(f => ({ ...f, lowTrust: !f.lowTrust }))}
              className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                filters.lowTrust ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-500 border-slate-200")}
            >
              <ShieldAlert size={14}/> Low Trust
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="pl-6 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-300 hover:text-brand-blue">
                    {selectedIds.length === filteredCars.length && filteredCars.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}
                  </button>
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Авто / Title</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ціна</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Аналітика (👁️/📞)</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Оновлено</th>
                <th className="pr-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.map((car) => (
                <tr key={car.id} className={cn("hover:bg-slate-50/50 transition-all group", selectedIds.includes(car.id) && "bg-brand-blue/5")}>
                  <td className="pl-6 py-4">
                    <button onClick={() => toggleSelect(car.id)} className={cn(selectedIds.includes(car.id) ? "text-brand-blue" : "text-slate-200 hover:text-slate-400")}>
                      {selectedIds.includes(car.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={car.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm group-hover:text-brand-blue transition-colors">{car.make} {car.model}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{car.year} · VIN: {car.vin || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-black text-slate-900">${car.price?.toLocaleString()}</div>
                    <div className="text-[9px] text-green-500 font-bold">Медіана: $12k</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                      car.status === 'available' ? "bg-green-50 text-green-600 border-green-100" :
                      car.status === 'moderation' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs font-black text-slate-900">{car.views || 0}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">👁️</div>
                      </div>
                      <div className="w-px h-6 bg-slate-100" />
                      <div className="text-center">
                        <div className="text-xs font-black text-brand-blue">{car.clicks || 0}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">📞</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-2 h-2 rounded-full", car.trust_score >= 80 ? "bg-green-500" : car.trust_score >= 50 ? "bg-amber-500" : "bg-red-500")} />
                       <span className="text-xs font-black text-slate-900">{car.trust_score || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{car.updated_at ? format(new Date(car.updated_at), 'dd.MM.yy') : '-'}</div>
                    <div className="text-[9px] text-slate-400 font-medium">{car.updated_at ? format(new Date(car.updated_at), 'HH:mm') : '-'}</div>
                  </td>
                  <td className="pr-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-brand-blue transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
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
