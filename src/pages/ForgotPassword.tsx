import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, ChevronLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error('Помилка: ' + error.message);
    } else {
      setSent(true);
      toast.success('Інструкції надіслано на вашу пошту!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest mb-8 transition-colors">
           <ChevronLeft size={16} /> Назад до входу
        </Link>

        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Відновлення <br/><span className="text-brand-blue">пароля</span></h1>
        
        {!sent ? (
          <>
            <p className="text-slate-500 text-sm font-medium mb-8">Введіть ваш Email, і ми надішлемо вам посилання для створення нового пароля.</p>
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ваш Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    required type="email" 
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black focus:bg-white focus:border-brand-blue outline-none transition-all"
                    placeholder="example@mail.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                {loading ? 'Надсилаємо...' : 'Надіслати посилання'} <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <Mail size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Перевірте пошту!</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Ми надіслали інструкції на {email}. Не забудьте перевірити папку "Спам".</p>
            <button onClick={() => setSent(false)} className="text-brand-blue text-xs font-black uppercase tracking-widest hover:underline">Спробувати іншу пошту</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
