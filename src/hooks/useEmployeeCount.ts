import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { EmployeeCount } from '../types/fmp';

interface UseEmployeeCountResult {
  data: EmployeeCount[];
  loading: boolean;
  error: Error | null;
}

export function useEmployeeCount(symbol: string | null): UseEmployeeCountResult {
  const [data, setData] = useState<EmployeeCount[]>([]);
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

    fmp.employeeCount(symbol)
      .then((result) => {
        if (!cancelled) {
          // Sort by date descending, limit to last 5 years
          const sorted = result.sort((a, b) =>
            new Date(b.periodOfReport).getTime() - new Date(a.periodOfReport).getTime()
          ).slice(0, 5);
          setData(sorted);
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
