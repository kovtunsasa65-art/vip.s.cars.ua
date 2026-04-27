import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface SeoPageData {
  seo_title?: string;
  seo_desc?:  string;
  h1?:        string;
  content?:   string;
}

// Завантажує SEO-дані з таблиці seo_pages для вказаного slug.
// Повертає {} якщо запис не знайдено — компонент використовує свої fallback-значення.
export function useSeoPage(slug: string): SeoPageData {
  const [data, setData] = useState<SeoPageData>({});

  useEffect(() => {
    supabase
      .from('seo_pages')
      .select('seo_title, seo_desc, h1, content')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data: row }) => { if (row) setData(row); });
  }, [slug]);

  return data;
}
