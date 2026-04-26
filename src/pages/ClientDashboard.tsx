import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Eye, Bell, LogOut, Phone, ChevronRight, X, Star, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { PHONE_RAW } from '../lib/config';
import SEOHead from '../components/SEOHead';

type Tab = 'favorites' | 'viewed' | 'subscriptions' | 'leads';

const STATUS_COLOR: Record<string, string> = {
  новий:     'bg-blue-100 text-blue-700',
  'в роботі':'bg-yellow-100 text-yellow-700',
  закрито:   'bg-green-100 text-green-700',
};

export default function ClientDashboard() {
  const [tab, setTab]           = useState<Tab>('favorites');
  const [user, setUser]         = useState<any>(null);
  const [profile, setProfile]   = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [viewed, setViewed]     = useState<any[]>([]);
  const [myCars, setMyCars]     = useState<any[]>([]);
  const [leads, setLeads]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUser(user);

      // Завантажуємо профіль
      let { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!p) {
        const { data: newP } = await supabase.from('profiles').insert([{ id: user.id, email: user.email, name: user.user_metadata?.name || user.email?.split('@')[0] }]).select().single();
        p = newP;
      }
      setProfile(p);

      // 1. Завантажуємо Обране
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('car_id, cars(*)')
        .eq('user_id', user.id);
      setFavorites(favs?.map(f => f.cars).filter(Boolean) ?? []);

      // 2. Завантажуємо Переглянуті
      const { data: views } = await supabase
        .from('user_views')
        .select('car_id, viewed_at, cars(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false });
      setViewed(views?.map(v => v.cars).filter(Boolean) ?? []);

      // 3. Завантажуємо Мої авто
      const { data: mine } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', user.id) // Переконайтеся, що в таблиці cars є поле user_id
        .order('created_at', { ascending: false });
      setMyCars(mine ?? []);

      // 4. Мої заявки
      const userPhone = p?.phone || user.phone;
      if (userPhone) {
        const { data: l } = await supabase
          .from('leads')
          .select('*')
          .eq('phone', userPhone)
          .order('created_at', { ascending: false });
        setLeads(l ?? []);
      }

      setLoading(false);
    })();
  }, [navigate]);

  const tabs = [
    { id: 'favorites',     label: 'Обране',    icon: <Heart size={15}/>,    count: favorites.length },
    { id: 'viewed',        label: 'Перегляди', icon: <Eye size={15}/>,   count: viewed.length },
    { id: 'my_cars',       label: 'Мої авто',  icon: <Car size={15}/>,      count: myCars.length },
    { id: 'subscriptions', label: 'Підписки',  icon: <Bell size={15}/>,     count: (profile?.subscriptions ?? []).length },
    { id: 'leads',         label: 'Заявки',    icon: <Star size={15}/>,     count: leads.length },
  ] as const;

  return (
    <>
      <SEOHead title="Кабінет" url="/cabinet" />
      <div className="min-h-screen bg-slate-50 pt-6 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">

          {/* Шапка профілю */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-black text-brand-blue">
                  {user?.email?.[0]?.toUpperCase() ?? user?.phone?.[0] ?? '?'}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">
                  {user?.user_metadata?.name ?? user?.email ?? user?.phone ?? 'Кабінет'}
                </h1>
                <p className="text-sm text-slate-400">{user?.email ?? user?.phone}</p>
              </div>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={15}/> Вийти
            </button>
          </div>

          {/* Таби */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as Tab)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] md:text-sm font-bold whitespace-nowrap border transition-all shrink-0',
                  tab === t.id ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue')}>
                <span className="opacity-70">{t.icon}</span>
                <span>{t.label}</span>
                {t.count > 0 && <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-black', tab === t.id ? 'bg-white/20' : 'bg-slate-100')}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Обране */}
          {tab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <EmptyState icon={<Heart size={32}/>} text="Ви ще нічого не додали в обране" sub="Натисніть ♥ на картці авто">
                  <Link to="/catalog" className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-colors">
                    До каталогу
                  </Link>
                </EmptyState>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map(car => (
                    <CarMiniCard key={car.id} car={car} onRemove={() => removeFavorite(car.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Переглянуті */}
          {tab === 'viewed' && (
            <div>
              {viewed.length === 0 ? (
                <EmptyState icon={<Eye size={32}/>} text="Ви ще не переглядали авто" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewed.map(car => <CarMiniCard key={car.id} car={car} />)}
                </div>
              )}
            </div>
          )}

          {/* Мої Авто */}
          {tab === 'my_cars' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                 <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car size={32} />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 mb-2">Хочете продати своє авто?</h3>
                 <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Заповніть форму, і ми знайдемо покупця для вашого VIP автомобіля.</p>
                 <Link to="/sell" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand-blue/20">
                    + Додати авто
                 </Link>
              </div>

              {myCars.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                   {myCars.map(car => (
                     <div key={car.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 group">
                        <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                           <img src={car.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-black text-slate-900 text-sm truncate">{car.make} {car.model}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{car.year} · ${car.price?.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                           <span className={cn(
                             "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                             car.status === 'available' ? "bg-green-50 text-green-600 border-green-100" :
                             car.status === 'moderation' ? "bg-amber-50 text-amber-600 border-amber-100" :
                             "bg-slate-100 text-slate-500 border-slate-200"
                           )}>
                             {car.status === 'moderation' ? 'На перевірці' : car.status}
                           </span>
                           <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">Оновлено {new Date(car.updated_at).toLocaleDateString()}</div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}

          {/* Підписки */}
          {tab === 'subscriptions' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-black text-slate-900 mb-4">Підписки на нові авто</h2>
              {(profile?.subscriptions ?? []).length === 0 ? (
                <EmptyState icon={<Bell size={32}/>} text="Підписок немає" sub="Налаштуйте підписку щоб отримувати авто в Telegram" />
              ) : (
                <div className="space-y-3">
                  {(profile.subscriptions as any[]).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-800">
                          {s.brand ? `${s.brand} ` : 'Будь-яка марка '}
                          {s.model ? `${s.model}` : ''}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {s.price_min || s.price_max ? (
                            `Бюджет: $${Number(s.price_min || 0).toLocaleString()} — $${Number(s.price_max || 999999).toLocaleString()}`
                          ) : 'Будь-який бюджет'}
                          {s.city && ` • ${s.city}`}
                        </div>
                      </div>
                      <button onClick={() => removeSubscription(s.id)} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <X size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-1">Отримуйте авто в Telegram</p>
                <p className="text-xs text-blue-500 mb-3">Нові оголошення — одразу в особисті повідомлення</p>
                <a href="https://t.me/VipsCarsAlertsBot" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors w-fit">
                  Підключити Telegram →
                </a>
              </div>
            </div>
          )}

          {/* Мої заявки */}
          {tab === 'leads' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-900">Мої заявки</h2>
              </div>
              {leads.length === 0 ? (
                <EmptyState icon={<Star size={32}/>} text="Заявок ще немає">
                  <a href="#contact" className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm">
                    Залишити заявку
                  </a>
                </EmptyState>
              ) : (
                <div className="divide-y divide-slate-50">
                  {leads.map(l => (
                    <div key={l.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <Car size={16} className="text-slate-400"/>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{l.type}</div>
                        <div className="text-xs text-slate-400">{l.message?.slice(0, 60) ?? '—'}</div>
                      </div>
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', STATUS_COLOR[l.status] ?? STATUS_COLOR.новий)}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CarMiniCard({ car, onRemove }: { car: any; onRemove?: () => void }) {
  const img = car.car_images?.find((i: any) => i.is_cover)?.url ?? car.car_images?.[0]?.url;
  const slug = car.seo_slug ?? car.id;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex">
      <Link to={`/cars/${slug}`} className="w-28 shrink-0 bg-slate-100">
        {img ? <img src={img} className="w-full h-full object-cover" alt={car.title}/> : <div className="w-full h-full bg-slate-100"/>}
      </Link>
      <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/cars/${slug}`} className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors line-clamp-1">
            {car.brand} {car.model} {car.year}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">{car.city} · {car.mileage ? `${Math.round(car.mileage/1000)} тис.` : ''}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-black text-brand-blue">${Number(car.price).toLocaleString()}</span>
          <div className="flex gap-2">
            <a href={`tel:${car.seller_phone ?? PHONE_RAW}`}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-colors">
              <Phone size={12}/>
            </a>
            {onRemove && (
              <button onClick={onRemove}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors">
                <X size={12}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub, children }: { icon: React.ReactNode; text: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">{icon}</div>
      <p className="text-slate-600 font-semibold mb-1">{text}</p>
      {sub && <p className="text-slate-400 text-sm mb-4">{sub}</p>}
      {children && <div className="flex justify-center mt-4">{children}</div>}
    </div>
  );
}
