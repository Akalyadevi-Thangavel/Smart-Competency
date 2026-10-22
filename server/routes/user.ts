import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const profile = db.prepare(`
    SELECT p.*, r.name as target_role_name, r2.name as secondary_role_name, u.email
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN career_roles r ON p.target_role_id = r.id
    LEFT JOIN career_roles r2 ON p.secondary_role_id = r2.id
    WHERE p.user_id = ?
  `).get(userId);

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json(profile);
});

// PUT /api/user/profile
router.put('/profile', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const {
    full_name,
    college,
    degree,
    branch,
    year,
    grad_year,
    target_role_id,
    secondary_role_id,
    daily_hours,
    learning_style,
    github_url,
    linkedin_url,
    bio
  } = req.body;

  db.prepare(`
    UPDATE profiles SET
      full_name = COALESCE(?, full_name),
      college = COALESCE(?, college),
      degree = COALESCE(?, degree),
      branch = COALESCE(?, branch),
      year = COALESCE(?, year),
      grad_year = COALESCE(?, grad_year),
      target_role_id = COALESCE(?, target_role_id),
      secondary_role_id = COALESCE(?, secondary_role_id),
      daily_hours = COALESCE(?, daily_hours),
      learning_style = COALESCE(?, learning_style),
      github_url = COALESCE(?, github_url),
      linkedin_url = COALESCE(?, linkedin_url),
      bio = COALESCE(?, bio),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    full_name, college, degree, branch, year, grad_year,
    target_role_id, secondary_role_id, daily_hours, learning_style,
    github_url, linkedin_url, bio, userId
  );

  const updated = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  res.json({ message: 'Profile updated successfully', profile: updated });
});

// POST /api/user/onboarding
router.post('/onboarding', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const {
    college,
    degree,
    branch,
    year,
    grad_year,
    target_role_id,
    secondary_role_id,
    daily_hours,
    learning_style,
    experience_level,
    github_url,
    linkedin_url
  } = req.body;

  db.prepare(`
    UPDATE profiles SET
      college = ?,
      degree = ?,
      branch = ?,
      year = ?,
      grad_year = ?,
      target_role_id = ?,
      secondary_role_id = ?,
      daily_hours = ?,
      learning_style = ?,
      experience_level = ?,
      github_url = ?,
      linkedin_url = ?,
      onboarding_completed = 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    college, degree, branch, year, grad_year,
    target_role_id, secondary_role_id, daily_hours || 2.0,
    learning_style || 'Practical / Project-Based',
    experience_level || 'Beginner',
    github_url, linkedin_url, userId
  );

  // Initialize learning path if none exists
  const existingPath = db.prepare('SELECT id FROM learning_paths WHERE user_id = ?').get(userId);
  if (!existingPath) {
    const lpId = `lp-${userId}`;
    db.prepare(`
      INSERT INTO learning_paths (id, user_id, role_id, title, current_phase, total_items, completed_items)
      VALUES (?, ?, ?, 'Personalized Career Roadmap', 'Foundation', 8, 0)
    `).run(lpId, userId, target_role_id || 'role-fullstack');
  }

  // Calculate initial readiness
  CompetencyEngine.calculatePlacementReadiness(userId);

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  res.json({ message: 'Onboarding complete', profile });
});

// GET /api/user/dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  const userId = req.user!.id;

  const profile = db.prepare(`
    SELECT p.*, r.name as target_role_name, r.category as role_category
    FROM profiles p
    LEFT JOIN career_roles r ON p.target_role_id = r.id
    WHERE p.user_id = ?
  `).get(userId) as any;

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const roleId = profile.target_role_id || 'role-fullstack';
  const skillGaps = CompetencyEngine.calculateSkillGaps(userId, roleId);
  const readiness = CompetencyEngine.calculatePlacementReadiness(userId);

  // Learning path
  const learningPath = db.prepare(`
    SELECT * FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(userId) as any;

  const recentLearningItems = learningPath ? db.prepare(`
    SELECT * FROM learning_items WHERE learning_path_id = ? ORDER BY order_index ASC LIMIT 5
  `).all(learningPath.id) : [];

  // Coding stats
  const codingStats = db.prepare(`
    SELECT
      COUNT(DISTINCT problem_id) as total_attempted,
      COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as total_solved
    FROM coding_submissions
    WHERE user_id = ?
  `).get(userId) as any;

  // Daily tasks for today
  const todayStr = new Date().toISOString().split('T')[0];
  let dailyTasks = db.prepare(`
    SELECT * FROM daily_tasks WHERE user_id = ? AND date = ? ORDER BY created_at ASC
  `).all(userId, todayStr);

  // If no tasks for today, generate standard dynamic tasks
  if (dailyTasks.length === 0) {
    const defaultTasks = [
      { type: 'learning', title: `Review ${skillGaps[0]?.skillName || 'Core Fundamentals'} Concepts`, desc: 'Spend 30 minutes mastering key definitions and best practices.', link: '/learning-path' },
      { type: 'coding', title: 'Solve 1 Algorithmic Problem in Coding Lab', desc: 'Maintain your algorithmic problem-solving streak.', link: '/coding-lab' },
      { type: 'interview', title: 'Answer 1 AI Mock Interview Question', desc: 'Articulate technical decision-making clearly.', link: '/interview-prep' },
      { type: 'aptitude', title: 'Quick Aptitude & Reasoning Drill', desc: '5 questions to sharpen speed calculation.', link: '/aptitude' }
    ];
    for (const dt of defaultTasks) {
      db.prepare(`
        INSERT INTO daily_tasks (id, user_id, date, task_type, title, description, link_to_module, is_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(`dt-${Date.now()}-${Math.random().toString(36).substring(7)}`, userId, todayStr, dt.type, dt.title, dt.desc, dt.link);
    }
    dailyTasks = db.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND date = ?').all(userId, todayStr);
  }

  // Recent assessment attempts
  const recentAttempts = db.prepare(`
    SELECT aa.*, a.title as assessment_title, a.category
    FROM assessment_attempts aa
    JOIN assessments a ON aa.assessment_id = a.id
    WHERE aa.user_id = ?
    ORDER BY aa.completed_at DESC
    LIMIT 3
  `).all(userId);

  // Unread notifications count
  const unreadNotifs = db.prepare(`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
  `).get(userId) as { count: number };

  // Recent achievements
  const recentAchievements = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
    LIMIT 4
  `).all(userId);

  res.json({
    profile,
    placementReadiness: readiness,
    skillGaps: skillGaps.slice(0, 4), // top 4 priority gaps
    totalGapsCount: skillGaps.filter(g => g.gapPercentage > 20).length,
    learningPath,
    recentLearningItems,
    codingStats,
    dailyTasks,
    recentAttempts,
    unreadNotificationsCount: unreadNotifs.count,
    recentAchievements,
    aiRecommendation: {
      title: `Recommended Next Action for ${profile.target_role_name || 'Your Role'}`,
      description: skillGaps.length > 0
        ? `Your biggest competency delta is in ${skillGaps[0].skillName} (${skillGaps[0].gapPercentage}% gap). Completing the recommended practice module will raise your Placement Readiness to approximately ${Math.min(95, readiness.overallReadiness + 4)}%.`
        : 'Take your first diagnostic assessment to generate your personalized learning path!',
      actionText: skillGaps.length > 0 ? `Learn ${skillGaps[0].skillName}` : 'Start Diagnostic',
      actionLink: skillGaps.length > 0 ? '/learning-path' : '/assessments'
    }
  });
});

// GET /api/user/daily-tasks
router.get('/daily-tasks', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().split('T')[0];
  const tasks = db.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND date = ?').all(userId, todayStr);
  res.json(tasks);
});

// POST /api/user/daily-tasks/:id/toggle
router.post('/daily-tasks/:id/toggle', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const newStatus = task.is_completed ? 0 : 1;
  db.prepare('UPDATE daily_tasks SET is_completed = ? WHERE id = ?').run(newStatus, id);

  res.json({ message: 'Task updated', is_completed: newStatus });
});

// GET /api/user/notifications
router.get('/notifications', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(userId);
  res.json(notifs);
});

// POST /api/user/notifications/:id/read
router.post('/notifications/:id/read', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Notification marked as read' });
});

export default router;
