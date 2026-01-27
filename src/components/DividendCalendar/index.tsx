import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { DividendCalendarItem } from '../../types/fmp';

interface DividendCalendarProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getFrequencyColor = (frequency: string): string => {
  switch (frequency.toLowerCase()) {
    case 'monthly':
      return 'bg-accent-primary/20 text-accent-primary';
    case 'quarterly':
      return 'bg-accent-green/20 text-accent-green';
    case 'semi-annual':
      return 'bg-accent-yellow/20 text-accent-yellow';
    case 'annual':
      return 'bg-accent-red/20 text-accent-red';
    default:
      return 'bg-bg-tertiary text-text-secondary';
  }
};

const getYieldColor = (yieldPct: number): string => {
  if (yieldPct >= 8) return 'text-accent-red'; // High yield (possibly risky)
  if (yieldPct >= 4) return 'text-accent-yellow'; // Good yield
  if (yieldPct >= 2) return 'text-accent-green'; // Moderate yield
  return 'text-text-secondary'; // Low yield
};

export function DividendCalendar({ onSymbolChange, onOpenDescription }: DividendCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dividends, setDividends] = useState<DividendCalendarItem[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [filterExchange, setFilterExchange] = useState<string>('US');
  const [sortBy, setSortBy] = useState<'date' | 'yield'>('date');

  // Calculate week dates
  const getWeekRange = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return {
      from: monday.toISOString().split('T')[0],
      to: friday.toISOString().split('T')[0],
      label: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    };
  };

  const weekRange = getWeekRange(weekOffset);

  // Fetch dividend data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fmp.dividendCalendar(weekRange.from, weekRange.to);
        setDividends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dividend calendar');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekRange.from, weekRange.to]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-primary">{weekRange.label}</span>
        </div>
      );
      onSymbolChange('dividends', headerContent);
    }
  }, [weekOffset, onSymbolChange, weekRange.label]);

  const handlePrevWeek = useCallback(() => setWeekOffset(w => w - 1), []);
  const handleNextWeek = useCallback(() => setWeekOffset(w => w + 1), []);
  const handleThisWeek = useCallback(() => setWeekOffset(0), []);

  // Filter dividends
  const filteredDividends = dividends.filter(div => {
    // Filter by frequency
    if (filterFrequency !== 'all' && div.frequency.toLowerCase() !== filterFrequency.toLowerCase()) {
      return false;
    }

    // Filter by exchange (US vs international - basic check)
    if (filterExchange === 'US') {
      // Filter out symbols with dots (international exchanges)
      if (div.symbol.includes('.')) return false;
    }

    return true;
  });

  // Sort dividends
  const sortedDividends = [...filteredDividends].sort((a, b) => {
    if (sortBy === 'yield') {
      return b.yield - a.yield;
    }
    return a.date.localeCompare(b.date);
  });

  // Group by date
  const groupedByDate = sortedDividends.reduce((acc, div) => {
    const date = div.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(div);
    return acc;
  }, {} as Record<string, DividendCalendarItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort();

  // Stats
  const uniqueFrequencies = [...new Set(dividends.map(d => d.frequency))];
  const avgYield = filteredDividends.length > 0
    ? filteredDividends.reduce((sum, d) => sum + d.yield, 0) / filteredDividends.length
    : 0;
  const highYieldCount = filteredDividends.filter(d => d.yield >= 4).length;

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary"
          >
            &larr; Prev
          </button>
          <button
            onClick={handleThisWeek}
            className={`px-2 py-1 text-xs border border-border rounded ${
              weekOffset === 0 ? 'bg-accent-primary text-white' : 'bg-bg-secondary hover:bg-bg-tertiary'
            }`}
          >
            This Week
          </button>
          <button
            onClick={handleNextWeek}
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
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded"
          >
            <option value="all">All Frequencies</option>
            {uniqueFrequencies.map(freq => (
              <option key={freq} value={freq.toLowerCase()}>{freq}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'yield')}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded"
          >
            <option value="date">Sort by Date</option>
            <option value="yield">Sort by Yield</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex-shrink-0 p-2 border-b border-border grid grid-cols-4 gap-2 text-center">
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-text-primary">{filteredDividends.length}</div>
          <div className="text-[10px] text-text-secondary">Ex-Div Dates</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-green">{avgYield.toFixed(2)}%</div>
          <div className="text-[10px] text-text-secondary">Avg Yield</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-yellow">{highYieldCount}</div>
          <div className="text-[10px] text-text-secondary">High Yield (4%+)</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-primary">
            {filteredDividends.filter(d => d.frequency.toLowerCase() === 'quarterly').length}
          </div>
          <div className="text-[10px] text-text-secondary">Quarterly</div>
        </div>
      </div>

      {/* Dividend List */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading dividend calendar...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : filteredDividends.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No ex-dividend dates found for this period</div>
          </div>
        ) : sortBy === 'yield' ? (
          // Flat list sorted by yield
          <div className="space-y-1">
            {sortedDividends.slice(0, 50).map((div, idx) => (
              <DividendRow
                key={`${div.symbol}-${idx}`}
                dividend={div}
                onOpenDescription={onOpenDescription}
                showDate
              />
            ))}
            {sortedDividends.length > 50 && (
              <div className="text-center text-xs text-text-secondary py-2">
                Showing top 50 of {sortedDividends.length} results
              </div>
            )}
          </div>
        ) : (
          // Grouped by date
          <div className="space-y-4">
            {sortedDates.map(date => {
              const dayDividends = groupedByDate[date];
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
                    <span className="ml-2 text-text-secondary">({dayDividends.length} ex-div)</span>
                  </div>

                  {/* Dividends for this date */}
                  <div className="border border-border border-t-0 rounded-b divide-y divide-border">
                    {dayDividends.slice(0, 20).map((div, idx) => (
                      <DividendRow
                        key={`${div.symbol}-${idx}`}
                        dividend={div}
                        onOpenDescription={onOpenDescription}
                      />
                    ))}
                    {dayDividends.length > 20 && (
                      <div className="text-center text-xs text-text-secondary py-2">
                        +{dayDividends.length - 20} more
                      </div>
                    )}
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
          Ex-dividend date = last day to buy for dividend
        </span>
        <span>Click company to view details</span>
      </div>
    </div>
  );
}

// Dividend Row Component
function DividendRow({
  dividend,
  onOpenDescription,
  showDate = false
}: {
  dividend: DividendCalendarItem;
  onOpenDescription?: (symbol: string) => void;
  showDate?: boolean;
}) {
  return (
    <button
      onClick={() => onOpenDescription?.(dividend.symbol)}
      className="w-full p-2 hover:bg-bg-secondary text-left flex items-center gap-3"
    >
      {/* Logo */}
      <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary flex items-center justify-center">
        <img
          src={getLogoUrl(dividend.symbol)}
          alt={dividend.symbol}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="text-[10px] text-text-secondary hidden">
          {dividend.symbol.slice(0, 2)}
        </span>
      </div>

      {/* Symbol & Frequency */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{dividend.symbol}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${getFrequencyColor(dividend.frequency)}`}>
            {dividend.frequency}
          </span>
        </div>
        {showDate && (
          <div className="text-[10px] text-text-secondary">
            Ex: {formatDate(dividend.date)}
          </div>
        )}
      </div>

      {/* Dividend Amount */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-medium">${dividend.dividend.toFixed(4)}</div>
        <div className="text-[10px] text-text-secondary">per share</div>
      </div>

      {/* Yield */}
      <div className="text-right flex-shrink-0 w-16">
        <div className={`text-lg font-bold ${getYieldColor(dividend.yield)}`}>
          {dividend.yield.toFixed(2)}%
        </div>
        <div className="text-[10px] text-text-secondary">yield</div>
      </div>

      {/* Dates */}
      <div className="text-right flex-shrink-0 w-24 text-[10px] text-text-secondary">
        <div>Pay: {formatDate(dividend.paymentDate)}</div>
        <div>Rec: {formatDate(dividend.recordDate)}</div>
      </div>
    </button>
  );
}
