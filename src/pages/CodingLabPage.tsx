import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Search,
  Filter,
  Flame,
  Award
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { CodingProblem } from '../types';

export const CodingLabPage: React.FC = () => {
  const { showToast, triggerCelebration } = useNotification();

  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, [selectedDifficulty, search]);

  const loadProblems = async () => {
    try {
      const data = await api.getCodingProblems({
        difficulty: selectedDifficulty,
        search,
      });
      setProblems(data);
      if (data.length > 0 && !selectedProblem) {
        setSelectedProblem(data[0]);
        setCode(data[0].starter_code['javascript'] || '');
      }
    } catch (err: any) {
      console.error('[CodingLab] Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starter_code[language] || '');
    setTestResults(null);
    setShowHints(false);
  };

  const handleLanguageChange = (newLang: 'javascript' | 'python') => {
    setLanguage(newLang);
    if (selectedProblem) {
      setCode(selectedProblem.starter_code[newLang] || '');
    }
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setTestResults(null);

    try {
      const res = await api.runCode(selectedProblem.id, code, language);
      setTestResults(res);
      if (res.allPassed) {
        showToast({ title: 'Sample Tests Passed!', message: 'All test cases returned expected outputs.', type: 'success' });
      } else {
        showToast({ title: 'Test Failed', message: 'Check test case details.', type: 'warning' });
      }
    } catch (err: any) {
      showToast({ title: 'Execution Error', message: err.message, type: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitCode(selectedProblem.id, code, language);
      setTestResults(res);
      if (res.status === 'Accepted') {
        triggerCelebration();
        showToast({
          title: 'Problem Solved! (Accepted)',
          message: `Solution verified in ${res.runtime}. Competency updated!`,
          type: 'success'
        });
        loadProblems();
      } else {
        showToast({ title: 'Wrong Answer', message: 'Your solution did not satisfy all test cases.', type: 'error' });
      }
    } catch (err: any) {
      showToast({ title: 'Submission error', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
      default: return 'outline';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant="primary" dot>Algorithmic Code Lab</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Safe Sandboxed Test Suite</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Coding Lab & Algorithm Practice
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                backgroundColor: selectedDifficulty === diff ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                color: selectedDifficulty === diff ? 'var(--primary-400)' : 'var(--text-secondary)',
                border: `1px solid ${selectedDifficulty === diff ? 'var(--border-medium)' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Problems List Sidebar */}
        <Card style={{ padding: 18, height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search problem or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, fontSize: '0.825rem', height: 38 }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {problems.map((p) => {
              const isSelected = selectedProblem?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProblem(p)}
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
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                      {p.title}
                    </span>
                    <Badge variant={getDifficultyBadge(p.difficulty)}>
                      {p.difficulty}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{p.topic}</span>
                    {p.isSolved && <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Solved ✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Problem Description & IDE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedProblem ? (
            <>
              {/* Problem Details Card */}
              <Card style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {selectedProblem.title}
                      </h2>
                      <Badge variant={getDifficultyBadge(selectedProblem.difficulty)}>
                        {selectedProblem.difficulty}
                      </Badge>
                      <Badge variant="outline">{selectedProblem.topic}</Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowHints(!showHints)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.825rem',
                      color: 'var(--accent-amber)',
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  >
                    <HelpCircle size={15} />
                    <span>{showHints ? 'Hide Hints' : 'View Hints'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                  {selectedProblem.description}
                </div>

                {showHints && selectedProblem.hints && selectedProblem.hints.length > 0 && (
                  <div style={{ padding: 14, backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 4 }}>Algorithmic Hints:</div>
                    <ul style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {selectedProblem.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Test Cases Table */}
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sample Examples</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {selectedProblem.test_cases?.slice(0, 2).map((tc, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Input: <strong style={{ color: 'var(--text-primary)' }}>{tc.input}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>Expected: <strong style={{ color: 'var(--accent-emerald)' }}>{tc.expected}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Code Editor & Test Runner */}
              <Card style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Language:</span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as any)}
                      style={{ padding: '4px 10px', fontSize: '0.825rem' }}
                    >
                      <option value="javascript">JavaScript (ES2020)</option>
                      <option value="python">Python 3</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRunCode}
                      isLoading={isRunning}
                      leftIcon={<Play size={14} />}
                    >
                      Run Code
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitCode}
                      isLoading={isSubmitting}
                      leftIcon={<Send size={14} />}
                    >
                      Submit Solution
                    </Button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <textarea
                  rows={13}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: 16,
                    border: '1px solid var(--border-medium)',
                    color: '#f8fafc',
                    resize: 'vertical'
                  }}
                />

                {/* Test Results Console */}
                {testResults && (
                  <div style={{ marginTop: 16, padding: 16, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {testResults.allPassed || testResults.status === 'Accepted' ? (
                          <Badge variant="success">All Test Cases Passed</Badge>
                        ) : (
                          <Badge variant="danger">{testResults.status || 'Test Case Failed'}</Badge>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Passed {testResults.passedTests} / {testResults.totalTests}
                        </span>
                      </div>
                      {testResults.runtime && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                          Runtime: {testResults.runtime}
                        </span>
                      )}
                    </div>

                    {testResults.testResults && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {testResults.testResults.map((tr: any) => (
                          <div key={tr.testCaseNumber} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--bg-card)', borderRadius: 4 }}>
                            <span>Case {tr.testCaseNumber}: {tr.input}</span>
                            <span style={{ color: tr.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                              {tr.passed ? 'PASSED ✓' : 'FAILED ✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card style={{ padding: 48, textAlign: 'center' }}>
              <p>Select a problem to start practicing.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingLabPage;
