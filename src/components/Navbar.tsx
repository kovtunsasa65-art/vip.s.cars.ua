import { useState, useEffect } from 'react';
import { Phone, Menu, X, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { PHONE_RAW, PHONE_DISPLAY } from '../lib/config';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

          <a
            href="#contact"
            className="bg-brand-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue/20"
          >
            Викуп авто
          </a>

          {user ? (
            <Link
              to={user.email === 'kovtunsasa65@gmail.com' ? '/admin' : '/dashboard'}
              className="text-slate-400 hover:text-brand-blue transition-colors flex items-center justify-center p-2 bg-slate-50 rounded-full"
            >
              <User size={20} />
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-slate-500 font-bold text-sm hover:text-brand-blue transition-colors flex items-center gap-2"
            >
              <div className="p-2 bg-slate-50 rounded-full">
                <User size={18} />
              </div>
              <span className="hidden xl:inline">Вхід</span>
            </Link>
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
                className="text-xl font-bold text-slate-900 hover:text-brand-blue"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
