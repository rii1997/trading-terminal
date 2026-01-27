import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { DCFValue } from '../types/fmp';

interface UseDCFResult {
  data: DCFValue | null;
  loading: boolean;
  error: Error | null;
}

export function useDCF(symbol: string | null): UseDCFResult {
  const [data, setData] = useState<DCFValue | null>(null);
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

    fmp.dcf(symbol)
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
