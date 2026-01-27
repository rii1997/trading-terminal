import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { SymbolInput } from './SymbolInput';
import { fmp } from '../../services/fmp';
import type { Ratios } from '../../types/fmp';

// Time period options
type TimePeriod = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

// Financial ratio metrics available for comparison
type RatioMetric =
  | 'priceToEarningsRatio'
  | 'priceToBookRatio'
  | 'priceToSalesRatio'
  | 'returnOnEquity'
  | 'returnOnAssets'
  | 'grossProfitMargin'
  | 'netProfitMargin'
  | 'operatingProfitMargin'
  | 'currentRatio'
  | 'debtEquityRatio'
  | 'debtRatio'
  | 'interestCoverage';

const RATIO_METRICS: { value: RatioMetric; label: string; format: 'ratio' | 'percent' }[] = [
  { value: 'priceToEarningsRatio', label: 'P/E Ratio', format: 'ratio' },
  { value: 'priceToBookRatio', label: 'P/B Ratio', format: 'ratio' },
  { value: 'priceToSalesRatio', label: 'P/S Ratio', format: 'ratio' },
  { value: 'returnOnEquity', label: 'ROE', format: 'percent' },
  { value: 'returnOnAssets', label: 'ROA', format: 'percent' },
  { value: 'grossProfitMargin', label: 'Gross Margin', format: 'percent' },
  { value: 'netProfitMargin', label: 'Net Margin', format: 'percent' },
  { value: 'operatingProfitMargin', label: 'Operating Margin', format: 'percent' },
  { value: 'currentRatio', label: 'Current Ratio', format: 'ratio' },
  { value: 'debtEquityRatio', label: 'Debt/Equity', format: 'ratio' },
  { value: 'debtRatio', label: 'Debt Ratio', format: 'ratio' },
  { value: 'interestCoverage', label: 'Interest Coverage', format: 'ratio' },
];

interface CompareProps {
  onSymbolChange?: (symbol: string, headerContent: ReactNode) => void;
  initialSymbolY?: string;
  initialSymbolX?: string;
}

interface PriceData {
  date: string;
  price: number;
}

interface RegressionStats {
  beta: number;
  alpha: number;
  pearsonR: number;
  rSquared: number;
  stdDevError: number;
  stdErrorAlpha: number;
  stdErrorBeta: number;
}

// Chart colors
const COLORS = {
  y: '#ff6b6b',
  x: '#4dabf7',
  ratio: '#51cf66',
  correlation: '#e599f7',
  regression: '#fcc419',
  financialY: '#ff6b6b',
  financialX: '#4dabf7',
  grid: '#333333',
  text: '#888888',
  bg: '#1a1a1a',
};

export function Compare({
  onSymbolChange,
  initialSymbolY = 'AAPL',
  initialSymbolX = 'NVDA',
}: CompareProps) {
  const [symbolY, setSymbolY] = useState(initialSymbolY);
  const [symbolX, setSymbolX] = useState(initialSymbolX);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6M');
  const [showRegression, setShowRegression] = useState(true);
  const [showCorrelation, setShowCorrelation] = useState(true);
  const [showFinancialRatios, setShowFinancialRatios] = useState(true);
  const [selectedRatioMetric, setSelectedRatioMetric] = useState<RatioMetric>('priceToEarningsRatio');
  const [showMinMax, setShowMinMax] = useState(true);
  const [corrWindow, setCorrWindow] = useState(120);
  const [corrWindowInput, setCorrWindowInput] = useState('120');
  const [loading, setLoading] = useState(false);
  const [dataY, setDataY] = useState<PriceData[]>([]);
  const [dataX, setDataX] = useState<PriceData[]>([]);
  const [ratiosY, setRatiosY] = useState<Ratios[]>([]);
  const [ratiosX, setRatiosX] = useState<Ratios[]>([]);
  const [loadingRatios, setLoadingRatios] = useState(false);

  // Crosshair state
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const [ratiosCrosshairIndex, setRatiosCrosshairIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate date range based on time period
  const getDateRange = useCallback(() => {
    const to = new Date();
    const from = new Date();

    switch (timePeriod) {
      case '1M': from.setMonth(from.getMonth() - 1); break;
      case '3M': from.setMonth(from.getMonth() - 3); break;
      case '6M': from.setMonth(from.getMonth() - 6); break;
      case '1Y': from.setFullYear(from.getFullYear() - 1); break;
      case '2Y': from.setFullYear(from.getFullYear() - 2); break;
      case '5Y': from.setFullYear(from.getFullYear() - 5); break;
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }, [timePeriod]);

  // Fetch historical data for both symbols
  const fetchData = useCallback(async () => {
    if (!symbolY || !symbolX) return;

    setLoading(true);
    try {
      const { from, to } = getDateRange();

      const [histY, histX] = await Promise.all([
        fmp.historicalPrice(symbolY, from, to),
        fmp.historicalPrice(symbolX, from, to),
      ]);

      const priceY = histY
        .map(d => ({ date: d.date, price: d.close }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const priceX = histX
        .map(d => ({ date: d.date, price: d.close }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDataY(priceY);
      setDataX(priceX);
    } catch (err) {
      console.error('Error fetching compare data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbolY, symbolX, getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch historical ratios for both symbols
  const fetchRatios = useCallback(async () => {
    if (!symbolY || !symbolX) return;

    setLoadingRatios(true);
    try {
      const [rY, rX] = await Promise.all([
        fmp.ratios(symbolY, 10), // Last 10 years of annual data
        fmp.ratios(symbolX, 10),
      ]);

      console.log('[Compare] Raw ratios response:', {
        symbolY,
        symbolX,
        ratiosYCount: rY?.length ?? 0,
        ratiosXCount: rX?.length ?? 0,
        ratiosY: rY,
        ratiosX: rX,
      });

      if (!rY || !rX) {
        console.error('[Compare] Ratios data is null/undefined');
        return;
      }

      // Sort by date ascending
      const sortedY = rY.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const sortedX = rX.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('[Compare] Sorted ratios:', {
        yearsY: sortedY.map(r => r.calendarYear),
        yearsX: sortedX.map(r => r.calendarYear),
        datesY: sortedY.map(r => r.date),
        datesX: sortedX.map(r => r.date),
        periodsY: sortedY.map(r => r.period),
        sampleYFields: sortedY[0] ? Object.keys(sortedY[0]) : [],
        sampleY: sortedY[0],
      });

      setRatiosY(sortedY);
      setRatiosX(sortedX);
    } catch (err) {
      console.error('[Compare] Error fetching ratios:', err);
    } finally {
      setLoadingRatios(false);
    }
  }, [symbolY, symbolX]);

  useEffect(() => {
    if (showFinancialRatios) {
      fetchRatios();
    }
  }, [fetchRatios, showFinancialRatios]);

  // Debug: Log when ratios state changes
  useEffect(() => {
    console.log('[Compare] Ratios state updated:', {
      ratiosYLen: ratiosY.length,
      ratiosXLen: ratiosX.length,
      loadingRatios,
      showFinancialRatios,
    });
  }, [ratiosY, ratiosX, loadingRatios, showFinancialRatios]);

  useEffect(() => {
    if (onSymbolChange) {
      onSymbolChange('', null);
    }
  }, [onSymbolChange]);

  // Align data by date
  const alignedData = (() => {
    const dateMapY = new Map(dataY.map(d => [d.date, d.price]));
    const dateMapX = new Map(dataX.map(d => [d.date, d.price]));

    const allDates = [...new Set([...dataY.map(d => d.date), ...dataX.map(d => d.date)])]
      .filter(date => dateMapY.has(date) && dateMapX.has(date))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return allDates.map(date => ({
      date,
      priceY: dateMapY.get(date)!,
      priceX: dateMapX.get(date)!,
      ratio: dateMapY.get(date)! / dateMapX.get(date)!,
    }));
  })();

  // Calculate daily returns
  const returns = alignedData.slice(1).map((d, i) => ({
    date: d.date,
    returnY: ((d.priceY - alignedData[i].priceY) / alignedData[i].priceY) * 100,
    returnX: ((d.priceX - alignedData[i].priceX) / alignedData[i].priceX) * 100,
  }));

  // Calculate rolling correlation
  const rollingCorrelation = (() => {
    if (returns.length < corrWindow) return [];

    const result: { date: string; correlation: number }[] = [];

    for (let i = corrWindow - 1; i < returns.length; i++) {
      const windowReturns = returns.slice(i - corrWindow + 1, i + 1);
      const corr = calculatePearsonR(
        windowReturns.map(r => r.returnX),
        windowReturns.map(r => r.returnY)
      );
      result.push({ date: returns[i].date, correlation: corr });
    }

    return result;
  })();

  // Calculate regression statistics
  const regressionStats: RegressionStats | null = (() => {
    if (returns.length < 2) return null;

    const xReturns = returns.map(r => r.returnX);
    const yReturns = returns.map(r => r.returnY);
    const n = returns.length;

    const meanX = xReturns.reduce((a, b) => a + b, 0) / n;
    const meanY = yReturns.reduce((a, b) => a + b, 0) / n;

    let ssXX = 0, ssYY = 0, ssXY = 0;
    for (let i = 0; i < n; i++) {
      ssXX += (xReturns[i] - meanX) ** 2;
      ssYY += (yReturns[i] - meanY) ** 2;
      ssXY += (xReturns[i] - meanX) * (yReturns[i] - meanY);
    }

    const beta = ssXY / ssXX;
    const alpha = meanY - beta * meanX;
    const pearsonR = ssXY / Math.sqrt(ssXX * ssYY);
    const rSquared = pearsonR ** 2;

    // Residual standard error
    let ssResidual = 0;
    for (let i = 0; i < n; i++) {
      const predicted = alpha + beta * xReturns[i];
      ssResidual += (yReturns[i] - predicted) ** 2;
    }
    const stdDevError = Math.sqrt(ssResidual / (n - 2));
    const stdErrorBeta = stdDevError / Math.sqrt(ssXX);
    const stdErrorAlpha = stdDevError * Math.sqrt(1 / n + (meanX ** 2) / ssXX);

    return { beta, alpha, pearsonR, rSquared, stdDevError, stdErrorAlpha, stdErrorBeta };
  })();

  function calculatePearsonR(x: number[], y: number[]): number {
    const n = x.length;
    if (n < 2) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let ssXX = 0, ssYY = 0, ssXY = 0;
    for (let i = 0; i < n; i++) {
      ssXX += (x[i] - meanX) ** 2;
      ssYY += (y[i] - meanY) ** 2;
      ssXY += (x[i] - meanX) * (y[i] - meanY);
    }

    return ssXY / Math.sqrt(ssXX * ssYY) || 0;
  }

  // Find min/max indices
  const priceYMinIdx = alignedData.length > 0
    ? alignedData.reduce((minIdx, d, i, arr) => d.priceY < arr[minIdx].priceY ? i : minIdx, 0)
    : -1;
  const priceYMaxIdx = alignedData.length > 0
    ? alignedData.reduce((maxIdx, d, i, arr) => d.priceY > arr[maxIdx].priceY ? i : maxIdx, 0)
    : -1;
  const priceXMinIdx = alignedData.length > 0
    ? alignedData.reduce((minIdx, d, i, arr) => d.priceX < arr[minIdx].priceX ? i : minIdx, 0)
    : -1;
  const priceXMaxIdx = alignedData.length > 0
    ? alignedData.reduce((maxIdx, d, i, arr) => d.priceX > arr[maxIdx].priceX ? i : maxIdx, 0)
    : -1;
  const ratioMinIdx = alignedData.length > 0
    ? alignedData.reduce((minIdx, d, i, arr) => d.ratio < arr[minIdx].ratio ? i : minIdx, 0)
    : -1;
  const ratioMaxIdx = alignedData.length > 0
    ? alignedData.reduce((maxIdx, d, i, arr) => d.ratio > arr[maxIdx].ratio ? i : maxIdx, 0)
    : -1;
  const corrMinIdx = rollingCorrelation.length > 0
    ? rollingCorrelation.reduce((minIdx, d, i, arr) => d.correlation < arr[minIdx].correlation ? i : minIdx, 0)
    : -1;
  const corrMaxIdx = rollingCorrelation.length > 0
    ? rollingCorrelation.reduce((maxIdx, d, i, arr) => d.correlation > arr[maxIdx].correlation ? i : maxIdx, 0)
    : -1;

  // Current values (crosshair or latest)
  const currentIdx = crosshairIndex !== null ? crosshairIndex : alignedData.length - 1;
  const currentData = alignedData[currentIdx];
  const currentCorr = crosshairIndex !== null && rollingCorrelation[crosshairIndex - (alignedData.length - rollingCorrelation.length)]
    ? rollingCorrelation[crosshairIndex - (alignedData.length - rollingCorrelation.length)]?.correlation
    : rollingCorrelation[rollingCorrelation.length - 1]?.correlation;

  // Handle mouse move for crosshair
  const handleMouseMove = useCallback((e: React.MouseEvent, chartWidth: number, dataLength: number, padding: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding;
    const chartAreaWidth = chartWidth - padding * 2;

    if (x >= 0 && x <= chartAreaWidth && dataLength > 0) {
      const index = Math.round((x / chartAreaWidth) * (dataLength - 1));
      setCrosshairIndex(Math.max(0, Math.min(index, dataLength - 1)));
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCrosshairIndex(null);
  }, []);

  const handleSetCorrWindow = () => {
    const value = parseInt(corrWindowInput);
    if (!isNaN(value) && value > 1) {
      setCorrWindow(value);
    }
  };

  // Chart dimensions
  const chartWidth = 850;
  const priceChartHeight = 180;
  const ratioChartHeight = 140;
  const corrChartHeight = 140;
  const scatterHeight = 200;
  const padding = 60;
  const rightPadding = 70;

  // Render price chart
  const renderPriceChart = () => {
    if (alignedData.length < 2) return null;

    const minY = Math.min(...alignedData.map(d => d.priceY));
    const maxY = Math.max(...alignedData.map(d => d.priceY));
    const minX = Math.min(...alignedData.map(d => d.priceX));
    const maxX = Math.max(...alignedData.map(d => d.priceX));

    const scaleY = (val: number, min: number, max: number) => {
      const range = max - min || 1;
      return priceChartHeight - 20 - ((val - min) / range) * (priceChartHeight - 40);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (alignedData.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const pathY = alignedData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.priceY, minY, maxY)}`
    ).join(' ');

    const pathX = alignedData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.priceX, minX, maxX)}`
    ).join(' ');

    return (
      <svg
        width={chartWidth}
        height={priceChartHeight}
        onMouseMove={(e) => handleMouseMove(e, chartWidth, alignedData.length, padding)}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      >
        {/* Background */}
        <rect width={chartWidth} height={priceChartHeight} fill={COLORS.bg} />

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((priceChartHeight - 40) / 4)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((priceChartHeight - 40) / 4)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels (left - Y series) */}
        {[0, 1, 2, 3, 4].map(i => {
          const val = maxY - (i / 4) * (maxY - minY);
          return (
            <text key={`yl-${i}`} x={5} y={24 + i * ((priceChartHeight - 40) / 4)} fill={COLORS.y} fontSize={9}>
              ${val.toFixed(0)}
            </text>
          );
        })}

        {/* Y axis labels (right - X series) */}
        {[0, 1, 2, 3, 4].map(i => {
          const val = maxX - (i / 4) * (maxX - minX);
          return (
            <text key={`yr-${i}`} x={chartWidth - rightPadding + 5} y={24 + i * ((priceChartHeight - 40) / 4)} fill={COLORS.x} fontSize={9}>
              ${val.toFixed(0)}
            </text>
          );
        })}

        {/* Axis labels */}
        <text x={5} y={priceChartHeight / 2} fill={COLORS.y} fontSize={9} transform={`rotate(-90, 10, ${priceChartHeight / 2})`} textAnchor="middle">
          {symbolY} Price ($)
        </text>
        <text x={chartWidth - 10} y={priceChartHeight / 2} fill={COLORS.x} fontSize={9} transform={`rotate(90, ${chartWidth - 10}, ${priceChartHeight / 2})`} textAnchor="middle">
          {symbolX} Price ($)
        </text>

        {/* Price lines */}
        <path d={pathY} fill="none" stroke={COLORS.y} strokeWidth={2} />
        <path d={pathX} fill="none" stroke={COLORS.x} strokeWidth={2} />

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            {/* Y min */}
            <polygon
              points={`${scaleX(priceYMinIdx)},${scaleY(alignedData[priceYMinIdx].priceY, minY, maxY) + 5} ${scaleX(priceYMinIdx) - 5},${scaleY(alignedData[priceYMinIdx].priceY, minY, maxY) + 12} ${scaleX(priceYMinIdx) + 5},${scaleY(alignedData[priceYMinIdx].priceY, minY, maxY) + 12}`}
              fill={COLORS.y}
            />
            {/* Y max */}
            <polygon
              points={`${scaleX(priceYMaxIdx)},${scaleY(alignedData[priceYMaxIdx].priceY, minY, maxY) - 5} ${scaleX(priceYMaxIdx) - 5},${scaleY(alignedData[priceYMaxIdx].priceY, minY, maxY) - 12} ${scaleX(priceYMaxIdx) + 5},${scaleY(alignedData[priceYMaxIdx].priceY, minY, maxY) - 12}`}
              fill={COLORS.y}
            />
            {/* X min */}
            <polygon
              points={`${scaleX(priceXMinIdx)},${scaleY(alignedData[priceXMinIdx].priceX, minX, maxX) + 5} ${scaleX(priceXMinIdx) - 5},${scaleY(alignedData[priceXMinIdx].priceX, minX, maxX) + 12} ${scaleX(priceXMinIdx) + 5},${scaleY(alignedData[priceXMinIdx].priceX, minX, maxX) + 12}`}
              fill={COLORS.x}
            />
            {/* X max */}
            <polygon
              points={`${scaleX(priceXMaxIdx)},${scaleY(alignedData[priceXMaxIdx].priceX, minX, maxX) - 5} ${scaleX(priceXMaxIdx) - 5},${scaleY(alignedData[priceXMaxIdx].priceX, minX, maxX) - 12} ${scaleX(priceXMaxIdx) + 5},${scaleY(alignedData[priceXMaxIdx].priceX, minX, maxX) - 12}`}
              fill={COLORS.x}
            />
          </>
        )}

        {/* Crosshair */}
        {crosshairIndex !== null && (
          <>
            <line
              x1={scaleX(crosshairIndex)}
              y1={20}
              x2={scaleX(crosshairIndex)}
              y2={priceChartHeight - 20}
              stroke="#666"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          </>
        )}

        {/* Legend */}
        <rect x={padding + 5} y={5} width={160} height={32} fill="rgba(0,0,0,0.7)" rx={3} />
        <rect x={padding + 10} y={10} width={10} height={10} fill={COLORS.y} />
        <text x={padding + 25} y={18} fill={COLORS.y} fontSize={10}>
          {symbolY}: {currentData?.priceY?.toFixed(2) ?? '--'}
        </text>
        <rect x={padding + 10} y={22} width={10} height={10} fill={COLORS.x} />
        <text x={padding + 25} y={30} fill={COLORS.x} fontSize={10}>
          {symbolX}: {currentData?.priceX?.toFixed(2) ?? '--'}
        </text>

        {/* X axis (dates) */}
        {renderXAxis(alignedData, priceChartHeight, padding, rightPadding, chartWidth)}
      </svg>
    );
  };

  // Render ratio chart
  const renderRatioChart = () => {
    if (alignedData.length < 2) return null;

    const minR = Math.min(...alignedData.map(d => d.ratio));
    const maxR = Math.max(...alignedData.map(d => d.ratio));

    const scaleY = (val: number) => {
      const range = maxR - minR || 1;
      return ratioChartHeight - 25 - ((val - minR) / range) * (ratioChartHeight - 45);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (alignedData.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const areaPath = `
      M ${scaleX(0)} ${ratioChartHeight - 25}
      ${alignedData.map((d, i) => `L ${scaleX(i)} ${scaleY(d.ratio)}`).join(' ')}
      L ${scaleX(alignedData.length - 1)} ${ratioChartHeight - 25}
      Z
    `;

    const linePath = alignedData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.ratio)}`
    ).join(' ');

    return (
      <svg
        width={chartWidth}
        height={ratioChartHeight}
        onMouseMove={(e) => handleMouseMove(e, chartWidth, alignedData.length, padding)}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      >
        <rect width={chartWidth} height={ratioChartHeight} fill={COLORS.bg} />

        {/* Grid */}
        {[0, 1, 2, 3].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((ratioChartHeight - 45) / 3)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((ratioChartHeight - 45) / 3)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {[0, 1, 2, 3].map(i => {
          const val = maxR - (i / 3) * (maxR - minR);
          return (
            <text key={i} x={chartWidth - rightPadding + 5} y={24 + i * ((ratioChartHeight - 45) / 3)} fill={COLORS.ratio} fontSize={9}>
              {val.toFixed(2)}
            </text>
          );
        })}

        {/* Axis label */}
        <text x={5} y={ratioChartHeight / 2} fill={COLORS.ratio} fontSize={9} transform={`rotate(-90, 12, ${ratioChartHeight / 2})`} textAnchor="middle">
          {symbolY}/{symbolX} Ratio
        </text>

        {/* Area fill */}
        <path d={areaPath} fill="rgba(81, 207, 102, 0.3)" />
        <path d={linePath} fill="none" stroke={COLORS.ratio} strokeWidth={1.5} />

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            <polygon
              points={`${scaleX(ratioMinIdx)},${scaleY(alignedData[ratioMinIdx].ratio) + 5} ${scaleX(ratioMinIdx) - 5},${scaleY(alignedData[ratioMinIdx].ratio) + 12} ${scaleX(ratioMinIdx) + 5},${scaleY(alignedData[ratioMinIdx].ratio) + 12}`}
              fill={COLORS.ratio}
            />
            <polygon
              points={`${scaleX(ratioMaxIdx)},${scaleY(alignedData[ratioMaxIdx].ratio) - 5} ${scaleX(ratioMaxIdx) - 5},${scaleY(alignedData[ratioMaxIdx].ratio) - 12} ${scaleX(ratioMaxIdx) + 5},${scaleY(alignedData[ratioMaxIdx].ratio) - 12}`}
              fill={COLORS.ratio}
            />
          </>
        )}

        {/* Crosshair */}
        {crosshairIndex !== null && (
          <line
            x1={scaleX(crosshairIndex)}
            y1={20}
            x2={scaleX(crosshairIndex)}
            y2={ratioChartHeight - 25}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {/* Legend */}
        <rect x={padding + 5} y={5} width={180} height={18} fill="rgba(0,0,0,0.7)" rx={3} />
        <text x={padding + 10} y={17} fill={COLORS.ratio} fontSize={10}>
          {symbolY}/{symbolX}: {currentData?.ratio?.toFixed(3) ?? '--'}
        </text>

        {/* X axis */}
        {renderXAxis(alignedData, ratioChartHeight, padding, rightPadding, chartWidth)}
      </svg>
    );
  };

  // Render correlation chart
  const renderCorrelationChart = () => {
    if (rollingCorrelation.length < 2) return null;

    const minC = Math.min(...rollingCorrelation.map(d => d.correlation), 0);
    const maxC = Math.max(...rollingCorrelation.map(d => d.correlation), 1);

    const scaleY = (val: number) => {
      const range = maxC - minC || 1;
      return corrChartHeight - 25 - ((val - minC) / range) * (corrChartHeight - 45);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (rollingCorrelation.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const areaPath = `
      M ${scaleX(0)} ${corrChartHeight - 25}
      ${rollingCorrelation.map((d, i) => `L ${scaleX(i)} ${scaleY(d.correlation)}`).join(' ')}
      L ${scaleX(rollingCorrelation.length - 1)} ${corrChartHeight - 25}
      Z
    `;

    const linePath = rollingCorrelation.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.correlation)}`
    ).join(' ');

    return (
      <svg
        width={chartWidth}
        height={corrChartHeight}
        onMouseMove={(e) => handleMouseMove(e, chartWidth, rollingCorrelation.length, padding)}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      >
        <rect width={chartWidth} height={corrChartHeight} fill={COLORS.bg} />

        {/* Grid */}
        {[0, 1, 2, 3].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((corrChartHeight - 45) / 3)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((corrChartHeight - 45) / 3)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {[0, 1, 2, 3].map(i => {
          const val = maxC - (i / 3) * (maxC - minC);
          return (
            <text key={i} x={chartWidth - rightPadding + 5} y={24 + i * ((corrChartHeight - 45) / 3)} fill={COLORS.correlation} fontSize={9}>
              {val.toFixed(2)}
            </text>
          );
        })}

        {/* Axis label */}
        <text x={5} y={corrChartHeight / 2} fill={COLORS.correlation} fontSize={8} transform={`rotate(-90, 12, ${corrChartHeight / 2})`} textAnchor="middle">
          Corr. w/ {symbolX}
        </text>

        {/* Area fill */}
        <path d={areaPath} fill="rgba(229, 153, 247, 0.3)" />
        <path d={linePath} fill="none" stroke={COLORS.correlation} strokeWidth={1.5} />

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            <polygon
              points={`${scaleX(corrMinIdx)},${scaleY(rollingCorrelation[corrMinIdx].correlation) + 5} ${scaleX(corrMinIdx) - 5},${scaleY(rollingCorrelation[corrMinIdx].correlation) + 12} ${scaleX(corrMinIdx) + 5},${scaleY(rollingCorrelation[corrMinIdx].correlation) + 12}`}
              fill={COLORS.correlation}
            />
            <polygon
              points={`${scaleX(corrMaxIdx)},${scaleY(rollingCorrelation[corrMaxIdx].correlation) - 5} ${scaleX(corrMaxIdx) - 5},${scaleY(rollingCorrelation[corrMaxIdx].correlation) - 12} ${scaleX(corrMaxIdx) + 5},${scaleY(rollingCorrelation[corrMaxIdx].correlation) - 12}`}
              fill={COLORS.correlation}
            />
          </>
        )}

        {/* Crosshair */}
        {crosshairIndex !== null && crosshairIndex < rollingCorrelation.length && (
          <line
            x1={scaleX(crosshairIndex)}
            y1={20}
            x2={scaleX(crosshairIndex)}
            y2={corrChartHeight - 25}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {/* Legend */}
        <rect x={padding + 5} y={5} width={200} height={18} fill="rgba(0,0,0,0.7)" rx={3} />
        <text x={padding + 10} y={17} fill={COLORS.correlation} fontSize={10}>
          Corr({symbolY}/{symbolX}): {currentCorr?.toFixed(3) ?? '--'}
        </text>

        {/* X axis */}
        {renderXAxis(rollingCorrelation.map(d => ({ date: d.date })), corrChartHeight, padding, rightPadding, chartWidth)}
      </svg>
    );
  };

  // Render scatter plot with regression
  const renderScatterPlot = () => {
    if (returns.length < 2 || !regressionStats) return null;

    const xReturns = returns.map(r => r.returnX);
    const yReturns = returns.map(r => r.returnY);

    const minX = Math.min(...xReturns);
    const maxX = Math.max(...xReturns);
    const minY = Math.min(...yReturns);
    const maxY = Math.max(...yReturns);

    const plotWidth = 450;
    const plotPadding = 50;

    const scaleX = (val: number) => {
      const range = maxX - minX || 1;
      return plotPadding + ((val - minX) / range) * (plotWidth - plotPadding * 2);
    };

    const scaleY = (val: number) => {
      const range = maxY - minY || 1;
      return scatterHeight - plotPadding - ((val - minY) / range) * (scatterHeight - plotPadding * 2);
    };

    // Regression line endpoints
    const regY1 = regressionStats.alpha + regressionStats.beta * minX;
    const regY2 = regressionStats.alpha + regressionStats.beta * maxX;

    // Mean point
    const meanX = xReturns.reduce((a, b) => a + b, 0) / xReturns.length;
    const meanY = yReturns.reduce((a, b) => a + b, 0) / yReturns.length;

    return (
      <div className="flex gap-4 items-start">
        <svg width={plotWidth} height={scatterHeight}>
          <rect width={plotWidth} height={scatterHeight} fill={COLORS.bg} />

          {/* Grid */}
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <line
                x1={plotPadding}
                y1={plotPadding / 2 + i * ((scatterHeight - plotPadding) / 4)}
                x2={plotWidth - plotPadding / 2}
                y2={plotPadding / 2 + i * ((scatterHeight - plotPadding) / 4)}
                stroke={COLORS.grid}
                strokeWidth={0.5}
              />
              <line
                x1={plotPadding + i * ((plotWidth - plotPadding * 1.5) / 4)}
                y1={plotPadding / 2}
                x2={plotPadding + i * ((plotWidth - plotPadding * 1.5) / 4)}
                y2={scatterHeight - plotPadding / 2}
                stroke={COLORS.grid}
                strokeWidth={0.5}
              />
            </g>
          ))}

          {/* Zero lines */}
          {minX < 0 && maxX > 0 && (
            <line
              x1={scaleX(0)}
              y1={plotPadding / 2}
              x2={scaleX(0)}
              y2={scatterHeight - plotPadding / 2}
              stroke="#555"
              strokeWidth={1}
            />
          )}
          {minY < 0 && maxY > 0 && (
            <line
              x1={plotPadding}
              y1={scaleY(0)}
              x2={plotWidth - plotPadding / 2}
              y2={scaleY(0)}
              stroke="#555"
              strokeWidth={1}
            />
          )}

          {/* Scatter points */}
          {returns.map((r, i) => (
            <circle
              key={i}
              cx={scaleX(r.returnX)}
              cy={scaleY(r.returnY)}
              r={4}
              fill={COLORS.correlation}
              opacity={0.6}
            />
          ))}

          {/* Mean point */}
          <circle cx={scaleX(meanX)} cy={scaleY(meanY)} r={8} fill="#ff6b6b" opacity={0.8} />

          {/* Regression line */}
          <line
            x1={scaleX(minX)}
            y1={scaleY(regY1)}
            x2={scaleX(maxX)}
            y2={scaleY(regY2)}
            stroke={COLORS.regression}
            strokeWidth={2}
          />

          {/* Axis labels */}
          <text x={plotWidth / 2} y={scatterHeight - 5} fill={COLORS.text} fontSize={10} textAnchor="middle">
            {symbolX} Returns (%)
          </text>
          <text x={15} y={scatterHeight / 2} fill={COLORS.text} fontSize={10} textAnchor="middle" transform={`rotate(-90, 15, ${scatterHeight / 2})`}>
            {symbolY} Returns (%)
          </text>

          {/* X axis values */}
          <text x={plotPadding} y={scatterHeight - plotPadding / 2 + 15} fill={COLORS.text} fontSize={9} textAnchor="middle">
            {minX.toFixed(1)}
          </text>
          <text x={plotWidth - plotPadding / 2} y={scatterHeight - plotPadding / 2 + 15} fill={COLORS.text} fontSize={9} textAnchor="middle">
            {maxX.toFixed(1)}
          </text>

          {/* Y axis values */}
          <text x={plotPadding - 5} y={plotPadding / 2 + 3} fill={COLORS.text} fontSize={9} textAnchor="end">
            {maxY.toFixed(1)}
          </text>
          <text x={plotPadding - 5} y={scatterHeight - plotPadding / 2} fill={COLORS.text} fontSize={9} textAnchor="end">
            {minY.toFixed(1)}
          </text>

          {/* Regression equation */}
          <rect x={plotPadding + 5} y={plotPadding / 2} width={150} height={18} fill="rgba(0,0,0,0.7)" rx={3} />
          <text x={plotPadding + 10} y={plotPadding / 2 + 13} fill={COLORS.regression} fontSize={10}>
            y = {regressionStats.beta.toFixed(3)}x + {regressionStats.alpha.toFixed(3)}
          </text>
        </svg>

        {/* Stats table */}
        <div className="bg-bg-secondary border border-border rounded text-xs">
          <table className="border-collapse">
            <tbody>
              {[
                ['Beta (β)', regressionStats.beta.toFixed(3)],
                ['Alpha (α)', regressionStats.alpha.toFixed(3)],
                ['Pearson R', regressionStats.pearsonR.toFixed(3)],
                ['R-squared', regressionStats.rSquared.toFixed(3)],
                ['Std Dev Error', regressionStats.stdDevError.toFixed(3)],
                ['Std Error (α)', regressionStats.stdErrorAlpha.toFixed(3)],
                ['Std Error (β)', regressionStats.stdErrorBeta.toFixed(3)],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-1.5 text-text-secondary border-r border-border">{label}</td>
                  <td className="px-3 py-1.5 text-text-primary text-right font-mono">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // X axis renderer
  const renderXAxis = (data: { date: string }[], height: number, leftPad: number, rightPad: number, width: number) => {
    if (data.length < 2) return null;

    const tickCount = 6;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const idx = Math.floor((i / (tickCount - 1)) * (data.length - 1));
      const x = leftPad + (idx / (data.length - 1)) * (width - leftPad - rightPad);
      const date = new Date(data[idx].date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      ticks.push({ x, label });
    }

    return (
      <g>
        {ticks.map((tick, i) => (
          <text key={i} x={tick.x} y={height - 5} fill={COLORS.text} fontSize={9} textAnchor="middle">
            {tick.label}
          </text>
        ))}
      </g>
    );
  };

  // Helper to extract year from date or calendarYear
  const getYear = (r: Ratios): string => {
    if (r.calendarYear) return r.calendarYear;
    if (r.date) return r.date.substring(0, 4); // Extract year from "YYYY-MM-DD"
    return 'unknown';
  };

  // Align financial ratios data by year
  const alignedRatios = (() => {
    if (ratiosY.length === 0 || ratiosX.length === 0) {
      console.log('[Compare] alignedRatios: No ratios data', { ratiosYLen: ratiosY.length, ratiosXLen: ratiosX.length });
      return [];
    }

    const yearMapY = new Map(ratiosY.map(r => [getYear(r), r]));
    const yearMapX = new Map(ratiosX.map(r => [getYear(r), r]));

    console.log('[Compare] Year maps:', {
      yearsY: [...yearMapY.keys()],
      yearsX: [...yearMapX.keys()],
    });

    const allYears = [...new Set([...ratiosY.map(r => getYear(r)), ...ratiosX.map(r => getYear(r))])]
      .filter(year => year !== 'unknown' && yearMapY.has(year) && yearMapX.has(year))
      .sort();

    console.log('[Compare] Aligned years:', allYears);

    const result = allYears.map(year => ({
      year,
      dateY: yearMapY.get(year)!.date,
      dateX: yearMapX.get(year)!.date,
      ratioY: yearMapY.get(year)!,
      ratioX: yearMapX.get(year)!,
    }));

    console.log('[Compare] Aligned ratios count:', result.length);
    return result;
  })();

  // Get current metric info
  const currentMetricInfo = RATIO_METRICS.find(m => m.value === selectedRatioMetric)!;

  // Render financial ratios chart
  const renderFinancialRatiosChart = () => {
    console.log('[Compare] renderFinancialRatiosChart called', {
      alignedRatiosLen: alignedRatios.length,
      selectedMetric: selectedRatioMetric,
    });

    if (alignedRatios.length < 2) {
      console.log('[Compare] Not enough aligned ratios');
      return null;
    }

    const metricY = alignedRatios.map(d => d.ratioY[selectedRatioMetric] as number).filter(v => v != null && isFinite(v));
    const metricX = alignedRatios.map(d => d.ratioX[selectedRatioMetric] as number).filter(v => v != null && isFinite(v));

    console.log('[Compare] Metric values:', {
      metric: selectedRatioMetric,
      metricYRaw: alignedRatios.map(d => d.ratioY[selectedRatioMetric]),
      metricXRaw: alignedRatios.map(d => d.ratioX[selectedRatioMetric]),
      metricYFiltered: metricY,
      metricXFiltered: metricX,
    });

    if (metricY.length < 2 || metricX.length < 2) {
      console.log('[Compare] Insufficient metric data after filtering');
      return (
        <div className="flex items-center justify-center h-32 text-text-secondary text-sm">
          Insufficient data for {currentMetricInfo.label}
        </div>
      );
    }

    // Filter aligned data to only include valid values
    const validData = alignedRatios.filter(d => {
      const vY = d.ratioY[selectedRatioMetric] as number;
      const vX = d.ratioX[selectedRatioMetric] as number;
      return vY != null && isFinite(vY) && vX != null && isFinite(vX);
    });

    console.log('[Compare] Valid data points:', validData.length);

    if (validData.length < 2) return null;

    const valuesY = validData.map(d => d.ratioY[selectedRatioMetric] as number);
    const valuesX = validData.map(d => d.ratioX[selectedRatioMetric] as number);

    const allValues = [...valuesY, ...valuesX];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    console.log('[Compare] Chart values:', { minVal, maxVal, valuesY, valuesX });

    const financialChartHeight = 160;

    const scaleY = (val: number) => {
      const range = maxVal - minVal || 1;
      return financialChartHeight - 30 - ((val - minVal) / range) * (financialChartHeight - 50);
    };

    const scaleX = (idx: number) => {
      return padding + (idx / (validData.length - 1)) * (chartWidth - padding - rightPadding);
    };

    const pathY = validData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.ratioY[selectedRatioMetric] as number)}`
    ).join(' ');

    const pathX = validData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.ratioX[selectedRatioMetric] as number)}`
    ).join(' ');

    // Find min/max indices
    const yMinIdx = valuesY.reduce((minIdx, v, i, arr) => v < arr[minIdx] ? i : minIdx, 0);
    const yMaxIdx = valuesY.reduce((maxIdx, v, i, arr) => v > arr[maxIdx] ? i : maxIdx, 0);
    const xMinIdx = valuesX.reduce((minIdx, v, i, arr) => v < arr[minIdx] ? i : minIdx, 0);
    const xMaxIdx = valuesX.reduce((maxIdx, v, i, arr) => v > arr[maxIdx] ? i : maxIdx, 0);

    // Format value based on metric type
    const formatValue = (val: number) => {
      if (currentMetricInfo.format === 'percent') {
        return `${(val * 100).toFixed(1)}%`;
      }
      return val.toFixed(2);
    };

    // Current values
    const currentRatioIdx = ratiosCrosshairIndex !== null ? ratiosCrosshairIndex : validData.length - 1;
    const currentRatioData = validData[currentRatioIdx];

    return (
      <svg
        width={chartWidth}
        height={financialChartHeight}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - padding;
          const chartAreaWidth = chartWidth - padding - rightPadding;
          if (x >= 0 && x <= chartAreaWidth && validData.length > 0) {
            const index = Math.round((x / chartAreaWidth) * (validData.length - 1));
            setRatiosCrosshairIndex(Math.max(0, Math.min(index, validData.length - 1)));
          }
        }}
        onMouseLeave={() => setRatiosCrosshairIndex(null)}
        className="cursor-crosshair"
      >
        <rect width={chartWidth} height={financialChartHeight} fill={COLORS.bg} />

        {/* Grid */}
        {[0, 1, 2, 3].map(i => (
          <line
            key={i}
            x1={padding}
            y1={20 + i * ((financialChartHeight - 50) / 3)}
            x2={chartWidth - rightPadding}
            y2={20 + i * ((financialChartHeight - 50) / 3)}
            stroke={COLORS.grid}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {[0, 1, 2, 3].map(i => {
          const val = maxVal - (i / 3) * (maxVal - minVal);
          return (
            <text key={i} x={chartWidth - rightPadding + 5} y={24 + i * ((financialChartHeight - 50) / 3)} fill={COLORS.text} fontSize={9}>
              {formatValue(val)}
            </text>
          );
        })}

        {/* Axis label */}
        <text x={5} y={financialChartHeight / 2} fill={COLORS.text} fontSize={9} transform={`rotate(-90, 12, ${financialChartHeight / 2})`} textAnchor="middle">
          {currentMetricInfo.label}
        </text>

        {/* Lines */}
        <path d={pathY} fill="none" stroke={COLORS.financialY} strokeWidth={2} />
        <path d={pathX} fill="none" stroke={COLORS.financialX} strokeWidth={2} />

        {/* Data points */}
        {validData.map((d, i) => (
          <g key={i}>
            <circle cx={scaleX(i)} cy={scaleY(d.ratioY[selectedRatioMetric] as number)} r={4} fill={COLORS.financialY} />
            <circle cx={scaleX(i)} cy={scaleY(d.ratioX[selectedRatioMetric] as number)} r={4} fill={COLORS.financialX} />
          </g>
        ))}

        {/* Min/Max markers */}
        {showMinMax && (
          <>
            <polygon
              points={`${scaleX(yMinIdx)},${scaleY(valuesY[yMinIdx]) + 5} ${scaleX(yMinIdx) - 5},${scaleY(valuesY[yMinIdx]) + 12} ${scaleX(yMinIdx) + 5},${scaleY(valuesY[yMinIdx]) + 12}`}
              fill={COLORS.financialY}
            />
            <polygon
              points={`${scaleX(yMaxIdx)},${scaleY(valuesY[yMaxIdx]) - 5} ${scaleX(yMaxIdx) - 5},${scaleY(valuesY[yMaxIdx]) - 12} ${scaleX(yMaxIdx) + 5},${scaleY(valuesY[yMaxIdx]) - 12}`}
              fill={COLORS.financialY}
            />
            <polygon
              points={`${scaleX(xMinIdx)},${scaleY(valuesX[xMinIdx]) + 5} ${scaleX(xMinIdx) - 5},${scaleY(valuesX[xMinIdx]) + 12} ${scaleX(xMinIdx) + 5},${scaleY(valuesX[xMinIdx]) + 12}`}
              fill={COLORS.financialX}
            />
            <polygon
              points={`${scaleX(xMaxIdx)},${scaleY(valuesX[xMaxIdx]) - 5} ${scaleX(xMaxIdx) - 5},${scaleY(valuesX[xMaxIdx]) - 12} ${scaleX(xMaxIdx) + 5},${scaleY(valuesX[xMaxIdx]) - 12}`}
              fill={COLORS.financialX}
            />
          </>
        )}

        {/* Crosshair */}
        {ratiosCrosshairIndex !== null && (
          <line
            x1={scaleX(ratiosCrosshairIndex)}
            y1={20}
            x2={scaleX(ratiosCrosshairIndex)}
            y2={financialChartHeight - 30}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        )}

        {/* Legend */}
        <rect x={padding + 5} y={5} width={220} height={32} fill="rgba(0,0,0,0.7)" rx={3} />
        <rect x={padding + 10} y={10} width={10} height={10} fill={COLORS.financialY} />
        <text x={padding + 25} y={18} fill={COLORS.financialY} fontSize={10}>
          {symbolY}: {currentRatioData ? formatValue(currentRatioData.ratioY[selectedRatioMetric] as number) : '--'}
        </text>
        <rect x={padding + 10} y={22} width={10} height={10} fill={COLORS.financialX} />
        <text x={padding + 25} y={30} fill={COLORS.financialX} fontSize={10}>
          {symbolX}: {currentRatioData ? formatValue(currentRatioData.ratioX[selectedRatioMetric] as number) : '--'}
        </text>

        {/* Year label in legend */}
        <text x={padding + 150} y={24} fill={COLORS.text} fontSize={10}>
          {currentRatioData?.year ?? '--'}
        </text>

        {/* X axis (years) */}
        {validData.map((d, i) => (
          <text
            key={i}
            x={scaleX(i)}
            y={financialChartHeight - 8}
            fill={COLORS.text}
            fontSize={9}
            textAnchor="middle"
          >
            {d.year}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-bg-primary overflow-auto">
      {/* Header Controls */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-border bg-bg-secondary flex-wrap">
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
          className="px-2 py-1 text-xs bg-bg-tertiary border border-border rounded text-text-primary focus:outline-none focus:border-accent-blue"
        >
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="6M">6 Months</option>
          <option value="1Y">1 Year</option>
          <option value="2Y">2 Years</option>
          <option value="5Y">5 Years</option>
        </select>

        <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showRegression}
            onChange={(e) => setShowRegression(e.target.checked)}
            className="w-3 h-3 accent-accent-blue"
          />
          Regression
        </label>

        <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showCorrelation}
            onChange={(e) => setShowCorrelation(e.target.checked)}
            className="w-3 h-3 accent-accent-blue"
          />
          Correlation
        </label>

        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <span>Corr. Window (days):</span>
          <input
            type="number"
            value={corrWindowInput}
            onChange={(e) => setCorrWindowInput(e.target.value)}
            className="w-14 px-1 py-0.5 bg-bg-tertiary border border-border rounded text-text-primary text-center"
          />
          <button
            onClick={handleSetCorrWindow}
            className="px-2 py-0.5 bg-bg-tertiary border border-border rounded hover:bg-bg-secondary"
          >
            Set
          </button>
        </div>

        <div className="border-l border-border pl-4 flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showFinancialRatios}
              onChange={(e) => setShowFinancialRatios(e.target.checked)}
              className="w-3 h-3 accent-accent-blue"
            />
            Financials
          </label>
          {showFinancialRatios && (
            <select
              value={selectedRatioMetric}
              onChange={(e) => setSelectedRatioMetric(e.target.value as RatioMetric)}
              className="px-2 py-0.5 text-xs bg-bg-tertiary border border-border rounded text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {RATIO_METRICS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Symbol Selectors */}
      <div className="flex items-center gap-6 px-3 py-2 border-b border-border bg-bg-tertiary flex-wrap">
        <SymbolInput
          label="Y (buy)"
          labelColor={COLORS.y}
          value={symbolY}
          onChange={setSymbolY}
          disabled={loading}
        />
        <SymbolInput
          label="X (sell)"
          labelColor={COLORS.x}
          value={symbolX}
          onChange={setSymbolX}
          disabled={loading}
        />
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
          Min/Max Values
        </label>
      </div>

      {/* Charts */}
      <div className="flex-1 p-2 space-y-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}

        {!loading && alignedData.length === 0 && (
          <div className="flex items-center justify-center h-40 text-text-secondary text-sm">
            Enter symbols to compare
          </div>
        )}

        {!loading && alignedData.length > 0 && (
          <>
            {/* Price Chart */}
            <div className="border border-border rounded overflow-hidden">
              {renderPriceChart()}
            </div>

            {/* Ratio Chart */}
            <div className="border border-border rounded overflow-hidden">
              {renderRatioChart()}
            </div>

            {/* Correlation Chart */}
            {showCorrelation && rollingCorrelation.length > 0 && (
              <div className="border border-border rounded overflow-hidden">
                {renderCorrelationChart()}
              </div>
            )}

            {/* Regression Scatter Plot */}
            {showRegression && regressionStats && (
              <div className="border border-border rounded overflow-hidden p-2 bg-[#1a1a1a]">
                {renderScatterPlot()}
              </div>
            )}

            {/* Financial Ratios Chart */}
            {showFinancialRatios && (
              <div className="border border-border rounded overflow-hidden">
                {loadingRatios ? (
                  <div className="flex items-center justify-center h-32 bg-[#1a1a1a]">
                    <div className="w-5 h-5 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
                    <span className="ml-2 text-xs text-text-secondary">Loading historical ratios...</span>
                  </div>
                ) : alignedRatios.length > 0 ? (
                  renderFinancialRatiosChart()
                ) : (
                  <div className="flex items-center justify-center h-32 bg-[#1a1a1a] text-text-secondary text-sm">
                    No historical ratio data available
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
