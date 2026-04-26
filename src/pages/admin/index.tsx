import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, ShieldCheck, Users, 
  BarChart3, Globe, Brain, FileText, 
  Settings, Image, LogOut, Menu, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// Модулі
import Dashboard from './Dashboard';
import LeadsManager from './LeadsManager';
import SeoManager from './SeoManager';
import AnalyticsManager from './AnalyticsManager';
import AiManager from './AiManager';
import ContentManager from './ContentManager';
import ModerationManager from './ModerationManager';
import CarsManager from './CarsManager';
import UsersManager from './UsersManager';
import SettingsPanel from './SettingsPanel';
import MediaLibrary from './MediaLibrary';
import { Tab } from './types';

export default function AdminIndex() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ cars: [], leads: [] });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchInitialData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/admin-login');
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const fetchInitialData = async () => {
    const [carsRes, leadsRes] = await Promise.all([
      supabase.from('cars').select('*'),
      supabase.from('leads').select('*').order('created_at', { ascending: false })
    ]);
    setStats({ cars: carsRes.data || [], leads: leadsRes.data || [] });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
    { id: 'cars', label: 'Каталог Авто', icon: <Car size={18} /> },
    { id: 'moderation', label: 'Модерація', icon: <ShieldCheck size={18} />, badge: stats.cars.filter((c: any) => c.status === 'moderation').length },
    { id: 'leads', label: 'CRM / Ліди', icon: <Users size={18} />, badge: stats.leads.filter((l: any) => l.status === 'новий').length },
    { id: 'analytics', label: 'Аналітика', icon: <BarChart3 size={18} /> },
    { id: 'seo', label: 'SEO Оптимізація', icon: <Globe size={18} /> },
    { id: 'ai', label: 'AI Налаштування', icon: <Brain size={18} /> },
    { id: 'content', label: 'Контент', icon: <FileText size={18} /> },
    { id: 'media', label: 'Медіатека', icon: <Image size={18} /> },
    { id: 'users', label: 'Менеджери', icon: <Users size={18} /> },
    { id: 'settings', label: 'Налаштування', icon: <Settings size={18} /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <div className={cn("flex items-center gap-2 font-black text-slate-900 transition-opacity", !isSidebarOpen && "opacity-0 w-0 overflow-hidden")}>
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">V</div>
            <span>VIP.S <span className="text-brand-blue text-xs ml-1">ADMIN</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group relative",
                activeTab === item.id 
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn("shrink-0", activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-brand-blue")}>
                {item.icon}
              </div>
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
              {item.badge ? (
                <span className={cn(
                  "absolute right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full",
                  activeTab === item.id ? "bg-white text-brand-blue" : "bg-brand-blue text-white"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Вийти</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'moderation' && <ModerationManager />}
          {activeTab === 'cars' && <CarsManager />}
          {activeTab === 'leads' && <LeadsManager leads={stats.leads} onRefresh={fetchInitialData} profile={profile} />}
          {activeTab === 'seo' && <SeoManager />}
          {activeTab === 'analytics' && <AnalyticsManager cars={stats.cars} leads={stats.leads} />}
          {activeTab === 'ai' && <AiManager />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'media' && <MediaLibrary />}
          {activeTab === 'settings' && <SettingsPanel />}
          {activeTab === 'cars' && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Car size={48} className="mx-auto text-slate-200 mb-4" />
              <h2 className="text-xl font-black text-slate-900">Каталог Авто</h2>
              <p className="text-slate-500 mt-2">Функціонал управління каталогом у розробці або винесений в окремий модуль.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
