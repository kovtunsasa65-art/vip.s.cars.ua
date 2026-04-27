import { useState, useEffect } from 'react';
import { Phone, Menu, X, User, Search, Home, Heart, ArrowRight, Plus, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../lib/SiteSettingsContext';
import { useCompare } from '../lib/useCompare';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { count: compareCount, compareUrl } = useCompare();
  const { phone: PHONE_RAW, phoneDisplay: PHONE_DISPLAY } = useSiteSettings();

  const loadRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    setIsAdmin(data?.role === 'admin' || data?.role === 'manager');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadRole(session.user.id);
      else setIsAdmin(false);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Автопідбір', href: '/avtopidbir' },
    { name: 'Викуп', href: '/vykup' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'Відгуки', href: '/reviews' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-white border-slate-100 py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-1 group">
          <Link to="/admin-login" className="text-2xl font-black tracking-tighter text-brand-blue hover:text-brand-blue-dark transition-colors" title="Вхід для партнерів">
            vip.s.
          </Link>
          <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-brand-blue transition-colors">
            cars.ua
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-slate-600">
          {[
            { name: 'Головна', href: '/' },
            { name: 'Авто в наявності', href: '/catalog' },
            { name: 'Автопідбір', href: '/avtopidbir' },
            { name: 'Викуп авто', href: '/vykup' },
            { name: 'Контакти', href: '#footer' },
          ].map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'transition-colors hover:text-brand-blue relative group/nav',
                location.pathname === link.href && 'text-brand-blue font-bold border-b-2 border-brand-blue'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
{/* Desktop left-bottom compare banner — показується лише якщо є авто */}
          {compareCount > 0 && (
            <div className="fixed left-4 bottom-4 hidden lg:flex bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 shadow-sm items-center gap-2 z-50">
              <span className="text-sm font-medium text-slate-700">
                {compareCount} авто в порівнянні
              </span>
              <Link to={compareUrl} className="text-brand-blue font-bold hover:underline flex items-center gap-1">
                Порівняти <ArrowRight size={14} />
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-slate-900 font-bold group">
            <Phone size={18} className="text-brand-blue" />
            <a href={`tel:${PHONE_RAW}`} className="group-hover:text-brand-blue transition-colors">
              {PHONE_DISPLAY}
            </a>
          </div>

          <button
            onClick={() => navigate('/catalog')}
            className="p-2 text-slate-500 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-colors"
            title="Пошук авто"
          >
            <Search size={18} />
          </button>

          <Link
            to="#contact"
            className="bg-brand-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/20"
          >
            Викуп авто
          </Link>

          {user ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="text-slate-400 hover:text-brand-blue transition-colors flex items-center justify-center p-2 bg-slate-50 rounded-full"
            >
              <User size={20} />
            </Link>
          ) : (
            <>
              <Link
                to="/sell"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand-blue/20"
              >
                <Plus size={14} />
                Продати авто
              </Link>
              <Link
                to="/compare"
                className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <BarChart3 size={20} />
              </Link>
              <Link
                to="/login"
                className="text-slate-500 font-bold text-sm hover:text-brand-blue transition-colors flex items-center gap-2"
              >
                <div className="p-2 bg-slate-50 rounded-full">
                  <User size={18} />
                </div>
                <span className="hidden xl:inline">Вхід</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xl font-bold text-slate-900 hover:text-brand-blue border-b border-slate-50 pb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
              className="mt-4 flex items-center justify-center gap-3 bg-brand-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={20} />
              {user ? 'Мій кабінет' : 'Увійти в кабінет'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center py-2 pb-safe lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center text-slate-600 hover:text-brand-blue">
          <Home size={20} />
          <span className="text-xs">Головна</span>
        </Link>
        <Link to="/catalog" className="flex flex-col items-center text-slate-600 hover:text-brand-blue">
          <Search size={20} />
          <span className="text-xs">Пошук</span>
        </Link>
        <Link to="/favorites" className="flex flex-col items-center text-slate-600 hover:text-brand-blue">
          <Heart size={20} />
          <span className="text-xs">Обране</span>
        </Link>
        <Link 
          to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} 
          className={cn("flex flex-col items-center text-slate-600 hover:text-brand-blue", (location.pathname === '/login' || location.pathname === '/dashboard' || location.pathname === '/admin') && "text-brand-blue")}
        >
          <User size={20} />
          <span className="text-xs">{user ? 'Кабінет' : 'Вхід'}</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center text-slate-600 hover:text-brand-blue">
          <Menu size={20} />
          <span className="text-xs">Меню</span>
        </button>
      </nav>
    </nav>
  );
}
