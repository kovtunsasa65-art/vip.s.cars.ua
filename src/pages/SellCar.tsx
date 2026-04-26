import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarForm from './admin/CarForm';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SellCar() {
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleClientSubmit = async (formData: any) => {
    // 1. Перевірка авторизації
    if (!user) {
      toast.error('Будь ласка, увійдіть в акаунт, щоб додати авто');
      navigate('/login');
      return;
    }

    const toastId = toast.loading('Зберігаємо ваше оголошення...');
    
    try {
      // 2. Підготовка чистих даних для бази (тільки ті поля, що є в таблиці)
      const carData = {
        user_id: user.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: Number(formData.price),
        engine: formData.engine,
        transmission: formData.transmission,
        mileage: Number(formData.mileage),
        fuel: formData.fuel,
        images: formData.images,
        description: formData.description,
        status: 'moderation', // Завжди на модерацію для клієнтів
        source: 'client_form',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error, data } = await supabase
        .from('cars')
        .insert([carData])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        throw new Error(error.message);
      }

      toast.success('Оголошення успішно створено!', { id: toastId });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast.error(`Не вдалося зберегти: ${error.message}`, { id: toastId });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-32 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
               <ShieldCheck size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Оголошення надіслано!</h1>
            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">Наші менеджери перевірять дані протягом 15 хвилин. Ви отримаєте сповіщення.</p>
            <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue transition-all">В мій кабінет</button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <section className="bg-slate-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Продаж без турбот
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
              Продайте своє авто <br /> <span className="text-brand-blue">швидко та дорого</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">Заповніть форму за 2 хвилини — ми знайдемо покупця для вашого VIP авто.</p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-10 pb-32">
         <div className="bg-white rounded-[48px] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <CarForm 
              onSave={handleClientSubmit} 
              onCancel={() => navigate(-1)} 
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { icon: <Zap className="text-amber-500" />, title: "Швидка оцінка", desc: "AI миттєво визначає ринкову вартість вашого авто" },
              { icon: <ShieldCheck className="text-green-500" />, title: "Безпечна угода", desc: "Ми беремо на себе всі юридичні нюанси та перевірки" },
              { icon: <Sparkles className="text-brand-blue" />, title: "Професійне SEO", desc: "Ваше оголошення побачать тисячі потенційних покупців" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
         </div>
      </main>

      <Footer />
    </div>
  );
}
