import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Target,
  Layers,
  FileCheck,
  Bot,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const onGetStarted = () => navigate('/auth?mode=register');
  const onSignIn = () => navigate('/auth?mode=login');
  const onExploreDemo = async () => { await demoLogin('student'); navigate('/dashboard'); };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            SC
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              Smart Competency
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary-400)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI Student Career Readiness
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Button variant="ghost" size="sm" onClick={onSignIn}>
            Sign In
          </Button>
          <Button variant="outline" size="sm" onClick={onExploreDemo}>
            Explore Demo Mode
          </Button>
          <Button variant="primary" size="sm" onClick={onGetStarted} rightIcon={<ArrowRight size={15} />}>
            Get Started Free
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 36px 60px 36px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--primary-400)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          <Sparkles size={16} />
          <span>Next-Gen AI Competency & Placement Preparation Platform</span>
        </div>

        <h1
          style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            maxWidth: 960,
            margin: '0 auto 24px auto',
          }}
        >
          Bridge the Gap Between <span style={{ background: 'linear-gradient(135deg, var(--primary-400) 0%, var(--accent-cyan) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campus Learning</span> and <span style={{ color: 'var(--accent-emerald)' }}>Job Readiness</span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: 760,
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          Diagnose your technical and soft-skill competency, discover exact gaps against your target career role, unlock personalized roadmaps, optimize your resume ATS score, and track your placement readiness with transparent metrics.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 50 }}>
          <Button variant="primary" size="lg" onClick={onGetStarted} rightIcon={<ArrowRight size={18} />}>
            Start Free Assessment
          </Button>
          <Button variant="secondary" size="lg" onClick={onExploreDemo}>
            View Student Dashboard Demo
          </Button>
        </div>

        {/* Product Preview Card */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
            overflow: 'hidden',
            textAlign: 'left',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ marginLeft: 12, fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                app.smartcompetency.com/dashboard
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600 }}>
              Live Platform Preview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Career Goal</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>Full Stack Developer</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: 4 }}>+8% Competency Growth</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placement Readiness</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 4 }}>74% Ready</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>8-Dimension Evaluated</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resume ATS Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-400)', marginTop: 4 }}>78 / 100</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>3 Action Rewrites Ready</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: 18, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coding & Study Streak</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: 4 }}>6-Day Active Streak</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Consistent Habit</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Key Student Questions */}
      <section style={{ padding: '60px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            6 Core Questions Answered for Every Student
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
            We turn vague self-doubt into precise, transparent career clarity.
          </p>
        </div>

        <div className="grid-3">
          {[
            { q: '1. What skills do I currently have?', desc: 'Multi-category diagnostic assessments covering Core CS, Web, Databases, DSA, and Aptitude.', icon: <Target size={22} color="var(--primary-400)" /> },
            { q: '2. How strong am I in each skill?', desc: 'Interactive skill matrix rating your competency from Beginner to Job Ready with assessment evidence.', icon: <Layers size={22} color="var(--accent-cyan)" /> },
            { q: '3. What skills am I missing?', desc: 'Role-specific skill-gap analyzer highlighting priority deltas and estimated study hours needed.', icon: <Brain size={22} color="var(--accent-purple)" /> },
            { q: '4. What should I learn next?', desc: 'Personalized roadmap progression with milestones, curated learning resources, and practice labs.', icon: <TrendingUp size={22} color="var(--accent-emerald)" /> },
            { q: '5. How ready am I for placements?', desc: 'A transparent composite 8-dimension readiness score with benchmark comparisons.', icon: <Award size={22} color="var(--accent-amber)" /> },
            { q: '6. How do I improve my resume & interview?', desc: 'AI-assisted resume keyword parser with ATS scoring and mock interview answer evaluation.', icon: <FileCheck size={22} color="var(--accent-rose)" /> },
          ].map((item, idx) => (
            <Card key={idx} interactive style={{ padding: 26 }}>
              <div style={{ marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                {item.q}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Student Journey Workflow */}
      <section style={{ padding: '60px 36px', backgroundColor: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
            Connected Student Career Journey
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px auto' }}>
            Data flows seamlessly between assessment, skill matrix, roadmap, coding lab, and placement readiness.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['Diagnostic Assessment', 'Competency Matrix', 'Skill Gap Delta', 'Personalized Roadmap', 'Daily Practice & Coding', 'Resume & Interview Prep', 'Placement Readiness'].map((step, idx) => (
              <React.Fragment key={idx}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {step}
                </div>
                {idx < 6 && (
                  <ArrowRight size={16} color="var(--primary-400)" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '80px 36px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Ready to Elevate Your Placement Readiness?
        </h2>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
          Join students from top institutions accelerating their path from college to tier-1 technology careers.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Get Started Free
          </Button>
          <Button variant="secondary" size="lg" onClick={onExploreDemo}>
            Explore Demo Mode
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 36px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <p>© 2026 Smart Competency AI Platform. Designed for students, colleges, and placement cells.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
