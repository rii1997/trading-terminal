import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { StockNewsItem } from '../types/fmp';

export function useStockNews(symbol?: string, limit = 100) {
  const [data, setData] = useState<StockNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchNews = symbol
      ? fmp.stockNews(symbol, 0, limit)
      : fmp.stockNewsLatest(0, limit);

    fetchNews
      .then((res) => {
        setData(res || []);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [symbol, limit]);

  return { data, loading, error };
}
