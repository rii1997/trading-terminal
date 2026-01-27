import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { IPOCalendarItem } from '../../types/fmp';

interface IPOCalendarProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

// Direct FMP logo URL
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
};

const formatMarketCap = (value: number | null): string => {
  if (value === null) return '--';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};

const getActionColor = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'priced':
      return 'bg-accent-green/20 text-accent-green';
    case 'expected':
      return 'bg-accent-primary/20 text-accent-primary';
    case 'filed':
      return 'bg-accent-yellow/20 text-accent-yellow';
    case 'withdrawn':
      return 'bg-accent-red/20 text-accent-red';
    default:
      return 'bg-bg-tertiary text-text-secondary';
  }
};

export function IPOCalendar({ onSymbolChange, onOpenDescription }: IPOCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipos, setIpos] = useState<IPOCalendarItem[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [filterAction, setFilterAction] = useState<string>('all');
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

  // Fetch IPO data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fmp.ipoCalendar(monthRange.from, monthRange.to);

        // Sort by date descending (most recent first)
        data.sort((a, b) => b.date.localeCompare(a.date));

        setIpos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch IPO calendar');
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
      onSymbolChange('ipo', headerContent);
    }
  }, [monthOffset, onSymbolChange, monthRange.label]);

  const handlePrevMonth = useCallback(() => setMonthOffset(m => m - 1), []);
  const handleNextMonth = useCallback(() => setMonthOffset(m => m + 1), []);
  const handleThisMonth = useCallback(() => setMonthOffset(0), []);

  // Filter IPOs
  const filteredIpos = ipos.filter(ipo => {
    // Filter by action
    if (filterAction !== 'all' && ipo.actions.toLowerCase() !== filterAction.toLowerCase()) {
      return false;
    }
    // Filter by exchange (US vs international)
    if (filterExchange === 'US') {
      const usExchanges = ['NYSE', 'NASDAQ', 'AMEX', 'NYSE ARCA'];
      if (!usExchanges.some(ex => ipo.exchange.toUpperCase().includes(ex))) {
        return false;
      }
    }
    return true;
  });

  // Group by date
  const groupedByDate = filteredIpos.reduce((acc, ipo) => {
    const date = ipo.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(ipo);
    return acc;
  }, {} as Record<string, IPOCalendarItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // Get unique actions for filter
  const uniqueActions = [...new Set(ipos.map(i => i.actions))];

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
            <option value="all">All Exchanges</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded"
          >
            <option value="all">All Status</option>
            {uniqueActions.map(action => (
              <option key={action} value={action.toLowerCase()}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex-shrink-0 p-2 border-b border-border grid grid-cols-4 gap-2 text-center">
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-text-primary">{filteredIpos.length}</div>
          <div className="text-[10px] text-text-secondary">Total IPOs</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-green">
            {filteredIpos.filter(i => i.actions.toLowerCase() === 'priced').length}
          </div>
          <div className="text-[10px] text-text-secondary">Priced</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-primary">
            {filteredIpos.filter(i => i.actions.toLowerCase() === 'expected').length}
          </div>
          <div className="text-[10px] text-text-secondary">Expected</div>
        </div>
        <div className="bg-bg-secondary rounded p-2">
          <div className="text-lg font-bold text-accent-yellow">
            {filteredIpos.filter(i => i.actions.toLowerCase() === 'filed').length}
          </div>
          <div className="text-[10px] text-text-secondary">Filed</div>
        </div>
      </div>

      {/* IPO List */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading IPO calendar...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : filteredIpos.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No IPOs found for this period</div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => {
              const dayIpos = groupedByDate[date];
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
                    <span className="ml-2 text-text-secondary">({dayIpos.length})</span>
                  </div>

                  {/* IPOs for this date */}
                  <div className="border border-border border-t-0 rounded-b divide-y divide-border">
                    {dayIpos.map((ipo, idx) => (
                      <button
                        key={`${ipo.symbol}-${idx}`}
                        onClick={() => onOpenDescription?.(ipo.symbol)}
                        className="w-full p-2 hover:bg-bg-secondary text-left flex items-center gap-3"
                      >
                        {/* Logo */}
                        <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary flex items-center justify-center">
                          <img
                            src={getLogoUrl(ipo.symbol)}
                            alt={ipo.symbol}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <span className="text-[10px] text-text-secondary hidden">
                            {ipo.symbol.slice(0, 2)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{ipo.symbol}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${getActionColor(ipo.actions)}`}>
                              {ipo.actions}
                            </span>
                            <span className="text-[10px] text-text-secondary">{ipo.exchange}</span>
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            {ipo.company}
                          </div>
                        </div>

                        {/* Price & Market Cap */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-text-primary">
                            {ipo.priceRange || '--'}
                          </div>
                          <div className="text-[10px] text-text-secondary">
                            {formatMarketCap(ipo.marketCap)}
                          </div>
                        </div>

                        {/* Shares */}
                        <div className="text-right flex-shrink-0 w-16">
                          <div className="text-[10px] text-text-secondary">Shares</div>
                          <div className="text-xs">
                            {ipo.shares ? (ipo.shares / 1e6).toFixed(1) + 'M' : '--'}
                          </div>
                        </div>
                      </button>
                    ))}
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
          {filterExchange === 'US' ? 'US exchanges only' : 'All exchanges'}
        </span>
        <span>Click company to view details</span>
      </div>
    </div>
  );
}
