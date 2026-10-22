import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowRight,
  Plus,
  Sparkles,
  BookOpen,
  Code2,
  MessageSquare,
  Award,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { DailyTask } from '../types';

export const DailyPlanPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState('learning');

  useEffect(() => {
    loadDailyTasks();
  }, []);

  const loadDailyTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getDailyTasks();
      setTasks(data);
    } catch (err: any) {
      showToast({ title: 'Error loading tasks', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleDailyTask(taskId);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, is_completed: res.is_completed } : t))
      );

      const willBeCompleted = res.is_completed === 1;
      const otherCompletedCount = tasks.filter(t => t.id !== taskId && t.is_completed === 1).length;
      const totalCount = tasks.length;

      if (willBeCompleted && otherCompletedCount + 1 === totalCount) {
        // Trigger celebratory confetti when all daily goals are reached
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast({
          title: 'All Daily Goals Accomplished! 🎉',
          message: 'Streak maintained! Your placement readiness index updated.',
          type: 'success'
        });
      } else if (willBeCompleted) {
        showToast({
          title: 'Goal Completed',
          message: 'Great momentum. Keep going!',
          type: 'success'
        });
      }
    } catch (err: any) {
      showToast({ title: 'Action failed', message: err.message, type: 'error' });
    }
  };

  const completedCount = tasks.filter(t => t.is_completed === 1).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code2 size={18} style={{ color: '#06b6d4' }} />;
      case 'interview':
        return <MessageSquare size={18} style={{ color: '#a855f7' }} />;
      case 'aptitude':
        return <Target size={18} style={{ color: '#f59e0b' }} />;
      case 'learning':
      default:
        return <BookOpen size={18} style={{ color: '#6366f1' }} />;
    }
  };

  const getTaskBadgeVariant = (type: string): 'primary' | 'warning' | 'outline' | 'success' => {
    switch (type) {
      case 'coding': return 'outline';
      case 'interview': return 'primary';
      case 'aptitude': return 'warning';
      default: return 'primary';
    }
  };

  const handleTaskNavigate = (link?: string) => {
    if (!link) return;
    // Normalize links
    if (link === '/learning-path') navigate('/learning');
    else if (link === '/coding-lab') navigate('/coding');
    else if (link === '/interview-prep') navigate('/interview');
    else if (link === '/aptitude') navigate('/assessments');
    else navigate(link);
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: `custom-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      task_type: newTaskType as any,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Custom student daily goal.',
      link_to_module: newTaskType === 'coding' ? '/coding' : newTaskType === 'interview' ? '/interview' : '/learning',
      is_completed: 0
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddModal(false);
    showToast({ title: 'Task Added', message: 'Added to your daily schedule.', type: 'success' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Banner: Day Streak & Motivation */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Flame size={15} />
              {profile?.learning_streak || 1} Day Streak
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Today's Competency Action Plan
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 650 }}>
            Structured daily micro-tasks targeted at closing your priority skill gaps for{' '}
            <strong style={{ color: 'var(--primary-400)' }}>
              {profile?.target_role_name || 'Full Stack Developer'}
            </strong>.
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="outline"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            <span>Add Custom Goal</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/learning')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Sparkles size={16} />
            <span>Resume Roadmap</span>
          </Button>
        </div>
      </div>

      {/* Progress Metric Card */}
      <Card style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Daily Progress
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              ({completedCount} of {tasks.length} goals completed)
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--primary-400)' }}>
            {progressPercent}%
          </span>
        </div>

        <ProgressBar
          percentage={progressPercent}
          color={progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--primary-500)'}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Daily Time Target</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{profile?.daily_hours || 2} Hours / Day</div>
          </div>
          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Placement Readiness Impact</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-400)', marginTop: 2 }}>+3% Readiness Boost</div>
          </div>
          <div style={{ padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: 2 }}>
              {progressPercent === 100 ? 'Done for Today ✨' : 'In Progress 🔥'}
            </div>
          </div>
        </div>
      </Card>

      {/* Task Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Curated Tasks for Today
        </h2>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading daily schedule…
          </div>
        ) : tasks.length === 0 ? (
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <CalendarCheck size={36} style={{ color: 'var(--primary-400)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No tasks scheduled</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Click "Add Custom Goal" above to define what you want to achieve today!
            </p>
          </Card>
        ) : (
          tasks.map(task => {
            const isDone = task.is_completed === 1;
            return (
              <Card
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  cursor: 'pointer',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  backgroundColor: isDone ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {/* Interactive Checkbox */}
                <div
                  style={{
                    color: isDone ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0
                  }}
                >
                  {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>

                {/* Type Icon */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getTaskIcon(task.task_type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </span>
                    <Badge variant={getTaskBadgeVariant(task.task_type) as any}>
                      {task.task_type}
                    </Badge>
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: 4,
                      lineHeight: 1.4
                    }}
                  >
                    {task.description}
                  </p>
                </div>

                {/* Quick Launch CTA */}
                {task.link_to_module && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskNavigate(task.link_to_module);
                    }}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Launch</span>
                    <ArrowRight size={14} />
                  </Button>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: Add Custom Task */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
          onClick={() => setShowAddModal(false)}
        >
          <Card
            style={{ width: '100%', maxWidth: 480, padding: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16 }}>
              Add Custom Daily Goal
            </h3>

            <form onSubmit={handleAddCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master SQL Indexing & Query Plans"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="learning">Roadmap & Theory (Learning)</option>
                  <option value="coding">Problem Solving (Coding Lab)</option>
                  <option value="interview">Mock Interview (Behavioral / Technical)</option>
                  <option value="aptitude">Aptitude & Logic</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific focus or time allocation..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Goal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DailyPlanPage;
