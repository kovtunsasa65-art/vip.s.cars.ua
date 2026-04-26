import { supabase } from './supabase';
import { normalizeQuery } from './searchNormalize';

export interface SearchResult {
  brands: string[];
  models: { brand: string; model: string }[];
  cities: string[];
}

export interface ISearchProvider {
  search(query: string, signal?: AbortSignal): Promise<SearchResult>;
}

// ─── Supabase Implementation (Current) ───────────────────────────────────────
// Використовує ILIKE та базову нормалізацію тексту
export class SupabaseSearchProvider implements ISearchProvider {
  async search(raw: string, signal?: AbortSignal): Promise<SearchResult> {
    const q = normalizeQuery(raw);
    const words = q.trim().split(/\s+/);
    const brandQ = normalizeQuery(words[0]);

    const [brandsRes, modelsRes, citiesRes] = await Promise.all([
      supabase.from('cars').select('brand').eq('status', 'active').ilike('brand', `%${brandQ}%`).limit(60).abortSignal(signal),
      supabase.from('cars').select('brand,model').eq('status', 'active').ilike('model', `%${words.length > 1 ? words.slice(1).join(' ') : q}%`).limit(60).abortSignal(signal),
      supabase.from('cars').select('city').eq('status', 'active').ilike('city', `%${q}%`).limit(40).abortSignal(signal),
    ]);

    if (signal?.aborted) {
      return { brands: [], models: [], cities: [] };
    }

    const brands = [...new Set((brandsRes.data ?? []).map((r: any) => r.brand as string).filter(Boolean))].slice(0, 5);
    const models = [...new Map((modelsRes.data ?? []).filter((r: any) => r.model).map((r: any) => [`${r.brand}|${r.model}`, r])).values()].slice(0, 5) as { brand: string; model: string }[];
    const cities = [...new Set((citiesRes.data ?? []).map((r: any) => r.city as string).filter(Boolean))].slice(0, 3);

    return { brands, models, cities };
  }
}

// ─── Meilisearch / Elasticsearch Implementation (Stub) ───────────────────────
// Архітектурна заглушка для майбутнього впровадження справжнього fuzzy пошуку
// (який буде розуміти 'BWM' -> 'BMW', опечатки і т.д.)
export class MeilisearchProvider implements ISearchProvider {
  async search(raw: string, signal?: AbortSignal): Promise<SearchResult> {
    console.warn('[MeilisearchProvider] Not implemented yet. Falling back to SupabaseSearchProvider.');
    
    // Тут в майбутньому буде:
    // const res = await fetch(`https://meili.vip-s-cars.com/indexes/cars/search?q=${raw}`, { signal });
    // const data = await res.json();
    // return processFuzzyHits(data.hits);
    
    const fallback = new SupabaseSearchProvider();
    return fallback.search(raw, signal);
  }
}

// Активний провайдер пошуку. 
// Щоб увімкнути Fuzzy-пошук, достатньо буде змінити:
// export const searchProvider: ISearchProvider = new MeilisearchProvider();
export const searchProvider: ISearchProvider = new SupabaseSearchProvider();
