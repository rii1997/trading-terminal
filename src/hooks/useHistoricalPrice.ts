import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { HistoricalPrice } from '../types/fmp';

interface UseHistoricalPriceResult {
  data: HistoricalPrice[];
  loading: boolean;
  error: Error | null;
}

export function useHistoricalPrice(
  symbol: string | null,
  from?: string,
  to?: string
): UseHistoricalPriceResult {
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fmp.historicalPrice(symbol, from, to)
      .then((result) => {
        if (!cancelled) {
          setData(result || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, from, to]);

  return { data, loading, error };
}
