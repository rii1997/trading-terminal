import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { AnalystGrade } from '../types/fmp';

interface UseAnalystGradesResult {
  data: AnalystGrade[];
  loading: boolean;
  error: Error | null;
}

export function useAnalystGrades(symbol: string | null, limit = 10): UseAnalystGradesResult {
  const [data, setData] = useState<AnalystGrade[]>([]);
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

    fmp.grade(symbol, limit)
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
  }, [symbol, limit]);

  return { data, loading, error };
}
