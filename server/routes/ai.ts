import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AIService, AIChatMessage } from '../services/aiService.js';

const router = Router();

// POST /api/ai/coach/chat - send prompt to AI career coach
router.post('/coach/chat', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const { message, sessionId = 'default-session' } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Message cannot be empty' });
    return;
  }

  // Load prior messages for this session
  const history = db.prepare(`
    SELECT role, message as content
    FROM ai_conversations
    WHERE user_id = ? AND session_id = ?
    ORDER BY created_at ASC
    LIMIT 20
  `).all(userId, sessionId) as AIChatMessage[];

  // Append new user message
  history.push({ role: 'user', content: message.trim() });

  // Save user message to database
  db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, role, message)
    VALUES (?, ?, ?, 'user', ?)
  `).run(`aic-${Date.now()}-u`, userId, sessionId, message.trim());

  // Generate response
  const assistantReply = await AIService.chatWithCoach(userId, history);

  // Save assistant reply
  db.prepare(`
    INSERT INTO ai_conversations (id, user_id, session_id, role, message)
    VALUES (?, ?, ?, 'assistant', ?)
  `).run(`aic-${Date.now()}-a`, userId, sessionId, assistantReply);

  res.json({
    role: 'assistant',
    message: assistantReply,
    sessionId,
    timestamp: new Date().toISOString()
  });
});

// GET /api/ai/coach/history
router.get('/coach/history', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { sessionId = 'default-session' } = req.query;

  const messages = db.prepare(`
    SELECT id, role, message, created_at as timestamp
    FROM ai_conversations
    WHERE user_id = ? AND session_id = ?
    ORDER BY created_at ASC
  `).all(userId, sessionId as string);

  res.json(messages);
});

// DELETE /api/ai/coach/history
router.delete('/coach/history', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const { sessionId = 'default-session' } = req.query;

  db.prepare('DELETE FROM ai_conversations WHERE user_id = ? AND session_id = ?').run(userId, sessionId as string);
  res.json({ message: 'Conversation history cleared' });
});

export default router;
