import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply auth and admin check
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/overview - placement cell analytics dashboard
router.get('/overview', (req, res) => {
  const totalStudents = db.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role = 'student'
  `).get() as { count: number };

  const averages = db.prepare(`
    SELECT
      AVG(overall_competency) as avg_competency,
      AVG(placement_readiness) as avg_readiness
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE u.role = 'student'
  `).get() as any;

  const totalAssessmentsTaken = db.prepare(`
    SELECT COUNT(*) as count FROM assessment_attempts
  `).get() as { count: number };

  const roleDistribution = db.prepare(`
    SELECT r.name as role_name, COUNT(p.user_id) as student_count
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    JOIN career_roles r ON p.target_role_id = r.id
    WHERE u.role = 'student'
    GROUP BY r.name
    ORDER BY student_count DESC
  `).all();

  const topSkillGaps = db.prepare(`
    SELECT s.name as skill_name, s.category, AVG(ss.current_score) as avg_score, COUNT(ss.user_id) as assessed_count
    FROM student_skills ss
    JOIN skills s ON ss.skill_id = s.id
    GROUP BY s.name, s.category
    ORDER BY avg_score ASC
    LIMIT 5
  `).all();

  const readinessTiers = [
    { tier: 'Highly Competitive (80%+)', count: 0 },
    { tier: 'Placement Ready (70-79%)', count: 0 },
    { tier: 'Developing (50-69%)', count: 0 },
    { tier: 'Needs Immediate Focus (<50%)', count: 0 }
  ];

  const studentReadiness = db.prepare(`
    SELECT p.placement_readiness FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE u.role = 'student'
  `).all() as { placement_readiness: number }[];

  for (const sr of studentReadiness) {
    if (sr.placement_readiness >= 80) readinessTiers[0].count++;
    else if (sr.placement_readiness >= 70) readinessTiers[1].count++;
    else if (sr.placement_readiness >= 50) readinessTiers[2].count++;
    else readinessTiers[3].count++;
  }

  res.json({
    totalStudents: totalStudents.count,
    avgCompetency: Math.round(averages?.avg_competency || 0),
    avgReadiness: Math.round(averages?.avg_readiness || 0),
    totalAssessmentsTaken: totalAssessmentsTaken.count,
    roleDistribution,
    topSkillGaps,
    readinessTiers
  });
});

// GET /api/admin/students - student roster with search & filters
router.get('/students', (req, res) => {
  const { search, role, branch } = req.query;

  let query = `
    SELECT
      p.user_id, p.full_name, u.email, p.college, p.degree, p.branch, p.year,
      p.overall_competency, p.placement_readiness, p.learning_streak,
      r.name as target_role_name,
      (SELECT COUNT(*) FROM assessment_attempts WHERE user_id = p.user_id) as total_assessments,
      (SELECT COUNT(DISTINCT problem_id) FROM coding_submissions WHERE user_id = p.user_id AND status = 'Accepted') as coding_solved
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN career_roles r ON p.target_role_id = r.id
    WHERE u.role = 'student'
  `;

  const params: any[] = [];

  if (search) {
    query += ' AND (p.full_name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role && role !== 'All') {
    query += ' AND r.name = ?';
    params.push(role);
  }

  if (branch && branch !== 'All') {
    query += ' AND p.branch = ?';
    params.push(branch);
  }

  query += ' ORDER BY p.placement_readiness DESC';

  const students = db.prepare(query).all(...params);
  res.json(students);
});

// POST /api/admin/questions - create question
router.post('/questions', (req, res) => {
  const {
    assessment_id,
    skill_id,
    question_text,
    question_type = 'mcq',
    options = [],
    correct_answer = 0,
    explanation,
    difficulty = 'Intermediate',
    points = 10
  } = req.body;

  if (!assessment_id || !question_text || options.length === 0) {
    res.status(400).json({ error: 'Assessment ID, question text, and options are required' });
    return;
  }

  const qId = `q-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  db.prepare(`
    INSERT INTO questions (
      id, assessment_id, skill_id, question_text, question_type,
      options_json, correct_answer_json, explanation, difficulty, points
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    qId,
    assessment_id,
    skill_id || null,
    question_text,
    question_type,
    JSON.stringify(options),
    JSON.stringify(correct_answer),
    explanation || '',
    difficulty,
    points
  );

  // Update assessment question count
  const count = db.prepare('SELECT COUNT(*) as count FROM questions WHERE assessment_id = ?').get(assessment_id) as { count: number };
  db.prepare('UPDATE assessments SET total_questions = ? WHERE id = ?').run(count.count, assessment_id);

  res.status(201).json({ message: 'Question created successfully', questionId: qId });
});

export default router;
