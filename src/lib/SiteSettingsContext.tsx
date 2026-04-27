import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { PHONE_RAW, PHONE_DISPLAY } from './config';

export interface SiteSettings {
  phone:        string; // raw: +380930820122
  phoneDisplay: string; // formatted: +38 093 082 01 22
  telegram:     string; // handle without @
  address:      string;
  email:        string;
  hours:        string;
}

const defaults: SiteSettings = {
  phone:        PHONE_RAW,
  phoneDisplay: PHONE_DISPLAY,
  telegram:     'vips_cars',
  address:      'Київ, Україна',
  email:        'info@vip-s-cars.com',
  hours:        'Пн–Нд 09:00–21:00',
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (!data?.length) return;
      const m = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
      const phone = m.site_phone ?? defaults.phone;
      // Форматуємо номер для відображення (+380XXXXXXXXX → +38 0XX XXX XX XX)
      const phoneDisplay = phone.replace(/^\+38(\d{3})(\d{3})(\d{2})(\d{2})$/, '+38 $1 $2 $3 $4');
      setSettings({
        phone,
        phoneDisplay: phoneDisplay !== phone ? phoneDisplay : PHONE_DISPLAY,
        telegram:     m.site_telegram ?? defaults.telegram,
        address:      m.site_address  ?? defaults.address,
        email:        m.site_email    ?? defaults.email,
        hours:        m.site_hours    ?? defaults.hours,
      });
    });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
