import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertCircle, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModerationManager() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModerationCars();
  }, []);

  const fetchModerationCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'moderation')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Помилка завантаження: ' + error.message);
    } else {
      setCars(data || []);
    }
    setLoading(false);
  };

  const handleAction = async (id: number, newStatus: string) => {
    const toastId = toast.loading('Оновлення статусу...');
    
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(
        newStatus === 'available' ? 'Оголошення опубліковано!' :
        newStatus === 'revision' ? 'Надіслано на доопрацювання' : 'Оголошення відхилено',
        { id: toastId }
      );

      // Видаляємо зі списку локально
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      toast.error('Помилка: ' + error.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw size={40} className="text-brand-blue animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Завантаження модерації...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Модерація</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Перевірка оголошень від клієнтів</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-brand-blue/5 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-blue/10 flex items-center gap-2">
              <Clock size={14} /> {cars.length} авто очікують
           </div>
           <button onClick={fetchModerationCars} className="p-2 text-slate-400 hover:text-brand-blue transition-colors">
              <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">Черга порожня</h3>
           <p className="text-slate-400 text-sm font-medium max-w-xs">Наразі немає нових оголошень, що потребують вашої уваги.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {cars.map((car) => (
              <motion.div 
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="w-full lg:w-80 aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative border border-slate-100">
                   <img src={car.images?.[0] || 'https://via.placeholder.com/400x250'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest italic">
                     ID: #{car.id}
                   </div>
                   {car.source === 'client_form' && (
                     <div className="absolute bottom-4 right-4 px-2 py-1 bg-brand-blue text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">
                       Від клієнта
                     </div>
                   )}
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{car.make} {car.model} · {car.year}</h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                          {format(new Date(car.created_at), 'dd MMMM, HH:mm')} · Ціна: ${car.price?.toLocaleString()}
                        </p>
                      </div>
                      <a href={`/cars/${car.id}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-400 hover:text-brand-blue rounded-xl transition-all">
                        <ExternalLink size={18} />
                      </a>
                   </div>

                   {car.vin && (
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[9px] font-black text-slate-400 uppercase">VIN:</span>
                        <span className="text-[10px] font-black text-slate-900 tracking-widest">{car.vin}</span>
                     </div>
                   )}

                   <div className="p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                      <div className="flex items-center gap-2 text-brand-blue mb-1">
                         <ShieldCheck size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Параметри:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Пробіг: {car.mileage} км</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Двигун: {car.engine}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">КПП: {car.transmission}</div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Паливо: {car.fuel}</div>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2 pt-2">
                      <button 
                        onClick={() => handleAction(car.id, 'available')}
                        className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-green-500/20"
                      >
                        <Check size={14} /> Опублікувати
                      </button>
                      <button 
                        onClick={() => handleAction(car.id, 'revision')}
                        className="px-8 py-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-amber-600 hover:border-amber-200 transition-all"
                      >
                        На доопрацювання
                      </button>
                      <button 
                        onClick={() => handleAction(car.id, 'rejected')}
                        className="px-8 py-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-200 transition-all flex items-center gap-2"
                      >
                        <X size={14} /> Відхилити
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
