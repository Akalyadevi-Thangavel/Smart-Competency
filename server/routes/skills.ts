import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/skills/matrix - full skill matrix
router.get('/matrix', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const profile = db.prepare('SELECT target_role_id FROM profiles WHERE user_id = ?').get(userId) as any;
  const roleId = profile?.target_role_id || 'role-fullstack';

  const skills = db.prepare(`
    SELECT s.*,
           COALESCE(ss.current_level, 'Beginner') as current_level,
           COALESCE(ss.current_score, 20.0) as current_score,
           COALESCE(ss.confidence, 50.0) as confidence,
           COALESCE(ss.trend, 'neutral') as trend,
           ss.last_assessed_at,
           COALESCE(rs.required_level, 'Intermediate') as required_level,
           COALESCE(rs.priority, 'Medium') as role_priority
    FROM skills s
    LEFT JOIN student_skills ss ON s.id = ss.skill_id AND ss.user_id = ?
    LEFT JOIN role_skills rs ON s.id = rs.skill_id AND rs.role_id = ?
    ORDER BY s.category ASC, s.name ASC
  `).all(userId, roleId) as any[];

  // Group by category
  const categorized: Record<string, any[]> = {};
  for (const s of skills) {
    if (!categorized[s.category]) {
      categorized[s.category] = [];
    }
    categorized[s.category].push(s);
  }

  res.json({
    skills,
    categorized,
    totalSkills: skills.length,
    assessedSkills: skills.filter(s => s.last_assessed_at !== null).length
  });
});

// GET /api/skills/gaps - skill gaps for current role
router.get('/gaps', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const profile = db.prepare('SELECT target_role_id FROM profiles WHERE user_id = ?').get(userId) as any;
  const roleId = profile?.target_role_id || 'role-fullstack';

  const gaps = CompetencyEngine.calculateSkillGaps(userId, roleId);
  res.json(gaps);
});

// GET /api/skills/:id - single skill details with learning resources & interview questions
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(id) as any;
  if (!skill) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }

  const studentSkill = db.prepare(`
    SELECT * FROM student_skills WHERE user_id = ? AND skill_id = ?
  `).get(userId, id);

  const learningItems = db.prepare(`
    SELECT li.*, lp.title as path_title
    FROM learning_items li
    JOIN learning_paths lp ON li.learning_path_id = lp.id
    WHERE li.skill_id = ? AND lp.user_id = ?
  `).all(id, userId);

  const interviewQuestions = db.prepare(`
    SELECT * FROM interview_questions WHERE question_text LIKE ? LIMIT 3
  `).all(`%${skill.name.split(' ')[0]}%`);

  res.json({
    skill,
    studentSkill,
    learningItems,
    interviewQuestions
  });
});

export default router;
