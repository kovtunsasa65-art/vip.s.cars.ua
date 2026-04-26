export type Tab = 'dashboard' | 'cars' | 'leads' | 'users' | 'seo' | 'analytics' | 'ai' | 'content' | 'settings' | 'media';

export const LEAD_STATUSES = ['новий', 'в роботі', "зв'язались", 'закрито (виграш)', 'закрито (програш)'];
export const LEAD_SCORES   = ['гарячий', 'теплий', 'холодний'];

export const KANBAN_COLS = [
  { key: 'новий',               label: 'Нові',               colBg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-400'   },
  { key: 'в роботі',           label: 'В роботі',           colBg: 'bg-yellow-50', border: 'border-yellow-200',dot: 'bg-yellow-400' },
  { key: "зв'язались",        label: "Зв'язались",        colBg: 'bg-purple-50', border: 'border-purple-200',dot: 'bg-purple-400' },
  { key: 'закрито (виграш)',   label: 'Закрито (виграш)',   colBg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500'  },
  { key: 'закрито (програш)',  label: 'Закрито (програш)', colBg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-400'    },
];

export const SCORE_COLOR: Record<string, string> = {
  гарячий:  'bg-red-100 text-red-700 border-red-200',
  теплий:   'bg-orange-100 text-orange-700 border-orange-200',
  холодний: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const STATUS_LABELS: Record<string, string> = {
  'новий':              'Нові',
  'в роботі':           'В роботі',
  "зв'язались":        "Зв'язались",
  'закрито (виграш)':  'Закрито (виграш)',
  'закрито (програш)': 'Закрито (програш)',
};

export const STEPS = ['Основне', 'Характеристики', 'Фото', 'Опис + SEO'];
