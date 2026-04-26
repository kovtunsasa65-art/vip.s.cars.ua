import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SitemapXml() {
  const [xml, setXml] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      const baseUrl = window.location.origin;
      
      const { data: cars } = await supabase.from('cars').select('id, seo_slug, updated_at');
      const { data: posts } = await supabase.from('blog_posts').select('slug, published_at').eq('is_published', true);

      const staticPages = [
        '', '/catalog', '/about', '/reviews', '/favorites', '/compare', '/feed', '/blog',
        '/avtopidbir', '/vykup', '/perevirka', '/privacy', '/cookie', '/terms', '/oferta'
      ];

      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static
      staticPages.forEach(path => {
        xmlContent += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });

      // Cars
      cars?.forEach(car => {
        xmlContent += `  <url>\n    <loc>${baseUrl}/cars/${car.seo_slug || car.id}</loc>\n    <lastmod>${new Date(car.updated_at || Date.now()).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      // Posts
      posts?.forEach(post => {
        xmlContent += `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${new Date(post.published_at || Date.now()).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      });

      xmlContent += '</urlset>';
      setXml(xmlContent);
    };

    generateSitemap();
  }, []);

  // Рендеримо як текстовий блок для перегляду (в реальності краще генерувати статично)
  return (
    <div className="bg-slate-900 min-h-screen p-4 overflow-auto">
      <pre className="text-green-400 text-xs font-mono whitespace-pre">
        {xml}
      </pre>
    </div>
  );
}
