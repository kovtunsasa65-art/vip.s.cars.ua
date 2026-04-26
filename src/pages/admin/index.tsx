import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, ShieldCheck, Users, 
  BarChart3, Globe, Brain, FileText, 
  Settings, Image, LogOut, Menu, X,
  UserCircle, TrendingUp, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// Модулі (Тимчасові заглушки або існуючі)
import Dashboard from './Dashboard';
import LeadsManager from './LeadsManager';
import CarsManager from './CarsManager';
import ModerationManager from './ModerationManager';

// Тип для вкладок
type Tab = 'dashboard' | 'cars' | 'leads' | 'moderation' | 'users' | 'seo' | 'analytics' | 'ai' | 'content' | 'settings';

export default function AdminIndex() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ cars: 0, leads: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/admin-login');
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: <BarChart3 size={20} /> },
    { id: 'cars', label: 'Авто', icon: <Car size={20} /> },
    { id: 'moderation', label: 'Модерація', icon: <ShieldCheck size={20} />, badge: '2' },
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
      case 'moderation': return <ModerationManager />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
             <ShieldCheck size={40} className="opacity-20" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em]">Розділ "{activeTab}" у розробці</p>
          <p className="text-xs font-medium text-slate-400 mt-2">Ми працюємо над цим модулем</p>
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
              {item.badge && isSidebarOpen && (
                <span className={cn(
                  "absolute right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full",
                  activeTab === item.id ? "bg-white text-brand-blue" : "bg-brand-blue text-white"
                )}>
                  {item.badge}
                </span>
              )}
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
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
