import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  GraduationCap,
  Briefcase,
  Sliders,
  Github,
  Linkedin,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { CareerRole, Profile } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech / B.E.');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science and Engineering');
  const [year, setYear] = useState(profile?.year || '4th Year');
  const [gradYear, setGradYear] = useState(profile?.grad_year || '2026');
  const [targetRoleId, setTargetRoleId] = useState(profile?.target_role_id || 'role-fullstack');
  const [secondaryRoleId, setSecondaryRoleId] = useState(profile?.secondary_role_id || 'role-frontend');
  const [dailyHours, setDailyHours] = useState<number>(profile?.daily_hours || 2);
  const [learningStyle, setLearningStyle] = useState(profile?.learning_style || 'Practical / Project-Based');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');
  const [bio, setBio] = useState(profile?.bio || '');

  useEffect(() => {
    api.getRoles()
      .then(res => setRoles(res))
      .catch(err => console.error('Failed to load roles', err));
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCollege(profile.college || '');
      setDegree(profile.degree || 'B.Tech / B.E.');
      setBranch(profile.branch || 'Computer Science and Engineering');
      setYear(profile.year || '4th Year');
      setGradYear(profile.grad_year || '2026');
      setTargetRoleId(profile.target_role_id || 'role-fullstack');
      setSecondaryRoleId(profile.secondary_role_id || 'role-frontend');
      setDailyHours(profile.daily_hours || 2);
      setLearningStyle(profile.learning_style || 'Practical / Project-Based');
      setGithubUrl(profile.github_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateProfile({
        full_name: fullName,
        college,
        degree,
        branch,
        year,
        grad_year: gradYear,
        target_role_id: targetRoleId,
        secondary_role_id: secondaryRoleId,
        daily_hours: dailyHours,
        learning_style: learningStyle,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        bio
      });
      await refreshProfile();
      showToast({
        title: 'Settings Saved',
        message: 'Your profile and career preferences have been updated.',
        type: 'success'
      });
    } catch (err: any) {
      showToast({ title: 'Save failed', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Settings size={22} style={{ color: 'var(--primary-400)' }} />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Account & Career Settings
            </h1>
          </div>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            Manage your personal profile, target career tracks, daily learning targets, and application preferences.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Academic Profile */}
        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <GraduationCap size={20} style={{ color: 'var(--primary-400)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Student & Academic Details</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>College / University</label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Academic Branch / Department</label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Current Year</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year (Final Year)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / MS / MCA)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Graduation Year</label>
              <input
                type="text"
                value={gradYear}
                onChange={e => setGradYear(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>Brief Professional Bio / Objective</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. Aspiring Full Stack Engineer passionate about distributed systems, React, and scalable backend design..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>
        </Card>

        {/* Career & Role Preferences */}
        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Briefcase size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Target Career Tracks</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Primary Target Role (Drives Gap Analysis)
              </label>
              <select
                value={targetRoleId}
                onChange={e => setTargetRoleId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Secondary Target Role
              </label>
              <select
                value={secondaryRoleId}
                onChange={e => setSecondaryRoleId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Study Habits & Daily Commitment */}
        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Sliders size={20} style={{ color: 'var(--accent-amber)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Daily Study Targets & Style</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Daily Dedicated Study Time</label>
                <span style={{ fontWeight: 800, color: 'var(--primary-400)' }}>{dailyHours} Hours / Day</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={e => setDailyHours(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>1 Hour</span>
                <span>4 Hours</span>
                <span>8 Hours</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                Preferred Learning Methodology
              </label>
              <select
                value={learningStyle}
                onChange={e => setLearningStyle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              >
                <option value="Practical / Project-Based">Practical & Project-Based (Hands-on)</option>
                <option value="Structured Theory & Docs">Structured Theory & Technical Documentation</option>
                <option value="Visual & Video Tutorials">Visual & Video Tutorials</option>
                <option value="Competitive Problem Solving">Competitive Problem Solving (LeetCode style)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* External Portfolios */}
        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Github size={20} style={{ color: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>External Professional Profiles</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                GitHub Profile URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </Card>

        {/* Demo Persona Switcher */}
        <Card style={{ padding: 28, border: '1.5px dashed var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Demo Presentation Persona Switcher
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Instantly toggle between a student portfolio perspective and the Placement Dean / Institutional portal.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant={user?.role === 'student' ? 'primary' : 'outline'}
                type="button"
                onClick={async () => {
                  await demoLogin('student');
                  showToast({ title: 'Student Persona', message: 'Logged in as Alex Chen.', type: 'info' });
                }}
              >
                Alex Chen (Student)
              </Button>
              <Button
                variant={user?.role === 'admin' ? 'primary' : 'outline'}
                type="button"
                onClick={async () => {
                  await demoLogin('admin');
                  showToast({ title: 'Admin Persona', message: 'Logged in as Dr. Sarah Jenkins (Placement Director).', type: 'info' });
                }}
              >
                Dr. Sarah (Admin / Placement Cell)
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SettingsPage;
