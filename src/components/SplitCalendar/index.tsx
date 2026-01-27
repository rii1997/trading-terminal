import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { StockSplitCalendarItem } from '../../types/fmp';

interface SplitCalendarProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
};

const formatSplitRatio = (numerator: number, denominator: number): string => {
  // Simplify common ratios
  if (numerator === 1 && denominator > 1) {
    return `1:${denominator}`; // Reverse split
  }
  if (denominator === 1 && numerator > 1) {
    return `${numerator}:1`; // Forward split
  }
  // Calculate actual ratio
  const ratio = numerator / denominator;
  if (ratio > 1) {
    return `${ratio.toFixed(ratio % 1 === 0 ? 0 : 2)}:1`;
  } else {
    return `1:${(1 / ratio).toFixed((1 / ratio) % 1 === 0 ? 0 : 2)}`;
  }
};

const getSplitTypeColor = (splitType: string): string => {
  if (splitType.toLowerCase().includes('split')) {
    return 'bg-accent-green/20 text-accent-green';
  }
  return 'bg-accent-primary/20 text-accent-primary'; // stock-dividend
};

const isReverseSplit = (numerator: number, denominator: number): boolean => {
  return numerator / denominator < 1;
};

export function SplitCalendar({ onSymbolChange, onOpenDescription }: SplitCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splits, setSplits] = useState<StockSplitCalendarItem[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterExchange, setFilterExchange] = useState<string>('US');

  // Calculate month dates
  const getMonthRange = (offset: number) => {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0],
      label: targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  };

  const monthRange = getMonthRange(monthOffset);

  // Fetch split data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fmp.splitCalendar(monthRange.from, monthRange.to);

        // Sort by date descending (most recent first)
        data.sort((a, b) => b.date.localeCompare(a.date));

        setSplits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch split calendar');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthRange.from, monthRange.to]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-primary">{monthRange.label}</span>
        </div>
      );
      onSymbolChange('splits', headerContent);
    }
  }, [monthOffset, onSymbolChange, monthRange.label]);

  const handlePrevMonth = useCallback(() => setMonthOffset(m => m - 1), []);
  const handleNextMonth = useCallback(() => setMonthOffset(m => m + 1), []);
  const handleThisMonth = useCallback(() => setMonthOffset(0), []);

  // Filter splits
  const filteredSplits = splits.filter(split => {
    // Filter by type
    if (filterType === 'forward') {
      if (isReverseSplit(split.numerator, split.denominator)) return false;
    } else if (filterType === 'reverse') {
      if (!isReverseSplit(split.numerator, split.denominator)) return false;
    } else if (filterType === 'split') {
      if (!split.splitType.toLowerCase().includes('split')) return false;
    } else if (filterType === 'dividend') {
      if (!split.splitType.toLowerCase().includes('dividend')) return false;
    }

    // Filter by exchange (US vs international - basic check)
    if (filterExchange === 'US') {
      // Filter out symbols with dots (international exchanges)
      if (split.symbol.includes('.')) return false;
    }

    return true;
  });

  // Group by date
  const groupedByDate = filteredSplits.reduce((acc, split) => {
    const date = split.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(split);
    return acc;
  }, {} as Record<string, StockSplitCalendarItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Stats
  const forwardSplits = filteredSplits.filter(s => !isReverseSplit(s.numerator, s.denominator));
  const reverseSplits = filteredSplits.filter(s => isReverseSplit(s.numerator, s.denominator));
  const stockDividends = filteredSplits.filter(s => s.splitType.toLowerCase().includes('dividend'));

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary"
          >
            &larr; Prev
          </button>
          <button
            onClick={handleThisMonth}
            className={`px-2 py-1 text-xs border border-border rounded ${
              monthOffset === 0 ? 'bg-accent-primary text-white' : 'bg-bg-secondary hover:bg-bg-tertiary'
            }`}
          >
            This Month
          </button>
          <button
            onClick={handleNextMonth}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary"
          >
            Next &rarr;
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterExchange}
            onChange={(e) => setFilterExchange(e.target.value)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded"
          >
            <option value="US">US Only</option>
            <option value="all">All Markets</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded"
          >
            <option value="all">All Types</option>
            <option value="forward">Forward Splits</option>
            <option value="reverse">Reverse Splits</option>
            <option value="split">Stock Splits</option>
            <option value="dividend">Stock Dividends</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex-shrink-0 p-2 border-b border-border grid grid-cols-4 gap-2 text-center">
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-text-primary">{filteredSplits.length}</div>
          <div className="text-[10px] text-text-secondary">Total</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-green">{forwardSplits.length}</div>
          <div className="text-[10px] text-text-secondary">Forward</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-red">{reverseSplits.length}</div>
          <div className="text-[10px] text-text-secondary">Reverse</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-primary">{stockDividends.length}</div>
          <div className="text-[10px] text-text-secondary">Dividends</div>
        </div>
      </div>

      {/* Split List */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading split calendar...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : filteredSplits.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No stock splits found for this period</div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => {
              const daySplits = groupedByDate[date];
              const isToday = new Date().toISOString().split('T')[0] === date;
              const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);

              return (
                <div key={date} className={isPast ? 'opacity-60' : ''}>
                  {/* Date Header */}
                  <div className={`px-2 py-1 text-xs font-medium rounded-t ${
                    isToday ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary text-text-secondary'
                  }`}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                    <span className="ml-2 text-text-secondary">({daySplits.length})</span>
                  </div>

                  {/* Splits for this date */}
                  <div className="border border-border border-t-0 rounded-b divide-y divide-border">
                    {daySplits.map((split, idx) => {
                      const isReverse = isReverseSplit(split.numerator, split.denominator);

                      return (
                        <button
                          key={`${split.symbol}-${idx}`}
                          onClick={() => onOpenDescription?.(split.symbol)}
                          className="w-full p-2 hover:bg-bg-secondary text-left flex items-center gap-3"
                        >
                          {/* Logo */}
                          <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary flex items-center justify-center">
                            <img
                              src={getLogoUrl(split.symbol)}
                              alt={split.symbol}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <span className="text-[10px] text-text-secondary hidden">
                              {split.symbol.slice(0, 2)}
                            </span>
                          </div>

                          {/* Symbol & Type */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{split.symbol}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${getSplitTypeColor(split.splitType)}`}>
                                {split.splitType.replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Split Ratio */}
                          <div className="text-right flex-shrink-0">
                            <div className={`text-lg font-bold ${isReverse ? 'text-accent-red' : 'text-accent-green'}`}>
                              {formatSplitRatio(split.numerator, split.denominator)}
                            </div>
                            <div className="text-[10px] text-text-secondary">
                              {isReverse ? 'Reverse Split' : 'Forward Split'}
                            </div>
                          </div>

                          {/* Raw Values */}
                          <div className="text-right flex-shrink-0 w-20 text-[10px] text-text-secondary">
                            <div>{split.numerator} : {split.denominator}</div>
                            <div>raw ratio</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-2 py-1 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <span>
          Forward splits increase shares, reverse splits decrease shares
        </span>
        <span>Click company to view details</span>
      </div>
    </div>
  );
}
