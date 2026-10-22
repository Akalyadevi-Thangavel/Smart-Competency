import React from 'react';

export interface RadarDataPoint {
  label: string;
  value: number; // 0 - 100
  benchmark?: number; // optional target benchmark
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  if (!data || data.length < 3) return null;

  const center = size / 2;
  const radius = center - 40;
  const angleStep = (2 * Math.PI) / data.length;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path for student's score
  const studentPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(d.value, i);
    return `${x},${y}`;
  }).join(' ');

  // Build polygon path for benchmark if present
  const hasBenchmark = data.some(d => d.benchmark !== undefined);
  const benchmarkPoints = hasBenchmark
    ? data.map((d, i) => {
        const { x, y } = getCoordinates(d.benchmark || 75, i);
        return `${x},${y}`;
      }).join(' ')
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        {/* Concentric grid rings */}
        {levels.map((level, idx) => {
          const ringPoints = data.map((_, i) => {
            const { x, y } = getCoordinates(level * 100, i);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={ringPoints}
              fill={idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis spokes from center */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark polygon (dotted) */}
        {hasBenchmark && (
          <polygon
            points={benchmarkPoints}
            fill="rgba(6, 182, 212, 0.1)"
            stroke="var(--accent-cyan)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {/* Student polygon */}
        <polygon
          points={studentPoints}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="var(--primary-500)"
          strokeWidth="2.5"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(d.value, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="var(--primary-400)"
              stroke="var(--bg-card)"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 22;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="var(--text-secondary)"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary-500)' }} />
          <span>Your Competency</span>
        </div>
        {hasBenchmark && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-cyan)' }} />
            <span>Target Role Benchmark</span>
          </div>
        )}
      </div>
    </div>
  );
};
