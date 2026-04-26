import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, Bell, LogOut, Phone, ChevronRight, X, Star, Car, Plus, ShieldCheck, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { PHONE_RAW } from '../lib/config';
import SEOHead from '../components/SEOHead';
import { toast } from 'react-hot-toast';

type Tab = 'favorites' | 'viewed' | 'my_cars' | 'subscriptions' | 'leads';

export default function ClientDashboard() {
  const [tab, setTab]           = useState<Tab>('my_cars'); // Робимо "Мої авто" вкладкою за замовчуванням
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/login'); return; }
      setUser(authUser);

      // Завантажуємо профіль
      let { data: p } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
      if (!p) {
        const { data: newP } = await supabase.from('profiles').insert([{ id: authUser.id, email: authUser.email, name: authUser.user_metadata?.name || authUser.email?.split('@')[0] }]).select().single();
        p = newP;
      }
      setProfile(p);

      // Завантажуємо всі дані паралельно
      const [favsRes, viewsRes, mineRes, subsRes, leadsRes] = await Promise.all([
        supabase.from('user_favorites').select('cars(*)').eq('user_id', authUser.id),
        supabase.from('user_views').select('cars(*)').eq('user_id', authUser.id).order('viewed_at', { ascending: false }),
        supabase.from('cars').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', authUser.id).eq('is_active', true),
        supabase.from('leads').select('*').eq('phone', p?.phone || authUser.phone || '—').order('created_at', { ascending: false })
      ]);

      setFavorites(favsRes.data?.map(f => f.cars).filter(Boolean) ?? []);
      setViewed(viewsRes.data?.map(v => v.cars).filter(Boolean) ?? []);
      setMyCars(mineRes.data ?? []);
      setLeads(leadsRes.data ?? []);
      setProfile((prev: any) => ({ ...prev, subscriptions: subsRes.data ?? [] }));

      setLoading(false);
    })();
  }, [navigate]);

  const removeFavorite = async (carId: number) => {
    const { error } = await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('car_id', carId);
    if (!error) {
      setFavorites(f => f.filter(c => c.id !== carId));
      toast.success('Видалено з обраного');
    }
  };

  const tabs = [
    { id: 'my_cars',       label: 'Мої авто',  icon: <Car size={16}/>,      count: myCars.length },
    { id: 'favorites',     label: 'Обране',    icon: <Heart size={16}/>,    count: favorites.length },
    { id: 'viewed',        label: 'Перегляди', icon: <Eye size={16}/>,   count: viewed.length },
    { id: 'subscriptions', label: 'Підписки',  icon: <Bell size={16}/>,     count: (profile?.subscriptions ?? []).length },
    { id: 'leads',         label: 'Заявки',    icon: <Star size={16}/>,     count: leads.length },
  ] as const;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full"/>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Завантаження кабінету...</p>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Особистий кабінет" url="/dashboard" />
      <div className="min-h-screen bg-slate-50 pt-10 pb-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6">

          {/* User Header Card */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-brand-blue text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-brand-blue/20">
                <span className="text-3xl font-black italic">
                  {user?.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                     {profile?.name || user?.email?.split('@')[0] || 'Користувач'}
                   </h1>
                   {user?.email === 'kovtunsasa65@gmail.com' && <ShieldCheck size={18} className="text-brand-blue" />}
                </div>
                <p className="text-slate-400 font-bold text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
              <Link to="/sell" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-brand-blue/20 group">
                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Додати авто
              </Link>
              <button
                onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100"
                title="Вийти"
              >
                <LogOut size={20}/>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as Tab)}
                className={cn('flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all shrink-0',
                  tab === t.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue')}>
                {t.icon}
                <span>{t.label}</span>
                {t.count > 0 && <span className={cn('ml-1 px-2 py-0.5 rounded-lg text-[10px]', tab === t.id ? 'bg-white/20' : 'bg-slate-100')}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[400px]"
          >
            {/* My Cars Section */}
            {tab === 'my_cars' && (
              <div className="space-y-6">
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-3xl flex items-center justify-center mx-auto mb-6 relative z-10">
                      <Car size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10">Продайте свій VIP автомобіль</h3>
                   <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto relative z-10">Ми допоможемо знайти ідеального покупця. Заповніть форму за 2 хвилини.</p>
                   <Link to="/sell" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-blue text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-brand-blue/30 relative z-10">
                      <Plus size={20} /> Створити оголошення
                   </Link>
                </div>

                {myCars.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Ваші публікації ({myCars.length})</h4>
                     {myCars.map(car => (
                       <div key={car.id} className="bg-white p-5 rounded-[32px] border border-slate-200 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                          <div className="w-full sm:w-40 h-28 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                             <img src={car.images?.[0] || 'https://via.placeholder.com/200'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </div>
                          <div className="flex-1 min-w-0 text-center sm:text-left">
                             <div className="font-black text-slate-900 text-lg tracking-tight mb-1">{car.make} {car.model}</div>
                             <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-2 py-1 rounded-lg uppercase">{car.year}</span>
                                <span className="text-[10px] font-black bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-lg uppercase">${car.price?.toLocaleString()}</span>
                             </div>
                          </div>
                          <div className="flex flex-col items-center sm:items-end gap-2">
                              <span className={cn(
                                "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border shadow-sm",
                                (car.status === 'active' || car.status === 'available') ? "bg-green-500 text-white border-green-500 shadow-green-200/50" :
                                car.status === 'moderation' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                car.status === 'revision' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                "bg-slate-100 text-slate-500 border-slate-200"
                              )}>
                                {car.status === 'moderation' ? 'На модерації' : 
                                 (car.status === 'active' || car.status === 'available') ? 'Опубліковано' : 
                                 car.status === 'revision' ? 'На доопрацюванні' :
                                 car.status}
                              </span>
                             <div className="text-[9px] text-slate-300 font-bold uppercase">{new Date(car.created_at).toLocaleDateString()}</div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Section */}
            {tab === 'favorites' && (
              <div>
                {favorites.length === 0 ? (
                  <EmptyState icon={<Heart size={40}/>} text="Список обраного порожній" sub="Додавайте авто, які вам сподобалися, щоб не загубити їх.">
                    <Link to="/catalog" className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-blue/20">
                      Перейти в каталог
                    </Link>
                  </EmptyState>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map(car => (
                      <CarMiniCard key={car.id} car={car} onRemove={() => removeFavorite(car.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions Section */}
            {tab === 'subscriptions' && (
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <Bell size={24} />
                   </div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">Підписки на нові авто</h2>
                </div>
                {(profile?.subscriptions ?? []).length === 0 ? (
                  <EmptyState icon={<Bell size={40}/>} text="У вас немає активних підписок" sub="Налаштуйте фільтри в каталозі та підпишіться на оновлення." />
                ) : (
                  <div className="space-y-4">
                     {(profile.subscriptions as any[]).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200 group hover:border-brand-blue transition-all">
                        <div className="space-y-1">
                          <div className="text-base font-black text-slate-900">
                            {s.brand ? `${s.brand} ` : 'Будь-яка марка '}
                            {s.model ? `${s.model}` : ''}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1 h-1 bg-brand-blue rounded-full" />
                             {s.price_max ? `До $${Number(s.price_max).toLocaleString()}` : 'Будь-яка ціна'}
                          </div>
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm">
                          <X size={18}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Leads Section */}
            {tab === 'leads' && (
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">Ваші активні заявки</h2>
                   <div className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-400">{leads.length}</div>
                </div>
                {leads.length === 0 ? (
                  <EmptyState icon={<Star size={40}/>} text="Ви ще не залишали заявок" sub="Виберіть авто та залиште запит на огляд або тест-драйв.">
                    <Link to="/catalog" className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                      Вибрати автомобіль
                    </Link>
                  </EmptyState>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {leads.map(l => (
                      <div key={l.id} className="flex items-center gap-6 px-8 py-6 hover:bg-slate-50/50 transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all">
                          <Phone size={20} className="opacity-50 group-hover:opacity-100"/>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-black text-slate-900 mb-0.5">{l.type || 'Запит на консультацію'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                             <Clock size={10} /> {new Date(l.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={cn(
                          'text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border',
                          l.status === 'новий' ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-100 text-slate-500 border-slate-200'
                        )}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

function CarMiniCard({ car, onRemove }: { car: any; onRemove?: () => void }) {
  const img = car.images?.[0] || 'https://via.placeholder.com/300';
  const slug = car.seo_slug || car.id;
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <Link to={`/cars/${slug}`} className="w-full md:w-40 h-40 md:h-auto shrink-0 bg-slate-100 relative overflow-hidden">
        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={car.title}/>
      </Link>
      <div className="p-6 flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/cars/${slug}`} className="text-lg font-black text-slate-900 hover:text-brand-blue transition-colors line-clamp-1 tracking-tight">
            {car.make} {car.model} {car.year}
          </Link>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.transmission}</span>
             <div className="w-1 h-1 bg-slate-200 rounded-full" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{car.fuel}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <span className="text-xl font-black text-brand-blue tracking-tighter">${car.price?.toLocaleString()}</span>
          <div className="flex gap-2">
            {onRemove && (
              <button onClick={onRemove}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm">
                <X size={18}/>
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
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-16 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-slate-300">{icon}</div>
      <h3 className="text-xl font-black text-slate-900 mb-2">{text}</h3>
      {sub && <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto text-sm">{sub}</p>}
      {children && <div className="flex justify-center">{children}</div>}
    </div>
  );
}
