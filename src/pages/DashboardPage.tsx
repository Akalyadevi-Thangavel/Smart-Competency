import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bot,
  FileCheck,
  Code2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { SkillGapItem, DailyTask, PlacementReadiness } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const onNavigate = navigate;
  const { profile } = useAuth();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
      setDailyTasks(data.dailyTasks || []);
    } catch (err: any) {
      console.error('[Dashboard] Error loading data:', err);
      showToast({ title: 'Error loading dashboard', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.toggleDailyTask(taskId);
      setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: res.is_completed } : t));
    } catch (err: any) {
      showToast({ title: 'Task update error', message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ height: 120, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)' }} className="animate-spin" />
      </div>
    );
  }

  const readiness: PlacementReadiness = dashboardData?.placementReadiness;
  const targetRoleName = profile?.target_role_name || dashboardData?.profile?.target_role_name || 'Full Stack Developer';
  const topGaps: SkillGapItem[] = dashboardData?.skillGaps || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Badge variant="primary" dot>
              {targetRoleName} Track
            </Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {profile?.college || 'Apex Institute of Technology'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
            Your continuous preparation streak is currently at <strong>{profile?.learning_streak || 6} days</strong>. Focus on closing your <strong>{topGaps[0]?.skillName || 'System Design'}</strong> gap today to advance closer to placement benchmark standards.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="primary" onClick={() => onNavigate('/learning')} rightIcon={<ArrowRight size={16} />}>
            Resume Learning Path
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('/coding')} leftIcon={<Code2 size={16} />}>
            Coding Lab
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid-4">
        {/* Placement Readiness Ring */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, textAlign: 'center' }}>
          <ProgressRing
            percentage={readiness?.overallReadiness || 74}
            size={110}
            strokeWidth={9}
            primaryColor="#6366f1"
            secondaryColor="#06b6d4"
            label="Ready"
          />
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Placement Readiness
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {readiness?.status || 'Developing Competency'}
          </span>
        </Card>

        {/* Technical Competency */}
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Competency</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {profile?.overall_competency || 72.4}%
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <ProgressBar percentage={profile?.overall_competency || 72} height={6} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              <span>Target Benchmark: 80%</span>
              <span style={{ color: 'var(--accent-emerald)' }}>+4.2% this week</span>
            </div>
          </div>
        </Card>

        {/* Skill Gaps Identified */}
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Skill Gaps</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {dashboardData?.totalGapsCount || 3} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>topics</span>
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Primary: <strong style={{ color: 'var(--text-primary)' }}>{topGaps[0]?.skillName || 'System Design'}</strong>
            </span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <Badge variant="danger">{topGaps[0]?.gapPercentage || 38}% Gap</Badge>
              <Badge variant="warning">{topGaps[0]?.estimatedHours || 12} hrs effort</Badge>
            </div>
          </div>
        </Card>

        {/* Study Habit & Streak */}
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weekly Study Volume</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {profile?.weekly_hours || 14.5} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
              <Flame size={20} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Daily Consistency: <strong>{profile?.learning_streak || 6} Days Streak</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Paced for {profile?.daily_hours || 2.5} hrs / day target
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Dashboard Grid */}
      <div className="grid-dashboard">
        {/* Left Column: AI Recommendation, Today's Plan, Activity Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Career Coach Recommendation Card */}
          {dashboardData?.aiRecommendation && (
            <Card
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                border: '1.5px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Bot size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-400)', letterSpacing: '0.08em' }}>
                      AI Career Coach Diagnostic Insight
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {dashboardData.aiRecommendation.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                    {dashboardData.aiRecommendation.description}
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate(dashboardData.aiRecommendation.actionLink)}
                      rightIcon={<ArrowRight size={14} />}
                    >
                      {dashboardData.aiRecommendation.actionText}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('/ai-coach')}
                      leftIcon={<Sparkles size={14} />}
                    >
                      Ask AI Coach
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Today's Action Checklist */}
          <Card
            title="Today's Priority Action Plan"
            subtitle={`${dailyTasks.filter(t => t.is_completed).length} of ${dailyTasks.length} tasks completed`}
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/dashboard')}>
                View Full Plan
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dailyTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: t.is_completed ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${t.is_completed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ color: t.is_completed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {t.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: t.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: t.is_completed ? 'line-through' : 'none'
                      }}
                    >
                      {t.title}
                    </div>
                    {t.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {t.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {t.task_type}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Practice & Consistency Heatmap */}
          <Card
            title="Practice & Coding Consistency"
            subtitle="12-Week activity contribution log"
          >
            <ActivityHeatmap streakDays={profile?.learning_streak || 6} />
          </Card>
        </div>

        {/* Right Column: Top Skill Gaps, Roadmap Progress, Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Priority Skill Gaps */}
          <Card
            title="Top Role Skill Gaps"
            subtitle={`Target: ${targetRoleName}`}
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/skills')}>
                Matrix
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topGaps.map((gap) => (
                <div key={gap.skillId} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {gap.skillName}
                    </span>
                    <Badge variant={gap.priority === 'Critical' ? 'danger' : 'warning'}>
                      {gap.gapPercentage}% Gap
                    </Badge>
                  </div>
                  <ProgressBar percentage={100 - gap.gapPercentage} height={6} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Current: {gap.currentLevel}</span>
                    <span>Target: {gap.targetLevel}</span>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('/roles')}
                style={{ width: '100%', marginTop: 6 }}
              >
                Explore Role Compatibility
              </Button>
            </div>
          </Card>

          {/* Placement Dimensions Snapshot */}
          <Card
            title="Readiness Dimensions"
            subtitle="Transparent composite indicators"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/skill-gap')}>
                Details
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {readiness && Object.entries(readiness.dimensions).slice(0, 5).map(([key, dim]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{dim.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80 }}>
                      <ProgressBar percentage={dim.score} height={5} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', width: 32, textAlign: 'right' }}>
                      {dim.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Module Launchers */}
          <Card title="Quick Practice Launchers">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('/resume')} leftIcon={<FileCheck size={14} />}>
                Resume ATS
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('/interview')} leftIcon={<Sparkles size={14} />}>
                Mock Interview
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('/projects')} leftIcon={<Target size={14} />}>
                Add Project
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('/leaderboard')} leftIcon={<TrendingUp size={14} />}>
                Leaderboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
