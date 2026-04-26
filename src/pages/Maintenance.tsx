import { Settings, Clock, Phone } from 'lucide-react';
import { PHONE_TEL, PHONE_DISPLAY } from '../lib/config';
import SEOHead from '../components/SEOHead';

export default function Maintenance() {
  return (
    <>
      <SEOHead title="Технічні роботи — VIP.S CARS" />
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="relative w-32 h-32 mx-auto mb-12">
            <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-slate-800 rounded-3xl w-full h-full flex items-center justify-center border border-slate-700">
              <Settings size={64} className="text-brand-blue animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Проводимо технічне <span className="text-brand-blue">обслуговування</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Ми оновлюємо сайт, щоб зробити його ще зручнішим для вас. Це займе зовсім небагато часу. Дякуємо за терпіння!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-brand-blue mb-2 font-bold uppercase tracking-widest text-xs">
                <Clock size={16} /> Час повернення
              </div>
              <div className="text-white text-xl font-bold">Орієнтовно за 2 години</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-brand-blue mb-2 font-bold uppercase tracking-widest text-xs">
                <Phone size={16} /> Ми на зв'язку
              </div>
              <a href={PHONE_TEL} className="text-white text-xl font-bold hover:text-brand-blue transition-colors">
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">
            VIP.S CARS • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
