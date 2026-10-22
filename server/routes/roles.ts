import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/roles - list all career roles
router.get('/', (req, res) => {
  const roles = db.prepare('SELECT * FROM career_roles WHERE is_active = 1 ORDER BY name ASC').all();
  res.json(roles);
});

// GET /api/roles/:id - get role details with required skills
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const role = db.prepare('SELECT * FROM career_roles WHERE id = ? OR slug = ?').get(id, id) as any;

  if (!role) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }

  const skills = db.prepare(`
    SELECT rs.*, s.name as skill_name, s.category, s.description as skill_description
    FROM role_skills rs
    JOIN skills s ON rs.skill_id = s.id
    WHERE rs.role_id = ?
    ORDER BY rs.weight DESC
  `).all(role.id);

  res.json({ role, skills });
});

// GET /api/roles/match - calculate compatibility across all roles for student
router.get('/match', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const roles = db.prepare('SELECT * FROM career_roles WHERE is_active = 1').all() as any[];

  const studentSkills = db.prepare(`
    SELECT skill_id, current_score FROM student_skills WHERE user_id = ?
  `).all(userId) as { skill_id: string; current_score: number }[];

  const studentMap = new Map<string, number>();
  for (const s of studentSkills) {
    studentMap.set(s.skill_id, s.current_score);
  }

  const results = roles.map(role => {
    const roleSkills = db.prepare(`
      SELECT rs.skill_id, rs.weight, rs.required_level, s.name as skill_name
      FROM role_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.role_id = ?
    `).all(role.id) as any[];

    if (roleSkills.length === 0) {
      return {
        role,
        compatibilityScore: 50,
        matchingSkills: [],
        missingSkills: [],
        status: 'Needs Assessment'
      };
    }

    let weightedScore = 0;
    let totalWeight = 0;
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const rs of roleSkills) {
      const score = studentMap.get(rs.skill_id) || 20;
      weightedScore += score * rs.weight;
      totalWeight += rs.weight;

      if (score >= 65) {
        matchingSkills.push(rs.skill_name);
      } else {
        missingSkills.push(rs.skill_name);
      }
    }

    const compatibilityScore = Math.round(weightedScore / totalWeight);
    let status = 'Developing';
    if (compatibilityScore >= 75) status = 'Strong Alignment';
    else if (compatibilityScore >= 60) status = 'Moderate Alignment';
    else status = 'Significant Gaps';

    return {
      role,
      compatibilityScore,
      status,
      matchingSkills,
      missingSkills
    };
  });

  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  res.json(results);
});

export default router;
