import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { RatiosTTM } from '../types/fmp';

export function useRatiosTTM(symbol: string) {
  const [data, setData] = useState<RatiosTTM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.ratiosTTM(symbol)
      .then((res) => {
        setData(res[0] || null);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading, error };
}
