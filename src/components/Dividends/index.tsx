import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { Quote, Dividend, CompanyProfile } from '../../types/fmp';

interface DividendsProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

export function Dividends({ onSymbolChange, initialSymbol }: DividendsProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [dividends, setDividends] = useState<Dividend[]>([]);

  const { results: searchResults, loading: searchLoading } = useTickerSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data when symbol changes
  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [quoteData, profileData, dividendData] = await Promise.all([
          fmp.quote(symbol),
          fmp.profile(symbol),
          fmp.dividends(symbol, 100), // Get more history
        ]);

        setQuote(quoteData[0] || null);
        setProfile(profileData[0] || null);
        setDividends(dividendData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Update header content
  useEffect(() => {
    if (onSymbolChange && quote) {
      const headerContent = (
        <span className="text-xs text-text-secondary font-mono">{symbol}</span>
      );
      onSymbolChange(symbol, headerContent);
    }
  }, [symbol, quote, onSymbolChange]);

  const handleSymbolSelect = useCallback((newSymbol: string) => {
    setSymbol(newSymbol);
    setQuery(newSymbol);
    setIsDropdownOpen(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      handleSymbolSelect(query);
    }
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Calculate metrics
  const calculate12MonthYield = (): string => {
    if (!quote || dividends.length === 0) return '-';
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentDividends = dividends.filter(d => new Date(d.date) >= oneYearAgo);
    const totalDiv = recentDividends.reduce((sum, d) => sum + (d.dividend || 0), 0);
    const yieldPct = (totalDiv / quote.price) * 100;
    return `${yieldPct.toFixed(2)}%`;
  };

  const calculateIndicatedYield = (): string => {
    if (!quote || dividends.length === 0) return '-';
    const latestDiv = dividends[0]?.dividend || 0;
    const frequency = dividends[0]?.frequency || 'Quarterly';

    let annualized = latestDiv;
    if (frequency === 'Quarterly') annualized = latestDiv * 4;
    else if (frequency === 'Semi-Annual') annualized = latestDiv * 2;
    else if (frequency === 'Monthly') annualized = latestDiv * 12;

    const yieldPct = (annualized / quote.price) * 100;
    return `${yieldPct.toFixed(2)}%`;
  };

  const calculate1YrGrowth = (): string => {
    if (dividends.length < 5) return '-';
    const currentDiv = dividends[0]?.dividend || 0;
    // Find dividend from ~1 year ago (4 quarters back for quarterly)
    const priorDiv = dividends[4]?.dividend || 0;
    if (priorDiv === 0) return '-';
    const growth = ((currentDiv - priorDiv) / priorDiv) * 100;
    return `${growth.toFixed(2)}%`;
  };

  const calculate3YrGrowth = (): string => {
    if (dividends.length < 13) return '-';
    const currentDiv = dividends[0]?.dividend || 0;
    // Find dividend from ~3 years ago (12 quarters back)
    const priorDiv = dividends[12]?.dividend || 0;
    if (priorDiv === 0) return '-';
    // Calculate CAGR
    const cagr = (Math.pow(currentDiv / priorDiv, 1/3) - 1) * 100;
    return `${cagr.toFixed(2)}%`;
  };

  const getPaymentFrequency = (): string => {
    return dividends[0]?.frequency || '-';
  };

  // Calculate 12-month trailing dividend for each point
  const calculate12MonthTrailingDiv = (index: number): number => {
    let sum = 0;
    // Sum up 4 quarters (or appropriate number based on frequency)
    for (let i = index; i < Math.min(index + 4, dividends.length); i++) {
      sum += dividends[i]?.dividend || 0;
    }
    return sum;
  };

  // Format date as MM/DD/YY
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  };

  // SVG Chart dimensions
  const chartWidth = 400;
  const chartHeight = 160;
  const padding = { top: 25, right: 45, bottom: 25, left: 35 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Prepare chart data (reverse to show oldest first)
  const chartData = dividends.slice(0, 20).reverse().map((d, idx, arr) => {
    const reversedIdx = arr.length - 1 - idx;
    return {
      date: new Date(d.date),
      yield: (d.yield || 0) * (d.yield > 1 ? 1 : 100), // Normalize yield to percentage
      div12m: calculate12MonthTrailingDiv(reversedIdx),
    };
  });

  // Calculate scales
  const yieldValues = chartData.map(d => d.yield).filter(v => v > 0);
  const divValues = chartData.map(d => d.div12m).filter(v => v > 0);

  const yieldMin = yieldValues.length > 0 ? Math.min(...yieldValues) * 0.9 : 0;
  const yieldMax = yieldValues.length > 0 ? Math.max(...yieldValues) * 1.1 : 1;
  const divMin = divValues.length > 0 ? Math.min(...divValues) * 0.9 : 0;
  const divMax = divValues.length > 0 ? Math.max(...divValues) * 1.1 : 1;

  // Generate path for yield line
  const yieldPath = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1 || 1)) * plotWidth;
    const y = padding.top + plotHeight - ((d.yield - yieldMin) / (yieldMax - yieldMin || 1)) * plotHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate path for 12m div line
  const divPath = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1 || 1)) * plotWidth;
    const y = padding.top + plotHeight - ((d.div12m - divMin) / (divMax - divMin || 1)) * plotHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Get years for x-axis labels
  const years = [...new Set(chartData.map(d => d.date.getFullYear()))];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-primary text-text-primary">
      {/* Header with symbol search */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-border bg-bg-secondary">
        <div ref={containerRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Symbol"
            className="w-28 px-2 py-1 text-xs font-mono bg-bg-tertiary border border-border rounded
                       text-text-primary placeholder:text-text-secondary
                       focus:outline-none focus:border-accent-blue"
          />

          {/* Search dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute z-50 top-full left-0 mt-1 w-72 max-h-48 overflow-y-auto
                            bg-bg-secondary border border-border rounded shadow-lg">
              {searchLoading && (
                <div className="px-3 py-2 text-xs text-text-secondary">Loading...</div>
              )}
              {searchResults.slice(0, 10).map((result) => (
                <button
                  key={`${result.symbol}-${result.exchangeShortName}`}
                  onClick={() => handleSymbolSelect(result.symbol)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-bg-tertiary
                             flex items-center justify-between gap-2"
                >
                  <span className="font-mono text-text-primary font-medium">
                    {result.symbol}
                  </span>
                  <span className="text-text-secondary truncate flex-1">
                    {result.name}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {result.exchangeShortName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-text-secondary">
          {profile?.companyName || quote?.name || symbol}
        </span>
      </div>

      {/* Loading/Error states */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-text-secondary text-sm">
          Loading dividend data...
        </div>
      )}

      {error && (
        <div className="px-3 py-2 bg-accent-red/10 text-accent-red text-xs">
          Error: {error}
        </div>
      )}

      {/* Main content */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto">
          {/* Stats and Chart row */}
          <div className="flex border-b border-border">
            {/* Left: Stats */}
            <div className="border-r border-border p-3 min-w-[200px]">
              <table className="text-xs w-full">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">12 Month Yield</td>
                    <td className="py-1.5 text-right font-mono">{calculate12MonthYield()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">Indicated Yield</td>
                    <td className="py-1.5 text-right font-mono">{calculateIndicatedYield()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">1 Yr Dividend Growth</td>
                    <td className="py-1.5 text-right font-mono">{calculate1YrGrowth()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">3 Yr Dividend Growth</td>
                    <td className="py-1.5 text-right font-mono">{calculate3YrGrowth()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">Last Price</td>
                    <td className="py-1.5 text-right font-mono">{quote?.price?.toFixed(2) || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-text-secondary">Payment Frequency</td>
                    <td className="py-1.5 text-right font-mono">{getPaymentFrequency()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Chart */}
            <div className="flex-1 p-3">
              {chartData.length > 1 ? (
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                  {/* Legend */}
                  <g className="text-[9px]">
                    <line x1={padding.left} y1={12} x2={padding.left + 20} y2={12} stroke="#22c55e" strokeWidth={1.5} />
                    <text x={padding.left + 25} y={15} fill="#9ca3af" fontSize={9}>12mth Div</text>
                    <text x={padding.left + 80} y={15} fill="#22c55e" fontSize={9} fontFamily="monospace">
                      {divValues.length > 0 ? divValues[divValues.length - 1]?.toFixed(2) : '-'}
                    </text>

                    <rect x={padding.left + 110} y={8} width={8} height={8} fill="#ffffff" />
                    <text x={padding.left + 123} y={15} fill="#9ca3af" fontSize={9}>Yield</text>
                    <text x={padding.left + 155} y={15} fill="#ffffff" fontSize={9} fontFamily="monospace">
                      {yieldValues.length > 0 ? yieldValues[yieldValues.length - 1]?.toFixed(2) + '%' : '-'}
                    </text>
                  </g>

                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                    <line
                      key={i}
                      x1={padding.left}
                      y1={padding.top + pct * plotHeight}
                      x2={padding.left + plotWidth}
                      y2={padding.top + pct * plotHeight}
                      stroke="#374151"
                      strokeWidth={0.5}
                    />
                  ))}

                  {/* Y-axis labels (left - yield) */}
                  {[0, 0.5, 1].map((pct, i) => {
                    const val = yieldMax - pct * (yieldMax - yieldMin);
                    return (
                      <text
                        key={`yield-${i}`}
                        x={padding.left - 5}
                        y={padding.top + pct * plotHeight + 3}
                        fill="#9ca3af"
                        fontSize={8}
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val.toFixed(1)}
                      </text>
                    );
                  })}

                  {/* Y-axis labels (right - div) */}
                  {[0, 0.5, 1].map((pct, i) => {
                    const val = divMax - pct * (divMax - divMin);
                    return (
                      <text
                        key={`div-${i}`}
                        x={padding.left + plotWidth + 5}
                        y={padding.top + pct * plotHeight + 3}
                        fill="#22c55e"
                        fontSize={8}
                        textAnchor="start"
                        fontFamily="monospace"
                      >
                        {val.toFixed(2)}
                      </text>
                    );
                  })}

                  {/* X-axis labels (years) */}
                  {years.map((year) => {
                    const firstIdx = chartData.findIndex(d => d.date.getFullYear() === year);
                    if (firstIdx === -1) return null;
                    const x = padding.left + (firstIdx / (chartData.length - 1 || 1)) * plotWidth;
                    return (
                      <text
                        key={year}
                        x={x}
                        y={chartHeight - 5}
                        fill="#9ca3af"
                        fontSize={9}
                        textAnchor="middle"
                      >
                        {year}
                      </text>
                    );
                  })}

                  {/* 12m Div line (green) */}
                  {divPath && (
                    <path
                      d={divPath}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* Yield line (white) */}
                  {yieldPath && (
                    <path
                      d={yieldPath}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  )}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary text-xs">
                  No chart data available
                </div>
              )}
            </div>
          </div>

          {/* Dividend History Table */}
          <div className="p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium">Declaration</th>
                  <th className="text-left py-1.5 px-2 font-medium">Ex Date</th>
                  <th className="text-left py-1.5 px-2 font-medium">Record</th>
                  <th className="text-left py-1.5 px-2 font-medium">Payable</th>
                  <th className="text-center py-1.5 px-2 font-medium">Curr</th>
                  <th className="text-right py-1.5 px-2 font-medium">Amnt</th>
                  <th className="text-right py-1.5 px-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {dividends.map((div, idx) => (
                  <tr key={`${div.date}-${idx}`} className="border-b border-border/50 hover:bg-bg-secondary/30">
                    <td className="py-1.5 px-2 font-mono text-text-secondary">
                      {formatDate(div.declarationDate)}
                    </td>
                    <td className="py-1.5 px-2 font-mono">
                      {formatDate(div.date)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-text-secondary">
                      {formatDate(div.recordDate)}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-text-secondary">
                      {formatDate(div.paymentDate)}
                    </td>
                    <td className="py-1.5 px-2 text-center text-text-secondary">
                      {profile?.currency || 'USD'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">
                      {div.dividend?.toFixed(div.dividend < 0.1 ? 3 : 2) || '-'}
                    </td>
                    <td className="py-1.5 px-2 text-right text-text-secondary">
                      Cash Dividend
                    </td>
                  </tr>
                ))}
                {dividends.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-text-secondary">
                      No dividend history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
