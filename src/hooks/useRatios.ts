import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { Ratios } from '../types/fmp';

interface UseRatiosResult {
  data: Ratios | null;
  loading: boolean;
  error: Error | null;
}

export function useRatios(symbol: string | null): UseRatiosResult {
  const [data, setData] = useState<Ratios | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fmp.ratios(symbol)
      .then((result) => {
        if (!cancelled) {
          setData(result[0] || null);
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
  }, [symbol]);

  return { data, loading, error };
}
