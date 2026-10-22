import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Github, ExternalLink, Trash2, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Project } from '../types';

export const ProjectPortfolioPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast, triggerCelebration } = useNotification();

  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Project Form
  const [form, setForm] = useState({
    title: '',
    problem_statement: '',
    description: '',
    tech_stack: 'React, TypeScript, Node.js, PostgreSQL',
    github_url: '',
    live_demo_url: '',
    role: 'Lead Architect',
    challenges: '',
    solutions: '',
    outcomes: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('[Projects] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      showToast({ title: 'Validation error', message: 'Title and description are required.', type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const stackArray = form.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      await api.createProject({
        ...form,
        tech_stack: stackArray
      });
      triggerCelebration();
      showToast({ title: 'Project Added!', message: 'Portfolio strength score recalculated.', type: 'success' });
      setShowAddModal(false);
      setForm({
        title: '',
        problem_statement: '',
        description: '',
        tech_stack: 'React, TypeScript, Node.js, PostgreSQL',
        github_url: '',
        live_demo_url: '',
        role: 'Lead Architect',
        challenges: '',
        solutions: '',
        outcomes: '',
      });
      loadProjects();
    } catch (err: any) {
      showToast({ title: 'Creation failed', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      showToast({ title: 'Project removed', type: 'info' });
      loadProjects();
    } catch (err: any) {
      showToast({ title: 'Delete error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant="primary" dot>Production Portfolio</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Demonstrable Engineering Evidence</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Project Portfolio & Engineering Labs
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Showcase real full-stack systems, architectural challenges, and measurable technical outcomes.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)} leftIcon={<Plus size={16} />}>
          Add Project
        </Button>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {projects.map((proj) => (
          <Card key={proj.id} style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {proj.title}
                  </h3>
                  <Badge variant="outline">{proj.role || 'Full Stack Engineer'}</Badge>
                </div>
                {proj.problem_statement && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                    "{proj.problem_statement}"
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {proj.strength_score}/100
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Strength Score</div>
                </div>

                <button
                  onClick={() => handleDelete(proj.id)}
                  className="btn-icon"
                  style={{ color: 'var(--text-muted)', padding: 6 }}
                  title="Remove Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {proj.description}
            </p>

            {/* Challenges & Solutions */}
            {(proj.challenges || proj.solutions) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, backgroundColor: 'var(--bg-surface-elevated)', padding: 14, borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: 2 }}>Architectural Challenge:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{proj.challenges || 'Handling real-time state synchronization.'}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: 2 }}>Engineered Solution:</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{proj.solutions || 'Implemented optimistic concurrency control.'}</span>
                </div>
              </div>
            )}

            {/* Tech Stack & Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proj.tech_stack?.map((tech, i) => (
                  <Badge key={i} variant="primary">{tech}</Badge>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-secondary)' }}
                  >
                    <Github size={15} />
                    <span>Source Code</span>
                  </a>
                )}
                {proj.live_demo_url && (
                  <a
                    href={proj.live_demo_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--primary-400)' }}
                  >
                    <ExternalLink size={15} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Document Portfolio Project"
        subtitle="Recruiters value concrete architectural tradeoffs and outcomes"
        maxWidth={640}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateProject} isLoading={isSubmitting}>Save to Portfolio</Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Task Orchestrator"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Problem Statement
            </label>
            <input
              type="text"
              placeholder="What real engineering pain point did this solve?"
              value={form.problem_statement}
              onChange={(e) => setForm({ ...form, problem_statement: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              System Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Summarize architecture, components, and key features..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Technologies Used (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
              value={form.tech_stack}
              onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Live Deployment URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.live_demo_url}
                onChange={(e) => setForm({ ...form, live_demo_url: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Major Technical Challenge
              </label>
              <input
                type="text"
                placeholder="e.g. High latency in nested relational joins"
                value={form.challenges}
                onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Engineered Solution
              </label>
              <input
                type="text"
                placeholder="e.g. Implemented B-Tree indexing and Redis cache"
                value={form.solutions}
                onChange={(e) => setForm({ ...form, solutions: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectPortfolioPage;
