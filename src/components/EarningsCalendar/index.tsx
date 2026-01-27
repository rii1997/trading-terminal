import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { EarningsCalendarItem } from '../../types/fmp';

interface EarningsCalendarProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  onOpenDescription?: (symbol: string) => void;
}

// Direct FMP logo URL - no API call needed
const getLogoUrl = (symbol: string): string => {
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
};

export function EarningsCalendar({ onSymbolChange, onOpenDescription }: EarningsCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsCalendarItem[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // Calculate week dates
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));

    const dates: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const fromDate = weekDates[0].toISOString().split('T')[0];
  const toDate = weekDates[4].toISOString().split('T')[0];

  // Format date for display
  const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatWeekRange = (): string => {
    const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Fetch earnings data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fmp.earningsCalendar(fromDate, toDate);

        // Filter and sort
        let filtered = data.filter(e => {
          // Filter out non-US exchanges (basic filter)
          if (e.symbol.includes('.')) return false;
          return true;
        });

        // Sort by date, then by whether they have estimates (prioritize those with estimates)
        filtered.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          // Prioritize those with estimates
          const aHasEstimate = a.epsEstimated !== null ? 0 : 1;
          const bHasEstimate = b.epsEstimated !== null ? 0 : 1;
          return aHasEstimate - bHasEstimate;
        });

        setEarnings(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate]);


  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-primary">{formatWeekRange()}</span>
        </div>
      );
      onSymbolChange('calendar', headerContent);
    }
  }, [weekOffset, onSymbolChange]);

  const handlePrevWeek = useCallback(() => setWeekOffset(w => w - 1), []);
  const handleNextWeek = useCallback(() => setWeekOffset(w => w + 1), []);
  const handleThisWeek = useCallback(() => setWeekOffset(0), []);

  // Group earnings by date
  const earningsByDate = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    let dayEarnings = earnings.filter(e => e.date === dateStr);

    if (!showAllCompanies) {
      dayEarnings = dayEarnings.filter(e => e.epsEstimated !== null);
    }

    return {
      date,
      dateStr,
      earnings: dayEarnings.slice(0, 20), // Limit per day for performance
      total: dayEarnings.length,
    };
  });

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
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={showAllCompanies}
            onChange={(e) => setShowAllCompanies(e.target.checked)}
            className="rounded"
          />
          <span className="text-text-secondary">Show all</span>
        </label>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading earnings calendar...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 h-full">
            {earningsByDate.map(({ date, dateStr, earnings: dayEarnings, total }) => {
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col border rounded ${
                    isToday ? 'border-accent-primary' : 'border-border'
                  } ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Day Header */}
                  <div className={`px-2 py-1 text-xs font-medium border-b ${
                    isToday ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-secondary border-border'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span>{formatDateShort(date)}</span>
                      <span className="text-text-secondary">({total})</span>
                    </div>
                  </div>

                  {/* Earnings List */}
                  <div className="flex-1 overflow-y-auto p-1 space-y-1">
                    {dayEarnings.length === 0 ? (
                      <div className="text-xs text-text-secondary text-center py-4">
                        No earnings
                      </div>
                    ) : (
                      dayEarnings.map((earning, idx) => {
                        const hasReported = earning.epsActual !== null;
                        const beat = hasReported && earning.epsEstimated !== null
                          ? earning.epsActual! > earning.epsEstimated
                          : null;

                        return (
                          <button
                            key={`${earning.symbol}-${idx}`}
                            onClick={() => onOpenDescription?.(earning.symbol)}
                            className="w-full p-1.5 bg-bg-secondary hover:bg-bg-tertiary rounded text-left flex items-center gap-2 group"
                          >
                            {/* Logo - using direct FMP image URL */}
                            <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden bg-bg-tertiary flex items-center justify-center">
                              <img
                                src={getLogoUrl(earning.symbol)}
                                alt={earning.symbol}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Hide broken image and show fallback
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <span className="text-[8px] text-text-secondary hidden">
                                {earning.symbol.slice(0, 2)}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium truncate">
                                  {earning.symbol}
                                </span>
                                {hasReported && (
                                  <span className={`text-[9px] px-1 rounded ${
                                    beat ? 'bg-accent-green/20 text-accent-green' :
                                    beat === false ? 'bg-accent-red/20 text-accent-red' : ''
                                  }`}>
                                    {beat ? 'BEAT' : 'MISS'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-text-secondary truncate">
                                {earning.symbol}
                              </div>
                            </div>

                            {/* EPS */}
                            <div className="text-right flex-shrink-0">
                              {hasReported ? (
                                <div className="text-[10px]">
                                  <div className={beat ? 'text-accent-green' : beat === false ? 'text-accent-red' : ''}>
                                    {earning.epsActual?.toFixed(2)}
                                  </div>
                                  <div className="text-text-secondary">
                                    est: {earning.epsEstimated?.toFixed(2) || '--'}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] text-text-secondary">
                                  {earning.epsEstimated !== null ? (
                                    <span>est: {earning.epsEstimated.toFixed(2)}</span>
                                  ) : (
                                    <span>--</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })
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
          {showAllCompanies ? 'Showing all companies' : 'Showing companies with estimates only'}
        </span>
        <span>Click company to view details</span>
      </div>
    </div>
  );
}
