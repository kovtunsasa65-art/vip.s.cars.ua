import { motion } from 'motion/react';
import { ArrowRight, Car, Clock, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BuybackModal from './BuybackModal';
import { supabase } from '../lib/supabase';
import CarCard from './CarCard';

export default function Hero() {
  const [isBuybackOpen, setIsBuybackOpen] = useState(false);
  const [popularCars, setPopularCars] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPopular() {
      const { data } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('status', 'active')
        .order('is_top', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setPopularCars(data);
    }
    fetchPopular();
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
              ЯКІСТЬ. <br/>
              НАДІЙНІСТЬ. <br/>
              <span className="text-brand-blue">ТВОЯ ПЕРЕВАГА.</span>
            </h1>

            <p className="text-xl text-slate-500 font-medium mb-10 max-w-sm">
              Підбираємо найкращі авто для вас. Тільки перевірені варіанти.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16 lg:mb-0">
              <Link
                to="/services"
                className="bg-brand-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-xl shadow-brand-blue/20 text-center"
              >
                Підібрати авто
              </Link>
              <button
                onClick={() => setIsBuybackOpen(true)}
                className="bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:border-brand-blue hover:text-brand-blue transition-all shadow-sm text-center"
              >
                Викуп вашого авто
              </button>
            </div>
          </motion.div>

          {/* Gallery Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-brand-blue mb-1">Спецпропозиції</div>
                <h3 className="text-2xl font-black text-slate-900">ПОПУЛЯРНІ АВТО</h3>
              </div>
              <Link to="/catalog" className="text-sm font-bold text-slate-400 hover:text-brand-blue flex items-center gap-2 group transition-colors">
                Весь каталог <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {popularCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                {popularCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                  >
                    <CarCard car={car} />
                  </motion.div>
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[#f0f4ff] rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none" />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-slate-400 font-medium">Завантаження каталогу...</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Benefits Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 py-12 border-t border-slate-100">
          {[
            { icon: <Car className="text-brand-blue" />, value: "1287+", label: "Авто в наявності" },
            { icon: <Clock className="text-brand-blue" />, value: "24/7", label: "Підтримка" },
            { icon: <ShieldCheck className="text-brand-blue" />, value: "100%", label: "Чесні умови" },
            { icon: <Zap className="text-brand-blue" />, value: "1 день", label: "Швидкий підбір" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm">
                {item.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{item.value}</div>
                <div className="text-xs text-slate-500 font-bold mt-1">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BuybackModal isOpen={isBuybackOpen} onClose={() => setIsBuybackOpen(false)} />
    </section>
  );
}
