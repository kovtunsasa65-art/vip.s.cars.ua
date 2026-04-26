import React, { useState, useEffect } from 'react';
import { 
  FileText, MessageSquare, Star, Plus, 
  Trash2, ThumbsUp, ThumbsDown, CheckCircle2,
  MoreHorizontal, Eye, Edit3, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'blog'>('reviews');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">✍️ Управління Контентом</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Відгуки клієнтів та публікації в блозі</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'reviews' ? "bg-brand-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <MessageSquare size={14} /> Відгуки
          </button>
          <button 
            onClick={() => setActiveTab('blog')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'blog' ? "bg-brand-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <FileText size={14} /> Блог
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'reviews' ? <ReviewsSubManager /> : <BlogSubManager />}
      </div>
    </div>
  );
}

function ReviewsSubManager() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto text-brand-blue">
        <Star size={32} />
      </div>
      <div>
        <h3 className="font-black text-slate-900">Керування відгуками</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Ви можете модерувати відгуки клієнтів, видаляти спам та підтверджувати справжність.</p>
      </div>
      <button className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-all">
        Завантажити відгуки
      </button>
    </div>
  );
}

function BlogSubManager() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
        <FileText size={32} />
      </div>
      <div>
        <h3 className="font-black text-slate-900">Публікації блогу</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">Створюйте корисні статті про вибір авто, новини ринку та поради для власників.</p>
      </div>
      <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
        Написати статтю
      </button>
    </div>
  );
}
