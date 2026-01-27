import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { SharesFloat } from '../types/fmp';

export function useSharesFloat(symbol: string) {
  const [data, setData] = useState<SharesFloat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fmp.sharesFloat(symbol)
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
