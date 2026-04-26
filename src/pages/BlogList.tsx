import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"/>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Блог VIP.S CARS — Поради та новини авторинку" 
        description="Читайте корисні поради щодо вибору, перевірки та купівлі авто в Україні від експертів VIP.S CARS."
        url="/blog" 
      />
      <div className="min-h-screen bg-slate-50 py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Блог</h1>
            <p className="text-slate-500 max-w-2xl text-lg">
              Ділимося досвідом та знаннями про автомобілі, щоб ваш вибір був легким та безпечним.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <Calendar size={14} />
                    {new Date(post.published_at || post.created_at).toLocaleDateString('uk-UA')}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-3 group-hover:text-brand-blue transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest">
                    Читати далі
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-400 font-bold">Публікацій поки немає, але вони скоро з'являться!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
