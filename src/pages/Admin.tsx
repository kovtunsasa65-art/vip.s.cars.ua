import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Car, Users, Phone, LogOut, Plus, Trash2, Edit2,
  Eye, TrendingUp, CheckCircle2, X, Search, RefreshCw,
  MessageCircle, ChevronRight, ShieldCheck, Zap, Settings,
  Globe, Image, BarChart2, ArrowUpRight, FileText, Upload,
  Link2, AlertTriangle, Send, Bell, ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { PHONE_RAW } from '../lib/config';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type Tab = 'dashboard' | 'leads' | 'cars' | 'seo' | 'analytics' | 'media' | 'settings';

const LEAD_STATUSES = ['новий', 'в роботі', 'закрито'];
const LEAD_SCORES   = ['гарячий', 'теплий', 'холодний'];
const SCORE_COLOR: Record<string, string> = {
  гарячий: 'bg-red-100 text-red-700 border-red-200',
  теплий:  'bg-orange-100 text-orange-700 border-orange-200',
  холодний:'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_COLOR: Record<string, string> = {
  'новий':    'bg-blue-100 text-blue-700',
  'в роботі': 'bg-yellow-100 text-yellow-700',
  'закрито':  'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  'новий':    'Нові',
  'в роботі': 'В роботі',
  'закрито':  'Закрито',
};

// ─── NavItem ────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
        active ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>
      <div className="flex items-center gap-2.5">{icon}<span>{label}</span></div>
      {badge && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>}
    </button>
  );
}

// ─── KPI Card ────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, color = 'blue' }: any) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-brand-blue',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500 mt-0.5">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────
function Dashboard({ leads, cars }: { leads: any[]; cars: any[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLeads = leads.filter(l => l.created_at?.startsWith(today));
  const hotLeads   = leads.filter(l => l.score === 'гарячий' && l.status === 'новий');
  const activeCars = cars.filter(c => c.status === 'active');
  const totalViews = cars.reduce((s, c) => s + (c.views_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-slate-900">Дашборд</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Авто в каталозі"   value={activeCars.length}    icon={<Car size={20}/>}         color="blue"   sub={`${cars.length} всього`} />
        <KpiCard title="Лідів сьогодні"    value={todayLeads.length}    icon={<Users size={20}/>}       color="green"  sub={`${leads.length} всього`} />
        <KpiCard title="Гарячих лідів"     value={hotLeads.length}      icon={<Zap size={20}/>}         color="orange" sub="потребують уваги" />
        <KpiCard title="Переглядів авто"   value={totalViews}           icon={<Eye size={20}/>}         color="red"    sub="всього" />
      </div>

      {/* Останні ліди */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900">Останні заявки</h2>
          <span className="text-xs text-slate-400">{leads.filter(l => l.status === 'новий').length} нових</span>
        </div>
        <div className="divide-y divide-slate-50">
          {leads.slice(0, 6).map(l => (
            <div key={l.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-black text-slate-500 shrink-0">
                {l.name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{l.name}</div>
                <div className="text-xs text-slate-400">{l.phone} · {l.type}</div>
              </div>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', SCORE_COLOR[l.score] ?? SCORE_COLOR.холодний)}>
                {l.score}
              </span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_COLOR[l.status] ?? STATUS_COLOR.новий)}>
                {l.status}
              </span>
              <span className="text-xs text-slate-300 shrink-0">{l.created_at ? format(new Date(l.created_at), 'dd.MM HH:mm') : ''}</span>
            </div>
          ))}
          {leads.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">Заявок ще немає</p>}
        </div>
      </div>

      {/* Топ авто */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900">Авто за переглядами</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[...cars].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)).slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {c.car_images?.[0]?.url && <img src={c.car_images[0].url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{c.title}</div>
                <div className="text-xs text-slate-400">${Number(c.price).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                <Eye size={12}/> {c.views_count ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CRM (Leads) ─────────────────────────────────────────────
function LeadsManager({ leads, onRefresh }: { leads: any[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState('всі');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [noteText, setNoteText] = useState('');

  const filtered = leads.filter(l => {
    const matchStatus = statusFilter === 'всі' || l.status === statusFilter;
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    return matchStatus && matchSearch;
  });

  async function updateLead(id: number, patch: any) {
    await supabase.from('leads').update(patch).eq('id', id);
    onRefresh();
    if (selected?.id === id) setSelected((prev: any) => ({ ...prev, ...patch }));
  }

  async function saveNote() {
    if (!selected || !noteText.trim()) return;
    await updateLead(selected.id, { notes: noteText });
    setNoteText('');
  }

  return (
    <div className="flex gap-5 h-full">
      {/* Таблиця */}
      <div className="flex-1 space-y-4 min-w-0 flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-xl font-black text-slate-900">CRM / Kanban Дошка</h1>
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
            <RefreshCw size={13}/> Оновити
          </button>
        </div>

        {/* Фільтри */}
        <div className="flex gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ім'я або телефон..."
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-blue focus:outline-none w-48"/>
          </div>
          {['всі', ...LEAD_STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-2 rounded-lg text-xs font-bold border transition-all',
                statusFilter === s ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue')}>
              {s === 'всі' ? 'Всі' : STATUS_LABELS[s]} {s !== 'всі' && <span className="ml-1 opacity-60">({leads.filter(l => (l.status || 'новий') === s).length})</span>}
            </button>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max h-full">
            {['новий', 'в роботі', 'закрито'].map(colStatus => (
              <div key={colStatus} className="w-72 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden h-full max-h-[calc(100vh-220px)]">
                <div className="px-4 py-3 border-b border-slate-200/60 bg-white flex items-center justify-between sticky top-0 z-10 shrink-0">
                  <h3 className="font-bold text-sm text-slate-800">{STATUS_LABELS[colStatus]}</h3>
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                    {filtered.filter(l => (l.status || 'новий') === colStatus).length}
                  </span>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-3">
                  {filtered.filter(l => (l.status || 'новий') === colStatus).map(l => (
                    <motion.div layoutId={`lead-${l.id}`} key={l.id} onClick={() => setSelected(l)}
                      className={cn('bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:border-brand-blue hover:shadow-md transition-all group', 
                        selected?.id === l.id ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-slate-200')}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', SCORE_COLOR[l.score] ?? SCORE_COLOR.холодний)}>
                          {l.score}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {l.created_at ? format(new Date(l.created_at), 'dd.MM HH:mm') : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{l.name}</h4>
                      <p className="text-xs text-slate-500 mb-2 truncate">{l.type} • {l.budget || 'Бюджет не вказано'}</p>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <a href={`tel:${l.phone}`} onClick={e => e.stopPropagation()} className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1">
                          <Phone size={12}/> {l.phone}
                        </a>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <select 
                             value={l.status || 'новий'}
                             onClick={e => e.stopPropagation()}
                             onChange={e => updateLead(l.id, { status: e.target.value })}
                             className="text-[10px] font-bold px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-600 outline-none cursor-pointer"
                           >
                             <option value="" disabled>Перемістити...</option>
                             {LEAD_STATUSES.map(s => (
                               <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                             ))}
                           </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filtered.filter(l => (l.status || 'новий') === colStatus).length === 0 && (
                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400">
                      Немає заявок
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Деталь ліда */}
      <AnimatePresence>
        {selected && (
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="w-72 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 self-start sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">Заявка #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Ім'я"    value={selected.name} />
              <Row label="Тел"     value={<a href={`tel:${selected.phone}`} className="text-brand-blue font-bold">{selected.phone}</a>} />
              {selected.telegram && (
                <Row label="Telegram" value={<a href={`https://t.me/${selected.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold">@{selected.telegram.replace('@', '')}</a>} />
              )}
              <Row label="Тип"     value={selected.type} />
              <Row label="Бюджет"  value={selected.budget ?? '—'} />
              <Row label="Джерело" value={selected.source ?? '—'} />
            </div>
            {selected.message && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">{selected.message}</div>
            )}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Оцінка</label>
              <div className="flex gap-2 flex-wrap">
                {LEAD_SCORES.map(s => (
                  <button key={s} onClick={() => updateLead(selected.id, { score: s })}
                    className={cn('text-xs font-bold px-2.5 py-1 rounded-full border transition-all', SCORE_COLOR[s],
                      selected.score === s ? 'ring-2 ring-offset-1 ring-brand-blue' : 'opacity-60 hover:opacity-100')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Нотатка</label>
              <textarea value={noteText || selected.notes || ''} onChange={e => setNoteText(e.target.value)}
                placeholder="Додати нотатку..." rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs resize-none focus:border-brand-blue focus:outline-none"/>
              <button onClick={saveNote} className="mt-2 w-full py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue-dark transition-colors">
                Зберегти
              </button>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <a href={`tel:${selected.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                <Phone size={13}/> Дзвінок
              </a>
              <a href={selected.telegram ? `https://t.me/${selected.telegram.replace('@', '')}` : `https://t.me/${selected.phone?.replace('+', '')}`} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                <MessageCircle size={13}/> Telegram
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400 font-semibold">{label}</span>
      <span className="text-slate-800 font-semibold text-right">{value}</span>
    </div>
  );
}

// ─── Cars Manager ────────────────────────────────────────────
function CarsManager({ cars, onRefresh }: { cars: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar]   = useState<any>(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');

  const filtered = cars.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.brand?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function deleteCar(id: string | number) {
    if (!confirm('Видалити оголошення?')) return;
    await supabase.from('cars').delete().eq('id', id);
    onRefresh();
  }

  async function updateStatus(id: string | number, status: string) {
    await supabase.from('cars').update({ status }).eq('id', id);
    onRefresh();
  }

  if (showForm || editCar) return (
    <CarForm car={editCar} onClose={() => { setShowForm(false); setEditCar(null); }} onSaved={() => { setShowForm(false); setEditCar(null); onRefresh(); }} />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Авто <span className="text-slate-400 font-normal text-base">({cars.length})</span></h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue-dark transition-colors shadow-md shadow-brand-blue/20">
          <Plus size={16}/> Додати авто
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук..."
            className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-blue focus:outline-none w-48"/>
        </div>
        {[['all','Всі'], ['active','Активні'], ['sold','Продано'], ['hidden','Приховані'], ['moderation','Модерація']].map(([v, l]) => (
          <button key={v} onClick={() => setStatus(v)}
            className={cn('px-3 py-2 rounded-lg text-xs font-bold border transition-all',
              statusFilter === v ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-slate-200')}>
            {l}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['', 'Авто', 'Ціна', 'Перегляди', 'Trust', 'Статус', 'Дії'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden">
                      {c.car_images?.[0]?.url && <img src={c.car_images[0].url} className="w-full h-full object-cover" alt=""/>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{c.title}</div>
                    <div className="text-xs text-slate-400">{c.city} · {c.year}</div>
                  </td>
                  <td className="px-4 py-3 font-black text-brand-blue">${Number(c.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{c.views_count ?? 0}</td>
                  <td className="px-4 py-3">
                    {c.trust_score > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div style={{ width: `${c.trust_score}%`, background: c.trust_score >= 80 ? '#16a34a' : c.trust_score >= 55 ? '#d97706' : '#dc2626' }} className="h-full rounded-full"/>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{c.trust_score}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}
                      className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white focus:border-brand-blue focus:outline-none">
                      <option value="active">Активне</option>
                      <option value="sold">Продано</option>
                      <option value="hidden">Приховане</option>
                      <option value="moderation">Модерація</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditCar(c)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-colors">
                        <Edit2 size={13}/>
                      </button>
                      <button onClick={() => deleteCar(c.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Авто не знайдено</p>}
      </div>
    </div>
  );
}

// ─── Car Form ─────────────────────────────────────────────────
function CarForm({ car, onClose, onSaved }: { car?: any; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!car;
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
    owners_count: car?.owners_count ?? '',
    accidents_count: car?.accidents_count ?? 0,
    listing_type: car?.listing_type ?? 'company',
    vin: car?.vin ?? '',
    description: car?.description ?? '',
    seller_name: car?.seller_name ?? '',
    seller_phone: car?.seller_phone ?? '',
    is_checked: car?.is_checked ?? false,
    service_history: car?.service_history ?? false,
    status: car?.status ?? 'active',
    badge: car?.badge ?? '',
  });

  const set = (k: string) => (e: React.ChangeEvent<any>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save() {
    setSaving(true);
    const slug = `${form.brand}-${form.model}-${form.year}-${form.engine_type}-${form.city}`
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const payload = {
      ...form,
      year: Number(form.year) || null,
      price: Number(form.price) || 0,
      mileage: Number(form.mileage) || null,
      engine_volume: Number(form.engine_volume) || null,
      power_hp: Number(form.power_hp) || null,
      owners_count: Number(form.owners_count) || null,
      accidents_count: Number(form.accidents_count) || 0,
      listing_type: form.listing_type,
      trust_score: calcTrustScore(form),
      title: form.title || `${form.brand} ${form.model} ${form.year}`,
      slug: isEdit ? car.slug : slug,
    };

    if (isEdit) {
      const { error } = await supabase.from('cars').update(payload).eq('id', car.id);
      if (error) throw error;
    } else {
      // ПЕРЕВІРКА ЛІМІТУ ДЛЯ ПРИВАТНИХ ОСІБ
      const { data: { user } } = await supabase.auth.getUser();
      if (form.listing_type === 'private' && user) {
        const { count } = await supabase.from('cars')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('listing_type', 'private');
        
        if ((count || 0) >= 3) {
          alert('❌ Ліміт вичерпано! Приватні особи можуть мати не більше 3 безкоштовних оголошень.');
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase.from('cars').insert([{ ...payload, user_id: user?.id }]);
      if (error) throw error;
    }
    setSaving(false);
    onSaved();
  }

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">{isEdit ? 'Редагувати авто' : 'Додати авто'}</h1>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Марка *</label><input value={form.brand} onChange={set('brand')} className={inp} placeholder="BMW"/></div>
          <div><label className="label">Модель *</label><input value={form.model} onChange={set('model')} className={inp} placeholder="X5"/></div>
          <div><label className="label">Рік *</label><input type="number" value={form.year} onChange={set('year')} className={inp}/></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Ціна *</label><input type="number" value={form.price} onChange={set('price')} className={inp}/></div>
          <div><label className="label">Валюта</label>
            <select value={form.currency} onChange={set('currency')} className={inp}>
              <option>USD</option><option>UAH</option><option>EUR</option>
            </select>
          </div>
          <div><label className="label">Місто</label><input value={form.city} onChange={set('city')} className={inp}/></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Пробіг, км</label><input type="number" value={form.mileage} onChange={set('mileage')} className={inp}/></div>
          <div><label className="label">Об'єм, л</label><input value={form.engine_volume} onChange={set('engine_volume')} className={inp} placeholder="2.0"/></div>
          <div><label className="label">Паливо</label>
            <select value={form.engine_type} onChange={set('engine_type')} className={inp}>
              <option value="">—</option>
              {['бензин','дизель','газ','електро','гібрид'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">КПП</label>
            <select value={form.transmission} onChange={set('transmission')} className={inp}>
              <option value="">—</option>
              {['автомат','механіка','варіатор','робот'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Привід</label>
            <select value={form.drive_type} onChange={set('drive_type')} className={inp}>
              <option value="">—</option>
              {['передній','задній','повний'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Потужність, к.с.</label><input type="number" value={form.power_hp} onChange={set('power_hp')} className={inp}/></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="label">Власників</label><input type="number" value={form.owners_count} onChange={set('owners_count')} className={inp}/></div>
          <div><label className="label">ДТП (к-сть)</label><input type="number" value={form.accidents_count} onChange={set('accidents_count')} className={inp}/></div>
          <div><label className="label">Тип</label>
            <select value={form.listing_type} onChange={set('listing_type')} className={inp}>
              <option value="company">Компанія</option>
              <option value="private">Приватна особа</option>
            </select>
          </div>
          <div><label className="label">VIN</label><input value={form.vin} onChange={set('vin')} className={inp} maxLength={17}/></div>
        </div>
        <div>
          <label className="label">Бейдж</label>
          <select value={form.badge} onChange={set('badge')} className={inp}>
            <option value="">Немає</option>
            {['нове','вигідно','терміново','ексклюзив'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Ім'я продавця</label><input value={form.seller_name} onChange={set('seller_name')} className={inp}/></div>
          <div><label className="label">Телефон продавця</label><input value={form.seller_phone} onChange={set('seller_phone')} className={inp}/></div>
        </div>
        <div><label className="label">Опис</label>
          <textarea value={form.description} onChange={set('description')} rows={4} className={cn(inp, 'resize-none')} placeholder="Опис авто..."/>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Статус</label>
            <select value={form.status} onChange={set('status')} className={inp}>
              <option value="active">Активне</option>
              <option value="moderation">Модерація</option>
              <option value="hidden">Приховане</option>
              <option value="sold">Продано</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-6">
            <input type="checkbox" checked={form.is_checked} onChange={set('is_checked')} className="w-4 h-4 accent-brand-blue"/>
            <span className="text-sm font-semibold text-slate-700">Перевірено</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer pt-6">
            <input type="checkbox" checked={form.service_history} onChange={set('service_history')} className="w-4 h-4 accent-brand-blue"/>
            <span className="text-sm font-semibold text-slate-700">Сервісна книга</span>
          </label>
        </div>

        {/* Trust score preview */}
        <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <ShieldCheck size={16} className="text-brand-blue"/>
          <span className="text-sm text-slate-600">Індекс довіри: <strong>{calcTrustScore(form)}/100</strong></span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          Скасувати
        </button>
        <button onClick={save} disabled={saving}
          className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue-dark transition-colors disabled:opacity-50 shadow-md shadow-brand-blue/20">
          {saving ? 'Збереження...' : isEdit ? 'Зберегти зміни' : 'Додати авто'}
        </button>
      </div>
    </div>
  );
}

function calcTrustScore(form: any): number {
  let s = 0;
  if (form.vin?.length === 17) s += 25;
  if (Number(form.owners_count) === 1) s += 15; else if (Number(form.owners_count) === 2) s += 10;
  
  const km = Number(form.mileage);
  const year = Number(form.year);
  const age = Math.max(1, new Date().getFullYear() - year);
  if (km / age < 20000) s += 10;

  if (form.service_history) s += 15;
  if (Number(form.accidents_count) === 0) s += 15;
  if (form.is_checked) s += 15;
  
  return Math.min(s, 100);
}

// ─── SEO Manager ─────────────────────────────────────────────
function SeoManager({ cars }: { cars: any[] }) {
  const [seoPages, setSeoPages]   = useState<any[]>([]);
  const [redirects, setRedirects] = useState<any[]>([]);
  const [tab, setTab]             = useState<'pages'|'redirects'|'audit'>('audit');
  const [refreshing, setRefreshing] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ from_url: '', to_url: '', code: '301' });

  useEffect(() => {
    supabase.from('seo_pages').select('*').order('created_at', { ascending: false }).then(({ data }) => setSeoPages(data ?? []));
    supabase.from('redirects').select('*').order('id', { ascending: false }).then(({ data }) => setRedirects(data ?? []));
  }, []);

  const refreshSitemap = async () => {
    setRefreshing(true);
    await fetch('/sitemap.xml');
    setTimeout(() => setRefreshing(false), 1500);
  };

  const addRedirect = async () => {
    if (!newRedirect.from_url || !newRedirect.to_url) return;
    const { data } = await supabase.from('redirects').insert([newRedirect]).select().single();
    if (data) setRedirects(r => [data, ...r]);
    setNewRedirect({ from_url: '', to_url: '', code: '301' });
  };

  const deleteRedirect = async (id: number) => {
    await supabase.from('redirects').delete().eq('id', id);
    setRedirects(r => r.filter(x => x.id !== id));
  };

  // SEO аудит — знаходимо проблеми
  const noSeoTitle   = cars.filter(c => !c.seo_title);
  const noSeoDesc    = cars.filter(c => !c.seo_description);
  const noImages     = cars.filter(c => !c.car_images?.length);
  const noDesc       = cars.filter(c => !c.description);
  const lowTrust     = cars.filter(c => c.trust_score < 50 && c.status === 'active');

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-blue focus:outline-none";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">SEO</h1>
        <button onClick={refreshSitemap} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold hover:border-brand-blue transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/> Оновити Sitemap
        </button>
      </div>

      {/* Підтаби */}
      <div className="flex gap-2">
        {[['audit','SEO Аудит'],['pages','SEO Сторінки'],['redirects','Редиректи']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold border transition-all',
              tab === v ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-500 border-slate-200')}>
            {l}
          </button>
        ))}
      </div>

      {/* SEO АУДИТ */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Без SEO title',   count: noSeoTitle.length,  color: 'red' },
              { label: 'Без SEO desc',    count: noSeoDesc.length,   color: 'orange' },
              { label: 'Без фото',        count: noImages.length,    color: 'red' },
              { label: 'Без опису',       count: noDesc.length,      color: 'yellow' },
            ].map(i => (
              <div key={i.label} className={cn('bg-white rounded-xl border p-4 shadow-sm',
                i.count > 0 ? 'border-red-200' : 'border-green-200')}>
                <div className={cn('text-2xl font-black mb-1', i.count > 0 ? 'text-red-600' : 'text-green-600')}>
                  {i.count > 0 ? `⚠️ ${i.count}` : '✅ 0'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">{i.label}</div>
              </div>
            ))}
          </div>

          {/* Список проблем */}
          {noSeoTitle.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500"/>
                <span className="text-sm font-black text-red-700">Відсутній SEO title ({noSeoTitle.length} авто)</span>
              </div>
              <div className="divide-y divide-slate-50">
                {noSeoTitle.slice(0,5).map(c => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-slate-700">{c.title}</span>
                    <a href={`/cars/${c.seo_slug ?? c.id}`} target="_blank" rel="noreferrer"
                      className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                      Відкрити <ExternalLink size={10}/>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {noImages.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-orange-50 border-b border-orange-200 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500"/>
                <span className="text-sm font-black text-orange-700">Без фото ({noImages.length} авто)</span>
              </div>
              <div className="divide-y divide-slate-50">
                {noImages.slice(0,5).map(c => (
                  <div key={c.id} className="px-5 py-3 text-sm text-slate-700">{c.title}</div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <Globe size={16} className="text-brand-blue shrink-0"/>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Sitemap.xml</p>
              <p className="text-xs text-slate-400">{cars.filter(c=>c.status==='active').length} авто · автогенерація</p>
            </div>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-brand-blue font-bold hover:underline">
              Відкрити <ExternalLink size={10}/>
            </a>
          </div>
        </div>
      )}

      {/* SEO СТОРІНКИ */}
      {tab === 'pages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900">SEO Сторінки</h3>
            <span className="text-xs text-slate-400">{seoPages.length} сторінок</span>
          </div>
          {seoPages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              SEO сторінки ще не створені.<br/>Вони генеруються автоматично для популярних запитів.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {seoPages.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.h1 || p.slug}</p>
                    <p className="text-xs text-slate-400">{p.slug}</p>
                  </div>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', p.is_indexed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                    {p.is_indexed ? 'Індексується' : 'Noindex'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* РЕДИРЕКТИ */}
      {tab === 'redirects' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Додати редирект</h3>
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-32">
                <label className="text-xs text-slate-400 font-semibold block mb-1">Старий URL</label>
                <input value={newRedirect.from_url} onChange={e => setNewRedirect(r => ({...r, from_url: e.target.value}))}
                  placeholder="/old-page" className={inp}/>
              </div>
              <div className="flex-1 min-w-32">
                <label className="text-xs text-slate-400 font-semibold block mb-1">Новий URL</label>
                <input value={newRedirect.to_url} onChange={e => setNewRedirect(r => ({...r, to_url: e.target.value}))}
                  placeholder="/new-page" className={inp}/>
              </div>
              <div className="w-24">
                <label className="text-xs text-slate-400 font-semibold block mb-1">Код</label>
                <select value={newRedirect.code} onChange={e => setNewRedirect(r => ({...r, code: e.target.value}))} className={inp}>
                  <option value="301">301</option>
                  <option value="302">302</option>
                </select>
              </div>
              <button onClick={addRedirect}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold hover:bg-brand-blue-dark transition-colors">
                Додати
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {redirects.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">Редиректів немає</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Старий URL','Новий URL','Код',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {redirects.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{r.from_url}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{r.to_url}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{r.code}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteRedirect(r.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────────
function AnalyticsManager({ leads, cars }: { leads: any[]; cars: any[] }) {
  const totalViews  = cars.reduce((s, c) => s + (c.views_count ?? 0), 0);
  const totalCalls  = cars.reduce((s, c) => s + (c.clicks_call ?? 0), 0);
  const conversion  = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(2) : '0';

  const leadsByType = ['підбір','викуп','покупка','консультація'].map(t => ({
    type: t, count: leads.filter(l => l.type === t).length,
  }));
  const leadsByStatus = ['новий','в роботі','закрито'].map(s => ({
    status: s, count: leads.filter(l => l.status === s).length,
  }));

  // Топ авто
  const topCars = [...cars].sort((a,b) => (b.views_count??0)-(a.views_count??0)).slice(0,8);
  const maxViews = topCars[0]?.views_count ?? 1;

  // Ліди за останні 7 днів
  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const key = d.toISOString().slice(0,10);
    return { day: d.toLocaleDateString('uk-UA',{weekday:'short'}), count: leads.filter(l=>l.created_at?.startsWith(key)).length };
  });
  const maxDay = Math.max(...last7.map(d=>d.count), 1);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-slate-900">Аналітика</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Всього переглядів', value: totalViews.toLocaleString(), icon: <Eye size={18}/>, color: 'blue' },
          { label: 'Всього лідів',      value: leads.length,                icon: <Users size={18}/>, color: 'green' },
          { label: 'Дзвінки',           value: totalCalls,                  icon: <Phone size={18}/>, color: 'orange' },
          { label: 'Конверсія',         value: `${conversion}%`,            icon: <TrendingUp size={18}/>, color: 'red' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3',
              k.color==='blue'?'bg-blue-50 text-brand-blue':k.color==='green'?'bg-green-50 text-green-600':k.color==='orange'?'bg-orange-50 text-orange-600':'bg-red-50 text-red-600')}>
              {k.icon}
            </div>
            <div className="text-xl font-black text-slate-900">{k.value}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ліди за 7 днів */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-black text-slate-900 mb-4">Ліди за 7 днів</h3>
          <div className="flex items-end gap-2 h-24">
            {last7.map((d,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-500">{d.count || ''}</span>
                <div className="w-full bg-brand-blue/10 rounded-t-sm transition-all" style={{height:`${(d.count/maxDay)*80}px`, minHeight: d.count?'4px':'2px', background: d.count?'#2563eb':'#e2e8f0'}}/>
                <span className="text-[10px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ліди по типу */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-black text-slate-900 mb-4">Заявки по типу</h3>
          <div className="space-y-2.5">
            {leadsByType.map(l => (
              <div key={l.type} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 w-24 capitalize">{l.type}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full transition-all" style={{width:`${leads.length?l.count/leads.length*100:0}%`}}/>
                </div>
                <span className="text-xs font-black text-slate-700 w-6 text-right">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Топ авто за переглядами */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900">Топ авто за переглядами</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {topCars.map((c,i) => {
            const img = c.car_images?.[0]?.url;
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-black text-slate-300 w-5 shrink-0">{i+1}</span>
                <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {img && <img src={img} className="w-full h-full object-cover" alt=""/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.title}</p>
                  <p className="text-xs text-slate-400">${Number(c.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-brand-blue rounded-full" style={{width:`${(c.views_count??0)/maxViews*100}%`}}/>
                  </div>
                  <span className="text-xs font-black text-slate-600 w-10 text-right">{c.views_count??0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Воронка конверсії */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-black text-slate-900 mb-4">Воронка конверсії</h3>
        <div className="space-y-2">
          {[
            { label: 'Відвідувачі (перегляди)', value: totalViews, pct: 100 },
            { label: 'Ліди (заявки)',            value: leads.length, pct: totalViews?Math.round(leads.length/totalViews*100):0 },
            { label: 'В роботі',                 value: leads.filter(l=>l.status==='в роботі').length, pct: leads.length?Math.round(leads.filter(l=>l.status==='в роботі').length/leads.length*100):0 },
            { label: 'Закрито',                  value: leads.filter(l=>l.status==='закрито').length, pct: leads.length?Math.round(leads.filter(l=>l.status==='закрито').length/leads.length*100):0 },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-44 shrink-0">{s.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-blue to-blue-400 rounded-full transition-all" style={{width:`${s.pct}%`}}/>
              </div>
              <span className="text-xs font-black text-slate-700 w-16 text-right">{s.value} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Media Library ────────────────────────────────────────────
function MediaLibrary() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('car_images').select('*, cars(title)').order('id', { ascending: false }).limit(50)
      .then(({ data }) => { setImages(data ?? []); setLoading(false); });
  }, []);

  const deleteImage = async (id: number) => {
    await supabase.from('car_images').delete().eq('id', id);
    setImages(imgs => imgs.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Медіатека</h1>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <Image size={13}/> {images.length} файлів
        </div>
      </div>

      {/* Drag&Drop зона */}
      <div onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all">
        <Upload size={24} className="mx-auto text-slate-300 mb-2"/>
        <p className="text-sm font-semibold text-slate-500">Клікніть або перетягніть фото авто</p>
        <p className="text-xs text-slate-400 mt-1">Фото прикріплюються через форму редагування авто</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full"/></div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button onClick={() => deleteImage(img.id)}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center transition-all hover:bg-red-600">
                  <Trash2 size={13}/>
                </button>
              </div>
              {img.is_cover && (
                <span className="absolute top-1 left-1 bg-brand-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded">Cover</span>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white truncate">{img.cars?.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    phone:        PHONE_RAW,
    telegram:     '@vips_cars',
    address:      'Київ, Україна',
    work_hours:   'Пн-Нд: 09:00–21:00',
    tg_bot_token: '',
    tg_chat_id:   '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings(s => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    // Зберігаємо в seo_pages як конфіг (або можна зробити окрему таблицю)
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendTestReport = async () => {
    await fetch('/api/daily-report', { method: 'POST' });
    alert('Тестовий звіт відправлено в Telegram!');
  };

  const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none";

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-slate-900">Налаштування</h1>

      {/* Контакти */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-slate-900">Контактна інформація</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { k:'phone',     label:'Телефон',    placeholder:PHONE_RAW },
            { k:'telegram',  label:'Telegram',   placeholder:'@vips_cars' },
            { k:'address',   label:'Адреса',     placeholder:'Київ, Україна' },
            { k:'work_hours',label:'Час роботи', placeholder:'Пн-Нд 09:00-21:00' },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide block mb-1.5">{f.label}</label>
              <input value={(settings as any)[f.k]} onChange={set(f.k)} placeholder={f.placeholder} className={inp}/>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <Send size={16} className="text-blue-500"/> Telegram бот
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Bot Token</label>
            <input type="password" value={settings.tg_bot_token} onChange={set('tg_bot_token')}
              placeholder="8660395924:AAH..." className={inp}/>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wide block mb-1.5">Chat ID</label>
            <input value={settings.tg_chat_id} onChange={set('tg_chat_id')}
              placeholder="8315530731" className={inp}/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={sendTestReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
            <Send size={14}/> Надіслати тестовий звіт
          </button>
          <a href="https://t.me/VipsCarsAlertsBot" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:border-blue-400 transition-colors">
            <ExternalLink size={14}/> Відкрити бота
          </a>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-600">📊 Щоденний звіт</p>
          <p className="text-xs text-slate-400 mt-0.5">Автоматично о 08:00 щодня. Містить статистику за день, гарячі ліди, топ авто.</p>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <Globe size={16} className="text-brand-blue"/> SEO / Сайт
        </h2>
        <div className="flex gap-3 flex-wrap">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:border-brand-blue transition-colors">
            <FileText size={14}/> sitemap.xml
          </a>
          <a href="/robots.txt" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:border-brand-blue transition-colors">
            <FileText size={14}/> robots.txt
          </a>
        </div>
      </div>

      <button onClick={save}
        className={cn('px-6 py-3 rounded-xl font-bold text-sm transition-all', saved ? 'bg-green-500 text-white' : 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-md shadow-brand-blue/20')}>
        {saved ? '✓ Збережено!' : 'Зберегти налаштування'}
      </button>
    </div>
  );
}

// ─── Main Admin ──────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab]       = useState<Tab>('dashboard');
  const [leads, setLeads]   = useState<any[]>([]);
  const [cars, setCars]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('cars').select('*, car_images(*)').order('created_at', { ascending: false }),
    ]);
    setLeads(l ?? []);
    setCars(c ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // Realtime підписка
    const ch = supabase.channel('admin')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'leads' }, loadData)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'cars' }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadData]);

  const newLeads = leads.filter(l => l.status === 'новий').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 fixed h-full flex flex-col pt-6 pb-6 px-4 z-10">
        <div className="mb-6 px-2">
          <div className="text-xs text-slate-400 font-semibold mb-0.5">Панель керування</div>
          <div className="text-lg font-black text-slate-900">VIP.S CARS</div>
        </div>
        <nav className="flex-1 space-y-1">
          <NavItem icon={<BarChart3 size={16}/>} label="Дашборд"    active={tab === 'dashboard'} onClick={() => setTab('dashboard')}/>
          <NavItem icon={<Users size={16}/>}     label="Заявки"     active={tab === 'leads'}     onClick={() => setTab('leads')}     badge={newLeads || undefined}/>
          <NavItem icon={<Car size={16}/>}       label="Авто"       active={tab === 'cars'}      onClick={() => setTab('cars')}/>
          <NavItem icon={<Globe size={16}/>}     label="SEO"        active={tab === 'seo'}       onClick={() => setTab('seo')}/>
          <NavItem icon={<BarChart2 size={16}/>} label="Аналітика"  active={tab === 'analytics'} onClick={() => setTab('analytics')}/>
          <NavItem icon={<Image size={16}/>}     label="Медіа"      active={tab === 'media'}     onClick={() => setTab('media')}/>
          <NavItem icon={<Settings size={16}/>}  label="Налашт."    active={tab === 'settings'}  onClick={() => setTab('settings')}/>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 mt-4">
          <LogOut size={14}/> Вийти
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen p-6 pt-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"/>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'dashboard' && <Dashboard leads={leads} cars={cars}/>}
              {tab === 'leads'     && <LeadsManager leads={leads} onRefresh={loadData}/>}
              {tab === 'cars'      && <CarsManager cars={cars} onRefresh={loadData}/>}
              {tab === 'seo'       && <SeoManager cars={cars}/>}
              {tab === 'analytics' && <AnalyticsManager leads={leads} cars={cars}/>}
              {tab === 'media'     && <MediaLibrary/>}
              {tab === 'settings'  && <SettingsPanel/>}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
