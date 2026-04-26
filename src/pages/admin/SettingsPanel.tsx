import { useState, useEffect } from 'react';
import { Phone, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { PHONE_RAW } from '../../lib/config';

export default function SettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ phone: PHONE_RAW, telegram: '@vips_cars', pwa_prompt_enabled: true });

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (!data) return;
      const s: any = { ...settings };
      data.forEach((item: any) => {
        if (item.key === 'pwa_prompt_enabled') s.pwa_prompt_enabled = item.value === 'true';
        if (item.key === 'site_phone')    s.phone = item.value;
        if (item.key === 'site_telegram') s.telegram = item.value;
      });
      setSettings(s);
    });
  }, []);

  const save = async () => {
    setSaved(true);
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'pwa_prompt_enabled', value: String(settings.pwa_prompt_enabled) }),
      supabase.from('site_settings').upsert({ key: 'site_phone',    value: settings.phone }),
      supabase.from('site_settings').upsert({ key: 'site_telegram', value: settings.telegram }),
    ]);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-900">Налаштування</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Phone size={16} className="text-brand-blue" /> Контакти</h2>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Телефон</label>
            <input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telegram</label>
            <input value={settings.telegram} onChange={e => setSettings(s => ({ ...s, telegram: e.target.value }))} className={inp} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Zap size={16} className="text-brand-blue" /> PWA Налаштування</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="text-sm font-bold text-slate-600">Пропозиція встановлення</span>
            <button onClick={() => setSettings(s => ({ ...s, pwa_prompt_enabled: !s.pwa_prompt_enabled }))}
              className={cn('w-11 h-6 rounded-full transition-colors relative', settings.pwa_prompt_enabled ? 'bg-brand-blue' : 'bg-slate-200')}>
              <div className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform', settings.pwa_prompt_enabled ? 'translate-x-5' : 'translate-x-0')} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={save} className={cn('px-12 py-4 rounded-2xl text-white font-black shadow-xl transition-all', saved ? 'bg-green-500' : 'bg-brand-blue shadow-brand-blue/20 hover:scale-105 uppercase tracking-widest')}>
          {saved ? 'Збережено' : 'Зберегти зміни'}
        </button>
      </div>
    </div>
  );
}
