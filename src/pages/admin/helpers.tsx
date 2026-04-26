import { cn } from '../../lib/utils';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export function NavItem({ icon, label, active, onClick, badge, isOpen }: any) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 group',
        active ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
      <div className="flex items-center gap-3">
        <div className={cn('shrink-0 transition-transform', active && 'scale-110')}>{icon}</div>
        {isOpen && <span>{label}</span>}
      </div>
      {badge && isOpen && (
        <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center', active ? 'bg-white text-brand-blue' : 'bg-red-500 text-white')}>
          {badge}
        </span>
      )}
    </button>
  );
}

export function KpiCard({ title, value, sub, trend, icon, color = 'blue' }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-brand-blue', green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600', red: 'bg-red-50 text-red-600', slate: 'bg-slate-50 text-slate-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color])}>{icon}</div>
        {trend && (
          <div className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5', trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')}>
            {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingUp className="rotate-180" size={10} />} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
