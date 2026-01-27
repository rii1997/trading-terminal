import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { KeyMetrics } from '../types/fmp';

interface UseKeyMetricsResult {
  data: KeyMetrics | null;
  loading: boolean;
  error: Error | null;
}

export function useKeyMetrics(symbol: string | null): UseKeyMetricsResult {
  const [data, setData] = useState<KeyMetrics | null>(null);
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

    fmp.keyMetrics(symbol)
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
