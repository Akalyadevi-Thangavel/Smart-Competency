export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'placement_officer';
  created_at?: string;
}

export interface Profile {
  user_id: string;
  full_name: string;
  college?: string;
  degree?: string;
  branch?: string;
  year?: string;
  grad_year?: string;
  target_role_id?: string;
  target_role_name?: string;
  secondary_role_id?: string;
  secondary_role_name?: string;
  experience_level?: string;
  daily_hours?: number;
  learning_style?: string;
  github_url?: string;
  linkedin_url?: string;
  overall_competency: number;
  placement_readiness: number;
  learning_streak: number;
  weekly_hours: number;
  avatar_url?: string;
  bio?: string;
  onboarding_completed: number | boolean;
}

export interface CareerRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  min_readiness_score: number;
  is_active?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Core CS' | 'Soft Skills' | 'Aptitude' | 'Tools';
  description?: string;
  icon?: string;
  current_level?: 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced' | 'Job Ready';
  current_score?: number;
  confidence?: number;
  trend?: 'up' | 'down' | 'neutral';
  last_assessed_at?: string;
  required_level?: string;
  role_priority?: 'Critical' | 'High' | 'Medium' | 'Low';
}

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

export interface Assessment {
  id: string;
  title: string;
  slug: string;
  category: string;
  role_id?: string;
  role_name?: string;
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  skill_id?: string;
  skill_name?: string;
  question_text: string;
  question_type: 'mcq' | 'multiple_select' | 'true_false' | 'scenario' | 'coding';
  options: string[];
  options_json?: string;
  difficulty: string;
  points: number;
}

export interface AssessmentResult {
  attemptId: string;
  assessmentTitle: string;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  questionResults: Array<{
    questionId: string;
    questionText: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    explanation: string;
    skillName: string;
    difficulty: string;
    points: number;
  }>;
}

export interface LearningItem {
  id: string;
  learning_path_id: string;
  phase: 'Foundation' | 'Core Skills' | 'Intermediate Skills' | 'Advanced Skills' | 'Projects' | 'Interview Prep' | 'Placement Readiness';
  skill_id?: string;
  skill_name?: string;
  title: string;
  description: string;
  learning_objective?: string;
  practice_task?: string;
  resource_url?: string;
  resource_type: 'article' | 'video' | 'documentation' | 'practice';
  estimated_minutes: number;
  is_completed: number;
  order_index: number;
  completed_at?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  starter_code: Record<string, string>;
  test_cases: Array<{ input: string; expected: string }>;
  hints: string[];
  solution_approach?: string;
  isSolved?: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'System Design';
  role_id?: string;
  question_text: string;
  sample_answer: string;
  key_points: string[];
  difficulty: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  problem_statement?: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_demo_url?: string;
  role?: string;
  challenges?: string;
  solutions?: string;
  outcomes?: string;
  strength_score: number;
  created_at?: string;
}

export interface PlacementReadiness {
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

export interface DailyTask {
  id: string;
  date: string;
  task_type: 'learning' | 'coding' | 'aptitude' | 'communication' | 'interview' | 'project' | 'review';
  title: string;
  description: string;
  link_to_module?: string;
  is_completed: number;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge_icon: string;
  xp_reward: number;
  category: string;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assessment' | 'learning' | 'achievement' | 'reminder' | 'system' | 'resume';
  is_read: number;
  link?: string;
  created_at: string;
}
