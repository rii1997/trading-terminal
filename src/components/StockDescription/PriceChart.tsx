import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import type { HistoricalPrice } from '../../types/fmp';

interface PriceChartProps {
  data: HistoricalPrice[];
  loading: boolean;
  currentPrice?: number;
}

type TimeFrame = '1Y' | 'Intraday';

export function PriceChart({ data, loading, currentPrice }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: '#252525' },
        horzLines: { color: '#252525' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 200,
      rightPriceScale: {
        borderColor: '#333333',
      },
      timeScale: {
        borderColor: '#333333',
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#4dabf7',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#4dabf7',
          width: 1,
          style: 2,
        },
      },
    });

    chartRef.current = chart;

    // Sort data by date ascending
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter to 1 year if needed
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const filteredData = timeFrame === '1Y'
      ? sortedData.filter(d => new Date(d.date) >= oneYearAgo)
      : sortedData;

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00c853',
      downColor: '#ff5252',
      borderDownColor: '#ff5252',
      borderUpColor: '#00c853',
      wickDownColor: '#ff5252',
      wickUpColor: '#00c853',
    });

    const candleData = filteredData.map(d => ({
      time: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(candleData as any);

    // Add current price line
    if (currentPrice) {
      candlestickSeries.createPriceLine({
        price: currentPrice,
        color: '#ff5252',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: '',
      });
    }

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#4dabf7',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

    const volumeData = filteredData.map(d => ({
      time: d.date,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 82, 82, 0.3)',
    }));

    volumeSeries.setData(volumeData as any);

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, timeFrame, currentPrice]);

  return (
    <div className="border-t border-b border-border">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-bg-tertiary border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary text-xs font-semibold">CHART</span>
          <button
            onClick={() => setTimeFrame('1Y')}
            className={`px-1.5 py-px text-[10px] rounded ${
              timeFrame === '1Y'
                ? 'bg-accent-blue text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            1Y
          </button>
          <button
            onClick={() => setTimeFrame('Intraday')}
            className={`px-1.5 py-px text-[10px] rounded ${
              timeFrame === 'Intraday'
                ? 'bg-accent-blue text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            1D
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-green border border-border rounded hover:bg-bg-tertiary">
            G
          </button>
          <button className="px-1.5 py-px text-[10px] bg-bg-secondary text-accent-orange border border-border rounded hover:bg-bg-tertiary">
            N
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary/80 z-10">
            <div className="w-4 h-4 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin" />
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
        {data.length === 0 && !loading && (
          <div className="h-[200px] flex items-center justify-center text-text-secondary text-xs">
            No chart data
          </div>
        )}
      </div>
    </div>
  );
}
