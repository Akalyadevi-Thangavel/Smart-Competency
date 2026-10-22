import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seedData.js';

// Route imports
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import assessmentsRouter from './routes/assessments.js';
import skillsRouter from './routes/skills.js';
import rolesRouter from './routes/roles.js';
import learningRouter from './routes/learning.js';
import resumeRouter from './routes/resume.js';
import codingRouter from './routes/coding.js';
import interviewRouter from './routes/interview.js';
import projectsRouter from './routes/projects.js';
import placementRouter from './routes/placement.js';
import aiRouter from './routes/ai.js';
import leaderboardRouter from './routes/leaderboard.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize and seed database if necessary
try {
  initDatabase();
  seedDatabase();
} catch (err: any) {
  console.error('[Server] Database initialization warning:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Smart Competency AI Platform',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/learning', learningRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/coding', codingRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/placement', placementRouter);
app.use('/api/ai', aiRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter);

// Serve static frontend files in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Endpoint not found' });
    return;
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Smart Competency API Server Running. Start Vite client on port 5173 for development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Smart Competency Server] Running on http://localhost:${PORT}`);
  console.log(`[Smart Competency Server] API endpoints available at http://localhost:${PORT}/api/`);
});
