import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronRight, ChevronLeft, Save, 
  Camera, Sparkles, Search, Globe, 
  Gauge, Info, AlertCircle, Eye, Zap, Trash2, X,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

// Довідник даних (Розширений)
const CAR_DATA = {
  makes: [
    'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen', 'Lexus', 'Toyota',
    'Land Rover', 'Tesla', 'Ford', 'Hyundai', 'Kia', 'Volvo', 'Mazda', 'Nissan',
    'Jeep', 'Skoda', 'Honda', 'Mitsubishi', 'Chevrolet'
  ],
  models: {
    'BMW': ['X5', 'X7', 'M5', '5 Series', '7 Series', 'X3', 'X6', 'iX', 'i7'],
    'Mercedes-Benz': ['GLE', 'GLS', 'S-Class', 'E-Class', 'G-Wagon', 'GLC', 'EQS', 'AMG GT'],
    'Audi': ['Q7', 'Q8', 'A6', 'A8', 'RS6', 'e-tron', 'Q5'],
    'Porsche': ['Cayenne', 'Panamera', '911', 'Taycan', 'Macan'],
    'Volkswagen': ['Touareg', 'Tiguan', 'Golf', 'Passat', 'ID.4', 'ID.6', 'Arteon'],
    'Lexus': ['RX', 'LX', 'GX', 'ES', 'NX', 'LS'],
    'Toyota': ['Land Cruiser', 'Prado', 'Camry', 'RAV4', 'Highlander', 'Sequoia'],
    'Land Rover': ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Velar'],
    'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
    'Ford': ['Mustang', 'F-150', 'Explorer', 'Edge', 'Focus'],
    'Hyundai': ['Palisade', 'Santa Fe', 'Tucson', 'Ioniq 5', 'Ioniq 6', 'Sonata'],
    'Kia': ['Sportage', 'Sorento', 'EV6', 'Telluride', 'K5', 'Stinger'],
    'Volvo': ['XC90', 'XC60', 'S90', 'V90 Cross Country'],
    'Mazda': ['CX-5', 'CX-9', 'CX-60', 'CX-90', 'Mazda 6'],
    'Skoda': ['Kodiaq', 'Superb', 'Octavia', 'Enyaq'],
  },
  years: Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i),
  engines: ['2.0', '2.5', '3.0', '4.0', '4.4', '5.0', 'Electric', 'Hybrid']
};

export default function CarForm({ initialData, onSave, onCancel }: any) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    make: '', model: '', year: 2024, price: '',
    vin: '', 
    engine: '', transmission: 'Automatic', mileage: '', fuel: 'Diesel',
    images: [] as string[], description: '', seo_title: '', seo_description: '',
    trust_score: 0, status: 'moderation'
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading('Завантаження фото...');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `cars/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('cars-media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('cars-media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      toast.success('Фото завантажено!', { id: toastId });
    } catch (error: any) {
      toast.error('Помилка завантаження: ' + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px] bg-slate-50/30 p-4 rounded-[40px]">
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
             <div className="absolute bottom-0 left-0 h-1 bg-brand-blue/10 w-full" />
             <motion.div className="absolute bottom-0 left-0 h-1 bg-brand-blue z-10" initial={{ width: '25%' }} animate={{ width: `${(step / 4) * 100}%` }} />
             {[1, 2, 3, 4].map((s) => (
               <div key={s} className="flex items-center gap-3 z-20">
                 <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all", step >= s ? "bg-brand-blue text-white shadow-lg" : "bg-slate-50 text-slate-300")}>
                   {step > s ? <Check size={18} /> : s}
                 </div>
               </div>
             ))}
          </div>

          <div className="p-10 min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {step === 1 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900">Крок 1: Основне</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Марка</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.make} onChange={e => { updateField('make', e.target.value); updateField('model', ''); }}>
                          <option value="">Виберіть марку...</option>
                          {CAR_DATA.makes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Модель</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.model} onChange={e => updateField('model', e.target.value)} disabled={!formData.make}>
                          <option value="">Виберіть модель...</option>
                          {formData.make && CAR_DATA.models[formData.make as keyof typeof CAR_DATA.models]?.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Рік</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.year} onChange={e => updateField('year', Number(e.target.value))}>
                          {CAR_DATA.years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ціна ($)</label>
                        <input type="number" className="w-full bg-brand-blue/5 border-2 border-brand-blue/10 rounded-2xl px-5 py-4 text-sm font-black text-brand-blue focus:border-brand-blue outline-none transition-all"
                          placeholder="0.00" value={formData.price} onChange={e => updateField('price', e.target.value)} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VIN Код (17 символів)</label>
                        <input type="text" maxLength={17} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all uppercase tracking-widest"
                          placeholder="XXXXXXXXXXXXXXXXX" value={formData.vin} onChange={e => updateField('vin', e.target.value.toUpperCase())} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900">Крок 2: Характеристики</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Двигун</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.engine} onChange={e => updateField('engine', e.target.value)}>
                          {CAR_DATA.engines.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Коробка</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.transmission} onChange={e => updateField('transmission', e.target.value)}>
                          <option value="Automatic">Автомат</option>
                          <option value="Manual">Механіка</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Паливо</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all cursor-pointer"
                          value={formData.fuel} onChange={e => updateField('fuel', e.target.value)}>
                          <option value="Diesel">Дизель</option>
                          <option value="Petrol">Бензин</option>
                          <option value="Electric">Електро</option>
                          <option value="Hybrid">Гібрид</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Пробіг (км)</label>
                        <input type="number" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-black focus:border-brand-blue outline-none transition-all"
                          placeholder="0" value={formData.mileage} onChange={e => updateField('mileage', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-black text-slate-900">Крок 3: Фото</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <label className="aspect-square border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer transition-all">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        {uploading ? <RefreshCw size={24} className="text-brand-blue animate-spin" /> : <Camera size={24} className="text-slate-300" />}
                        <span className="text-[9px] font-black text-slate-400 uppercase">Додати</span>
                      </label>
                      {formData.images.map((url, i) => (
                        <div key={i} className="aspect-square rounded-3xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900">Крок 4: Опис</h2>
                    <textarea className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] p-8 text-sm font-medium focus:bg-white focus:border-brand-blue transition-all outline-none resize-none" 
                      rows={8} placeholder="Розкажіть про авто..." value={formData.description} onChange={e => updateField('description', e.target.value)} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-between">
             <button onClick={() => step > 1 && setStep(step - 1)} className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2", step === 1 ? "opacity-0" : "text-slate-400 hover:text-slate-900")}>
               <ChevronLeft size={18} /> Назад
             </button>
             <div className="flex gap-4">
                <button onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500">Скасувати</button>
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">Далі <ChevronRight size={18} /></button>
                ) : (
                  <button onClick={() => onSave(formData)} className="px-10 py-4 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-blue/30">Зберегти <Save size={18} /></button>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="w-[400px] shrink-0">
        <div className="sticky top-24 bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
           <div className="relative aspect-[16/10] bg-slate-100">
             <img src={formData.images[0] || 'https://via.placeholder.com/600x400'} className="w-full h-full object-cover" />
             <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest">{formData.year}</div>
           </div>
           <div className="p-8 space-y-4">
              <h3 className="text-2xl font-black text-slate-900">{formData.make || 'Марка'} {formData.model || 'Модель'}</h3>
              <div className="text-2xl font-black text-brand-blue">${Number(formData.price).toLocaleString()}</div>
              {formData.vin && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-brand-blue rounded-full" />
                  VIN: {formData.vin}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Gauge size={14}/> {formData.mileage || '0'} KM</div>
                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Zap size={14}/> {formData.engine || '—'}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
