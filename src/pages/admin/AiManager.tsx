import React, { useState } from 'react';
import { 
  Zap, MessageSquare, Shield, Brain, 
  Settings2, Activity, History, Sliders,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AiManager() {
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);

  const stats = [
    { label: 'Запитів сьогодні', value: '1,248', trend: '+12%', icon: <Activity size={18} /> },
    { label: 'Сер. час відповіді', value: '0.8с', trend: '-5%', icon: <Zap size={18} /> },
    { label: 'Успішність', value: '99.9%', trend: 'Стабільно', icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">🤖 AI Контрольна Панель</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Налаштування та моніторинг штучного інтелекту</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Система активна</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              {s.icon}
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className="text-xl font-black text-slate-900">{s.value}</div>
              <div className="text-[9px] font-bold text-green-500">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
              <Settings2 size={16} className="text-brand-blue" /> Базові налаштування
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wide">Модель AI</label>
                  <select 
                    value={model} 
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all"
                  >
                    <option value="gpt-4o">GPT-4o (Найпотужніша)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Швидка)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wide">Температурний режим ({temperature})</label>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.1" 
                    value={temperature}
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Точність</span>
                    <span>Креативність</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wide">Системний Промпт (Інструкції)</label>
                <textarea 
                  rows={4}
                  placeholder="Опишіть роль AI та його манеру спілкування..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all resize-none"
                  defaultValue="Ти — експерт з підбору автомобілів компанії VIP.S CARS. Твоє завдання — допомагати клієнтам обрати найкраще авто..."
                />
              </div>

              <button className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/20">
                Зберегти конфігурацію
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
              <History size={16} className="text-brand-blue" /> Останні логи AI
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-black text-slate-900">Запит на підбір авто</span>
                      <span className="text-[10px] text-slate-400 font-bold">14:2{i}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">Клієнт шукає BMW X5 в бюджеті до $40,000...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">AI Тренування</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Автоматичне навчання</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ваш AI автоматично аналізує нові автомобілі в каталозі та відгуки клієнтів для покращення відповідей.
            </p>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                <span>Прогрес знань</span>
                <span className="text-brand-blue">84%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue w-[84%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider text-slate-900">Безпека</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Модерація контенту</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Фільтр спаму</span>
                <span className="text-green-500 uppercase tracking-widest">Увімкнено</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Чутливі теми</span>
                <span className="text-green-500 uppercase tracking-widest">Заблоковано</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
