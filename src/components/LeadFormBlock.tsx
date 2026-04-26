import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { sendTelegramNotification, formatLeadMessage } from '../services/telegramService';
import { PHONE_RAW, PHONE_DISPLAY } from '../lib/config';
import FullBuybackForm from './FullBuybackForm';

interface LeadFormBlockProps {
  type: string;
  title: string;
  placeholder: string;
}

export default function LeadFormBlock({ type, title, placeholder }: LeadFormBlockProps) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Якщо тип "викуп" - показуємо повну форму
  if (type === 'викуп') {
    return (
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 bg-slate-900 text-white">
          <h3 className="font-black text-lg">{title}</h3>
          <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest mt-1">Оцінка за 1 годину</p>
        </div>
        <FullBuybackForm embedded />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('leads').insert([
      { type, name: form.name, phone: form.phone, message: form.message, source: `сайт / ${type}`, status: 'новий', score: 'теплий' },
    ]);
    await sendTelegramNotification(
      formatLeadMessage({ type, name: form.name, phone: form.phone, message: form.message, source: `сторінка ${type}` })
    );
    setSent(true);
    setLoading(false);
  };

  if (sent)
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-black text-slate-900 mb-1">Заявку відправлено!</h3>
        <p className="text-slate-500 text-sm">Зв'яжемося з вами найближчим часом</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h3 className="font-black text-slate-900 text-lg">{title}</h3>
      <input
        required
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Ваше ім'я"
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-blue focus:outline-none bg-slate-50"
      />
      <input
        required
        type="tel"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        placeholder="+380"
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-blue focus:outline-none bg-slate-50"
      />
      <textarea
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-blue focus:outline-none bg-slate-50 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50 shadow-lg shadow-brand-blue/20"
      >
        {loading ? 'Відправка...' : 'Отримати консультацію'}
      </button>
      <p className="text-xs text-center text-slate-400">
        або зателефонуйте: <a href={`tel:${PHONE_RAW}`} className="text-brand-blue font-bold hover:underline">{PHONE_DISPLAY}</a>
      </p>
    </form>
  );
}
