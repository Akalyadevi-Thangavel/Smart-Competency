-- Smart Competency SQLite Relational Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student', 'admin', 'placement_officer'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  college TEXT,
  degree TEXT,
  branch TEXT,
  year TEXT,
  grad_year TEXT,
  target_role_id TEXT,
  secondary_role_id TEXT,
  experience_level TEXT DEFAULT 'Beginner',
  daily_hours REAL DEFAULT 2.0,
  learning_style TEXT DEFAULT 'Practical / Project-Based',
  github_url TEXT,
  linkedin_url TEXT,
  overall_competency REAL DEFAULT 0,
  placement_readiness REAL DEFAULT 0,
  learning_streak INTEGER DEFAULT 1,
  weekly_hours REAL DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  onboarding_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  min_readiness_score REAL DEFAULT 70.0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'Technical', 'Core CS', 'Soft Skills', 'Aptitude', 'Tools'
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_skills (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  required_level TEXT NOT NULL, -- 'Beginner', 'Developing', 'Intermediate', 'Advanced', 'Job Ready'
  weight REAL DEFAULT 1.0,
  priority TEXT DEFAULT 'High', -- 'Critical', 'High', 'Medium', 'Low'
  FOREIGN KEY (role_id) REFERENCES career_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  current_level TEXT DEFAULT 'Beginner',
  current_score REAL DEFAULT 0.0,
  confidence REAL DEFAULT 50.0,
  last_assessed_at DATETIME,
  assessment_count INTEGER DEFAULT 0,
  trend TEXT DEFAULT 'neutral', -- 'up', 'down', 'neutral'
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'technical', 'aptitude', 'soft_skills', 'coding', 'role_readiness'
  role_id TEXT,
  duration_minutes INTEGER DEFAULT 20,
  passing_score REAL DEFAULT 60.0,
  total_questions INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'Intermediate',
  description TEXT,
  FOREIGN KEY (role_id) REFERENCES career_roles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  skill_id TEXT,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq', -- 'mcq', 'multiple_select', 'true_false', 'scenario'
  options_json TEXT NOT NULL, -- Array of string options or objects
  correct_answer_json TEXT NOT NULL, -- Correct answer index or values
  explanation TEXT,
  difficulty TEXT DEFAULT 'Intermediate',
  points INTEGER DEFAULT 10,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  score REAL NOT NULL,
  percentage REAL NOT NULL,
  status TEXT DEFAULT 'completed', -- 'in_progress', 'completed'
  answers_json TEXT, -- recorded student answers
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  title TEXT NOT NULL,
  current_phase TEXT DEFAULT 'Foundation',
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES career_roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_items (
  id TEXT PRIMARY KEY,
  learning_path_id TEXT NOT NULL,
  phase TEXT NOT NULL, -- 'Foundation', 'Core Skills', 'Intermediate Skills', 'Advanced Skills', 'Projects', 'Interview Prep', 'Placement Readiness'
  skill_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  learning_objective TEXT,
  practice_task TEXT,
  resource_url TEXT,
  resource_type TEXT DEFAULT 'article', -- 'article', 'video', 'documentation', 'practice'
  estimated_minutes INTEGER DEFAULT 45,
  difficulty TEXT DEFAULT 'Intermediate',
  is_completed INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  completed_at DATETIME,
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  parsed_content TEXT,
  target_role_id TEXT,
  overall_score REAL DEFAULT 0,
  keyword_coverage REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resume_analyses (
  id TEXT PRIMARY KEY,
  resume_id TEXT NOT NULL,
  parsed_skills_json TEXT,
  matched_skills_json TEXT,
  missing_skills_json TEXT,
  project_score REAL DEFAULT 0,
  formatting_score REAL DEFAULT 0,
  improvement_suggestions_json TEXT,
  action_verb_rewrites_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coding_problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  difficulty TEXT DEFAULT 'Easy', -- 'Easy', 'Medium', 'Hard'
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  starter_code_json TEXT NOT NULL,
  test_cases_json TEXT NOT NULL,
  hints_json TEXT,
  solution_approach TEXT
);

CREATE TABLE IF NOT EXISTS coding_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL, -- 'Accepted', 'Wrong Answer', 'Compilation Error'
  execution_time_ms INTEGER DEFAULT 12,
  passed_tests INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES coding_problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'HR', 'Technical', 'Behavioral', 'System Design'
  role_id TEXT,
  question_text TEXT NOT NULL,
  sample_answer TEXT,
  key_points_json TEXT,
  difficulty TEXT DEFAULT 'Intermediate'
);

CREATE TABLE IF NOT EXISTS interview_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  ai_score REAL DEFAULT 0,
  ai_feedback TEXT,
  key_points_hit_json TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT,
  description TEXT,
  tech_stack_json TEXT,
  github_url TEXT,
  live_demo_url TEXT,
  role TEXT,
  challenges TEXT,
  solutions TEXT,
  outcomes TEXT,
  strength_score REAL DEFAULT 75,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  task_type TEXT NOT NULL, -- 'learning', 'coding', 'aptitude', 'communication', 'project', 'review'
  title TEXT NOT NULL,
  description TEXT,
  link_to_module TEXT,
  is_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  category TEXT DEFAULT 'milestone'
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant'
  message TEXT NOT NULL,
  context_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_skills_user ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_role_skills_role ON role_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_items_path ON learning_items(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);
