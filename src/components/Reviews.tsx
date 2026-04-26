import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Олександр К.',
    car: 'BMW X5 2017',
    text: 'Дуже задоволений підбором! Знайшли авто за 2 тижні в ідеальному стані. Торгуванням відбили вартість послуг. Рекомендую!',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 2,
    name: 'Марина С.',
    car: 'Audi A4 2019',
    text: 'Дякую хлопцям за допомогу з викупом мого старого авто. Ціна була чесною, оформлення зайняло лише кілька годин. Все супер!',
    image: 'https://images.unsplash.com/photo-1606154316972-23910f5451ec?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 3,
    name: 'Дмитро П.',
    car: 'VW Tiguan 2018',
    text: 'Замовляв разову перевірку. Майстер приїхав вчасно, виявив приховані проблеми з двигуном. Ви врятували мої гроші та нерви!',
    image: 'https://images.unsplash.com/photo-1621508611110-891d9e2617f6?auto=format&fit=crop&q=80&w=300'
  }
];

export default function Reviews({ category: _category }: { category?: string } = {}) {
  return (
    <section id="reviews" className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-4 inline-flex items-center gap-3 text-brand-blue justify-center">
            <span className="w-8 h-[2px] bg-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest pl-1">Відгуки клієнтів</span>
            <span className="w-8 h-[2px] bg-brand-blue" />
          </div>
          <h3 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            ЩО ПРО НАС <br/><span className="text-brand-blue">КАЖУТЬ КЛІЄНТИ</span>
          </h3>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto italic leading-relaxed">
            Довіра — це фундамент наших відносин з клієнтами. Пишаємося сотнями успішних кейсів підбору та викупу.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-3xl border border-slate-100 relative group shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-500"
            >
              <div className="absolute top-8 right-10 text-slate-100 group-hover:text-brand-blue/10 transition-colors">
                <Quote size={56} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 p-1 shadow-sm">
                  <img src={review.image} alt={review.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none mb-2">{review.name}</h4>
                  <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest">{review.car}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-brand-blue text-brand-blue" />
                ))}
              </div>

              <p className="text-slate-500 text-sm leading-relaxed font-medium italic relative z-10">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
