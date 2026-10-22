import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/learning/path - get student's active roadmap
router.get('/path', authenticateToken, (req, res) => {
  const userId = req.user!.id;

  let path = db.prepare(`
    SELECT lp.*, r.name as role_name
    FROM learning_paths lp
    LEFT JOIN career_roles r ON lp.role_id = r.id
    WHERE lp.user_id = ?
    ORDER BY lp.created_at DESC
    LIMIT 1
  `).get(userId) as any;

  if (!path) {
    const profile = db.prepare('SELECT target_role_id FROM profiles WHERE user_id = ?').get(userId) as any;
    const roleId = profile?.target_role_id || 'role-fullstack';
    const lpId = `lp-${userId}`;

    db.prepare(`
      INSERT INTO learning_paths (id, user_id, role_id, title, current_phase, total_items, completed_items)
      VALUES (?, ?, ?, 'Personalized Career Roadmap', 'Core Skills', 0, 0)
    `).run(lpId, userId, roleId);

    path = db.prepare('SELECT * FROM learning_paths WHERE id = ?').get(lpId);
  }

  const items = db.prepare(`
    SELECT li.*, s.name as skill_name, s.category as skill_category
    FROM learning_items li
    LEFT JOIN skills s ON li.skill_id = s.id
    WHERE li.learning_path_id = ?
    ORDER BY li.order_index ASC
  `).all(path.id) as any[];

  // Group by phase
  const phases = ['Foundation', 'Core Skills', 'Intermediate Skills', 'Advanced Skills', 'Projects', 'Interview Prep', 'Placement Readiness'];
  const groupedByPhase: Record<string, any[]> = {};
  for (const ph of phases) {
    groupedByPhase[ph] = [];
  }

  for (const item of items) {
    if (!groupedByPhase[item.phase]) {
      groupedByPhase[item.phase] = [];
    }
    groupedByPhase[item.phase].push(item);
  }

  const completedCount = items.filter(i => i.is_completed === 1).length;
  const progressPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  res.json({
    path,
    items,
    groupedByPhase,
    totalItems: items.length,
    completedItems: completedCount,
    progressPercentage
  });
});

// POST /api/learning/item/:id/toggle - toggle learning item completion
router.post('/item/:id/toggle', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const item = db.prepare(`
    SELECT li.*, lp.user_id, lp.id as path_id
    FROM learning_items li
    JOIN learning_paths lp ON li.learning_path_id = lp.id
    WHERE li.id = ? AND lp.user_id = ?
  `).get(id, userId) as any;

  if (!item) {
    res.status(404).json({ error: 'Learning item not found' });
    return;
  }

  const newStatus = item.is_completed ? 0 : 1;
  db.prepare(`
    UPDATE learning_items
    SET is_completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE id = ?
  `).run(newStatus, newStatus, id);

  // Update total completed count in path
  const completedCount = db.prepare(`
    SELECT COUNT(*) as count FROM learning_items WHERE learning_path_id = ? AND is_completed = 1
  `).get(item.path_id) as { count: number };

  db.prepare(`
    UPDATE learning_paths SET completed_items = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(completedCount.count, item.path_id);

  res.json({
    message: 'Item status updated',
    is_completed: newStatus,
    completedItems: completedCount.count
  });
});

export default router;
