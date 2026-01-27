import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { Ratios as RatiosType } from '../../types/fmp';

// Available ratio metrics
type RatioMetric =
  | 'priceToEarningsRatio'
  | 'priceToBookRatio'
  | 'priceToSalesRatio'
  | 'returnOnEquity'
  | 'returnOnAssets'
  | 'returnOnCapitalEmployed'
  | 'grossProfitMargin'
  | 'netProfitMargin'
  | 'operatingProfitMargin'
  | 'currentRatio'
  | 'quickRatio'
  | 'cashRatio'
  | 'debtEquityRatio'
  | 'debtRatio'
  | 'interestCoverage'
  | 'assetTurnover'
  | 'inventoryTurnover'
  | 'receivablesTurnover'
  | 'payoutRatio'
  | 'dividendPayoutRatio';

interface MetricConfig {
  key: RatioMetric;
  label: string;
  shortLabel: string;
  format: 'ratio' | 'percent';
  color: string;
  category: 'valuation' | 'profitability' | 'liquidity' | 'leverage' | 'efficiency' | 'dividend';
}

const RATIO_METRICS: MetricConfig[] = [
  // Valuation
  { key: 'priceToEarningsRatio', label: 'Price to Earnings (P/E)', shortLabel: 'P/E', format: 'ratio', color: '#ff6b6b', category: 'valuation' },
  { key: 'priceToBookRatio', label: 'Price to Book (P/B)', shortLabel: 'P/B', format: 'ratio', color: '#4dabf7', category: 'valuation' },
  { key: 'priceToSalesRatio', label: 'Price to Sales (P/S)', shortLabel: 'P/S', format: 'ratio', color: '#51cf66', category: 'valuation' },
  // Profitability
  { key: 'returnOnEquity', label: 'Return on Equity (ROE)', shortLabel: 'ROE', format: 'percent', color: '#fcc419', category: 'profitability' },
  { key: 'returnOnAssets', label: 'Return on Assets (ROA)', shortLabel: 'ROA', format: 'percent', color: '#ff922b', category: 'profitability' },
  { key: 'returnOnCapitalEmployed', label: 'Return on Capital (ROCE)', shortLabel: 'ROCE', format: 'percent', color: '#e599f7', category: 'profitability' },
  { key: 'grossProfitMargin', label: 'Gross Profit Margin', shortLabel: 'Gross Margin', format: 'percent', color: '#20c997', category: 'profitability' },
  { key: 'operatingProfitMargin', label: 'Operating Profit Margin', shortLabel: 'Op Margin', format: 'percent', color: '#38d9a9', category: 'profitability' },
  { key: 'netProfitMargin', label: 'Net Profit Margin', shortLabel: 'Net Margin', format: 'percent', color: '#69db7c', category: 'profitability' },
  // Liquidity
  { key: 'currentRatio', label: 'Current Ratio', shortLabel: 'Current', format: 'ratio', color: '#74c0fc', category: 'liquidity' },
  { key: 'quickRatio', label: 'Quick Ratio', shortLabel: 'Quick', format: 'ratio', color: '#a5d8ff', category: 'liquidity' },
  { key: 'cashRatio', label: 'Cash Ratio', shortLabel: 'Cash', format: 'ratio', color: '#d0ebff', category: 'liquidity' },
  // Leverage
  { key: 'debtEquityRatio', label: 'Debt to Equity', shortLabel: 'D/E', format: 'ratio', color: '#ffa8a8', category: 'leverage' },
  { key: 'debtRatio', label: 'Debt Ratio', shortLabel: 'Debt Ratio', format: 'ratio', color: '#ffc9c9', category: 'leverage' },
  { key: 'interestCoverage', label: 'Interest Coverage', shortLabel: 'Int Coverage', format: 'ratio', color: '#ffe3e3', category: 'leverage' },
  // Efficiency
  { key: 'assetTurnover', label: 'Asset Turnover', shortLabel: 'Asset Turn', format: 'ratio', color: '#b197fc', category: 'efficiency' },
  { key: 'inventoryTurnover', label: 'Inventory Turnover', shortLabel: 'Inv Turn', format: 'ratio', color: '#d0bfff', category: 'efficiency' },
  { key: 'receivablesTurnover', label: 'Receivables Turnover', shortLabel: 'Recv Turn', format: 'ratio', color: '#e5dbff', category: 'efficiency' },
  // Dividend
  { key: 'payoutRatio', label: 'Payout Ratio', shortLabel: 'Payout', format: 'percent', color: '#ffd43b', category: 'dividend' },
  { key: 'dividendPayoutRatio', label: 'Dividend Payout Ratio', shortLabel: 'Div Payout', format: 'percent', color: '#ffe066', category: 'dividend' },
];

const CATEGORIES = [
  { key: 'valuation', label: 'Valuation' },
  { key: 'profitability', label: 'Profitability' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'leverage', label: 'Leverage' },
  { key: 'efficiency', label: 'Efficiency' },
  { key: 'dividend', label: 'Dividend' },
];

interface RatiosProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbol?: string;
}

interface PriceData {
  date: string;
  price: number;
}

const COLORS = {
  price: '#51cf66',
  grid: '#333333',
  text: '#888888',
  bg: '#1a1a1a',
};

export function Ratios({
  onSymbolChange,
  initialSymbol = 'AAPL',
}: RatiosProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [inputValue, setInputValue] = useState(initialSymbol);
  const [loading, setLoading] = useState(false);
  const [loadingRatios, setLoadingRatios] = useState(false);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [ratiosData, setRatiosData] = useState<RatiosType[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<RatioMetric>>(
    new Set(['priceToEarningsRatio', 'priceToBookRatio', 'returnOnEquity', 'grossProfitMargin'])
  );
  const [showMinMax, setShowMinMax] = useState(true);
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const [ratioCrosshairIndex, setRatioCrosshairIndex] = useState<number | null>(null);

  // Chart dimensions
  const chartWidth = 800;
  const priceChartHeight = 160;
  const ratioChartHeight = 120;
  const padding = 50;
  const rightPadding = 60;

  // Fetch 5 years of price data
  const fetchPriceData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - 5);

      const hist = await fmp.historicalPrice(
        symbol,
        from.toISOString().split('T')[0],
        to.toISOString().split('T')[0]
      );

      const prices = hist
        .map(d => ({ date: d.date, price: d.close }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setPriceData(prices);
    } catch (err) {
      console.error('[Ratios] Error fetching price data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Fetch historical ratios
  const fetchRatios = useCallback(async () => {
    if (!symbol) return;

    setLoadingRatios(true);
    try {
      const ratios = await fmp.ratios(symbol, 10);

      console.log('[Ratios] Raw ratios response:', {
        symbol,
        count: ratios?.length ?? 0,
        sample: ratios?.[0],
      });

      if (ratios && ratios.length > 0) {
        const sorted = ratios.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRatiosData(sorted);
      }
    } catch (err) {
      console.error('[Ratios] Error fetching ratios:', err);
    } finally {
      setLoadingRatios(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchPriceData();
    fetchRatios();
  }, [fetchPriceData, fetchRatios]);

  useEffect(() => {
    if (onSymbolChange) {
      const header = (
        <span className="font-mono text-accent-blue">{symbol}</span>
      );
      onSymbolChange(symbol, header);
    }
  }, [onSymbolChange, symbol]);

  // Extract year from date
  const getYear = (r: RatiosType): string => {
    if (r.calendarYear) return r.calendarYear;
    if (r.date) return r.date.substring(0, 4);
    return 'unknown';
  };

  // Handle symbol submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSymbol(inputValue.trim().toUpperCase());
    }
  };

  // Toggle metric selection
  const toggleMetric = (metric: RatioMetric) => {
    setSelectedMetrics(prev => {
      const next = new Set(prev);
      if (next.has(metric)) {
        next.delete(metric);
      } else {
        next.add(metric);
      }
      return next;
    });
  };

  // Format value based on type
  const formatValue = (val: number | null | undefined, format: 'ratio' | 'percent'): string => {
    if (val == null || !isFinite(val)) return '--';
    if (format === 'percent') {
      return `${(val * 100).toFixed(1)}%`;
    }
    return val.toFixed(2);
  };

  // Render price chart
  const renderPriceChart = () => {
    if (priceData.length < 2) return null;

    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const scaleY = (val: number) => {
      const range = maxPrice - minPrice || 1;
      return priceChartHeight - 25 - ((val - minPrice) / range) * (priceChartHeight - 45);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (priceData.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const areaPath = `
      M ${scaleX(0)} ${priceChartHeight - 25}
      ${priceData.map((d, i) => `L ${scaleX(i)} ${scaleY(d.price)}`).join(' ')}
      L ${scaleX(priceData.length - 1)} ${priceChartHeight - 25}
      Z
    `;

    const linePath = priceData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.price)}`
    ).join(' ');

    // Find min/max
    const minIdx = prices.reduce((minI, p, i, arr) => p < arr[minI] ? i : minI, 0);
    const maxIdx = prices.reduce((maxI, p, i, arr) => p > arr[maxI] ? i : maxI, 0);

    // Current value
    const currentIdx = crosshairIndex ?? priceData.length - 1;
    const currentPrice = priceData[currentIdx]?.price;
    const currentDate = priceData[currentIdx]?.date;

    return (
      <svg
        width={chartWidth}
        height={priceChartHeight}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - padding;
          const chartAreaWidth = chartWidth - padding - rightPadding;
          if (x >= 0 && x <= chartAreaWidth) {
            const index = Math.round((x / chartAreaWidth) * (priceData.length - 1));
            setCrosshairIndex(Math.max(0, Math.min(index, priceData.length - 1)));
          }
        }}
        onMouseLeave={() => setCrosshairIndex(null)}
        className="cursor-crosshair"
      >
        <rect width={chartWidth} height={priceChartHeight} fill={COLORS.bg} />

        {/* Grid */}
        {[0, 1, 2, 3].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((priceChartHeight - 45) / 3)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((priceChartHeight - 45) / 3)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {[0, 1, 2, 3].map(i => {
          const val = maxPrice - (i / 3) * (maxPrice - minPrice);
          return (
            <text key={i} x={chartWidth - rightPadding + 5} y={24 + i * ((priceChartHeight - 45) / 3)} fill={COLORS.text} fontSize={9}>
              ${val.toFixed(0)}
            </text>
          );
        })}

        {/* Axis label */}
        <text x={8} y={priceChartHeight / 2} fill={COLORS.price} fontSize={9} transform={`rotate(-90, 12, ${priceChartHeight / 2})`} textAnchor="middle">
          Price ($)
        </text>

        {/* Area and line */}
        <path d={areaPath} fill="rgba(81, 207, 102, 0.2)" />
        <path d={linePath} fill="none" stroke={COLORS.price} strokeWidth={1.5} />

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            <polygon
              points={`${scaleX(minIdx)},${scaleY(prices[minIdx]) + 5} ${scaleX(minIdx) - 5},${scaleY(prices[minIdx]) + 12} ${scaleX(minIdx) + 5},${scaleY(prices[minIdx]) + 12}`}
              fill={COLORS.price}
            />
            <polygon
              points={`${scaleX(maxIdx)},${scaleY(prices[maxIdx]) - 5} ${scaleX(maxIdx) - 5},${scaleY(prices[maxIdx]) - 12} ${scaleX(maxIdx) + 5},${scaleY(prices[maxIdx]) - 12}`}
              fill={COLORS.price}
            />
          </>
        )}

        {/* Crosshair */}
        {crosshairIndex !== null && (
          <line
            x1={scaleX(crosshairIndex)}
            y1={20}
            x2={scaleX(crosshairIndex)}
            y2={priceChartHeight - 25}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {/* Legend */}
        <rect x={padding + 5} y={5} width={200} height={18} fill="rgba(0,0,0,0.7)" rx={3} />
        <text x={padding + 10} y={17} fill={COLORS.price} fontSize={10}>
          {symbol} Price: ${currentPrice?.toFixed(2) ?? '--'} ({currentDate ?? '--'})
        </text>

        {/* X axis (dates) */}
        {renderDateAxis(priceData, priceChartHeight)}
      </svg>
    );
  };

  // Render a single ratio chart
  const renderRatioChart = (metric: MetricConfig) => {
    if (ratiosData.length < 2) return null;

    const values = ratiosData.map(r => r[metric.key] as number).filter(v => v != null && isFinite(v));
    if (values.length < 2) {
      return (
        <div key={metric.key} className="flex items-center justify-center h-20 bg-[#1a1a1a] border border-border rounded text-text-secondary text-xs">
          No data for {metric.label}
        </div>
      );
    }

    const validData = ratiosData.filter(r => {
      const v = r[metric.key] as number;
      return v != null && isFinite(v);
    });

    const chartValues = validData.map(r => r[metric.key] as number);
    const minVal = Math.min(...chartValues);
    const maxVal = Math.max(...chartValues);

    const scaleY = (val: number) => {
      const range = maxVal - minVal || 1;
      return ratioChartHeight - 25 - ((val - minVal) / range) * (ratioChartHeight - 45);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (validData.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const areaPath = `
      M ${scaleX(0)} ${ratioChartHeight - 25}
      ${validData.map((r, i) => `L ${scaleX(i)} ${scaleY(r[metric.key] as number)}`).join(' ')}
      L ${scaleX(validData.length - 1)} ${ratioChartHeight - 25}
      Z
    `;

    const linePath = validData.map((r, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r[metric.key] as number)}`
    ).join(' ');

    // Min/max indices
    const minIdx = chartValues.reduce((minI, v, i, arr) => v < arr[minI] ? i : minI, 0);
    const maxIdx = chartValues.reduce((maxI, v, i, arr) => v > arr[maxI] ? i : maxI, 0);

    // Current value
    const currentIdx = ratioCrosshairIndex !== null && ratioCrosshairIndex < validData.length
      ? ratioCrosshairIndex
      : validData.length - 1;
    const currentValue = validData[currentIdx]?.[metric.key] as number;
    const currentYear = getYear(validData[currentIdx]);

    return (
      <svg
        key={metric.key}
        width={chartWidth}
        height={ratioChartHeight}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - padding;
          const chartAreaWidth = chartWidth - padding - rightPadding;
          if (x >= 0 && x <= chartAreaWidth) {
            const index = Math.round((x / chartAreaWidth) * (validData.length - 1));
            setRatioCrosshairIndex(Math.max(0, Math.min(index, validData.length - 1)));
          }
        }}
        onMouseLeave={() => setRatioCrosshairIndex(null)}
        className="cursor-crosshair"
      >
        <rect width={chartWidth} height={ratioChartHeight} fill={COLORS.bg} />

        {/* Grid */}
        {[0, 1, 2].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((ratioChartHeight - 45) / 2)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((ratioChartHeight - 45) / 2)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {[0, 1, 2].map(i => {
          const val = maxVal - (i / 2) * (maxVal - minVal);
          return (
            <text key={i} x={chartWidth - rightPadding + 5} y={24 + i * ((ratioChartHeight - 45) / 2)} fill={COLORS.text} fontSize={8}>
              {formatValue(val, metric.format)}
            </text>
          );
        })}

        {/* Axis label */}
        <text x={8} y={ratioChartHeight / 2} fill={metric.color} fontSize={8} transform={`rotate(-90, 12, ${ratioChartHeight / 2})`} textAnchor="middle">
          {metric.shortLabel}
        </text>

        {/* Area and line */}
        <path d={areaPath} fill={`${metric.color}33`} />
        <path d={linePath} fill="none" stroke={metric.color} strokeWidth={1.5} />

        {/* Data points */}
        {validData.map((r, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(r[metric.key] as number)}
            r={3}
            fill={metric.color}
          />
        ))}

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            <polygon
              points={`${scaleX(minIdx)},${scaleY(chartValues[minIdx]) + 4} ${scaleX(minIdx) - 4},${scaleY(chartValues[minIdx]) + 10} ${scaleX(minIdx) + 4},${scaleY(chartValues[minIdx]) + 10}`}
              fill={metric.color}
            />
            <polygon
              points={`${scaleX(maxIdx)},${scaleY(chartValues[maxIdx]) - 4} ${scaleX(maxIdx) - 4},${scaleY(chartValues[maxIdx]) - 10} ${scaleX(maxIdx) + 4},${scaleY(chartValues[maxIdx]) - 10}`}
              fill={metric.color}
            />
          </>
        )}

        {/* Crosshair */}
        {ratioCrosshairIndex !== null && ratioCrosshairIndex < validData.length && (
          <line
            x1={scaleX(ratioCrosshairIndex)}
            y1={20}
            x2={scaleX(ratioCrosshairIndex)}
            y2={ratioChartHeight - 25}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {/* Legend */}
        <rect x={padding + 5} y={3} width={180} height={16} fill="rgba(0,0,0,0.7)" rx={3} />
        <text x={padding + 10} y={14} fill={metric.color} fontSize={9}>
          {metric.shortLabel}: {formatValue(currentValue, metric.format)} ({currentYear})
        </text>

        {/* X axis (years) */}
        {validData.map((r, i) => (
          <text
            key={i}
            x={scaleX(i)}
            y={ratioChartHeight - 8}
            fill={COLORS.text}
            fontSize={8}
            textAnchor="middle"
          >
            {getYear(r).slice(-2)}
          </text>
        ))}
      </svg>
    );
  };

  // Render date axis for price chart
  const renderDateAxis = (data: PriceData[], height: number) => {
    if (data.length < 2) return null;

    const tickCount = 6;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const idx = Math.floor((i / (tickCount - 1)) * (data.length - 1));
      const x = padding + (idx / (data.length - 1)) * (chartWidth - padding - rightPadding);
      const date = new Date(data[idx].date);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      ticks.push({ x, label });
    }

    return (
      <g>
        {ticks.map((tick, i) => (
          <text key={i} x={tick.x} y={height - 5} fill={COLORS.text} fontSize={8} textAnchor="middle">
            {tick.label}
          </text>
        ))}
      </g>
    );
  };

  // Get selected metrics in order
  const selectedMetricsList = RATIO_METRICS.filter(m => selectedMetrics.has(m.key));

  return (
    <div className="flex flex-col h-full bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-border bg-bg-secondary flex-wrap">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Symbol:</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            className="w-20 px-2 py-1 text-xs font-mono bg-bg-tertiary border border-border rounded
                       text-text-primary focus:outline-none focus:border-accent-blue"
            placeholder="AAPL"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-accent-blue text-white rounded hover:bg-accent-blue/80"
          >
            Go
          </button>
        </form>

        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer ml-auto">
          <span style={{ color: '#ff9f43' }}>▼</span>
          <span>/</span>
          <span style={{ color: '#54a0ff' }}>▲</span>
          <input
            type="checkbox"
            checked={showMinMax}
            onChange={(e) => setShowMinMax(e.target.checked)}
            className="w-3 h-3 accent-accent-blue"
          />
          Min/Max
        </label>
      </div>

      {/* Metric Selector */}
      <div className="px-2 py-2 border-b border-border bg-bg-tertiary">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => {
            const catMetrics = RATIO_METRICS.filter(m => m.category === cat.key);
            return (
              <div
                key={cat.key}
                className="bg-bg-secondary rounded border border-border p-2"
              >
                <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5 font-medium">
                  {cat.label}
                </div>
                <div className="flex flex-wrap gap-1">
                  {catMetrics.map(metric => {
                    const isSelected = selectedMetrics.has(metric.key);
                    return (
                      <button
                        key={metric.key}
                        onClick={() => toggleMetric(metric.key)}
                        className={`px-1.5 py-0.5 text-[11px] rounded border transition-colors ${
                          isSelected
                            ? 'border-transparent'
                            : 'border-border bg-bg-tertiary text-text-secondary hover:text-text-primary'
                        }`}
                        style={isSelected ? {
                          backgroundColor: `${metric.color}22`,
                          color: metric.color,
                          borderColor: `${metric.color}44`,
                        } : undefined}
                      >
                        {metric.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="flex-1 p-2 space-y-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}

        {!loading && priceData.length === 0 && (
          <div className="flex items-center justify-center h-32 text-text-secondary text-sm">
            Enter a symbol to view ratios
          </div>
        )}

        {!loading && priceData.length > 0 && (
          <>
            {/* Price Chart */}
            <div className="border border-border rounded overflow-hidden">
              {renderPriceChart()}
            </div>

            {/* Ratio Charts */}
            {loadingRatios ? (
              <div className="flex items-center justify-center h-24 bg-[#1a1a1a] border border-border rounded">
                <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
                <span className="ml-2 text-xs text-text-secondary">Loading historical ratios...</span>
              </div>
            ) : ratiosData.length > 0 ? (
              selectedMetricsList.map(metric => (
                <div key={metric.key} className="border border-border rounded overflow-hidden">
                  {renderRatioChart(metric)}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 bg-[#1a1a1a] border border-border rounded text-text-secondary text-sm">
                No historical ratio data available
              </div>
            )}

            {selectedMetricsList.length === 0 && ratiosData.length > 0 && (
              <div className="flex items-center justify-center h-24 bg-[#1a1a1a] border border-border rounded text-text-secondary text-sm">
                Select ratios to display from the options above
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
