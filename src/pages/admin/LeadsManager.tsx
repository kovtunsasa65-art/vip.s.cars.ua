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

        {/* Kanban board */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_COLS.map(col => {
            const colLeads = filtered.filter(l => (l.status || 'новий') === col.key);
            return (
              <div key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragLeadId !== null) { updateLead(dragLeadId, { status: col.key }); setDragLeadId(null); } }}
                className={cn('w-64 shrink-0 flex flex-col rounded-2xl border overflow-hidden', col.colBg, col.border)}>
                <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between bg-white/50">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full border border-white">{colLeads.length}</span>
                </div>
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
                        {sla && <div className="mt-2 text-[9px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full w-fit">⚠ SLA &gt;15хв</div>}
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

      {/* Detail panel */}
      {selected && (
        <aside className="w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl self-start sticky top-24 max-h-[calc(100vh-130px)] flex flex-col overflow-hidden">
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
            <div className="space-y-3">
              <div className="text-lg font-black text-slate-900 leading-tight">{selected.name}</div>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                  <Phone size={12} /> Дзвінок
                </a>
                <a href={`https://t.me/+${selected.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                  <Send size={12} /> Telegram
                </a>
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                    <MessageCircle size={12} /> Email
                  </a>
                )}
                <button onClick={assignToMe} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold hover:bg-brand-blue hover:text-white transition-colors">
                  <User size={12} /> Мені
                </button>
              </div>
            </div>

            {slaBreached(selected) && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-600 font-bold">
                ⚠ SLA порушено — відповідь не надіслана більше 15 хвилин
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
              <Row label="Телефон"      value={selected.phone} />
              <Row label="Тип"          value={selected.type} />
              <Row label="Бюджет"       value={selected.budget || '—'} />
              <Row label="Джерело"      value={selected.source || '—'} />
              {selected.car_id  && <Row label="Авто"         value={`ID: ${selected.car_id}`} />}
              {selected.message && <Row label="Повідомлення" value={selected.message} />}
            </div>

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

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Статус / Колонка</label>
              <select value={selected.status || 'новий'} onChange={e => updateLead(selected.id, { status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:border-brand-blue focus:outline-none">
                {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

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
