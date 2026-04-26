import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Map, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function SitemapHtml() {
  const [data, setData] = useState({
    cars: [] as any[],
    posts: [] as any[]
  });

  useEffect(() => {
    Promise.all([
      supabase.from('cars').select('id, brand, model, year, seo_slug'),
      supabase.from('blog_posts').select('title, slug').eq('is_published', true)
    ]).then(([cars, posts]) => {
      setData({
        cars: cars.data ?? [],
        posts: posts.data ?? []
      });
    });
  }, []);

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-12">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
        {children}
      </div>
    </div>
  );

  const SLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link to={to} className="flex items-center gap-2 text-slate-600 hover:text-brand-blue font-semibold transition-colors group">
      <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
      {children}
    </Link>
  );

  return (
    <>
      <SEOHead title="Карта сайту — VIP.S CARS" url="/sitemap" />
      <div className="min-h-screen bg-white py-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <header className="mb-16">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <Map size={24} className="text-brand-blue" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Карта сайту</h1>
            <p className="text-slate-500 text-lg">Повний список сторінок для зручної навігації.</p>
          </header>

          <Section title="Основні сторінки">
            <SLink to="/">Головна</SLink>
            <SLink to="/catalog">Каталог авто</SLink>
            <SLink to="/about">Про нас</SLink>
            <SLink to="/reviews">Відгуки</SLink>
            <SLink to="/favorites">Обрані</SLink>
            <SLink to="/compare">Порівняння</SLink>
            <SLink to="/feed">Стрічка авто</SLink>
            <SLink to="/blog">Блог</SLink>
          </Section>

          <Section title="Послуги">
            <SLink to="/avtopidbir">Автопідбір</SLink>
            <SLink to="/vykup">Викуп авто</SLink>
            <SLink to="/perevirka">Перевірка авто</SLink>
          </Section>

          <Section title="Каталог автомобілів">
            {data.cars.map(car => (
              <SLink key={car.id} to={`/cars/${car.seo_slug || car.id}`}>
                {car.brand} {car.model} {car.year}
              </SLink>
            ))}
          </Section>

          <Section title="Статті блогу">
            {data.posts.map(post => (
              <SLink key={post.slug} to={`/blog/${post.slug}`}>
                {post.title}
              </SLink>
            ))}
          </Section>

          <Section title="Юридична інформація">
            <SLink to="/privacy">Політика конфіденційності</SLink>
            <SLink to="/cookie">Cookie</SLink>
            <SLink to="/terms">Умови використання</SLink>
            <SLink to="/oferta">Публічна оферта</SLink>
          </Section>
        </div>
      </div>
    </>
  );
}
