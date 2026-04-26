import { motion } from 'motion/react';
import { ShieldCheck, Target, TrendingDown, Clock, Gem, Users } from 'lucide-react';

const stats = [
  { label: 'Перевірено авто', value: '1,500+' },
  { label: 'Щасливих клієнтів', value: '800+' },
  { label: 'Економія клієнтів', value: '$1.2M+' },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Гарантія якості',
    desc: 'Кожне авто проходить перевірку за 100+ параметрами.'
  },
  {
    icon: TrendingDown,
    title: 'Максимальний торг',
    desc: 'Ми професійно торгуємось, окупаючи вартість наших послуг.'
  },
  {
    icon: Clock,
    title: 'Швидкість',
    desc: 'Викуп авто за 1 день. Підбір — від 3 до 14 днів.'
  },
  {
    icon: Gem,
    title: 'Преміум сервіс',
    desc: 'Індивідуальний підхід до кожного клієнта.'
  }
];

export default function AboutUs() {
  return (
    <section id="about" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image & Stats */}
          <div className="relative">
             <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 aspect-[4/5] md:aspect-auto shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000" 
                 alt="Premium Car" 
                 className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700 hover:scale-105"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent">
                  <div className="grid grid-cols-3 gap-4">
                     {stats.map((stat, i) => (
                       <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center border border-white/20 shadow-xl">
                          <p className="text-white text-xl md:text-2xl font-black leading-none mb-1">{stat.value}</p>
                          <p className="text-[10px] uppercase font-black text-white/60 tracking-wider font-sans">{stat.label}</p>
                       </div>
                     ))}
                  </div>
               </div>
             </div>
             
             {/* Decorative element */}
             <div className="absolute -top-10 -left-10 w-40 h-40 border-l-4 border-t-4 border-brand-blue/10 rounded-tl-[3rem] -z-10" />
             <div className="absolute -bottom-10 -right-10 w-40 h-40 border-r-4 border-b-4 border-brand-blue/10 rounded-br-[3rem] -z-10" />
          </div>

          {/* Text Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-3 text-brand-blue">
              <span className="w-8 h-[2px] bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest pl-1">Чому ми?</span>
            </div>
            
            <h3 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-10">
              ЧЕСНІСТЬ ТА <br/>
              <span className="text-brand-blue">ПРОФЕСІОНАЛІЗМ</span>
            </h3>
            
            <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium">
              VIP.S CARS — це команда експертів, які знають про ринок вживаних автомобілів все. Ми не просто шукаємо машину, ми шукаємо найкращий варіант, який буде радувати вас роками.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-blue/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2">{feature.title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
