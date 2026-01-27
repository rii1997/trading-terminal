import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { fmp } from '../../services/fmp';
import type { Quote, HistoricalPriceLight } from '../../types/fmp';

interface SectorPerformanceProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
}

// Sector ETF mappings with approximate AUM for sizing
const SECTOR_ETFS = [
  { symbol: 'XLK', sector: 'Technology', color: '#3B82F6', aum: 65 },
  { symbol: 'XLF', sector: 'Financials', color: '#10B981', aum: 40 },
  { symbol: 'XLV', sector: 'Health Care', color: '#EC4899', aum: 38 },
  { symbol: 'XLE', sector: 'Energy', color: '#F59E0B', aum: 35 },
  { symbol: 'XLI', sector: 'Industrials', color: '#6366F1', aum: 18 },
  { symbol: 'XLP', sector: 'Consumer Staples', color: '#14B8A6', aum: 16 },
  { symbol: 'XLY', sector: 'Consumer Disc.', color: '#F97316', aum: 20 },
  { symbol: 'XLU', sector: 'Utilities', color: '#8B5CF6', aum: 14 },
  { symbol: 'XLB', sector: 'Materials', color: '#EF4444', aum: 6 },
  { symbol: 'XLRE', sector: 'Real Estate', color: '#06B6D4', aum: 5 },
  { symbol: 'XLC', sector: 'Comm. Services', color: '#84CC16', aum: 15 },
];

interface SectorData {
  symbol: string;
  sector: string;
  color: string;
  aum: number;
  price: number;
  change1D: number;
  change1W: number;
  change1M: number;
  change3M: number;
  changeYTD: number;
  change1Y: number;
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';

// Calculate percentage change
const calcChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Find price on or before a specific date
const findPriceOnDate = (history: HistoricalPriceLight[], targetDate: Date): number | null => {
  const targetStr = targetDate.toISOString().split('T')[0];
  for (const h of history) {
    if (h.date <= targetStr) {
      return h.price;
    }
  }
  return null;
};

// Get background color based on performance
const getBackgroundColor = (value: number): string => {
  const intensity = Math.min(Math.abs(value) / 5, 1); // Cap at 5%
  if (value >= 0) {
    // Green shades
    const r = Math.round(34 - intensity * 20);
    const g = Math.round(197 - intensity * 50);
    const b = Math.round(94 - intensity * 30);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Red shades
    const r = Math.round(239 - intensity * 40);
    const g = Math.round(68 - intensity * 40);
    const b = Math.round(68 - intensity * 30);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// Simple treemap layout algorithm
function calculateTreemap(
  data: { symbol: string; sector: string; value: number; change: number }[],
  width: number,
  height: number
): { symbol: string; sector: string; x: number; y: number; w: number; h: number; change: number }[] {
  if (data.length === 0 || width <= 0 || height <= 0) return [];

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return [];

  const result: { symbol: string; sector: string; x: number; y: number; w: number; h: number; change: number }[] = [];

  // Sort by value descending
  const sorted = [...data].sort((a, b) => b.value - a.value);

  let currentX = 0;
  let currentY = 0;
  let remainingWidth = width;
  let remainingHeight = height;
  let remainingValue = total;
  let isHorizontal = width >= height;

  let i = 0;
  while (i < sorted.length) {
    // Determine how many items to place in this row/column
    const aspectRatio = isHorizontal ? remainingWidth / remainingHeight : remainingHeight / remainingWidth;
    let rowValue = 0;
    let rowItems: typeof sorted = [];

    // Group items to get reasonable aspect ratios
    for (let j = i; j < sorted.length && j < i + Math.ceil(aspectRatio * 2); j++) {
      rowItems.push(sorted[j]);
      rowValue += sorted[j].value;
    }

    if (rowItems.length === 0) break;

    const rowRatio = rowValue / remainingValue;

    if (isHorizontal) {
      const rowWidth = remainingWidth * rowRatio;
      let itemY = currentY;

      for (const item of rowItems) {
        const itemRatio = item.value / rowValue;
        const itemHeight = remainingHeight * itemRatio;

        result.push({
          symbol: item.symbol,
          sector: item.sector,
          x: currentX,
          y: itemY,
          w: rowWidth,
          h: itemHeight,
          change: item.change,
        });

        itemY += itemHeight;
      }

      currentX += rowWidth;
      remainingWidth -= rowWidth;
    } else {
      const rowHeight = remainingHeight * rowRatio;
      let itemX = currentX;

      for (const item of rowItems) {
        const itemRatio = item.value / rowValue;
        const itemWidth = remainingWidth * itemRatio;

        result.push({
          symbol: item.symbol,
          sector: item.sector,
          x: itemX,
          y: currentY,
          w: itemWidth,
          h: rowHeight,
          change: item.change,
        });

        itemX += itemWidth;
      }

      currentY += rowHeight;
      remainingHeight -= rowHeight;
    }

    remainingValue -= rowValue;
    i += rowItems.length;
    isHorizontal = !isHorizontal;
  }

  return result;
}

export function SectorPerformance({ onSymbolChange }: SectorPerformanceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1D');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current quotes for all sector ETFs
      const symbols = SECTOR_ETFS.map(s => s.symbol);
      const quotes = await fmp.batchQuote(symbols);

      // Create a map for quick lookup
      const quoteMap = new Map<string, Quote>();
      quotes.forEach(q => quoteMap.set(q.symbol, q));

      // Calculate date ranges
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Fetch historical data for each ETF (need 1 year of data)
      const historicalPromises = symbols.map(async (symbol) => {
        try {
          const history = await fmp.historicalPriceLight(
            symbol,
            oneYearAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          );
          return { symbol, history };
        } catch {
          return { symbol, history: [] };
        }
      });

      const historicalData = await Promise.all(historicalPromises);
      const historyMap = new Map<string, HistoricalPriceLight[]>();
      historicalData.forEach(({ symbol, history }) => {
        historyMap.set(symbol, history);
      });

      // Calculate period dates
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const ytdStart = new Date(now.getFullYear(), 0, 1);
      const oneYearAgoDate = new Date(now);
      oneYearAgoDate.setFullYear(oneYearAgoDate.getFullYear() - 1);

      // Build sector data
      const sectorData: SectorData[] = SECTOR_ETFS.map(etf => {
        const quote = quoteMap.get(etf.symbol);
        const history = historyMap.get(etf.symbol) || [];

        const currentPrice = quote?.price || 0;
        const change1D = quote?.changesPercentage || 0;

        // Calculate period changes from historical data
        const price1W = findPriceOnDate(history, oneWeekAgo);
        const price1M = findPriceOnDate(history, oneMonthAgo);
        const price3M = findPriceOnDate(history, threeMonthsAgo);
        const priceYTD = findPriceOnDate(history, ytdStart);
        const price1Y = findPriceOnDate(history, oneYearAgoDate);

        return {
          symbol: etf.symbol,
          sector: etf.sector,
          color: etf.color,
          aum: etf.aum,
          price: currentPrice,
          change1D,
          change1W: price1W ? calcChange(currentPrice, price1W) : 0,
          change1M: price1M ? calcChange(currentPrice, price1M) : 0,
          change3M: price3M ? calcChange(currentPrice, price3M) : 0,
          changeYTD: priceYTD ? calcChange(currentPrice, priceYTD) : 0,
          change1Y: price1Y ? calcChange(currentPrice, price1Y) : 0,
        };
      });

      setSectors(sectorData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sector data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update header
  useEffect(() => {
    if (onSymbolChange) {
      const headerContent = (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : ''}
          </span>
        </div>
      );
      onSymbolChange('sectors', headerContent);
    }
  }, [lastUpdate, onSymbolChange]);

  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];

  const getValueForPeriod = (sector: SectorData, period: TimePeriod): number => {
    switch (period) {
      case '1D': return sector.change1D;
      case '1W': return sector.change1W;
      case '1M': return sector.change1M;
      case '3M': return sector.change3M;
      case 'YTD': return sector.changeYTD;
      case '1Y': return sector.change1Y;
    }
  };

  // Calculate treemap layout
  const treemapData = sectors.map(s => ({
    symbol: s.symbol,
    sector: s.sector,
    value: s.aum,
    change: getValueForPeriod(s, selectedPeriod),
  }));

  const treemapLayout = calculateTreemap(
    treemapData,
    containerSize.width - 16,
    containerSize.height - 16
  );

  // Calculate market average for selected period
  const getMarketAverage = (): number => {
    if (sectors.length === 0) return 0;
    const sum = sectors.reduce((acc, s) => acc + getValueForPeriod(s, selectedPeriod), 0);
    return sum / sectors.length;
  };

  const marketAvg = getMarketAverage();

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                selectedPeriod === period
                  ? 'bg-accent-primary text-white border-accent-primary'
                  : 'bg-bg-secondary border-border hover:bg-bg-tertiary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-text-secondary">Avg: </span>
            <span className={`font-bold ${marketAvg >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {marketAvg >= 0 ? '+' : ''}{marketAvg.toFixed(2)}%
            </span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-2 py-1 text-xs bg-bg-secondary border border-border rounded hover:bg-bg-tertiary disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Treemap Content */}
      <div
        className="flex-1 overflow-hidden p-2"
        ref={(el) => {
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width !== containerSize.width || rect.height !== containerSize.height) {
              setContainerSize({ width: rect.width, height: rect.height });
            }
          }
        }}
      >
        {loading && sectors.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-secondary">Loading sector performance...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-accent-red">{error}</div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {treemapLayout.map((item) => {
              const isLarge = item.w > 120 && item.h > 80;
              const isMedium = item.w > 80 && item.h > 60;

              return (
                <div
                  key={item.symbol}
                  className="absolute cursor-pointer transition-all hover:brightness-110 hover:z-10 border border-black/20"
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.w,
                    height: item.h,
                    backgroundColor: getBackgroundColor(item.change),
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 overflow-hidden">
                    {/* Sector Name */}
                    <div className={`font-bold text-white drop-shadow-md text-center leading-tight ${
                      isLarge ? 'text-base' : isMedium ? 'text-sm' : 'text-[10px]'
                    }`}>
                      {item.sector}
                    </div>

                    {/* ETF Symbol */}
                    <div className={`text-white/80 drop-shadow-md ${
                      isLarge ? 'text-xs' : 'text-[9px]'
                    }`}>
                      {item.symbol}
                    </div>

                    {/* Change % */}
                    <div className={`text-white font-bold drop-shadow-md mt-1 ${
                      isLarge ? 'text-lg' : isMedium ? 'text-sm' : 'text-xs'
                    }`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-secondary">Performance:</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-text-secondary">-5%</span>
              <div className="flex gap-0.5">
                {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => (
                  <div
                    key={v}
                    className="w-4 h-3 rounded-sm"
                    style={{ backgroundColor: getBackgroundColor(v) }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-text-secondary">+5%</span>
            </div>
          </div>
          <span className="text-[10px] text-text-secondary">
            Box size = Sector Weight | {selectedPeriod} performance
          </span>
        </div>
      </div>
    </div>
  );
}
