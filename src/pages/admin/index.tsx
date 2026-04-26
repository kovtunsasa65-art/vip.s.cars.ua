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
  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={20} /> },
    { id: 'cars', label: 'Авто', icon: <Car size={20} /> },
    { id: 'leads', label: 'Ліди (CRM)', icon: <Users size={20} /> },
    { id: 'users', label: 'Користувачі', icon: <UserCircle size={20} /> },
    { id: 'seo', label: 'SEO', icon: <Globe size={20} /> },
    { id: 'analytics', label: 'Аналітика', icon: <TrendingUp size={20} /> },
    { id: 'ai', label: '🤖 AI', icon: <Zap size={20} /> },
    { id: 'content', label: 'Контент', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Налаштування', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'cars': return <CarsManager />;
      case 'leads': return <LeadsManager />;
      case 'users': return <UsersManager />;
      case 'seo': return <SeoManager />;
      case 'analytics': return <AnalyticsManager />;
      case 'ai': return <AiManager />;
      case 'content': return <ContentManager />;
      case 'settings': return <SettingsPanel />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
          <ShieldCheck size={64} className="mb-4 opacity-20" />
          <p className="text-sm font-black uppercase tracking-[0.2em]">Розділ у розробці</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50 shadow-sm"
      >
        <div className="p-6 flex items-center justify-between">
           {isSidebarOpen ? (
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-blue/30">V</div>
                <span className="font-black text-lg tracking-tighter">VIP.S <span className="text-brand-blue">CARS</span></span>
             </div>
           ) : (
             <div className="w-8 h-8 bg-brand-blue rounded-lg mx-auto flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-blue/30">V</div>
           )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
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
