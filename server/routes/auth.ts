import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_competency_secure_jwt_token_key_change_in_production';

// Helper to create token
function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, fullName, college, targetRoleId } = req.body;

  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'Email, password, and full name are required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, 'student')
  `).run(userId, email.toLowerCase().trim(), passwordHash);

  db.prepare(`
    INSERT INTO profiles (user_id, full_name, college, target_role_id, onboarding_completed)
    VALUES (?, ?, ?, ?, 0)
  `).run(userId, fullName.trim(), college || 'Apex Institute of Technology', targetRoleId || 'role-fullstack');

  const token = generateToken({ id: userId, email, role: 'student' });
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: userId, email, role: 'student' },
    profile
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, role: user.role },
    profile
  });
});

// POST /api/auth/demo-login
router.post('/demo-login', (req, res) => {
  const { role = 'student' } = req.body;
  const email = role === 'admin' ? 'admin@smartcompetency.com' : 'student@smartcompetency.com';

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    res.status(404).json({ error: 'Demo account not initialized. Please run seed.' });
    return;
  }

  const token = generateToken(user);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);

  res.json({
    message: `Logged in as demo ${role}`,
    token,
    user: { id: user.id, email: user.email, role: user.role },
    profile
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = db.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').get(req.user.id) as any;
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user, profile });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  // Simulated secure reset
  res.json({
    message: `Password reset instructions have been dispatched to ${email || 'your email'}.`
  });
});

export default router;
