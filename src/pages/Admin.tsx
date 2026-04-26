import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import CarCard from '../components/CarCard';
import { PHONE_RAW } from '../lib/config';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Car, Users, Phone, Plus, Trash2, Edit2,
  Eye, TrendingUp, X, Search, ChevronRight, Zap, Settings,
  Image, ArrowUpRight, FileText, AlertTriangle, Download,
  MessageSquareText, Menu, User, Bell, CheckCircle2, ShieldCheck, Send, RefreshCw, MessageCircle, MapPin,
  Star, ThumbsUp, ThumbsDown, Globe, BarChart2, LogOut
} from 'lucide-react';

type Tab = 'dashboard' | 'cars' | 'leads' | 'users' | 'seo' | 'analytics' | 'ai' | 'content' | 'settings' | 'media';

const LEAD_STATUSES = ['новий', 'в роботі', "зв'язались", 'закрито (виграш)', 'закрито (програш)'];
const LEAD_SCORES   = ['гарячий', 'теплий', 'холодний'];

const KANBAN_COLS = [
  { key: 'новий',               label: 'Нові',               colBg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-400'   },
  { key: 'в роботі',           label: 'В роботі',           colBg: 'bg-yellow-50', border: 'border-yellow-200',dot: 'bg-yellow-400' },
  { key: "зв'язались",        label: "Зв'язались",        colBg: 'bg-purple-50', border: 'border-purple-200',dot: 'bg-purple-400' },
  { key: 'закрито (виграш)',   label: 'Закрито (виграш)',   colBg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500'  },
  { key: 'закрито (програш)',  label: 'Закрито (програш)', colBg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-400'    },
];

const SCORE_COLOR: Record<string, string> = {
  гарячий:  'bg-red-100 text-red-700 border-red-200',
  теплий:   'bg-orange-100 text-orange-700 border-orange-200',
  холодний: 'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_LABELS: Record<string, string> = {
  'новий':              'Нові',
  'в роботі':           'В роботі',
  "зв'язались":        "Зв'язались",
  'закрито (виграш)':  'Закрито (виграш)',
  'закрито (програш)': 'Закрито (програш)',
};

// ─── UI Helpers ──────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge, isOpen }: any) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 group',
        active ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}
    >
      <div className="flex items-center gap-3">
        <div className={cn("shrink-0 transition-transform", active && "scale-110")}>{icon}</div>
        {isOpen && <span>{label}</span>}
      </div>
      {badge && isOpen && <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center", active ? "bg-white text-brand-blue" : "bg-red-500 text-white")}>{badge}</span>}
    </button>
  );
}

function KpiCard({ title, value, sub, trend, icon, color = 'blue' }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-brand-blue', green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600', red: 'bg-red-50 text-red-600', slate: 'bg-slate-50 text-slate-600',
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

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────
function Dashboard({ leads, cars, stats, aiLogsCount, setTab }: { leads: any[]; cars: any[]; stats: any[]; aiLogsCount: number; setTab: (t: Tab) => void }) {
  const [range, setRange] = useState(7);
  const totalViews = cars.reduce((s, c) => s + (c.views_count ?? 0), 0);
  const hotLeads = leads.filter(l => l.score === 'гарячий' && (l.status || 'новий') === 'новий');

  // Підготовка даних для графіка
  const chartData = stats.slice(0, range).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Відвідувачі" value={totalViews.toLocaleString()} trend={12} icon={<Eye size={20} />} color="blue" sub="за весь час" />
        <KpiCard title="Заявки" value={leads.length} trend={20} icon={<Users size={20} />} color="green" sub="всього в базі" />
        <KpiCard title="AI-Дії" value={aiLogsCount} icon={<Zap size={20} />} color="orange" sub="автоматизацій" />
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

// ─── CRM (Leads) ─────────────────────────────────────────────
function LeadsManager({ leads, onRefresh, profile }: { leads: any[]; onRefresh: () => void; profile?: any }) {
  const [selected,       setSelected]       = useState<any>(null);
  const [history,        setHistory]        = useState<any[]>([]);
  const [noteText,       setNoteText]       = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dragLeadId,     setDragLeadId]     = useState<number | null>(null);
  const [filter, setFilter] = useState({ search: '', score: '', type: '', source: '' });

  useEffect(() => {
    if (!selected) return;
    setLoadingHistory(true);
    supabase.from('lead_history').select('*').eq('lead_id', selected.id).order('created_at', { ascending: true })
      .then(({ data }) => { setHistory(data ?? []); setLoadingHistory(false); });
  }, [selected?.id]);

  const updateLead = async (id: number, patch: any) => {
    const old = leads.find(l => l.id === id);
    await supabase.from('leads').update(patch).eq('id', id);
    const events: any[] = [];
    if (patch.status && patch.status !== old?.status)
      events.push({ lead_id: id, action: 'status_change', from_value: old?.status, to_value: patch.status, comment: `${old?.status} → ${patch.status}` });
    if (patch.score && patch.score !== old?.score)
      events.push({ lead_id: id, action: 'score_change', from_value: old?.score, to_value: patch.score, comment: `Score: ${old?.score} → ${patch.score}` });
    if (events.length) await supabase.from('lead_history').insert(events);
    onRefresh();
    if (selected?.id === id) {
      setSelected((p: any) => ({ ...p, ...patch }));
      const { data } = await supabase.from('lead_history').select('*').eq('lead_id', id).order('created_at', { ascending: true });
      setHistory(data ?? []);
    }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selected) return;
    await supabase.from('lead_history').insert([{ lead_id: selected.id, action: 'note', comment: noteText }]);
    setNoteText('');
    const { data } = await supabase.from('lead_history').select('*').eq('lead_id', selected.id).order('created_at', { ascending: true });
    setHistory(data ?? []);
  };

  const assignToMe = async () => {
    if (!selected || !profile?.id) return;
    await updateLead(selected.id, { manager_id: profile.id });
    toast.success('Призначено вам');
  };

  const slaBreached = (l: any) =>
    l.status === 'новий' && Date.now() - new Date(l.created_at).getTime() > 15 * 60 * 1000;

  const filtered = leads.filter(l => {
    if (filter.search && !l.name?.toLowerCase().includes(filter.search.toLowerCase()) && !l.phone?.includes(filter.search)) return false;
    if (filter.score  && l.score  !== filter.score)  return false;
    if (filter.type   && l.type   !== filter.type)   return false;
    if (filter.source && l.source !== filter.source) return false;
    return true;
  });

  const types   = [...new Set(leads.map(l => l.type).filter(Boolean))] as string[];
  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))] as string[];

  return (
    <div className="flex gap-4 h-full min-h-[600px]">
      {/* ── Kanban ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <h1 className="text-xl font-black text-slate-900 mr-2">CRM / Ліди</h1>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              placeholder="Ім'я або телефон..."
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-brand-blue focus:outline-none w-44" />
          </div>
          <select value={filter.score} onChange={e => setFilter(f => ({ ...f, score: e.target.value }))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none">
            <option value="">Score: всі</option>
            {LEAD_SCORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none">
            <option value="">Тип: всі</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filter.source} onChange={e => setFilter(f => ({ ...f, source: e.target.value }))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none">
            <option value="">Джерело: всі</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">{filtered.length} лідів</span>
            <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={15} /></button>
          </div>
        </div>

        {/* Board — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_COLS.map(col => {
            const colLeads = filtered.filter(l => (l.status || 'новий') === col.key);
            return (
              <div key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragLeadId !== null) { updateLead(dragLeadId, { status: col.key }); setDragLeadId(null); } }}
                className={cn('w-64 shrink-0 flex flex-col rounded-2xl border overflow-hidden', col.colBg, col.border)}>
                {/* Column header */}
                <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between bg-white/50">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full border border-white">{colLeads.length}</span>
                </div>

                {/* Cards */}
                <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
                  {colLeads.map(l => {
                    const sla = slaBreached(l);
                    return (
                      <div key={l.id}
                        draggable
                        onDragStart={() => setDragLeadId(l.id)}
                        onClick={() => setSelected(l)}
                        className={cn(
                          'bg-white p-3 rounded-xl border shadow-sm cursor-pointer select-none transition-all hover:shadow-md hover:border-brand-blue',
                          selected?.id === l.id ? 'ring-2 ring-brand-blue border-transparent' : 'border-slate-200',
                          sla && 'border-red-300 bg-red-50/60',
                          dragLeadId === l.id && 'opacity-50'
                        )}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase', SCORE_COLOR[l.score] ?? 'bg-slate-100 text-slate-400 border-slate-200')}>
                            {l.score || '—'}
                          </span>
                          <span className="text-[9px] text-slate-400">{l.created_at ? format(new Date(l.created_at), 'dd.MM HH:mm') : ''}</span>
                        </div>
                        <div className="font-black text-slate-900 text-sm leading-tight truncate">{l.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{l.phone}</div>
                        {l.budget && <div className="text-[10px] text-slate-400 mt-1">💰 {l.budget}</div>}
                        {l.type   && <div className="text-[10px] text-brand-blue font-semibold mt-0.5">{l.type}</div>}
                        {sla && (
                          <div className="mt-2 text-[9px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full w-fit">
                            ⚠ SLA &gt;15хв
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {colLeads.length === 0 && (
                    <div className="h-14 border-2 border-dashed border-current/20 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Перетягніть
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lead detail panel ──────────────────────────────── */}
      {selected && (
        <aside className="w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl self-start sticky top-24 max-h-[calc(100vh-130px)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="font-black text-slate-900 text-sm">Лід #{selected.id}</h2>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {selected.created_at ? format(new Date(selected.created_at), 'dd MMM yyyy, HH:mm') : ''}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Name + action buttons */}
            <div className="space-y-3">
              <div className="text-lg font-black text-slate-900 leading-tight">{selected.name}</div>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${selected.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                  <Phone size={12} /> Дзвінок
                </a>
                <a href={`https://t.me/+${selected.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                  <Send size={12} /> Telegram
                </a>
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                    <MessageCircle size={12} /> Email
                  </a>
                )}
                <button onClick={assignToMe}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold hover:bg-brand-blue hover:text-white transition-colors">
                  <User size={12} /> Мені
                </button>
              </div>
            </div>

            {/* SLA warning */}
            {slaBreached(selected) && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-600 font-bold flex items-center gap-2">
                ⚠ SLA порушено — відповідь не надіслана більше 15 хвилин
              </div>
            )}

            {/* Info */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
              <Row label="Телефон"      value={selected.phone} />
              <Row label="Тип"          value={selected.type} />
              <Row label="Бюджет"       value={selected.budget || '—'} />
              <Row label="Джерело"      value={selected.source || '—'} />
              {selected.car_id && <Row label="Авто"     value={`ID: ${selected.car_id}`} />}
              {selected.message && <Row label="Повідомлення" value={selected.message} />}
            </div>

            {/* Score */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Score</label>
              <div className="flex gap-2">
                {LEAD_SCORES.map(s => (
                  <button key={s} onClick={() => updateLead(selected.id, { score: s })}
                    className={cn('flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all',
                      SCORE_COLOR[s] ?? '',
                      (selected.score || 'холодний') === s ? 'ring-2 ring-offset-1 ring-current opacity-100' : 'opacity-50 hover:opacity-80')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Статус / Колонка</label>
              <select value={selected.status || 'новий'} onChange={e => updateLead(selected.id, { status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:border-brand-blue focus:outline-none">
                {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {/* Add note */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Додати нотатку</label>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                placeholder="Коментар, результат дзвінка..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none" />
              <button onClick={addNote} disabled={!noteText.trim()}
                className="w-full mt-2 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-slate-800 transition-colors">
                Зберегти
              </button>
            </div>

            {/* Timeline */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Часова лінія</label>
              {loadingHistory && <div className="text-center text-xs text-slate-300 animate-pulse py-2">Завантаження...</div>}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100">
                {history.map(h => (
                  <div key={h.id} className="pl-8 relative">
                    <div className={cn('absolute left-[9px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white',
                      h.action === 'status_change' ? 'bg-orange-400' : h.action === 'score_change' ? 'bg-purple-400' : 'bg-brand-blue')} />
                    <div className="text-[9px] text-slate-400 font-semibold mb-0.5">{format(new Date(h.created_at), 'dd MMM, HH:mm')}</div>
                    <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed">
                      {(h.action === 'status_change' || h.action === 'score_change') ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-slate-400 line-through">{h.from_value}</span>
                          <ChevronRight size={10} className="text-slate-300" />
                          <span className="font-black text-slate-900">{h.to_value}</span>
                        </div>
                      ) : h.comment}
                    </div>
                  </div>
                ))}
                {history.length === 0 && !loadingHistory && (
                  <div className="pl-8 text-xs text-slate-300 font-semibold">Подій ще немає</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

// ─── Cars Manager ────────────────────────────────────────────
function CarsManager({ cars, onRefresh, profile }: { cars: any[]; onRefresh: () => void; profile: any }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState({ search: '', status: [] as string[], brand: '', noPhotos: false, lowTrust: false, noClicks: false, onlyMy: false });
  const [isAdding, setIsAdding] = useState(false);
  const [editCar, setEditCar] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState<'desc' | 'seo' | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('profiles').select('id, name, email').then(({ data }) => setManagers(data ?? []));
  }, []);

  const deleteSelected = async () => {
    if (!confirm(`Видалити ${selectedIds.length} авто?`)) return;
    await supabase.from('cars').delete().in('id', selectedIds);
    setSelectedIds([]);
    onRefresh();
  };

  const updateSelectedStatus = async (status: string) => {
    await supabase.from('cars').update({ status }).in('id', selectedIds);
    setSelectedIds([]);
    onRefresh();
  };

  const improveAIOdescriptions = async () => {
    if (aiLoading) return;
    const payload = cars.filter(c => selectedIds.includes(c.id))
      .map(c => ({ id: c.id, brand: c.brand, model: c.model, year: c.year, description: c.description }));
    setAiLoading('desc');
    try {
      const res = await fetch('/api/ai/improve-description', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cars: payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Оновлено описи для ${json.updated} авто`);
      setSelectedIds([]);
      onRefresh();
    } catch (e: any) {
      toast.error(`Помилка AI: ${e.message}`);
    } finally {
      setAiLoading(null);
    }
  };

  const generateAISEOBulk = async () => {
    if (aiLoading) return;
    const payload = cars.filter(c => selectedIds.includes(c.id))
      .map(c => ({ id: c.id, brand: c.brand, model: c.model, year: c.year, city: c.city, price: c.price, engine_volume: c.engine_volume, mileage: c.mileage }));
    setAiLoading('seo');
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cars: payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`SEO згенеровано для ${json.updated} авто`);
      setSelectedIds([]);
      onRefresh();
    } catch (e: any) {
      toast.error(`Помилка AI: ${e.message}`);
    } finally {
      setAiLoading(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Price', 'Brand', 'Model', 'Year', 'Status', 'Views', 'Clicks'];
    const rows = filtered.map(c => [c.id, c.title, c.price, c.brand, c.model, c.year, c.status, c.views_count, c.clicks_call]);
    const content = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cars_export_${format(new Date(), 'dd_MM_yyyy')}.csv`);
    link.click();
  };

  const assignManager = async (managerId: string) => {
    await supabase.from('cars').update({ manager_id: managerId }).in('id', selectedIds);
    setSelectedIds([]);
    onRefresh();
  };

  const addBadge = async (badge: string | null) => {
    await supabase.from('cars').update({ badge }).in('id', selectedIds);
    setSelectedIds([]);
    onRefresh();
  };

  const filtered = cars.filter(c => {
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
    if (filters.brand && c.brand !== filters.brand) return false;
    if (filters.noPhotos && (c.car_images?.length || 0) > 0) return false;
    if (filters.lowTrust && (c.trust_score || 0) >= 50) return false;
    if (filters.onlyMy && c.manager_id !== profile?.id) return false;
    if (filters.noClicks) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const isOld = new Date(c.updated_at || c.created_at) < threeDaysAgo;
      if (!isOld || (c.clicks_call || 0) > 0) return false;
    }
    return true;
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'n') { e.preventDefault(); setIsAdding(true); }
      if (e.key === 'e' && selectedIds.length === 1) {
        e.preventDefault();
        const carToEdit = filtered.find(c => c.id === selectedIds[0]);
        if (carToEdit) setEditCar(carToEdit);
      }
      if (e.key === 'Escape') { setSelectedIds([]); setIsAdding(false); setEditCar(null); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIds, filtered]);

  const brands = Array.from(new Set(cars.map(c => c.brand))).sort();

  if (isAdding || editCar) return (
    <CarForm car={editCar} onClose={() => { setIsAdding(false); setEditCar(null); }} onSaved={() => { setIsAdding(false); setEditCar(null); onRefresh(); }} />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          Авто <span className="text-xs font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Експорт
          </button>
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 flex items-center gap-2 hover:scale-[1.02] transition-transform">
            <Plus size={16} /> Додати авто <kbd className="text-[10px] bg-white/20 px-1 rounded ml-1">N</kbd>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={searchRef} type="text" placeholder="Пошук ( / )..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10"
              value={filters.search} onChange={e => setFilters(s => ({ ...s, search: e.target.value }))} />
          </div>
          <select className="bg-slate-50 border border-slate-100 rounded-xl text-sm px-3 py-2 outline-none" value={filters.brand} onChange={e => setFilters(s => ({ ...s, brand: e.target.value }))}>
            <option value="">Всі марки</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['active', 'moderation', 'draft', 'sold'].map(s => (
              <button key={s} onClick={() => setFilters(f => ({ ...f, status: f.status.includes(s) ? f.status.filter(x => x !== s) : [...f.status, s] }))}
                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                  filters.status.includes(s) ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/10" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200")}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 px-2">
            {[
              { k: 'noPhotos', label: 'Без фото', icon: <Image size={14} /> },
              { k: 'lowTrust', label: 'Low Trust', icon: <AlertTriangle size={14} /> },
              { k: 'noClicks', label: 'Без кліків 3+д', icon: <Phone size={14} /> },
            ].map(f => (
              <label key={f.k} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20" checked={(filters as any)[f.k]} onChange={e => setFilters(s => ({ ...s, [f.k]: e.target.checked }))} />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors flex items-center gap-1">{f.icon}{f.label}</span>
              </label>
            ))}
            <div className="h-4 w-px bg-slate-100 mx-2 hidden md:block" />
            <button onClick={() => setFilters(s => ({ ...s, onlyMy: !s.onlyMy }))}
              className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                filters.onlyMy ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100")}>
              {filters.onlyMy ? 'Тільки мої' : 'Всі авто'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[60] flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <span className="w-6 h-6 bg-brand-blue rounded-lg flex items-center justify-center text-[10px] font-black">{selectedIds.length}</span>
              <span className="text-sm font-bold">Вибрано</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group/menu">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-2"><ShieldCheck size={16} className="text-green-400" /> Статус</button>
                <div className="absolute bottom-full left-0 mb-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 hidden group-hover/menu:block min-w-[120px]">
                  {['active', 'moderation', 'sold', 'draft'].map(s => (
                    <button key={s} onClick={() => updateSelectedStatus(s)} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold capitalize">{s}</button>
                  ))}
                </div>
              </div>
              {/* Призначити менеджера */}
              <div className="relative group/mgr">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-2">
                  <User size={16} className="text-blue-400" /> Менеджер
                </button>
                <div className="absolute bottom-full left-0 mb-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 hidden group-hover/mgr:block min-w-[160px] z-10">
                  {managers.length === 0 && <p className="px-3 py-2 text-xs text-slate-400">Немає менеджерів</p>}
                  {managers.map(m => (
                    <button key={m.id} onClick={() => assignManager(m.id)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold truncate">
                      {m.name || m.email}
                    </button>
                  ))}
                </div>
              </div>

              {/* Додати бейдж */}
              <div className="relative group/badge">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" /> Бейдж
                </button>
                <div className="absolute bottom-full left-0 mb-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 hidden group-hover/badge:block min-w-[130px] z-10">
                  {[['нове','blue'],['вигідно','orange'],['терміново','red'],['ексклюзив','purple']].map(([b]) => (
                    <button key={b} onClick={() => addBadge(b)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold capitalize">{b}</button>
                  ))}
                  <button onClick={() => addBadge(null)} className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-xs font-bold text-red-400">Прибрати бейдж</button>
                </div>
              </div>

              <button onClick={improveAIOdescriptions} disabled={!!aiLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 text-brand-blue disabled:opacity-50">
                {aiLoading === 'desc'
                  ? <><div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" /> Обробка...</>
                  : <><Zap size={16} /> AI: Покращити опис</>}
              </button>
              <button onClick={generateAISEOBulk} disabled={!!aiLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 text-yellow-400 disabled:opacity-50">
                {aiLoading === 'seo'
                  ? <><div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> Генерація...</>
                  : <><ArrowUpRight size={16} /> AI SEO</>}
              </button>
              <button onClick={deleteSelected} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2"><Trash2 size={16} /> Видалити</button>
              <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 text-white/50 rounded-lg transition-colors ml-2"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-4 w-10">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={e => setSelectedIds(e.target.checked ? filtered.map(c => c.id) : [])} />
              </th>
              <th className="p-4">Авто</th>
              <th className="p-4">Ціна</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Статистика</th>
              <th className="p-4">Trust</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(c => (
              <tr key={c.id} className={cn("hover:bg-slate-50/50 group transition-colors", selectedIds.includes(c.id) && "bg-brand-blue/5")}>
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20"
                    checked={selectedIds.includes(c.id)} onChange={() => setSelectedIds(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 relative">
                      {c.car_images?.[0]?.url && <img src={c.car_images[0].url} className="w-full h-full object-cover" alt="" />}
                      {c.is_checked && <div className="absolute top-0 right-0 p-0.5 bg-green-500 text-white rounded-bl-lg"><ShieldCheck size={10} /></div>}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 truncate group-hover:text-brand-blue transition-colors">{c.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{c.brand} {c.model} · {c.year}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-black text-slate-900">${Number(c.price).toLocaleString()}</div>
                  {c.price_diff_percent && (
                    <div className={cn("text-[9px] font-black uppercase tracking-tighter", Number(c.price_diff_percent) < 0 ? "text-green-500" : "text-red-500")}>
                      {Number(c.price_diff_percent) < 0 ? '↓' : '↑'} {Math.abs(Number(c.price_diff_percent))}% від ринку
                    </div>
                  )}
                </td>
                <td className="p-4"><span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase", c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>{c.status}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1"><Eye size={12} /> {c.views_count}</div>
                    <div className="flex items-center gap-1 text-brand-blue"><Phone size={12} /> {c.clicks_call}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full", c.trust_score >= 70 ? "bg-green-500" : c.trust_score >= 40 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${c.trust_score}%` }} />
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditCar(c)} className="p-2 hover:bg-brand-blue/10 text-brand-blue rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={async () => { if (confirm('Видалити?')) { await supabase.from('cars').delete().eq('id', c.id); onRefresh(); } }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Car Form ─────────────────────────────────────────────────
const STEPS = ['Основне', 'Характеристики', 'Фото', 'Опис + SEO'];

function CarForm({ car, onClose, onSaved }: { car?: any; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!car;
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: car?.title ?? '',
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year ?? new Date().getFullYear(),
    price: car?.price ?? '',
    currency: car?.currency ?? 'USD',
    city: car?.city ?? 'Київ',
    mileage: car?.mileage ?? '',
    engine_volume: car?.engine_volume ?? '',
    engine_type: car?.engine_type ?? '',
    transmission: car?.transmission ?? '',
    drive_type: car?.drive_type ?? '',
    power_hp: car?.power_hp ?? '',
    owners_count: car?.owners_count ?? 1,
    accidents_count: car?.accidents_count ?? 0,
    listing_type: car?.listing_type ?? 'company',
    vin: car?.vin ?? '',
    description: car?.description ?? '',
    seller_name_public: car?.seller_name_public ?? '',
    seller_phone_public: car?.seller_phone_public ?? '',
    is_checked: car?.is_checked ?? false,
    service_history: car?.service_history ?? false,
    status: car?.status ?? 'moderation',
    badge: car?.badge ?? '',
    seo_title: car?.seo_title ?? '',
    seo_description: car?.seo_description ?? '',
    seo_h1: car?.seo_h1 ?? '',
  });

  const [images, setImages]         = useState<any[]>(car?.car_images ?? []);
  const [uploading, setUploading]   = useState(false);
  const [dragIdx, setDragIdx]       = useState<number | null>(null);
  const [brandOpts, setBrandOpts]   = useState<string[]>([]);
  const [modelOpts, setModelOpts]   = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef      = useRef<HTMLDivElement>(null);

  // Автодоповнення брендів при монтуванні
  useEffect(() => {
    supabase.from('cars').select('brand').eq('status', 'active')
      .then(({ data }) => data && setBrandOpts([...new Set(data.map((r: any) => r.brand))].filter(Boolean).sort() as string[]));
  }, []);

  // Автодоповнення моделей при зміні бренду
  useEffect(() => {
    if (!form.brand) { setModelOpts([]); return; }
    supabase.from('cars').select('model').eq('brand', form.brand).eq('status', 'active')
      .then(({ data }) => data && setModelOpts([...new Set(data.map((r: any) => r.model))].filter(Boolean).sort() as string[]));
  }, [form.brand]);

  const set = (k: string) => (e: React.ChangeEvent<any>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // ─── Drag & drop photo reorder ───────────────────────────────
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDrop = async (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    const next = [...images];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    const updated = next.map((img, i) => ({ ...img, sort_order: i }));
    setImages(updated);
    setDragIdx(null);
    if (isEdit) {
      await Promise.all(updated.map(img => img.id && supabase.from('car_images').update({ sort_order: img.sort_order }).eq('id', img.id)));
    }
  };

  // ─── Drag & drop upload from outside ─────────────────────────
  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) uploadFiles(files);
  };

  async function uploadFiles(files: File[]) {
    setUploading(true);
    for (const file of files) {
      try {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const { data, error } = await supabase.storage.from('cars').upload(path, file);
        if (error) throw error;
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('cars').getPublicUrl(path);
          const newImg = { url: publicUrl, is_cover: images.length === 0, sort_order: images.length };
          if (isEdit) {
            const { data: savedImg } = await supabase.from('car_images').insert([{
              car_id: car.id, url: publicUrl, url_webp: publicUrl,
              is_cover: newImg.is_cover, sort_order: newImg.sort_order
            }]).select().single();
            setImages(p => [...p, savedImg]);
          } else {
            setImages(p => [...p, newImg]);
          }
        }
      } catch { toast.error('Помилка завантаження фото'); }
    }
    setUploading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    await uploadFiles(Array.from(e.target.files));
  }

  async function deleteImage(img: any) {
    if (!confirm('Видалити фото?')) return;
    try {
      if (img.id) await supabase.from('car_images').delete().eq('id', img.id);
      const path = img.url.split('/').pop();
      await supabase.storage.from('cars').remove([path]);
      setImages(p => p.filter(i => i.url !== img.url));
    } catch { /* ignore */ }
  }

  async function setCover(img: any) {
    if (isEdit && img.id) {
      await supabase.from('car_images').update({ is_cover: false }).eq('car_id', car.id);
      await supabase.from('car_images').update({ is_cover: true }).eq('id', img.id);
    }
    setImages(p => p.map(i => ({ ...i, is_cover: i.url === img.url })));
  }

  async function generateAiSeo() {
    setUploading(true);
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          save: false,
          cars: [{ id: car?.id ?? 0, brand: form.brand, model: form.model, year: Number(form.year), city: form.city, price: Number(form.price), engine_volume: Number(form.engine_volume), mileage: Number(form.mileage) }],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const seo = json.results?.[0];
      if (seo) setForm(p => ({ ...p, seo_title: seo.seo_title, seo_description: seo.seo_description, seo_h1: `${form.brand} ${form.model} ${form.year}` }));
    } catch (e: any) {
      setForm(p => ({ ...p, seo_title: `Купити ${form.brand} ${form.model} ${form.year} — VIP.S Cars`, seo_description: `${form.brand} ${form.model} (${form.year}) у ${form.city}. Пробіг ${form.mileage} км.`, seo_h1: `${form.brand} ${form.model} ${form.year}` }));
    } finally { setUploading(false); }
  }

  async function improveDescription() {
    if (!form.brand) return;
    setUploading(true);
    try {
      const res = await fetch('/api/ai/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save: false, cars: [{ id: car?.id ?? 0, brand: form.brand, model: form.model, year: Number(form.year), description: form.description }] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const improved = json.results?.[0]?.description;
      if (improved) { setForm(p => ({ ...p, description: improved })); toast.success('Опис покращено'); }
    } catch (e: any) { toast.error(`AI помилка: ${e.message}`); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.brand || !form.model || !form.price) { toast.error('Заповніть обов\'язкові поля (Марка, Модель, Ціна)'); return; }
    setSaving(true);
    try {
      const seoSlug = isEdit ? car.seo_slug : `${form.brand}-${form.model}-${form.year}-${Math.random().toString(36).substring(2, 5)}`.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        ...form,
        year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage),
        engine_volume: form.engine_volume ? Number(form.engine_volume) : null,
        power_hp: form.power_hp ? Number(form.power_hp) : null,
        owners_count: Number(form.owners_count), accidents_count: Number(form.accidents_count),
        trust_score: calcTrustScore(form), seo_slug: seoSlug,
      };

      let carId = car?.id;
      if (isEdit) {
        await supabase.from('cars').update(payload).eq('id', car.id);
      } else {
        const { data: newCar, error } = await supabase.from('cars').insert([payload]).select().single();
        if (error) throw error;
        carId = newCar.id;
        await Promise.all(images.map((img, i) =>
          supabase.from('car_images').insert([{ car_id: carId, url: img.url, url_webp: img.url, is_cover: img.is_cover || i === 0, sort_order: i }])
        ));
      }

      // Ринкова медіана
      if (carId) {
        const { data: market } = await supabase.from('market_prices').select('median_price')
          .eq('brand', form.brand).eq('model', form.model).eq('year', Number(form.year)).maybeSingle();
        if (market?.median_price) await supabase.from('cars').update({ market_price: market.median_price }).eq('id', carId);
      }

      // Тригер AI-правил при активній публікації
      if (form.status === 'active') {
        fetch('/api/subscription-check', { method: 'POST' }).catch(() => {});
      }

      toast.success(isEdit ? 'Збережено' : 'Авто опубліковано');
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all";
  const label = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block";

  const trust = calcTrustScore(form);
  const previewCar = { ...form, car_images: images, trust_score: trust, price: Number(form.price) || 0 };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isEdit ? 'Редагувати оголошення' : 'Нове авто'}</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{isEdit ? `ID: ${car.id}` : 'Крок ' + step + ' з 4'}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const n = i + 1;
          return (
            <React.Fragment key={n}>
              <button onClick={() => setStep(n)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  step === n ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : n < step ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200')}>
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black',
                  step === n ? 'bg-white/20' : n < step ? 'bg-green-500 text-white' : 'bg-slate-300 text-white')}>
                  {n < step ? '✓' : n}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 rounded', n < step ? 'bg-green-300' : 'bg-slate-200')} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />

      {/* Datalists for autocomplete */}
      <datalist id="car-brands">{brandOpts.map(b => <option key={b} value={b} />)}</datalist>
      <datalist id="car-models">{modelOpts.map(m => <option key={m} value={m} />)}</datalist>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Main content ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Step 1: Основне ── */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Основна інформація</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={label}>Марка *</label>
                  <input list="car-brands" value={form.brand} onChange={set('brand')} className={inp} placeholder="Почніть вводити марку..." autoComplete="off" />
                </div>
                <div>
                  <label className={label}>Модель *</label>
                  <input list="car-models" value={form.model} onChange={set('model')} className={inp} placeholder={form.brand ? 'Оберіть модель...' : 'Спочатку оберіть марку'} autoComplete="off" />
                </div>
                <div><label className={label}>Рік *</label><input type="number" value={form.year} onChange={set('year')} className={inp} min="1990" max={new Date().getFullYear() + 1} /></div>
                <div><label className={label}>Місто *</label><input value={form.city} onChange={set('city')} className={inp} placeholder="Київ" /></div>
                <div>
                  <label className={label}>Ціна *</label>
                  <div className="flex gap-2">
                    <select value={form.currency} onChange={set('currency')} className={cn(inp, 'w-24 shrink-0')}>
                      <option value="USD">$</option>
                      <option value="UAH">₴</option>
                      <option value="EUR">€</option>
                    </select>
                    <input type="number" value={form.price} onChange={set('price')} className={inp} placeholder="0" />
                  </div>
                </div>
                <div><label className={label}>Пробіг (км) *</label><input type="number" value={form.mileage} onChange={set('mileage')} className={inp} placeholder="0" /></div>
              </div>
            </div>
          )}

          {/* ── Step 2: Характеристики ── */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Технічні характеристики</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className={label}>Об'єм двигуна (л)</label><input step="0.1" type="number" value={form.engine_volume} onChange={set('engine_volume')} className={inp} placeholder="2.0" /></div>
                <div><label className={label}>Потужність (к.с.)</label><input type="number" value={form.power_hp} onChange={set('power_hp')} className={inp} placeholder="150" /></div>
                <div>
                  <label className={label}>Паливо</label>
                  <select value={form.engine_type} onChange={set('engine_type')} className={inp}>
                    <option value="">—</option>
                    {['бензин', 'дизель', 'газ/бензин', 'електро', 'гібрид'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>КПП</label>
                  <select value={form.transmission} onChange={set('transmission')} className={inp}>
                    <option value="">—</option>
                    {['автомат', 'механіка', 'варіатор', 'робот'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Привід</label>
                  <select value={form.drive_type} onChange={set('drive_type')} className={inp}>
                    <option value="">—</option>
                    {['передній', 'задній', 'повний'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><label className={label}>VIN (17 символів)</label><input value={form.vin} onChange={set('vin')} className={inp} maxLength={17} placeholder="WBAFR9100BC..." /></div>
                <div><label className={label}>Власників</label><input type="number" value={form.owners_count} onChange={set('owners_count')} className={inp} min="1" /></div>
                <div><label className={label}>ДТП</label><input type="number" value={form.accidents_count} onChange={set('accidents_count')} className={inp} min="0" /></div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={form.is_checked} onChange={set('is_checked')} className="w-5 h-5 accent-brand-blue" />
                  <span className="text-sm font-bold text-slate-700">Перевірено нами</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={form.service_history} onChange={set('service_history')} className="w-5 h-5 accent-brand-blue" />
                  <span className="text-sm font-bold text-slate-700">Є сервісна книжка</span>
                </label>
              </div>
            </div>
          )}

          {/* ── Step 3: Фото ── */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Фотографії</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Перетягніть для зміни порядку • Перша = обкладинка</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all">
                  {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />} Додати фото
                </button>
              </div>

              {/* Drop zone */}
              <div ref={dropRef} onDragOver={e => e.preventDefault()} onDrop={handleDropZone}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400 font-semibold hover:border-brand-blue/40 transition-colors">
                Перетягніть фото сюди або натисніть «Додати фото»
              </div>

              {/* Photo grid with DnD reorder */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={img.url + i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    className={cn('relative aspect-[4/3] rounded-2xl overflow-hidden border-2 group cursor-grab active:cursor-grabbing transition-all',
                      img.is_cover ? 'border-brand-blue' : 'border-slate-100',
                      dragIdx === i ? 'opacity-50 scale-95' : 'opacity-100')}>
                    <img src={img.url} className="w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setCover(img)} title="Зробити головною"
                        className="p-2 bg-white text-slate-900 rounded-lg hover:bg-brand-blue hover:text-white transition-colors">
                        <ShieldCheck size={15} />
                      </button>
                      <button onClick={() => deleteImage(img)}
                        className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {img.is_cover && (
                      <div className="absolute top-2 left-2 bg-brand-blue text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Головна</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</div>
                  </div>
                ))}
                {images.length === 0 && !uploading && (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="col-span-4 aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-brand-blue/30 hover:text-brand-blue transition-all cursor-pointer">
                    <Image size={40} className="mb-2" />
                    <span className="text-xs font-black uppercase tracking-widest">Фото відсутні — натисніть або перетягніть</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 4: Опис + SEO ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <h2 className="text-lg font-black text-slate-900">Опис авто</h2>
                  <button onClick={improveDescription} disabled={uploading || !form.brand}
                    className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-40">
                    {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />} AI: Покращити
                  </button>
                </div>
                <textarea value={form.description} onChange={set('description')} rows={8}
                  className={cn(inp, 'resize-none')} placeholder="Детальний опис стану авто, комплектації, особливостей..." />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <h2 className="text-lg font-black text-slate-900">SEO</h2>
                  <button onClick={generateAiSeo} disabled={uploading || !form.brand}
                    className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-40">
                    {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />} AI: Згенерувати SEO
                  </button>
                </div>
                <div><label className={label}>Meta Title (до 60 символів)</label>
                  <input value={form.seo_title} onChange={set('seo_title')} className={inp} placeholder="Купити BMW X5 2022 в Києві..." />
                  <p className={cn('text-right text-[10px] mt-1 font-semibold', form.seo_title.length > 60 ? 'text-red-400' : 'text-slate-300')}>{form.seo_title.length}/60</p>
                </div>
                <div><label className={label}>Meta Description (до 155 символів)</label>
                  <textarea value={form.seo_description} onChange={set('seo_description')} rows={3} className={cn(inp, 'resize-none')} placeholder="Опис для пошукових систем..." />
                  <p className={cn('text-right text-[10px] mt-1 font-semibold', form.seo_description.length > 155 ? 'text-red-400' : 'text-slate-300')}>{form.seo_description.length}/155</p>
                </div>
                <div><label className={label}>H1 заголовок</label>
                  <input value={form.seo_h1} onChange={set('seo_h1')} className={inp} placeholder={`${form.brand} ${form.model} ${form.year}`} />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Публікація</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Статус</label>
                    <select value={form.status} onChange={set('status')} className={cn(inp, 'font-bold bg-brand-blue/5 border-brand-blue/20')}>
                      <option value="active">Активне</option>
                      <option value="moderation">Модерація</option>
                      <option value="sold">Продано</option>
                      <option value="draft">Чернетка</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Бейдж</label>
                    <select value={form.badge} onChange={set('badge')} className={inp}>
                      <option value="">Без бейджа</option>
                      {['нове', 'вигідно', 'терміново', 'ексклюзив'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 justify-between">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all">
              ← Назад
            </button>
            {step < 4
              ? <button onClick={() => setStep(s => s + 1)}
                  className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all">
                  Далі →
                </button>
              : <button onClick={save} disabled={saving}
                  className="px-8 py-3 bg-brand-blue text-white rounded-xl font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><RefreshCw size={16} className="animate-spin" /> Збереження...</> : isEdit ? '✓ Зберегти зміни' : '✓ Опублікувати'}
                </button>
            }
          </div>
        </div>

        {/* ─── Right: Live Preview + controls ──────────── */}
        <div className="space-y-4 sticky top-24 self-start">
          {/* Live preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 px-1">Live Preview</p>
            <div className="pointer-events-none">
              <CarCard car={previewCar} />
            </div>
          </div>

          {/* Trust score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Trust Score</span>
              <span className={cn('text-lg font-black', trust >= 70 ? 'text-green-500' : trust >= 40 ? 'text-yellow-500' : 'text-red-400')}>{trust}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full transition-all duration-500', trust >= 70 ? 'bg-green-500' : trust >= 40 ? 'bg-yellow-500' : 'bg-red-400')} style={{ width: `${trust}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {trust >= 70 ? 'Висока довіра' : trust >= 40 ? 'Середня довіра' : 'Низька — заповніть більше полів'}
            </p>
          </div>

          <button onClick={onClose} className="w-full py-2.5 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors text-center">
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}

function calcTrustScore(form: any): number {
  let s = 10; // Базова довіра
  if (form.vin?.length === 17) s += 30;
  if (form.is_checked) s += 20;
  if (form.service_history) s += 15;
  if (Number(form.accidents_count) === 0) s += 15;
  if (Number(form.owners_count) === 1) s += 10;
  return Math.min(s, 100);
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ phone: PHONE_RAW, telegram: '@vips_cars', pwa_prompt_enabled: true });

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const s: any = { ...settings };
        data.forEach(item => {
          if (item.key === 'pwa_prompt_enabled') s.pwa_prompt_enabled = item.value === 'true';
          if (item.key === 'site_phone') s.phone = item.value;
          if (item.key === 'site_telegram') s.telegram = item.value;
        });
        setSettings(s);
      }
    }
    loadSettings();
  }, []);

  const save = async () => {
    setSaved(true);
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'pwa_prompt_enabled', value: String(settings.pwa_prompt_enabled) }),
      supabase.from('site_settings').upsert({ key: 'site_phone', value: settings.phone }),
      supabase.from('site_settings').upsert({ key: 'site_telegram', value: settings.telegram })
    ]);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-900">Налаштування</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Phone size={16} className="text-brand-blue" /> Контакти</h2>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Телефон</label><input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} className={inp} /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Telegram</label><input value={settings.telegram} onChange={e => setSettings(s => ({ ...s, telegram: e.target.value }))} className={inp} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><Zap size={16} className="text-brand-blue" /> PWA Налаштування</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="text-sm font-bold text-slate-600">Пропозиція встановлення</span>
            <button onClick={() => setSettings(s => ({ ...s, pwa_prompt_enabled: !s.pwa_prompt_enabled }))}
              className={cn('w-11 h-6 rounded-full transition-colors relative', settings.pwa_prompt_enabled ? 'bg-brand-blue' : 'bg-slate-200')}>
              <div className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform', settings.pwa_prompt_enabled ? 'translate-x-5' : 'translate-x-0')} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={save} className={cn("px-12 py-4 rounded-2xl text-white font-black shadow-xl transition-all", saved ? "bg-green-500" : "bg-brand-blue shadow-brand-blue/20 hover:scale-105 uppercase tracking-widest")}>{saved ? 'Збережено' : 'Зберегти зміни'}</button></div>
    </div>
  );
}

// ─── Users Manager ───────────────────────────────────────────
function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(id: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', id);
    loadUsers();
  }

  const roleColors: any = { admin: 'bg-red-100 text-red-700', manager: 'bg-brand-blue/10 text-brand-blue', editor: 'bg-purple-100 text-purple-700', user: 'bg-slate-100 text-slate-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">👥 Команда та Користувачі</h1>
        <button onClick={loadUsers} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={18}/></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-4">Користувач</th>
              <th className="p-4">Роль</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-right">Останній вхід</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" /> : <User size={16}/>}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{u.name || 'Анонім'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{u.phone || u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} 
                    className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer transition-all", roleColors[u.role])}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", u.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="text-[10px] text-slate-500 font-bold">
                    {u.last_login_at ? format(new Date(u.last_login_at), 'dd.MM HH:mm') : 'Ніколи'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SEO Manager ────────────────────────────────────────────
function SeoManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    setLoading(true);
    const { data } = await supabase.from('seo_pages').select('*').order('priority', { ascending: false });
    setPages(data || []);
    setLoading(false);
  }

  async function savePage() {
    if (!editing) return;
    const { id, ...payload } = editing;
    await supabase.from('seo_pages').update(payload).eq('id', id);
    setEditing(null);
    loadPages();
  }

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all";
  const label = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">🔍 SEO Менеджер</h1>
        <button onClick={loadPages} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={18} /></button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-4">Сторінка / Slug</th>
              <th className="p-4">H1 / Title</th>
              <th className="p-4 text-center">Пріоритет</th>
              <th className="p-4 text-center">Індексація</th>
              <th className="p-4 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <div className="text-sm font-black text-slate-900 capitalize">{page.slug === '/' ? 'Головна' : page.slug.replace('/', '').replace('-', ' ')}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{page.slug}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-slate-700 truncate max-w-xs">{page.h1 || '—'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">{page.seo_title || '—'}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500">{page.priority}</span>
                </td>
                <td className="p-4 text-center">
                  {page.is_indexed ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-slate-300 mx-auto" />}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(page)} className="p-2 hover:bg-brand-blue/10 text-brand-blue rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Редагувати SEO: {editing.slug}</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className={label}>H1 Заголовок</label>
                    <input value={editing.h1 || ''} onChange={e => setEditing({ ...editing, h1: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className={label}>Slug (URL)</label>
                    <input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className={label}>Пріоритет (0.0 - 1.0)</label>
                    <input type="number" step="0.1" value={editing.priority || 0.5} onChange={e => setEditing({ ...editing, priority: Number(e.target.value) })} className={inp} />
                  </div>
                  <div className="col-span-2">
                    <label className={label}>Meta Title</label>
                    <input value={editing.seo_title || ''} onChange={e => setEditing({ ...editing, seo_title: e.target.value })} className={inp} />
                  </div>
                  <div className="col-span-2">
                    <label className={label}>Meta Description</label>
                    <textarea value={editing.seo_desc || ''} onChange={e => setEditing({ ...editing, seo_desc: e.target.value })} className={cn(inp, "h-24 resize-none")} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                  <button onClick={() => setEditing(null)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700">Скасувати</button>
                  <button onClick={savePage} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all">Зберегти зміни</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ─── Analytics Manager ───────────────────────────────────────
function AnalyticsManager({ cars, leads }: { cars: any[]; leads: any[] }) {
  const brands = [...new Set(cars.map(c => c.brand))];
  const brandStats = brands.map(b => ({
    name: b,
    count: cars.filter(c => c.brand === b).length,
    views: cars.filter(c => c.brand === b).reduce((s, c) => s + (c.views_count || 0), 0)
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">📊 Повна Аналітика</h1>
        <button className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"><Download size={14}/> Експорт PDF</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Популярність брендів</h3>
            <div className="space-y-6">
              {brandStats.slice(0, 5).map((b, i) => (
                <div key={b.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span>{b.name}</span>
                    <span className="text-slate-400">{b.count} авто ({b.views} пер.)</span>
                  </div>
                  <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", i === 0 ? "bg-brand-blue" : "bg-slate-300")} style={{ width: `${(b.count / cars.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-8">
             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Конверсія (Lead Rate)</h3>
                <div className="text-3xl font-black text-slate-900">
                  {((leads.length / cars.reduce((s, c) => s + (c.views_count || 1), 0)) * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-green-500 font-bold mt-1">+0.5% до м.м.</div>
             </div>
             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Середній чек (Бюджет)</h3>
                <div className="text-3xl font-black text-slate-900">
                  ${(leads.reduce((s, l) => s + (parseInt(l.budget?.replace(/[^0-9]/g, '') || '0')), 0) / (leads.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">на основі {leads.length} заявок</div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
             <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={18} className="text-brand-blue"/> Топ Регіонів</h3>
             <div className="space-y-5">
               {['Київ', 'Львів', 'Одеса', 'Дніпро'].map((city, i) => (
                 <div key={city} className="flex justify-between items-center">
                   <span className="text-sm font-bold">{city}</span>
                   <div className="flex items-center gap-3">
                     <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-blue rounded-full" style={{ width: `${80 - i * 15}%` }} />
                     </div>
                     <span className="text-[10px] font-black text-white/50">{80 - i * 15}%</span>
                   </div>
                 </div>
               ))}
             </div>
           </section>

           <div className="bg-brand-blue rounded-3xl p-8 text-white">
             <h3 className="text-sm font-black uppercase tracking-widest mb-2">Efficiency Score</h3>
             <div className="text-5xl font-black mb-4">8.4</div>
             <p className="text-xs text-white/70 leading-relaxed font-bold">Ваш сайт працює на 24% ефективніше, ніж у середньому по ринку авто-дилерів.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
// ─── AI Manager ──────────────────────────────────────────────
function AiManager() {
  const [activeTab, setActiveTab] = useState<'logs' | 'rules'>('logs');
  const [logs, setLogs] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAI() {
      setLoading(true);
      const [{ data: l }, { data: r }] = await Promise.all([
        supabase.from('ai_logs').select('*, ai_rules(name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('ai_rules').select('*').order('created_at', { ascending: false })
      ]);
      setLogs(l ?? []);
      setRules(r ?? []);
      setLoading(false);
    }
    loadAI();
  }, []);

  async function toggleRule(rule: any) {
    await supabase.from('ai_rules').update({ is_active: !rule.is_active }).eq('id', rule.id);
    setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">🤖 AI Центр</h1>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('logs')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'logs' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50")}>Логи AI</button>
          <button onClick={() => setActiveTab('rules')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'rules' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50")}>Правила</button>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4">Дія / Об'єкт</th>
                <th className="p-4">Режим</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-center">Час</th>
                <th className="p-4 text-right">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-black text-slate-900 capitalize">{log.action.replace('_', ' ')}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.entity} #{log.entity_id} · {log.ai_rules?.name || 'Ручний запуск'}</div>
                  </td>
                  <td className="p-4"><span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", log.mode === 'AUTO' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500")}>{log.mode}</span></td>
                  <td className="p-4">
                    {log.status === 'success' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase"><CheckCircle2 size={12} /> Success</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase" title={log.error}><AlertTriangle size={12} /> Error</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-xs font-bold text-slate-500">{log.duration_ms}ms</td>
                  <td className="p-4 text-right">
                    <div className="text-xs font-black text-slate-900">{format(new Date(log.created_at), 'dd.MM')}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{format(new Date(log.created_at), 'HH:mm')}</div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">Логи відсутні</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue transition-transform group-hover:scale-110"><Zap size={20} /></div>
                <button onClick={() => toggleRule(rule)} className={cn("w-10 h-6 rounded-full relative transition-colors", rule.is_active ? "bg-green-500" : "bg-slate-200")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", rule.is_active ? "left-5" : "left-1")} />
                </button>
              </div>
              <div className="text-lg font-black text-slate-900 leading-none">{rule.name}</div>
              <div className="text-xs text-slate-400 font-bold mt-2 h-8 line-clamp-2">{rule.description}</div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2"><span>ТРИГЕР:</span><span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{rule.trigger_type}</span></div>
                <div className="flex items-center gap-1"><RefreshCw size={10} /> {rule.runs_count} runs</div>
              </div>
            </div>
          ))}
          <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
            <Plus size={24} />
            <span className="text-xs font-black uppercase tracking-widest">Нове правило</span>
          </button>
        </div>
      )}
    </div>
  );
}
// ─── Content Manager ─────────────────────────────────────────
function ContentManager() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'blog'>('reviews');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Керування контентом</h1>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('reviews')} className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeTab === 'reviews' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50')}>Відгуки</button>
          <button onClick={() => setActiveTab('blog')}    className={cn('px-4 py-2 rounded-lg text-sm font-bold transition-all', activeTab === 'blog'    ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50')}>Блог</button>
        </div>
      </div>
      {activeTab === 'reviews' && <ReviewsModerationPanel />}
      {activeTab === 'blog'    && <BlogManager />}
    </div>
  );
}

// ─── Reviews Moderation ───────────────────────────────────────
function ReviewsModerationPanel() {
  const [reviews, setReviews]           = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [adminNotes, setAdminNotes]     = useState<Record<number, string>>({});
  const [busy, setBusy]                 = useState<number | null>(null);
  const [showSeed, setShowSeed]         = useState(false);
  const [seed, setSeed]                 = useState({ user_name: '', rating: 5, review_text: '' });
  const [counts, setCounts]             = useState<Record<string, number>>({});

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => { loadCounts(); }, []);

  async function load() {
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setReviews(data ?? []);
    const notes: Record<number, string> = {};
    (data ?? []).forEach((r: any) => { if (r.admin_note) notes[r.id] = r.admin_note; });
    setAdminNotes(prev => ({ ...prev, ...notes }));
  }

  async function loadCounts() {
    const { data } = await supabase.from('reviews').select('status');
    if (!data) return;
    const c: Record<string, number> = { all: data.length, pending: 0, approved: 0, rejected: 0 };
    data.forEach((r: any) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    setCounts(c);
  }

  async function approve(id: number) {
    setBusy(id);
    await supabase.from('reviews').update({ status: 'approved', admin_note: adminNotes[id] ?? null }).eq('id', id);
    await Promise.all([load(), loadCounts()]);
    setBusy(null);
  }

  async function reject(id: number) {
    const note = (adminNotes[id] ?? '').trim();
    if (!note) { toast.error('Вкажіть причину відхилення в полі «Примітка»'); return; }
    setBusy(id);
    await supabase.from('reviews').update({ status: 'rejected', admin_note: note }).eq('id', id);
    await Promise.all([load(), loadCounts()]);
    setBusy(null);
  }

  async function del(id: number) {
    if (!confirm('Видалити відгук назавжди?')) return;
    setBusy(id);
    await supabase.from('reviews').delete().eq('id', id);
    await Promise.all([load(), loadCounts()]);
    setBusy(null);
  }

  async function saveNote(id: number) {
    await supabase.from('reviews').update({ admin_note: adminNotes[id] ?? null }).eq('id', id);
  }

  async function saveSeed() {
    if (!seed.user_name.trim() || seed.review_text.trim().length < 20) {
      toast.error('Ім\'я та текст (мін. 20 символів) обов\'язкові'); return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('reviews').insert({
      user_id: user.id, user_name: seed.user_name,
      rating: seed.rating, review_text: seed.review_text,
      status: 'approved', is_verified: true,
    });
    setSeed({ user_name: '', rating: 5, review_text: '' });
    setShowSeed(false);
    setStatusFilter('approved');
    await Promise.all([load(), loadCounts()]);
  }

  const STATUS_TAB: Array<{ key: typeof statusFilter; label: string; color: string }> = [
    { key: 'pending',  label: 'На модерації', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'approved', label: 'Опубліковані', color: 'bg-green-100 text-green-700'  },
    { key: 'rejected', label: 'Відхилені',    color: 'bg-red-100 text-red-600'      },
    { key: 'all',      label: 'Всі',          color: 'bg-slate-100 text-slate-600'  },
  ];

  return (
    <div className="space-y-4">
      {/* Filters + seed button */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TAB.map(t => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5',
                statusFilter === t.key ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue')}>
              {t.label}
              {counts[t.key] > 0 && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-black',
                  statusFilter === t.key ? 'bg-white/20' : t.color)}>{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSeed(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors">
          <Plus size={14}/> Seed відгук
        </button>
      </div>

      {/* Seed form */}
      {showSeed && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-black text-slate-900 text-sm">Додати стартовий відгук (одразу публікується)</h3>
          <div className="flex gap-3">
            <input value={seed.user_name} onChange={e => setSeed(s => ({ ...s, user_name: e.target.value }))}
              placeholder="Ім'я автора" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
            <select value={seed.rating} onChange={e => setSeed(s => ({ ...s, rating: +e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <textarea value={seed.review_text} onChange={e => setSeed(s => ({ ...s, review_text: e.target.value }))}
            rows={3} placeholder="Текст відгуку (мін. 20 символів)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:border-brand-blue focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={saveSeed} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors">Опублікувати</button>
            <button onClick={() => setShowSeed(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Скасувати</button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-semibold">
            Відгуків немає
          </div>
        )}
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {r.user_avatar
                  ? <img src={r.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                  : <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center font-black text-brand-blue">{r.user_name?.[0]?.toUpperCase()}</div>
                }
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-sm">{r.user_name}</span>
                    {r.is_verified && <CheckCircle2 size={13} className="text-brand-blue" />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">{format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
              <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide',
                r.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                r.status === 'approved' ? 'bg-green-100 text-green-700'  : 'bg-red-100 text-red-600')}>
                {r.status === 'pending' ? 'На модерації' : r.status === 'approved' ? 'Опубліковано' : 'Відхилено'}
              </span>
            </div>

            {/* Review text */}
            <p className="text-sm text-slate-600 leading-relaxed">{r.review_text}</p>

            {/* Admin note */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1 block">Примітка адміна</label>
              <textarea
                value={adminNotes[r.id] ?? ''}
                onChange={e => setAdminNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                onBlur={() => saveNote(r.id)}
                rows={2}
                placeholder="Причина відхилення або внутрішня нотатка..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs resize-none focus:border-brand-blue focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {r.status !== 'approved' && (
                <button onClick={() => approve(r.id)} disabled={busy === r.id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
                  <ThumbsUp size={13}/> Опублікувати
                </button>
              )}
              {r.status !== 'rejected' && (
                <button onClick={() => reject(r.id)} disabled={busy === r.id}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
                  <ThumbsDown size={13}/> Відхилити
                </button>
              )}
              <button onClick={() => del(r.id)} disabled={busy === r.id}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto">
                <Trash2 size={13}/> Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blog Manager ─────────────────────────────────────────────
function BlogManager() {
  const [posts, setPosts]   = useState<any[]>([]);
  const [loadingB, setLoadingB] = useState(true);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoadingB(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoadingB(false);
  }

  async function togglePublished(item: any) {
    await supabase.from('blog_posts').update({ is_published: !item.is_published }).eq('id', item.id);
    loadPosts();
  }

  async function deletePost(id: number) {
    if (!confirm('Видалити пост?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    loadPosts();
  }

  if (loadingB) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <th className="p-4">Заголовок / Теги</th>
            <th className="p-4">Дата</th>
            <th className="p-4 text-center">Статус</th>
            <th className="p-4 text-right">Дії</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {posts.map(item => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="p-4">
                <div className="text-sm font-black text-slate-900">{item.title}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category} · {item.tags?.join(', ')}</div>
              </td>
              <td className="p-4 text-xs text-slate-500">{format(new Date(item.created_at), 'dd.MM.yyyy')}</td>
              <td className="p-4 text-center">
                <button onClick={() => togglePublished(item)}
                  className={cn('px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all',
                    item.is_published ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100')}>
                  {item.is_published ? 'Опубліковано' : 'Чернетка'}
                </button>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deletePost(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14}/></button>
                </div>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">Постів немає</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
// ─── Media Library ───────────────────────────────────────────
function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setLoading(true);
    const { data } = await supabase.storage.from('cars').list();
    setFiles(data || []);
    setLoading(false);
  }

  async function deleteFile(name: string) {
    if (!confirm('Видалити файл з хмари?')) return;
    await supabase.storage.from('cars').remove([name]);
    loadFiles();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">🖼️ Медіатека</h1>
        <button onClick={loadFiles} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={18}/></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square bg-slate-50 relative overflow-hidden">
              <img src={supabase.storage.from('cars').getPublicUrl(f.name).data.publicUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => deleteFile(f.name)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="p-3">
              <div className="text-[9px] font-black text-slate-400 uppercase truncate" title={f.name}>{f.name}</div>
              <div className="text-[9px] text-slate-300 font-bold">{(f.metadata.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
        ))}
        {loading && <div className="col-span-full py-20 text-center text-xs font-black text-slate-300 uppercase tracking-widest animate-pulse">Завантаження медіа...</div>}
        {files.length === 0 && !loading && <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest">Хмара порожня</div>}
      </div>
    </div>
  );
}

// ─── Main Admin ──────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [leads, setLeads] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [aiLogsCount, setAiLogsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [uSearch, setUSearch] = useState('');
  const [uResults, setUResults] = useState<{ cars: any[], leads: any[] }>({ cars: [], leads: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    
    const userEmail = session.user.email?.toLowerCase() || '';
    const isOwner = userEmail === 'kovtunsasa65@gmail.com' || userEmail === 'kovtunsasa@gmail.com';
    
    if (!isOwner && (!p || !['manager', 'editor', 'admin'].includes(p.role))) { 
      navigate('/'); 
      return; 
    }
    
    setProfile(p || { 
      name: session.user.user_metadata?.full_name || 'Admin User', 
      role: isOwner ? 'admin' : (p?.role || 'user'),
      email: userEmail 
    });
    const [{ data: l }, { data: c }, { data: s }, { count: ac }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('cars').select('*, car_images(*)').order('created_at', { ascending: false }),
      supabase.from('daily_stats').select('*').order('date', { ascending: false }).limit(30),
      supabase.from('ai_logs').select('*', { count: 'exact', head: true })
    ]);
    setLeads(l ?? []); setCars(c ?? []); setStats(s ?? []); setAiLogsCount(ac ?? 0); setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!uSearch) { setUResults({ cars: [], leads: [] }); return; }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      const query = uSearch.toLowerCase();
      const filteredCars = cars.filter(c => c.title.toLowerCase().includes(query) || c.vin?.toLowerCase().includes(query));
      const filteredLeads = leads.filter(l => l.name?.toLowerCase().includes(query) || l.phone?.includes(query));
      setUResults({ cars: filteredCars.slice(0, 5), leads: filteredLeads.slice(0, 5) });
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [uSearch, cars, leads]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
    const ch = supabase.channel('admin').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'leads' }, loadData).on('postgres_changes' as any, { event: '*', schema: 'public', table: 'cars' }, loadData).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadData]);

  const newLeads = leads.filter(l => (l.status || 'новий') === 'новий').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
        "fixed inset-y-0 left-0 lg:relative lg:translate-x-0",
        isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0 lg:w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-blue/30">V</div>
            {(isSidebarOpen || window.innerWidth < 1024) && <div className="font-black text-slate-900 tracking-tighter text-lg">vip.s.cars.ua</div>}
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon={<BarChart3 size={18} />} label="Дашборд" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Car size={18} />} label="Авто" active={tab === 'cars'} onClick={() => setTab('cars')} isOpen={isSidebarOpen} />
          <NavItem icon={<Send size={18} />} label="Ліди" active={tab === 'leads'} onClick={() => setTab('leads')} badge={newLeads || undefined} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={18} />} label="Користувачі" active={tab === 'users'} onClick={() => setTab('users')} isOpen={isSidebarOpen} />
          <NavItem icon={<Search size={18} />} label="SEO" active={tab === 'seo'} onClick={() => setTab('seo')} isOpen={isSidebarOpen} />
          <NavItem icon={<TrendingUp size={18} />} label="Аналітика" active={tab === 'analytics'} onClick={() => setTab('analytics')} isOpen={isSidebarOpen} />
          <NavItem icon={<Zap size={18} />} label="AI" active={tab === 'ai'} onClick={() => setTab('ai')} isOpen={isSidebarOpen} />
          <NavItem icon={<FileText size={18} />} label="Контент" active={tab === 'content'} onClick={() => setTab('content')} isOpen={isSidebarOpen} />
          <NavItem icon={<Image size={18} />} label="Медіа" active={tab === 'media'} onClick={() => setTab('media')} isOpen={isSidebarOpen} />
          <NavItem icon={<Settings size={18} />} label="Налашт." active={tab === 'settings'} onClick={() => setTab('settings')} isOpen={isSidebarOpen} />
        </nav>
        <div className="p-4 border-t border-slate-50 space-y-3 shrink-0">
          <button className={cn("w-full flex items-center gap-2 px-3 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg", !isSidebarOpen && "justify-center")}>
            <MessageSquareText size={18} className="text-brand-blue" />
            {isSidebarOpen && <span>Чат з AI</span>}
          </button>
          <div className={cn("flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1", !isSidebarOpen && "justify-center")}>
            {isSidebarOpen ? <><span>v1.2.0</span><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /></> : <span>v1.2</span>}
          </div>
          <button 
            onClick={handleLogout}
            className={cn("w-full flex items-center gap-2 px-3 py-2 text-red-500/60 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest", !isSidebarOpen && "justify-center")}
          >
            <LogOut size={14} />
            {isSidebarOpen && <span>Вийти з системи</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Menu size={20} /></button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Адмін</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 font-black capitalize">{tab}</span>
            </div>
            <div className="relative max-w-md w-full hidden md:block group ml-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
              <input type="text" value={uSearch} onChange={e => setUSearch(e.target.value)} placeholder="Універсальний пошук (авто, ліди, клієнти)..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-brand-blue/5 focus:bg-white focus:border-brand-blue/20 transition-all" />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>

              {/* Результати пошуку */}
              {uSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Шукаємо...</div>
                  ) : (uResults.cars.length === 0 && uResults.leads.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 font-bold">Нічого не знайдено</div>
                  ) : (
                    <div className="p-2">
                      {uResults.cars.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Автомобілі</div>
                          {uResults.cars.map(c => (
                            <button key={c.id} onClick={() => { setTab('cars'); setUSearch(''); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                              <div className="w-10 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {c.car_images?.[0]?.url && <img src={c.car_images[0].url} className="w-full h-full object-cover" alt="" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 group-hover:text-brand-blue transition-colors truncate">{c.title}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">{c.brand} · ${Number(c.price).toLocaleString()}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {uResults.leads.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Заявки / CRM</div>
                          {uResults.leads.map(l => (
                            <button key={l.id} onClick={() => { setTab('leads'); setUSearch(''); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-brand-blue shrink-0"><Users size={14} /></div>
                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 group-hover:text-brand-blue transition-colors truncate">{l.name}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">{l.phone} · {l.status}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="relative p-2 text-slate-400 hover:text-brand-blue transition-all">
                <Bell size={20} />
                {newLeads > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{newLeads}</span>}
              </button>
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Нові заявки</span>
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded-full">{newLeads}</span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {leads.filter(l => (l.status || 'новий') === 'новий').slice(0, 5).map(l => (
                    <div key={l.id} onClick={() => setTab('leads')} className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-slate-900">{l.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{format(new Date(l.created_at), 'HH:mm')}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{l.type} · {l.phone}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTab('leads')} className="w-full py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase hover:text-brand-blue transition-colors">Всі сповіщення</button>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-slate-900 truncate max-w-[120px]">{profile?.name || 'Адмін'}</div>
                <div className="text-[10px] text-brand-blue font-bold uppercase">{profile?.role || 'Manager'}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" /> : <User size={20} />}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Вийти"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#F8FAFC]">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="animate-spin w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full" /></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="max-w-7xl mx-auto">
                {tab === 'dashboard' && <Dashboard leads={leads} cars={cars} stats={stats} aiLogsCount={aiLogsCount} setTab={setTab} />}
                {tab === 'cars' && <CarsManager cars={cars} onRefresh={loadData} profile={profile} />}
                {tab === 'leads' && <LeadsManager leads={leads} onRefresh={loadData} profile={profile} />}
                {tab === 'users' && <UsersManager />}
                {tab === 'seo' && <SeoManager />}
                {tab === 'analytics' && <AnalyticsManager cars={cars} leads={leads} />}
                {tab === 'ai' && <AiManager />}
                {tab === 'content' && <ContentManager />}
                {tab === 'media' && <MediaLibrary />}
                {tab === 'settings' && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
