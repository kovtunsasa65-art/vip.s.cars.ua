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
import { motion } from 'framer-motion';

export default function Dashboard() {
  const kpis = [
    { label: 'Відвідувачі', value: '347', trend: '+12%', up: true, icon: <Users size={20} /> },
    { label: 'Заявки', value: '12', trend: '+20%', up: true, icon: <TrendingUp size={20} /> },
    { label: 'Дзвінки', value: '8', trend: '-5%', up: false, icon: <Phone size={20} /> },
    { label: 'Конверсія', value: '3.5%', trend: '+0.4%', up: true, icon: <MousePointer2 size={20} /> },
  ];

  const topCars = [
    { id: 1, name: 'BMW X5 M-Pack', views: 1240, leads: 15, img: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Audi Q8 S-Line', views: 980, leads: 12, img: 'https://via.placeholder.com/100' },
    { id: 3, name: 'Mercedes GLE 63', views: 850, leads: 8, img: 'https://via.placeholder.com/100' },
  ];

  return (
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
