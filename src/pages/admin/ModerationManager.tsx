import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Eye, 
  MessageSquare, Layers, TrendingDown,
  ArrowRight, Search, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function ModerationManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  useEffect(() => {
    fetchModerationItems();
  }, []);

  const fetchModerationItems = async () => {
    setLoading(true);
    // Fetch cars with status 'moderation'
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'moderation')
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleAction = async (id: number, status: string, reason?: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ 
        status, 
        moderation_note: reason || null,
        published_at: status === 'available' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      toast.error('Помилка оновлення');
    } else {
      toast.success(status === 'available' ? 'Опубліковано!' : 'Статус оновлено');
      fetchModerationItems();
      setShowRejectModal(null);
    }
  };

  // Mock AI Logic for demonstration (in real app this would come from a backend function)
  const getAiHints = (car: any) => {
    const hints = [];
    if (car.price < 5000) hints.push({ type: 'price', text: 'Ціна нижче ринку на 40% — перевірте' });
    if (items.some(i => i.id !== car.id && i.vin === car.vin && car.vin)) {
      hints.push({ type: 'duplicate', text: `Ймовірно дублікат #${items.find(i => i.vin === car.vin).id}` });
    }
    return hints;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">🛡️ Модерація Контенту</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Перевірка нових оголошень перед публікацією</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl border border-brand-blue/20">
          <Layers size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{items.length} авто чекають</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h3 className="font-black text-slate-900">Черга порожня</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Всі оголошення перевірені. Гарна робота!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((car) => {
            const aiHints = getAiHints(car);
            return (
              <div key={car.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="relative h-48 overflow-hidden group">
                  <img 
                    src={car.images?.[0] || 'https://via.placeholder.com/400x300'} 
                    alt={car.make} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                      ID: {car.id}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{car.make} {car.model}</h3>
                    <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{car.year} · {car.engine} · {car.price}$</div>
                  </div>

                  {aiHints.length > 0 && (
                    <div className="space-y-2">
                      {aiHints.map((hint, i) => (
                        <div key={i} className={cn(
                          "flex items-start gap-2 p-2 rounded-xl text-[10px] font-bold leading-tight",
                          hint.type === 'price' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
                        )}>
                          {hint.type === 'price' ? <TrendingDown size={14} className="shrink-0" /> : <Layers size={14} className="shrink-0" />}
                          {hint.text}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4">
                    <button 
                      onClick={() => handleAction(car.id, 'available')}
                      className="w-full py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Опублікувати
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setShowRejectModal(car.id)}
                        className="py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Відхилити
                      </button>
                      <button 
                        onClick={() => handleAction(car.id, 'revision')}
                        className="py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/10 hover:text-brand-blue transition-all"
                      >
                        Доопрацювати
                      </button>
                    </div>
                  </div>
                </div>

                {showRejectModal === car.id && (
                  <div className="absolute inset-0 bg-white p-6 z-10 flex flex-col justify-center space-y-4">
                    <h4 className="font-black text-slate-900 text-center uppercase tracking-wider">Причина відхилення</h4>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs focus:ring-4 focus:ring-red-500/5 outline-none resize-none"
                      rows={4}
                      placeholder="Наприклад: Неякісні фото, некоректна ціна..."
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowRejectModal(null)}
                        className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400"
                      >
                        Скасувати
                      </button>
                      <button 
                        onClick={() => handleAction(car.id, 'rejected', selectedReason)}
                        className="flex-1 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Підтвердити
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
