import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/interview/questions - list questions
router.get('/questions', authenticateToken, (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM interview_questions WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY id ASC';

  const questions = db.prepare(query).all(...params) as any[];
  const parsed = questions.map(q => ({
    ...q,
    key_points: JSON.parse(q.key_points_json || '[]')
  }));

  res.json(parsed);
});

// POST /api/interview/evaluate - submit answer and receive AI critique
router.post('/evaluate', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const { questionId, studentAnswer } = req.body;

  if (!questionId || !studentAnswer) {
    res.status(400).json({ error: 'Question ID and student answer are required' });
    return;
  }

  const question = db.prepare('SELECT * FROM interview_questions WHERE id = ?').get(questionId) as any;
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const keyPoints = JSON.parse(question.key_points_json || '[]');
  const evaluation = await AIService.evaluateInterviewAnswer(question.question_text, studentAnswer, keyPoints);

  const attemptId = `iatt-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  db.prepare(`
    INSERT INTO interview_attempts (
      id, user_id, question_id, student_answer, ai_score, ai_feedback, key_points_hit_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    attemptId,
    userId,
    question.id,
    studentAnswer,
    evaluation.score,
    evaluation.feedback,
    JSON.stringify(evaluation.strengths)
  );

  // Recalculate Placement Readiness
  CompetencyEngine.calculatePlacementReadiness(userId);

  // Trigger achievement if 3+ attempts
  const countAttempts = db.prepare('SELECT COUNT(*) as count FROM interview_attempts WHERE user_id = ?').get(userId) as { count: number };
  if (countAttempts.count >= 3) {
    db.prepare(`
      INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
      VALUES (?, ?, 'ach-interview-prep')
    `).run(`uach-${Date.now()}`, userId);
  }

  res.json({
    attemptId,
    evaluation
  });
});

// GET /api/interview/history - attempts history
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const history = db.prepare(`
    SELECT ia.*, iq.question_text, iq.category, iq.difficulty
    FROM interview_attempts ia
    JOIN interview_questions iq ON ia.question_id = iq.id
    WHERE ia.user_id = ?
    ORDER BY ia.submitted_at DESC
  `).all(userId);
  res.json(history);
});

export default router;
