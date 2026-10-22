import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, HelpCircle, Layers } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AssessmentResult } from '../types';

const AssessmentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: assessmentId } = useParams<{ id: string }>();
  const result: AssessmentResult | null = location.state?.result ?? null;
  const onRetake = () => navigate(`/assessments/${assessmentId}`);
  const onGoToMatrix = () => navigate('/skills');
  const onGoToRoadmap = () => navigate('/learning');

  if (!result) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        No result data found. <button onClick={() => navigate('/assessments')} style={{ color: 'var(--primary-400)', cursor: 'pointer' }}>Go to Assessments</button>
      </div>
    );
  }

  const isPassed = result.passed;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* Result Hero Banner */}
      <Card
        style={{
          padding: 36,
          textAlign: 'center',
          background: isPassed
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: `1.5px solid ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}
        >
          {isPassed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {isPassed ? 'Assessment Passed Successfully!' : 'Diagnostic Review Recommended'}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {result.assessmentTitle}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score Percentage</div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-subtle)' }} />
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {result.correctCount} / {result.totalQuestions}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct Questions</div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-subtle)' }} />
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-400)' }}>
              {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion Time</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24 }}>
          <Button variant="primary" onClick={onGoToRoadmap} rightIcon={<ArrowRight size={16} />}>
            View Updated Roadmap
          </Button>
          <Button variant="secondary" onClick={onGoToMatrix} leftIcon={<Layers size={16} />}>
            Explore Skill Matrix
          </Button>
          <Button variant="outline" onClick={onRetake} leftIcon={<RotateCcw size={16} />}>
            Retake Diagnostic
          </Button>
        </div>
      </Card>

      {/* Question by Question Review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Comprehensive Question Analysis & Explanations
        </h2>

        {result.questionResults.map((qr, idx) => (
          <Card
            key={idx}
            style={{
              padding: 24,
              borderLeft: `4px solid ${qr.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Question {idx + 1}
                </span>
                <Badge variant={qr.isCorrect ? 'success' : 'danger'}>
                  {qr.isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
                </Badge>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {qr.skillName} • {qr.difficulty}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.5 }}>
              {qr.questionText}
            </p>

            {/* Explanation Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--primary-400)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HelpCircle size={15} />
                <span>Technical Explanation & Concept Evidence</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                {qr.explanation}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssessmentResultPage;
