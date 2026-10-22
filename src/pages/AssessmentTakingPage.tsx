import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Flag, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Assessment, Question, AssessmentResult } from '../types';

const AssessmentTakingPage: React.FC = () => {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const onCancel = () => navigate('/assessments');
  const onFinish = (result: AssessmentResult) => navigate(`/assessments/${assessmentId}/result`, { state: { result } });
  const { showToast, triggerCelebration } = useNotification();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssessmentById(assessmentId)
      .then((data) => {
        setAssessment(data.assessment);
        setQuestions(data.questions);
        setTimeLeft(data.assessment.duration_minutes * 60);
      })
      .catch((err) => {
        showToast({ title: 'Error loading assessment', message: err.message, type: 'error' });
        onCancel();
      })
      .finally(() => setLoading(false));
  }, [assessmentId, onCancel, showToast]);

  // Countdown timer
  useEffect(() => {
    if (loading || !assessment) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, assessment]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (!currentQ) return;
    if (currentQ.question_type === 'multiple_select') {
      const existing = (answers[currentQ.id] || []) as number[];
      const updated = existing.includes(optIndex)
        ? existing.filter(i => i !== optIndex)
        : [...existing, optIndex];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: optIndex });
    }
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleSubmitFinal = async () => {
    if (isSubmitting || !assessment) return;
    setIsSubmitting(true);
    const timeSpent = (assessment.duration_minutes * 60) - timeLeft;

    try {
      const result = await api.submitAssessment(assessment.id, answers, timeSpent);
      triggerCelebration();
      showToast({
        title: 'Assessment Submitted!',
        message: `You scored ${result.percentage}%. Your skill matrix has been updated.`,
        type: 'success'
      });
      onFinish(result);
    } catch (err: any) {
      showToast({ title: 'Submission error', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (loading || !currentQ || !assessment) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--primary-500)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading assessment environment...</p>
      </div>
    );
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Assessment Header Bar */}
      <Card style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant="primary">{assessment.category.toUpperCase()}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
            {assessment.title}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Timer Display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: timeLeft < 300 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface-elevated)',
              color: timeLeft < 300 ? 'var(--accent-rose)' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '1.1rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Clock size={18} />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <Button variant="primary" onClick={() => setShowConfirmModal(true)}>
            Finish & Submit
          </Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Question & Options Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase' }}>
                  {currentQ.skill_name || 'Technical Domain'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                  {currentQ.difficulty} ({currentQ.points} Pts)
                </span>
              </div>

              <button
                onClick={handleToggleFlag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: flagged[currentQ.id] ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: flagged[currentQ.id] ? 'var(--accent-amber)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Flag size={14} />
                <span>{flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 28 }}>
              {currentQ.question_text}
            </div>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentQ.question_type === 'multiple_select'
                  ? ((answers[currentQ.id] || []) as number[]).includes(optIdx)
                  : answers[currentQ.id] === optIdx;

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: currentQ.question_type === 'multiple_select' ? 4 : '50%',
                        border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--text-muted)'}`,
                        backgroundColor: isSelected ? 'var(--primary-500)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {isSelected && (currentQ.question_type === 'multiple_select' ? '✓' : '•')}
                    </div>
                    <span style={{ fontSize: '0.95rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Autosaved locally
              </span>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Question Navigator Sidebar */}
        <Card style={{ padding: 20, height: 'fit-content' }}>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Question Navigator
          </h4>
          <div style={{ marginBottom: 16 }}>
            <ProgressBar percentage={progressPercent} height={6} showLabel label={`${answeredCount}/${questions.length} Answered`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = flagged[q.id];
              const isCurrent = currentIndex === idx;

              let bg = 'var(--bg-surface-elevated)';
              let border = 'var(--border-subtle)';
              let color = 'var(--text-secondary)';

              if (isCurrent) {
                border = 'var(--primary-500)';
                bg = 'rgba(99, 102, 241, 0.2)';
                color = 'var(--primary-400)';
              } else if (isAnswered) {
                bg = 'rgba(16, 185, 129, 0.2)';
                border = 'rgba(16, 185, 129, 0.4)';
                color = 'var(--accent-emerald)';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: bg,
                    border: `1.5px solid ${border}`,
                    color,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-amber)'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(16, 185, 129, 0.4)' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(245, 158, 11, 0.8)' }} />
              <span>Flagged for Review ({Object.values(flagged).filter(Boolean).length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--bg-surface-elevated)' }} />
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Assessment"
        subtitle="Please confirm your answers before final grading"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Keep Working
            </Button>
            <Button variant="primary" onClick={handleSubmitFinal} isLoading={isSubmitting}>
              Confirm & Submit Assessment
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
            {questions.length - answeredCount > 0 && (
              <span style={{ display: 'block', color: 'var(--accent-amber)', marginTop: 8 }}>
                <AlertTriangle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                You have {questions.length - answeredCount} unanswered questions remaining.
              </span>
            )}
          </p>
          <div style={{ padding: 14, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Once submitted, your answers will be permanently evaluated, recalculating your Skill Matrix and Placement Readiness indicators.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentTakingPage;
