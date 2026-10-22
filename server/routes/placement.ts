import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/placement/readiness - 8-dimension placement breakdown
router.get('/readiness', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const breakdown = CompetencyEngine.calculatePlacementReadiness(userId);
  res.json(breakdown);
});

export default router;
