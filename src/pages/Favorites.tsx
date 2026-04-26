import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import CarCard from '../components/CarCard';

export default function Favorites() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Завантаження з БД для авторизованих
        const { data } = await supabase
          .from('user_favorites')
          .select('car_id, cars(*, car_images(*))')
          .eq('user_id', user.id);
        
        setCars(data?.map((f: any) => f.cars).filter(Boolean) ?? []);
      } else {
        // Завантаження з localStorage для гостей
        const localIds = JSON.parse(localStorage.getItem('favorites') ?? '[]');
        if (localIds.length > 0) {
          const { data } = await supabase
            .from('cars')
            .select('*, car_images(*)')
            .in('id', localIds);
          setCars(data ?? []);
        }
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"/>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Обрані авто" url="/favorites" />
      <div className="min-h-screen bg-slate-50 py-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Heart className="text-red-500" fill="currentColor" size={24} />
            Обрані авто
          </h1>

          {cars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">У вас поки немає обраних авто</h2>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Додавайте авто, які вам сподобалися, щоб не загубити їх та порівняти пізніше.
              </p>
              <Link to="/catalog" className="inline-flex px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors">
                До каталогу
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
