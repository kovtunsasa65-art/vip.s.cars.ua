import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = async () => {
      // 1. Перевіряємо локальне налаштування користувача
      if (localStorage.getItem('pwa_prompt_hidden') === 'true') {
        setIsVisible(false);
        return;
      }

      // 2. Перевіряємо глобальне налаштування від адміна
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'pwa_prompt_enabled').maybeSingle();
      if (data && data.value === 'false') {
        setIsVisible(false);
        return;
      }
    };

    const handler = async (e: any) => {
      // Спочатку перевіряємо чи не приховано локально (швидка перевірка)
      if (localStorage.getItem('pwa_prompt_hidden') === 'true') return;

      // Перевіряємо глобально
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'pwa_prompt_enabled').maybeSingle();
      if (data && data.value === 'false') return;

      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('storage', checkVisibility);
    checkVisibility(); // Початкова перевірка

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('storage', checkVisibility);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = (forever = false) => {
    setIsVisible(false);
    if (forever) {
      localStorage.setItem('pwa_prompt_hidden', 'true');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue flex-shrink-0">
              <Download size={24} />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Встановити VIP.S CARS</h4>
              <p className="text-xs text-slate-500">Додайте сайт на головний екран</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors"
              >
                Встановити
              </button>
              <button
                onClick={() => handleDismiss(true)}
                className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 text-center"
              >
                Не показувати
              </button>
            </div>

            <button 
              onClick={() => handleDismiss(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
