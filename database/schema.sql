-- ============================================================
-- Placement Preparation Platform — Unified Database Schema
-- Single source of truth for the database layout and initial seeding
-- ============================================================

-- ============================================================
-- SECTION 1: TABLES
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS dsa_patterns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  difficulty_range VARCHAR(20),
  total_problems INT DEFAULT 0,
  display_order INT
);

-- Problems Table
CREATE TABLE IF NOT EXISTS problems (
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
CREATE TABLE IF NOT EXISTS test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 10
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
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
CREATE TABLE IF NOT EXISTS user_problem_progress (
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
CREATE TABLE IF NOT EXISTS streak_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  problems_solved INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  freeze_used BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50),
  requirement_value INT
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, badge_id)
);

-- Aptitude Categories Table
CREATE TABLE IF NOT EXISTS aptitude_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_category VARCHAR(50),
  description TEXT
);

-- Aptitude Questions Table
CREATE TABLE IF NOT EXISTS aptitude_questions (
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
CREATE TABLE IF NOT EXISTS mock_tests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  company_specific VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Mock Test Attempts Table
CREATE TABLE IF NOT EXISTS user_mock_attempts (
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
CREATE TABLE IF NOT EXISTS cs_topics (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  topic_name VARCHAR(255) NOT NULL,
  content TEXT,
  code_examples JSONB,
  difficulty VARCHAR(20)
);

-- CS MCQs Table
CREATE TABLE IF NOT EXISTS cs_mcqs (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES cs_topics(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT
);

-- AI Interview Sessions Table
CREATE TABLE IF NOT EXISTS ai_interview_sessions (
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
CREATE TABLE IF NOT EXISTS study_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  hours_per_day INT,
  skill_level VARCHAR(20),
  plan_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard Cache Table
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id SERIAL PRIMARY KEY,
  period VARCHAR(20),
  data JSONB,
  snapshot_date DATE DEFAULT CURRENT_DATE
);


-- ============================================================
-- SECTION 2: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_college ON users(college) WHERE college IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_problem_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_next_revision ON user_problem_progress(next_revision_date);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON streak_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_problems_pattern ON problems(pattern_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);


-- ============================================================
-- SECTION 3: FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on users row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 4: CONSTRAINTS
-- ============================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_streak_freezes_non_negative;
ALTER TABLE users ADD CONSTRAINT check_streak_freezes_non_negative CHECK (streak_freezes >= 0);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_current_streak_non_negative;
ALTER TABLE users ADD CONSTRAINT check_current_streak_non_negative CHECK (current_streak >= 0);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_longest_streak_non_negative;
ALTER TABLE users ADD CONSTRAINT check_longest_streak_non_negative CHECK (longest_streak >= 0);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_total_xp_non_negative;
ALTER TABLE users ADD CONSTRAINT check_total_xp_non_negative CHECK (total_xp >= 0);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_current_level_positive;
ALTER TABLE users ADD CONSTRAINT check_current_level_positive CHECK (current_level >= 1);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_daily_goal_positive;
ALTER TABLE users ADD CONSTRAINT check_daily_goal_positive CHECK (daily_goal >= 1);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_longest_streak_gte_current;
ALTER TABLE users ADD CONSTRAINT check_longest_streak_gte_current CHECK (longest_streak >= current_streak);

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_oauth_provider_valid;
ALTER TABLE users ADD CONSTRAINT check_oauth_provider_valid CHECK (oauth_provider IS NULL OR oauth_provider IN ('google'));


-- ============================================================
-- SECTION 5: COMMENTS
-- ============================================================

COMMENT ON TABLE users IS 'Stores user account information, authentication credentials, and gamification metrics';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.email IS 'User email address, used for authentication';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (NULL for OAuth users)';
COMMENT ON COLUMN users.full_name IS 'User full name';
COMMENT ON COLUMN users.college IS 'College name for leaderboard filtering';
COMMENT ON COLUMN users.graduation_year IS 'Expected graduation year';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider name (google)';
COMMENT ON COLUMN users.oauth_id IS 'OAuth provider user ID';
COMMENT ON COLUMN users.current_streak IS 'Current consecutive days with activity';
COMMENT ON COLUMN users.longest_streak IS 'Maximum streak ever achieved';
COMMENT ON COLUMN users.last_activity_date IS 'Last date user solved a problem';
COMMENT ON COLUMN users.total_xp IS 'Total experience points earned';
COMMENT ON COLUMN users.current_level IS 'Current level based on XP';
COMMENT ON COLUMN users.streak_freezes IS 'Number of streak freezes available';
COMMENT ON COLUMN users.daily_goal IS 'Number of problems to solve per day';
COMMENT ON COLUMN users.timezone IS 'User timezone (IANA timezone name)';
COMMENT ON COLUMN users.notification_time IS 'Preferred time for daily notifications';


-- ============================================================
-- SECTION 6: SEED DATA
-- ============================================================

-- DSA Patterns
INSERT INTO dsa_patterns (name, description, difficulty_range, display_order) VALUES
  ('Sliding Window', 'Use a window that slides over data to find a subarray/substring meeting a condition', 'Easy-Hard', 1),
  ('Two Pointers', 'Use two pointers moving toward each other or in the same direction', 'Easy-Medium', 2),
  ('Fast & Slow Pointers', 'Detect cycles or find middle of linked lists using two speed pointers', 'Easy-Medium', 3),
  ('Merge Intervals', 'Merge or insert overlapping intervals', 'Medium', 4),
  ('Cyclic Sort', 'Sort numbers in a range by placing each number at its correct index', 'Easy-Medium', 5),
  ('In-place Reversal', 'Reverse linked list nodes without extra space', 'Easy-Medium', 6),
  ('Tree BFS', 'Level-order traversal of trees using a queue', 'Easy-Medium', 7),
  ('Tree DFS', 'Depth-first traversal patterns for trees', 'Easy-Hard', 8),
  ('Two Heaps', 'Use a min-heap and max-heap together', 'Medium-Hard', 9),
  ('Subsets', 'Generate all subsets/permutations/combinations', 'Medium', 10),
  ('Modified Binary Search', 'Binary search on sorted or rotated arrays', 'Easy-Hard', 11),
  ('Bitwise XOR', 'Use XOR to find missing/duplicate numbers', 'Easy-Medium', 12),
  ('Top K Elements', 'Find top K largest/smallest using a heap', 'Medium', 13),
  ('K-way Merge', 'Merge K sorted arrays/lists', 'Hard', 14),
  ('Dynamic Programming', 'Break problems into overlapping subproblems', 'Medium-Hard', 15),
  ('Backtracking', 'Explore all possibilities and backtrack on failure', 'Medium-Hard', 16),
  ('Trie', 'Prefix tree for efficient string operations', 'Medium', 17),
  ('Monotonic Stack', 'Use a stack that maintains monotonic order', 'Medium', 18),
  ('Graph Traversal', 'BFS/DFS on graphs for shortest path, connectivity', 'Medium-Hard', 19),
  ('Union Find', 'Disjoint set union for grouping connected components', 'Medium', 20)
ON CONFLICT (name) DO NOTHING;

-- Problems
INSERT INTO problems (title, slug, description, difficulty, pattern_id, acceptance_rate, company_tags) VALUES
  -- Sliding Window
  ('Maximum Sum Subarray of Size K', 'max-sum-subarray-k', 'Given an array of integers and a number k, find the maximum sum of any subarray of size k.', 'Easy', 1, 72.5, ARRAY['Amazon', 'Microsoft']),
  ('Longest Substring Without Repeating', 'longest-substring-no-repeat', 'Given a string, find the length of the longest substring without repeating characters.', 'Medium', 1, 33.8, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Minimum Size Subarray Sum', 'min-size-subarray-sum', 'Find the minimal length of a contiguous subarray whose sum >= target.', 'Medium', 1, 44.1, ARRAY['Amazon']),
  ('Longest Repeating Character Replacement', 'longest-repeating-char-replacement', 'Replace at most k characters; find the longest substring with all same letters.', 'Medium', 1, 51.2, ARRAY['Google']),
  ('Permutation in String', 'permutation-in-string', 'Return true if s2 contains a permutation of s1.', 'Medium', 1, 44.6, ARRAY['Facebook', 'Microsoft']),
  -- Two Pointers
  ('Two Sum II Input Sorted', 'two-sum-ii', 'Find two numbers that add up to target in a sorted array.', 'Easy', 2, 59.2, ARRAY['Amazon', 'Apple']),
  ('Remove Duplicates from Sorted Array', 'remove-duplicates-sorted', 'Remove duplicates in-place from sorted array and return new length.', 'Easy', 2, 51.3, ARRAY['Microsoft', 'Adobe']),
  ('Squaring a Sorted Array', 'squares-sorted-array', 'Return sorted array of squares given sorted array with negative numbers.', 'Easy', 2, 71.4, ARRAY['Google', 'Amazon']),
  ('3Sum', 'three-sum', 'Find all unique triplets in array that give sum zero.', 'Medium', 2, 32.4, ARRAY['Amazon', 'Facebook', 'Adobe']),
  ('Container With Most Water', 'container-most-water', 'Find two lines that together with x-axis form a container holding the most water.', 'Medium', 2, 54.1, ARRAY['Amazon', 'Google']),
  -- Tree BFS
  ('Binary Tree Level Order Traversal', 'binary-tree-level-order', 'Return the level order traversal of a binary tree as list of lists.', 'Medium', 7, 65.3, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  ('Minimum Depth of Binary Tree', 'min-depth-binary-tree', 'Find the minimum depth of a binary tree (root to nearest leaf).', 'Easy', 7, 43.6, ARRAY['Amazon']),
  ('Maximum Depth of Binary Tree', 'max-depth-binary-tree', 'Find the maximum depth of a binary tree.', 'Easy', 7, 73.5, ARRAY['LinkedIn', 'Amazon']),
  ('Right View of Binary Tree', 'binary-tree-right-view', 'Return the values of the nodes you can see from the right side.', 'Medium', 7, 61.2, ARRAY['Facebook', 'Amazon']),
  -- Tree DFS
  ('Path Sum', 'path-sum', 'Does the tree have a root-to-leaf path such that adding up all values equals targetSum?', 'Easy', 8, 47.3, ARRAY['Amazon', 'Microsoft']),
  ('All Paths for a Sum', 'all-paths-for-sum', 'Find all root-to-leaf paths where sum equals targetSum.', 'Medium', 8, 56.4, ARRAY['Amazon', 'Facebook']),
  ('Diameter of Binary Tree', 'diameter-binary-tree', 'Find the length of the diameter (longest path between any two nodes).', 'Easy', 8, 57.2, ARRAY['Facebook', 'Amazon']),
  -- Dynamic Programming
  ('Fibonacci Number', 'fibonacci-number', 'Calculate the nth Fibonacci number.', 'Easy', 15, 68.1, ARRAY['Amazon', 'Apple']),
  ('0/1 Knapsack', 'zero-one-knapsack', 'Given weights and values, maximize total value within weight capacity.', 'Medium', 15, 42.8, ARRAY['Amazon', 'Microsoft']),
  ('Longest Common Subsequence', 'longest-common-subsequence', 'Find the length of the longest common subsequence of two strings.', 'Medium', 15, 58.3, ARRAY['Amazon', 'Google', 'Microsoft']),
  ('Coin Change', 'coin-change', 'Find the fewest number of coins to make up a given amount.', 'Medium', 15, 41.0, ARRAY['Amazon', 'Google']),
  ('Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Find the length of the longest strictly increasing subsequence.', 'Medium', 15, 53.1, ARRAY['Microsoft', 'Amazon', 'Google']),
  -- Binary Search
  ('Binary Search', 'binary-search', 'Given a sorted array and target, return index using binary search.', 'Easy', 11, 55.5, ARRAY['Amazon', 'Adobe']),
  ('Search in Rotated Sorted Array', 'search-rotated-sorted', 'Search for target in a rotated sorted array.', 'Medium', 11, 38.7, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  ('Find Minimum in Rotated Sorted Array', 'find-min-rotated', 'Find the minimum element in a rotated sorted array.', 'Medium', 11, 48.3, ARRAY['Amazon', 'Microsoft']),
  -- Graph Traversal
  ('Number of Islands', 'number-of-islands', 'Count distinct islands (connected 1s) in a 2D grid.', 'Medium', 19, 57.8, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Clone Graph', 'clone-graph', 'Return a deep copy of a connected undirected graph.', 'Medium', 19, 53.2, ARRAY['Facebook', 'Amazon', 'Microsoft']),
  ('Pacific Atlantic Water Flow', 'pacific-atlantic-water-flow', 'Find cells where water can flow to both Pacific and Atlantic oceans.', 'Medium', 19, 51.3, ARRAY['Amazon', 'Google']),
  -- Backtracking
  ('Subsets', 'subsets', 'Return all possible subsets (the power set) of an integer array.', 'Medium', 16, 74.1, ARRAY['Amazon', 'Facebook', 'Google']),
  ('Permutations', 'permutations', 'Return all possible permutations of a distinct integer array.', 'Medium', 16, 75.2, ARRAY['Microsoft', 'Amazon']),
  ('Word Search', 'word-search', 'Given a grid, find if the word exists using DFS/backtracking.', 'Medium', 16, 40.3, ARRAY['Amazon', 'Microsoft', 'Facebook']),
  -- Two Heaps
  ('Find Median from Data Stream', 'find-median-data-stream', 'Design a data structure that supports median calculation of a stream.', 'Hard', 9, 50.6, ARRAY['Amazon', 'Google', 'Microsoft']),
  -- Merge Intervals
  ('Merge Intervals', 'merge-intervals', 'Merge all overlapping intervals and return non-overlapping intervals.', 'Medium', 4, 46.3, ARRAY['Amazon', 'Google', 'Facebook']),
  ('Insert Interval', 'insert-interval', 'Insert a new interval into a list of non-overlapping intervals.', 'Medium', 4, 37.8, ARRAY['Google', 'LinkedIn']),
  -- Top K Elements
  ('Kth Largest Element in Array', 'kth-largest-element', 'Find the kth largest element in an unsorted array.', 'Medium', 13, 65.3, ARRAY['Facebook', 'Amazon', 'Microsoft']),
  ('Top K Frequent Elements', 'top-k-frequent', 'Given an integer array, return the k most frequent elements.', 'Medium', 13, 64.9, ARRAY['Amazon', 'Facebook', 'Google'])
ON CONFLICT (slug) DO NOTHING;
