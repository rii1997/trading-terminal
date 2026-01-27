import { useState, useEffect } from 'react';
import { fmp } from '../services/fmp';
import type { StockPeer } from '../types/fmp';

interface UseStockPeersResult {
  data: StockPeer[];
  loading: boolean;
  error: Error | null;
}

export function useStockPeers(symbol: string | null): UseStockPeersResult {
  const [data, setData] = useState<StockPeer[]>([]);
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

    fmp.stockPeers(symbol)
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
  }, [symbol]);

  return { data, loading, error };
}
