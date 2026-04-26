import React, { useState, useEffect } from 'react';
import { 
  Check, ChevronRight, ChevronLeft, Save, 
  Camera, Sparkles, Search, Globe, 
  Gauge, Info, AlertCircle, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface CarFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function CarForm({ initialData, onSave, onCancel }: CarFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    make: '', model: '', year: new Date().getFullYear(), price: '',
    engine: '', transmission: '', mileage: '', fuel: '',
    images: [], description: '', seo_title: '', seo_description: '',
    status: 'moderation'
  });

  const steps = [
    { id: 1, label: 'Основне', icon: <Info size={16} /> },
    { id: 2, label: 'Характеристики', icon: <Gauge size={16} /> },
    { id: 3, label: 'Фото', icon: <Camera size={16} /> },
    { id: 4, label: 'Опис + SEO', icon: <Globe size={16} /> },
  ];

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // AI Mocks
  const aiImproveDescription = () => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), {
      loading: 'AI покращує опис...',
      success: 'Опис покращено!',
      error: 'Помилка AI'
    });
    updateField('description', formData.description + '\n\nАвтомобіль у відмінному стані, пройшов повну перевірку. Готовий до будь-яких випробувань на дорозі!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
      {/* Left Side: Wizard Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Progress Header */}
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={cn(
                  "flex items-center gap-3 transition-all",
                  step >= s.id ? "text-brand-blue" : "text-slate-300"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2",
                    step === s.id ? "border-brand-blue bg-white shadow-lg shadow-brand-blue/20" : 
                    step > s.id ? "bg-brand-blue border-brand-blue text-white" : "border-slate-200"
                  )}>
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <span className={cn("text-xs font-black uppercase tracking-widest hidden md:block", step === s.id && "text-slate-900")}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <div className="h-px w-8 bg-slate-200 mx-2" />}
              </React.Fragment>
            ))}
          </div>

          <div className="p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-black text-slate-900">Основні дані</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Марка</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      placeholder="Напр. BMW"
                      value={formData.make}
                      onChange={(e) => updateField('make', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Модель</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      placeholder="Напр. X5"
                      value={formData.model}
                      onChange={(e) => updateField('model', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Рік</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      value={formData.year}
                      onChange={(e) => updateField('year', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ціна ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-brand-blue focus:border-brand-blue focus:bg-white outline-none transition-all"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specs */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-black text-slate-900">Характеристики</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Двигун</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      placeholder="3.0 Diesel"
                      value={formData.engine}
                      onChange={(e) => updateField('engine', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Коробка</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      value={formData.transmission}
                      onChange={(e) => updateField('transmission', e.target.value)}
                    >
                      <option value="">Виберіть...</option>
                      <option value="Automatic">Автомат</option>
                      <option value="Manual">Механіка</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Пробіг (км)</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      placeholder="0"
                      value={formData.mileage}
                      onChange={(e) => updateField('mileage', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Паливо</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand-blue focus:bg-white outline-none transition-all"
                      value={formData.fuel}
                      onChange={(e) => updateField('fuel', e.target.value)}
                    >
                      <option value="">Виберіть...</option>
                      <option value="Petrol">Бензин</option>
                      <option value="Diesel">Дизель</option>
                      <option value="Electric">Електро</option>
                      <option value="Hybrid">Гібрид</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Завантаження фото</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Макс 20 фото</span>
                </div>
                <div className="border-4 border-dashed border-slate-100 rounded-3xl p-12 text-center space-y-4 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto">
                    <Camera size={32} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Клікніть або перетягніть фото</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Формати: JPG, PNG, WebP · До 10MB</p>
                  </div>
                </div>
                {/* Mock Images List */}
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden relative group">
                      <img src="https://via.placeholder.com/150" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="text-white font-black text-[10px] uppercase">Видалити</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Description & SEO */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Опис та SEO</h2>
                  <button 
                    onClick={aiImproveDescription}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                  >
                    <Sparkles size={14} /> AI: Покращити опис
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Опис автомобіля</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-blue/5 focus:bg-white transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Розкажіть про стан, комплектацію та особливості..."
                  />
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Globe size={16} className="text-brand-blue" />
                      <span className="text-[10px] font-black uppercase tracking-widest">SEO Налаштування</span>
                    </div>
                    <button className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:text-white transition-colors">
                      [AI: Згенерувати SEO]
                    </button>
                  </div>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-blue transition-all"
                    placeholder="SEO Заголовок"
                    value={formData.seo_title}
                  />
                  <textarea 
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-blue transition-all resize-none"
                    placeholder="SEO Опис (Meta Description)"
                    value={formData.seo_description}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <div className="flex gap-3">
              <button onClick={onCancel} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-all">
                Скасувати
              </button>
              {step < 4 ? (
                <button 
                  onClick={handleNext}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                >
                  Далі <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => onSave(formData)}
                  className="px-8 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/20"
                >
                  Зберегти <Save size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Live Preview */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Eye size={16} className="text-brand-blue" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Preview</span>
          </div>
          
          {/* Mock Car Card Preview */}
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-2xl scale-[0.98] origin-top">
            <div className="relative aspect-[4/3] bg-slate-100">
              <img src="https://via.placeholder.com/400x300" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                {formData.year || '2024'}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {formData.make || 'Марка'} {formData.model || 'Модель'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                    {formData.engine || 'Характеристики'}
                  </p>
                </div>
                <div className="text-xl font-black text-brand-blue tracking-tighter">
                  ${Number(formData.price).toLocaleString() || '0'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">{formData.mileage || '0'} км</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">{formData.transmission || 'КПП'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  Детальніше
                </button>
              </div>
            </div>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={18} className="text-brand-blue shrink-0 mt-0.5" />
            <div className="text-[10px] font-bold text-brand-blue/80 leading-relaxed uppercase tracking-wider">
              Тут ви бачите, як картка виглядатиме в каталозі. Всі зміни відображаються миттєво.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
