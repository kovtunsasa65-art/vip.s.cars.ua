import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Паролі не збігаються!');
    }
    if (password.length < 6) {
      return toast.error('Пароль має бути не менше 6 символів');
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error('Помилка: ' + error.message);
    } else {
      toast.success('Пароль успішно оновлено!');
      setTimeout(() => navigate('/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-3xl flex items-center justify-center mb-8">
           <Lock size={32} />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Новий <br/><span className="text-brand-blue">пароль</span></h1>
        <p className="text-slate-500 text-sm font-medium mb-8">Придумайте надійний пароль, щоб захистити ваш аккаунт.</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Новий пароль</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                required type="password" 
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black focus:bg-white focus:border-brand-blue outline-none transition-all"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Підтвердіть пароль</label>
            <div className="relative">
              <Check className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                required type="password" 
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black focus:bg-white focus:border-brand-blue outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
          >
            {loading ? 'Оновлюємо...' : 'Зберегти пароль'} <Save size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
