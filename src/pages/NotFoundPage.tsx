import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Home, Search, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('cars')
      .select('id, title, price, currency, brand, year, seo_slug, car_images(url, is_cover)')
      .eq('status', 'active')
      .order('ranking_score', { ascending: false })
      .limit(4)
      .then(({ data }) => setRecommended(data ?? []));
  }, []);

  return (
    <>
      <SEOHead title="Сторінку не знайдено" url="/404" />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">

        {/* 404 */}
        <div className="text-center mb-12">
          <div className="text-8xl font-black text-slate-200 mb-4">404</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Сторінку не знайдено</h1>
          <p className="text-slate-400 mb-8">Можливо, адресу змінено або сторінку видалено</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors">
              <Home size={16}/> На головну
            </Link>
            <Link to="/catalog" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:border-brand-blue transition-colors">
              <Search size={16}/> Каталог авто
            </Link>
          </div>
        </div>

        {/* Рекомендації */}
        {recommended.length > 0 && (
          <div className="w-full max-w-4xl">
            <h2 className="text-lg font-black text-slate-900 mb-4 text-center">Можливо вас зацікавить</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommended.map(car => {
                const img = car.car_images?.find((i: any) => i.is_cover)?.url ?? car.car_images?.[0]?.url;
                return (
                  <Link key={car.id} to={`/cars/${car.seo_slug ?? car.id}`}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      {img && <img src={img} className="w-full h-full object-cover" alt={car.title}/>}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-900 truncate">{car.brand} {car.title?.split(' ').slice(2).join(' ')}</p>
                      <p className="text-sm font-black text-brand-blue mt-0.5">
                        {car.currency === 'USD' ? '$' : '₴'}{Number(car.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link to="/catalog" className="inline-flex items-center gap-2 text-brand-blue font-bold text-sm hover:underline">
                Дивитися всі авто <ArrowRight size={14}/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
