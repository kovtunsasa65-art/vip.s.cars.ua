import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminMode = location.pathname === '/admin-login';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Реєстрація успішна! Перевірте пошту для підтвердження (якщо активовано) або спробуйте увійти.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Redirect based on mode
        if (isAdminMode) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Помилка авторизації.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-all text-xs font-black uppercase tracking-widest group">
        <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all">
          <ArrowLeft size={16} />
        </div>
        Назад на головну
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative z-10"
      >
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-brand-blue/20">V</div>
             <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">VIP.S CARS</span>
          </div>
          <p className="text-xs font-black text-brand-blue uppercase tracking-widest pl-1 mb-2">{isSignUp ? 'Реєстрація' : 'Авторизація'}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
            {isSignUp ? (
              <>Створити <br/>аккаунт</>
            ) : (
              isAdminMode ? <>Вхід в <br/>панель</> : <>Вхід для <br/>клієнта</>
            )}
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-500 text-xs font-bold leading-relaxed italic">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-500 text-xs font-bold leading-relaxed italic">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">ID Користувача (Email)</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-6 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold"
                placeholder="admin@vips.ua"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ключ доступу (Пароль)</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-6 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue-dark active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-brand-blue/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              isSignUp ? 'Зареєструватися' : 'Увійти в систему'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="w-full text-center text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-brand-blue transition-colors mt-6"
          >
            {isSignUp ? 'Вже є аккаунт? Увійти' : 'Немає аккаунту? Реєстрація'}
          </button>
        </form>

        <p className="mt-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] italic">
          {isAdminMode ? 'Доступ тільки для експертів VIP.S CARS' : 'Ваш персональний доступ до сервісу'}
        </p>
      </motion.div>
    </div>
  );
}
