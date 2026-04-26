import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Users, Zap, BarChart3, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { KpiCard } from './helpers';
import type { Tab } from './types';

export default function Dashboard({ leads, cars, stats, aiLogsCount, setTab }: {
  leads: any[]; cars: any[]; stats: any[]; aiLogsCount: number; setTab: (t: Tab) => void;
}) {
  const [range, setRange] = useState(7);
  const totalViews = cars.reduce((s, c) => s + (c.views_count ?? 0), 0);
  const hotLeads   = leads.filter(l => l.score === 'гарячий' && (l.status || 'новий') === 'новий');
  const chartData  = stats.slice(0, range).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Відвідувачі"  value={totalViews.toLocaleString()} trend={12} icon={<Eye size={20} />}      color="blue"   sub="за весь час" />
        <KpiCard title="Заявки"       value={leads.length}                trend={20} icon={<Users size={20} />}    color="green"  sub="всього в базі" />
        <KpiCard title="AI-Дії"       value={aiLogsCount}                            icon={<Zap size={20} />}      color="orange" sub="автоматизацій" />
        <KpiCard title="Бюджет лідів" value={`$${leads.reduce((s, l) => s + (parseInt(l.budget?.replace(/[^0-9]/g, '') || '0')), 0).toLocaleString()}`} icon={<BarChart3 size={20} />} color="red" sub="потенційний дохід" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => setTab('leads')} className="bg-red-500 rounded-2xl p-5 text-white flex items-center justify-between cursor-pointer hover:bg-red-600 transition-all shadow-lg shadow-red-100 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Zap size={24} className="animate-pulse" /></div>
            <div>
              <div className="text-lg font-black leading-none">Гарячі ліди: {hotLeads.length}</div>
              <div className="text-xs text-white/70 mt-1 uppercase tracking-wider font-bold">Потребують термінового дзвінка</div>
            </div>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-slate-900 flex items-center gap-2"><BarChart3 size={18} className="text-brand-blue" /> Трафік та Заявки</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {[7, 30, 90].map(d => (
                <button key={d} onClick={() => setRange(d)} className={cn('px-3 py-1 text-xs font-bold rounded-md transition-all', range === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}>
                  {d}д
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 px-2">
            {chartData.length > 0 ? chartData.map((d, i) => (
              <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group">
                <div className="absolute bottom-0 left-0 right-0 bg-brand-blue/10 rounded-t-lg transition-all group-hover:bg-brand-blue/20" style={{ height: `${Math.min(100, (d.views / 500) * 100)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.views} відв.
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t-sm" style={{ height: `${Math.min(100, (d.leads / 20) * 100)}%` }} />
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">Немає даних для графіка</div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">
            <span>{chartData[0] ? format(new Date(chartData[0].date), 'dd MMM') : '...'}</span>
            <span>Сьогодні</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><TrendingUp size={18} className="text-brand-blue" /> Топ-5 тижня</h2>
          <div className="space-y-4">
            {cars.sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-colors">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{c.title}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{c.brand} · {c.views_count} переглядів</div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
              </div>
            ))}
          </div>
          <button onClick={() => setTab('analytics')} className="w-full py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Повна аналітика</button>
        </div>
      </div>
    </div>
  );
}
