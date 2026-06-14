-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  college VARCHAR(255),
  graduation_year INT,
  avatar_url TEXT,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  streak_freezes INT DEFAULT 0,
  daily_goal INT DEFAULT 1,
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_time TIME DEFAULT '19:00:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DSA Patterns Table
CREATE TABLE dsa_patterns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  difficulty_range VARCHAR(20),
  total_problems INT DEFAULT 0,
  display_order INT
);

-- Problems Table
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  pattern_id INT REFERENCES dsa_patterns(id),
  acceptance_rate DECIMAL(5,2),
  company_tags TEXT[],
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  sample_input TEXT,
  sample_output TEXT,
  explanation TEXT,
  hints TEXT[],
  time_limit INT DEFAULT 2000,
  memory_limit INT DEFAULT 256,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Cases Table
CREATE TABLE test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 10
);

-- Submissions Table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id INT REFERENCES problems(id),
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status VARCHAR(50),
  runtime_ms INT,
  memory_kb INT,
  test_cases_passed INT DEFAULT 0,
  total_test_cases INT,
  error_message TEXT,
  xp_earned INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- User Problem Progress Table
CREATE TABLE user_problem_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id INT REFERENCES problems(id),
  status VARCHAR(20) CHECK (status IN ('unsolved', 'solved', 'revision')),
  first_solved_at TIMESTAMP,
  last_attempted_at TIMESTAMP,
  attempts INT DEFAULT 0,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  confidence_level INT CHECK (confidence_level BETWEEN 1 AND 4),
  next_revision_date DATE,
  revision_count INT DEFAULT 0,
  easiness_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  UNIQUE(user_id, problem_id)
);

-- Streak History Table
CREATE TABLE streak_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  problems_solved INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  freeze_used BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- Badges Table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50),
  requirement_value INT
);

-- User Badges Table
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, badge_id)
);

-- Aptitude Categories Table
CREATE TABLE aptitude_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_category VARCHAR(50),
  description TEXT
);

-- Aptitude Questions Table
CREATE TABLE aptitude_questions (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES aptitude_categories(id),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty VARCHAR(20),
  company_tags TEXT[],
  time_allocated INT DEFAULT 60
);

-- Mock Tests Table
CREATE TABLE mock_tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  company_specific VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Mock Test Attempts Table
CREATE TABLE user_mock_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id INT REFERENCES mock_tests(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  score INT,
  time_taken_seconds INT,
  answers JSONB
);

-- Core CS Topics Table
CREATE TABLE cs_topics (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  topic_name VARCHAR(255) NOT NULL,
  content TEXT,
  code_examples JSONB,
  difficulty VARCHAR(20)
);

-- CS MCQs Table
CREATE TABLE cs_mcqs (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES cs_topics(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT
);

-- AI Interview Sessions Table
CREATE TABLE ai_interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  transcript JSONB,
  score INT,
  feedback TEXT,
  areas_to_improve TEXT[]
);

-- Study Plans Table
CREATE TABLE study_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  hours_per_day INT,
  skill_level VARCHAR(20),
  plan_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard Cache (Redis-backed but stored for history)
CREATE TABLE leaderboard_snapshots (
  id SERIAL PRIMARY KEY,
  period VARCHAR(20),
  data JSONB,
  snapshot_date DATE DEFAULT CURRENT_DATE
);

-- Create indexes for performance
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_user_progress_user_id ON user_problem_progress(user_id);
CREATE INDEX idx_user_progress_next_revision ON user_problem_progress(next_revision_date);
CREATE INDEX idx_streak_history_user_date ON streak_history(user_id, date);
CREATE INDEX idx_problems_pattern ON problems(pattern_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
