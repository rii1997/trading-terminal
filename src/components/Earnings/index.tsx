import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { Quote, AnalystEstimate, EarningsReport, CompanyProfile } from '../../types/fmp';

interface EarningsProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

export function Earnings({ onSymbolChange, initialSymbol }: EarningsProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [estimates, setEstimates] = useState<AnalystEstimate[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<EarningsReport[]>([]);

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
        const [quoteData, profileData, estimatesData, earningsData] = await Promise.all([
          fmp.quote(symbol),
          fmp.profile(symbol),
          fmp.estimates(symbol, 'quarter', 20),
          fmp.earnings(symbol, 50),
        ]);

        setQuote(quoteData[0] || null);
        setProfile(profileData[0] || null);
        setEstimates(estimatesData || []);
        setEarningsHistory(earningsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Update header content when data changes
  useEffect(() => {
    if (onSymbolChange && quote) {
      const headerContent = (
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono font-medium text-text-primary">{symbol}</span>
          <span className="text-text-secondary">({profile?.companyName || quote.name})</span>
          <span className="text-text-secondary">Exchange: {profile?.exchangeShortName || quote.exchange}</span>
        </div>
      );
      onSymbolChange(symbol, headerContent);
    }
  }, [symbol, quote, profile, onSymbolChange]);

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

  // Format date as "Mon YYYY" for estimates
  const formatEstimateDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get period label from date
  const getPeriodLabel = (dateStr: string, isQuarter: boolean): string => {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(-2);
    if (!isQuarter) {
      return `FY${year}`;
    }
    const month = date.getMonth();
    // Rough quarter estimation based on month
    if (month >= 0 && month <= 2) return `Q1`;
    if (month >= 3 && month <= 5) return `Q2`;
    if (month >= 6 && month <= 8) return `Q3`;
    return `Q4`;
  };

  // Calculate Forward P/E
  const calculateFwdPE = (avgEps: number): string => {
    if (!quote || !avgEps || avgEps <= 0) return 'N/A';
    const fwdPE = quote.price / avgEps;
    return `${fwdPE.toFixed(1)}x`;
  };

  // Calculate EPS YoY (need prior year estimate)
  const calculateEpsYoY = (currentEstimate: AnalystEstimate, index: number): string => {
    // Find estimate from ~1 year ago (4 quarters back)
    const priorIndex = index + 4;
    if (priorIndex >= estimates.length) return 'N/A';

    const priorEstimate = estimates[priorIndex];
    if (!priorEstimate || !priorEstimate.epsAvg || priorEstimate.epsAvg === 0) return 'N/A';

    const yoy = ((currentEstimate.epsAvg - priorEstimate.epsAvg) / Math.abs(priorEstimate.epsAvg)) * 100;
    return `${yoy >= 0 ? '' : ''}${yoy.toFixed(1)}%`;
  };

  // Format earnings history period
  const formatHistoryPeriod = (report: EarningsReport): string => {
    const date = new Date(report.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = date.getMonth();
    let quarter = 'Q1';
    if (month >= 3 && month <= 5) quarter = 'Q2';
    else if (month >= 6 && month <= 8) quarter = 'Q3';
    else if (month >= 9 && month <= 11) quarter = 'Q4';
    return `${quarter} FY${year}`;
  };

  // Calculate difference percentage
  const calcDiffPercent = (actual: number, estimate: number): string => {
    if (!estimate || estimate === 0) return 'N/A';
    const diff = ((actual - estimate) / Math.abs(estimate)) * 100;
    return `${diff >= 0 ? '' : ''}${diff.toFixed(1)}%`;
  };

  // Get color class for difference
  const getDiffColorClass = (actual: number, estimate: number): string => {
    const diff = actual - estimate;
    if (diff > 0) return 'text-accent-green';
    if (diff < 0) return 'text-accent-red';
    return 'text-text-secondary';
  };

  // ===== Chart Setup =====
  const chartWidth = 650;
  const chartHeight = 180;
  const padding = { top: 30, right: 50, bottom: 30, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Prepare chart data - combine history (actuals) and estimates
  // History is most recent first, so reverse it
  const historyForChart = earningsHistory
    .filter(h => h.epsActual !== null)
    .slice(0, 16)
    .reverse()
    .map(h => ({
      date: new Date(h.date),
      actual: h.epsActual!,
      estimate: h.epsEstimated,
      isEstimate: false,
    }));

  // Estimates are future quarters (also most recent/nearest first)
  const estimatesForChart = estimates
    .slice(0, 8)
    .reverse()
    .map(e => ({
      date: new Date(e.date),
      actual: null as number | null,
      estimate: e.epsAvg,
      epsLow: e.epsLow,
      epsHigh: e.epsHigh,
      isEstimate: true,
    }));

  // Combine: history first, then estimates
  const chartData = [...historyForChart, ...estimatesForChart];

  // Calculate Y scale
  const allEpsValues = [
    ...historyForChart.map(d => d.actual),
    ...historyForChart.map(d => d.estimate).filter(v => v !== null) as number[],
    ...estimatesForChart.map(d => d.estimate),
    ...estimatesForChart.map(d => d.epsLow),
    ...estimatesForChart.map(d => d.epsHigh),
  ].filter(v => v !== null && v !== undefined) as number[];

  const epsMin = allEpsValues.length > 0 ? Math.min(...allEpsValues) * 0.9 : 0;
  const epsMax = allEpsValues.length > 0 ? Math.max(...allEpsValues) * 1.1 : 1;

  // Helper to get X position
  const getX = (index: number): number => {
    return padding.left + (index / Math.max(chartData.length - 1, 1)) * plotWidth;
  };

  // Helper to get Y position
  const getY = (value: number): number => {
    return padding.top + plotHeight - ((value - epsMin) / (epsMax - epsMin || 1)) * plotHeight;
  };

  // Generate paths
  const actualPath = historyForChart.map((d, i) => {
    const x = getX(i);
    const y = getY(d.actual);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Estimate line (average)
  const estimateStartIdx = historyForChart.length;
  const estimatePath = estimatesForChart.map((d, i) => {
    const x = getX(estimateStartIdx + i);
    const y = getY(d.estimate);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Estimate range band (low to high)
  const estimateBandPath = estimatesForChart.length > 0 ? (() => {
    const topPath = estimatesForChart.map((d, i) => {
      const x = getX(estimateStartIdx + i);
      const y = getY(d.epsHigh);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    const bottomPath = [...estimatesForChart].reverse().map((d, i) => {
      const x = getX(estimateStartIdx + (estimatesForChart.length - 1 - i));
      const y = getY(d.epsLow);
      return `L ${x} ${y}`;
    }).join(' ');
    return `${topPath} ${bottomPath} Z`;
  })() : '';

  // Connect actual to estimate with dashed line
  const connectorPath = historyForChart.length > 0 && estimatesForChart.length > 0
    ? `M ${getX(historyForChart.length - 1)} ${getY(historyForChart[historyForChart.length - 1].actual)} L ${getX(estimateStartIdx)} ${getY(estimatesForChart[0].estimate)}`
    : '';

  // X-axis year labels
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

        {/* Quote info */}
        {quote && (
          <div className="flex items-center gap-3 text-xs">
            <span className={`font-mono ${(quote.changesPercentage ?? 0) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              ${(quote.price ?? 0).toFixed(2)} {(quote.change ?? 0) >= 0 ? '+' : ''}{(quote.change ?? 0).toFixed(2)} {(quote.changesPercentage ?? 0) >= 0 ? '+' : ''}{(quote.changesPercentage ?? 0).toFixed(2)}%
            </span>
            <span className="text-text-secondary">
              Vol {((quote.volume ?? 0) / 1000).toFixed(1)}K
            </span>
          </div>
        )}
      </div>

      {/* Company info line */}
      {profile && (
        <div className="px-3 py-1.5 border-b border-border text-xs text-text-secondary bg-bg-secondary/50">
          Name: {profile.companyName} | Exchange: {profile.exchangeShortName} | Sector: {profile.sector}
        </div>
      )}

      {/* Loading/Error states */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-text-secondary text-sm">
          Loading earnings data...
        </div>
      )}

      {error && (
        <div className="px-3 py-2 bg-accent-red/10 text-accent-red text-xs">
          Error: {error}
        </div>
      )}

      {/* Scrollable content */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto">
          {/* EPS Chart */}
          {chartData.length > 1 && (
            <div className="px-3 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-text-primary mb-2 text-center">EPS History & Estimates</h3>
              <div className="flex justify-center">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                  {/* Legend - positioned at top right */}
                  <g>
                    <line x1={chartWidth - 280} y1={12} x2={chartWidth - 260} y2={12} stroke="#22c55e" strokeWidth={2} />
                    <text x={chartWidth - 255} y={15} fill="#9ca3af" fontSize={9}>Actual</text>

                    <line x1={chartWidth - 200} y1={12} x2={chartWidth - 180} y2={12} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,2" />
                    <text x={chartWidth - 175} y={15} fill="#9ca3af" fontSize={9}>Estimate</text>

                    <rect x={chartWidth - 110} y={6} width={14} height={10} fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeOpacity={0.3} strokeWidth={0.5} />
                    <text x={chartWidth - 92} y={15} fill="#9ca3af" fontSize={9}>Range</text>
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

                  {/* Zero line if applicable */}
                  {epsMin < 0 && epsMax > 0 && (
                    <line
                      x1={padding.left}
                      y1={getY(0)}
                      x2={padding.left + plotWidth}
                      y2={getY(0)}
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* Y-axis labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const val = epsMax - pct * (epsMax - epsMin);
                    return (
                      <text
                        key={i}
                        x={padding.left - 8}
                        y={padding.top + pct * plotHeight + 3}
                        fill="#9ca3af"
                        fontSize={9}
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val.toFixed(2)}
                      </text>
                    );
                  })}

                  {/* X-axis year labels - filter to avoid overlap */}
                  {years.filter((_, idx) => {
                    // Show every year if few years, otherwise space them out
                    if (years.length <= 4) return true;
                    // For more years, show every other year, always include first and last
                    if (idx === 0 || idx === years.length - 1) return true;
                    return idx % 2 === 0;
                  }).map((year) => {
                    // Find center of this year's data points for better positioning
                    const yearIndices = chartData
                      .map((d, i) => d.date.getFullYear() === year ? i : -1)
                      .filter(i => i !== -1);
                    if (yearIndices.length === 0) return null;
                    const centerIdx = yearIndices[Math.floor(yearIndices.length / 2)];
                    const x = getX(centerIdx);
                    return (
                      <text
                        key={year}
                        x={x}
                        y={chartHeight - 5}
                        fill="#9ca3af"
                        fontSize={10}
                        textAnchor="middle"
                      >
                        {year}
                      </text>
                    );
                  })}

                  {/* Divider line between actuals and estimates */}
                  {historyForChart.length > 0 && estimatesForChart.length > 0 && (
                    <line
                      x1={getX(historyForChart.length - 0.5)}
                      y1={padding.top}
                      x2={getX(historyForChart.length - 0.5)}
                      y2={padding.top + plotHeight}
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Estimate range band */}
                  {estimateBandPath && (
                    <path
                      d={estimateBandPath}
                      fill="#3b82f6"
                      fillOpacity={0.15}
                    />
                  )}

                  {/* Connector line */}
                  {connectorPath && (
                    <path
                      d={connectorPath}
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="4,2"
                    />
                  )}

                  {/* Actual EPS line */}
                  {actualPath && (
                    <path
                      d={actualPath}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  )}

                  {/* Actual EPS dots */}
                  {historyForChart.map((d, i) => (
                    <circle
                      key={`actual-${i}`}
                      cx={getX(i)}
                      cy={getY(d.actual)}
                      r={3}
                      fill="#22c55e"
                    />
                  ))}

                  {/* Estimate EPS line */}
                  {estimatePath && (
                    <path
                      d={estimatePath}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="6,3"
                    />
                  )}

                  {/* Estimate dots */}
                  {estimatesForChart.map((d, i) => (
                    <circle
                      key={`est-${i}`}
                      cx={getX(estimateStartIdx + i)}
                      cy={getY(d.estimate)}
                      r={3}
                      fill="#3b82f6"
                    />
                  ))}

                  {/* "Now" marker at divider */}
                  {historyForChart.length > 0 && estimatesForChart.length > 0 && (
                    <text
                      x={getX(historyForChart.length - 0.5)}
                      y={chartHeight - 5}
                      fill="#9ca3af"
                      fontSize={9}
                      textAnchor="middle"
                    >
                      Now
                    </text>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* Earnings Estimates Table */}
          <div className="px-3 py-3">
            <h3 className="text-sm font-medium text-text-primary mb-2 text-center">Earnings Estimates</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium">Period</th>
                  <th className="text-left py-1.5 px-2 font-medium">Date</th>
                  <th className="text-right py-1.5 px-2 font-medium">Analysts</th>
                  <th className="text-right py-1.5 px-2 font-medium">Low</th>
                  <th className="text-right py-1.5 px-2 font-medium">High</th>
                  <th className="text-right py-1.5 px-2 font-medium">Avg</th>
                  <th className="text-right py-1.5 px-2 font-medium">Fwd P/E</th>
                  <th className="text-right py-1.5 px-2 font-medium">EPS YoY</th>
                </tr>
              </thead>
              <tbody>
                {estimates.slice(0, 8).map((est, idx) => {
                  const yoyValue = calculateEpsYoY(est, idx);
                  const yoyNum = parseFloat(yoyValue);
                  const yoyColor = isNaN(yoyNum) ? 'text-text-secondary' : yoyNum >= 0 ? 'text-accent-green' : 'text-accent-red';

                  return (
                    <tr key={est.date} className="border-b border-border/50 hover:bg-bg-secondary/30">
                      <td className="py-1.5 px-2 font-mono text-text-secondary">
                        {getPeriodLabel(est.date, true)}
                      </td>
                      <td className="py-1.5 px-2 text-text-secondary">
                        {formatEstimateDate(est.date)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {est.numAnalystsEps || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {est.epsLow?.toFixed(2) || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {est.epsHigh?.toFixed(2) || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium">
                        {est.epsAvg?.toFixed(2) || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                        {calculateFwdPE(est.epsAvg)}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-mono ${yoyColor}`}>
                        {yoyValue}
                      </td>
                    </tr>
                  );
                })}
                {estimates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-text-secondary">
                      No estimates available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Earnings History Table */}
          <div className="px-3 py-3 border-t border-border">
            <h3 className="text-sm font-medium text-text-primary mb-2 text-center">Earnings History</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-secondary border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium">Period</th>
                  <th className="text-left py-1.5 px-2 font-medium">Filing Date</th>
                  <th className="text-right py-1.5 px-2 font-medium">Estimate</th>
                  <th className="text-right py-1.5 px-2 font-medium">Actual</th>
                  <th className="text-right py-1.5 px-2 font-medium">Difference</th>
                  <th className="text-right py-1.5 px-2 font-medium">Diff</th>
                </tr>
              </thead>
              <tbody>
                {earningsHistory.map((report) => {
                  const epsActual = report.epsActual ?? null;
                  const epsEst = report.epsEstimated ?? null;
                  const hasBothValues = epsActual !== null && epsEst !== null;
                  const diff = hasBothValues ? epsActual - epsEst : null;
                  const diffPct = hasBothValues ? calcDiffPercent(epsActual, epsEst) : 'N/A';
                  const colorClass = hasBothValues ? getDiffColorClass(epsActual, epsEst) : 'text-text-secondary';

                  return (
                    <tr key={report.date} className="border-b border-border/50 hover:bg-bg-secondary/30">
                      <td className="py-1.5 px-2 font-mono text-text-secondary">
                        {formatHistoryPeriod(report)}
                      </td>
                      <td className="py-1.5 px-2 text-text-secondary">
                        {report.date}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        {epsEst !== null ? epsEst.toFixed(2) : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium">
                        {epsActual !== null ? epsActual.toFixed(2) : '-'}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-mono ${colorClass}`}>
                        {diff !== null ? diff.toFixed(2) : '-'}
                      </td>
                      <td className={`py-1.5 px-2 text-right font-mono ${colorClass}`}>
                        {diffPct}
                      </td>
                    </tr>
                  );
                })}
                {earningsHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-text-secondary">
                      No earnings history available
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
