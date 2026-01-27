import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { FmpArticle } from '../types/fmp';

export function useArticles(limit = 100) {
  const [data, setData] = useState<FmpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fmp.articles(limit)
      .then((res) => {
        setData(res || []);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return { data, loading, error };
}
