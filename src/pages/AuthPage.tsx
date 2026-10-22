import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UserCheck, ShieldCheck, Mail, Lock, User, Building, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onBackToLanding = () => navigate('/');
  const onSuccess = () => navigate('/dashboard');
  const { login, register, demoLogin, isLoading } = useAuth();
  const { showToast } = useNotification();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast({ title: 'Welcome Back!', message: 'Signed in successfully.', type: 'success' });
      } else {
        await register({ email, password, fullName, college });
        showToast({ title: 'Account Created!', message: 'Welcome to Smart Competency.', type: 'success' });
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      showToast({ title: 'Auth Error', message: err.message, type: 'error' });
    }
  };

  const handleDemoLogin = async (role: 'student' | 'admin') => {
    setErrorMsg('');
    try {
      await demoLogin(role);
      showToast({
        title: `Signed in as Demo ${role === 'admin' ? 'Admin' : 'Student'}`,
        message: 'Exploring platform with pre-populated demo data.',
        type: 'info'
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative'
      }}
    >
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-cyan) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.4rem',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
              marginBottom: 12
            }}
          >
            SC
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Student Account'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {mode === 'login' ? 'Sign in to access your competency dashboard' : 'Begin your journey towards placement readiness'}
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <Card style={{ marginBottom: 20, padding: 18, borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkles size={16} color="var(--primary-400)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Demo Access
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserCheck size={15} />}
              onClick={() => handleDemoLogin('student')}
              isLoading={isLoading}
            >
              Demo Student
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ShieldCheck size={15} />}
              onClick={() => handleDemoLogin('admin')}
              isLoading={isLoading}
            >
              Demo Admin
            </Button>
          </div>
        </Card>

        {/* Form Card */}
        <Card style={{ padding: 28 }}>
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: 4,
              borderRadius: 'var(--radius-md)',
              marginBottom: 24
            }}
          >
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '0.825rem',
                marginBottom: 16
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', paddingLeft: 38 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    College / University
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Apex Institute of Technology"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      style={{ width: '100%', paddingLeft: 38 }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 38 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: 38 }}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
