import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, Copy, Check, AlertCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const ResumeAnalyzerPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast, triggerCelebration } = useNotification();

  const [resumeText, setResumeText] = useState('');
  const [filename, setFilename] = useState('Alex_Chen_Software_Engineer_Resume.pdf');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    loadLatestResume();
  }, []);

  const loadLatestResume = async () => {
    try {
      const data = await api.getLatestResume();
      if (data && data.analysis) {
        setAnalysis(data.analysis);
        if (data.resume?.filename) setFilename(data.resume.filename);
        if (data.resume?.parsed_content) setResumeText(data.resume.parsed_content);
      }
    } catch (err) {
      console.warn('[ResumeAnalyzer] Could not load latest analysis');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 40) {
      showToast({ title: 'Input required', message: 'Please provide detailed resume content or paste your text.', type: 'warning' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResume(resumeText, filename);
      setAnalysis(res.analysis);
      if (res.analysis.atsScore >= 80) {
        triggerCelebration();
      }
      showToast({
        title: 'Analysis Complete!',
        message: `Your ATS Compatibility Score is ${res.analysis.atsScore}/100.`,
        type: 'success'
      });
    } catch (err: any) {
      showToast({ title: 'Analysis error', message: err.message, type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyRewrite = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showToast({ title: 'Copied to clipboard', message: 'Ready to paste into your resume draft.', type: 'info' });
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const sampleResume = `ALEX CHEN | Full Stack Developer
GitHub: github.com/alexchen-dev | LinkedIn: linkedin.com/in/alexchen-dev

EDUCATION:
B.Tech in Computer Science & Engineering, Apex Institute of Technology (2022 - 2026), CGPA: 8.7/10

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, SQL, Python
- Frontend: React.js, Next.js, Redux Toolkit, Tailwind CSS, HTML5, CSS3
- Backend: Node.js, Express.js, RESTful APIs, PostgreSQL, MongoDB, Redis
- Tools & Cloud: Git, GitHub, Docker, Postman, Linux

PROJECTS:
1. CloudTask - Collaborative Project Workspace (React, Node.js, PostgreSQL)
- Built a real-time Kanban collaboration tool with instant WebSocket updates.
- Designed database schema with 12 normalized tables and compound indexes.
- Implemented JWT authentication and role-based permissions for student groups.

2. E-Commerce Microservices Engine (Node.js, Express, Redis, PostgreSQL)
- Developed catalog and shopping cart microservices handling high-throughput reads.
- Integrated Redis caching to accelerate repetitive product lookups.`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Badge variant="primary" dot>ATS Optimization Engine</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {profile?.target_role_name || 'Full Stack Developer'}</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Resume Analyzer & Keyword Optimizer
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Evaluate your resume against recruiter ATS tracking algorithms and receive verified, actionable bullet point enhancements.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left Column: Upload / Paste Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Resume Content" subtitle="Paste your resume text or draft details below">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target Role: <strong>{profile?.target_role_name || 'Full Stack Developer'}</strong>
              </span>
              <button
                onClick={() => setResumeText(sampleResume)}
                style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600, cursor: 'pointer', background: 'none' }}
              >
                Load Sample Student Resume
              </button>
            </div>

            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume markdown, plain text, or sections here..."
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                resize: 'vertical',
                marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {resumeText.length} characters • Analyzed against verified role requirements
              </span>
              <Button
                variant="primary"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles size={16} />}
              >
                Analyze ATS Match
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: ATS Metrics & Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {analysis ? (
            <>
              {/* Score Summary Card */}
              <Card style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                  <ProgressRing
                    percentage={analysis.atsScore || 78}
                    size={110}
                    strokeWidth={9}
                    primaryColor="#10b981"
                    secondaryColor="#06b6d4"
                    label="ATS Score"
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Keyword Match</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{analysis.keywordScore || 82}%</strong>
                      </div>
                      <ProgressBar percentage={analysis.keywordScore || 82} height={6} color="var(--primary-500)" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Formatting & Layout</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{analysis.formattingScore || 88}%</strong>
                      </div>
                      <ProgressBar percentage={analysis.formattingScore || 88} height={6} color="var(--accent-emerald)" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Matched vs Missing Keywords */}
              <Card title="Keyword Coverage Analysis">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={15} /> Matched Role Keywords ({analysis.matched_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {analysis.matched_skills?.map((kw: string, i: number) => (
                        <Badge key={i} variant="success">{kw}</Badge>
                      ))}
                    </div>
                  </div>

                  {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={15} /> Missing High-Priority Keywords ({analysis.missing_skills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.missing_skills.map((kw: string, i: number) => (
                          <Badge key={i} variant="danger">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* 1-Click Action-Verb Bullet Rewrites */}
              <Card title="Action-Verb Enhancement Suggestions" subtitle="One-click copyable bullet improvements">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {analysis.action_verb_rewrites?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Original: <span style={{ textDecoration: 'line-through' }}>{item.original}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Suggested: <span style={{ color: 'var(--accent-emerald)' }}>{item.suggested}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.reason}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyRewrite(item.suggested, idx)}
                          leftIcon={copiedIdx === idx ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                        >
                          {copiedIdx === idx ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed' }}>
              <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                No Resume Analyzed Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px auto' }}>
                Paste your resume text on the left or load the sample resume to evaluate your ATS compatibility score.
              </p>
              <Button variant="primary" onClick={() => setResumeText(sampleResume)}>
                Load Demo Resume
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
