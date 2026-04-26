import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, CarAd } from '../lib/supabase';
import CarCard from './CarCard';

export default function FeaturedGallery() {
  const [featuredCars, setFeaturedCars] = useState<CarAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .eq('is_top', true)
        .limit(6);

      if (data && data.length > 0) {
        setFeaturedCars(data);
      } else {
        // Fallback: just get the latest 6 if no "top" cars
        const { data: latestData } = await supabase
          .from('cars')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);
        if (latestData) setFeaturedCars(latestData);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  if (!loading && featuredCars.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-3 text-brand-blue">
              <span className="w-8 h-[2px] bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest">Пропозиції тижня</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              КРАЩІ <span className="text-brand-blue">ПРОПОЗИЦІЇ</span> <br/>
              В НАШІЙ ГАЛЕРЕЇ
            </h2>
          </div>
          <Link 
            to="/catalog" 
            className="group inline-flex items-center gap-3 text-brand-blue font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform duration-300"
          >
            Весь каталог
            <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
