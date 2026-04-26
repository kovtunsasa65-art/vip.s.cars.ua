import { Instagram, Send, Phone, MapPin, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PHONE_RAW, PHONE_DISPLAY } from '../lib/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 pt-24 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
             <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-brand-blue/20">V</div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter uppercase text-white leading-none">VIP.S CARS</span>
                  <span className="text-[10px] text-brand-blue font-black uppercase tracking-[0.2em] mt-1">Selection</span>
                </div>
             </Link>
             <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
               Ваш надійний партнер у світі автомобілів. Професійний підбір та вигідний викуп у Києві. Допомагаємо знайти мрію.
             </p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-slate-700 transition-all">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-slate-700 transition-all">
                  <Send size={18} />
                </a>
             </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Навігація</h4>
            <ul className="space-y-4">
               {['Каталог авто', 'Автопідбір', 'Викуп авто', 'Послуги', 'Відгуки'].map((item) => (
                 <li key={item}>
                    <Link to="#" className="text-sm font-bold hover:text-white transition-colors">
                       {item}
                    </Link>
                 </li>
               ))}
            </ul>
          </div>

          {/* Contact 1 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Локація</h4>
            <ul className="space-y-6">
               <li className="space-y-2">
                  <p className="text-xs font-black uppercase text-slate-300 flex items-center gap-2">
                    <MapPin size={14} className="text-brand-blue" /> Київ, Україна
                  </p>
                  <p className="text-xs font-medium">вул. Велика Васильківська, 100</p>
               </li>
               <li className="space-y-2">
                  <p className="text-xs font-black uppercase text-slate-300">Режим роботи</p>
                  <p className="text-xs font-medium">Щодня: 09:00 — 20:00</p>
               </li>
            </ul>
          </div>

          {/* Contact 2 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8">Контакти</h4>
            <ul className="space-y-6">
               <li className="space-y-1">
                  <a href={`tel:${PHONE_RAW}`} className="text-2xl font-black text-white hover:text-brand-blue transition-colors block leading-none">{PHONE_DISPLAY}</a>
                  <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Основна лінія</p>
               </li>
               <li>
                  <a href="mailto:info@vipscars.ua" className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-1 hover:border-brand-blue transition-colors">
                    info@vipscars.ua
                  </a>
               </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
           <span>© {currentYear} VIP.S CARS AUTO SELECTION. ВСІ ПРАВА ЗАХИЩЕНІ.</span>
           <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Політика конфіденційності</a>
              <a href="#" className="hover:text-white transition-colors">Публічна оферта</a>
           </div>
        </div>
      </div>
    </footer>
  );
}
