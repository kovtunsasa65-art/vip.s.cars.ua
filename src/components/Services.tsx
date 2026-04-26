import { motion } from 'motion/react';
import { Search, ShieldAlert, BadgeDollarSign, FileText, ChevronRight } from 'lucide-react';

const services = [
  {
    id: 'selection',
    title: 'Автопідбір під ключ',
    description: 'Ми беремо на себе все: від пошуку кращих варіантів до перевірки та торгу. Ви отримуєте ідеальне авто.',
    icon: Search,
    benefits: ['Пошук по всій Україні', 'Аргументований торг', 'Супровід в СЦ МВС']
  },
  {
    id: 'inspection',
    title: 'Разова перевірка',
    description: 'Знайшли авто самі? Ми приїдемо і перевіримо його на 100+ пунктів, щоб ви не купили "кота в мішку".',
    icon: ShieldAlert,
    benefits: ['Діагностика електроніки', 'Перевірка ЛКП', 'Тест-драйв']
  },
  {
    id: 'buyback',
    title: 'Швидкий викуп авто',
    description: 'Потрібні гроші терміново? Викупимо ваше авто за 1 день. Чесна ціна та швидка виплата.',
    icon: BadgeDollarSign,
    benefits: ['Оцінка за 15 хв', 'Виплата готівкою', 'Зняття з обліку']
  },
  {
    id: 'legal',
    title: 'Супровід угоди',
    description: 'Допомога в оформленні документів, перевірці юридичної чистоти та безпечному розрахунку.',
    icon: FileText,
    benefits: ['Перевірка документів', 'Безпечний розрахунок', 'Консультація']
  }
];

export default function Services() {
  return (
    <section id="services" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-end">
          <div className="lg:col-span-8">
            <div className="mb-6 inline-flex items-center gap-3 text-brand-blue">
              <span className="w-8 h-[2px] bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest pl-1">Наші компетенції</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              ПОВНИЙ ЦИКЛ <br/>
              <span className="text-brand-blue">СУПРОВОДУ АВТО</span>
            </h2>
          </div>
          <div className="lg:col-span-4 pb-2">
             <p className="text-slate-500 text-lg leading-relaxed font-medium">
               Забезпечуємо технічну, юридичну та фінансову безпеку вашої майбутньої покупки або продажу.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-50 p-10 rounded-3xl group border border-slate-100 hover:bg-white hover:border-brand-blue hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-500"
            >
              <div className="mb-12 flex justify-between items-start">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm border border-slate-100 transition-transform group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white duration-500">
                  <service.icon size={28} />
                </div>
                <span className="text-4xl font-black text-slate-200 group-hover:text-brand-blue/10 transition-colors select-none">
                  0{idx + 1}
                </span>
              </div>

              <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-none group-hover:text-brand-blue transition-colors">
                {service.title}
              </h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 min-h-[4.5rem]">
                {service.description}
              </p>

              <div className="space-y-4 pt-8 border-t border-slate-200/50">
                {service.benefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                    {benefit}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
