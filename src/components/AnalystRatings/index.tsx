import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { AnalystGrade, PriceTargetConsensus, Quote } from '../../types/fmp';
import { formatCurrency } from '../../utils/formatters';

interface AnalystRatingsProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

// Rating color helper
const getRatingColor = (rating: string): string => {
  const lower = rating.toLowerCase();
  if (lower.includes('buy') || lower.includes('outperform') || lower.includes('overweight') || lower.includes('accumulate')) {
    return 'text-accent-green';
  }
  if (lower.includes('sell') || lower.includes('underperform') || lower.includes('underweight') || lower.includes('reduce')) {
    return 'text-accent-red';
  }
  return 'text-accent-yellow';
};

// Rating badge background helper
const getRatingBgColor = (rating: string): string => {
  const lower = rating.toLowerCase();
  if (lower.includes('buy') || lower.includes('outperform') || lower.includes('overweight') || lower.includes('accumulate')) {
    return 'bg-accent-green/20';
  }
  if (lower.includes('sell') || lower.includes('underperform') || lower.includes('underweight') || lower.includes('reduce')) {
    return 'bg-accent-red/20';
  }
  return 'bg-accent-yellow/20';
};

// Format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Calculate consensus from grades
const calculateConsensus = (grades: AnalystGrade[]): { rating: string; color: string } => {
  if (grades.length === 0) return { rating: 'N/A', color: 'text-text-secondary' };

  let buyCount = 0;
  let holdCount = 0;
  let sellCount = 0;

  grades.forEach(g => {
    const lower = g.newGrade.toLowerCase();
    if (lower.includes('buy') || lower.includes('outperform') || lower.includes('overweight')) {
      buyCount++;
    } else if (lower.includes('sell') || lower.includes('underperform') || lower.includes('underweight')) {
      sellCount++;
    } else {
      holdCount++;
    }
  });

  const total = buyCount + holdCount + sellCount;
  if (buyCount > total * 0.6) return { rating: 'Strong Buy', color: 'text-accent-green' };
  if (buyCount > total * 0.4) return { rating: 'Buy', color: 'text-accent-green' };
  if (sellCount > total * 0.4) return { rating: 'Sell', color: 'text-accent-red' };
  if (sellCount > total * 0.6) return { rating: 'Strong Sell', color: 'text-accent-red' };
  return { rating: 'Hold', color: 'text-accent-yellow' };
};

export function AnalystRatings({ onSymbolChange, initialSymbol }: AnalystRatingsProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [grades, setGrades] = useState<AnalystGrade[]>([]);
  const [priceTarget, setPriceTarget] = useState<PriceTargetConsensus | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results: searchResults, loading: searchLoading } = useTickerSearch(query, 300);

  // Fetch data
  const fetchData = useCallback(async (sym: string) => {
    setLoading(true);
    try {
      const [gradesData, targetData, quoteData] = await Promise.all([
        fmp.grade(sym, 30),
        fmp.priceTargetConsensus(sym),
        fmp.quote(sym),
      ]);
      setGrades(gradesData);
      setPriceTarget(targetData[0] || null);
      setQuote(quoteData[0] || null);
    } catch (err) {
      console.error('Failed to fetch analyst data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on symbol change
  useEffect(() => {
    fetchData(symbol);
  }, [symbol, fetchData]);

  // Update when initialSymbol changes
  useEffect(() => {
    if (initialSymbol && initialSymbol !== symbol) {
      setSymbol(initialSymbol);
      setQuery(initialSymbol);
    }
  }, [initialSymbol, symbol]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.toUpperCase());
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                setSymbol(query);
                setShowDropdown(false);
              }
            }}
            className="w-20 px-2 py-0.5 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
            placeholder="Symbol"
          />
        </div>
      );
      onSymbolChange(symbol, headerContent);
    }
  }, [symbol, query, onSymbolChange]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSymbol = (sym: string) => {
    setSymbol(sym);
    setQuery(sym);
    setShowDropdown(false);
  };

  const consensus = calculateConsensus(grades);
  const currentPrice = quote?.price || 0;
  const upside = priceTarget ? ((priceTarget.targetConsensus - currentPrice) / currentPrice) * 100 : null;

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Search Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-12 left-2 z-50 w-64 bg-bg-secondary border border-border rounded shadow-lg max-h-48 overflow-y-auto"
        >
          {searchLoading ? (
            <div className="p-2 text-xs text-text-secondary">Searching...</div>
          ) : (
            searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleSelectSymbol(result.symbol)}
                className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary flex justify-between items-center"
              >
                <span className="text-xs font-medium">{result.symbol}</span>
                <span className="text-[10px] text-text-secondary truncate ml-2">{result.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Summary Header */}
      <div className="flex-shrink-0 p-3 border-b border-border bg-bg-secondary">
        <div className="flex items-center justify-between">
          {/* Consensus Rating */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-text-secondary mb-0.5">CONSENSUS</div>
              <div className={`text-xl font-bold ${consensus.color}`}>{consensus.rating}</div>
            </div>
            <div className="text-text-secondary">|</div>
            <div>
              <div className="text-[10px] text-text-secondary mb-0.5">RATINGS</div>
              <div className="text-lg font-semibold">{grades.length}</div>
            </div>
          </div>

          {/* Price Target */}
          {priceTarget && (
            <div className="text-right">
              <div className="text-[10px] text-text-secondary mb-0.5">PRICE TARGET</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{formatCurrency(priceTarget.targetConsensus)}</span>
                {upside !== null && (
                  <span className={`text-sm font-medium ${upside >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    ({upside >= 0 ? '+' : ''}{upside.toFixed(1)}%)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-text-secondary">
                Low: {formatCurrency(priceTarget.targetLow)} | High: {formatCurrency(priceTarget.targetHigh)}
              </div>
            </div>
          )}
        </div>

        {/* Price Target Bar */}
        {priceTarget && currentPrice > 0 && (
          <div className="mt-3">
            <div className="relative h-2 bg-bg-tertiary rounded-full overflow-hidden">
              {/* Range */}
              <div
                className="absolute h-full bg-gradient-to-r from-accent-red via-accent-yellow to-accent-green"
                style={{
                  left: '0%',
                  width: '100%',
                }}
              />
              {/* Current Price Marker */}
              <div
                className="absolute top-0 w-0.5 h-full bg-white"
                style={{
                  left: `${Math.min(Math.max(((currentPrice - priceTarget.targetLow) / (priceTarget.targetHigh - priceTarget.targetLow)) * 100, 0), 100)}%`,
                }}
                title={`Current: ${formatCurrency(currentPrice)}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary mt-1">
              <span>{formatCurrency(priceTarget.targetLow)}</span>
              <span>Current: {formatCurrency(currentPrice)}</span>
              <span>{formatCurrency(priceTarget.targetHigh)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ratings Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        ) : grades.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-text-secondary">
            No analyst ratings available for {symbol}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left font-medium px-3 py-2">Date</th>
                <th className="text-left font-medium px-3 py-2">Firm</th>
                <th className="text-left font-medium px-3 py-2">Rating</th>
                <th className="text-left font-medium px-3 py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => (
                <tr
                  key={`${grade.gradingCompany}-${grade.date}-${idx}`}
                  className="border-b border-border/50 hover:bg-bg-secondary"
                >
                  <td className="px-3 py-2 text-text-secondary font-mono">
                    {formatDate(grade.date)}
                  </td>
                  <td className="px-3 py-2 text-text-primary font-medium">
                    {grade.gradingCompany}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRatingColor(grade.newGrade)} ${getRatingBgColor(grade.newGrade)}`}>
                      {grade.newGrade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-text-secondary">
                    {grade.previousGrade && grade.previousGrade !== grade.newGrade ? (
                      <span className="flex items-center gap-1">
                        <span className={getRatingColor(grade.previousGrade)}>{grade.previousGrade}</span>
                        <span className="text-text-secondary">→</span>
                        <span className={getRatingColor(grade.newGrade)}>{grade.newGrade}</span>
                      </span>
                    ) : (
                      <span className="text-text-secondary">New Coverage</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary">
        {grades.length} analyst rating{grades.length !== 1 ? 's' : ''} for {symbol}
      </div>
    </div>
  );
}
