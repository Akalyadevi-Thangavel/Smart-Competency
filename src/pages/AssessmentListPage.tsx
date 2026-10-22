import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, Award, CheckCircle2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { Assessment } from '../types';

const AssessmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAssessments(), api.getAssessmentAttempts()])
      .then(([asm, att]) => {
        setAssessments(asm);
        setAttempts(att);
      })
      .catch(err => console.error('[AssessmentList] Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'technical', 'aptitude', 'soft_skills'];

  const filtered = assessments.filter(a => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Competency Assessments
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Standardized diagnostic evaluations designed to test deep technical concepts, logic, and workplace communication.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? 'var(--bg-surface)' : 'transparent',
                color: selectedCategory === cat ? 'var(--primary-400)' : 'var(--text-secondary)',
                boxShadow: selectedCategory === cat ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat === 'All' ? 'All Assessments' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid-2">
        {filtered.map((asm) => {
          const pastAttempt = attempts.find(a => a.assessment_id === asm.id);
          return (
            <Card key={asm.id} interactive style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Badge variant={asm.category === 'technical' ? 'primary' : asm.category === 'aptitude' ? 'warning' : 'success'}>
                    {asm.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    <span>{asm.duration_minutes} Mins</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {asm.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
                  {asm.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Questions: <strong>{asm.total_questions}</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Passing Score: <strong>{asm.passing_score}%</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Difficulty: <strong style={{ color: 'var(--accent-amber)' }}>{asm.difficulty}</strong></span>
                </div>

                {pastAttempt && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Latest Attempt Score:</span>
                    <span style={{ fontWeight: 800, color: pastAttempt.percentage >= asm.passing_score ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {pastAttempt.percentage}% ({pastAttempt.percentage >= asm.passing_score ? 'Passed' : 'Needs Review'})
                    </span>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => navigate(`/assessments/${asm.id}`)}
                  style={{ width: '100%' }}
                  rightIcon={<ArrowRight size={16} />}
                >
                  {pastAttempt ? 'Retake Assessment' : 'Start Assessment'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AssessmentListPage;
