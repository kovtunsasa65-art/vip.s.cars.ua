export type Tab = 
  | 'dashboard' 
  | 'cars' 
  | 'leads' 
  | 'moderation' 
  | 'users' 
  | 'seo' 
  | 'analytics' 
  | 'ai' 
  | 'content' 
  | 'settings';

export const KANBAN_COLS = [
  { id: 'новий', label: 'Нові', color: 'bg-blue-500' },
  { id: 'в роботі', label: 'В роботі', color: 'bg-amber-500' },
  { id: 'перевірка', label: 'Перевірка', color: 'bg-purple-500' },
  { id: 'успішно', label: 'Успішно', color: 'bg-green-500' },
  { id: 'відмова', label: 'Відмова', color: 'bg-slate-400' },
];

export const LEAD_SCORES = [
  { id: 'холодний', label: 'Холодний', color: 'bg-blue-100 text-blue-600' },
  { id: 'теплий', label: 'Теплий', color: 'bg-amber-100 text-amber-600' },
  { id: 'гарячий', label: 'Гарячий', color: 'bg-red-100 text-red-600' },
];

export const SCORE_COLOR: Record<string, string> = {
  'холодний': 'bg-blue-500',
  'теплий': 'bg-amber-500',
  'гарячий': 'bg-red-500',
};
