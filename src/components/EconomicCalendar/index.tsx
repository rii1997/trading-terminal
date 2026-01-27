import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { EconomicEvent } from '../../types/fmp';

interface EconomicCalendarProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
}

// Country flag emojis
const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  EU: '🇪🇺',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  CN: '🇨🇳',
  CA: '🇨🇦',
  AU: '🇦🇺',
  NZ: '🇳🇿',
  CH: '🇨🇭',
  KR: '🇰🇷',
  IN: '🇮🇳',
  BR: '🇧🇷',
  MX: '🇲🇽',
  RU: '🇷🇺',
  ZA: '🇿🇦',
  IT: '🇮🇹',
  ES: '🇪🇸',
  BE: '🇧🇪',
  NL: '🇳🇱',
  SE: '🇸🇪',
  NO: '🇳🇴',
  DK: '🇩🇰',
  PL: '🇵🇱',
  TR: '🇹🇷',
  SG: '🇸🇬',
  HK: '🇭🇰',
  TW: '🇹🇼',
};

// Impact colors
const getImpactColor = (impact: string): string => {
  switch (impact) {
    case 'High': return 'bg-accent-red text-white';
    case 'Medium': return 'bg-accent-yellow text-black';
    case 'Low': return 'bg-bg-tertiary text-text-secondary';
    default: return 'bg-bg-tertiary text-text-secondary';
  }
};

const getImpactBorderColor = (impact: string): string => {
  switch (impact) {
    case 'High': return 'border-l-accent-red';
    case 'Medium': return 'border-l-accent-yellow';
    case 'Low': return 'border-l-border';
    default: return 'border-l-border';
  }
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Format time for display
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Format value with unit
const formatValue = (value: number | null, unit: string | null): string => {
  if (value === null) return '-';
  if (unit === '%') return `${value}%`;
  if (unit === 'K') return `${value}K`;
  if (unit === 'M') return `${value}M`;
  if (unit === 'B') return `${value}B`;
  return value.toString();
};

// Check if event is in the past
const isPastEvent = (dateStr: string): boolean => {
  return new Date(dateStr) < new Date();
};

// Group events by date
const groupEventsByDate = (events: EconomicEvent[]): Map<string, EconomicEvent[]> => {
  const grouped = new Map<string, EconomicEvent[]>();
  events.forEach(event => {
    const dateKey = event.date.split(' ')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });
  return grouped;
};

type ImpactFilter = 'All' | 'High' | 'Medium' | 'Low';
type CountryFilter = 'All' | 'US' | 'Major';

const MAJOR_COUNTRIES = ['US', 'GB', 'EU', 'DE', 'JP', 'CN', 'CA', 'AU'];

export function EconomicCalendar({ onSymbolChange }: EconomicCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('All');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('US');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Calculate week range
  const getWeekRange = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      from: startOfWeek.toISOString().split('T')[0],
      to: endOfWeek.toISOString().split('T')[0],
      label: `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  }, [weekOffset]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getWeekRange();
      const data = await fmp.economicCalendar(from, to);

      // Sort by date descending (most recent first within each day)
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch economic calendar');
    } finally {
      setLoading(false);
    }
  }, [getWeekRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const { label } = getWeekRange();
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-primary font-medium">{label}</span>
        </div>
      );
      onSymbolChange('economic', headerContent);
    }
  }, [weekOffset, onSymbolChange, getWeekRange]);

  // Filter events
  const filteredEvents = events.filter(event => {
    // Impact filter
    if (impactFilter !== 'All' && event.impact !== impactFilter) return false;

    // Country filter
    if (countryFilter === 'US' && event.country !== 'US') return false;
    if (countryFilter === 'Major' && !MAJOR_COUNTRIES.includes(event.country)) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return event.event.toLowerCase().includes(query) ||
             event.country.toLowerCase().includes(query);
    }

    return true;
  });

  // Group by date
  const groupedEvents = groupEventsByDate(filteredEvents);
  const sortedDates = Array.from(groupedEvents.keys()).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Count high impact events
  const highImpactCount = filteredEvents.filter(e => e.impact === 'High').length;

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border space-y-2">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary"
            >
              ← Prev
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                weekOffset === 0
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary"
            >
              Next →
            </button>
          </div>
          <div className="flex items-center gap-2">
            {highImpactCount > 0 && (
              <span className="text-xs text-accent-red font-medium">
                {highImpactCount} High Impact
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-bg-secondary border border-border rounded focus:outline-none focus:border-accent-primary"
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as CountryFilter)}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded focus:outline-none"
          >
            <option value="All">All Countries</option>
            <option value="US">US Only</option>
            <option value="Major">Major Economies</option>
          </select>
          <div className="flex items-center gap-1">
            {(['All', 'High', 'Medium', 'Low'] as ImpactFilter[]).map(impact => (
              <button
                key={impact}
                onClick={() => setImpactFilter(impact)}
                className={`px-2 py-1 text-xs rounded border ${
                  impactFilter === impact
                    ? impact === 'High' ? 'bg-accent-red text-white border-accent-red'
                      : impact === 'Medium' ? 'bg-accent-yellow text-black border-accent-yellow'
                      : impact === 'Low' ? 'bg-bg-tertiary border-border'
                      : 'bg-accent-primary text-white border-accent-primary'
                    : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
                }`}
              >
                {impact}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">Loading economic calendar...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-text-secondary">No events found for this period</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedDates.map(dateKey => {
              const dayEvents = groupedEvents.get(dateKey) || [];
              const isToday = dateKey === new Date().toISOString().split('T')[0];

              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className={`sticky top-0 px-3 py-2 text-xs font-medium ${
                    isToday ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-secondary text-text-secondary'
                  }`}>
                    {formatDate(dateKey)}
                    {isToday && <span className="ml-2 text-accent-primary">(Today)</span>}
                    <span className="ml-2 text-text-muted">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Events for this date */}
                  {dayEvents.map((event, idx) => {
                    const isPast = isPastEvent(event.date);
                    const hasResult = event.actual !== null;
                    const beat = event.estimate !== null && event.actual !== null && event.actual > event.estimate;
                    const miss = event.estimate !== null && event.actual !== null && event.actual < event.estimate;

                    return (
                      <div
                        key={`${event.date}-${event.event}-${idx}`}
                        className={`px-3 py-2 border-l-4 ${getImpactBorderColor(event.impact)} ${
                          isPast ? 'opacity-70' : ''
                        } hover:bg-bg-secondary`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Time, Country, Event */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-text-secondary font-mono">
                                {formatTime(event.date)}
                              </span>
                              <span className="text-sm" title={event.country}>
                                {countryFlags[event.country] || event.country}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getImpactColor(event.impact)}`}>
                                {event.impact}
                              </span>
                            </div>
                            <div className="text-sm font-medium truncate">
                              {event.event}
                            </div>
                          </div>

                          {/* Right: Values */}
                          <div className="flex items-center gap-4 text-xs flex-shrink-0">
                            <div className="text-center min-w-[50px]">
                              <div className="text-text-secondary">Previous</div>
                              <div className="font-mono">
                                {formatValue(event.previous, event.unit)}
                              </div>
                            </div>
                            <div className="text-center min-w-[50px]">
                              <div className="text-text-secondary">Forecast</div>
                              <div className="font-mono">
                                {formatValue(event.estimate, event.unit)}
                              </div>
                            </div>
                            <div className="text-center min-w-[50px]">
                              <div className="text-text-secondary">Actual</div>
                              <div className={`font-mono font-medium ${
                                hasResult
                                  ? beat ? 'text-accent-green' : miss ? 'text-accent-red' : 'text-text-primary'
                                  : 'text-text-muted'
                              }`}>
                                {formatValue(event.actual, event.unit)}
                                {hasResult && beat && ' ▲'}
                                {hasResult && miss && ' ▼'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-[10px] text-text-secondary flex justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-red"></span> High Impact
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-yellow"></span> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-bg-tertiary border border-border"></span> Low
          </span>
        </div>
        <span>
          {filteredEvents.length} events
          {lastUpdate && ` | Updated ${lastUpdate.toLocaleTimeString()}`}
        </span>
      </div>
    </div>
  );
}
