import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Trash2, CheckCircle2, Phone, Car, Gauge, Settings, Send, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface FullBuybackFormProps {
  onSuccess?: () => void;
  embedded?: boolean; // Якщо true - без зайвих відступів та фону
}

const BRANDS = ['BMW', 'Toyota', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Honda',
  'Hyundai', 'Kia', 'Ford', 'Skoda', 'Renault', 'Peugeot', 'Opel', 'Mazda',
  'Nissan', 'Mitsubishi', 'Subaru', 'Lexus', 'Volvo', 'Інша'];

const TRANSMISSIONS = ['Автомат', 'Механіка', 'Варіатор', 'Робот'];

export default function FullBuybackForm({ onSuccess, embedded = false }: FullBuybackFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    brand: '',
    model: '',
    engineVolume: '',
    transmission: '',
    mileage: '',
    year: '',
    description: '',
    telegram: '',
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - images.length);
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target!.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Зберігаємо в Supabase Leads
      const { error: leadError } = await supabase.from('leads').insert([{
        type: 'викуп',
        name: form.name || `Викуп: ${form.brand} ${form.model}`,
        phone: form.phone,
        telegram: form.telegram,
        car_brand: form.brand,
        car_model: form.model,
        message: [
          form.brand && `Марка: ${form.brand}`,
          form.model && `Модель: ${form.model}`,
          form.year && `Рік: ${form.year}`,
          form.engineVolume && `Об'єм: ${form.engineVolume}л`,
          form.transmission && `КПП: ${form.transmission}`,
          form.mileage && `Пробіг: ${form.mileage} тис.км`,
          form.telegram && `Telegram: @${form.telegram.replace('@', '')}`,
          form.description && `Опис: ${form.description}`,
        ].filter(Boolean).join('\n'),
        source: 'сайт / повна форма',
        status: 'новий',
        score: 'гарячий',
      }]);

      if (leadError) throw leadError;

      // 2. Telegram повідомлення (через API роут)
      const text = [
        '<b>💰 НОВА ЗАЯВКА НА ВИКУП (ПОВНА)</b>',
        '───────────────────',
        `👤 <b>Ім'я:</b> ${form.name || 'Не вказано'}`,
        `📞 <b>Тел:</b> <a href="tel:${form.phone}">${form.phone}</a>`,
        form.telegram && `✈️ <b>Telegram:</b> @${form.telegram.replace('@', '')}`,
        form.brand && `🚗 <b>Марка:</b> ${form.brand}`,
        form.model && `🚙 <b>Модель:</b> ${form.model}`,
        form.year && `📅 <b>Рік:</b> ${form.year}`,
        form.engineVolume && `⚙️ <b>Об'єм:</b> ${form.engineVolume} л`,
        form.transmission && `🔧 <b>КПП:</b> ${form.transmission}`,
        form.mileage && `📍 <b>Пробіг:</b> ${form.mileage} тис. км`,
        form.description && `💬 <b>Опис:</b> ${form.description}`,
        '───────────────────',
        `<i>VIP.S CARS • ${new Date().toLocaleString('uk-UA')}</i>`,
      ].filter(Boolean).join('\n');

      await fetch('/api/notify-buyback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, photos: previews }),
      });

      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('Помилка відправки. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex items-center gap-1.5";

  if (step === 3) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={cn("flex flex-col items-center justify-center text-center py-12", !embedded && "bg-white rounded-3xl border border-slate-100 shadow-sm")}>
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Дякуємо!</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
          Заявку відправлено. Наш менеджер зв'яжеться з вами найближчим часом для оцінки авто.
        </p>
        <button onClick={() => setStep(1)} className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue-dark transition-all shadow-xl shadow-brand-blue/20">
          Відправити ще
        </button>
      </motion.div>
    );
  }

  return (
    <div className={cn(!embedded && "bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden")}>
      {/* Steps indicator */}
      <div className="flex gap-2 p-6 pb-0">
        {[1, 2].map(s => (
          <div key={s} className={cn('flex-1 h-1.5 rounded-full transition-all duration-500', step >= s ? 'bg-brand-blue' : 'bg-slate-100')} />
        ))}
      </div>

      <div className="p-6 md:p-8">
        {step === 1 ? (
          <form id="buyback-step1" onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}><User size={12} />Ваше ім'я *</label>
                <input required type="text" value={form.name} onChange={set('name')} placeholder="Іван" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Phone size={12} />Телефон *</label>
                <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+380" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}><Car size={12} />Марка *</label>
                <select required value={form.brand} onChange={set('brand')} className={cn(inputClass, 'appearance-none')}>
                  <option value="">Оберіть марку</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Модель *</label>
                <input required type="text" value={form.model} onChange={set('model')} placeholder="Напр: X5" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Рік</label>
                <input type="number" value={form.year} onChange={set('year')} placeholder="2018" className={inputClass} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}><Gauge size={12} />Об'єм, л</label>
                <input type="text" value={form.engineVolume} onChange={set('engineVolume')} placeholder="2.0" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}><Settings size={12} />КПП</label>
                <select value={form.transmission} onChange={set('transmission')} className={cn(inputClass, 'appearance-none')}>
                  <option value="">Оберіть КПП</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Пробіг, тис. км</label>
                <input type="number" value={form.mileage} onChange={set('mileage')} placeholder="150" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Логін Telegram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                  <input type="text" value={form.telegram} onChange={set('telegram')} placeholder="username" className={cn(inputClass, "pl-9")} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Короткий опис стану</label>
              <textarea value={form.description} onChange={set('description')} placeholder="Стан авто, пошкодження, комплектація..." rows={3} className={cn(inputClass, 'resize-none')} />
            </div>

            <button type="submit" className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue-dark transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3">
              Далі до фото <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase tracking-tight">Крок 2: Фотографії</h4>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-brand-blue hover:underline">← Назад до даних</button>
            </div>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
            >
              <Upload size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">Натисніть або перетягніть фото авто</p>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">Макс 10 фото • JPG, PNG</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleSubmit} disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
              {isSubmitting ? 'Відправка...' : previews.length > 0 ? `Відправити з фото (${previews.length})` : 'Відправити без фото'}
              <CheckCircle2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
