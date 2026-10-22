import { Router } from 'express';
import { db } from '../db/database.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/leaderboard - leaderboard rankings
router.get('/', optionalAuthenticateToken, (req, res) => {
  const currentUserId = req.user?.id;

  const students = db.prepare(`
    SELECT
      p.user_id,
      p.full_name,
      p.college,
      p.branch,
      p.year,
      p.overall_competency,
      p.placement_readiness,
      p.learning_streak,
      p.avatar_url,
      r.name as target_role_name,
      (SELECT COUNT(DISTINCT problem_id) FROM coding_submissions WHERE user_id = p.user_id AND status = 'Accepted') as coding_solved,
      (SELECT COUNT(*) FROM user_achievements WHERE user_id = p.user_id) as badges_count
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN career_roles r ON p.target_role_id = r.id
    WHERE u.role = 'student'
    ORDER BY p.placement_readiness DESC, p.overall_competency DESC
    LIMIT 50
  `).all() as any[];

  const ranked = students.map((s, idx) => ({
    rank: idx + 1,
    ...s,
    isCurrentUser: s.user_id === currentUserId
  }));

  res.json(ranked);
});

export default router;
