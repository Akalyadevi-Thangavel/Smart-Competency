import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/projects - list user's projects
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

  const parsed = projects.map(p => ({
    ...p,
    tech_stack: JSON.parse(p.tech_stack_json || '[]')
  }));

  res.json(parsed);
});

// POST /api/projects - create new portfolio project
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const {
    title,
    problem_statement,
    description,
    tech_stack = [],
    github_url,
    live_demo_url,
    role = 'Lead Developer',
    challenges,
    solutions,
    outcomes
  } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }

  // Calculate project strength score
  let strengthScore = 65;
  if (github_url) strengthScore += 10;
  if (live_demo_url) strengthScore += 10;
  if (challenges && solutions) strengthScore += 10;
  if (outcomes) strengthScore += 5;
  strengthScore = Math.min(100, strengthScore);

  const projectId = `proj-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  db.prepare(`
    INSERT INTO projects (
      id, user_id, title, problem_statement, description, tech_stack_json,
      github_url, live_demo_url, role, challenges, solutions, outcomes, strength_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    userId,
    title,
    problem_statement,
    description,
    JSON.stringify(tech_stack),
    github_url,
    live_demo_url,
    role,
    challenges,
    solutions,
    outcomes,
    strengthScore
  );

  // Recalculate Placement Readiness
  CompetencyEngine.calculatePlacementReadiness(userId);

  // Trigger achievement
  db.prepare(`
    INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
    VALUES (?, ?, 'ach-project-builder')
  `).run(`uach-${Date.now()}`, userId);

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  res.status(201).json({
    message: 'Project added to portfolio',
    project: {
      ...created,
      tech_stack: JSON.parse(created.tech_stack_json || '[]')
    }
  });
});

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(id, userId);
  CompetencyEngine.calculatePlacementReadiness(userId);

  res.json({ message: 'Project removed' });
});

export default router;
