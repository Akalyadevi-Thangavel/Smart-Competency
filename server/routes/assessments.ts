import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/assessments - list all assessments
router.get('/', (req, res) => {
  const assessments = db.prepare(`
    SELECT a.*, r.name as role_name
    FROM assessments a
    LEFT JOIN career_roles r ON a.role_id = r.id
  `).all();
  res.json(assessments);
});

// GET /api/assessments/:id - get assessment with questions
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const assessment = db.prepare(`
    SELECT a.*, r.name as role_name
    FROM assessments a
    LEFT JOIN career_roles r ON a.role_id = r.id
    WHERE a.id = ? OR a.slug = ?
  `).get(id, id) as any;

  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }

  const questions = db.prepare(`
    SELECT q.id, q.assessment_id, q.skill_id, q.question_text, q.question_type,
           q.options_json, q.difficulty, q.points, s.name as skill_name
    FROM questions q
    LEFT JOIN skills s ON q.skill_id = s.id
    WHERE q.assessment_id = ?
  `).all(assessment.id) as any[];

  const parsedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options_json)
  }));

  res.json({
    assessment,
    questions: parsedQuestions
  });
});

// POST /api/assessments/:id/submit - submit answers and calculate results
router.post('/:id/submit', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { answers = {}, timeSpentSeconds = 0 } = req.body; // answers: { [questionId]: selectedOptionIndex }

  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(id) as any;
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }

  const questions = db.prepare(`
    SELECT q.*, s.name as skill_name
    FROM questions q
    LEFT JOIN skills s ON q.skill_id = s.id
    WHERE q.assessment_id = ?
  `).all(assessment.id) as any[];

  let correctCount = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  const questionResults = [];

  for (const q of questions) {
    const userAnswer = answers[q.id];
    const correctAnswer = JSON.parse(q.correct_answer_json);
    totalPoints += q.points;

    let isCorrect = false;
    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer)) {
        isCorrect = JSON.stringify(correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
      }
    } else {
      isCorrect = Number(userAnswer) === Number(correctAnswer);
    }

    if (isCorrect) {
      correctCount++;
      earnedPoints += q.points;
    }

    questionResults.push({
      questionId: q.id,
      questionText: q.question_text,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: q.explanation,
      skillName: q.skill_name,
      difficulty: q.difficulty,
      points: q.points
    });
  }

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Save attempt
  db.prepare(`
    INSERT INTO assessment_attempts (
      id, user_id, assessment_id, score, percentage, status,
      answers_json, time_spent_seconds, completed_at
    ) VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, CURRENT_TIMESTAMP)
  `).run(
    attemptId,
    userId,
    assessment.id,
    earnedPoints,
    percentage,
    JSON.stringify(answers),
    timeSpentSeconds
  );

  // Update student skills and placement readiness
  CompetencyEngine.recordAssessmentResult(userId, assessment.id, earnedPoints, percentage);

  // Unlock first assessment achievement if first attempt
  const attemptCount = db.prepare('SELECT COUNT(*) as count FROM assessment_attempts WHERE user_id = ?').get(userId) as { count: number };
  if (attemptCount.count === 1) {
    db.prepare(`
      INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
      VALUES (?, ?, 'ach-first-assessment')
    `).run(`uach-${Date.now()}`, userId);

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link)
      VALUES (?, ?, 'Achievement Unlocked: First Diagnostic!', 'You earned 100 XP for completing your first assessment.', 'achievement', '/achievements')
    `).run(`notif-${Date.now()}`, userId);
  }

  res.json({
    attemptId,
    assessmentTitle: assessment.title,
    totalQuestions: questions.length,
    correctCount,
    earnedPoints,
    totalPoints,
    percentage,
    passed: percentage >= assessment.passing_score,
    timeSpentSeconds,
    questionResults
  });
});

// GET /api/assessments/attempts/history - user attempts
router.get('/attempts/history', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const history = db.prepare(`
    SELECT aa.*, a.title as assessment_title, a.category, a.passing_score
    FROM assessment_attempts aa
    JOIN assessments a ON aa.assessment_id = a.id
    WHERE aa.user_id = ?
    ORDER BY aa.completed_at DESC
  `).all(userId);
  res.json(history);
});

export default router;
