import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Target, GraduationCap, Clock, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CareerRole } from '../types';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const onComplete = () => navigate('/dashboard');
  const { profile, refreshProfile } = useAuth();
  const { showToast, triggerCelebration } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    college: profile?.college || 'Apex Institute of Technology',
    degree: profile?.degree || 'B.Tech',
    branch: profile?.branch || 'Computer Science & Engineering',
    year: profile?.year || '3rd Year',
    grad_year: profile?.grad_year || '2026',
    target_role_id: profile?.target_role_id || 'role-fullstack',
    secondary_role_id: profile?.secondary_role_id || 'role-backend',
    experience_level: profile?.experience_level || 'Intermediate',
    daily_hours: profile?.daily_hours || 2.5,
    learning_style: profile?.learning_style || 'Project-Based & Practical Coding',
    github_url: profile?.github_url || 'https://github.com/',
    linkedin_url: profile?.linkedin_url || 'https://linkedin.com/in/',
  });

  useEffect(() => {
    api.getRoles()
      .then(setRoles)
      .catch(err => console.error('[Onboarding] Error loading roles:', err))
      .finally(() => setIsLoadingRoles(false));
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.submitOnboarding(formData);
      await refreshProfile();
      triggerCelebration();
      showToast({
        title: 'Onboarding Complete!',
        message: 'Your personalized competency roadmap has been calibrated.',
        type: 'success'
      });
      onComplete();
    } catch (err: any) {
      showToast({ title: 'Error saving onboarding', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
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
        padding: '36px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {[
            { step: 1, label: 'Academic Background', icon: <GraduationCap size={16} /> },
            { step: 2, label: 'Target Career Role', icon: <Target size={16} /> },
            { step: 3, label: 'Learning Style & Goals', icon: <Clock size={16} /> },
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--accent-emerald)' : isCurrent ? 'var(--primary-500)' : 'var(--bg-surface-elevated)',
                    color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: `1.5px solid ${isCurrent ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {isCompleted ? <Check size={16} /> : s.step}
                </div>
                <div style={{ display: 'block' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stepper Card */}
        <Card style={{ padding: 36 }}>
          {currentStep === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Tell Us About Your Academics
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  This helps benchmark your preparation against college batch standards.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Degree
                    </label>
                    <select
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="B.Tech">B.Tech / B.E.</option>
                      <option value="BCA">BCA / B.Sc Computer Science</option>
                      <option value="M.Tech">M.Tech / M.E.</option>
                      <option value="MCA">MCA / M.Sc IT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Current Year
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year (Final Year)</option>
                      <option value="Graduated">Graduated / Recent Alumni</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={formData.grad_year}
                      onChange={(e) => setFormData({ ...formData, grad_year: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Select Your Desired Career Role
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Your competency gaps and roadmap will be engineered specifically for this target.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Primary Target Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {roles.map((r) => {
                    const isSelected = formData.target_role_id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setFormData({ ...formData, target_role_id: r.id })}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface-elevated)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.3 }}>
                          {r.category}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Secondary / Alternative Career Track (Optional)
                </label>
                <select
                  value={formData.secondary_role_id}
                  onChange={(e) => setFormData({ ...formData, secondary_role_id: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">None (Single Focus)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Personalize Your Learning Routine
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Tailor your daily study plans and practice pacing.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Daily Study Availability (Hours/Day)
                    </label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {formData.daily_hours} hrs/day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={formData.daily_hours}
                    onChange={(e) => setFormData({ ...formData, daily_hours: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Preferred Learning Style
                  </label>
                  <select
                    value={formData.learning_style}
                    onChange={(e) => setFormData({ ...formData, learning_style: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Project-Based & Practical Coding">Project-Based & Practical Coding (Recommended)</option>
                    <option value="Concept-First with Theory Drills">Concept-First with Theory Drills</option>
                    <option value="Algorithmic & Problem Solving Centric">Algorithmic & Problem Solving Centric</option>
                    <option value="Fast-Track Interview Sprint">Fast-Track Interview Sprint</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
            {currentStep > 1 ? (
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft size={16} />}>
                Previous Step
              </Button>
            ) : <div />}

            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              isLoading={isSubmitting}
              rightIcon={currentStep === 3 ? <Sparkles size={16} /> : <ArrowRight size={16} />}
            >
              {currentStep === 3 ? 'Complete Setup & Open Dashboard' : 'Next Step'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
