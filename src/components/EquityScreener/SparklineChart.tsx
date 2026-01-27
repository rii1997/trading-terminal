import { useMemo } from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparklineChart({
  data,
  width = 50,
  height = 20,
  color,
}: SparklineChartProps) {
  const { path, fillPath, lineColor } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', fillPath: '', lineColor: '#6b7280' };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate points
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    // Create line path
    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' ');

    // Create fill path (close the shape)
    const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    // Determine color based on trend (first vs last)
    const trend = data[data.length - 1] - data[0];
    const lineColor = color || (trend >= 0 ? '#22c55e' : '#ef4444');

    return { path: linePath, fillPath, lineColor };
  }, [data, width, height, color]);

  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#6b7280"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  return (
    <svg width={width} height={height}>
      {/* Fill area */}
      <path
        d={fillPath}
        fill={lineColor}
        fillOpacity="0.1"
      />
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
