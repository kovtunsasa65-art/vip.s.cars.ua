import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, CheckCircle2, User, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function ReviewSystem({ category }: { category?: string } = {}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadReviews();
    checkUser();
  }, [category]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(p);
    }
  }

  async function loadReviews() {
    setLoading(true);
    let q = supabase.from('reviews').select('*').eq('status', 'approved');
    if (category) q = q.eq('category', category);
    const { data } = await q.order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }

  const profanityList = ['мат1', 'мат2', 'спам', 'реклама']; // Базовий фільтр

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setMessage({ type: 'error', text: 'Будь ласка, авторизуйтесь' }); return; }
    if (form.text.length < 10) { setMessage({ type: 'error', text: 'Відгук занадто короткий' }); return; }

    // Базова AI/Text фільтрація
    const hasProfanity = profanityList.some(word => form.text.toLowerCase().includes(word));
    if (hasProfanity) {
      setMessage({ type: 'error', text: 'Ваш відгук містить недопустимі слова' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const randomAvatarId = Math.floor(Math.random() * 5) + 1;
    const finalAvatar = profile?.avatar_url || `/default-avatars/${randomAvatarId}.png`;

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      user_name: profile?.name || 'Клієнт VIP.S',
      user_avatar: finalAvatar,
      rating: form.rating,
      review_text: form.text,
      is_verified: !!(profile?.role === 'admin' || profile?.role === 'manager' || profile?.phone_verified),
      status: 'pending',
      ...(category ? { category } : {}),
    });

    if (error) {
      setMessage({ type: 'error', text: error.message.includes('14 days') ? 'Відгук можна залишати раз на 14 днів' : 'Помилка при відправці' });
    } else {
      setMessage({ type: 'success', text: 'Дякуємо! Ваш відгук надіслано на модерацію.' });
      setForm({ rating: 5, text: '' });
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Відгуки наших клієнтів</h2>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">Ми цінуємо вашу думку та постійно вдосконалюємо сервіс VIP.S CARS</p>
      </section>

      {/* Форма відгуку */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-100">
        {!user ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300"><User size={32}/></div>
            <p className="text-sm font-bold text-slate-600">Тільки авторизовані користувачі можуть залишати відгуки</p>
            <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">Увійти</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                 <img src={profile?.avatar_url || '/default-avatars/1.png'} className="w-full h-full object-cover" />
               </div>
               <div>
                 <div className="text-sm font-black text-slate-900">{profile?.name || 'Ваш профіль'}</div>
                 <div className="flex gap-1 text-orange-400">
                   {[1,2,3,4,5].map(s => (
                     <Star key={s} size={20} className="cursor-pointer transition-transform hover:scale-120" 
                       fill={form.rating >= s ? "currentColor" : "none"} 
                       onClick={() => setForm({...form, rating: s})} />
                   ))}
                 </div>
               </div>
            </div>

            <textarea 
              value={form.text}
              onChange={e => setForm({...form, text: e.target.value})}
              placeholder="Поділіться вашими враженнями від покупки або сервісу..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all h-32 resize-none"
            />

            {message && (
              <div className={cn("p-4 rounded-xl text-xs font-bold", message.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {message.text}
              </div>
            )}

            <button disabled={submitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200">
              {submitting ? 'Відправляємо...' : <><Send size={18}/> Надіслати відгук</>}
            </button>
          </form>
        )}
      </section>

      {/* Список відгуків */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50">
                  <img src={r.user_avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">{r.name}</span>
                    {r.is_verified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(r.created_at), 'dd MMMM yyyy')}</div>
                </div>
              </div>
              <div className="flex text-orange-400">
                {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
