import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Home, Search, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import CarCard from '../components/CarCard';

export default function NotFoundPage() {
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('cars')
      .select('*, car_images(*)')
      .eq('status', 'active')
      .order('ranking_score', { ascending: false })
      .limit(6)
      .then(({ data }) => setRecommended(data ?? []));
  }, []);

  return (
    <>
      <SEOHead title="Сторінку не знайдено — VIP.S CARS" url="/404" />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">

        {/* 404 */}
        <div className="text-center mb-16">
          <div className="text-[120px] font-black text-slate-200 leading-none mb-4">404</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Сторінку не знайдено</h1>
          <p className="text-slate-400 mb-10 max-w-sm mx-auto text-lg font-medium">Здається, ви потрапили не туди. Можливо, адресу змінено або сторінку видалено.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/" className="flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/20">
              <Home size={18}/> Повернутись на головну
            </Link>
            <Link to="/catalog" className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-brand-blue hover:text-brand-blue transition-all">
              <Search size={18}/> Перейти до каталогу
            </Link>
          </div>
        </div>

        {/* Рекомендації */}
        {recommended.length > 0 && (
          <div className="w-full max-w-7xl">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Можливо ви шукали</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map(car => <CarCard key={car.id} car={car} />)}
            </div>
            <div className="text-center mt-12">
              <Link to="/catalog" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">
                Дивитися всі пропозиції <ArrowRight size={18}/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
