import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CareerRole } from '../types';

interface RoleMatchItem {
  role: CareerRole;
  compatibilityScore: number;
  status: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export const JobRoleMatchPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useNotification();

  const [matches, setMatches] = useState<RoleMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingRoleId, setSwitchingRoleId] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await api.getRoleMatches();
      setMatches(data);
    } catch (err: any) {
      console.error('[RoleMatch] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetTargetRole = async (roleId: string, roleName: string) => {
    setSwitchingRoleId(roleId);
    try {
      await api.updateProfile({ target_role_id: roleId });
      await refreshProfile();
      showToast({
        title: 'Target Role Updated',
        message: `Your roadmap and skill gap analytics now prioritize ${roleName}.`,
        type: 'success'
      });
      loadMatches();
    } catch (err: any) {
      showToast({ title: 'Update failed', message: err.message, type: 'error' });
    } finally {
      setSwitchingRoleId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Badge variant="primary" dot>Career Exploration</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Multi-Track Competency Alignment</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Career Role Alignment & Compatibility
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Compare your current technical competencies against different engineering career tracks to discover your closest market alignment.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid-2">
        {matches.map((item) => {
          const isCurrentTarget = profile?.target_role_id === item.role.id;
          return (
            <Card
              key={item.role.id}
              style={{
                padding: 24,
                border: isCurrentTarget ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                backgroundColor: isCurrentTarget ? 'rgba(99, 102, 241, 0.04)' : 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {item.role.name}
                      </h3>
                      {isCurrentTarget && (
                        <Badge variant="primary">Current Target</Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.role.category}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.compatibilityScore >= 70 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                      {item.compatibilityScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Alignment</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {item.role.description}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <ProgressBar percentage={item.compatibilityScore} height={7} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>Competency Alignment: <strong>{item.status}</strong></span>
                    <span>Hiring Benchmark: {item.role.min_readiness_score}%</span>
                  </div>
                </div>

                {/* Matching vs Missing Skills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={13} /> Verified Matching Skills ({item.matchingSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {item.matchingSkills.slice(0, 5).map((s, i) => (
                        <Badge key={i} variant="success">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  {item.missingSkills.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={13} /> Areas to Strengthen ({item.missingSkills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {item.missingSkills.slice(0, 4).map((s, i) => (
                          <Badge key={i} variant="danger">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {!isCurrentTarget ? (
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ width: '100%' }}
                    onClick={() => handleSetTargetRole(item.role.id, item.role.name)}
                    isLoading={switchingRoleId === item.role.id}
                  >
                    Set as Primary Target Role
                  </Button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 600, padding: '8px 0' }}>
                    <Check size={16} /> Active Roadmap Target
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default JobRoleMatchPage;
