import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronLeft, Share2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"/>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-black text-slate-900 mb-4">Статтю не знайдено</h1>
        <Link to="/blog" className="text-brand-blue font-bold hover:underline flex items-center gap-2">
          <ChevronLeft size={20} /> Повернутися до блогу
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={post.title} 
        description={post.excerpt}
        image={post.image_url}
        url={`/blog/${post.slug}`} 
      />
      <article className="min-h-screen bg-white pb-20">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[60vh] overflow-hidden bg-slate-900">
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
                <ChevronLeft size={16} /> Блог
              </Link>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-white/60 text-sm font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('uk-UA')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
            {post.excerpt && (
              <p className="text-xl md:text-2xl font-bold text-slate-900 mb-10 leading-relaxed border-l-4 border-brand-blue pl-6">
                {post.excerpt}
              </p>
            )}
            
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-brand-blue prose-img:rounded-3xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                VIP.S CARS Поради
              </div>
              <button 
                onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
