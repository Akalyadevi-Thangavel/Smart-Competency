import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ExternalLink, BookOpen, Layers, Award, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { LearningItem } from '../types';

const LearningRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const onNavigate = navigate;
  const { showToast, triggerCelebration } = useNotification();

  const [pathData, setPathData] = useState<any>(null);
  const [groupedByPhase, setGroupedByPhase] = useState<Record<string, LearningItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await api.getLearningPath();
      setPathData(data);
      setGroupedByPhase(data.groupedByPhase || {});
    } catch (err: any) {
      console.error('[Roadmap] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      const res = await api.toggleLearningItem(itemId);
      if (res.is_completed === 1) {
        showToast({ title: 'Module Completed!', message: 'Great job maintaining your learning momentum.', type: 'success' });
      }
      loadRoadmap();
    } catch (err: any) {
      showToast({ title: 'Error updating milestone', message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--primary-500)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading roadmap...</p>
      </div>
    );
  }

  const phases = ['Foundation', 'Core Skills', 'Intermediate Skills', 'Advanced Skills', 'Projects', 'Interview Prep', 'Placement Readiness'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Overall Roadmap Progress */}
      <Card style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Badge variant="primary">Personalized Roadmap</Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pathData?.path?.role_name || 'Full Stack Developer'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {pathData?.path?.title || 'Engineering Career Roadmap'}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-400)' }}>
              {pathData?.progressPercentage || 0}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {pathData?.completedItems || 0} of {pathData?.totalItems || 0} Milestones Complete
            </div>
          </div>
        </div>

        <ProgressBar percentage={pathData?.progressPercentage || 0} height={8} />
      </Card>

      {/* Visual Roadmap Progression by Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {phases.map((phase, pIdx) => {
          const items = groupedByPhase[phase] || [];
          if (items.length === 0) return null;
          const isPhaseCompleted = items.every(i => i.is_completed === 1);

          return (
            <div key={phase} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isPhaseCompleted ? 'var(--accent-emerald)' : 'var(--bg-surface-elevated)',
                    color: isPhaseCompleted ? '#ffffff' : 'var(--primary-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: '1.5px solid var(--border-medium)'
                  }}
                >
                  {isPhaseCompleted ? '✓' : pIdx + 1}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Phase {pIdx + 1}: {phase}
                </h2>
                {isPhaseCompleted && (
                  <Badge variant="success">Phase Mastered</Badge>
                )}
              </div>

              {/* Items in this phase */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 44 }}>
                {items.map((item) => (
                  <Card
                    key={item.id}
                    style={{
                      padding: 20,
                      backgroundColor: item.is_completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                      border: `1px solid ${item.is_completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <button
                          onClick={() => handleToggleItem(item.id)}
                          style={{
                            marginTop: 2,
                            color: item.is_completed ? 'var(--accent-emerald)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                          title={item.is_completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {item.is_completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </button>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h3
                              style={{
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                color: item.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: item.is_completed ? 'line-through' : 'none'
                              }}
                            >
                              {item.title}
                            </h3>
                            {item.skill_name && (
                              <Badge variant="outline">{item.skill_name}</Badge>
                            )}
                          </div>

                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                            {item.description}
                          </p>

                          {item.practice_task && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--primary-400)', backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '4px 10px', borderRadius: 4 }}>
                              <BookOpen size={14} />
                              <span>Practice Lab: {item.practice_task}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <Clock size={13} />
                          <span>{item.estimated_minutes} mins</span>
                        </div>

                        <Button
                          variant={item.is_completed ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleItem(item.id)}
                        >
                          {item.is_completed ? 'Completed' : 'Mark as Done'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LearningRoadmapPage;
