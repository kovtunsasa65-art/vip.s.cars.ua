import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Phone, MousePointer2, 
  BarChart3, ChevronRight, Zap, Brain, 
  ArrowUpRight, ArrowDownRight, Car, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Tab } from './types';
import { format } from 'date-fns';

interface DashboardProps {
  leads?: any[];
  cars?: any[];
  stats?: any;
  aiLogsCount?: number;
  setTab?: (t: Tab) => void;
}

export default function Dashboard({ 
  leads = [], 
  cars = [], 
  stats = {}, 
  aiLogsCount = 0, 
  setTab = () => {} 
}: DashboardProps) {
  
  const kpis = [
    { label: 'Авто в базі', value: stats.carsCount || 0, trend: '+2', up: true, icon: <Car size={20} /> },
    { label: 'Всього лідів', value: stats.leadsCount || 0, trend: '+12%', up: true, icon: <TrendingUp size={20} /> },
    { label: 'Користувачі', value: stats.usersCount || 0, trend: '+5', up: true, icon: <Users size={20} /> },
    { label: 'AI Аналіз', value: aiLogsCount, trend: 'Активно', up: true, icon: <Brain size={20} /> },
  ];

  const recentLeads = Array.isArray(leads) ? leads.slice(0, 5) : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Дашборд</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Огляд активності в реальному часі</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Оновити</button>
           <button onClick={() => setTab('analytics')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all">Детальна аналітика</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
          >
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-40",
              kpi.up ? "bg-green-100" : "bg-red-100"
            )} />
            
            <div className="flex justify-between items-start relative z-10">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  {kpi.icon}
               </div>
               <div className={cn(
                 "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                 kpi.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
               )}>
                  {kpi.trend}
               </div>
            </div>
            
            <div className="mt-6 relative z-10">
               <div className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <BarChart3 className="text-brand-blue" /> Трафік сайту
              </h2>
           </div>
           
           <div className="h-64 flex items-end gap-3 px-2 border-b border-slate-50">
              {Array.from({ length: 14 }).map((_, i) => {
                const height = 40 + Math.random() * 60;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full bg-slate-50 rounded-t-xl relative overflow-hidden min-h-[20px]" style={{ height: `${height}%` }}>
                       <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ delay: i * 0.05 }} className="absolute bottom-0 left-0 w-full bg-brand-blue/10 group-hover:bg-brand-blue transition-all" />
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase">{14 - i}д</span>
                  </div>
                );
              })}
           </div>
           <div className="mt-8 flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-blue rounded-full" /> Перегляди</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-100 rounded-full" /> Унікальні</div>
              </div>
              <p>Оновлено 5 хв тому</p>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Нові заявки</h2>
              <button onClick={() => setTab('leads')} className="text-brand-blue hover:underline"><ChevronRight size={20}/></button>
           </div>
           
           <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                   <MessageSquare size={32} className="mx-auto text-slate-200" />
                   <p className="text-xs font-bold text-slate-400 uppercase">Немає нових заявок</p>
                </div>
              ) : (
                recentLeads.map((lead, i) => (
                  <div key={lead.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors shadow-sm">
                        <Phone size={18} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">{lead.name || 'Клієнт'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lead.type || 'Запит'}</div>
                     </div>
                     <div className="text-[9px] font-black text-slate-300">{format(new Date(lead.created_at), 'HH:mm')}</div>
                  </div>
                ))
              )}
           </div>
           
           <button onClick={() => setTab('leads')} className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-blue hover:text-white transition-all">
              Всі ліди
           </button>
        </div>
      </div>
    </div>
  );
}
