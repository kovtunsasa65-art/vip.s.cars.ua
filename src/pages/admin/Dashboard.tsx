import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Phone, MousePointer2, 
  BarChart3, ChevronRight, Zap, Eye, AlertCircle,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface DashboardProps {
  leads?: any[];
  cars?: any[];
  stats?: any;
  aiLogsCount?: number;
  setTab?: (t: any) => void;
}

export default function Dashboard({ 
  leads = [], 
  cars = [], 
  stats = {}, 
  aiLogsCount = 0, 
  setTab = () => {} 
}: DashboardProps) {
  
  const kpis = [
    { label: 'Відвідувачі', value: '347', trend: '+12%', up: true, icon: <Users size={20} /> },
    { label: 'Заявки', value: leads.length.toString() || '0', trend: '+20%', up: true, icon: <TrendingUp size={20} /> },
    { label: 'Дзвінки', value: '8', trend: '-5%', up: false, icon: <Phone size={20} /> },
    { label: 'Конверсія', value: '3.5%', trend: '+0.4%', up: true, icon: <MousePointer2 size={20} /> },
  ];

  const hotLeads = leads.filter(l => l.status === 'новий').slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Дашборд</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Огляд активності за сьогодні</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Оновити</button>
           <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all">Звіт за місяць</button>
        </div>
      </div>

      {/* KPI Row */}
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
                  {kpi.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
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
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <BarChart3 className="text-brand-blue" /> Трафік та заявки
              </h2>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                 {['7д', '30д', '90д'].map(d => (
                   <button key={d} className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", d === '7д' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>{d}</button>
                 ))}
              </div>
           </div>
           
           <div className="h-64 flex items-end gap-3 px-2 border-b border-slate-50">
              {Array.from({ length: 14 }).map((_, i) => {
                const height = 40 + Math.random() * 60;
                return (
                  <div key={i} className="flex-1 group relative">
                     <div 
                       className="w-full bg-slate-50 rounded-t-xl transition-all group-hover:bg-brand-blue/10 relative"
                       style={{ height: `${height}%` }}
                     >
                        <div className="absolute bottom-0 left-0 right-0 bg-brand-blue/20 rounded-t-xl group-hover:bg-brand-blue transition-all" style={{ height: `${Math.random() * 40}%` }} />
                     </div>
                  </div>
                );
              })}
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <span>20 Квітня</span>
              <span>Сьогодні</span>
           </div>
        </div>

        {/* Alerts & Logs Side */}
        <div className="space-y-6">
           {/* Hot Leads */}
           <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
                    <Zap size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Гарячі ліди</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Вимагають уваги: {hotLeads.length}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 {hotLeads.length > 0 ? hotLeads.map((lead, i) => (
                   <div key={i} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-xs font-black italic shadow-lg">V</div>
                         <div className="truncate">
                            <div className="text-xs font-black truncate">{lead.name || 'Клієнт'}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{lead.type || 'Запит'}</div>
                         </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-all" />
                   </div>
                 )) : (
                    <div className="text-center py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Немає нових лідів</div>
                 )}
              </div>

              <button 
                onClick={() => setTab('leads')}
                className="w-full mt-6 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
              >
                Всі ліди →
              </button>
           </div>

           {/* AI Activities */}
           <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                       <Brain size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest">AI Активність</h3>
                 </div>
                 <div className="text-xs font-black text-brand-blue">{aiLogsCount || 47}</div>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Оновлено SEO для BMW X5', time: '2 хв тому' },
                   { label: 'Згенеровано опис Audi Q8', time: '15 хв тому' },
                   { label: 'Перевірка дублікатів', time: '40 хв тому' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" />
                      <div>
                         <div className="text-[11px] font-bold text-slate-700">{log.label}</div>
                         <div className="text-[9px] text-slate-400 font-medium uppercase">{log.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={() => setTab('ai')} className="w-full mt-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Дивитись логи</button>
           </div>
        </div>
      </div>
    </div>
  );
}
