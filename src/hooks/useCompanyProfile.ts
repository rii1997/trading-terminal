import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { CompanyProfile } from '../types/fmp';

interface UseCompanyProfileResult {
  data: CompanyProfile | null;
  loading: boolean;
  error: Error | null;
}

export function useCompanyProfile(symbol: string | null): UseCompanyProfileResult {
  const [data, setData] = useState<CompanyProfile | null>(null);
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

    fmp.profile(symbol)
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
