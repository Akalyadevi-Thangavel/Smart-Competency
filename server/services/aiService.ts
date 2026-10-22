import { db } from '../db/database.js';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InterviewEvaluationResult {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  missingKeyPoints: string[];
  suggestedImprovement: string;
}

export interface ResumeEnhancementResult {
  atsScore: number;
  keywordScore: number;
  formattingScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  actionVerbRewrites: Array<{ original: string; suggested: string; reason: string }>;
  improvementTips: string[];
}

export class AIService {
  private static provider = process.env.AI_PROVIDER || 'fallback';
  private static geminiKey = process.env.GEMINI_API_KEY || '';
  private static openAiKey = process.env.OPENAI_API_KEY || '';

  /**
   * AI Career Coach: Generates contextual response based on student data
   */
  static async chatWithCoach(userId: string, messages: AIChatMessage[], contextPrompt?: string): Promise<string> {
    const profile = db.prepare(`
      SELECT p.*, r.name as role_name
      FROM profiles p
      LEFT JOIN career_roles r ON p.target_role_id = r.id
      WHERE p.user_id = ?
    `).get(userId) as any;

    const weakSkills = db.prepare(`
      SELECT s.name, ss.current_score, ss.current_level
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ? AND ss.current_score < 70
      ORDER BY ss.current_score ASC
      LIMIT 3
    `).all(userId) as any[];

    const studentContext = {
      name: profile?.full_name || 'Student',
      targetRole: profile?.role_name || 'Software Developer',
      overallCompetency: profile?.overall_competency || 70,
      placementReadiness: profile?.placement_readiness || 72,
      weakSkills: weakSkills.map(w => `${w.name} (${w.current_score}%)`).join(', ') || 'System Design, DSA',
      learningStreak: profile?.learning_streak || 1,
    };

    const latestUserMsg = messages[messages.length - 1]?.content || '';

    // If Gemini API key is configured, invoke real Gemini model
    if (this.geminiKey && this.geminiKey.trim().length > 10) {
      try {
        const response = await this.callGeminiAPI(messages, studentContext);
        if (response) return response;
      } catch (err: any) {
        console.warn('[AIService] Gemini API call failed, falling back to intelligent engine:', err.message);
      }
    }

    // Intelligent Context-Aware Fallback Engine
    return this.generateIntelligentResponse(latestUserMsg, studentContext);
  }

  /**
   * Evaluate a student mock interview answer
   */
  static async evaluateInterviewAnswer(
    questionText: string,
    studentAnswer: string,
    keyPoints: string[] = []
  ): Promise<InterviewEvaluationResult> {
    // Check answer length, keywords, structure
    const wordCount = studentAnswer.trim().split(/\s+/).length;
    let score = 50;
    const strengths: string[] = [];
    const missing: string[] = [];

    if (wordCount < 20) {
      return {
        score: 40,
        feedback: 'Your answer is too brief for an interview setting. Recruiters expect structured explanations with concrete technical examples and problem context.',
        strengths: ['Addressed the question prompt directly'],
        missingKeyPoints: keyPoints,
        suggestedImprovement: 'Use the STAR format (Situation, Task, Action, Result) or define the core concept, elaborate on mechanics, and give a production example.'
      };
    }

    // Check hit key points
    const lowerAns = studentAnswer.toLowerCase();
    for (const kp of keyPoints) {
      const words = kp.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const hit = words.some(w => lowerAns.includes(w));
      if (hit) {
        strengths.push(`Mentioned ${kp}`);
        score += 12;
      } else {
        missing.push(kp);
      }
    }

    // Reward technical depth and clarity
    if (wordCount >= 60) score += 10;
    if (lowerAns.includes('for example') || lowerAns.includes('in our project') || lowerAns.includes('specifically')) {
      score += 8;
      strengths.push('Provided concrete illustrative examples');
    }

    score = Math.min(95, Math.max(45, score));

    return {
      score,
      feedback: score >= 75
        ? `Strong response! You clearly understand the core fundamentals and articulated your thought process with technical precision.`
        : `Decent foundation, but your answer could be strengthened by clarifying the architectural tradeoffs and providing specific metrics or use-cases.`,
      strengths: strengths.length > 0 ? strengths : ['Clear communication tone', 'Logical sentence flow'],
      missingKeyPoints: missing.length > 0 ? missing : ['Mentioning edge-case failure modes'],
      suggestedImprovement: `Try structuring your opening sentence with a definitive summary before breaking down the internal execution flow.`
    };
  }

  /**
   * Analyze uploaded resume text against target role
   */
  static async analyzeResumeText(resumeText: string, targetRoleId: string): Promise<ResumeEnhancementResult> {
    const roleSkills = db.prepare(`
      SELECT s.name FROM role_skills rs
      JOIN skills s ON rs.skill_id = s.id
      WHERE rs.role_id = ?
    `).all(targetRoleId) as { name: string }[];

    const lowerResume = resumeText.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    const expectedKeywords = roleSkills.map(s => s.name);
    if (expectedKeywords.length === 0) {
      expectedKeywords.push('JavaScript', 'React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Data Structures');
    }

    for (const kw of expectedKeywords) {
      const words = kw.toLowerCase().split(/[ /(),+]+/);
      const isPresent = words.some(w => w.length > 2 && lowerResume.includes(w));
      if (isPresent) matched.push(kw);
      else missing.push(kw);
    }

    const keywordScore = Math.round((matched.length / Math.max(1, expectedKeywords.length)) * 100);
    const hasGithub = lowerResume.includes('github') || lowerResume.includes('git');
    const hasProjects = lowerResume.includes('project') || lowerResume.includes('built') || lowerResume.includes('developed');
    const hasEducation = lowerResume.includes('b.tech') || lowerResume.includes('bachelor') || lowerResume.includes('university') || lowerResume.includes('college');

    let formattingScore = 70;
    if (hasGithub) formattingScore += 10;
    if (hasProjects) formattingScore += 10;
    if (hasEducation) formattingScore += 10;
    formattingScore = Math.min(100, formattingScore);

    const atsScore = Math.round(keywordScore * 0.55 + formattingScore * 0.45);

    const actionVerbRewrites = [
      {
        original: 'Responsible for creating frontend UI components for the web app',
        suggested: 'Engineered 15+ reusable, accessible React components with TypeScript, improving page load speed by 25%',
        reason: 'Replaces passive "Responsible for" with active "Engineered" and includes measurable performance impact'
      },
      {
        original: 'Worked on backend APIs and connected database',
        suggested: 'Architected RESTful endpoints utilizing Node.js and PostgreSQL with indexed queries, ensuring sub-100ms response latencies',
        reason: 'Demonstrates architectural ownership and specifies database query optimization'
      }
    ];

    const improvementTips = [
      `Incorporate missing high-priority target role keywords: ${missing.slice(0, 3).join(', ')}.`,
      'Quantify your project outcomes using measurable engineering metrics (e.g., latency reduction, test coverage %, active user load).',
      'Ensure standard section headers ("Education", "Technical Skills", "Projects", "Experience") are used for automated ATS parsers.'
    ];

    return {
      atsScore,
      keywordScore,
      formattingScore,
      matchedKeywords: matched,
      missingKeywords: missing,
      actionVerbRewrites,
      improvementTips
    };
  }

  // Internal intelligent fallback response generator
  private static generateIntelligentResponse(userMsg: string, ctx: any): string {
    const lower = userMsg.toLowerCase();

    if (lower.includes('skill gap') || lower.includes('weak') || lower.includes('improve')) {
      return `Based on your diagnostic profile for **${ctx.targetRole}**, your primary growth areas are in **${ctx.weakSkills}**.\n\n` +
        `Here is my recommended 3-step action plan for this week:\n` +
        `1. **Focus on Fundamental Patterns**: Dedicate 45 minutes daily to sliding window and hashing patterns in the Coding Lab.\n` +
        `2. **Hands-on Integration**: Incorporate database transactions and indexing into your current project.\n` +
        `3. **Verification**: Retake the topic diagnostic in 5 days to verify competency improvement.\n\n` +
        `Would you like me to generate a tailored 7-day study schedule for your daily availability?`;
    }

    if (lower.includes('interview') || lower.includes('mock') || lower.includes('question')) {
      return `For a **${ctx.targetRole}** role, recruiters typically conduct 3 interview rounds:\n\n` +
        `1. **Coding & Data Structures**: LeetCode medium array/string manipulation and tree traversals.\n` +
        `2. **System & Architecture**: REST API contracts, caching with Redis, and database normalization/indexing.\n` +
        `3. **Behavioral (STAR Method)**: Project ownership, handling conflicting priorities, and resolving production incidents.\n\n` +
        `Would you like to start a mock interview right now? I can ask you a common technical question and evaluate your response.`;
    }

    if (lower.includes('resume') || lower.includes('ats')) {
      return `Your resume currently aligns with **${ctx.targetRole}** with an estimated ATS score in the 70s.\n\n` +
        `To elevate it into the top 10% tier:\n` +
        `- Replace passive bullet points ("worked on", "assisted") with strong action verbs ("architected", "optimized", "implemented").\n` +
        `- Add measurable metrics: e.g., "Reduced database query time by 35% through compound B-Tree indexing."\n` +
        `- Ensure all skills in your Skill Matrix appear explicitly in your project technology stacks.\n\n` +
        `Head over to the **Resume Analyzer** tab to see your exact keyword coverage and copy one-click optimized bullet rewrites!`;
    }

    if (lower.includes('placement') || lower.includes('ready') || lower.includes('chance')) {
      return `Your current **Placement Readiness Indicator is ${ctx.placementReadiness}%** (${ctx.placementReadiness >= 75 ? 'Placement Ready' : 'Developing Competency'}).\n\n` +
        `Remember, Smart Competency evaluates readiness across 8 transparent dimensions—not arbitrary guesswork. Your technical depth and streak consistency (${ctx.learningStreak} days) are commendable.\n\n` +
        `To reach the 85%+ "Highly Competitive" tier:\n` +
        `- Complete 2 more Medium-difficulty challenges in the Coding Lab.\n` +
        `- Record at least one mock behavioral interview.\n` +
        `Keep up your daily habit, ${ctx.name}!`;
    }

    // Default guidance response
    return `Hello ${ctx.name}! As your Smart Competency Career Coach for **${ctx.targetRole}**, I'm tracking your progress across assessments, coding problems, and resume readiness.\n\n` +
      `Your current overall competency is at **${ctx.overallCompetency}%** and placement readiness is **${ctx.placementReadiness}%**.\n\n` +
      `How can I assist your preparation today?\n` +
      `- Ask: *"What are my biggest skill gaps?"*\n` +
      `- Ask: *"Give me a mock interview question"* \n` +
      `- Ask: *"How should I improve my resume for ${ctx.targetRole}?"*\n` +
      `- Ask: *"Generate a today's study plan"*`;
  }

  private static async callGeminiAPI(messages: AIChatMessage[], ctx: any): Promise<string | null> {
    const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const systemPrompt = `You are the AI Career Coach on the Smart Competency platform. Student Context: Name=${ctx.name}, Target Role=${ctx.targetRole}, Competency Score=${ctx.overallCompetency}%, Placement Readiness=${ctx.placementReadiness}%, Weak Skills=${ctx.weakSkills}. Give supportive, highly actionable, concise career guidance.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }
        ]
      })
    });

    if (!res.ok) throw new Error(`Gemini status: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }
}
