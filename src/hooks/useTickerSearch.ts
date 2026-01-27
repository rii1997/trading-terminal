import { useState, useEffect, useRef } from 'react';
import { fmp } from '../services/fmp';
import type { SearchResult } from '../types/fmp';

interface UseTickerSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
}

export function useTickerSearch(query: string, debounceMs = 300): UseTickerSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search for empty or very short queries
    if (!query || query.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const upperQuery = query.toUpperCase();

    // Debounce the search
    timeoutRef.current = window.setTimeout(async () => {
      try {
        // Get name search results
        const nameResults = await fmp.search(query);

        // Sort results to prioritize:
        // 1. Exact symbol match (AAPL when searching "AAPL")
        // 2. Symbol starts with query (AAPL when searching "AA")
        // 3. Symbol contains query
        // 4. Everything else (name matches)
        const sortedResults = [...nameResults].sort((a, b) => {
          const aSymbol = a.symbol.toUpperCase();
          const bSymbol = b.symbol.toUpperCase();

          // Exact match gets highest priority
          const aExact = aSymbol === upperQuery;
          const bExact = bSymbol === upperQuery;
          if (aExact && !bExact) return -1;
          if (bExact && !aExact) return 1;

          // Symbol starts with query gets second priority
          const aStarts = aSymbol.startsWith(upperQuery);
          const bStarts = bSymbol.startsWith(upperQuery);
          if (aStarts && !bStarts) return -1;
          if (bStarts && !aStarts) return 1;

          // Prefer shorter symbols (likely the main listing, not ETFs)
          if (aStarts && bStarts) {
            // Prefer US exchanges
            const aIsUS = ['NYSE', 'NASDAQ', 'AMEX'].includes(a.exchangeShortName || '');
            const bIsUS = ['NYSE', 'NASDAQ', 'AMEX'].includes(b.exchangeShortName || '');
            if (aIsUS && !bIsUS) return -1;
            if (bIsUS && !aIsUS) return 1;

            return aSymbol.length - bSymbol.length;
          }

          // Symbol contains query
          const aContains = aSymbol.includes(upperQuery);
          const bContains = bSymbol.includes(upperQuery);
          if (aContains && !bContains) return -1;
          if (bContains && !aContains) return 1;

          return 0;
        });

        // If no exact match found and query looks like a ticker, try to fetch quote directly
        const hasExactMatch = sortedResults.some(r => r.symbol.toUpperCase() === upperQuery);
        if (!hasExactMatch && /^[A-Z]{1,5}$/.test(upperQuery)) {
          try {
            const quoteData = await fmp.quote(upperQuery);
            if (quoteData && quoteData.length > 0 && quoteData[0].symbol) {
              const quote = quoteData[0];
              // Add exact match at the beginning
              const exactResult: SearchResult = {
                symbol: quote.symbol,
                name: quote.name || quote.symbol,
                currency: 'USD',
                stockExchange: quote.exchange || '',
                exchangeShortName: quote.exchange || 'US',
              };
              sortedResults.unshift(exactResult);
            }
          } catch {
            // Quote fetch failed, just use search results
          }
        }

        setResults(sortedResults);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  return { results, loading, error };
}
