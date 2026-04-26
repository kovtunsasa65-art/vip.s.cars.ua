import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Trash2, CheckCircle2, Phone, Car, Gauge, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BRANDS = ['BMW', 'Toyota', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Honda',
  'Hyundai', 'Kia', 'Ford', 'Skoda', 'Renault', 'Peugeot', 'Opel', 'Mazda',
  'Nissan', 'Mitsubishi', 'Subaru', 'Lexus', 'Volvo', 'Інша'];

const TRANSMISSIONS = ['Автомат', 'Механіка', 'Варіатор', 'Робот'];

export default function BuybackModal({ isOpen, onClose }: BuybackModalProps) {
  const [step, setStep]           = useState(1); // 1=дані, 2=фото, 3=успіх
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages]       = useState<File[]>([]);
  const [previews, setPreviews]   = useState<string[]>([]);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    phone:        '',
    brand:        '',
    model:        '',
    engineVolume: '',
    transmission: '',
    mileage:      '',
    year:         '',
    description:  '',
    telegram:     '',
  });

  // Блокуємо скрол фону
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Скидаємо форму при закритті
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setForm({ phone:'', brand:'', model:'', engineVolume:'', transmission:'', mileage:'', year:'', description:'', telegram:'' });
        setImages([]);
        setPreviews([]);
      }, 300);
    }
  }, [isOpen]);

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
      // Зберігаємо в leads
      await supabase.from('leads').insert([{
        type:    'викуп',
        name:    `Викуп: ${form.brand} ${form.model}`,
        phone:   form.phone,
        telegram: form.telegram,
        car_brand: form.brand,
        car_model: form.model,
        message: [
          form.brand        && `Марка: ${form.brand}`,
          form.model        && `Модель: ${form.model}`,
          form.year         && `Рік: ${form.year}`,
          form.engineVolume && `Об'єм: ${form.engineVolume}л`,
          form.transmission && `КПП: ${form.transmission}`,
          form.mileage      && `Пробіг: ${form.mileage} тис.км`,
          form.telegram     && `Telegram: @${form.telegram.replace('@', '')}`,
          form.description  && `Опис: ${form.description}`,
        ].filter(Boolean).join('\n'),
        source:  'сайт / форма викупу',
        status:  'новий',
        score:   'гарячий',
      }]);

      // Telegram повідомлення + фото
      const text = [
        '<b>💰 ЗАЯВКА НА ВИКУП АВТО!</b>',
        '───────────────────',
        `📞 <b>Тел:</b> <a href="tel:${form.phone}">${form.phone}</a>`,
        form.telegram     && `✈️ <b>Telegram:</b> @${form.telegram.replace('@', '')}`,
        form.brand        && `🚗 <b>Марка:</b> ${form.brand}`,
        form.model        && `🚙 <b>Модель:</b> ${form.model}`,
        form.year         && `📅 <b>Рік:</b> ${form.year}`,
        form.engineVolume && `⚙️ <b>Об'єм:</b> ${form.engineVolume} л`,
        form.transmission && `🔧 <b>КПП:</b> ${form.transmission}`,
        form.mileage      && `📍 <b>Пробіг:</b> ${form.mileage} тис. км`,
        form.description  && `💬 <b>Опис:</b> ${form.description}`,
        '───────────────────',
        `<i>VIP.S CARS • ${new Date().toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</i>`,
      ].filter(Boolean).join('\n');

      await fetch('/api/notify-buyback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, photos: previews }),
      });

      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Помилка відправки. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900">Викуп вашого авто</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Оцінка за 1 годину • Оплата одразу</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Steps indicator */}
            {step < 3 && (
              <div className="flex px-5 pt-4 gap-2 shrink-0">
                {[1, 2].map(s => (
                  <div key={s} className={cn('flex-1 h-1 rounded-full transition-colors', step >= s ? 'bg-brand-blue' : 'bg-slate-100')} />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">

              {/* КРОК 1 — Дані авто */}
              {step === 1 && (
                <form id="step1" onSubmit={e => { e.preventDefault(); setStep(2); }} className="p-5 space-y-4">

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      <Phone size={11} className="inline mr-1" />Телефон *
                    </label>
                    <input required type="tel" value={form.phone} onChange={set('phone')}
                      placeholder="+380" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      Логін Telegram (необов'язково)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                      <input type="text" value={form.telegram} onChange={set('telegram')}
                        placeholder="username" className={cn(inputClass, "pl-9")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                        <Car size={11} className="inline mr-1" />Марка *
                      </label>
                      <select required value={form.brand} onChange={set('brand')} className={cn(inputClass, 'appearance-none')}>
                        <option value="">Марка</option>
                        {BRANDS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Модель *</label>
                      <input required type="text" value={form.model} onChange={set('model')}
                        placeholder="Напр: X5" className={inputClass} />
                    </div>
                  </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Рік</label>
                      <input type="number" value={form.year} onChange={set('year')}
                        placeholder="2018" min="1990" max="2025" className={inputClass} />
                    </div>
                  

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                        <Gauge size={11} className="inline mr-1" />Об'єм двигуна, л
                      </label>
                      <input type="text" value={form.engineVolume} onChange={set('engineVolume')}
                        placeholder="2.0" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                        <Settings size={11} className="inline mr-1" />КПП
                      </label>
                      <select value={form.transmission} onChange={set('transmission')} className={cn(inputClass, 'appearance-none')}>
                        <option value="">Оберіть</option>
                        {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Пробіг, тис. км</label>
                    <input type="number" value={form.mileage} onChange={set('mileage')}
                      placeholder="150" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">Короткий опис стану</label>
                    <textarea value={form.description} onChange={set('description')}
                      placeholder="Стан авто, що є, що потребує уваги..."
                      rows={3} className={cn(inputClass, 'resize-none')} />
                  </div>
                </form>
              )}

              {/* КРОК 2 — Фото */}
              {step === 2 && (
                <div className="p-5 space-y-4">
                  <p className="text-sm text-slate-500">Додайте фото авто — так ми зможемо оцінити точніше (до 10 фото)</p>

                  {/* Зона завантаження */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
                  >
                    <Upload size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-500">Натисніть або перетягніть фото</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG до 10 МБ кожне</p>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => addFiles(e.target.files)} />
                  </div>

                  {/* Превью фото */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* КРОК 3 — Успіх */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 flex flex-col items-center justify-center text-center h-full"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Заявку відправлено!</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Наш менеджер зв'яжеться з вами найближчим часом для оцінки авто.
                  </p>
                  {previews.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">Фото ({previews.length} шт.) — відправлено</p>
                  )}
                  <button onClick={onClose} className="mt-6 bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-blue-dark transition-colors">
                    Закрити
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer кнопки */}
            {step < 3 && (
              <div className="p-5 border-t border-slate-100 shrink-0 flex gap-3">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                    Назад
                  </button>
                )}
                {step === 1 && (
                  <button form="step1" type="submit"
                    className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-dark transition-colors">
                    Далі →
                  </button>
                )}
                {step === 2 && (
                  <button onClick={handleSubmit} disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Відправка...' : previews.length > 0 ? `Відправити з фото (${previews.length})` : 'Відправити без фото'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
