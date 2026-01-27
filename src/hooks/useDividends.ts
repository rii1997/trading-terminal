import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { Dividend } from '../types/fmp';

export function useDividends(symbol: string, limit = 5) {
  const [data, setData] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.dividends(symbol, limit)
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
