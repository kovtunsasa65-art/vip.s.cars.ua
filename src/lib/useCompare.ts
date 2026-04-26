import { useState, useEffect, useCallback } from 'react';

const KEY = 'compare_ids';
const MAX = 3;

function readIds(): number[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

export function useCompare() {
  const [ids, setIds] = useState<number[]>(readIds);

  // Sync across tabs
  useEffect(() => {
    const h = () => setIds(readIds());
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const toggle = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < MAX ? [...prev, id] : prev;
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.setItem(KEY, '[]');
    setIds([]);
  }, []);

  const compareUrl = `/compare?ids=${ids.join(',')}`;

  return { ids, toggle, clear, compareUrl, count: ids.length, maxReached: ids.length >= MAX };
}
