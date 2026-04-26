import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, ShieldCheck, Users, 
  BarChart3, Settings, LogOut, Search, 
  Bell, HelpCircle, MessageSquare, Sparkles,
  Globe, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Імпорт менеджерів
import Dashboard from './Dashboard';
import CarsManager from './CarsManager';
import LeadsManager from './LeadsManager';
import ModerationManager from './ModerationManager';
import SeoManager from './SeoManager';
import AiManager from './AiManager';
import AnalyticsManager from './AnalyticsManager';
import UsersManager from './UsersManager';
import ContentManager from './ContentManager';
import SettingsPanel from './SettingsPanel';
import { Tab } from './types';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    carsCount: 0,
    leadsCount: 0,
    usersCount: 0,
    activeLeads: [] as any[],
    recentCars: [] as any[]
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    fetchStats();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!p || p.role !== 'admin') { navigate('/'); return; }
    setProfile(p);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [cars, leads, users] = await Promise.all([
      supabase.from('cars').select('id', { count: 'exact' }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('profiles').select('id', { count: 'exact' })
    ]);

    setStats({
      carsCount: cars.count || 0,
      leadsCount: leads.count || 0,
      usersCount: users.count || 0,
      activeLeads: leads.data || [],
      recentCars: []
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
       <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full" />
    </div>
  );

  const menu = [
    { id: 'dashboard',  label: 'Дашборд',    icon: <LayoutDashboard size={18}/> },
    { id: 'cars',       label: 'Авто',        icon: <Car size={18}/> },
    { id: 'moderation', label: 'Модерація',   icon: <ShieldCheck size={18}/>, badge: 2 },
    { id: 'leads',      label: 'Ліди (CRM)', icon: <MessageSquare size={18}/> },
    { id: 'users',      label: 'Користувачі', icon: <Users size={18}/> },
    { id: 'seo',        label: 'SEO',         icon: <Globe size={18}/> },
    { id: 'analytics',  label: 'Аналітика',   icon: <BarChart3 size={18}/> },
    { id: 'ai',         label: 'AI Помічник', icon: <Sparkles size={18}/> },
    { id: 'content',    label: 'Контент',    icon: <FileText size={18}/> },
    { id: 'settings',   label: 'Налаштування', icon: <Settings size={18}/> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard setTab={setActiveTab} leads={stats.activeLeads} cars={[]} stats={stats} aiLogsCount={47} />;
      case 'cars':       return <CarsManager />;
      case 'leads':      return <LeadsManager leads={stats.activeLeads} onRefresh={fetchStats} profile={profile} />;
      case 'moderation': return <ModerationManager />;
      case 'seo':        return <SeoManager />;
      case 'ai':         return <AiManager />;
      case 'analytics':  return <AnalyticsManager cars={[]} leads={stats.activeLeads} />;
      case 'users':      return <UsersManager />;
      case 'content':    return <ContentManager />;
      case 'settings':   return <SettingsPanel />;
      default:           return <Dashboard setTab={setActiveTab} leads={[]} cars={[]} stats={{}} aiLogsCount={0} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-blue/20">V</div>
             <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">VIP.S CARS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)}
              className={cn("w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                activeTab === item.id ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")}>
              <div className="flex items-center gap-3">
                <span className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-white" : "text-slate-300")}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge && <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black", activeTab === item.id ? "bg-white/20" : "bg-brand-blue/10 text-brand-blue")}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100">
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Вийти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="relative w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
            <input type="text" placeholder="Пошук по системі..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-brand-blue outline-none transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-4">
             <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 hover:text-brand-blue transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <div className="w-px h-6 bg-slate-200 mx-2" />
             <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue font-black">{profile?.email?.[0]?.toUpperCase()}</div>
                <div className="text-left">
                   <div className="text-xs font-black text-slate-900">Admin</div>
                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{profile?.email?.split('@')[0]}</div>
                </div>
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
