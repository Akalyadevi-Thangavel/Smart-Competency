import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, TrendingUp, TrendingDown, Minus, CheckCircle, ExternalLink, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { Skill } from '../types';

const SkillMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const onNavigate = navigate;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categorized, setCategorized] = useState<Record<string, Skill[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [skillDetails, setSkillDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkillMatrix()
      .then((data) => {
        setSkills(data.skills);
        setCategorized(data.categorized);
      })
      .catch((err) => console.error('[SkillMatrix] Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenSkill = async (skill: Skill) => {
    setActiveSkill(skill);
    try {
      const details = await api.getSkillDetails(skill.id);
      setSkillDetails(details);
    } catch (err) {
      console.error('[SkillMatrix] Error loading skill details:', err);
    }
  };

  const getLevelBadgeVariant = (lvl?: string) => {
    switch (lvl) {
      case 'Job Ready':
      case 'Advanced': return 'success';
      case 'Intermediate': return 'primary';
      case 'Developing': return 'warning';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp size={14} color="var(--accent-emerald)" />;
    if (trend === 'down') return <TrendingDown size={14} color="var(--accent-rose)" />;
    return <Minus size={14} color="var(--text-muted)" />;
  };

  const categories = ['All', 'Technical', 'Core CS', 'Soft Skills', 'Aptitude', 'Tools'];

  const displayedSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Competency Skill Matrix
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Multi-dimensional skill matrix mapping your verified proficiency levels against target career benchmarks.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? 'var(--bg-surface)' : 'transparent',
                color: selectedCategory === cat ? 'var(--primary-400)' : 'var(--text-secondary)',
                boxShadow: selectedCategory === cat ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid-3">
        {displayedSkills.map((skill) => {
          const score = Math.round(skill.current_score || 20);
          return (
            <Card
              key={skill.id}
              interactive
              onClick={() => handleOpenSkill(skill)}
              style={{ padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Badge variant="outline">{skill.category}</Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getTrendIcon(skill.trend)}
                    <span>{skill.trend === 'up' ? 'Improving' : 'Stable'}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {skill.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 16 }}>
                  {skill.description || 'Verified competency for production engineering.'}
                </p>
              </div>

              <div>
                <div style={{ marginBottom: 12 }}>
                  <ProgressBar percentage={score} height={6} showLabel label="Proficiency Score" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Current: </span>
                    <Badge variant={getLevelBadgeVariant(skill.current_level)}>
                      {skill.current_level || 'Beginner'}
                    </Badge>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{skill.required_level || 'Intermediate'}</strong>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Skill In-Depth Modal / Drawer */}
      <Modal
        isOpen={!!activeSkill}
        onClose={() => { setActiveSkill(null); setSkillDetails(null); }}
        title={activeSkill?.name || 'Skill Details'}
        subtitle={`Category: ${activeSkill?.category}`}
        maxWidth={680}
        footer={
          <Button variant="primary" onClick={() => { setActiveSkill(null); onNavigate('/learning'); }}>
            View in Learning Roadmap
          </Button>
        }
      >
        {activeSkill && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {activeSkill.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, backgroundColor: 'var(--bg-surface-elevated)', padding: 16, borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Level</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-400)', marginTop: 2 }}>
                  {activeSkill.current_level || 'Beginner'} ({Math.round(activeSkill.current_score || 20)}%)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Role Level</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {activeSkill.required_level || 'Intermediate'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence Metric</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }}>
                  {activeSkill.confidence || 75}%
                </div>
              </div>
            </div>

            {/* Practice tasks from learning items */}
            {skillDetails?.learningItems && skillDetails.learningItems.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={16} /> Recommended Practice Task
                </h4>
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {skillDetails.learningItems[0].practice_task || 'Complete the hands-on lab exercise and code challenge.'}
                </div>
              </div>
            )}

            {/* Related Interview Questions */}
            {skillDetails?.interviewQuestions && skillDetails.interviewQuestions.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={16} /> Common Interview Prompt
                </h4>
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {skillDetails.interviewQuestions[0].question_text}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default SkillMatrixPage;
