import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { sendTelegramNotification, formatLeadMessage } from '../services/telegramService';
import FullBuybackForm from './FullBuybackForm';

export default function LeadForm() {
  const [formType, setFormType] = useState<'selection' | 'buyback'>('selection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Зберігаємо в таблицю leads (тільки для selection)
      const { error } = await supabase
        .from('leads')
        .insert([{
          type:    'підбір',
          name:    formData.name,
          phone:   formData.phone,
          message: formData.details,
          source:  'сайт / форма підбору',
          status:  'новий',
          score:   'холодний',
        }]);

      if (error) {
        console.warn('Supabase leads insert error:', error);
      }

      // Telegram сповіщення
      const telegramMessage = formatLeadMessage({
        type:    'підбір',
        name:    formData.name,
        phone:   formData.phone,
        message: formData.details,
        source:  'сайт / форма підбору',
      });
      await sendTelegramNotification(telegramMessage);

      setIsSuccess(true);
      setFormData({ name: '', phone: '', details: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Помилка при відправці. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-12 xl:col-span-5 sticky top-32">
            <div className="mb-4 inline-flex items-center gap-3 text-brand-blue">
              <span className="w-8 h-[2px] bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest">Зворотній зв'язок</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-10">
              ДОПОМОЖЕМО <br/>
              <span className="text-brand-blue">ЗНАЙТИ АБО</span> <br/>
              ПРОДАТИ АВТО
            </h2>
            <p className="text-slate-500 text-lg mb-12 max-w-md leading-relaxed font-medium">
              Залиште ваші контакти, і ми зв'яжемося з вами для детальної консультації щодо підбору або викупу авто.
            </p>

            <div className="grid grid-cols-2 gap-8 py-10 border-t border-slate-100">
               <div className="space-y-2">
                  <div className="text-[10px] font-black text-brand-blue uppercase tracking-widest opacity-50">Крок 01</div>
                  <h4 className="font-bold text-slate-900">Консультація</h4>
                  <p className="text-xs text-slate-400 font-medium">Обговорюємо ваші побажання та бюджет</p>
               </div>
               <div className="space-y-2">
                  <div className="text-[10px] font-black text-brand-blue uppercase tracking-widest opacity-50">Крок 02</div>
                  <h4 className="font-bold text-slate-900">Результат</h4>
                  <p className="text-xs text-slate-400 font-medium">Знаходимо найкращий варіант на ринку</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <div className="bg-slate-50 rounded-[40px] p-6 md:p-10 border border-slate-200 shadow-sm">
              {/* Type Toggle */}
              <div className="inline-flex bg-white rounded-2xl p-1.5 border border-slate-200 mb-10 w-full md:w-auto overflow-hidden shadow-sm">
                <button
                  onClick={() => setFormType('selection')}
                  className={cn(
                    "px-10 py-3.5 rounded-xl text-sm font-black transition-all flex-1 md:flex-none uppercase tracking-wider",
                    formType === 'selection' ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Підбір
                </button>
                <button
                  onClick={() => setFormType('buyback')}
                  className={cn(
                    "px-10 py-3.5 rounded-xl text-sm font-black transition-all flex-1 md:flex-none uppercase tracking-wider",
                    formType === 'buyback' ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Викуп
                </button>
              </div>

              <AnimatePresence mode="wait">
                {formType === 'buyback' ? (
                  <motion.div key="buyback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <FullBuybackForm embedded />
                  </motion.div>
                ) : isSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-50 text-green-500 flex items-center justify-center rounded-full mb-6 border border-green-100">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Дякуємо!</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Наш спеціаліст зв'яжеться з вами найближчим часом для обговорення деталей.</p>
                    <button onClick={() => setIsSuccess(false)} className="mt-8 text-brand-blue font-bold hover:underline">
                      Відправити ще один запит
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ваше ім'я</label>
                          <input required type="text" value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Як до вас звертатися?"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none shadow-sm"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ваш телефон</label>
                          <input required type="tel" value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="+380"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none shadow-sm"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Деталі запиту</label>
                       <textarea required value={formData.details}
                         onChange={(e) => setFormData({...formData, details: e.target.value})}
                         placeholder="Яку модель шукаєте? Який ваш бюджет?"
                         className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-900 min-h-[140px] focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none resize-none shadow-sm"
                       />
                    </div>

                    <button disabled={isSubmitting} className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue-dark transition-all shadow-xl shadow-brand-blue/25 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3">
                      {isSubmitting ? 'Відправка...' : 'Відправити запит'}
                      <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
                      Натискаючи на кнопку, ви погоджуєтесь з політикою конфіденційності
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
