import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { AnalystEstimate } from '../types/fmp';

interface UseAnalystEstimatesResult {
  data: AnalystEstimate[];
  loading: boolean;
  error: Error | null;
}

export function useAnalystEstimates(symbol: string | null, period: 'annual' | 'quarter' = 'annual', limit = 4): UseAnalystEstimatesResult {
  const [data, setData] = useState<AnalystEstimate[]>([]);
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

    fmp.estimates(symbol, period, limit)
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
  }, [symbol, period, limit]);

  return { data, loading, error };
}
