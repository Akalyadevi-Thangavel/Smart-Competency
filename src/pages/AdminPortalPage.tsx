import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Award,
  Target,
  BarChart3,
  Search,
  Filter,
  Download,
  PlusCircle,
  FileCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Code2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const AdminPortalPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Question modal state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qType, setQType] = useState('mcq');
  const [qOptions, setQOptions] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [qCorrect, setQCorrect] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [overviewData, studentsData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminStudents()
      ]);
      setOverview(overviewData);
      setStudents(studentsData);
    } catch (err: any) {
      showToast({ title: 'Error loading admin data', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Full Name', 'Email', 'College', 'Branch', 'Year', 'Target Role', 'Placement Readiness (%)', 'Overall Competency (%)', 'Coding Solved', 'Assessments Taken'];
    const rows = students.map(s => [
      `"${s.full_name}"`,
      `"${s.email}"`,
      `"${s.college || ''}"`,
      `"${s.branch || ''}"`,
      `"${s.year || ''}"`,
      `"${s.target_role_name || ''}"`,
      s.placement_readiness,
      s.overall_competency,
      s.coding_solved,
      s.total_assessments
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Smart_Competency_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ title: 'Report Exported', message: 'CSV downloaded successfully.', type: 'success' });
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'All' || s.branch === branchFilter;
    const matchRole = roleFilter === 'All' || s.target_role_name === roleFilter;
    return matchSearch && matchBranch && matchRole;
  });

  const branches = ['All', 'Computer Science and Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Electronics & Communication'];
  const roles = ['All', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI / ML Engineer', 'Data Analyst', 'Cloud Engineer'];

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: 40, maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <Card style={{ padding: 40, border: '1.5px solid var(--accent-rose)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Placement Officer / Admin Access Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
            This portal is restricted to college administrators, placement cell directors, and department heads to monitor student competency metrics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Button
              variant="primary"
              onClick={async () => {
                await demoLogin('admin');
                showToast({ title: 'Switched to Admin Persona', message: 'Logged in as Dr. Sarah Jenkins (Placement Director).', type: 'success' });
              }}
            >
              Switch to Demo Admin Persona
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Student Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <ShieldAlert size={24} style={{ color: 'var(--accent-rose)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-rose)', letterSpacing: '0.08em' }}>
              Institution Placement Cell Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Campus Competency & Placement Analytics
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Aggregated diagnostics, placement eligibility metrics, and departmental skill gaps across academic cohorts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Download size={16} />
            <span>Export Roster CSV</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddQuestion(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <PlusCircle size={16} />
            <span>Add Question</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Registered Candidates
            </span>
            <Users size={18} style={{ color: 'var(--primary-400)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 8 }}>
            {overview?.totalStudents || 48}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>↑ 12% vs last semester</span>
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average Placement Readiness
            </span>
            <Target size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: 8 }}>
            {overview?.avgReadiness || 72}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Based on transparent 8-pillar engine
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average Technical Competency
            </span>
            <Award size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: 8 }}>
            {overview?.avgCompetency || 68}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Across 18 tracked core competencies
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Diagnostic Tests Completed
            </span>
            <FileCheck size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 8 }}>
            {overview?.totalAssessmentsTaken || 142}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: 4 }}>
            94% completion rate
          </div>
        </Card>
      </div>

      {/* Middle Grid: Readiness Distribution & Top Skill Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Readiness Tiers */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>
            Cohort Readiness Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(overview?.readinessTiers || [
              { tier: 'Highly Competitive (80%+)', count: 18 },
              { tier: 'Placement Ready (70-79%)', count: 16 },
              { tier: 'Developing (50-69%)', count: 10 },
              { tier: 'Needs Immediate Focus (<50%)', count: 4 }
            ]).map((t: any, idx: number) => {
              const total = overview?.totalStudents || 48;
              const pct = Math.round((t.count / (total || 1)) * 100);
              const color = idx === 0 ? 'var(--accent-emerald)' : idx === 1 ? 'var(--accent-cyan)' : idx === 2 ? 'var(--accent-amber)' : 'var(--accent-rose)';

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.tier}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.count} students ({pct}%)</span>
                  </div>
                  <ProgressBar percentage={pct} color={color} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Departmental Skill Gaps */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>
            Top Institutional Skill Deficits (Action Required)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(overview?.topSkillGaps || [
              { skill_name: 'System Design & Scalability', category: 'Technical', avg_score: 42 },
              { skill_name: 'Dynamic Programming & Graphs', category: 'Core CS', avg_score: 48 },
              { skill_name: 'Cloud Architecture & Docker', category: 'Tools', avg_score: 51 },
              { skill_name: 'Behavioral STAR Communication', category: 'Soft Skills', avg_score: 56 },
              { skill_name: 'SQL Query Optimization', category: 'Technical', avg_score: 59 }
            ]).map((sg: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sg.skill_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Category: {sg.category}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: sg.avg_score < 50 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                    {Math.round(sg.avg_score)}% Avg Score
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-rose)' }}>
                    Bootcamp Recommended
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Roster Section */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Student Roster & Verification</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Inspect individual competency metrics, solved problems, and placement readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.825rem'
                }}
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.825rem'
              }}
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.825rem'
              }}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Student Name & Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Branch / Year</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Target Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Readiness (%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Competency (%)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Coding Solved</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <div>{student.branch || 'CSE'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.year || '4th Year'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {student.target_role_name || 'Full Stack Developer'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: student.placement_readiness >= 75 ? 'var(--accent-emerald)' : student.placement_readiness >= 60 ? 'var(--accent-cyan)' : 'var(--accent-amber)'
                        }}
                      >
                        {student.placement_readiness}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {student.overall_competency}%
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        <Code2 size={15} />
                        {student.coding_solved || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Question Authoring Modal */}
      {showAddQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
          onClick={() => setShowAddQuestion(false)}
        >
          <Card style={{ width: '100%', maxWidth: 520, padding: 28 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16 }}>
              Add Question to Campus Assessment Bank
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Question Text
                </label>
                <textarea
                  rows={3}
                  value={qTitle}
                  onChange={e => setQTitle(e.target.value)}
                  placeholder="Enter problem prompt or technical scenario..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Question Category / Assessment
                </label>
                <select
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                >
                  <option>Technical Assessment: Full Stack Architecture</option>
                  <option>Core CS: Algorithms & Data Structures</option>
                  <option>Campus Placement: Quantitative & Logical Aptitude</option>
                  <option>Workplace Communication & Soft Skills</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="ghost" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (!qTitle.trim()) return;
                    try {
                      await api.createAdminQuestion({
                        assessmentId: 'asm-fullstack-core',
                        skillId: 'skill-react',
                        questionText: qTitle,
                        questionType: qType,
                        options: qOptions,
                        correctAnswer: qOptions[qCorrect],
                        explanation: 'Added by Campus Placement Director.',
                        difficulty: 'Intermediate',
                        points: 10
                      });
                      showToast({ title: 'Question Created', message: 'Added to live diagnostic bank.', type: 'success' });
                      setShowAddQuestion(false);
                      setQTitle('');
                    } catch (err: any) {
                      showToast({ title: 'Creation failed', message: err.message, type: 'error' });
                    }
                  }}
                >
                  Publish to Question Bank
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPortalPage;
