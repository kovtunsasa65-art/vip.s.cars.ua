import React, { useState, useEffect } from 'react';
import { Search, Globe, Tag, AlertTriangle, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface SeoItem {
  id: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  last_updated: string;
}

export default function SeoManager() {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const loadSeoData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_metadata')
      .select('*')
      .order('url', { ascending: true });
    
    if (error) toast.error('Помилка завантаження SEO');
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSeoData();
  }, []);

  const handleUpdate = async (id: string, updates: Partial<SeoItem>) => {
    setBusy(id);
    const { error } = await supabase
      .from('seo_metadata')
      .update(updates)
      .eq('id', id);
    
    if (error) toast.error('Не вдалося зберегти');
    else toast.success('SEO оновлено');
    setBusy(null);
  };

  const filteredItems = items.filter(i => 
    i.url.toLowerCase().includes(search.toLowerCase()) || 
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">🔍 SEO Оптимізація</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Керування мета-тегами та пошуковими параметрами</p>
        </div>
        <button 
          onClick={loadSeoData} 
          className="p-2 text-slate-400 hover:text-brand-blue transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Пошук за URL або заголовком..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-slate-50/30 transition-colors space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
                    <Globe size={16} />
                  </div>
                  <span className="font-black text-slate-900 text-sm">{item.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!item.title || !item.description ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      <AlertTriangle size={10} /> Потребує уваги
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      <CheckCircle2 size={10} /> Оптимізовано
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Title</label>
                  <input 
                    defaultValue={item.title}
                    onBlur={(e) => e.target.value !== item.title && handleUpdate(item.id, { title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-brand-blue outline-none transition-all"
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] text-slate-400 font-bold">Рекомендовано: 50-60 символів</span>
                    <span className={item.title.length > 60 ? 'text-red-500' : 'text-slate-400'}>{item.title.length}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
                  <input 
                    defaultValue={item.keywords}
                    onBlur={(e) => e.target.value !== item.keywords && handleUpdate(item.id, { keywords: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-brand-blue outline-none transition-all"
                  />
                </div>

                <div className="col-span-full space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                  <textarea 
                    defaultValue={item.description}
                    onBlur={(e) => e.target.value !== item.description && handleUpdate(item.id, { description: e.target.value })}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-brand-blue outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] text-slate-400 font-bold">Рекомендовано: 150-160 символів</span>
                    <span className={item.description.length > 160 ? 'text-red-500' : 'text-slate-400'}>{item.description.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
