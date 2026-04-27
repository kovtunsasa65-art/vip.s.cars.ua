import React from 'react';
import { 
  TrendingUp, Users, Eye, MousePointer2, 
  ArrowUpRight, ArrowDownRight, Calendar, Download 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalyticsProps {
  cars: any[];
  leads: any[];
}

export default function AnalyticsManager({ cars, leads }: AnalyticsProps) {
  // Simple stats calculation
  const totalValue = cars.reduce((acc, car) => acc + (Number(car.price) || 0), 0);
  const avgPrice = cars.length > 0 ? totalValue / cars.length : 0;
  const leadConversion = cars.length > 0 ? (leads.length / cars.length * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Загальна вартість парку', value: `$${totalValue.toLocaleString()}`, trend: '+12.5%', isUp: true, icon: <TrendingUp size={20} /> },
    { label: 'Середня ціна авто', value: `$${Math.round(avgPrice).toLocaleString()}`, trend: '-2.1%', isUp: false, icon: <Users size={20} /> },
    { label: 'Конверсія в заявку', value: `${leadConversion}%`, trend: '+5.4%', isUp: true, icon: <MousePointer2 size={20} /> },
    { label: 'Активні оголошення', value: cars.filter(c => c.status === 'active').length.toString(), trend: '+2', isUp: true, icon: <Eye size={20} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">📈 Аналітичний Центр</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Детальна статистика та показники ефективності</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={14} /> Останні 30 днів
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg">
            <Download size={14} /> Експорт PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                {s.icon}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                s.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {s.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {s.trend}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col">
          <h3 className="font-black text-slate-900 text-sm mb-6 uppercase tracking-wider">Динаміка переглядів</h3>
          <div className="flex-1 flex items-end gap-2 pb-2">
            {/* Simple CSS bars for visualization */}
            {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40, 55, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-blue/10 rounded-t-lg relative group transition-all hover:bg-brand-blue/30 cursor-pointer">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t-lg transition-all" 
                  style={{ height: `${h}%` }} 
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-4">
            <span>Січень</span>
            <span>Березень</span>
            <span>Травень</span>
            <span>Липень</span>
            <span>Вересень</span>
            <span>Листопад</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-black text-slate-900 text-sm mb-6 uppercase tracking-wider">Розподіл за категоріями</h3>
          <div className="space-y-4">
            {[
              { label: 'Седани', count: 12, color: 'bg-blue-500' },
              { label: 'Кросовери', count: 8, color: 'bg-indigo-500' },
              { label: 'Купе', count: 4, color: 'bg-emerald-500' },
              { label: 'Електромобілі', count: 3, color: 'bg-amber-500' },
            ].map((c, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="text-slate-900">{c.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", c.color)} 
                    style={{ width: `${(c.count / 27 * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
