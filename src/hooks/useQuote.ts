import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { Quote } from '../types/fmp';

interface UseQuoteResult {
  data: Quote | null;
  loading: boolean;
  error: Error | null;
}

export function useQuote(symbol: string | null): UseQuoteResult {
  const [data, setData] = useState<Quote | null>(null);
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

    fmp.quote(symbol)
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
