import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function ServerError() {
  return (
    <>
      <SEOHead title="Помилка сервера — VIP.S CARS" />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">500</h1>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Щось пішло не так</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">
            На сервері виникла помилка. Ми вже знаємо про це та працюємо над виправленням. Спробуйте оновити сторінку пізніше.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={18} /> Оновити
            </button>
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20"
            >
              <Home size={18} /> На головну
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
