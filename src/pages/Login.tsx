import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
// ... (rest of states)
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
        setMessage('Акаунт створено! Тепер ви можете увійти, використовуючи свої дані.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
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
            {isSignUp ? <>Створити <br/>акаунт</> : (isAdminMode ? <>Вхід в <br/>панель</> : <>Вхід для <br/>клієнта</>)}
          </h1>
        </div>

        {error && <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-500 text-xs font-bold">{error}</div>}
        {message && <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-500 text-xs font-bold">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ваш Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-6 rounded-2xl text-slate-900 text-sm focus:border-brand-blue outline-none transition-all font-bold"
                placeholder="admin@vips.ua" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Пароль</label>
              {!isSignUp && (
                <Link to="/forgot-password" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">
                  Забули?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-4 pl-14 pr-6 rounded-2xl text-slate-900 text-sm focus:border-brand-blue outline-none transition-all font-bold"
                placeholder="••••••••" />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Зареєструватися' : 'Увійти')}
          </button>

          <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Або через</span>
          </div>

          <button 
            type="button"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'telegram' as any,
                options: { redirectTo: window.location.origin + '/dashboard' }
              });
              if (error) toast.error(error.message);
            }}
            className="w-full bg-[#0088cc] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#0077b5] transition-all shadow-lg shadow-[#0088cc]/20 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.02-.22.33-.45.91-.68 3.56-1.55 5.94-2.57 7.14-3.07 3.4-.14 4.11.42 4.11 1.95z"/>
            </svg>
            Telegram
          </button>

          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-brand-blue mt-8 transition-colors">
            {isSignUp ? 'Вже є акаунт? Увійти' : 'Немає акаунту? Реєстрація'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
