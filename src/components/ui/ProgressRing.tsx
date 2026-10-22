import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 10,
  primaryColor = '#6366f1',
  secondaryColor = '#06b6d4',
  label,
  sublabel,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const gradientId = `ring-grad-${Math.random().toString(36).substring(7)}`;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Animated fill circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {clamped}%
        </span>
        {label && (
          <span style={{ fontSize: Math.max(10, size * 0.085), fontWeight: 600, color: 'var(--text-secondary)', marginTop: -2 }}>
            {label}
          </span>
        )}
      </div>
      {sublabel && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
};
