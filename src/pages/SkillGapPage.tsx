import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SkillGapItem } from '../types';

const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const onNavigate = navigate;
  const { profile } = useAuth();
  const [gaps, setGaps] = useState<SkillGapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkillGaps()
      .then(setGaps)
      .catch(err => console.error('[SkillGap] Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalEffortHours = gaps.reduce((acc, g) => acc + g.estimatedHours, 0);
  const criticalGaps = gaps.filter(g => g.priority === 'Critical');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant="danger" dot>Skill Gap Analyzer</Badge>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Target: {profile?.target_role_name || 'Full Stack Developer'}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Target Role Skill Gaps
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Intelligent delta analysis comparing your verified competencies against industry hiring benchmarks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Card style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{criticalGaps.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical Gaps</div>
            </div>
          </Card>

          <Card style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalEffortHours} hrs</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Study</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Gaps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {gaps.map((item) => (
          <Card key={item.skillId} style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.skillName}
                  </h3>
                  <Badge variant={item.priority === 'Critical' ? 'danger' : item.priority === 'High' ? 'warning' : 'outline'}>
                    {item.priority} Priority
                  </Badge>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 800 }}>
                  {item.reason}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.gapPercentage > 30 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                  {item.gapPercentage}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Competency Gap</div>
              </div>
            </div>

            {/* Comparison Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18, backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Verified Level: <strong>{item.currentLevel}</strong></span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.currentScore}%</span>
                </div>
                <ProgressBar percentage={item.currentScore} height={6} color="var(--primary-500)" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Benchmark: <strong>{item.targetLevel}</strong></span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.targetScore}%</span>
                </div>
                <ProgressBar percentage={item.targetScore} height={6} color="var(--accent-cyan)" />
              </div>
            </div>

            {/* Actionable Next Step */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                <BookOpen size={16} color="var(--primary-400)" />
                <span style={{ color: 'var(--text-secondary)' }}>Recommended Next Action:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.recommendedAction}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Est. Effort: <strong>{item.estimatedHours} Hours</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('/learning')}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Start Module
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default SkillGapPage;
