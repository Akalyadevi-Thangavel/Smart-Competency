import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';
import { CompetencyEngine } from '../services/competencyEngine.js';

const router = Router();

// GET /api/resume/latest - get latest resume analysis
router.get('/latest', authenticateToken, (req, res) => {
  const userId = req.user!.id;

  const resume = db.prepare(`
    SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(userId) as any;

  if (!resume) {
    res.json({ resume: null, analysis: null });
    return;
  }

  const analysis = db.prepare(`
    SELECT * FROM resume_analyses WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(resume.id) as any;

  res.json({
    resume,
    analysis: analysis ? {
      ...analysis,
      parsed_skills: JSON.parse(analysis.parsed_skills_json || '[]'),
      matched_skills: JSON.parse(analysis.matched_skills_json || '[]'),
      missing_skills: JSON.parse(analysis.missing_skills_json || '[]'),
      improvement_suggestions: JSON.parse(analysis.improvement_suggestions_json || '[]'),
      action_verb_rewrites: JSON.parse(analysis.action_verb_rewrites_json || '[]')
    } : null
  });
});

// POST /api/resume/analyze - analyze resume content
router.post('/analyze', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const { resumeText, filename = 'resume.pdf' } = req.body;

  if (!resumeText || resumeText.trim().length < 40) {
    res.status(400).json({ error: 'Please provide valid resume text or document content with sufficient detail.' });
    return;
  }

  const profile = db.prepare('SELECT target_role_id FROM profiles WHERE user_id = ?').get(userId) as any;
  const targetRoleId = profile?.target_role_id || 'role-fullstack';

  // Analyze via AIService
  const analysisResult = await AIService.analyzeResumeText(resumeText, targetRoleId);

  const resumeId = `res-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Store in database
  db.prepare(`
    INSERT INTO resumes (id, user_id, filename, file_size, parsed_content, target_role_id, overall_score, keyword_coverage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resumeId,
    userId,
    filename,
    resumeText.length,
    resumeText,
    targetRoleId,
    analysisResult.atsScore,
    analysisResult.keywordScore
  );

  const analysisId = `rana-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  db.prepare(`
    INSERT INTO resume_analyses (
      id, resume_id, parsed_skills_json, matched_skills_json, missing_skills_json,
      project_score, formatting_score, improvement_suggestions_json, action_verb_rewrites_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    analysisId,
    resumeId,
    JSON.stringify(analysisResult.matchedKeywords),
    JSON.stringify(analysisResult.matchedKeywords),
    JSON.stringify(analysisResult.missingKeywords),
    80.0,
    analysisResult.formattingScore,
    JSON.stringify(analysisResult.improvementTips),
    JSON.stringify(analysisResult.actionVerbRewrites)
  );

  // Recalculate Placement Readiness
  CompetencyEngine.calculatePlacementReadiness(userId);

  // Trigger achievement if ATS score >= 80
  if (analysisResult.atsScore >= 80) {
    db.prepare(`
      INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
      VALUES (?, ?, 'ach-resume-ready')
    `).run(`uach-${Date.now()}`, userId);
  }

  res.json({
    message: 'Resume analyzed successfully',
    resumeId,
    analysis: {
      atsScore: analysisResult.atsScore,
      keywordScore: analysisResult.keywordScore,
      formattingScore: analysisResult.formattingScore,
      matched_skills: analysisResult.matchedKeywords,
      missing_skills: analysisResult.missingKeywords,
      improvement_suggestions: analysisResult.improvementTips,
      action_verb_rewrites: analysisResult.actionVerbRewrites
    }
  });
});

export default router;
