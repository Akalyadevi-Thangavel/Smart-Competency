import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, CheckCircle2, AlertCircle, HelpCircle, History } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { InterviewQuestion } from '../types';

export const InterviewPrepPage: React.FC = () => {
  const { showToast, triggerCelebration } = useNotification();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [category, setCategory] = useState<string>('All');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
    loadHistory();
  }, [category]);

  const loadQuestions = async () => {
    try {
      const data = await api.getInterviewQuestions(category === 'All' ? undefined : category);
      setQuestions(data);
      if (data.length > 0 && !selectedQuestion) {
        setSelectedQuestion(data[0]);
      }
    } catch (err: any) {
      console.error('[InterviewPrep] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getInterviewHistory();
      setHistory(data);
    } catch (err) {
      console.warn('[InterviewPrep] Could not load history');
    }
  };

  const handleSelectQuestion = (q: InterviewQuestion) => {
    setSelectedQuestion(q);
    setStudentAnswer('');
    setEvaluation(null);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !studentAnswer.trim()) {
      showToast({ title: 'Input required', message: 'Please type your answer or explanation.', type: 'warning' });
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await api.evaluateInterviewAnswer(selectedQuestion.id, studentAnswer);
      setEvaluation(res.evaluation);
      if (res.evaluation.score >= 75) {
        triggerCelebration();
        showToast({ title: 'Strong Interview Response!', message: `AI Score: ${res.evaluation.score}/100.`, type: 'success' });
      } else {
        showToast({ title: 'Feedback Generated', message: 'Review constructive critique to strengthen your articulation.', type: 'info' });
      }
      loadHistory();
    } catch (err: any) {
      showToast({ title: 'Evaluation error', message: err.message, type: 'error' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const categories = ['All', 'Technical', 'Behavioral', 'HR'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant="primary" dot>AI Interview Simulator</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>STAR & Technical Evaluation</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mock Interview Preparation
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Practice answering real campus placement interview questions and receive instant AI feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant={activeTab === 'practice' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('practice')}
            leftIcon={<MessageSquare size={14} />}
          >
            Practice Lab
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('history')}
            leftIcon={<History size={14} />}
          >
            History ({history.length})
          </Button>
        </div>
      </div>

      {activeTab === 'practice' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
          {/* Question List Sidebar */}
          <Card style={{ padding: 18, height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: category === c ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                    color: category === c ? 'var(--primary-400)' : 'var(--text-secondary)',
                    border: `1px solid ${category === c ? 'var(--border-medium)' : 'transparent'}`,
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuestion(q)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Badge variant="outline">{q.category}</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                      {q.question_text.length > 70 ? q.question_text.substring(0, 70) + '...' : q.question_text}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Question Prompt & Answer Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {selectedQuestion ? (
              <>
                <Card style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Badge variant="primary">{selectedQuestion.category} Question</Badge>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty: {selectedQuestion.difficulty}</span>
                  </div>

                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 14 }}>
                    {selectedQuestion.question_text}
                  </h2>

                  {/* Key points to cover */}
                  {selectedQuestion.key_points && selectedQuestion.key_points.length > 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Recruiters Look For:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {selectedQuestion.key_points.map((kp, i) => (
                          <Badge key={i} variant="outline">{kp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Answer Area */}
                <Card title="Your Response" subtitle="Speak or type your structured answer (use STAR method for behavioral)">
                  <textarea
                    rows={8}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Type your response here. Articulate your architectural choices, metrics, or personal experiences clearly..."
                    style={{ width: '100%', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: 14 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <Button
                      variant="primary"
                      onClick={handleSubmitAnswer}
                      isLoading={isEvaluating}
                      leftIcon={<Sparkles size={16} />}
                    >
                      Submit for AI Evaluation
                    </Button>
                  </div>
                </Card>

                {/* AI Evaluation Result */}
                {evaluation && (
                  <Card style={{ padding: 24, border: '1.5px solid rgba(99, 102, 241, 0.3)', backgroundColor: 'rgba(99, 102, 241, 0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={20} color="var(--primary-400)" />
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          AI Interview Feedback
                        </h3>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: evaluation.score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {evaluation.score} / 100
                      </div>
                    </div>

                    <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      {evaluation.feedback}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                      <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={14} /> Key Strengths
                        </div>
                        <ul style={{ paddingLeft: 18, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          {evaluation.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertCircle size={14} /> Missing Points to Include
                        </div>
                        <ul style={{ paddingLeft: 18, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          {evaluation.missingKeyPoints?.map((m: string, i: number) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card style={{ padding: 48, textAlign: 'center' }}>
                <p>Select a question from the left sidebar to practice.</p>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {history.length === 0 ? (
            <Card style={{ padding: 48, textAlign: 'center' }}>
              <p>No mock interview attempts recorded yet.</p>
            </Card>
          ) : (
            history.map((h) => (
              <Card key={h.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <Badge variant="outline">{h.category}</Badge>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                      {h.question_text}
                    </h3>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: h.ai_score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {h.ai_score} / 100
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {h.ai_feedback}
                </p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPage;
