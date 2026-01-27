import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import { useTickerSearch } from '../../hooks/useTickerSearch';
import type { Quote, AnalystEstimate, EarningsReport } from '../../types/fmp';

interface EarningsMatrixProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

type MetricType = 'eps' | 'revenue';
type GrowthView = 'yoy' | 'pop';
type ChartView = 'values' | 'growth';

interface QuarterData {
  year: number;
  quarter: number; // 1-4
  date: string;
  eps: number | null;
  revenue: number | null;
  isEstimate: boolean;
}

export function EarningsMatrix({ onSymbolChange, initialSymbol }: EarningsMatrixProps) {
  const [symbol, setSymbol] = useState(initialSymbol || 'AAPL');
  const [query, setQuery] = useState(initialSymbol || 'AAPL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [metric, setMetric] = useState<MetricType>('eps');
  const [growthView, setGrowthView] = useState<GrowthView>('yoy');
  const [chartView, setChartView] = useState<ChartView>('values');
  const [yearOffset, setYearOffset] = useState(0); // For pagination

  // Data
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quarterData, setQuarterData] = useState<QuarterData[]>([]);

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
        const [quoteData, earningsData, estimatesData] = await Promise.all([
          fmp.quote(symbol),
          fmp.earnings(symbol, 40), // ~10 years of quarterly data
          fmp.estimates(symbol, 'quarter', 20), // Future estimates
        ]);

        setQuote(quoteData[0] || null);

        // Process and combine data
        const processed = processData(earningsData || [], estimatesData || []);
        setQuarterData(processed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Process earnings and estimates into unified quarter data
  const processData = (earnings: EarningsReport[], estimates: AnalystEstimate[]): QuarterData[] => {
    const data: QuarterData[] = [];

    // Process historical earnings
    for (const e of earnings) {
      const date = new Date(e.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      // Determine fiscal quarter based on month
      let quarter = 1;
      if (month >= 0 && month <= 2) quarter = 1;
      else if (month >= 3 && month <= 5) quarter = 2;
      else if (month >= 6 && month <= 8) quarter = 3;
      else quarter = 4;

      data.push({
        year,
        quarter,
        date: e.date,
        eps: e.epsActual,
        revenue: e.revenueActual ? e.revenueActual / 1e9 : null, // Convert to billions
        isEstimate: e.epsActual === null,
      });
    }

    // Process future estimates (only if not already in earnings)
    for (const e of estimates) {
      const date = new Date(e.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      let quarter = 1;
      if (month >= 0 && month <= 2) quarter = 1;
      else if (month >= 3 && month <= 5) quarter = 2;
      else if (month >= 6 && month <= 8) quarter = 3;
      else quarter = 4;

      // Check if we already have this quarter from earnings
      const exists = data.some(d => d.year === year && d.quarter === quarter && d.eps !== null);
      if (!exists) {
        data.push({
          year,
          quarter,
          date: e.date,
          eps: e.epsAvg,
          revenue: e.revenueAvg ? e.revenueAvg / 1e9 : null,
          isEstimate: true,
        });
      }
    }

    // Sort by date
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  };

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
    setYearOffset(0);
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

  // Get unique years from data
  const years = [...new Set(quarterData.map(d => d.year))].sort((a, b) => a - b);
  const displayYears = years.slice(Math.max(0, years.length - 6 + yearOffset), years.length + yearOffset);

  // Get value for a specific quarter/year
  const getValue = (year: number, quarter: number): { value: number | null; isEstimate: boolean } => {
    const item = quarterData.find(d => d.year === year && d.quarter === quarter);
    if (!item) return { value: null, isEstimate: false };
    return {
      value: metric === 'eps' ? item.eps : item.revenue,
      isEstimate: item.isEstimate,
    };
  };

  // Calculate annual value
  const getAnnualValue = (year: number): { value: number | null; isEstimate: boolean } => {
    const quarters = [1, 2, 3, 4].map(q => getValue(year, q));
    const values = quarters.map(q => q.value).filter(v => v !== null) as number[];
    if (values.length < 4) return { value: null, isEstimate: quarters.some(q => q.isEstimate) };
    const sum = values.reduce((a, b) => a + b, 0);
    return { value: sum, isEstimate: quarters.some(q => q.isEstimate) };
  };

  // Calculate YoY growth
  const getYoYGrowth = (year: number, quarter: number | 'annual'): number | null => {
    const current = quarter === 'annual' ? getAnnualValue(year) : getValue(year, quarter);
    const prior = quarter === 'annual' ? getAnnualValue(year - 1) : getValue(year - 1, quarter);

    if (current.value === null || prior.value === null || prior.value === 0) return null;
    return ((current.value - prior.value) / Math.abs(prior.value)) * 100;
  };

  // Calculate PoP (Quarter over Quarter) growth
  const getPoPGrowth = (year: number, quarter: number | 'annual'): number | null => {
    if (quarter === 'annual') return getYoYGrowth(year, 'annual'); // Annual uses YoY

    const current = getValue(year, quarter);
    let prior: { value: number | null; isEstimate: boolean };

    if (quarter === 1) {
      prior = getValue(year - 1, 4);
    } else {
      prior = getValue(year, quarter - 1);
    }

    if (current.value === null || prior.value === null || prior.value === 0) return null;
    return ((current.value - prior.value) / Math.abs(prior.value)) * 100;
  };

  // Format value for display
  const formatValue = (value: number | null): string => {
    if (value === null) return '--';
    if (metric === 'eps') {
      return value.toFixed(2);
    } else {
      return value.toFixed(1) + 'B';
    }
  };

  // Format growth percentage
  const formatGrowth = (value: number | null): string => {
    if (value === null) return '--';
    return `${value >= 0 ? '' : ''}${value.toFixed(1)}%`;
  };

  // Get color for growth
  const getGrowthColor = (value: number | null): string => {
    if (value === null) return 'text-text-secondary';
    if (value > 0) return 'text-accent-green';
    if (value < 0) return 'text-accent-red';
    return 'text-text-secondary';
  };

  // Quarter labels
  const quarterLabels = ['Q1 Dec', 'Q2 Mar', 'Q3 Jun', 'Q4 Sep'];

  // Calculate forward valuations
  const calculateForwardPE = (periods: 'last4q' | 'next4q' | number): string => {
    if (!quote) return '--';

    let eps = 0;

    if (periods === 'last4q') {
      // Sum last 4 quarters with actual data
      const recentQuarters = quarterData
        .filter(d => !d.isEstimate && d.eps !== null)
        .slice(-4);
      eps = recentQuarters.reduce((sum, q) => sum + (q.eps || 0), 0);
    } else if (periods === 'next4q') {
      // Sum next 4 quarters (estimates)
      const futureQuarters = quarterData
        .filter(d => d.isEstimate && d.eps !== null)
        .slice(0, 4);
      eps = futureQuarters.reduce((sum, q) => sum + (q.eps || 0), 0);
    } else {
      // Specific fiscal year
      const annual = getAnnualValue(periods);
      eps = annual.value || 0;
    }

    if (eps <= 0) return '--';
    return `${(quote.price / eps).toFixed(1)}x`;
  };

  const calculateForwardPS = (periods: 'last4q' | 'next4q' | number): string => {
    if (!quote) return '--';

    let revenue = 0;

    if (periods === 'last4q') {
      const recentQuarters = quarterData
        .filter(d => !d.isEstimate && d.revenue !== null)
        .slice(-4);
      revenue = recentQuarters.reduce((sum, q) => sum + (q.revenue || 0), 0);
    } else if (periods === 'next4q') {
      const futureQuarters = quarterData
        .filter(d => d.isEstimate && d.revenue !== null)
        .slice(0, 4);
      revenue = futureQuarters.reduce((sum, q) => sum + (q.revenue || 0), 0);
    } else {
      const quarters = [1, 2, 3, 4].map(q => {
        const item = quarterData.find(d => d.year === periods && d.quarter === q);
        return item?.revenue || 0;
      });
      revenue = quarters.reduce((a, b) => a + b, 0);
    }

    if (revenue <= 0) return '--';
    const marketCap = (quote.marketCap || 0) / 1e9; // Convert to billions
    return `${(marketCap / revenue).toFixed(1)}x`;
  };

  // Chart data preparation
  const chartYears = years.slice(-10);
  const chartWidth = 300;
  const chartHeight = 120;
  const barChartHeight = 80;
  const padding = { top: 15, right: 10, bottom: 20, left: 30 };

  // Get annual values for chart
  const annualChartData = chartYears.map(year => ({
    year,
    ...getAnnualValue(year),
  })).filter(d => d.value !== null);

  // Get quarterly values for bar chart
  const quarterlyChartData = quarterData.filter(d =>
    chartYears.includes(d.year) &&
    (metric === 'eps' ? d.eps !== null : d.revenue !== null)
  );

  const annualValues = annualChartData.map(d => d.value!);
  const annualMin = annualValues.length > 0 ? Math.min(...annualValues) * 0.9 : 0;
  const annualMax = annualValues.length > 0 ? Math.max(...annualValues) * 1.1 : 1;

  const quarterlyValues = quarterlyChartData.map(d => metric === 'eps' ? d.eps! : d.revenue!);
  const qMin = quarterlyValues.length > 0 ? Math.min(0, Math.min(...quarterlyValues)) : 0;
  const qMax = quarterlyValues.length > 0 ? Math.max(...quarterlyValues) * 1.1 : 1;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-3 py-2 border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-3">
          {/* Symbol search */}
          <div ref={containerRef} className="relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Symbol"
              className="w-24 px-2 py-1 text-xs font-mono bg-bg-tertiary border border-border rounded
                         text-text-primary placeholder:text-text-secondary
                         focus:outline-none focus:border-accent-blue"
            />
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto
                              bg-bg-secondary border border-border rounded shadow-lg">
                {searchLoading && (
                  <div className="px-3 py-2 text-xs text-text-secondary">Loading...</div>
                )}
                {searchResults.slice(0, 8).map((result) => (
                  <button
                    key={`${result.symbol}-${result.exchangeShortName}`}
                    onClick={() => handleSymbolSelect(result.symbol)}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-bg-tertiary flex items-center gap-2"
                  >
                    <span className="font-mono font-medium">{result.symbol}</span>
                    <span className="text-text-secondary truncate">{result.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metric selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricType)}
            className="px-2 py-1 text-xs bg-bg-tertiary border border-border rounded text-text-primary"
          >
            <option value="eps">EPS (GAAP)</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>

        {/* Growth view toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setGrowthView('yoy')}
            className={`px-3 py-1 text-xs rounded ${
              growthView === 'yoy'
                ? 'bg-accent-green text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            YoY % Growth
          </button>
          <button
            onClick={() => setGrowthView('pop')}
            className={`px-3 py-1 text-xs rounded ${
              growthView === 'pop'
                ? 'bg-accent-green text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            PoP % Growth
          </button>
        </div>
      </div>

      {/* Loading/Error */}
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

      {/* Main content */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto p-3">
          {/* Tables row */}
          <div className="flex gap-4 mb-4">
            {/* Values Table */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">
                  {metric === 'eps' ? 'EPS ($)' : 'Revenue ($B)'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setYearOffset(Math.max(yearOffset - 1, -(years.length - 6)))}
                    disabled={yearOffset <= -(years.length - 6)}
                    className="px-2 py-0.5 text-xs bg-bg-tertiary border border-border rounded disabled:opacity-30"
                  >
                    &larr; Prev
                  </button>
                  <button
                    onClick={() => setYearOffset(Math.min(yearOffset + 1, 0))}
                    disabled={yearOffset >= 0}
                    className="px-2 py-0.5 text-xs bg-bg-tertiary border border-border rounded disabled:opacity-30"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
              <table className="w-full text-xs border border-border">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="py-1.5 px-2 text-left border-r border-border font-medium"></th>
                    {displayYears.map(year => (
                      <th key={year} className="py-1.5 px-2 text-center border-r border-border font-medium last:border-r-0">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quarterLabels.map((label, qIdx) => (
                    <tr key={qIdx} className="border-t border-border">
                      <td className="py-1.5 px-2 border-r border-border text-text-secondary">{label}</td>
                      {displayYears.map(year => {
                        const { value, isEstimate } = getValue(year, qIdx + 1);
                        return (
                          <td
                            key={year}
                            className={`py-1.5 px-2 text-center border-r border-border last:border-r-0 font-mono ${
                              isEstimate ? 'text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {formatValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-bg-secondary/50">
                    <td className="py-1.5 px-2 border-r border-border font-medium">Annual</td>
                    {displayYears.map(year => {
                      const { value, isEstimate } = getAnnualValue(year);
                      return (
                        <td
                          key={year}
                          className={`py-1.5 px-2 text-center border-r border-border last:border-r-0 font-mono font-medium ${
                            isEstimate ? 'text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {formatValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Growth Table */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">
                  {growthView === 'yoy' ? 'YoY % Growth' : 'PoP % Growth'}
                </span>
                <div className="flex gap-1 opacity-0 pointer-events-none">
                  <button className="px-2 py-0.5 text-xs">&larr; Prev</button>
                  <button className="px-2 py-0.5 text-xs">Next &rarr;</button>
                </div>
              </div>
              <table className="w-full text-xs border border-border">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="py-1.5 px-2 text-left border-r border-border font-medium"></th>
                    {displayYears.map(year => (
                      <th key={year} className="py-1.5 px-2 text-center border-r border-border font-medium last:border-r-0">
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quarterLabels.map((label, qIdx) => (
                    <tr key={qIdx} className="border-t border-border">
                      <td className="py-1.5 px-2 border-r border-border text-text-secondary">{label}</td>
                      {displayYears.map(year => {
                        const growth = growthView === 'yoy'
                          ? getYoYGrowth(year, qIdx + 1)
                          : getPoPGrowth(year, qIdx + 1);
                        return (
                          <td
                            key={year}
                            className={`py-1.5 px-2 text-center border-r border-border last:border-r-0 font-mono ${getGrowthColor(growth)}`}
                          >
                            {formatGrowth(growth)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-bg-secondary/50">
                    <td className="py-1.5 px-2 border-r border-border font-medium">Annual</td>
                    {displayYears.map(year => {
                      const growth = getYoYGrowth(year, 'annual');
                      return (
                        <td
                          key={year}
                          className={`py-1.5 px-2 text-center border-r border-border last:border-r-0 font-mono font-medium ${getGrowthColor(growth)}`}
                        >
                          {formatGrowth(growth)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts and Valuation row */}
          <div className="flex gap-4">
            {/* Charts */}
            <div className="flex-1 border border-border rounded p-3">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setChartView('values')}
                  className={`px-3 py-1 text-xs rounded ${
                    chartView === 'values'
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  Values Chart
                </button>
                <button
                  onClick={() => setChartView('growth')}
                  className={`px-3 py-1 text-xs rounded ${
                    chartView === 'growth'
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  Growth Chart
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-accent-green/60 rounded-sm" />
                    Historical
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-500/40 rounded-sm" />
                    Estimates
                  </span>
                </div>
              </div>

              {/* Yearly line chart */}
              <div className="mb-2">
                <span className="text-[10px] text-text-secondary">Yearly</span>
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                  {/* Grid */}
                  {[0, 0.5, 1].map((pct, i) => (
                    <line
                      key={i}
                      x1={padding.left}
                      y1={padding.top + pct * (chartHeight - padding.top - padding.bottom)}
                      x2={chartWidth - padding.right}
                      y2={padding.top + pct * (chartHeight - padding.top - padding.bottom)}
                      stroke="#374151"
                      strokeWidth={0.5}
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Y-axis labels */}
                  {[0, 0.5, 1].map((pct, i) => {
                    const val = annualMax - pct * (annualMax - annualMin);
                    return (
                      <text
                        key={i}
                        x={padding.left - 5}
                        y={padding.top + pct * (chartHeight - padding.top - padding.bottom) + 3}
                        fill="#9ca3af"
                        fontSize={8}
                        textAnchor="end"
                      >
                        {val.toFixed(1)}
                      </text>
                    );
                  })}

                  {/* Line */}
                  {annualChartData.length > 1 && (
                    <path
                      d={annualChartData.map((d, i) => {
                        const x = padding.left + (i / (annualChartData.length - 1)) * (chartWidth - padding.left - padding.right);
                        const y = padding.top + (1 - (d.value! - annualMin) / (annualMax - annualMin)) * (chartHeight - padding.top - padding.bottom);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* Dots */}
                  {annualChartData.map((d, i) => {
                    const x = padding.left + (i / Math.max(annualChartData.length - 1, 1)) * (chartWidth - padding.left - padding.right);
                    const y = padding.top + (1 - (d.value! - annualMin) / (annualMax - annualMin)) * (chartHeight - padding.top - padding.bottom);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={3}
                        fill={d.isEstimate ? '#6b7280' : '#22c55e'}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Quarterly bar chart */}
              <div>
                <span className="text-[10px] text-text-secondary">Quarterly</span>
                <svg width="100%" height={barChartHeight} viewBox={`0 0 ${chartWidth} ${barChartHeight}`} preserveAspectRatio="xMidYMid meet">
                  {/* Bars */}
                  {quarterlyChartData.map((d, i) => {
                    const barWidth = (chartWidth - padding.left - padding.right) / quarterlyChartData.length * 0.7;
                    const x = padding.left + (i / quarterlyChartData.length) * (chartWidth - padding.left - padding.right) + barWidth * 0.15;
                    const value = metric === 'eps' ? d.eps! : d.revenue!;
                    const barHeight = ((value - qMin) / (qMax - qMin)) * (barChartHeight - padding.bottom - 5);
                    const y = barChartHeight - padding.bottom - barHeight;

                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={d.isEstimate ? '#6b7280' : '#22c55e'}
                        fillOpacity={0.7}
                      />
                    );
                  })}

                  {/* X-axis years */}
                  {chartYears.filter((_, i) => i % 2 === 0).map((year) => {
                    const yearData = quarterlyChartData.filter(d => d.year === year);
                    if (yearData.length === 0) return null;
                    const firstIdx = quarterlyChartData.indexOf(yearData[0]);
                    const x = padding.left + (firstIdx / quarterlyChartData.length) * (chartWidth - padding.left - padding.right);
                    return (
                      <text
                        key={year}
                        x={x + 10}
                        y={barChartHeight - 5}
                        fill="#9ca3af"
                        fontSize={8}
                      >
                        {year}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Forward Valuation Table */}
            <div className="w-64 border border-border rounded p-3">
              <h4 className="text-xs font-medium mb-2 text-text-secondary">Forward Valuation</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1 text-left"></th>
                    <th className="py-1 text-right text-text-secondary">Last 4Q</th>
                    <th className="py-1 text-right text-text-secondary">Next 4Q</th>
                    <th className="py-1 text-right text-text-secondary">FY {displayYears[displayYears.length - 2] || ''}</th>
                    <th className="py-1 text-right text-text-secondary">FY {displayYears[displayYears.length - 1] || ''}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-text-secondary">P/E</td>
                    <td className="py-1.5 text-right font-mono text-accent-green">{calculateForwardPE('last4q')}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPE('next4q')}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPE(displayYears[displayYears.length - 2] || 0)}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPE(displayYears[displayYears.length - 1] || 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-text-secondary">P/S</td>
                    <td className="py-1.5 text-right font-mono text-accent-green">{calculateForwardPS('last4q')}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPS('next4q')}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPS(displayYears[displayYears.length - 2] || 0)}</td>
                    <td className="py-1.5 text-right font-mono">{calculateForwardPS(displayYears[displayYears.length - 1] || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
