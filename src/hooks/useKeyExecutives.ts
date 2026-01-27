import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { KeyExecutive } from '../types/fmp';

interface UseKeyExecutivesResult {
  data: KeyExecutive[];
  loading: boolean;
  error: Error | null;
}

export function useKeyExecutives(symbol: string | null): UseKeyExecutivesResult {
  const [data, setData] = useState<KeyExecutive[]>([]);
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

    fmp.keyExecutives(symbol)
      .then((result) => {
        if (!cancelled) {
          // Filter to only active executives and limit to top 10
          const activeExecs = result.filter(e => e.active).slice(0, 10);
          setData(activeExecs);
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
