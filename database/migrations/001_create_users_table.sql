-- Migration: 001_create_users_table
-- Description: Creates the users table with all required fields for authentication and gamification
-- Requirements: 1.1, 1.6

-- Create users table
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

-- Create index on email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on oauth_provider and oauth_id for OAuth authentication
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;

-- Create index on college for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_college ON users(college) WHERE college IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE users ADD CONSTRAINT check_streak_freezes_non_negative CHECK (streak_freezes >= 0);
ALTER TABLE users ADD CONSTRAINT check_current_streak_non_negative CHECK (current_streak >= 0);
ALTER TABLE users ADD CONSTRAINT check_longest_streak_non_negative CHECK (longest_streak >= 0);
ALTER TABLE users ADD CONSTRAINT check_total_xp_non_negative CHECK (total_xp >= 0);
ALTER TABLE users ADD CONSTRAINT check_current_level_positive CHECK (current_level >= 1);
ALTER TABLE users ADD CONSTRAINT check_daily_goal_positive CHECK (daily_goal >= 1);
ALTER TABLE users ADD CONSTRAINT check_longest_streak_gte_current CHECK (longest_streak >= current_streak);
ALTER TABLE users ADD CONSTRAINT check_oauth_provider_valid CHECK (oauth_provider IS NULL OR oauth_provider IN ('google'));

-- Add comment on table
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
