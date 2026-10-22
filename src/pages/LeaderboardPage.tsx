import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Flame,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Code2,
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  college?: string;
  branch?: string;
  year?: string;
  overall_competency: number;
  placement_readiness: number;
  learning_streak: number;
  avatar_url?: string;
  target_role_name?: string;
  coding_solved: number;
  badges_count: number;
  isCurrentUser?: boolean;
}

export const LeaderboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'rankings' | 'badges'>('rankings');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const roles = ['All', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI / ML Engineer', 'Data Analyst', 'DevOps Engineer'];

  const filtered = leaderboard.filter(item => {
    const matchesSearch = item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.college && item.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.branch && item.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'All' || item.target_role_name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const currentUserRank = leaderboard.find(item => item.isCurrentUser || item.user_id === profile?.user_id);
  const topThree = leaderboard.slice(0, 3);

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' }; // Gold
    if (rank === 2) return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: '#94a3b8' }; // Silver
    if (rank === 3) return { bg: 'rgba(217, 119, 6, 0.2)', text: '#d97706', border: '#d97706' }; // Bronze
    return { bg: 'var(--bg-surface-elevated)', text: 'var(--text-muted)', border: 'transparent' };
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 80) return <Badge variant="success">Placement Ready ({score}%)</Badge>;
    if (score >= 65) return <Badge variant="primary">Competitive ({score}%)</Badge>;
    if (score >= 50) return <Badge variant="warning">Developing ({score}%)</Badge>;
    return <Badge variant="danger">Needs Focus ({score}%)</Badge>;
  };

  const badgeShowcase = [
    { title: 'Consistency Titan', desc: 'Maintained a 14+ day continuous learning streak.', icon: '🔥', earned: (profile?.learning_streak || 0) >= 14 },
    { title: 'Algorithm Virtuoso', desc: 'Solved 25+ medium and hard coding problems in Coding Lab.', icon: '⚡', earned: true },
    { title: 'Interview Master', desc: 'Achieved 80%+ score on 3 technical mock interview questions.', icon: '🎯', earned: true },
    { title: 'Full Stack Architect', desc: 'Built and verified a full stack project portfolio with live demo.', icon: '🚀', earned: true },
    { title: 'Readiness Champion', desc: 'Exceeded 80% on Placement Readiness Score.', icon: '🏆', earned: (profile?.placement_readiness || 0) >= 80 },
    { title: 'Speed Demon', desc: 'Completed Aptitude evaluation within 15 minutes with >85% accuracy.', icon: '⏱️', earned: false }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1160, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Trophy size={26} style={{ color: 'var(--accent-amber)' }} />
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Student Placement Leaderboard
            </h1>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 650 }}>
            Rankings calibrated by verified technical competency, coding problem accuracy, project completeness, and interview readiness.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('rankings')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'rankings' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'rankings' ? 'var(--primary-400)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeTab === 'rankings' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Leaderboard Rankings
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'badges' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'badges' ? 'var(--primary-400)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: activeTab === 'badges' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Badges & Honors
          </button>
        </div>
      </div>

      {activeTab === 'rankings' ? (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'end' }}>
              {/* 2nd Place */}
              <Card
                style={{
                  padding: 24,
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.08) 0%, var(--bg-surface) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#94a3b8',
                    color: '#0f172a',
                    padding: '3px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  🥈 2nd Place
                </div>
                <img
                  src={topThree[1].avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={topThree[1].full_name}
                  style={{ width: 68, height: 68, borderRadius: '50%', margin: '14px auto 10px', objectFit: 'cover', border: '3px solid #94a3b8' }}
                />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{topThree[1].full_name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{topThree[1].target_role_name}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                  {topThree[1].placement_readiness}% Readiness
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{topThree[1].coding_solved} Solved</span>
                  <span>•</span>
                  <span>{topThree[1].learning_streak}d Streak</span>
                </div>
              </Card>

              {/* 1st Place (Crown) */}
              <Card
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.15) 0%, var(--bg-surface) 100%)',
                  border: '1.5px solid rgba(234, 179, 8, 0.5)',
                  boxShadow: '0 8px 30px rgba(234, 179, 8, 0.15)',
                  position: 'relative',
                  transform: 'scale(1.03)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#eab308',
                    color: '#000000',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Crown size={16} /> 1st Place Champion
                </div>
                <img
                  src={topThree[0].avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                  alt={topThree[0].full_name}
                  style={{ width: 84, height: 84, borderRadius: '50%', margin: '14px auto 10px', objectFit: 'cover', border: '4px solid #eab308' }}
                />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{topThree[0].full_name}</h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: 8 }}>{topThree[0].target_role_name}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
                  {topThree[0].placement_readiness}% Readiness
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <span>🏆 {topThree[0].coding_solved} Solved</span>
                  <span>•</span>
                  <span>🔥 {topThree[0].learning_streak}d Streak</span>
                </div>
              </Card>

              {/* 3rd Place */}
              <Card
                style={{
                  padding: 24,
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, var(--bg-surface) 100%)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    padding: '3px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  🥉 3rd Place
                </div>
                <img
                  src={topThree[2].avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'}
                  alt={topThree[2].full_name}
                  style={{ width: 68, height: 68, borderRadius: '50%', margin: '14px auto 10px', objectFit: 'cover', border: '3px solid #d97706' }}
                />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{topThree[2].full_name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{topThree[2].target_role_name}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-400)' }}>
                  {topThree[2].placement_readiness}% Readiness
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{topThree[2].coding_solved} Solved</span>
                  <span>•</span>
                  <span>{topThree[2].learning_streak}d Streak</span>
                </div>
              </Card>
            </div>
          )}

          {/* Current User Standing Banner */}
          {currentUserRank && (
            <Card
              style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                border: '1.5px solid var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-500)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.15rem'
                  }}
                >
                  #{currentUserRank.rank}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Your Campus Standing: Rank #{currentUserRank.rank} of {leaderboard.length} Students
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Placement Readiness: <strong>{currentUserRank.placement_readiness}%</strong> • {currentUserRank.coding_solved} coding challenges solved
                  </div>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={() => navigate('/coding')}>
                Climb Rankings (Solve Problems)
              </Button>
            </Card>
          )}

          {/* Search & Role Filter Bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by student name or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rankings Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading verified standings…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No students match your filter criteria.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      <th style={{ padding: '14px 20px', width: 80, fontWeight: 700, color: 'var(--text-muted)' }}>Rank</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>Candidate</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>Target Career Role</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>Readiness Index</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>Coding Solved</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-muted)' }}>Consistency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(student => {
                      const rankStyle = getRankBadgeColor(student.rank);
                      const isMe = student.isCurrentUser || student.user_id === profile?.user_id;

                      return (
                        <tr
                          key={student.user_id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: isMe ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            transition: 'background var(--transition-fast)'
                          }}
                        >
                          {/* Rank */}
                          <td style={{ padding: '16px 20px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: rankStyle.bg,
                                color: rankStyle.text,
                                border: `1px solid ${rankStyle.border}`,
                                fontWeight: 800,
                                fontSize: '0.85rem'
                              }}
                            >
                              {student.rank}
                            </span>
                          </td>

                          {/* Candidate info */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img
                                src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={student.full_name}
                                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span>{student.full_name}</span>
                                  {isMe && <Badge variant="primary">You</Badge>}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                  {student.college || 'Engineering College'} {student.branch ? `• ${student.branch}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Target Role */}
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {student.target_role_name || 'Software Developer'}
                          </td>

                          {/* Readiness Index */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {getReadinessBadge(student.placement_readiness)}
                              </div>
                              <ProgressBar
                                percentage={student.placement_readiness}
                                color={student.placement_readiness >= 75 ? 'var(--accent-emerald)' : 'var(--primary-500)'}
                              />
                            </div>
                          </td>

                          {/* Coding Solved */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              <Code2 size={16} />
                              {student.coding_solved} Problems
                            </span>
                          </td>

                          {/* Consistency Streak */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent-amber)' }}>
                              <Flame size={16} />
                              {student.learning_streak}d
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Badges Showcase Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {badgeShowcase.map((badge, idx) => (
            <Card
              key={idx}
              style={{
                padding: 24,
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                border: badge.earned ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                backgroundColor: badge.earned ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: badge.earned ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0
                }}
              >
                {badge.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {badge.title}
                  </h3>
                  {badge.earned ? (
                    <Badge variant="success">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">In Progress</Badge>
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {badge.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
