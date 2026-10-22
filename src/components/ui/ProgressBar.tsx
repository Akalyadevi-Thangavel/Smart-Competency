import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 8,
  color,
  showLabel = false,
  label,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const barColor = color || (clamped >= 75 ? 'var(--accent-emerald)' : clamped >= 50 ? 'var(--primary-500)' : 'var(--accent-amber)');

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ color: 'var(--text-primary)' }}>{clamped}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: height / 2,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: barColor,
            borderRadius: height / 2,
            transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
