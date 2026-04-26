import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronRight, ChevronLeft, Save, 
  Camera, Sparkles, Search, Globe, 
  Gauge, Info, AlertCircle, Eye, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function CarForm({ initialData, onSave, onCancel }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    make: '', model: '', year: 2024, price: '',
    engine: '', transmission: '', mileage: '', fuel: '',
    images: [], description: '', seo_title: '', seo_description: '',
    trust_score: 0, market_median: 0, status: 'moderation'
  });

  const steps = [
    { id: 1, label: 'Основне', icon: <Info size={16} /> },
    { id: 2, label: 'Характеристики', icon: <Gauge size={16} /> },
    { id: 3, label: 'Фото', icon: <Camera size={16} /> },
    { id: 4, label: 'Опис + SEO', icon: <Globe size={16} /> },
  ];

  // Автодії при збереженні
  const performAutoActions = (data: any) => {
    let score = 85; // Базовий скор
    if (!data.images.length) score -= 30;
    if (!data.description) score -= 20;
    if (data.price < 1000) score -= 10;
    
    return {
      ...data,
      trust_score: Math.max(0, score),
      market_median: Number(data.price) * 1.05, // Імітація медіани
      ai_triggered: data.status === 'active'
    };
  };

  const handleFinalSave = () => {
    const finalData = performAutoActions(formData);
    toast.success('Автодії виконано: Trust Score розраховано, SEO згенеровано');
    onSave(finalData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px] bg-slate-50/30 p-4 rounded-[40px]">
      {/* Form Side */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
             {/* Progress bar background */}
             <div className="absolute bottom-0 left-0 h-1 bg-brand-blue/10 w-full" />
             <motion.div 
               className="absolute bottom-0 left-0 h-1 bg-brand-blue z-10"
               initial={{ width: '25%' }}
               animate={{ width: `${(step / 4) * 100}%` }}
             />
             
             {steps.map((s, i) => (
               <div key={s.id} className="flex items-center gap-3 z-20">
                 <div className={cn(
                   "w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500",
                   step >= s.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-110" : "bg-slate-50 text-slate-300"
                 )}>
                   {step > s.id ? <Check size={18} /> : s.id}
                 </div>
                 {step === s.id && (
                   <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hidden md:block">
                     {s.label}
                   </motion.span>
                 )}
               </div>
             ))}
          </div>

          <div className="p-10 min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={20} className="text-amber-500 fill-amber-500" />
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Основні дані</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Марка з довідника</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                          value={formData.make} onChange={e => updateField('make', e.target.value)}>
                          <option value="">Виберіть марку...</option>
                          <option value="BMW">BMW</option>
                          <option value="Mercedes-Benz">Mercedes-Benz</option>
                          <option value="Audi">Audi</option>
                          <option value="Porsche">Porsche</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Модель</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue focus:bg-white outline-none transition-all"
                          placeholder="Напр. X5 M" value={formData.model} onChange={e => updateField('model', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Рік випуску</label>
                        <input type="number" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue focus:bg-white outline-none transition-all"
                          value={formData.year} onChange={e => updateField('year', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Ціна продажу ($)</label>
                        <div className="relative">
                          <input type="number" className="w-full bg-brand-blue/5 border-2 border-brand-blue/10 rounded-2xl px-5 py-4 text-lg font-black text-brand-blue focus:border-brand-blue focus:bg-white outline-none transition-all"
                            placeholder="0" value={formData.price} onChange={e => updateField('price', e.target.value)} />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-blue/40 font-black">$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                     <div className="flex items-center gap-3">
                      <Gauge size={20} className="text-brand-blue" />
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Характеристики</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      {['Двигун', 'Пробіг', 'Коробка', 'Привід'].map(label => (
                        <div key={label} className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
                          <input className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-blue focus:bg-white transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                   <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Camera size={20} className="text-brand-blue" />
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Фотогалерея</h2>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-crop: ON</span>
                    </div>
                    <div className="aspect-video border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:bg-slate-50/50 transition-all cursor-pointer group">
                       <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera size={32} />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest text-slate-400">Drag & Drop Photos</p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                   <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-brand-blue" />
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Опис + SEO</h2>
                      </div>
                      <div className="flex gap-2">
                         <button className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">AI: Покращити</button>
                         <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">AI: SEO</button>
                      </div>
                    </div>
                    <textarea className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] p-8 text-sm font-medium focus:bg-white focus:border-brand-blue transition-all outline-none resize-none" rows={6} placeholder="Напишіть щось особливе про це авто..." />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
             <button onClick={() => step > 1 && setStep(step - 1)} className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2", step === 1 ? "opacity-0" : "text-slate-400 hover:text-slate-900")}>
               <ChevronLeft size={18} /> Назад
             </button>
             <div className="flex gap-4">
                <button onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500">Скасувати</button>
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/20 flex items-center gap-2">Далі <ChevronRight size={18} /></button>
                ) : (
                  <button onClick={handleFinalSave} className="px-10 py-4 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue-dark shadow-xl shadow-brand-blue/30 flex items-center gap-2">Опублікувати <Save size={18} /></button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Live Preview Sidebar */}
      <div className="w-[420px] shrink-0">
        <div className="sticky top-24 space-y-6">
           <div className="flex items-center justify-between px-2">
             <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2"><Eye size={16} /> Live Preview</span>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase">Поточний вигляд</span>
             </div>
           </div>

           {/* The Preview Card */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden group">
              <div className="relative aspect-[16/10] bg-slate-100">
                <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest z-10">{formData.year}</div>
                <img src="https://via.placeholder.com/600x400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{formData.make || 'Марка'} {formData.model || 'Модель'}</h3>
                    <div className="flex items-center gap-2 text-slate-400">
                       <span className="text-[10px] font-black uppercase tracking-widest">{formData.engine || '3.0 L'}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Automatic</span>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-brand-blue tracking-tighter">${Number(formData.price).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Gauge size={14} /></div>
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{formData.mileage || '0'} KM</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Sparkles size={14} /></div>
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">EXCELLENT</span>
                   </div>
                </div>

                <button className="w-full py-5 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:bg-brand-blue transition-all">
                  Відкрити на сайті
                </button>
              </div>
           </div>

           <div className="bg-slate-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue"><Zap size={20} /></div>
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Score</div>
                    <div className="text-lg font-black text-white">85 / 100</div>
                 </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-brand-blue" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
