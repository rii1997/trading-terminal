import { useRef, useEffect, useState } from 'react';

interface MetricChartProps {
  symbol: string;
  metricLabel: string;
  data: { period: string; value: number }[];
  isPercentage?: boolean;
}

export function MetricChart({ symbol, metricLabel, data, isPercentage }: MetricChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chart margins
  const margin = { top: 20, right: 60, bottom: 50, left: 80 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Format value for display
  const formatValue = (value: number) => {
    if (isPercentage) {
      return (value * 100).toFixed(1) + '%';
    }
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B';
    }
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(2) + 'K';
    }
    return value.toFixed(2);
  };

  // Format axis value (shorter)
  const formatAxisValue = (value: number) => {
    if (isPercentage) {
      return (value * 100).toFixed(0) + '%';
    }
    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B';
    }
    if (Math.abs(value) >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1e3) {
      return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  // Calculate stats
  const values = data.map(d => d.value);
  const latest = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Calculate scales
  const yMin = Math.min(min, 0);
  const yMax = max;
  const yPadding = (yMax - yMin) * 0.1 || 1;
  const yScale = (value: number) => {
    const range = (yMax + yPadding) - (yMin - yPadding);
    return chartHeight - ((value - (yMin - yPadding)) / range) * chartHeight;
  };

  // Bar width with padding
  const barPadding = 0.2;
  const barWidth = (chartWidth / data.length) * (1 - barPadding);
  const barOffset = (chartWidth / data.length) * (barPadding / 2);

  const xScale = (index: number) => {
    return (index / data.length) * chartWidth + barOffset;
  };

  // Zero line Y position
  const zeroLineY = yScale(0);

  // Generate Y-axis ticks
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => {
    const value = (yMin - yPadding) + ((yMax + yPadding) - (yMin - yPadding)) * (i / (yTickCount - 1));
    return value;
  }).reverse();

  // Generate X-axis ticks (show every nth label based on data length)
  const maxXLabels = Math.floor(chartWidth / 50);
  const xTickInterval = Math.max(1, Math.ceil(data.length / maxXLabels));

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-text-primary font-semibold">{symbol} - {metricLabel}</h2>
        <div className="flex gap-6 mt-2 text-sm">
          <div>
            <span className="text-text-secondary">Latest: </span>
            <span className="text-text-primary font-mono">{formatValue(latest)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Min: </span>
            <span className="text-text-primary font-mono">{formatValue(min)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Max: </span>
            <span className="text-text-primary font-mono">{formatValue(max)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Avg: </span>
            <span className="text-text-primary font-mono">{formatValue(avg)}</span>
          </div>
          <div className="ml-auto">
            <span className="text-text-secondary">Periods: </span>
            <span className="text-text-primary font-mono">{data.length}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1 min-h-[200px]">
        <svg width={dimensions.width} height={dimensions.height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={i}
                x1={0}
                y1={yScale(tick)}
                x2={chartWidth}
                y2={yScale(tick)}
                stroke="#333"
                strokeDasharray="2,2"
              />
            ))}

            {/* Zero line (if in range) */}
            {yMin < 0 && yMax > 0 && (
              <line
                x1={0}
                y1={zeroLineY}
                x2={chartWidth}
                y2={zeroLineY}
                stroke="#888"
                strokeWidth={1}
              />
            )}

            {/* Bars */}
            {data.map((d, i) => {
              const barY = d.value >= 0 ? yScale(d.value) : zeroLineY;
              const barHeight = Math.abs(yScale(d.value) - zeroLineY);
              const isHovered = hoveredIndex === i;

              return (
                <rect
                  key={i}
                  x={xScale(i)}
                  y={barY}
                  width={barWidth}
                  height={barHeight || 1}
                  fill={d.value >= 0 ? '#4dabf7' : '#ff6b6b'}
                  opacity={isHovered ? 1 : 0.85}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Hover tooltip */}
            {hoveredIndex !== null && (
              <g transform={`translate(${xScale(hoveredIndex) + barWidth / 2}, ${Math.min(yScale(data[hoveredIndex].value), zeroLineY) - 10})`}>
                <rect
                  x={-50}
                  y={-40}
                  width={100}
                  height={36}
                  fill="#1a1a1a"
                  stroke="#333"
                  rx={4}
                />
                <text
                  x={0}
                  y={-23}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={11}
                >
                  {data[hoveredIndex].period}
                </text>
                <text
                  x={0}
                  y={-8}
                  textAnchor="middle"
                  fill={data[hoveredIndex].value >= 0 ? '#4dabf7' : '#ff6b6b'}
                  fontSize={12}
                  fontFamily="monospace"
                >
                  {formatValue(data[hoveredIndex].value)}
                </text>
              </g>
            )}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={-10}
                y={yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#888"
                fontSize={11}
              >
                {formatAxisValue(tick)}
              </text>
            ))}

            {/* X-axis labels */}
            {data.map((d, i) => {
              if (i % xTickInterval !== 0 && i !== data.length - 1) return null;
              return (
                <text
                  key={i}
                  x={xScale(i) + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fill="#888"
                  fontSize={10}
                >
                  {d.period}
                </text>
              );
            })}

            {/* Axis lines */}
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#444" />
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#444" />
          </g>
        </svg>
      </div>
    </div>
  );
}
