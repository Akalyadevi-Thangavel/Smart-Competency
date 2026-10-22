import { db } from '../db/database.js';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: string;
  targetLevel: string;
  currentScore: number;
  targetScore: number;
  gapPercentage: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  weight: number;
  reason: string;
  recommendedAction: string;
  estimatedHours: number;
}

export interface PlacementReadinessBreakdown {
  overallReadiness: number;
  status: 'Needs Immediate Focus' | 'Developing Competency' | 'Placement Ready' | 'Highly Competitive';
  dimensions: {
    technical: { score: number; weight: number; status: string; label: string };
    coding: { score: number; weight: number; status: string; label: string };
    aptitude: { score: number; weight: number; status: string; label: string };
    communication: { score: number; weight: number; status: string; label: string };
    resume: { score: number; weight: number; status: string; label: string };
    projects: { score: number; weight: number; status: string; label: string };
    interview: { score: number; weight: number; status: string; label: string };
    consistency: { score: number; weight: number; status: string; label: string };
  };
  methodology: string;
  topStrengths: string[];
  topImprovementAreas: string[];
}

const LEVEL_SCORE_MAP: Record<string, number> = {
  'Beginner': 30,
  'Developing': 55,
  'Intermediate': 75,
  'Advanced': 90,
  'Job Ready': 100
};

export class CompetencyEngine {
  /**
   * Calculate detailed skill gaps for a user against a target career role
   */
  static calculateSkillGaps(userId: string, roleId: string): SkillGapItem[] {
    const roleSkills = db.prepare(`
      SELECT rs.*, s.name as skill_name, s.category
      FROM role_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.role_id = ?
      ORDER BY rs.weight DESC
    `).all(roleId) as any[];

    const studentSkills = db.prepare(`
      SELECT skill_id, current_level, current_score, confidence
      FROM student_skills
      WHERE user_id = ?
    `).all(userId) as any[];

    const studentSkillMap = new Map<string, any>();
    for (const ss of studentSkills) {
      studentSkillMap.set(ss.skill_id, ss);
    }

    const gaps: SkillGapItem[] = [];

    for (const rs of roleSkills) {
      const studentSkill = studentSkillMap.get(rs.skill_id);
      const currentLevel = studentSkill ? studentSkill.current_level : 'Beginner';
      const currentScore = studentSkill ? studentSkill.current_score : 20.0;
      const targetScore = LEVEL_SCORE_MAP[rs.required_level] || 75;

      const gapScore = Math.max(0, targetScore - currentScore);
      const gapPercentage = Math.round((gapScore / targetScore) * 100);

      let reason = '';
      let recommendedAction = '';
      let estimatedHours = 10;

      if (gapPercentage > 40) {
        reason = `Fundamental concepts in ${rs.skill_name} require structured learning to satisfy ${rs.required_level} role expectations.`;
        recommendedAction = `Begin foundational roadmap modules and complete hands-on practice labs for ${rs.skill_name}.`;
        estimatedHours = Math.round(gapPercentage * 0.4);
      } else if (gapPercentage > 15) {
        reason = `Solid progress, but advanced edge-case patterns and practical problem solving are needed.`;
        recommendedAction = `Focus on intermediate problem-solving and implement ${rs.skill_name} in your portfolio projects.`;
        estimatedHours = Math.round(gapPercentage * 0.3);
      } else {
        reason = `Current competency aligns well with entry-to-mid career benchmark standards.`;
        recommendedAction = `Maintain competency through periodic mock assessments and review questions.`;
        estimatedHours = 5;
      }

      gaps.push({
        skillId: rs.skill_id,
        skillName: rs.skill_name,
        category: rs.category,
        currentLevel,
        targetLevel: rs.required_level,
        currentScore: Math.round(currentScore),
        targetScore,
        gapPercentage,
        priority: rs.priority as any,
        weight: rs.weight,
        reason,
        recommendedAction,
        estimatedHours: Math.max(4, estimatedHours)
      });
    }

    // Sort by priority (Critical > High > Medium > Low) and then by gap percentage
    const priorityWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    gaps.sort((a, b) => {
      const pwDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pwDiff !== 0) return pwDiff;
      return b.gapPercentage - a.gapPercentage;
    });

    return gaps;
  }

  /**
   * Transparent Composite Placement Readiness Calculation
   */
  static calculatePlacementReadiness(userId: string): PlacementReadinessBreakdown {
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    const targetRoleId = profile?.target_role_id || 'role-fullstack';

    // 1. Technical Competency (Average score of role-required technical skills)
    const techSkills = db.prepare(`
      SELECT ss.current_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ? AND s.category IN ('Technical', 'Core CS')
    `).all(userId) as { current_score: number }[];
    const techScore = techSkills.length > 0
      ? Math.round(techSkills.reduce((acc, s) => acc + s.current_score, 0) / techSkills.length)
      : 50;

    // 2. Coding Score (Submissions and problem performance)
    const submissions = db.prepare(`
      SELECT status, COUNT(*) as cnt
      FROM coding_submissions
      WHERE user_id = ?
      GROUP BY status
    `).all(userId) as any[];
    const acceptedCount = submissions.find(s => s.status === 'Accepted')?.cnt || 0;
    const codingScore = Math.min(100, Math.max(30, 45 + acceptedCount * 15));

    // 3. Aptitude Score
    const aptitudeSkill = db.prepare(`
      SELECT AVG(ss.current_score) as avg_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ? AND s.category = 'Aptitude'
    `).get(userId) as any;
    const aptitudeScore = Math.round(aptitudeSkill?.avg_score || 60);

    // 4. Communication & Soft Skills
    const commSkill = db.prepare(`
      SELECT AVG(ss.current_score) as avg_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ? AND s.category = 'Soft Skills'
    `).get(userId) as any;
    const commScore = Math.round(commSkill?.avg_score || 68);

    // 5. Resume Score
    const resume = db.prepare(`
      SELECT overall_score FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;
    const resumeScore = Math.round(resume?.overall_score || 65);

    // 6. Project Score
    const project = db.prepare(`
      SELECT AVG(strength_score) as avg_score, COUNT(*) as cnt FROM projects WHERE user_id = ?
    `).get(userId) as any;
    const projectScore = project.cnt > 0 ? Math.round(project.avg_score) : 40;

    // 7. Interview Readiness
    const interviewAttempts = db.prepare(`
      SELECT AVG(ai_score) as avg_score, COUNT(*) as cnt FROM interview_attempts WHERE user_id = ?
    `).get(userId) as any;
    const interviewScore = interviewAttempts.cnt > 0 ? Math.round(interviewAttempts.avg_score) : 60;

    // 8. Consistency (Learning streak + weekly hours factor)
    const streak = profile?.learning_streak || 1;
    const weeklyHours = profile?.weekly_hours || 5;
    const consistencyScore = Math.min(100, Math.round((streak * 5) + (weeklyHours * 3.5)));

    // Weights configuration (Transparent composite formula)
    const weights = {
      technical: 0.25,
      coding: 0.20,
      aptitude: 0.10,
      communication: 0.10,
      resume: 0.10,
      projects: 0.10,
      interview: 0.10,
      consistency: 0.05
    };

    const overall = Math.round(
      techScore * weights.technical +
      codingScore * weights.coding +
      aptitudeScore * weights.aptitude +
      commScore * weights.communication +
      resumeScore * weights.resume +
      projectScore * weights.projects +
      interviewScore * weights.interview +
      consistencyScore * weights.consistency
    );

    let status: PlacementReadinessBreakdown['status'] = 'Developing Competency';
    if (overall >= 80) status = 'Highly Competitive';
    else if (overall >= 70) status = 'Placement Ready';
    else if (overall < 50) status = 'Needs Immediate Focus';

    // Identify top strengths and improvements
    const dimensionList = [
      { name: 'Technical Depth', score: techScore },
      { name: 'Algorithmic Coding', score: codingScore },
      { name: 'Quantitative Aptitude', score: aptitudeScore },
      { name: 'Technical Communication', score: commScore },
      { name: 'ATS Resume Score', score: resumeScore },
      { name: 'Portfolio Projects', score: projectScore },
      { name: 'Interview Articulation', score: interviewScore },
      { name: 'Consistency & Study Routine', score: consistencyScore },
    ];
    dimensionList.sort((a, b) => b.score - a.score);

    const topStrengths = dimensionList.slice(0, 2).map(d => `${d.name} (${d.score}%)`);
    const topImprovementAreas = dimensionList.slice(-2).reverse().map(d => `${d.name} (${d.score}%)`);

    // Update profile in DB with newly calculated readiness
    db.prepare(`
      UPDATE profiles
      SET placement_readiness = ?, overall_competency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(overall, techScore, userId);

    return {
      overallReadiness: overall,
      status,
      dimensions: {
        technical: { score: techScore, weight: weights.technical, status: techScore >= 70 ? 'On Track' : 'Needs Focus', label: 'Technical Depth' },
        coding: { score: codingScore, weight: weights.coding, status: codingScore >= 70 ? 'On Track' : 'Needs Practice', label: 'Coding Lab' },
        aptitude: { score: aptitudeScore, weight: weights.aptitude, status: aptitudeScore >= 65 ? 'On Track' : 'Review Required', label: 'Aptitude & Logic' },
        communication: { score: commScore, weight: weights.communication, status: commScore >= 70 ? 'On Track' : 'Needs Practice', label: 'Soft Skills' },
        resume: { score: resumeScore, weight: weights.resume, status: resumeScore >= 75 ? 'Optimized' : 'Revision Suggested', label: 'Resume ATS' },
        projects: { score: projectScore, weight: weights.projects, status: projectScore >= 70 ? 'Strong' : 'Add Production Work', label: 'Project Portfolio' },
        interview: { score: interviewScore, weight: weights.interview, status: interviewScore >= 70 ? 'Prepared' : 'Mock Drills Needed', label: 'Interview Readiness' },
        consistency: { score: consistencyScore, weight: weights.consistency, status: consistencyScore >= 70 ? 'High' : 'Build Daily Habit', label: 'Learning Streak' }
      },
      methodology: 'Readiness = 25% Technical + 20% Coding + 10% Aptitude + 10% Communication + 10% Resume + 10% Projects + 10% Interview + 5% Consistency',
      topStrengths,
      topImprovementAreas
    };
  }

  /**
   * Update student skill score when an assessment attempt finishes
   */
  static recordAssessmentResult(userId: string, assessmentId: string, score: number, percentage: number) {
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId) as any;
    if (!assessment) return;

    // Find skills tested in this assessment
    const assessedSkills = db.prepare(`
      SELECT DISTINCT skill_id FROM questions WHERE assessment_id = ? AND skill_id IS NOT NULL
    `).all(assessmentId) as { skill_id: string }[];

    for (const item of assessedSkills) {
      const existing = db.prepare(`
        SELECT * FROM student_skills WHERE user_id = ? AND skill_id = ?
      `).get(userId, item.skill_id) as any;

      let newScore = percentage;
      let count = 1;
      let currentLevel = 'Beginner';

      if (existing) {
        // Weighted average favoring recent performance
        newScore = Math.round((existing.current_score * 0.4) + (percentage * 0.6));
        count = existing.assessment_count + 1;
      }

      if (newScore >= 85) currentLevel = 'Advanced';
      else if (newScore >= 70) currentLevel = 'Intermediate';
      else if (newScore >= 50) currentLevel = 'Developing';

      const trend = existing && newScore >= existing.current_score ? 'up' : 'down';

      if (existing) {
        db.prepare(`
          UPDATE student_skills
          SET current_score = ?, current_level = ?, assessment_count = ?, trend = ?, last_assessed_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND skill_id = ?
        `).run(newScore, currentLevel, count, trend, userId, item.skill_id);
      } else {
        db.prepare(`
          INSERT INTO student_skills (id, user_id, skill_id, current_level, current_score, confidence, assessment_count, trend, last_assessed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(`ssk-${Date.now()}-${Math.random().toString(36).substring(7)}`, userId, item.skill_id, currentLevel, newScore, 70, 1, trend);
      }
    }

    // Trigger recalculation of overall placement readiness
    this.calculatePlacementReadiness(userId);
  }
}
