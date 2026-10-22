import React from 'react';

interface ActivityHeatmapProps {
  streakDays?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ streakDays = 6 }) => {
  // Generate a mock 12-week matrix (7 rows for days of week, 12 columns for weeks)
  const weeks = 12;
  const days = 7;
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  // Seed with realistic activity, highlighting the active streak
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      // Recent streak for last few days of latest week
      const isRecentStreak = w === weeks - 1 && d >= (days - streakDays);
      let level = 0;
      if (isRecentStreak) {
        level = Math.floor(Math.random() * 2) + 2; // Level 2 or 3
      } else {
        const rand = (w * 7 + d * 3) % 11;
        if (rand > 7) level = 2;
        else if (rand > 4) level = 1;
        else if (rand > 2) level = 3;
        else level = 0;
      }
      cells.push({ week: w, day: d, level });
    }
  }

  const getColor = (level: number) => {
    switch (level) {
      case 3: return 'var(--accent-emerald)';
      case 2: return 'rgba(16, 185, 129, 0.65)';
      case 1: return 'rgba(16, 185, 129, 0.3)';
      default: return 'var(--bg-surface-elevated)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Day labels column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginRight: 4 }}>
          {dayLabels.map((lbl, idx) => (
            <span key={idx} style={{ height: 12, fontSize: '9px', color: 'var(--text-muted)', lineHeight: '12px' }}>
              {lbl}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: weeks }).map((_, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Array.from({ length: days }).map((_, dIdx) => {
                const cell = cells.find(c => c.week === wIdx && c.day === dIdx);
                const lvl = cell ? cell.level : 0;
                return (
                  <div
                    key={dIdx}
                    title={`Activity Level ${lvl}`}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: getColor(lvl),
                      border: '1px solid var(--border-subtle)',
                      transition: 'transform 100ms ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Active Study & Coding Consistency</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Less</span>
          {[0, 1, 2, 3].map(l => (
            <span
              key={l}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: getColor(l),
                border: '1px solid var(--border-subtle)'
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
