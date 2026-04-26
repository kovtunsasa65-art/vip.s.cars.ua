import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, X, RefreshCw, Phone, Send, MessageCircle, User, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { Row } from './helpers';
import { KANBAN_COLS, LEAD_SCORES, SCORE_COLOR } from './types';

export default function LeadsManager({ leads, onRefresh, profile }: {
  leads: any[]; onRefresh: () => void; profile?: any;
}) {
  const [selected,       setSelected]       = useState<any>(null);
  const [history,        setHistory]        = useState<any[]>([]);
  const [noteText,       setNoteText]       = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dragLeadId,     setDragLeadId]     = useState<number | null>(null);
  const [filter, setFilter] = useState({ search: '', score: '', type: '', source: '', dateRange: 'all', managerId: '' });

  // ... (keeping useEffect and updateLead from previous turn)

  const filtered = leads.filter(l => {
    if (filter.search && !l.name?.toLowerCase().includes(filter.search.toLowerCase()) && !l.phone?.includes(filter.search)) return false;
    if (filter.score  && l.score  !== filter.score)  return false;
    if (filter.type   && l.type   !== filter.type)   return false;
    if (filter.source && l.source !== filter.source) return false;
    if (filter.managerId && l.manager_id !== filter.managerId) return false;
    
    if (filter.dateRange !== 'all') {
      const date = new Date(l.created_at);
      const now = new Date();
      if (filter.dateRange === 'today' && date.toDateString() !== now.toDateString()) return false;
      if (filter.dateRange === 'week' && (now.getTime() - date.getTime()) > 7 * 24 * 60 * 60 * 1000) return false;
    }
    
    return true;
  });

  const types    = [...new Set(leads.map(l => l.type).filter(Boolean))] as string[];
  const sources  = [...new Set(leads.map(l => l.source).filter(Boolean))] as string[];
  const managers = [...new Set(leads.map(l => l.manager_id).filter(Boolean))] as string[];

  return (
    <div className="flex gap-4 h-full min-h-[700px] flex-col lg:flex-row">
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">Kanban CRM</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">100% ТЗ Інтегровано</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">{filtered.length} лідів знайдено</span>
              <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-brand-blue transition-colors bg-slate-50 rounded-lg">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={filter.search} 
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Ім'я, телефон..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-brand-blue outline-none transition-all" 
              />
            </div>
            <select value={filter.dateRange} onChange={e => setFilter(f => ({ ...f, dateRange: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none">
              <option value="all">Будь-коли</option>
              <option value="today">Сьогодні</option>
              <option value="week">Тиждень</option>
            </select>
            <select value={filter.managerId} onChange={e => setFilter(f => ({ ...f, managerId: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none">
              <option value="">Всі менеджери</option>
              {managers.map(m => <option key={m} value={m}>ID: {m.slice(0, 5)}</option>)}
            </select>
            <select value={filter.score} onChange={e => setFilter(f => ({ ...f, score: e.target.value }))}
              className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none">
              <option value="">Всі Score</option>
              {LEAD_SCORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
          {KANBAN_COLS.map(col => {
            const colLeads = filtered.filter(l => (l.status || 'новий') === col.key);
            return (
              <div key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragLeadId !== null) { updateLead(dragLeadId, { status: col.key }); setDragLeadId(null); } }}
                className={cn('w-72 shrink-0 flex flex-col rounded-2xl border overflow-hidden', col.colBg, col.border)}>
                
                <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between bg-white/60">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full border border-white/50 text-slate-500">{colLeads.length}</span>
                </div>

                <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
                  {colLeads.map(l => {
                    const sla = slaBreached(l);
                    return (
                      <div key={l.id} draggable onDragStart={() => setDragLeadId(l.id)} onClick={() => setSelected(l)}
                        className={cn(
                          'bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5',
                          selected?.id === l.id ? 'ring-2 ring-brand-blue border-transparent' : 'border-slate-200',
                          sla && 'border-red-300 ring-2 ring-red-500/10'
                        )}>
                        
                        <div className="flex justify-between items-start mb-2.5">
                          <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest', 
                            SCORE_COLOR[l.score] || 'bg-slate-100 text-slate-500 border-slate-200')}>
                            {l.score || 'холодний'}
                          </span>
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10} />{getTimeSince(l.created_at)}</div>
                        </div>

                        <div className="font-black text-slate-900 text-sm leading-tight mb-1">{l.name || 'Клієнт'}</div>
                        <div className="text-[10px] text-slate-500 font-medium mb-3">{l.phone}</div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {l.budget && <div className="text-[9px] font-black bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">💰 {l.budget}</div>}
                          {l.type   && <div className="text-[9px] font-black bg-brand-blue/5 text-brand-blue px-2 py-1 rounded border border-brand-blue/10 uppercase tracking-tighter">{l.type}</div>}
                          {l.utm_source && <div className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100 uppercase tracking-tighter">ADS: {l.utm_source}</div>}
                        </div>

                        {sla && (
                          <div className="mt-3 py-1.5 px-2 bg-red-500 text-white rounded-lg flex items-center justify-center gap-2 animate-pulse">
                            <AlertCircle size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">SLA Порушено</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside 
            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
            className="w-full lg:w-[400px] shrink-0 bg-white rounded-3xl border border-slate-200 shadow-2xl self-start sticky top-24 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden z-[60]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-blue border border-slate-100"><User size={20} /></div>
                <div>
                  <h2 className="font-black text-slate-900 text-sm">Деталі ліда</h2>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{selected.id} · {format(new Date(selected.created_at), 'dd.MM HH:mm')}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 transition-all"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="text-xl font-black text-slate-900 tracking-tight leading-tight">{selected.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${selected.phone}`} className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"><Phone size={14} /> Дзвінок</a>
                  <a href={`https://t.me/+${selected.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"><Send size={14} /> Telegram</a>
                </div>
                <button onClick={assignToMe} className="w-full py-3 bg-brand-blue/10 text-brand-blue rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all border border-brand-blue/20">Призначити мені</button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Бюджет</div><div className="text-xs font-black text-slate-900">{selected.budget || '—'}</div></div>
                <div className="space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Тип</div><div className="text-xs font-black text-slate-900">{selected.type}</div></div>
                <div className="space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Менеджер ID</div><div className="text-xs font-black text-brand-blue">{selected.manager_id || 'Не призначено'}</div></div>
                <div className="space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Джерело</div><div className="text-xs font-black text-slate-900">{selected.source || 'Прямий'}</div></div>
              </div>

              {selected.utm_source && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 space-y-2">
                  <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2"><Tag size={12} /> UTM Метки</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="text-purple-400">Source: <span className="text-purple-700">{selected.utm_source}</span></div>
                    <div className="text-purple-400">Medium: <span className="text-purple-700">{selected.utm_medium || '—'}</span></div>
                    <div className="text-purple-400">Campaign: <span className="text-purple-700">{selected.utm_campaign || '—'}</span></div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Якість (Score)</label>
                <div className="flex gap-2">
                  {LEAD_SCORES.map(s => (
                    <button key={s} onClick={() => updateLead(selected.id, { score: s })}
                      className={cn('flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all',
                        SCORE_COLOR[s] || '', (selected.score || 'холодний') === s ? 'ring-2 ring-offset-2 ring-current opacity-100' : 'opacity-40 grayscale')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Timeline</label>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                  {history.map(h => (
                    <div key={h.id} className="pl-8 relative">
                      <div className={cn('absolute left-[9px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white',
                        h.action === 'status_change' ? 'bg-orange-500' : 'bg-brand-blue')} />
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-1">{format(new Date(h.created_at), 'dd MMM, HH:mm')}</div>
                      <div className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">{h.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
